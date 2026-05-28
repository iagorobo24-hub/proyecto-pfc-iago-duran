/**
 * CAMOUFOX SIEMENS IMAGE SCRAPER v2
 *
 * Para cada producto Siemens, obtiene la imagen exacta desde SiePortal
 * via la API GetEngineeringData, y reemplaza la actual si es diferente.
 *
 * Uso:
 *   export SONEX_SUPABASE_KEY="..."
 *   node scripts/camoufox-siemens-scraper.mjs [--dry-run] [--resume] [--max=N] [--concurrency=N]
 */

import { firefox } from 'playwright';
import { launchOptions } from 'camoufox-js';
import fs from 'fs';

// ── Config ────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const SUPABASE_KEY = fs.readFileSync('/home/abu/github_repos/proyecto-pfc-iago-duran/app/.env', 'utf-8')
  .match(/SONEX_SUPABASE_KEY=(.+)/)?.[1]?.trim() || '';

const H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };

const DRY_RUN = process.argv.includes('--dry-run');
const RESUME = process.argv.includes('--resume');
const MAX = parseInt(process.argv.find(a => a.startsWith('--max='))?.split('=')[1] || '99999');
const CONCURRENCY = parseInt(process.argv.find(a => a.startsWith('--concurrency='))?.split('=')[1] || '2');

const PROGRESS_FILE = '/tmp/camoufox-progress.json';
const RESULTS_FILE = '/tmp/camoufox-results.json';

// ── Helpers ───────────────────────────────────────────────────────────

async function getAllSiemensProducts() {
  let all = [];
  let offset = 0, limit = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/products?marca=eq.Siemens&select=id,ref_fabricante,name,imagen&limit=${limit}&offset=${offset}`;
    const res = await fetch(url, { headers: H });
    if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
    const p = await res.json();
    if (p.length === 0) break;
    all = all.concat(p);
    offset += limit;
    process.stdout.write(`\r  📦 Loading: ${all.length}`);
  }
  console.log(`\n  ✅ Total: ${all.length} Siemens products`);
  return all;
}

async function updateProductImage(id, imagenUrl) {
  if (DRY_RUN) return true;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify({ imagen: imagenUrl }),
  });
  return res.ok;
}

async function scrapeImage(page, ref, timeout = 25000) {
  const url = `https://sieportal.siemens.com/es-es/products-services/detail/${ref.toLowerCase()}?tree=CatalogTree`;
  let imageUrl = null;

  const apiPromise = new Promise((resolve) => {
    const handler = async (resp) => {
      if (resp.url().includes('GetEngineeringData') && resp.status() === 200) {
        try {
          const text = await resp.text();
          const data = JSON.parse(text);
          if (data?.galleryItems?.length > 0) {
            imageUrl = data.galleryItems[0].previewUrl || null;
          }
        } catch {}
        page.off('response', handler);
        resolve();
      }
    };
    page.on('response', handler);
    setTimeout(() => { page.off('response', handler); resolve(); }, timeout);
  });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await apiPromise;
  } catch {
    if (!imageUrl) await new Promise(r => setTimeout(r, 5000));
  }

  return imageUrl;
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60));
  console.log('  CAMOUFOX SIEMENS IMAGE SCRAPER v2');
  console.log('='.repeat(60));
  if (DRY_RUN) console.log('🔷 DRY RUN');
  if (RESUME) console.log('🔄 RESUME mode');

  let products = await getAllSiemensProducts();
  if (products.length > MAX) {
    console.log(`📐 Limited to ${MAX} products`);
    products = products.slice(0, MAX);
  }

  // Resume
  let results = [];
  if (RESUME && fs.existsSync(PROGRESS_FILE)) {
    const saved = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    results = saved.results || [];
    const doneRefs = new Set(results.map(r => r.ref));
    products = products.filter(p => !doneRefs.has(p.ref_fabricante));
    console.log(`🔄 Resume: ${results.length} done, ${products.length} remaining`);
    if (products.length === 0) { console.log('✨ All done!'); await saveReport(results); return; }
  }

  // Launch browsers
  console.log(`\n🚀 Launching ${CONCURRENCY} Camoufox browsers...`);
  const baseOptions = await launchOptions({ headless: true, geoip: false, humanize: true });
  const browsers = [];
  for (let i = 0; i < CONCURRENCY; i++) browsers.push(await firefox.launch(baseOptions));

  const startTime = Date.now();

  for (let i = 0; i < products.length; i += CONCURRENCY) {
    const batch = products.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(async (product, idx) => {
      const browser = browsers[idx % CONCURRENCY];
      const ctx = await browser.newContext({ locale: 'es-ES', viewport: { width: 1920, height: 1080 } });
      const page = await ctx.newPage();
      const ref = product.ref_fabricante;
      let imgUrl = null;
      try { imgUrl = await scrapeImage(page, ref); } catch {}
      await ctx.close();
      return { ref, id: product.id, imgUrl, status: imgUrl ? 'found' : 'not_found', oldImg: product.imagen, name: product.name };
    }));

    for (const r of batchResults) {
      results.push(r);
      if (r.imgUrl && r.imgUrl !== r.oldImg) {
        const ok = await updateProductImage(r.id, r.imgUrl);
        if (!ok) console.log(`  ❌ DB error: ${r.ref}`);
      }
    }

    // Progress
    const found = results.filter(r => r.status === 'found').length;
    const updated = results.filter(r => r.imgUrl && r.imgUrl !== r.oldImg).length;
    const notFound = results.filter(r => r.status === 'not_found').length;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const rate = (i + batch.length) / (elapsed / 60);
    const pct = ((i + batch.length) / products.length * 100).toFixed(1);
    process.stdout.write(`\r  ${i+batch.length}/${products.length} (${pct}%) | ✅ ${found} | 🔄 ${updated} | ⚠️ ${notFound} | ⏱ ${elapsed}s | 🏎 ${rate.toFixed(1)}/min`);

    if (results.length % 20 === 0) fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ results }, null, 2));
  }

  console.log('\n\n🧹 Closing browsers...');
  for (const b of browsers) { try { await b.close(); } catch {} }

  await saveReport(results);
  console.log('\n✅ Done!');
}

async function saveReport(results) {
  const found = results.filter(r => r.status === 'found');
  const updated = results.filter(r => r.imgUrl && r.imgUrl !== r.oldImg);
  const notFound = results.filter(r => r.status === 'not_found');

  console.log('\n📊 FINAL RESULTS:');
  console.log(`  ✅ Products with image on SiePortal: ${found.length}`);
  console.log(`  🔄 DB updated (image changed): ${updated.length}`);
  console.log(`  ⚠️  No image on page: ${notFound.length}`);
  console.log(`  📈 Hit rate: ${(found.length / results.length * 100).toFixed(1)}%`);

  if (found.length > 0) {
    console.log('\n📸 Samples:');
    found.slice(0, 5).forEach(r => console.log(`  ${r.ref}\n    old: ${(r.oldImg||'').substring(0,80)}\n    new: ${r.imgUrl}`));
  }

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results: ${RESULTS_FILE}`);
  console.log(`📄 Progress: ${PROGRESS_FILE}`);
}

main().catch(err => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});

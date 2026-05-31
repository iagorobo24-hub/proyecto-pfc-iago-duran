/**
 * CAMOUFOX SCHNEIDER IMAGE SCRAPER
 *
 * Visits each product page on se.com via Camoufox (anti-detection),
 * extracts the image p_Doc_Ref from embedded JSON, and updates the DB.
 *
 * Usage:
 *   SONEX_SUPABASE_KEY="..." node scripts/camoufox-schneider-scraper.mjs [--dry-run] [--resume] [--max=N]
 */

import { firefox } from 'playwright';
import { launchOptions } from 'camoufox-js';
import fs from 'fs';

const SUPABASE_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const SUPABASE_KEY = fs.readFileSync('/home/abu/github_repos/proyecto-pfc-iago-duran/app/.env', 'utf-8')
  .match(/SONEX_SUPABASE_KEY=(.+)/)?.[1]?.trim() || '';

const H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };

const DRY_RUN = process.argv.includes('--dry-run');
const RESUME = process.argv.includes('--resume');
const MAX = parseInt(process.argv.find(a => a.startsWith('--max='))?.split('=')[1] || '99999');

const PROGRESS_FILE = '/tmp/schneider-camoufox-progress.json';
const RESULTS_FILE = '/tmp/schneider-camoufox-results.json';

async function getAllSchneiderProducts() {
  let all = [];
  let offset = 0, limit = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/products?marca=eq.Schneider%20Electric&select=id,ref_fabricante,name,imagen&limit=${limit}&offset=${offset}`;
    const res = await fetch(url, { headers: H });
    if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
    const p = await res.json();
    if (p.length === 0) break;
    all = all.concat(p);
    offset += limit;
    process.stdout.write(`\r  📦 Loading: ${all.length}`);
  }
  console.log(`\n  ✅ Total: ${all.length} Schneider products`);
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

async function scrapeImageFromPage(page, ref, timeout = 20000) {
  const url = `https://www.se.com/es/es/product/${ref}/`;
  let imageUrl = null;

  const apiPromise = new Promise((resolve) => {
    const handler = async (resp) => {
      const rUrl = resp.url();
      if (rUrl.includes('download.schneider-electric.com') && rUrl.includes('rendition_369')) {
        try {
          const text = await resp.text();
          // Check if it's the main product image (not a related product)
          if (text.includes(ref) || text.includes('IoP-Default') || text.includes('Image-front') || text.includes('Image-ON')) {
            imageUrl = rUrl.split('&default_image=')[0].replace('rendition_369_jpg', 'rendition_1500_jpg');
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
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    if (resp?.status() === 200) {
      await apiPromise;

      // Fallback: extract from HTML JSON
      if (!imageUrl) {
        const html = await page.content();
        // Find the main product image pattern: zoomPictureMobile/Preview with rendition_1500
        const mainMatch = html.match(/zoomPictureMobile.*?p_Doc_Ref=([A-Z0-9_-]+)/);
        if (mainMatch) {
          imageUrl = `https://download.schneider-electric.com/files?p_Doc_Ref=${mainMatch[1]}&p_File_Type=rendition_1500_jpg`;
        } else {
          // Try to find any image with the product ref
          const refMatch = html.match(new RegExp(`p_Doc_Ref=${ref}[^"&]*_Image[^"&]*&p_File_Type=rendition_1500`));
          if (refMatch) {
            imageUrl = `https://download.schneider-electric.com/files?${refMatch[0]}`;
          }
        }
      }
    }
  } catch {
    if (!imageUrl) await new Promise(r => setTimeout(r, 3000));
  }

  return imageUrl;
}

async function main() {
  console.log('='.repeat(60));
  console.log('  CAMOUFOX SCHNEIDER IMAGE SCRAPER');
  console.log('='.repeat(60));
  if (DRY_RUN) console.log('🔷 DRY RUN');
  if (RESUME) console.log('🔄 RESUME mode');

  let products = await getAllSchneiderProducts();
  if (products.length > MAX) {
    console.log(`📐 Limited to ${MAX} products`);
    products = products.slice(0, MAX);
  }

  let results = [];
  if (RESUME && fs.existsSync(PROGRESS_FILE)) {
    const saved = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    results = saved.results || [];
    const doneRefs = new Set(results.map(r => r.ref));
    products = products.filter(p => !doneRefs.has(p.ref_fabricante));
    console.log(`🔄 Resume: ${results.length} done, ${products.length} remaining`);
    if (products.length === 0) { console.log('✨ All done!'); await saveReport(results); return; }
  }

  console.log(`\n🚀 Launching Camoufox browser...`);
  const baseOptions = await launchOptions({ headless: true, geoip: false, humanize: true });
  let browser = await firefox.launch(baseOptions);

  const startTime = Date.now();
  let consecutiveErrors = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const ref = product.ref_fabricante;

    if (consecutiveErrors >= 5) {
      console.log('\n  🔄 Restarting browser...');
      try { await browser.close(); } catch {}
      await new Promise(r => setTimeout(r, 2000));
      browser = await firefox.launch(baseOptions);
      consecutiveErrors = 0;
    }

    let imgUrl = null;
    let status = 'not_found';

    try {
      const ctx = await browser.newContext({ locale: 'es-ES', viewport: { width: 1920, height: 1080 } });
      const page = await ctx.newPage();
      imgUrl = await scrapeImageFromPage(page, ref);
      status = imgUrl ? 'found' : 'not_found';
      consecutiveErrors = 0;
      await ctx.close();
    } catch (err) {
      consecutiveErrors++;
      if (consecutiveErrors >= 3) console.log(`\n  ⚠️ Error ${consecutiveErrors}: ${ref}`);
    }

    const result = { ref, id: product.id, imgUrl, status, oldImg: product.imagen, name: product.name };
    results.push(result);

    if (imgUrl && imgUrl !== product.imagen) {
      const ok = await updateProductImage(product.id, imgUrl);
      if (!ok) console.log(`  ❌ DB error: ${ref}`);
    }

    if ((i + 1) % 10 === 0 || i === products.length - 1) {
      const found = results.filter(r => r.status === 'found').length;
      const updated = results.filter(r => r.imgUrl && r.imgUrl !== r.oldImg).length;
      const notFound = results.filter(r => r.status === 'not_found').length;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate = (i + 1) / (elapsed / 60);
      const pct = ((i + 1) / products.length * 100).toFixed(1);
      process.stdout.write(`\r  ${i+1}/${products.length} (${pct}%) | ✅ ${found} | 🔄 ${updated} | ⚠️ ${notFound} | ⏱ ${elapsed}s | 🏎 ${rate.toFixed(1)}/min`);
    }

    if ((i + 1) % 20 === 0) fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ results }, null, 2));
  }

  console.log('\n\n🧹 Closing browser...');
  try { await browser.close(); } catch {}
  await saveReport(results);
  console.log('\n✅ Done!');
}

async function saveReport(results) {
  const found = results.filter(r => r.status === 'found');
  const updated = results.filter(r => r.imgUrl && r.imgUrl !== r.oldImg);
  const notFound = results.filter(r => r.status === 'not_found');

  console.log('\n📊 FINAL RESULTS:');
  console.log(`  ✅ Products with image: ${found.length}`);
  console.log(`  🔄 DB updated: ${updated.length}`);
  console.log(`  ⚠️  No image found: ${notFound.length}`);
  if (results.length > 0) console.log(`  📈 Hit rate: ${(found.length / results.length * 100).toFixed(1)}%`);

  if (found.length > 0) {
    console.log('\n📸 Samples:');
    found.slice(0, 5).forEach(r => console.log(`  ${r.ref}\n    old: ${(r.oldImg||'').substring(0,80)}\n    new: ${r.imgUrl}`));
  }

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results: ${RESULTS_FILE}`);
}

main().catch(err => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});

/**
 * Scrape NEW Schneider families using Camoufox (lightweight)
 * Uses single page context to avoid Camoufox crashes
 */
import { firefox } from 'playwright';
import { launchOptions } from 'camoufox-js';
import fs from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co';

let SUPABASE_KEY = '';
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
  SUPABASE_KEY = envContent.match(/SONEX_SUPABASE_KEY=(.+)/)?.[1]?.trim() ||
                 envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim() || '';
} catch (err) {
  SUPABASE_KEY = process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

const H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };

const NEW_FAMILIES = [
  { name: 'Altivar 320', rangeId: '63440', familia: 'AUTOMATIZACION' },
  { name: 'Altivar 340', rangeId: '63441', familia: 'AUTOMATIZACION' },
  { name: 'TeSys LRD', rangeId: '1885', familia: 'AUTOMATIZACION' },
  { name: 'TeSys T', rangeId: '1508', familia: 'AUTOMATIZACION' },
  { name: 'TeSys island', rangeId: '65746', familia: 'AUTOMATIZACION' },
  { name: 'Zelio Logic', rangeId: '531', familia: 'AUTOMATIZACION' },
  { name: 'PrismaSeT P', rangeId: '22928838', familia: 'DISTRIBUCION DE POTENCIA' },
];

const MAX_PRODUCTS = parseInt(process.argv.find(a => a.startsWith('--max='))?.split('=')[1] || '20');
const DRY_RUN = process.argv.includes('--dry-run');

async function checkRefExists(ref) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/products?ref_fabricante=eq.${ref}&select=id`, { headers: H });
  return (await r.json()).length > 0;
}

async function insertProduct(product) {
  if (DRY_RUN) return true;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST', headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify(product),
  });
  return r.ok;
}

async function main() {
  console.log('='.repeat(60));
  console.log('  SCHNEIDER NEW FAMILIES (Lightweight Camoufox)');
  console.log('='.repeat(60));
  if (DRY_RUN) console.log('🔷 DRY RUN');

  const baseOptions = await launchOptions({ headless: true });
  const browser = await firefox.launch(baseOptions);
  const page = await browser.newPage();

  // Warm up: visit se.com to get session
  console.log('\n🔥 Warming up session...');
  await page.goto('https://www.se.com/es/es/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log('✅ Session ready\n');

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const family of NEW_FAMILIES) {
    console.log(`📂 ${family.name} (range ${family.rangeId})...`);

    // Get product IDs
    const ids = await page.evaluate(async (rangeId) => {
      try {
        const res = await fetch(`/ranges/${rangeId}/products?brand=se&country-code=es&language-code=es&No=0&Nrpp=100`);
        const data = await res.json();
        return data.productIds || [];
      } catch { return []; }
    }, family.rangeId);

    const toProcess = ids.slice(0, MAX_PRODUCTS);
    console.log(`  📋 ${ids.length} products found, processing ${toProcess.length}`);

    let inserted = 0, skipped = 0;

    for (let i = 0; i < toProcess.length; i++) {
      const ref = toProcess[i];

      if (await checkRefExists(ref)) { skipped++; continue; }

      // Fetch product info via page context
      const info = await page.evaluate(async (productRef) => {
        try {
          const res = await fetch(`/es/es/product/${productRef.toLowerCase()}/`);
          const html = await res.text();
          const titleMatch = html.match(/<title>([^<]+)<\/title>/);
          const title = titleMatch?.[1]?.replace(/\s*\|\s*Schneider.*$/, '')?.trim() || productRef;
          
          // Extract image reference
          const imgMatch = html.match(/p_Doc_Ref=([A-Z0-9_-]+).*?rendition_1500/);
          const imageUrl = imgMatch 
            ? `https://download.schneider-electric.com/files?p_Doc_Ref=${imgMatch[1]}&p_File_Type=rendition_1500_jpg`
            : null;
          
          return { title, imageUrl };
        } catch { return null; }
      }, ref);

      if (info) {
        const ok = await insertProduct({
          ref_fabricante: ref, name: info.title, marca: 'Schneider Electric', brand_id: 456,
          familia: family.familia, subfamilia: family.name, tipo: 'CARRIL DIN',
          Gama: family.name, Subgama: family.name, imagen: info.imageUrl, pdf_url: null, precio: 0,
        });
        if (ok) inserted++;
      }

      process.stdout.write(`\r  [${i+1}/${toProcess.length}] ✅ ${inserted} | ⏭️ ${skipped}`);
      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n  📊 ${inserted} inserted, ${skipped} skipped`);
    totalInserted += inserted;
    totalSkipped += skipped;
  }

  await browser.close();
  console.log('\n' + '='.repeat(60));
  console.log(`  TOTAL: ${totalInserted} inserted, ${totalSkipped} skipped`);
  console.log('='.repeat(60));
  console.log('✅ Done!');
}

main().catch(err => { console.error('💥', err.message); process.exit(1); });

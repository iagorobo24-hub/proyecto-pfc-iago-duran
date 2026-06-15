#!/usr/bin/env node
/**
 * Re-Scraper for Rejected and Generic Images — rescraping-rechazados.mjs
 * 
 * Strategy:
 * 1. Fetch all products in Supabase with imagen_verificacion_estado in ('rechazada_ia', 'posible_generico').
 * 2. Attempt to find a real, verified product photo from Sonepar (Playwright).
 * 3. Fallback to DuckDuckGo Image Search if Sonepar fails.
 * 4. Ensure the new image is different from the current rejected one.
 * 5. Update Supabase: new image URL, set state to 'pendiente_ia', reset verified flag.
 * 
 * Usage:
 *   node scripts/verificacion-imagenes/scrapers-adquisicion/rescraping-rechazados.mjs [--dry-run] [--limit=50] [--brand=Eaton] [--concurrency=3] [--delay=1500]
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Environment Variables ─────────────────────────────────────────────────
let SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
let SUPABASE_KEY = process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  try {
    const envPath = path.join(__dirname, '../../..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      SUPABASE_URL = envContent.match(/SUPABASE_URL=(.+)/)?.[1]?.trim() ||
                     envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim() || '';
      SUPABASE_KEY = envContent.match(/SONEX_SUPABASE_KEY=(.+)/)?.[1]?.trim() ||
                     envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim() || '';
    }
  } catch (err) {
    // ignore
  }
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase credentials not found.');
  process.exit(1);
}

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '0');
const CONCURRENCY = parseInt(process.argv.find(a => a.startsWith('--concurrency='))?.split('=')[1] || '3');
const DELAY = parseInt(process.argv.find(a => a.startsWith('--delay='))?.split('=')[1] || '1500');
const BRAND_FILTER = process.argv.find(a => a.startsWith('--brand='))?.split('=')[1];

function cleanRef(ref) {
  if (!ref) return '';
  return String(ref).toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

function isLogoUrl(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  if (lower.includes('/logos/') || lower.includes('logo') || lower.includes('cleanpng') || lower.includes('logotipo')) return true;
  if (lower.includes('pimcode=3852128')) return true;
  if (lower.includes('placeholder') || lower.includes('avatar') || lower.includes('default')) return true;
  if (lower.includes('no-image') || lower.includes('no_image') || lower.includes('noimage')) return true;
  
  const brandLogos = ['schneider.png', 'legrand.png', 'siemens.png', 'abb.png', 'eaton.svg', 'finder.svg', 'circutor.png', 'phoenix.svg'];
  for (const bl of brandLogos) {
    if (lower.endsWith('/' + bl)) return true;
  }
  return false;
}

// DuckDuckGo Image Search Fallback
async function searchDuckDuckGoImage(p, ref) {
  const brand = p.marca;
  const query = `${brand} ${ref} product`;
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  try {
    const htmlUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    const htmlRes = await fetch(htmlUrl, { headers: { 'User-Agent': userAgent } });
    if (!htmlRes.ok) return null;
    const html = await htmlRes.text();
    const vqdMatch = html.match(/vqd=["']([^"']+)["']/i) || html.match(/vqd:\s*["']([^"']+)["']/i);
    if (!vqdMatch) return null;
    const vqd = vqdMatch[1];
    
    const apiUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqd}`;
    const apiRes = await fetch(apiUrl, {
      headers: { 'User-Agent': userAgent, 'Referer': 'https://duckduckgo.com/' }
    });
    if (!apiRes.ok) return null;
    const data = await apiRes.json();
    if (data.results && data.results.length > 0) {
      for (const res of data.results) {
        const imgUrl = res.image;
        if (imgUrl && !isLogoUrl(imgUrl)) {
          return imgUrl;
        }
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function fetchRejectedProducts() {
  console.log('⌛ Descargando productos rechazados de Supabase...');
  const all = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    let url = `${SUPABASE_URL}/rest/v1/products?select=id,ref_fabricante,marca,name,imagen,imagen_verificacion_estado&imagen_verificacion_estado=in.(rechazada_ia,posible_generico)&limit=${pageSize}&offset=${from}&order=id`;
    if (BRAND_FILTER) {
      url += `&marca=eq.${encodeURIComponent(BRAND_FILTER)}`;
    }
    
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      throw new Error(`Error fetching rejected products: ${res.status} - ${await res.text()}`);
    }
    const data = await res.json();
    all.push(...data);
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }
  return all;
}

async function main() {
  console.log('======================================================');
  console.log('🔄 RE-SCRAPING DE PRODUCTOS RECHAZADOS Y GENÉRICOS');
  console.log(`Modo: ${DRY_RUN ? 'DRY-RUN (Simulación)' : 'PRODUCCIÓN (Escritura DB)'}`);
  if (BRAND_FILTER) console.log(`Marca: ${BRAND_FILTER}`);
  if (LIMIT > 0) console.log(`Límite: ${LIMIT}`);
  console.log('======================================================\n');

  const products = await fetchRejectedProducts();
  console.log(`Total objetivos (rechazados/genéricos) encontrados: ${products.length}`);
  
  if (products.length === 0) {
    console.log('✅ No hay productos rechazados o genéricos que procesar.');
    return;
  }

  const finalQueue = LIMIT > 0 ? products.slice(0, LIMIT) : products;
  console.log(`Procesando cola de ${finalQueue.length} referencias...`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  let currentIndex = 0;
  let successCount = 0;
  let fallbackCount = 0;
  let failedCount = 0;
  
  const contexts = [];
  const workers = [];
  const startTime = Date.now();

  for (let i = 0; i < CONCURRENCY; i++) {
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'es-ES'
    });
    contexts.push(ctx);

    const worker = (async (workerId) => {
      const page = await ctx.newPage();

      while (true) {
        let p = null;
        let index = 0;

        synchronizedBlock: {
          if (currentIndex >= finalQueue.length) break;
          p = finalQueue[currentIndex];
          index = currentIndex;
          currentIndex++;
        }

        const ref = p.ref_fabricante ? p.ref_fabricante.trim() : '';
        const currentImg = p.imagen || '';
        
        console.log(`\n[Worker ${workerId}] [${index + 1}/${finalQueue.length}] Procesando ${p.marca} | Ref: ${ref}`);

        let newImg = null;
        let source = 'Sonepar';

        // 1. Intentar Sonepar
        try {
          const searchUrl = `https://new.sonepar.es/catalog/es-es/search/${encodeURIComponent(ref)}`;
          await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await page.waitForTimeout(DELAY);

          newImg = await page.evaluate(() => {
            const imgEls = Array.from(document.querySelectorAll('img'));
            const productImg = imgEls.find(i => i.src.includes('cloudinary') && i.src.includes('PRODUCT/IMAGE'));
            if (productImg) return productImg.src;
            return null;
          });

          if (newImg) {
            // Limpiar parámetros Cloudinary
            if (newImg.includes('?')) {
              newImg = newImg.split('?')[0];
            }
          }
        } catch (err) {
          console.error(`  [Sonepar] Error en Playwright para ref ${ref}: ${err.message}`);
        }

        // 2. Si no se encuentra en Sonepar, hacer fallback a DuckDuckGo
        if (!newImg) {
          console.log(`  [Sonepar] No encontrada. Intentando fallback con DuckDuckGo...`);
          newImg = await searchDuckDuckGoImage(p, ref);
          source = 'DuckDuckGo';
        }

        // 3. Comprobar validez de la imagen encontrada
        if (newImg) {
          if (isLogoUrl(newImg)) {
            console.log(`  ❌ Imagen descartada (es un logotipo/placeholder): ${newImg}`);
            newImg = null;
          } else if (newImg === currentImg) {
            console.log(`  ❌ La imagen encontrada es idéntica a la rechazada actualmente. Ignorando.`);
            newImg = null;
          }
        }

        // 4. Guardar resultados
        if (newImg) {
          console.log(`  ✅ ¡Imagen Encontrada! [${source}] -> ${newImg}`);
          results.push({ id: p.id, ref, brand: p.marca, imageUrl: newImg });
          if (source === 'Sonepar') successCount++; else fallbackCount++;
        } else {
          console.log(`  ❌ No se encontró ninguna imagen nueva válida para ref ${ref}`);
          failedCount++;
        }
      }
    })(i);

    workers.push(worker);
  }

  await Promise.all(workers);
  await browser.close();

  console.log('\n======================================================');
  console.log('📊 RESUMEN DE RE-SCRAPING:');
  console.log(`  - Procesados:  ${finalQueue.length}`);
  console.log(`  - Sonepar:     ${successCount}`);
  console.log(`  - DuckDuckGo:  ${fallbackCount}`);
  console.log(`  - No hallados: ${failedCount}`);
  console.log('======================================================\n');

  if (results.length === 0) {
    console.log('No se encontraron nuevas imágenes para actualizar.');
    return;
  }

  if (DRY_RUN) {
    console.log(`\n🔷 [DRY-RUN] Simulación de base de datos terminada. Se habrían actualizado ${results.length} productos.`);
    results.forEach((r, idx) => {
      console.log(`  [${idx+1}] ID: ${r.id} | Marca: ${r.brand} | Ref: ${r.ref} -> ${r.imageUrl}`);
    });
    return;
  }

  // Actualizar base de datos en lotes
  const batchSize = 50;
  let dbSuccess = 0;
  let dbFail = 0;

  console.log(`💾 Actualizando Supabase (${results.length} registros)...`);
  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    
    await Promise.all(batch.map(item =>
      fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${item.id}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({
          imagen: item.imageUrl,
          imagen_verificacion_estado: 'pendiente_ia',
          imagen_verificada: false
        })
      }).then(r => {
        if (r.ok) dbSuccess++; else dbFail++;
      }).catch(() => dbFail++)
    ));
  }

  console.log(`\n✅ Base de datos actualizada: ${dbSuccess} exitosos, ${dbFail} fallidos.`);
}

main().catch(console.error);

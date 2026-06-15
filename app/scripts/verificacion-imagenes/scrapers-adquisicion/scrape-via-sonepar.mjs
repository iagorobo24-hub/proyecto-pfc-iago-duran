#!/usr/bin/env node
/**
 * Unified Sonepar Catalog Search Image Scraper — scrape-via-sonepar.mjs
 * 
 * Strategy:
 * 1. Query target products from Supabase for all 7 brands that currently lack exact images (logos or representative).
 * 2. Search each product reference on the new Sonepar e-commerce catalog (https://new.sonepar.es/catalog/es-es/search/{ref}).
 * 3. Extract the high-quality Cloudinary product photo.
 * 4. Update the database in Supabase.
 * 
 * Usage:
 *   node scripts/scrape-via-sonepar.mjs [--dry-run] [--brand=Eaton] [--limit=50] [--resume] [--concurrency=3] [--delay=1500]
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'url'; // Note: Node.js url or path modules
import fsPath from 'path';
import { fileURLToPath } from 'url';

const __dirname = fsPath.dirname(fileURLToPath(import.meta.url));
const PROGRESS_FILE = fsPath.join(__dirname, '../../..', 'scrape-sonepar-progress.json');

const BRANDS = ['Siemens', 'Eaton', 'Phoenix Contact', 'Circutor', 'Legrand', 'Finder', 'ABB'];

// ─── Environment Variables ─────────────────────────────────────────────────
let SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
let SUPABASE_KEY = process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  try {
    const envPath = fsPath.join(__dirname, '../../..', '.env');
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
const RESUME = process.argv.includes('--resume');
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '0');
const CONCURRENCY = parseInt(process.argv.find(a => a.startsWith('--concurrency='))?.split('=')[1] || '2');
const DELAY = parseInt(process.argv.find(a => a.startsWith('--delay='))?.split('=')[1] || '1500');
const BRAND_FILTER = process.argv.find(a => a.startsWith('--brand='))?.split('=')[1];

function cleanRef(ref) {
  if (!ref) return '';
  return String(ref).toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

function isLogoUrl(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  if (lower.includes('/logos/') || lower.includes('logo') || lower.includes('cleanpng')) return true;
  if (lower.includes('pimcode=3852128')) return true;
  const brandLogos = ['schneider.png', 'legrand.png', 'siemens.png', 'abb.png', 'eaton.svg', 'finder.svg', 'circutor.png', 'phoenix.svg'];
  for (const bl of brandLogos) {
    if (lower.endsWith('/' + bl)) return true;
  }
  return false;
}

// Cargar catálogo local desde chunks para identificar cuáles ya tienen coincidencia exacta y cuáles no.
function getChunkReferences() {
  console.log('📂 Escaneando chunks de Sonepar locales...');
  const chunkRefs = new Set();
  const chunksDir = fsPath.join(__dirname, '../../..', 'sonepar-catalog-scraper');
  if (!fs.existsSync(chunksDir)) return chunkRefs;
  
  const files = fs.readdirSync(chunksDir).filter(f => f.startsWith('S') && f.endsWith('.json') && !f.includes('progress'));
  files.forEach(file => {
    try {
      const content = fs.readFileSync(fsPath.join(chunksDir, file), 'utf-8');
      const products = JSON.parse(content);
      products.forEach(p => {
        const ref = p.refFabricante || p.codigoArticulo || p.ref || '';
        const cleaned = cleanRef(ref);
        if (cleaned) {
          let image_url = '';
          if (p.imagenes && p.imagenes.length > 0) {
            const imgObj = p.imagenes[0];
            image_url = typeof imgObj === 'string' ? imgObj : (imgObj.imagen || imgObj.url || '');
          }
          if (image_url && !isLogoUrl(image_url)) {
            chunkRefs.add(cleaned);
          }
        }
      });
    } catch (err) {}
  });
  console.log(`✅ Encontradas ${chunkRefs.size} referencias con imágenes exactas en chunks.`);
  return chunkRefs;
}

async function fetchProductsFromDb() {
  console.log('⌛ Descargando productos de la base de datos...');
  const all = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  const brandsToQuery = BRAND_FILTER ? [BRAND_FILTER] : BRANDS;

  while (hasMore) {
    const from = page * pageSize;
    const brandFilter = brandsToQuery.map(b => `marca.eq.${encodeURIComponent(b)}`).join(',');
    const url = `${SUPABASE_URL}/rest/v1/products?select=id,ref_fabricante,marca,imagen&or=(${brandFilter})&limit=${pageSize}&offset=${from}&order=id`;
    
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      throw new Error(`Error fetching products: ${res.status} - ${await res.text()}`);
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
  console.log('🌐 EXTRACCIÓN DE FOTOS REALES A TRAVÉS DE SONEPAR SHOP');
  console.log(`Modo: ${DRY_RUN ? 'DRY-RUN (Simulación)' : 'PRODUCCIÓN (Escritura DB)'}`);
  if (BRAND_FILTER) console.log(`Filtro de Marca: ${BRAND_FILTER}`);
  if (LIMIT > 0) console.log(`Límite: ${LIMIT} productos`);
  console.log('======================================================\n');

  const chunkRefs = getChunkReferences();
  const dbProducts = await fetchProductsFromDb();

  // Filtrar objetivos: son productos que no tienen imagen, tienen logo, o tienen una representativa (Solr sin coincidencia exacta en chunks)
  const targetProducts = dbProducts.filter(p => {
    const img = p.imagen || '';
    const cleaned = cleanRef(p.ref_fabricante);
    
    if (!img || isLogoUrl(img)) {
      return true;
    }
    
    if (img.includes('getImageSolr') && !img.includes('cloudinary') && !chunkRefs.has(cleaned)) {
      return true;
    }
    
    return false;
  });

  console.log(`\n📊 Análisis de Catálogo:`);
  console.log(`  - Total productos de marcas seleccionadas en DB: ${dbProducts.length}`);
  console.log(`  - Objetivos que necesitan extracción real (logo/representativa): ${targetProducts.length}`);

  if (targetProducts.length === 0) {
    console.log('\n✅ Todos los productos ya tienen imágenes exactas. Saliendo.');
    return;
  }

  // Cargar progreso anterior si aplica
  let progress = { processed: {}, results: [] };
  if (RESUME && fs.existsSync(PROGRESS_FILE)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      console.log(`\n🔄 Reanudando desde progreso anterior: ${Object.keys(progress.processed).length} productos procesados.`);
    } catch (err) {
      console.warn('⚠️ No se pudo leer el archivo de progreso. Iniciando desde cero.');
    }
  }

  const productsToScrape = targetProducts.filter(p => !progress.processed[p.id]);
  const finalQueue = LIMIT > 0 ? productsToScrape.slice(0, LIMIT) : productsToScrape;

  if (finalQueue.length === 0) {
    console.log('\n✅ Todos los objetivos ya han sido procesados en ejecuciones anteriores.');
    return;
  }

  console.log(`\n🚀 Iniciando extracción web para ${finalQueue.length} referencias...`);
  
  // Iniciar navegadores Playwright
  const browser = await chromium.launch({ headless: true });
  
  // Lanzar workers concurrentes
  const contexts = [];
  const workers = [];
  const startTime = Date.now();
  
  let currentIndex = 0;
  let successCount = 0;
  let notFoundCount = 0;

  for (let i = 0; i < CONCURRENCY; i++) {
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'es-ES'
    });
    contexts.push(ctx);
    
    // Iniciar tarea del worker
    const worker = (async (workerId) => {
      const page = await ctx.newPage();
      
      while (true) {
        let p = null;
        let index = 0;
        
        // Sincronizar obtención de la cola
        synchronizedBlock: {
          if (currentIndex >= finalQueue.length) break;
          p = finalQueue[currentIndex];
          index = currentIndex;
          currentIndex++;
        }
        
        const ref = p.ref_fabricante ? p.ref_fabricante.trim() : '';
        const searchUrl = `https://new.sonepar.es/catalog/es-es/search/${encodeURIComponent(ref)}`;
        
        let foundImg = null;
        try {
          await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await page.waitForTimeout(DELAY);
          
          foundImg = await page.evaluate(() => {
            const imgEls = Array.from(document.querySelectorAll('img'));
            // Buscar imagen en Cloudinary CDN
            const productImg = imgEls.find(i => i.src.includes('cloudinary') && i.src.includes('PRODUCT/IMAGE'));
            if (productImg) return productImg.src;
            return null;
          });
          
          if (foundImg) {
            // Limpiar URL si tiene parámetros de redimensionado de Cloudinary
            if (foundImg.includes('?')) {
              // Mantener la URL limpia quitando el tamaño small/medium si queremos la máxima resolución
              foundImg = foundImg.split('?')[0];
            }
            progress.results.push({ id: p.id, ref, brand: p.marca, imageUrl: foundImg });
            progress.processed[p.id] = { status: 'found', url: foundImg };
            successCount++;
          } else {
            progress.processed[p.id] = { status: 'not_found' };
            notFoundCount++;
          }
        } catch (err) {
          progress.processed[p.id] = { status: 'error', error: err.message };
          notFoundCount++;
        }
        
        // Guardar progreso periódicamente
        if (index % 10 === 0) {
          fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
        }

        const totalProcessed = index + 1;
        const elapsedMinutes = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        process.stdout.write(`\r  Worker ${workerId} | Progreso: ${totalProcessed}/${finalQueue.length} | ✅ Fotos: ${successCount} | ❌ No: ${notFoundCount} | ⏱ ${elapsedMinutes}m`);
      }
    })(i);
    
    workers.push(worker);
  }

  // Esperar a que terminen todos los workers
  await Promise.all(workers);
  
  // Guardar estado final de progreso
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  
  console.log('\n\n🧹 Cerrando navegadores...');
  await browser.close();

  const foundImages = progress.results.filter(r => r.imageUrl);
  console.log(`\nResolución completada. Encontradas ${foundImages.length} fotos reales.`);

  if (DRY_RUN) {
    console.log(`\n🔷 [DRY-RUN] Simulación de actualización finalizada. Se habrían actualizado ${foundImages.length} productos.`);
    console.log('Muestra de las primeras 5 actualizaciones:');
    foundImages.slice(0, 5).forEach((r, idx) => {
      console.log(`  [${idx+1}] ID: ${r.id} | Marca: ${r.brand} | Ref: ${r.ref} -> ${r.imageUrl}`);
    });
    return;
  }

  // Escribir a la base de datos en lotes de 50
  let dbSuccessCount = 0;
  let dbErrorCount = 0;
  const batchSize = 50;

  console.log('\n💾 Actualizando Supabase...');
  for (let i = 0; i < foundImages.length; i += batchSize) {
    const batch = foundImages.slice(i, i + batchSize);
    try {
      const results = await Promise.all(batch.map(item =>
        fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${item.id}`, {
          method: 'PATCH',
          headers: HEADERS,
          body: JSON.stringify({ imagen: item.imageUrl })
        }).then(r => r.ok ? 'ok' : 'fail').catch(() => 'fail')
      ));
      
      dbSuccessCount += results.filter(s => s === 'ok').length;
      dbErrorCount += results.filter(s => s === 'fail').length;
      
      process.stdout.write(`\r  💾 DB Actualizadas: ${dbSuccessCount} | ❌ Errores: ${dbErrorCount}  (${Math.min(i + batchSize, foundImages.length)}/${foundImages.length})`);
    } catch (err) {
      dbErrorCount += batch.length;
      console.error(`\n❌ Error de red en lote:`, err.message);
    }
  }

  // Limpiar archivo de progreso si se completó la cola entera
  if (finalQueue.length === productsToScrape.length) {
    try {
      fs.unlinkSync(PROGRESS_FILE);
      console.log('\n🧹 Archivo de progreso eliminado.');
    } catch {}
  }

  console.log(`\n\n======================================================`);
  console.log(`🎉 PROCESO DE ACTUALIZACIÓN CONCLUIDO CON ÉXITO`);
  console.log(`  - Fotos reales extraídas:               ${successCount}`);
  console.log(`  - Productos actualizados en Supabase:   ${dbSuccessCount}`);
  console.log(`  - Errores de escritura en DB:           ${dbErrorCount}`);
  console.log('======================================================');
  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err.message);
  process.exit(1);
});

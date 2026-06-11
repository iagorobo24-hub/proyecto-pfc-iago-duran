#!/usr/bin/env node
/**
 * Scrape Real Schneider Product Photos — scrape-schneider-real-images.mjs
 * 
 * Strategy:
 * 1. Query all Schneider Electric products from Supabase.
 * 2. Scan Sonepar chunks to skip products that already have exact Sonepar photos.
 * 3. For the remaining products (using representative/logo fallbacks), fetch their long product page URL.
 * 4. Fetch the HTML page, extract the clean high-resolution product photo from the Schneider CDN, and write it to the DB.
 * 
 * Usage:
 *   node scripts/scrape-schneider-real-images.mjs [--dry-run] [--limit=50] [--resume] [--delay=100]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHUNKS_DIR = path.join(__dirname, '../sonepar-catalog-scraper');
const PROGRESS_FILE = path.join(__dirname, '../scrape-schneider-images-progress.json');

// ─── Environment Variables ─────────────────────────────────────────────────
let SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
let SUPABASE_KEY = process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  try {
    const envPath = path.join(__dirname, '..', '.env');
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
const DELAY = parseInt(process.argv.find(a => a.startsWith('--delay='))?.split('=')[1] || '100');

function cleanRef(ref) {
  if (!ref) return '';
  return String(ref).toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

function isLogoUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.includes('/logos/') || lower.includes('logo') || lower.includes('cleanpng')) return true;
  const brandLogos = ['schneider.png', 'legrand.png', 'siemens.png', 'abb.png', 'eaton.svg', 'finder.svg', 'circutor.png', 'phoenix.svg'];
  for (const bl of brandLogos) {
    if (lower.endsWith('/' + bl)) return true;
  }
  return false;
}

async function fetchSchneiderProducts() {
  console.log('⌛ Descargando productos de Schneider Electric de la DB...');
  const all = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const url = `${SUPABASE_URL}/rest/v1/products?select=id,ref_fabricante,name,imagen&marca=eq.${encodeURIComponent('Schneider Electric')}&limit=${pageSize}&offset=${from}&order=id`;
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

function getChunkReferences() {
  console.log('📂 Escaneando chunks de Sonepar en busca de referencias con imágenes exactas...');
  const chunkRefs = new Set();
  if (!fs.existsSync(CHUNKS_DIR)) {
    console.warn(`⚠️ Warning: Chunks directory ${CHUNKS_DIR} does not exist.`);
    return chunkRefs;
  }
  
  const files = fs.readdirSync(CHUNKS_DIR).filter(f => f.startsWith('S') && f.endsWith('.json') && !f.includes('progress'));
  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(CHUNKS_DIR, file), 'utf-8');
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
    } catch (err) {
      // ignore
    }
  });
  console.log(`✅ Encontradas ${chunkRefs.size} referencias con imágenes exactas en los chunks.`);
  return chunkRefs;
}

async function checkCdnUrl(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeoutId);
    return res.status === 200;
  } catch {
    return false;
  }
}

async function checkCdnPatterns(ref) {
  const patterns = [
    `https://download.schneider-electric.com/files?p_Doc_Ref=${ref}_IoP-Default&p_File_Type=rendition_1500_jpg`,
    `https://download.schneider-electric.com/files?p_Doc_Ref=${ref}_FRONT&p_File_Type=rendition_1500_jpg`,
    `https://download.schneider-electric.com/files?p_Doc_Ref=${ref}_Image-front&p_File_Type=rendition_1500_jpg`,
    `https://download.schneider-electric.com/files?p_Doc_Ref=${ref}_Image&p_File_Type=rendition_1500_jpg`,
    `https://download.schneider-electric.com/files?p_Doc_Ref=${ref}&p_File_Type=rendition_1500_jpg`
  ];
  
  const results = await Promise.all(patterns.map(async url => {
    const ok = await checkCdnUrl(url);
    return ok ? url : null;
  }));
  
  return results.find(url => url !== null);
}

async function scrapeRealImageFromSchneider(ref) {
  // 1. Intentar validación rápida por HEAD
  const fastUrl = await checkCdnPatterns(ref);
  if (fastUrl) return fastUrl;

  // 2. Fallback a raspado de la página de producto HTML
  const apiUrl = `https://www.se.com/products-card/secondary?brand=se&country-code=es&language-code=es&ids=${ref}`;
  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.se.com/es/es/'
    }
  });
  
  if (!res.ok) return null;
  const data = await res.json();
  const info = data.productAdditionalInfos?.[0];
  if (!info || !info.viewAllDocumentsUrl) return null;
  
  const longUrl = info.viewAllDocumentsUrl.split('#')[0];
  
  const pageRes = await fetch(longUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9'
    }
  });
  
  if (pageRes.status !== 200) return null;
  const html = await pageRes.text();
  const decodedHtml = html.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  
  // Extraer enlaces CDN de Schneider
  const cdnRegex = /https:\/\/download\.schneider-electric\.com\/files\?[^\s"']+/g;
  const links = [];
  let match;
  while ((match = cdnRegex.exec(decodedHtml)) !== null) {
    links.push(match[0]);
  }
  
  // Buscar imágenes asociadas a la referencia
  const refLinks = links.filter(link => link.toLowerCase().includes(ref.toLowerCase()));
  const highRes = refLinks.find(link => link.includes('rendition_1500_jpg')) ||
                  refLinks.find(link => link.includes('rendition_1000_jpg')) ||
                  refLinks.find(link => link.includes('rendition_520_jpg')) ||
                  refLinks.find(link => link.includes('jpg') || link.includes('png')) ||
                  refLinks[0] || null;
                  
  return highRes;
}

async function main() {
  console.log('======================================================');
  console.log('🌐 EXTRACCIÓN DE IMÁGENES REALES DESDE SCHNEIDER ELECTRIC');
  console.log(`Modo: ${DRY_RUN ? 'DRY-RUN (Simulación)' : 'PRODUCCIÓN (Escritura DB)'}`);
  if (LIMIT > 0) console.log(`Límite de extracción: ${LIMIT} productos`);
  console.log('======================================================\n');

  const products = await fetchSchneiderProducts();
  const chunkRefs = getChunkReferences();

  // Filtrar productos que no tienen coincidencia exacta en Sonepar (necesitan scrapeado)
  const targetProducts = products.filter(p => {
    const cleaned = cleanRef(p.ref_fabricante);
    return !chunkRefs.has(cleaned);
  });

  console.log(`\n📊 Análisis del Catálogo Schneider Electric:`);
  console.log(`  - Total Schneider en la DB: ${products.length} productos`);
  console.log(`  - Con foto exacta en Chunks: ${products.length - targetProducts.length} productos`);
  console.log(`  - Objetivos a scrapear (con foto representativa o logo): ${targetProducts.length} productos`);

  if (targetProducts.length === 0) {
    console.log('\n✅ ¡Felicidades! Todos los productos ya tienen una foto real exacta. Saliendo.');
    return;
  }

  // Load progress if resume is enabled
  let progress = { processed: {}, results: [] };
  if (RESUME && fs.existsSync(PROGRESS_FILE)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      console.log(`\n🔄 Reanudando desde progreso guardado: ${Object.keys(progress.processed).length} productos procesados.`);
    } catch (err) {
      console.warn('⚠️ No se pudo leer el archivo de progreso. Iniciando desde cero.');
    }
  }

  const productsToScrape = targetProducts.filter(p => !progress.processed[p.id]);
  const finalQueue = LIMIT > 0 ? productsToScrape.slice(0, LIMIT) : productsToScrape;

  console.log(`\n🚀 Iniciando extracción de fotos reales para ${finalQueue.length} productos...`);
  const concurrency = 5;
  let successCount = 0;
  let notFoundCount = 0;
  
  const startTime = Date.now();

  for (let i = 0; i < finalQueue.length; i += concurrency) {
    const batch = finalQueue.slice(i, i + concurrency);
    
    await Promise.all(batch.map(async p => {
      const ref = p.ref_fabricante ? p.ref_fabricante.trim() : '';
      try {
        const imageUrl = await scrapeRealImageFromSchneider(ref);
        if (imageUrl) {
          progress.results.push({ id: p.id, ref, imageUrl });
          progress.processed[p.id] = { status: 'found', url: imageUrl };
          successCount++;
        } else {
          progress.processed[p.id] = { status: 'not_found' };
          notFoundCount++;
        }
      } catch (err) {
        progress.processed[p.id] = { status: 'error', error: err.message };
        notFoundCount++;
      }
      
      if (DELAY > 0) {
        await new Promise(r => setTimeout(r, DELAY));
      }
    }));

    // Guardar progreso periódico
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

    const totalProcessed = i + batch.length;
    const elapsedMinutes = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    process.stdout.write(`\r  Progreso: ${totalProcessed}/${finalQueue.length} | ✅ Fotos reales: ${successCount} | ❌ No encontradas: ${notFoundCount} | ⏱ ${elapsedMinutes}m`);
  }

  console.log('\n\nExtracción completada. Actualizando base de datos...');
  const foundImages = progress.results.filter(r => r.imageUrl);

  if (DRY_RUN) {
    console.log(`\n🔷 [DRY-RUN] Simulación de actualización finalizada. Se habrían actualizado ${foundImages.length} productos.`);
    console.log('Muestra de las primeras 5 actualizaciones:');
    foundImages.slice(0, 5).forEach((r, idx) => {
      console.log(`  [${idx+1}] ID: ${r.id} | Ref: ${r.ref} -> ${r.imageUrl}`);
    });
    return;
  }

  // Escribir a la base de datos en lotes de 50
  let dbSuccessCount = 0;
  let dbErrorCount = 0;
  const batchSize = 50;

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
  console.log(`🎉 PROCESO TERMINADO CON ÉXITO`);
  console.log(`  - Productos con fotos reales extraídos: ${successCount}`);
  console.log(`  - Productos actualizados en Supabase:   ${dbSuccessCount}`);
  console.log(`  - Errores de escritura en DB:           ${dbErrorCount}`);
  console.log('======================================================');
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err.message);
  process.exit(1);
});

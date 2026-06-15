#!/usr/bin/env node
/**
 * Unified Search Engine Image Resolver — scrape-via-search-engine.mjs
 * 
 * Strategy:
 * 1. Query target products from Supabase for brands that lack exact images.
 * 2. Search each product reference and brand on DuckDuckGo Image API.
 * 3. Extract, filter, and validate the first high-quality product photo URL.
 * 4. Update the database in Supabase.
 * 
 * Usage:
 *   node scripts/scrape-via-search-engine.mjs [--dry-run] [--brand=Eaton] [--limit=50] [--resume] [--concurrency=2] [--delay=1500]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROGRESS_FILE = path.join(__dirname, '../../..', 'scrape-search-progress.json');

const BRANDS = ['Siemens', 'Eaton', 'Phoenix Contact', 'Circutor', 'Legrand', 'Finder', 'ABB'];

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
  // Check common terms for logos, banners, placeholders, and missing images
  if (lower.includes('/logos/') || lower.includes('logo') || lower.includes('cleanpng') || lower.includes('logotipo')) return true;
  if (lower.includes('pimcode=3852128')) return true; // Sonepar placeholder PIM code
  if (lower.includes('placeholder') || lower.includes('avatar') || lower.includes('default')) return true;
  if (lower.includes('no-image') || lower.includes('no_image') || lower.includes('noimage') || lower.includes('image-not-available') || lower.includes('image_not_available')) return true;
  if (lower.includes('slider') || lower.includes('banner') || lower.includes('carousel')) return true;
  
  const brandLogos = ['schneider.png', 'legrand.png', 'siemens.png', 'abb.png', 'eaton.svg', 'finder.svg', 'circutor.png', 'phoenix.svg'];
  for (const bl of brandLogos) {
    if (lower.endsWith('/' + bl)) return true;
  }
  return false;
}

// Cargar catálogo local desde chunks para identificar cuáles ya tienen coincidencia exacta
function getChunkReferences() {
  const chunkRefs = new Set();
  const chunksDir = path.join(__dirname, '../../..', 'sonepar-catalog-scraper');
  if (!fs.existsSync(chunksDir)) return chunkRefs;
  
  const files = fs.readdirSync(chunksDir).filter(f => f.startsWith('S') && f.endsWith('.json') && !f.includes('progress'));
  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(chunksDir, file), 'utf-8');
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

function getSearchRef(ref) {
  if (!ref) return '';
  let clean = ref.trim();
  if (clean.startsWith('CIR-')) clean = clean.substring(4);
  if (clean.startsWith('PHO-')) clean = clean.substring(4);
  if (clean.startsWith('FND-')) clean = clean.substring(4);
  if (clean.startsWith('EAT-')) clean = clean.substring(4);
  return clean;
}

function isImageMismatched(url, productName) {
  const lowerUrl = url.toLowerCase();
  const lowerName = productName.toLowerCase();
  
  // EV / Charging Safeguards
  const evKeywords = ['enext', 'e-next', 'urban', 'ehome', 'wallbox', 'cargador', 'recarga', 'charger', 'recharge', 'epark'];
  const hasEvInUrl = evKeywords.some(kw => lowerUrl.includes(kw));
  if (hasEvInUrl) {
    const hasEvInName = ['cargador', 'recarga', 'coche', 'vehiculo', 'ev', 've', 'wallbox', 'enext', 'urban', 'ehome', 'epark', 'charging', 'tarjeta'].some(kw => lowerName.includes(kw));
    if (!hasEvInName) {
      return true; // Mismatch!
    }
  }
  
  // UPS / SAI Safeguards
  const upsKeywords = ['ups', 'sai', 'battery', 'ebm', 'batterie'];
  const hasUpsInUrl = upsKeywords.some(kw => lowerUrl.includes(kw));
  if (hasUpsInUrl) {
    const hasUpsInName = ['ups', 'sai', 'bateria', 'battery', 'alimentacion', 'power', 'back-up', 'ebm', 'fusetron'].some(kw => lowerName.includes(kw));
    if (!hasUpsInName) {
      return true; // Mismatch!
    }
  }
  
  return false;
}

// Buscar vqd y luego imágenes vía DDG API sin navegador (con fetch nativo)
async function searchProductImage(p, ref) {
  const brand = p.marca;
  const productName = p.name || '';
  const searchRef = getSearchRef(ref);
  
  // Swap Circutor to Circontrol for EV products
  let brandForSearch = brand;
  if (brand === 'Circutor') {
    const isEvProduct = p.familia === 'Vehículos eléctricos' || 
                        ['urban', 'epark', 'ehome', 'enext', 'wallbox', 'recarga', 'cargador'].some(kw => productName.toLowerCase().includes(kw));
    if (isEvProduct) {
      brandForSearch = 'Circontrol';
    }
  }
  
  const query = `${brandForSearch} ${searchRef} product`;
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  try {
    // 1. Obtener token vqd
    const htmlUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    const htmlRes = await fetch(htmlUrl, {
      headers: { 'User-Agent': userAgent }
    });
    if (!htmlRes.ok) return null;
    const html = await htmlRes.text();
    
    const vqdMatch = html.match(/vqd=["']([^"']+)["']/i) || html.match(/vqd:\s*["']([^"']+)["']/i);
    if (!vqdMatch) return null;
    const vqd = vqdMatch[1];
    
    // 2. Consultar API de Imágenes
    const apiUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqd}`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        'User-Agent': userAgent,
        'Referer': 'https://duckduckgo.com/'
      }
    });
    if (!apiRes.ok) return null;
    const data = await apiRes.json();
    
    if (data?.results?.length > 0) {
      // Filtrar y tomar la primera imagen que no sea un logo o genérica
      for (const item of data.results) {
        const imgUrl = item.image;
        if (!imgUrl) continue;
        
        const lowerUrl = imgUrl.toLowerCase();
        const lowerTitle = (item.title || '').toLowerCase();
        
        // Descartar logotipos, placeholders o imágenes corporativas
        if (isLogoUrl(imgUrl)) continue;
        if (lowerUrl.includes('logo') || lowerTitle.includes('logo') || lowerTitle.includes('logotipo')) continue;
        if (lowerUrl.includes('placeholder') || lowerUrl.includes('avatar') || lowerUrl.includes('default')) continue;
        
        // Evitar falsas asociaciones de categorías
        if (isImageMismatched(imgUrl, productName)) continue;
        
        // Validar formato
        if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.webp') || lowerUrl.includes('.jpg?') || lowerUrl.includes('.jpeg?') || lowerUrl.includes('.png?') || lowerUrl.includes('.webp?')) {
          return imgUrl;
        }
      }
    }
  } catch (err) {
    // ignore
  }
  return null;
}

// Validar que la imagen remota responda HTTP 200 mediante GET request rápido
async function validateImageUrl(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(4000)
    });
    
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      return contentType.startsWith('image/');
    }
  } catch (err) {
    // ignore
  }
  return false;
}

async function main() {
  console.log('======================================================');
  console.log('🌐 EXTRACCIÓN DE FOTOS REALES A TRAVÉS DE BUSCADORES');
  console.log(`Modo: ${DRY_RUN ? 'DRY-RUN (Simulación)' : 'PRODUCCIÓN (Escritura DB)'}`);
  if (BRAND_FILTER) console.log(`Filtro de Marca: ${BRAND_FILTER}`);
  if (LIMIT > 0) console.log(`Límite: ${LIMIT} productos`);
  console.log('======================================================\n');

  const chunkRefs = getChunkReferences();
  const dbProducts = await fetchProductsFromDb();

  // Filtrar objetivos
  const targetProducts = dbProducts.filter(p => {
    const img = p.imagen || '';
    const cleaned = cleanRef(p.ref_fabricante);
    
    if (!img || isLogoUrl(img)) {
      return true;
    }
    
    // Check for known broken manufacturer direct domains
    const brokenDomains = ['circutor.com', 'findernet.com', 'phoenixcontact.com', 'abb.com', 'iverwind.com'];
    if (brokenDomains.some(domain => img.includes(domain))) {
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

  console.log(`\n🚀 Iniciando extracción vía DuckDuckGo Image API para ${finalQueue.length} referencias...`);
  
  const startTime = Date.now();
  let currentIndex = 0;
  let successCount = 0;
  let notFoundCount = 0;

  // Lanzar workers concurrentes
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    const worker = (async (workerId) => {
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
        let foundImg = await searchProductImage(p, ref);
        
        // Validar que la imagen responda HEAD request
        let isValid = false;
        if (foundImg) {
          isValid = await validateImageUrl(foundImg);
          if (!isValid) {
            foundImg = null; // Descartar si responde error o no es imagen
          }
        }
        
        if (foundImg) {
          progress.results.push({ id: p.id, ref, brand: p.marca, imageUrl: foundImg });
          progress.processed[p.id] = { status: 'found', url: foundImg };
          successCount++;
        } else {
          progress.processed[p.id] = { status: 'not_found' };
          notFoundCount++;
        }
        
        // Guardar progreso periódicamente
        if (index % 10 === 0) {
          fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
        }

        const totalProcessed = index + 1;
        const elapsedMinutes = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        process.stdout.write(`\r  Worker ${workerId} | Progreso: ${totalProcessed}/${finalQueue.length} | ✅ Fotos: ${successCount} | ❌ No: ${notFoundCount} | ⏱ ${elapsedMinutes}m`);
        
        // Delay para evitar baneos
        await new Promise(r => setTimeout(r, DELAY));
      }
    })(i);
    
    workers.push(worker);
  }

  await Promise.all(workers);
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

  const foundImages = progress.results.filter(r => r.imageUrl);
  console.log(`\n\nResolución completada. Encontradas ${foundImages.length} fotos reales.`);

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

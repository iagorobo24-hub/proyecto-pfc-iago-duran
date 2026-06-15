#!/usr/bin/env node
/**
 * Local Image Resolver from Sonepar Chunks — resolve-images-from-chunks.mjs
 * 
 * Strategy:
 * 1. Read Sonepar chunks locally and build a map of { cleanRef: imageUrl } for products of the 7 target brands.
 * 2. Query all products of these 7 brands from Supabase.
 * 3. Filter products that currently have no image, or only have a generic logo/placeholder.
 * 4. Perform a normalized matching (ignoring dots, dashes, spaces, uppercase).
 * 5. Update matching products in Supabase in batches of 50.
 * 
 * Usage:
 *   node scripts/resolve-images-from-chunks.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHUNKS_DIR = path.join(__dirname, '../../sonepar-catalog-scraper');

const BRANDS = ['Siemens', 'Eaton', 'Phoenix Contact', 'Circutor', 'Legrand', 'Finder', 'ABB'];

// ─── Environment Variables ─────────────────────────────────────────────────
let SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
let SUPABASE_KEY = process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  try {
    const envPath = path.join(__dirname, '../..', '.env');
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

function cleanRef(ref) {
  if (!ref) return '';
  return String(ref).toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

function isLogoUrl(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  if (lower.includes('/logos/') || lower.includes('logo') || lower.includes('cleanpng')) return true;
  // Eaton brand placeholder
  if (lower.includes('pimcode=3852128')) return true;
  const brandLogos = ['schneider.png', 'legrand.png', 'siemens.png', 'abb.png', 'eaton.svg', 'finder.svg', 'circutor.png', 'phoenix.svg'];
  for (const bl of brandLogos) {
    if (lower.endsWith('/' + bl)) return true;
  }
  return false;
}

function getBrandFromProduct(p) {
  const brandRaw = (p.marca || p.fabricante || '').toUpperCase();
  if (brandRaw.includes('SIEMENS')) return 'Siemens';
  if (brandRaw.includes('EATON')) return 'Eaton';
  if (brandRaw.includes('PHOENIX')) return 'Phoenix Contact';
  if (brandRaw.includes('CIRCUTOR')) return 'Circutor';
  if (brandRaw.includes('LEGRAND')) return 'Legrand';
  if (brandRaw.includes('FINDER')) return 'Finder';
  if (brandRaw.includes('ABB')) return 'ABB';
  return null;
}

// Cargar catálogo local desde chunks
function loadLocalImagesMap() {
  console.log('📂 Escaneando chunks de Sonepar...');
  const refMap = new Map();
  if (!fs.existsSync(CHUNKS_DIR)) {
    console.warn(`⚠️ Warning: Chunks directory ${CHUNKS_DIR} does not exist.`);
    return refMap;
  }
  
  const files = fs.readdirSync(CHUNKS_DIR).filter(f => f.startsWith('S') && f.endsWith('.json') && !f.includes('progress'));
  let totalProcessed = 0;
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(CHUNKS_DIR, file), 'utf-8');
      const products = JSON.parse(content);
      products.forEach(p => {
        const brand = getBrandFromProduct(p);
        if (!brand) return;
        
        const ref = p.refFabricante || p.codigoArticulo || p.ref || '';
        const cleaned = cleanRef(ref);
        if (!cleaned) return;
        
        let image_url = '';
        if (p.imagenes && p.imagenes.length > 0) {
          const imgObj = p.imagenes[0];
          image_url = typeof imgObj === 'string' ? imgObj : (imgObj.imagen || imgObj.url || '');
        }
        
        if (image_url && !isLogoUrl(image_url)) {
          refMap.set(cleaned, image_url);
          totalProcessed++;
        }
      });
    } catch (err) {
      // ignore
    }
  });
  
  console.log(`✅ Cargados ${refMap.size} mapeos de imágenes de Sonepar.`);
  return refMap;
}

// Cargar productos de la base de datos para las 7 marcas
async function fetchProductsFromDb() {
  console.log('⌛ Descargando productos de la base de datos...');
  const all = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    // Filtrar por marca IN (Siemens, Eaton, Phoenix Contact, Circutor, Legrand, Finder, ABB)
    const brandFilter = BRANDS.map(b => `marca.eq.${encodeURIComponent(b)}`).join(',');
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
      process.stdout.write(`\r  Cargados: ${all.length}...`);
    }
  }
  console.log(`\n✅ Total productos cargados de Supabase: ${all.length}`);
  return all;
}

async function main() {
  console.log('======================================================');
  console.log('🔄 RESOLUCIÓN DE IMÁGENES REALES DESDE CHUNKS LOCALES');
  console.log(`Modo: ${DRY_RUN ? 'DRY-RUN (Simulación)' : 'PRODUCCIÓN (Escritura DB)'}`);
  console.log('======================================================\n');

  const localMap = loadLocalImagesMap();
  const dbProducts = await fetchProductsFromDb();

  const toUpdate = [];
  const brandStats = {};
  BRANDS.forEach(b => brandStats[b] = { total: 0, missingImage: 0, resolved: 0 });

  dbProducts.forEach(p => {
    const brand = p.marca;
    if (!brandStats[brand]) return;
    
    brandStats[brand].total++;
    
    const currentImg = p.imagen || '';
    const hasImage = currentImg && !isLogoUrl(currentImg);
    
    if (!hasImage) {
      brandStats[brand].missingImage++;
      const cleanedRef = cleanRef(p.ref_fabricante);
      const localImg = localMap.get(cleanedRef);
      
      if (localImg) {
        brandStats[brand].resolved++;
        toUpdate.push({ id: p.id, ref: p.ref_fabricante, marca: brand, newImage: localImg });
      }
    }
  });

  console.log('\n📊 ESTADÍSTICAS POR MARCA:');
  console.table(brandStats);

  console.log(`\n🚀 Total de referencias a actualizar: ${toUpdate.length}`);

  if (toUpdate.length === 0) {
    console.log('✅ Nada que actualizar localmente.');
    return;
  }

  if (DRY_RUN) {
    console.log(`\n🔷 [DRY-RUN] Simulación completada. Muestra de las primeras 10 actualizaciones:`);
    toUpdate.slice(0, 10).forEach((item, idx) => {
      console.log(`  [${idx+1}] Brand: ${item.marca} | Ref: ${item.ref} -> ${item.newImage}`);
    });
    return;
  }

  // Escribir a la base de datos en lotes de 50
  let dbSuccessCount = 0;
  let dbErrorCount = 0;
  const batchSize = 50;

  console.log('\n💾 Actualizando base de datos...');
  const startTime = Date.now();

  for (let i = 0; i < toUpdate.length; i += batchSize) {
    const batch = toUpdate.slice(i, i + batchSize);
    try {
      const results = await Promise.all(batch.map(item =>
        fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${item.id}`, {
          method: 'PATCH',
          headers: HEADERS,
          body: JSON.stringify({ imagen: item.newImage })
        }).then(r => r.ok ? 'ok' : 'fail').catch(() => 'fail')
      ));
      
      dbSuccessCount += results.filter(s => s === 'ok').length;
      dbErrorCount += results.filter(s => s === 'fail').length;
      
      const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(0);
      process.stdout.write(`\r  💾 DB Actualizadas: ${dbSuccessCount} | ❌ Errores: ${dbErrorCount} | ⏱ ${elapsedSeconds}s  (${Math.min(i + batchSize, toUpdate.length)}/${toUpdate.length})`);
    } catch (err) {
      dbErrorCount += batch.length;
      console.error(`\n❌ Error de red en lote:`, err.message);
    }
  }

  console.log(`\n\n======================================================`);
  console.log(`🎉 PROCESO LOCAL TERMINADO CON ÉXITO`);
  console.log(`  - Productos actualizados en Supabase:   ${dbSuccessCount}`);
  console.log(`  - Errores de escritura en DB:           ${dbErrorCount}`);
  console.log('======================================================');
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err.message);
  process.exit(1);
});

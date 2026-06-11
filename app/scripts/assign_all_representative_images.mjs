#!/usr/bin/env node
/**
 * Catalog Representative Images Assigner — assign_all_representative_images.mjs
 * 
 * Strategy:
 * 1. Load all products from Supabase.
 * 2. Cross-reference Sonepar chunks to resolve exact SKU matches first (Precisión 100%).
 * 3. Propagate representative images hierarchically (Subgama -> Gama -> Subfamilia).
 * 4. Fallback to Brand Logo.
 * 5. Update the database in batches of 50.
 *
 * Usage:
 *   node scripts/assign_all_representative_images.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHUNKS_DIR = path.join(__dirname, '../sonepar-catalog-scraper');

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

// ─── Brand Logos Mapping ──────────────────────────────────────────────────
const BRAND_LOGOS = {
  'schneider electric': '/logos/schneider.png',
  'abb': '/logos/abb.png',
  'siemens': '/logos/siemens.png',
  'legrand': '/logos/legrand.png',
  'eaton': '/logos/eaton.svg',
  'finder': '/logos/finder.svg',
  'circutor': '/logos/circutor.png',
  'phoenix contact': '/logos/phoenix.svg'
};

async function fetchAllProducts() {
  console.log('⌛ Descargando productos de la base de datos (paginado)...');
  const all = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const url = `${SUPABASE_URL}/rest/v1/products?select=id,ref_fabricante,marca,subfamilia,Gama,Subgama,imagen&limit=${pageSize}&offset=${from}&order=id`;
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

function cleanRef(ref) {
  if (!ref) return '';
  return String(ref).toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

function isLogoUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  
  if (lower.includes('/logos/') || lower.includes('logo') || lower.includes('cleanpng')) {
    return true;
  }
  
  const brandLogos = [
    'schneider.png', 'schneider.jpg', 'schneider.svg',
    'legrand.png', 'legrand.jpg', 'legrand.svg',
    'siemens.png', 'siemens.jpg', 'siemens.svg',
    'abb.png', 'abb.jpg', 'abb.svg',
    'eaton.svg', 'eaton.png', 'eaton.jpg',
    'finder.svg', 'finder.png', 'finder.jpg',
    'circutor.png', 'circutor.jpg', 'circutor.svg',
    'phoenix.svg', 'phoenix.png', 'phoenix.jpg'
  ];
  
  for (const bl of brandLogos) {
    if (lower.endsWith('/' + bl)) {
      return true;
    }
  }
  
  return false;
}

// Cargar todas las imágenes de los chunks de Sonepar locales
function loadImagesFromSoneparChunks() {
  console.log('📂 Escaneando chunks de Sonepar en busca de imágenes exactas...');
  const refImageMap = {};
  if (!fs.existsSync(CHUNKS_DIR)) {
    console.warn(`⚠️ Warning: Chunks directory ${CHUNKS_DIR} does not exist. Skipping chunk match.`);
    return refImageMap;
  }
  
  const files = fs.readdirSync(CHUNKS_DIR).filter(f => f.startsWith('S') && f.endsWith('.json') && !f.includes('progress'));
  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(CHUNKS_DIR, file), 'utf-8');
      const products = JSON.parse(content);
      products.forEach(p => {
        const ref = p.refFabricante || p.codigoArticulo || p.ref || '';
        if (ref) {
          let image_url = '';
          if (p.imagenes && p.imagenes.length > 0) {
            const imgObj = p.imagenes[0];
            image_url = typeof imgObj === 'string' ? imgObj : (imgObj.imagen || imgObj.url || '');
          }
          if (image_url && !isLogoUrl(image_url)) {
            const cleaned = cleanRef(ref);
            if (cleaned) {
              refImageMap[cleaned] = image_url;
            }
          }
        }
      });
    } catch (err) {
      // ignore
    }
  });
  console.log(`✅ Cargadas ${Object.keys(refImageMap).length} referencias con imágenes desde chunks.`);
  return refImageMap;
}

async function main() {
  console.log('======================================================');
  console.log('🖼️  INICIANDO ASIGNACIÓN MASIVA DE IMÁGENES');
  console.log(`Modo: ${DRY_RUN ? 'DRY-RUN (Simulación)' : 'PRODUCCIÓN (Escritura DB)'}`);
  console.log('======================================================\n');

  const products = await fetchAllProducts();
  const chunkImages = loadImagesFromSoneparChunks();

  // Separar productos que ya tienen una foto real de los que no (vacíos o logos)
  const productsWithImage = [];
  const productsWithoutImage = [];

  products.forEach(p => {
    const img = p.imagen ? p.imagen.trim() : '';
    if (img && !isLogoUrl(img)) {
      productsWithImage.push(p);
    } else {
      productsWithoutImage.push(p);
    }
  });

  console.log(`\n📊 Estado del catálogo:`);
  console.log(`  - Con foto real: ${productsWithImage.length} productos`);
  console.log(`  - Sin foto real (vacíos o con logo): ${productsWithoutImage.length} productos (para resolver)`);

  if (productsWithoutImage.length === 0) {
    console.log('\n✅ ¡Perfecto! El 100% de los productos ya tienen una foto real. Saliendo.');
    return;
  }

  // Construir mapas jerárquicos de imágenes representativas por marca
  console.log('\n📊 Construyendo jerarquías de imágenes representativas...');
  const subgamaBest = {};
  const gamaBest = {};
  const subfamiliaBest = {};

  productsWithImage.forEach(p => {
    const brandKey = String(p.marca || '').trim().toLowerCase();
    const sg = String(p.Subgama || '').trim();
    const ga = String(p.Gama || '').trim();
    const sf = String(p.subfamilia || '').trim();
    const img = p.imagen;

    if (!subgamaBest[brandKey]) subgamaBest[brandKey] = {};
    if (!gamaBest[brandKey]) gamaBest[brandKey] = {};
    if (!subfamiliaBest[brandKey]) subfamiliaBest[brandKey] = {};

    if (sg && !subgamaBest[brandKey][sg]) subgamaBest[brandKey][sg] = img;
    if (ga && !gamaBest[brandKey][ga]) gamaBest[brandKey][ga] = img;
    if (sf && !subfamiliaBest[brandKey][sf]) subfamiliaBest[brandKey][sf] = img;
  });

  // Pipeline de asignación
  console.log('\n📊 Asignando imágenes a registros vacíos o con logo...');
  const assignments = [];
  let soneparMatches = 0;
  let subgamaMatches = 0;
  let gamaMatches = 0;
  let subfamiliaMatches = 0;
  let logoFallbacks = 0;

  productsWithoutImage.forEach(p => {
    const ref = p.ref_fabricante ? p.ref_fabricante.trim() : '';
    const cleaned = cleanRef(ref);
    const brandKey = String(p.marca || '').trim().toLowerCase();
    const sg = String(p.Subgama || '').trim();
    const ga = String(p.Gama || '').trim();
    const sf = String(p.subfamilia || '').trim();

    let targetImage = null;
    let strategy = '';

    // 1. Coincidencia exacta por chunk (con referencia normalizada)
    if (cleaned && chunkImages[cleaned]) {
      targetImage = chunkImages[cleaned];
      strategy = 'sonepar_exact';
      soneparMatches++;
    }
    // 2. Propagación por Subgama
    else if (sg && subgamaBest[brandKey] && subgamaBest[brandKey][sg]) {
      targetImage = subgamaBest[brandKey][sg];
      strategy = 'subgama_representative';
      subgamaMatches++;
    }
    // 3. Propagación por Gama
    else if (ga && gamaBest[brandKey] && gamaBest[brandKey][ga]) {
      targetImage = gamaBest[brandKey][ga];
      strategy = 'gama_representative';
      gamaMatches++;
    }
    // 4. Propagación por Subfamilia
    else if (sf && subfamiliaBest[brandKey] && subfamiliaBest[brandKey][sf]) {
      targetImage = subfamiliaBest[brandKey][sf];
      strategy = 'subfamilia_representative';
      subfamiliaMatches++;
    }
    // 5. Fallback al logotipo de la marca
    else {
      targetImage = BRAND_LOGOS[brandKey] || '/logos/schneider.png';
      strategy = 'brand_logo';
      logoFallbacks++;
    }

    assignments.push({
      id: p.id,
      ref: p.ref_fabricante,
      marca: p.marca,
      name: p.name,
      newImage: targetImage,
      strategy
    });
  });

  console.log(`\n📈 Resumen de asignaciones:`);
  console.log(`  - Coincidencia exacta por chunk: ${soneparMatches}`);
  console.log(`  - Representativa por Subgama:    ${subgamaMatches}`);
  console.log(`  - Representativa por Gama:       ${gamaMatches}`);
  console.log(`  - Representativa por Subfamilia: ${subfamiliaMatches}`);
  console.log(`  - Fallback a Logotipo de Marca:  ${logoFallbacks}`);
  console.log(`  - Total asignado:                ${assignments.length}`);

  if (DRY_RUN) {
    console.log('\n🔷 [DRY-RUN] Simulación completa. Muestra de las primeras 15 asignaciones:');
    assignments.slice(0, 15).forEach((a, idx) => {
      console.log(`  [${idx+1}] Ref: ${a.ref} | Brand: ${a.marca} | Strategy: ${a.strategy} -> ${a.newImage}`);
    });
    return;
  }

  // Ejecución de actualizaciones en lotes de 50
  console.log(`\n💾 Actualizando ${assignments.length} registros en Supabase...`);
  let successCount = 0;
  let errorCount = 0;
  const batchSize = 50;

  for (let i = 0; i < assignments.length; i += batchSize) {
    const batch = assignments.slice(i, i + batchSize);
    try {
      const results = await Promise.all(batch.map(a =>
        fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${a.id}`, {
          method: 'PATCH',
          headers: HEADERS,
          body: JSON.stringify({ imagen: a.newImage })
        }).then(r => r.ok ? 'ok' : 'fail').catch(() => 'fail')
      ));
      
      successCount += results.filter(s => s === 'ok').length;
      errorCount += results.filter(s => s === 'fail').length;
      
      process.stdout.write(`\r  ✅ Actualizados: ${successCount} | ❌ Errores: ${errorCount}  (${Math.min(i + batchSize, assignments.length)}/${assignments.length})`);
    } catch (err) {
      errorCount += batch.length;
      console.error(`\n❌ Error de red en lote:`, err.message);
    }
  }

  console.log(`\n\n======================================================`);
  console.log(`🎉 ASIGNACIÓN MASIVA DE IMÁGENES COMPLETADA`);
  console.log(`  - Registros actualizados: ${successCount}`);
  console.log(`  - Registros con error:     ${errorCount}`);
  console.log('======================================================');
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err.message);
  process.exit(1);
});

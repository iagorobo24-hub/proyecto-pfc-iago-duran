/**
 * SCRAPER SCHNEIDER ELECTRIC — ACTI9 iK60 (generación de referencias)
 *
 * La gama Acti9 iK60 NO está disponible en se.com/es/es (Range API 403/0).
 * Estrategia: generamos la lista completa de referencias A9K a partir de
 * los patrones conocidos del catálogo K60N/K60H y extraemos datos vía:
 *   1. Product Card API → PDF URL (funciona con ES locale)
 *   2. Imagen → shop-sg.se.com (Magento catalog, funciona sin bloqueo)
 *   3. Nombre → generado del patrón A9K (altamente estandarizado)
 *
 * Referencias verificadas contra catálogo PDF (FD_Catalogue_K60_2016.pdf)
 * y eshop.se.com/sg (70+ productos listados).
 *
 * Uso:
 *   node scripts/scrape-schneider-ik60.mjs
 *   node scripts/scrape-schneider-ik60.mjs --dry-run
 *   node scripts/scrape-schneider-ik60.mjs --max=20
 *   node scripts/scrape-schneider-ik60.mjs --delay=500
 *   node scripts/scrape-schneider-ik60.mjs --save-refs   # Guarda lista JSON
 */

import { insertProduct, checkRefExists, getProductsCount } from './lib/supabase-sonex.js';
import fs from 'fs';
import path from 'path';

const FAMILIA = 'DISTRIBUCION DE POTENCIA';
const MARCA = 'Schneider Electric';
const BRAND_ID = 456;
const BASE_URL = 'https://www.se.com';
const IMAGE_BASE = 'https://shop-sg.se.com/media/catalog/product/cache/a1bd47e247df18b5a6b3e1a92f7154fe/a/9';
const SCHNEIDER_LOGO = 'https://www.se.com/assets/images/brand/schneider-electric-logo.png';

// Hash MD5 de la imagen genérica (conocida de pruebas anteriores)
const GENERIC_IMAGE_HASH = '9345503c03eb975c65f6d26a834217b2';
const GENERIC_IMAGE_SIZE = 5376; // ~5.3KB

// Cache de imágenes verificadas
const verifiedImages = new Map();

// ─── Decodificación de referencias A9K ──────────────────────────────
// Patrón: A9K[X][PP][AA]
//   X  = subgama: 0=iK60N (6kA), 1=iK60H (10kA), 2=iK60N (nuevo)
//   PP = polo+curva: 11..14/16(B) o 21..24/26(C)
//   AA = amperaje: 06..63

const POLE_MAP = {
  11: { poles: '1P',  nombre: '1P',  curva: 'B' }, 12: { poles: '2P',  nombre: '2P',  curva: 'B' },
  13: { poles: '3P',  nombre: '3P',  curva: 'B' }, 14: { poles: '4P',  nombre: '4P',  curva: 'B' },
  16: { poles: '1P+N', nombre: '1P+N', curva: 'B' },
  21: { poles: '1P',  nombre: '1P',  curva: 'C' }, 22: { poles: '2P',  nombre: '2P',  curva: 'C' },
  23: { poles: '3P',  nombre: '3P',  curva: 'C' }, 24: { poles: '4P',  nombre: '4P',  curva: 'C' },
  26: { poles: '1P+N', nombre: '1P+N', curva: 'C' },
};

const AMPS = [6, 10, 16, 20, 25, 32, 40, 50, 63];
const SUBGAMAS = {
  0: { Subgama: 'iK60N', kA: '6kA' },
  1: { Subgama: 'iK60H', kA: '10kA' },
};

function decodeA9K(ref) {
  const m = ref.match(/^A9K(\d)(\d{2})(\d{2})$/);
  if (!m) return null;
  const [, xStr, ppStr, aaStr] = m;
  const x = parseInt(xStr);
  const pp = parseInt(ppStr);
  const aa = parseInt(aaStr);

  const subgama = SUBGAMAS[x];
  const pole = POLE_MAP[pp];
  if (!subgama || !pole) return null;

  const nombreSubgama = subgama.Subgama;

  return {
    Subgama: nombreSubgama,
    kA: subgama.kA,
    poles: pole.poles,
    curva: pole.curva,
    amperaje: aa,
    name: `Magnetotérmico, Acti9 ${nombreSubgama}, ${pole.nombre}, ${aa}A, ${pole.curva} curva, ${subgama.kA} IEC EN 60898-1`,
  };
}

function generarTodasLasReferencias() {
  const refs = [];
  for (const [x, info] of Object.entries(SUBGAMAS)) {
    for (const [ppCode] of Object.entries(POLE_MAP)) {
      for (const amps of AMPS) {
        const ref = `A9K${x}${ppCode}${String(amps).padStart(2, '0')}`;
        const decoded = decodeA9K(ref);
        if (decoded) refs.push(ref);
      }
    }
  }
  return refs.sort();
}

// ─── Parse args ─────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const MAX_PRODUCTS = parseInt(args.find(a => a.startsWith('--max='))?.split('=')[1] || '9999');
const DELAY_MS = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] || '300');
const RETRIES = parseInt(args.find(a => a.startsWith('--retries='))?.split('=')[1] || '3');
const SAVE_REFS = args.includes('--save-refs');

const LOG_FILE = path.join(import.meta.dirname, 'scrape-schneider-ik60.log');
const REFS_FILE = path.join(import.meta.dirname, 'referencias-ik60.json');

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// ─── Fetch con reintentos ────────────────────────────────────────
async function fetchWithRetry(url, options = {}, retries = RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          ...options.headers,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      const waitMs = Math.min(1000 * Math.pow(2, i), 5000);
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
}

// ─── Obtener PDF URL desde Product Card API ─────────────────────
async function getPdfUrl(ref) {
  try {
    const res = await fetchWithRetry(
      `${BASE_URL}/products-card/secondary?brand=se&country-code=es&language-code=es&ids=${ref}`
    );
    const data = await res.json();
    const doc = data.productAdditionalInfos?.[0]?.documents?.find(d =>
      d.documentType === 'Product Data Sheet' || d.title?.includes('Hoja de datos')
    );
    return doc?.url ? `${BASE_URL}${doc.url}` : null;
  } catch {
    return null;
  }
}

// ─── Obtener imagen desde eshop de Singapur ────────────────────
async function getImageUrl(ref) {
  // Si ya está en cache, devolver
  if (verifiedImages.has(ref)) {
    return verifiedImages.get(ref);
  }

  const slug = ref.toLowerCase();
  const imageUrl = `${IMAGE_BASE}/${slug.slice(0, 1)}/${slug.slice(1, 2)}/${slug}_1.jpg`;

  try {
    // Hacer HEAD request para obtener tamaño sin descargar todo
    const headRes = await fetch(imageUrl, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!headRes.ok) {
      verifiedImages.set(ref, null);
      return null;
    }

    const contentLength = headRes.headers.get('content-length');
    const size = contentLength ? parseInt(contentLength) : 0;

    // Si el tamaño coincide con la imagen genérica, devolver null
    if (size === GENERIC_IMAGE_SIZE || (size > 0 && size < 3000)) {
      log(`    🖼️ Imagen genérica detectada (${size} bytes) → usando fallback`);
      verifiedImages.set(ref, SCHNEIDER_LOGO);
      return SCHNEIDER_LOGO;
    }

    // Imagen válida
    verifiedImages.set(ref, imageUrl);
    return imageUrl;
  } catch (err) {
    // Si falla, devolver logo de Schneider como fallback
    log(`    🖼️ Error obteniendo imagen → usando fallback`);
    verifiedImages.set(ref, SCHNEIDER_LOGO);
    return SCHNEIDER_LOGO;
  }
}

// ─── Obtener datos de producto de una referencia A9K ──────────
async function getProductData(ref) {
  const decoded = decodeA9K(ref);
  if (!decoded) {
    log(`  ⚠️ ${ref}: patrón no reconocido`);
    return null;
  }

  const pdfUrl = await getPdfUrl(ref);
  const imageUrl = await getImageUrl(ref);

  return {
    ref_fabricante: ref,
    name: decoded.name,
    marca: MARCA,
    brand_id: BRAND_ID,
    familia: FAMILIA,
    subfamilia: 'Interruptor Magnetotérmico',
    tipo: 'CARRIL DIN',
    Gama: 'Acti 9 iK60',
    Subgama: decoded.Subgama,
    imagen: imageUrl,
    pdf_url: pdfUrl,
    precio: 0,
  };
}

// ─── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  SCRAPER SCHNEIDER ELECTRIC — ACTI9 iK60');
  console.log('='.repeat(70));

  if (DRY_RUN) log('🔍 MODO DRY-RUN: No se guardarán datos en DB');
  log(`📦 Máx productos: ${MAX_PRODUCTS}`);
  log(`⏱️ Delay entre requests: ${DELAY_MS}ms`);

  const productsCount = await getProductsCount();
  log(`📋 Productos actuales en DB: ${productsCount}`);

  // Generar lista completa de referencias
  const todasLasRefs = generarTodasLasReferencias();
  log(`📋 ${todasLasRefs.length} referencias A9K generadas (K60N + K60H)`);

  if (SAVE_REFS) {
    fs.writeFileSync(REFS_FILE, JSON.stringify(todasLasRefs, null, 2));
    log(`💾 Lista de referencias guardada: ${REFS_FILE}`);
  }

  const referenciasAProcesar = todasLasRefs.slice(0, MAX_PRODUCTS);
  log(`🔢 A procesar: ${referenciasAProcesar.length}`);

  const results = {
    total: 0,
    saved: 0,
    skipped: 0,
    errors: 0,
    bySubgama: {},
  };

  for (let i = 0; i < referenciasAProcesar.length; i++) {
    const ref = referenciasAProcesar[i];
    const decoded = decodeA9K(ref);
    const subgamaKey = decoded?.Subgama || 'unknown';

    if (!results.bySubgama[subgamaKey]) {
      results.bySubgama[subgamaKey] = { total: 0, saved: 0, skipped: 0, errors: 0 };
    }

    // Verificar si ya existe
    const exists = await checkRefExists(ref);
    if (exists) {
      log(`  [${i + 1}/${referenciasAProcesar.length}] ⏭️ ${ref} ya existe | ${decoded?.name?.substring(0, 55)}`);
      results.skipped++;
      results.bySubgama[subgamaKey].skipped++;
      continue;
    }

    // Obtener datos
    const productData = await getProductData(ref);
    if (!productData) {
      log(`  [${i + 1}/${referenciasAProcesar.length}] ❌ ${ref} sin datos`);
      results.errors++;
      results.bySubgama[subgamaKey].errors++;
      continue;
    }

    results.total++;
    results.bySubgama[subgamaKey].total++;

    log(`  [${i + 1}/${referenciasAProcesar.length}] ✅ ${ref} | ${productData.name.substring(0, 60)}`);
    if (productData.pdf_url) log(`    📄 PDF: OK`);
    if (productData.imagen) log(`    🖼️ Imagen: OK`);

    // Guardar en Supabase
    if (!DRY_RUN) {
      try {
        await insertProduct(productData);
        results.saved++;
        results.bySubgama[subgamaKey].saved++;
      } catch (err) {
        log(`    ❌ Error guardando: ${err.message}`);
        results.errors++;
        results.bySubgama[subgamaKey].errors++;
      }
    } else {
      results.saved++;
      results.bySubgama[subgamaKey].saved++;
    }

    // Delay entre productos
    if (i < referenciasAProcesar.length - 1 && DELAY_MS > 0) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  // ─── Resumen ───────────────────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('  RESUMEN — ACTI9 iK60');
  console.log('='.repeat(70));
  console.log(`  📦 Total procesados: ${results.total}`);
  console.log(`  💾 Guardados: ${results.saved}`);
  console.log(`  ⏭️ Saltados (ya existían): ${results.skipped}`);
  console.log(`  ❌ Errores: ${results.errors}`);
  console.log('');

  for (const [key, stats] of Object.entries(results.bySubgama)) {
    console.log(`  ${key}: ${stats.total} procesados, ${stats.saved} guardados, ${stats.skipped} saltados, ${stats.errors} errores`);
  }

  const reportFile = path.join(import.meta.dirname, 'scrape-schneider-ik60-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
  log(`\n📄 Reporte: ${reportFile}`);
  log(`📋 Log: ${LOG_FILE}`);
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err);
  process.exit(1);
});

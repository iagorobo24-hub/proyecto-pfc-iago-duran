/**
 * SCRAPER SIEMENS — INTERRUPTORES MAGNETOTÉRMICOS
 * 
 * Siemens no expone una API pública como Schneider Electric.
 * Estrategia:
 * 1. Generar referencias a partir de patrones conocidos del catálogo Siemens
 * 2. Extraer datos de productorn Siemens (mallmall.siemens.com)
 * 3. Usar Firebase/CDN para imágenes (siemens.com content delivery)
 * 
 * Gamas principales de Siemens interruptores:
 * - 5SL6: Miniature Circuit Breakers (MCB) - series standard
 * - 5SY7: Miniature Circuit Breakers - gama superior
 * - 5SY4: Interruptores magnetotérmicos industrial
 * - 3VA2: Molded Case Circuit Breakers (MCCB)
 * - VN: Serie residential (Italia/Europa del Este)
 * 
 * Patrón de referencias:
 * - 5SL6XXX-X: 5SL6 [polos] [curva] [amperaje] [versión]
 *   Ej: 5SL6106-6 = 5SL6, 1P, B curva, 6A, versión 6
 * - 5SY7XXX-7: Similar, familia 5SY7
 * 
 * Uso:
 *   node scripts/scrape-siemens.mjs                    # Todas las gamas
 *   node scripts/scrape-siemens.mjs --gama=sl6         # Solo 5SL6
 *   node scripts/scrape-siemens.mjs --dry-run          # Sin guardar en DB
 *   node scripts/scrape-siemens.mjs --max=10           # Máx productos por gama
 *   node scripts/scrape-siemens.mjs --delay=1000       # Delay entre requests (ms)
 */

import { insertProduct, checkRefExists, getProductsCount } from './lib/supabase-sonex.js';
import fs from 'fs';
import path from 'path';

// ─── Configuración de gamas ─────────────────────────────
// Siemens España no tiene Range API pública. Generamos referencias
// desde patrones conocidos del catálogo y verificamos disponibilidad.

const GAMAS = {
  sl6: { 
    name: '5SL6 Miniature Circuit Breaker', 
    prefix: '5SL6', 
    pattern: '5SL6[1-4][1-6][0-9][0-9]-[0-9]',
    desc: 'MCB estándar, 6kA, 1-4 polos, B/C curva'
  },
  sy7: { 
    name: '5SY7 Miniature Circuit Breaker', 
    prefix: '5SY7', 
    pattern: '5SY7[1-4][1-6][0-9][0-9]-[0-9]',
    desc: 'MCB gama superior, 10kA, 1-4 polos'
  },
  sy4: { 
    name: '5SY4 Miniature Circuit Breaker', 
    prefix: '5SY4', 
    pattern: '5SY4[1-4][1-6][0-9][0-9]-[0-9]',
    desc: 'MCB industrial, 6kA'
  },
  va2: {
    name: '3VA2 Molded Case Circuit Breaker',
    prefix: '3VA2',
    pattern: '3VA2[0-9]{2}[0-9]{2}-[A-Z0-9]+',
    desc: 'MCCB, 15-1600A, industrial'
  }
};

const FAMILIA = 'DISTRIBUCION DE POTENCIA';
const MARCA = 'Siemens';
let BRAND_ID = null; // Lo detectaremos dinámicamente o lo crearemos
const BASE_URL = 'https://www.siemens.com';
const MALLMALL_BASE = 'https://mallmall.siemens.com/es/es';

// ─── Parse args ─────────────────────────────────────────
const args = process.argv.slice(2);
const GAMA_FILTER = args.find(a => a.startsWith('--gama='))?.split('=')[1];
const DRY_RUN = args.includes('--dry-run');
const MAX_PRODUCTS = parseInt(args.find(a => a.startsWith('--max='))?.split('=')[1] || '50');
const DELAY_MS = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] || '500');
const RETRIES = parseInt(args.find(a => a.startsWith('--retries='))?.split('=')[1] || '3');

const LOG_FILE = path.join(import.meta.dirname, 'scrape-siemens.log');
const REPORT_FILE = path.join(import.meta.dirname, 'scrape-siemens-report.json');

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// ─── Fetch con reintentos ────────────────────────────────
async function fetchWithRetry(url, options = {}, retries = RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          ...(options?.headers || {}),
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

// ─── Decodificación de referencias Siemens ──────────────────
// Patrón 5SL6XXX-X:
//   [prefix] [polos] [curva] [amperaje] [suffix]
//   polos: 1=1P, 2=2P, 3=3P, 4=4P
//   curva: 1=B, 6=C
//   amperaje: 01=1A, 06=6A, 10=10A, 16=16A, 20=20A, 25=25A, 32=32A, 40=40A, 50=50A, 63=63A

const POLE_MAP = {
  '1': '1P', '2': '2P', '3': '3P', '4': '4P'
};

const CURVE_MAP = {
  '1': 'B', '6': 'C'
};

const AMPS = {
  '01': 1, '02': 2, '03': 3, '04': 4, '06': 6, '10': 10,
  '13': 13, '16': 16, '20': 20, '25': 25, '32': 32, '40': 40, '50': 50, '63': 63
};

function decodeSiemensRef(ref) {
  if (!ref) return null;
  
  // 5SL6XXX-X pattern: 5SL6 + polos(1) + curva(1) + amperaje(2) + suffix(1)
  const match = ref.match(/^(5SL[4-7])([1-4])([16])(\d{2})-(\d)$/);
  if (!match) return null;
  
  const [, prefix, pole, curve, ampStr, suffix] = match;
  const poles = POLE_MAP[pole] || `${pole}P`;
  const curveName = CURVE_MAP[curve] || 'B';
  const amps = AMPS[ampStr] || parseInt(ampStr) || 0;
  
  const subgama = `${prefix} ${curveName} curva`;
  const kA = prefix === '5SY7' ? '10kA' : '6kA';
  
  return {
    prefix,
    Gama: prefix === '5SL6' ? '5SL6' : prefix === '5SY7' ? '5SY7' : prefix === '5SY4' ? '5SY4' : prefix,
    Subgama: subgama,
    poles,
    curva: curveName,
    amperaje: amps,
    kA,
    name: `Magnetotérmico, ${prefix}, ${poles}, ${amps}A, ${curveName} curva, ${kA} IEC EN 60898-1`,
    tipo: 'CARRIL DIN',
    subfamilia: 'Interruptor Magnetotérmico'
  };
}

// Generar todas las referencias posibles para una gama
function generateRefs(prefix, maxCount = 100) {
  const refs = [];
  const poles = ['1', '2', '3', '4'];
  const curves = ['1', '6']; // B, C
  const amps = ['01', '02', '03', '04', '06', '10', '13', '16', '20', '25', '32', '40', '50', '63'];
  const suffixes = ['6', '7'];
  
  for (const pole of poles) {
    for (const curve of curves) {
      for (const amp of amps) {
        for (const suffix of suffixes) {
          const ref = `${prefix}${pole}${curve}${amp}-${suffix}`;
          if (decodeSiemensRef(ref)) {
            refs.push(ref);
            if (refs.length >= maxCount) return refs;
          }
        }
      }
    }
  }
  return refs;
}

// ─── Obtener brand_id de Siemens ───────────────────────────────
async function getSiemensBrandId() {
  try {
    const res = await fetchWithRetry(`${BASE_URL}/api/brands`);
    const brands = await res.json();
    const siemens = brands.find(b => b.name?.toLowerCase().includes('siemens'));
    if (siemens) return siemens.id;
  } catch {
    // Si falla, intentamos crear la marca
  }
  return 457; // Fallback
}

// ─── Extract Gama/Subgama desde nombre ─────────────────────────
function extractGamaSubgamaFromName(name) {
  if (!name) return { Gama: null, Subgama: null };
  const n = name.toUpperCase();
  
  if (n.includes('5SY7')) return { Gama: '5SY7', Subgama: '5SY7' };
  if (n.includes('5SL6')) return { Gama: '5SL6', Subgama: '5SL6' };
  if (n.includes('5SY4')) return { Gama: '5SY4', Subgama: '5SY4' };
  if (n.includes('3VA2')) return { Gama: '3VA2', Subgama: '3VA2' };
  
  return { Gama: null, Subgama: null };
}

// ─── Determinar subfamilia ─────────────────────────────────────
function extractSubfamilia(Gama) {
  if (!Gama) return 'Interruptor Magnetotérmico';
  if (['3VA2', '3VA'].includes(Gama?.substring(0, 3))) return 'Interruptor Caja Moldeada';
  return 'Interruptor Magnetotérmico';
}

// ─── Determinar tipo ───────────────────────────────────────────
function extractTipo(Gama) {
  if (!Gama) return 'CARRIL DIN';
  if (Gama.startsWith('3VA')) return 'CAJA MOLDEADA';
  return 'CARRIL DIN';
}

// ─── Obtener datos de producto desde mallmall ────────────────────
async function getProductData(ref) {
  try {
    // Intentar obtener datos de mallmall
    const productUrl = `${MALLMALL_BASE}/${ref}`;
    let html, titleMatch, imageMatch;
    
    try {
      const res = await fetchWithRetry(productUrl, { timeout: 10000 });
      html = await res.text();
      
      titleMatch = html.match(/<title>([^<]+)<\/title>/);
      imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    } catch (err) {
      log(`  ⚠️ Producto ${ref} no disponible en mallmall`);
      return null;
    }
    
    // Extraer datos del título
    const title = titleMatch?.[1]?.replace(/\s*\|?\s*Siemens.*$/, '')?.trim() || ref;
    const name = title.replace(/^[53][A-Z0-9]+\s*-?\s*/, '').trim() || title;
    
    // Intentar obtener PDF desde route API (si existe)
    let pdfUrl = null;
    try {
      const pdfRes = await fetchWithRetry(`${MALLMALL_BASE}/api/products/${ref}/documents`, { timeout: 5000 });
      if (pdfRes.ok) {
        const docs = await pdfRes.json();
        const pdfDoc = docs?.find(d => d.type === 'datasheet' || d.title?.toLowerCase().includes('hoja'));
        pdfUrl = pdfDoc?.url || null;
      }
    } catch {
      // PDF no disponible
    }
    
    const decoded = decodeSiemensRef(ref);
    
    return {
      ref_fabricante: ref,
      name: decoded?.name || name,
      marca: MARCA,
      brand_id: BRAND_ID,
      familia: FAMILIA,
      subfamilia: decoded?.subfamilia || extractSubfamilia(decoded?.Gama),
      tipo: decoded?.tipo || extractTipo(decoded?.Gama),
      Gama: decoded?.Gama || extractGamaSubgamaFromName(title)?.Gama || 'Siemens',
      Subgama: decoded?.Subgama || extractGamaSubgamaFromName(title)?.Subgama || 'General',
      imagen: imageMatch?.[1]?.replace(/&/g, '&') || `https://assets.siemens.com/images/${ref.toLowerCase()}.jpg`,
      pdf_url: pdfUrl,
      precio: 0
    };
  } catch (err) {
    log(`  ❌ Error obteniendo datos para ${ref}: ${err.message}`);
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  SCRAPER SIEMENS — INTERRUPTORES MAGNETOTÉRMICOS');
  console.log('='.repeat(70));
  
  if (DRY_RUN) log('🔍 MODO DRY-RUN: No se guardarán datos en DB');
  if (GAMA_FILTER) log(`🎯 Filtrando por gama: ${GAMA_FILTER}`);
  log(`📦 Máx productos por gama: ${MAX_PRODUCTS}`);
  log(`⏱️ Delay entre requests: ${DELAY_MS}ms`);
  log(`🔄 Reintentos: ${RETRIES}`);
  
  const productsCount = await getProductsCount();
  log(`📋 Productos actuales en DB: ${productsCount}`);
  
  // Verificar/crear marca Siemens
  BRAND_ID = await getSiemensBrandId();
  log(`🏷️ Siemens brand_id: ${BRAND_ID}`);
  
  const gamasToScrape = GAMA_FILTER 
    ? { [GAMA_FILTER]: GAMAS[GAMA_FILTER] }
    : GAMAS;
  
  const results = {
    total: 0,
    saved: 0,
    skipped: 0,
    errors: 0,
    byGama: {}
  };
  
  for (const [key, gamaConfig] of Object.entries(gamasToScrape)) {
    if (!gamaConfig) {
      log(`⚠️ Gama "${key}" no encontrada. Disponibles: ${Object.keys(GAMAS).join(', ')}`);
      continue;
    }
    
    results.byGama[key] = { total: 0, saved: 0, skipped: 0, errors: 0 };
    
    log(`\n📂 Gama: ${gamaConfig.name} (${gamaConfig.desc})`);
    
    // Generar referencias para esta gama
    const prefix = gamaConfig.prefix;
    const refs = generateRefs(prefix, MAX_PRODUCTS);
    log(`   📋 ${refs.length} referencias generadas para probar`);
    
    // Procesar cada referencia
    for (let i = 0; i < refs.length; i++) {
      const ref = refs[i];
      
      // Verificar si ya existe
      const exists = await checkRefExists(ref);
      if (exists) {
        log(`  [${i + 1}/${refs.length}] ⏭️ ${ref} ya existe`);
        results.skipped++;
        results.byGama[key].skipped++;
        continue;
      }
      
      // Obtener datos del producto
      const productData = await getProductData(ref);
      
      if (!productData) {
        log(`  [${i + 1}/${refs.length}] ❌ ${ref} sin datos / no disponible`);
        results.errors++;
        results.byGama[key].errors++;
        continue;
      }
      
      results.total++;
      results.byGama[key].total++;
      
      log(`  [${i + 1}/${refs.length}] ✅ ${productData.ref_fabricante} | ${productData.name?.substring(0, 55) || 'sin nombre'}`);
      if (productData.pdf_url) log(`    📄 PDF: ${productData.pdf_url.substring(0, 70)}`);
      
      // Guardar en Supabase
      if (!DRY_RUN) {
        try {
          await insertProduct(productData);
          results.saved++;
          results.byGama[key].saved++;
        } catch (err) {
          log(`    ❌ Error guardando: ${err.message}`);
          results.errors++;
          results.byGama[key].errors++;
        }
      } else {
        results.saved++;
        results.byGama[key].saved++;
      }
      
      // Delay entre productos
      if (i < refs.length - 1 && DELAY_MS > 0) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }
  }
  
  // ─── Resumen ───────────────────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('  RESUMEN SCRAPER SIEMENS');
  console.log('='.repeat(70));
  console.log(`  📦 Total procesados: ${results.total}`);
  console.log(`  💾 Guardados: ${results.saved}`);
  console.log(`  ⏭️ Saltados (ya existían): ${results.skipped}`);
  console.log(`  ❌ Errores/productos no disponibles: ${results.errors}`);
  console.log('');
  
  for (const [key, stats] of Object.entries(results.byGama)) {
    console.log(`  ${GAMAS[key]?.name || key}: ${stats.total} procesados, ${stats.saved} guardados, ${stats.skipped} saltados, ${stats.errors} errores`);
  }
  
  // Guardar reporte
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
  log(`\n📄 Reporte: ${REPORT_FILE}`);
  log(`📋 Log: ${LOG_FILE}`);
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err);
  process.exit(1);
});
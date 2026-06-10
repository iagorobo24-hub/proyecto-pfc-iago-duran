/**
 * SCRAPER SIEMENS — INTERRUPTORES MAGNETOTÉRMICOS (Playwright)
 * 
 * Siemens no expone una API pública como Schneider Electric.
 * Estrategia con Playwright:
 * 1. Navegar por el sitio de Siemens con browser automation
 * 2. Buscar productos usando el buscador interno de Siemens
 * 3. Extraer datos de las páginas de producto renderizadas con JS
 * 4. Verificar disponibilidad y extraer imagen/PDF
 * 
 * Gamas principales de Siemens interruptores:
 * - 5SL6: Miniature Circuit Breakers (MCB) - series standard
 * - 5SY7: Miniature Circuit Breakers - gama superior
 * - 5SY4: Interruptores magnetotérmicos industrial
 * - 3VA2: Molded Case Circuit Breakers (MCCB)
 * 
 * Uso:
 *   node scripts/scrape-siemens.mjs                    # Todas las gamas
 *   node scripts/scrape-siemens.mjs --gama=sl6         # Solo 5SL6
 *   node scripts/scrape-siemens.mjs --dry-run          # Sin guardar en DB
 *   node scripts/scrape-siemens.mjs --max=10           # Máx productos por gama
 *   node scripts/scrape-siemens.mjs --delay=2000       # Delay entre productos (ms)
 */

import { insertProduct, checkRefExists, getProductsCount } from './lib/supabase-sonex.js';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// ─── Configuración de gamas ─────────────────────────────
const GAMAS = {
  sl6: { 
    name: '5SL6 Miniature Circuit Breaker', 
    prefix: '5SL6', 
    searchQuery: '5SL6 interruptor magnetotermico',
    desc: 'MCB estándar, 6kA, 1-4 polos, B/C curva'
  },
  sy7: { 
    name: '5SY7 Miniature Circuit Breaker', 
    prefix: '5SY7', 
    searchQuery: '5SY7 interruptor magnetotermico',
    desc: 'MCB gama superior, 10kA, 1-4 polos'
  },
  sy4: { 
    name: '5SY4 Miniature Circuit Breaker', 
    prefix: '5SY4', 
    searchQuery: '5SY4 interruptor magnetotermico',
    desc: 'MCB industrial, 6kA'
  },
  va2: {
    name: '3VA2 Molded Case Circuit Breaker',
    prefix: '3VA2',
    searchQuery: '3VA2 interruptor en caja moldeada',
    desc: 'MCCB, 15-1600A, industrial'
  }
};

const FAMILIA = 'Distribución de potencia';
const MARCA = 'Siemens';
let BRAND_ID = null;
const BASE_URL = 'https://new.siemens.com/es/es.html';
const SEARCH_URL = 'https://new.siemens.com/es/es/busca';

// ─── Parse args ─────────────────────────────────────────
const args = process.argv.slice(2);
const GAMA_FILTER = args.find(a => a.startsWith('--gama='))?.split('=')[1];
const DRY_RUN = args.includes('--dry-run');
const MAX_PRODUCTS = parseInt(args.find(a => a.startsWith('--max='))?.split('=')[1] || '20');
const DELAY_MS = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] || '2000');
const RETRIES = parseInt(args.find(a => a.startsWith('--retries='))?.split('=')[1] || '2');

const LOG_FILE = path.join(import.meta.dirname, 'scrape-siemens.log');
const REPORT_FILE = path.join(import.meta.dirname, 'scrape-siemens-report.json');

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// ─── Decodificación de referencias Siemens ──────────────────
const POLE_MAP = { '1': '1P', '2': '2P', '3': '3P', '4': '4P' };
const CURVE_MAP = { '1': 'B', '6': 'C' };
const AMPS = {
  '01': 1, '02': 2, '03': 3, '04': 4, '06': 6, '10': 10,
  '13': 13, '16': 16, '20': 20, '25': 25, '32': 32, '40': 40, '50': 50, '63': 63
};

function decodeSiemensRef(ref) {
  if (!ref) return null;
  const match = ref.match(/^(5SL[4-7]|5SY[47]|3VA[0-9])([1-4])([16])(\d{2})-(\d)$/);
  if (!match) return null;
  
  const [, prefix, pole, curve, ampStr, suffix] = match;
  const poles = POLE_MAP[pole] || `${pole}P`;
  const curveName = CURVE_MAP[curve] || 'B';
  const amps = AMPS[ampStr] || parseInt(ampStr) || 0;
  
  const subgama = `${prefix} ${curveName} curva`;
  const kA = prefix === '5SY7' ? '10kA' : '6kA';
  
  return {
    prefix,
    Gama: prefix.substring(0, 4),
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

// ─── Obtener brand_id de Siemens ───────────────────────────────
async function getSiemensBrandId() {
  try {
    const res = await fetch('https://fncmzrnmzmuhlullkrud.supabase.co/rest/v1/brands', {
      headers: {
        'apikey': process.env.SONEX_SUPABASE_KEY,
        'Authorization': `Bearer ${process.env.SONEX_SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (res.ok) {
      const brands = await res.json();
      const siemens = brands.find(b => b.name?.toLowerCase().includes('siemens'));
      if (siemens) return siemens.id;
    }
  } catch (err) {
    log(`  ⚠️ Error obteniendo brand_id: ${err.message}`);
  }
  return 457; // Fallback
}

// ─── Scraper con Playwright ─────────────────────────────────────
async function scrapeWithPlaywright(searchQuery, maxProducts) {
  let browser;
  let page;
  const products = [];
  
  try {
    log(`  🌐 Iniciando browser para buscar: "${searchQuery}"`);
    
    // Lanzar browser headless
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    page = await context.newPage();
    
    // Ir a la página de búsqueda de Siemens
    const searchPageUrl = `${SEARCH_URL}?q=${encodeURIComponent(searchQuery)}`;
    log(`  🔍 Navegando a: ${searchPageUrl}`);
    
    await page.goto(searchPageUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Esperar a que carguen los resultados
    await page.waitForSelector('.product-card, .result-item, [data-product], .search-result', { timeout: 10000 }).catch(() => {
      log('  ⚠️ No se encontraron selectores comunes, intentando con cualquier producto');
    });
    
    // Extraer todos los productos de la página
    const productElements = await page.$$('.product-card, .result-item, .product-item, [class*="product"][class*="card"], [class*="search"][class*="result"]');
    
    log(`  📋 ${productElements.length} elementos de producto encontrados`);
    
    for (let i = 0; i < Math.min(productElements.length, maxProducts); i++) {
      const el = productElements[i];
      
      try {
        // Extraer datos del elemento
        const ref = await el.$eval('[data-ref], [data-article], .product-ref, h3 a, .product-title', el2 => {
          return el2.getAttribute('data-ref') || 
                 el2.getAttribute('data-article') || 
                 el2.getAttribute('data-ref-number') ||
                 el2.textContent?.match(/(5SL|5SY|3VA)[0-9]+/i)?.[0] || 
                 null;
        }).catch(() => null);
        
        if (!ref) {
          log(`    [${i + 1}] ⚠️ Sin referencia válida`);
          continue;
        }
        
        // Normalizar referencia
        const normalizedRef = ref.toUpperCase().replace(/\s/g, '');
        const decoded = decodeSiemensRef(normalizedRef);
        
        if (!decoded) {
          log(`    [${i + 1}] ⚠️ Referencia no válida: ${normalizedRef}`);
          continue;
        }
        
        // Extraer nombre
        const name = await el.$eval('.product-title, h3, .product-name, [class*="title"]', el2 => el2.textContent?.trim()).catch(() => decoded.name);
        
        // Extraer imagen
        const imageUrl = await el.$eval('img', el2 => el2.getAttribute('src') || el2.getAttribute('data-src')).catch(() => null);
        
        log(`    [${i + 1}] ✅ ${normalizedRef} | ${name?.substring(0, 50) || 'sin nombre'}`);
        
        products.push({
          ref_fabricante: normalizedRef,
          name: decoded.name,
          marca: MARCA,
          brand_id: BRAND_ID,
          familia: FAMILIA,
          subfamilia: decoded.subfamilia,
          tipo: decoded.tipo,
          Gama: decoded.Gama,
          Subgama: decoded.Subgama,
          imagen: imageUrl,
          pdf_url: null, // Se extraería en página de detalle
          precio: 0
        });
        
      } catch (err) {
        log(`    [${i + 1}] ❌ Error extrayendo datos: ${err.message}`);
      }
    }
    
  } catch (err) {
    log(`  ❌ Error en Playwright: ${err.message}`);
    throw err;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  return products;
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  SCRAPER SIEMENS — INTERRUPTORES MAGNETOTÉRMICOS (Playwright)');
  console.log('='.repeat(70));
  
  if (DRY_RUN) log('🔍 MODO DRY-RUN: No se guardarán datos en DB');
  if (GAMA_FILTER) log(`🎯 Filtrando por gama: ${GAMA_FILTER}`);
  log(`📦 Máx productos por gama: ${MAX_PRODUCTS}`);
  log(`⏱️ Delay entre productos: ${DELAY_MS}ms`);
  
  const productsCount = await getProductsCount();
  log(`📋 Productos actuales en DB: ${productsCount}`);
  
  // Obtener brand_id
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
    log(`   🔍 Query de búsqueda: "${gamaConfig.searchQuery}"`);
    
    try {
      // Scrapear con Playwright
      const products = await scrapeWithPlaywright(gamaConfig.searchQuery, MAX_PRODUCTS);
      
      log(`   ✅ ${products.length} productos extraídos`);
      
      // Procesar cada producto
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const ref = product.ref_fabricante;
        
        // Verificar si ya existe
        const exists = await checkRefExists(ref);
        if (exists) {
          log(`  [${i + 1}/${products.length}] ⏭️ ${ref} ya existe`);
          results.skipped++;
          results.byGama[key].skipped++;
          continue;
        }
        
        results.total++;
        results.byGama[key].total++;
        
        // Guardar en DB
        if (!DRY_RUN) {
          try {
            await insertProduct(product);
            results.saved++;
            results.byGama[key].saved++;
            log(`  [${i + 1}/${products.length}] 💾 ${ref} guardado`);
          } catch (err) {
            log(`  [${i + 1}/${products.length}] ❌ Error guardando ${ref}: ${err.message}`);
            results.errors++;
            results.byGama[key].errors++;
          }
        } else {
          results.saved++;
          results.byGama[key].saved++;
          log(`  [${i + 1}/${products.length}] ✅ ${ref} (dry-run)`);
        }
        
        // Delay entre productos
        if (i < products.length - 1 && DELAY_MS > 0) {
          await new Promise(r => setTimeout(r, DELAY_MS));
        }
      }
      
    } catch (err) {
      log(`  ❌ Error scrapeando gama ${key}: ${err.message}`);
      results.byGama[key].errors += MAX_PRODUCTS; // Aproximado
    }
  }
  
  // ─── Resumen ───────────────────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('  RESUMEN SCRAPER SIEMENS (Playwright)');
  console.log('='.repeat(70));
  console.log(`  📦 Total procesados: ${results.total}`);
  console.log(`  💾 Guardados: ${results.saved}`);
  console.log(`  ⏭️ Saltados (ya existían): ${results.skipped}`);
  console.log(`  ❌ Errores: ${results.errors}`);
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
  console.error('\n💥 Error fatal:', err.message);
  process.exit(1);
});
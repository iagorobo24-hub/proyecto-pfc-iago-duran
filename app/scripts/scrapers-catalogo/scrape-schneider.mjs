/**
 * SCRAPER SCHNEIDER ELECTRIC — INTERRUPTORES (fetch nativo)
 * 
 * Usa las APIs internas de Schneider Electric con fetch nativo de Node.js:
 * 1. Range API: /ranges/{id}/products → product IDs
 * 2. Product page fetch → title, description, image from meta tags
 * 3. Product card API → PDF URL
 * 
 * Guarda en tabla `products` de Supabase SONEX.
 * 
 * Uso:
 *   node scripts/scrape-schneider.mjs                    # Todas las gamas
 *   node scripts/scrape-schneider.mjs --gama=ic60        # Solo iC60
 *   node scripts/scrape-schneider.mjs --gama=nsx         # Solo NSX
 *   node scripts/scrape-schneider.mjs --dry-run          # Sin guardar en DB
 *   node scripts/scrape-schneider.mjs --max=10           # Máx productos por gama
 *   node scripts/scrape-schneider.mjs --delay=1000       # Delay entre requests (ms)
 */

import { insertProduct, checkRefExists, getProductsCount } from '../lib/supabase-sonex.js';
import fs from 'fs';
import path from 'path';

// ─── Configuración de gamas ─────────────────────────
const GAMAS = {
  // VERIFICADOS Mayo 2026 — IDs confirmados via /ranges/{id}/products API
  ic60:     { name: 'Acti 9 iC60',                        rangeId: '7556' },
  vigi:     { name: 'Acti 9 Vigi para iC60',               rangeId: '7558' },
  iid:      { name: 'Interruptor diferencial Acti 9 iID',  rangeId: '7559' },
  id:       { name: 'iD',                                  rangeId: '7560' },  // A9Z (ID K differential)
  iprc:     { name: 'iPRC - iPRI',                        rangeId: '7562' },  // A9L (iPF surge)
  ict:      { name: 'Acti 9 iCT',                         rangeId: '7563' },  // A9C (contactors)
  itl:      { name: 'iTL',                                rangeId: '7564' },  // A9C (timers/telerruptors)
  isw:      { name: 'iSW',                                rangeId: '7566' },  // A9S (switches)
  c60ul:    { name: 'C60 UL CSA IEC',                     rangeId: '1104' },
  icv40:    { name: 'Acti9 iCV40',                        rangeId: '65400' },
  nsx:      { name: 'ComPacT NSX',                        rangeId: '39910531' },
  resi9:    { name: 'Resi9',                              rangeId: '61364' },  // R9F/R9P residential
  c60h_dc:  { name: 'Acti 9 C60H-DC y C60PV-DC',          rangeId: '61095' }, // A9N DC breakers
  iprd_dc:  { name: 'Limitador sobretensiones iPRD-DC',   rangeId: '61710' }, // A9L DC surge
  rearmador:{ name: 'Rearmador diferencial',               rangeId: '61712' }, // A9C ARA reclosers

  // RANGES NO DISPONIBLES en la API pública (Mayo 2026):
  // iC40 — No existe como rango separado (CT iC40 está dentro de iCT)
  // iAT — No encontrado; buscar en IDs > 100000
  // iPR iCR — No encontrado en rango IDs accesibles
  // Int.Seccionador — No encontrado; ID 61053 = M8650 power monitors
  // iDPN — No disponible en web española
  // MTZ (63545), iARC (61532) — existen pero API devuelve 0
  //
  // iK60 — Range ID real: 7557 (NO 7569). Bloqueado por Akamai WAF.
  //        Usar scrape-schneider-ik60.mjs (generación de referencias).
};

const FAMILIA = 'Distribución de potencia';
const MARCA = 'Schneider Electric';
const BASE_URL = 'https://www.se.com';

// ─── Parse args ─────────────────────────────────────────────────
const args = process.argv.slice(2);
const GAMA_FILTER = args.find(a => a.startsWith('--gama='))?.split('=')[1];
const DRY_RUN = args.includes('--dry-run');
const MAX_PRODUCTS = parseInt(args.find(a => a.startsWith('--max='))?.split('=')[1] || '50');
const DELAY_MS = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] || '300');
const RETRIES = parseInt(args.find(a => a.startsWith('--retries='))?.split('=')[1] || '3');

const LOG_FILE = path.join(import.meta.dirname, 'scrape-schneider.log');
const REPORT_FILE = path.join(import.meta.dirname, 'scrape-schneider-report.json');

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
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

// ─── Extraer Gama y Subgama del nombre ────────────────────────────
function extractGamaSubgama(name) {
  if (!name) return { Gama: null, Subgama: null };
  const n = name.toUpperCase();
  
  // ComPacT NSX (check first - most specific)
  if (n.includes('COMPACT NSX') || n.includes('COMPACTNSX') || n.includes('NSX')) {
    const nsxMatch = n.match(/NSX(\d+[A-Z]?)/);
    return {
      Gama: 'ComPacT NSX',
      Subgama: nsxMatch ? 'NSX' + nsxMatch[1] : 'NSX'
    };
  }
  
  // Acti 9 Vigi para iC60 (check BEFORE iC60 - Vigi names contain IC60)
  if (n.includes('VIGI') || n.includes('BLOQUE DIFERENCIAL') || n.includes('EARTH LEAKAGE')) {
    if (n.includes('QUICK VIGI') || n.includes('QUICKVIGI')) return { Gama: 'Acti 9 Vigi para iC60', Subgama: 'Quick Vigi' };
    return { Gama: 'Acti 9 Vigi para iC60', Subgama: 'Vigi' };
  }
  
  // iD (Acti9 ID K differential — check BEFORE iID since names contain RCCB/INTERRUPTOR DIFERENCIAL)
  if (n.includes('ID K') || n.includes('ID-K') || n.includes('ACTI9 ID') || n.includes('ACTI 9 ID')) {
    return { Gama: 'iD', Subgama: 'iD' };
  }
  
  // Acti 9 iC60
  if (n.includes('IC60') || n.includes('IC 60')) {
    if (n.includes('IC60L') || n.includes('IC60 L')) return { Gama: 'Acti 9 iC60', Subgama: 'iC60L' };
    if (n.includes('IC60H') || n.includes('IC60 H')) return { Gama: 'Acti 9 iC60', Subgama: 'iC60H' };
    if (n.includes('IC60N') || n.includes('IC60 N')) return { Gama: 'Acti 9 iC60', Subgama: 'iC60N' };
    return { Gama: 'Acti 9 iC60', Subgama: 'iC60' };
  }
  
  // Interruptor diferencial Acti 9 iID
  if (n.includes('IID') || n.includes('RCCB') || n.includes('INTERRUPTOR DIFERENCIAL') || n.includes('DISYUNTOR')) {
    if (n.includes('100A') || n.includes('80A')) return { Gama: 'Interruptor diferencial Acti 9 iID', Subgama: 'iID 80-100A' };
    if (n.includes('63A') || n.includes('40A') || n.includes('25A')) return { Gama: 'Interruptor diferencial Acti 9 iID', Subgama: 'iID 25-63A' };
    return { Gama: 'Interruptor diferencial Acti 9 iID', Subgama: 'iID' };
  }
  
  // Resi9 (check BEFORE iSW — Resi9 names contain "INTERRUPTOR")
  if (n.includes('RESI9') || n.includes('RESI 9')) {
    return { Gama: 'Resi9', Subgama: 'Resi9' };
  }
  
  // iSW
  if (n.includes('ISW') || n.includes('INTERRUPTOR EN CARGA') || (n.includes('INTERRUPTOR') && !n.includes('AUTOMATICO') && !n.includes('DIFERENCIAL') && !n.includes('SECCIONADOR'))) {
    if (n.includes('PILOTO')) return { Gama: 'iSW', Subgama: 'iSW con piloto' };
    if (n.includes('100A') || n.includes('125A')) return { Gama: 'iSW', Subgama: 'iSW 100-125A' };
    if (n.includes('40A')) return { Gama: 'iSW', Subgama: 'iSW 40A' };
    if (n.includes('20A') || n.includes('32A')) return { Gama: 'iSW', Subgama: 'iSW 20-32A' };
    return { Gama: 'iSW', Subgama: 'iSW' };
  }
  
  // iCT
  if (n.includes('CONTACTOR') || n.includes('ICT')) {
    if (n.includes('CT IC40') || n.includes('CTI C40')) return { Gama: 'Acti 9 iCT', Subgama: 'CT iC40' };
    if (n.includes('63 A') || n.includes('63A')) return { Gama: 'Acti 9 iCT', Subgama: 'iCT 63A' };
    if (n.includes('40 A') || n.includes('40A')) return { Gama: 'Acti 9 iCT', Subgama: 'iCT 40A' };
    if (n.includes('25 A') || n.includes('25A')) return { Gama: 'Acti 9 iCT', Subgama: 'iCT 25A' };
    return { Gama: 'Acti 9 iCT', Subgama: 'iCT' };
  }
  
  // iCV40
  if (n.includes('ICV40')) {
    if (n.includes('ICV40N') || n.includes('ICV40 N')) return { Gama: 'Acti9 iCV40', Subgama: 'iCV40N' };
    return { Gama: 'Acti9 iCV40', Subgama: 'iCV40' };
  }
  
  // C60 UL CSA IEC (Multi 9)
  if (n.includes('MULTI 9') || n.includes('MULTI9') || n.includes('C60')) {
    if (n.includes('C60BPR')) return { Gama: 'C60 UL CSA IEC', Subgama: 'C60BPR' };
    if (n.includes('C60BP')) return { Gama: 'C60 UL CSA IEC', Subgama: 'C60BP' };
    if (n.includes('C60SP')) return { Gama: 'C60 UL CSA IEC', Subgama: 'C60SP' };
    if (n.includes('C60H-DC')) return { Gama: 'C60 UL CSA IEC', Subgama: 'C60H-DC' };
    if (n.includes('C60L')) return { Gama: 'C60 UL CSA IEC', Subgama: 'C60L' };
    if (n.includes('C60H')) return { Gama: 'C60 UL CSA IEC', Subgama: 'C60H' };
    if (n.includes('C60N')) return { Gama: 'C60 UL CSA IEC', Subgama: 'C60N' };
    if (n.includes('N40N')) return { Gama: 'C60 UL CSA IEC', Subgama: 'N40N' };
    if (n.includes('N40VIGI')) return { Gama: 'C60 UL CSA IEC', Subgama: 'N40Vigi' };
    return { Gama: 'C60 UL CSA IEC', Subgama: 'C60' };
  }
  
  // iC40
  if (n.includes('IC40') || n.includes('IC 40')) {
    return { Gama: 'iC40', Subgama: 'iC40' };
  }
  
  // iPR iCR
  if (n.includes('ICR') || n.includes('IPR') || (n.includes('CONTROLADOR DE POTENCIA'))) {
    return { Gama: 'iPR iCR', Subgama: n.includes('ICR') ? 'iCR' : 'iPR' };
  }
  
  // Resi9
  if (n.includes('RESI9')) {
    return { Gama: 'Resi9', Subgama: 'Resi9' };
  }
  
  // iPRD-DC (limitador sobretensiones DC)
  if (n.includes('IPRD') || n.includes('IPRD-DC')) {
    return { Gama: 'Limitador sobretensiones iPRD-DC', Subgama: 'iPRD-DC' };
  }
  
  // Rearmador diferencial
  if (n.includes('REARMADOR') || n.includes('REARM') || n.includes('INTELIGENTE DIFERENCIAL')) {
    return { Gama: 'Rearmador diferencial', Subgama: 'Rearmador' };
  }
  
  // iAT (transferencia automática)
  if (n.includes('IAT') || n.includes('INTERRUPTOR DE TRANSFERENCIA') || n.includes('TRANSFERENCIA AUTOMATICA')) {
    return { Gama: 'iAT', Subgama: 'iAT' };
  }
  
  // Interruptor-seccionador
  if (n.includes('SECCIONADOR')) {
    if (n.includes('INTERRUPTOR-SECCIONADOR') || n.includes('INTERRUPTOR SECCIONADOR')) return { Gama: 'Interruptor-seccionador', Subgama: 'Interruptor-seccionador' };
    return { Gama: 'Interruptor-seccionador', Subgama: 'Seccionador' };
  }
  
  // iTL (telerruptor, temporizador)
  if (n.includes('ITL') || n.includes('TL40') || n.includes('TLI')) {
    if (n.includes('TL40')) return { Gama: 'iTL', Subgama: 'TL40' };
    if (n.includes('TLI')) return { Gama: 'iTL', Subgama: 'TLI' };
    if (n.includes('ITLS')) return { Gama: 'iTL', Subgama: 'iTLs' };
    if (n.includes('ITLC')) return { Gama: 'iTL', Subgama: 'iTLc' };
    if (n.includes('ITLM')) return { Gama: 'iTL', Subgama: 'iTLm' };
    if (n.includes('ITLI')) return { Gama: 'iTL', Subgama: 'iTLi' };
    return { Gama: 'iTL', Subgama: 'iTL' };
  }
  
  // iPRC - iPRI (fallback - limitadores sobretensiones)
  if (n.includes('IPRC') || n.includes('IPF') || n.includes('PRC')) {
    if (n.includes('IPF')) return { Gama: 'iPRC - iPRI', Subgama: 'iPF' };
    return { Gama: 'iPRC - iPRI', Subgama: 'iPRC' };
  }
  
  // iD (fallback)
  if (n.includes('ID ') || n.includes(' IID')) {
    return { Gama: 'iD', Subgama: 'iD' };
  }
  
  // iK60 (check before returning null — IK60 might appear in names)
  if (n.includes('IK60') || n.includes('IK 60') || n.includes('K60N') || n.includes('K60H')) {
    if (n.includes('K60H') || n.includes('IK60H') || n.includes('IK 60H')) return { Gama: 'Acti 9 iK60', Subgama: 'iK60H' };
    return { Gama: 'Acti 9 iK60', Subgama: 'iK60N' };
  }
  
  return { Gama: null, Subgama: null };
}

// ─── Determinar subfamilia según Gama ──────────────────────────────────
function extractSubfamilia(Gama) {
  if (!Gama) return 'Interruptor Magnetotérmico';
  
  // Elementos de CONTROL (NO son interruptores magnetotérmicos)
  if (Gama === 'Acti 9 iCT') return 'Contactor';
  if (Gama === 'iTL') return 'Elemento de Control';
  if (Gama === 'Acti9 iCV40') return 'Contactor';
  
  // Accesorios (NO son interruptores magnetotérmicos)
  if (Gama === '(sin Gama)' || !Gama) {
    return 'Accesorio';
  }
  
  // Por defecto: interruptores magnetotérmicos
  return 'Interruptor Magnetotérmico';
}

// ─── Determinar tipo (subfamilia física) ──────────────────────────
function extractTipo(name) {
  if (!name) return 'CARRIL DIN';
  const n = name.toUpperCase();
  if (n.includes('COMPACT NSX') || n.includes('COMPACTNSX') || n.includes('NSX')) {
    return 'CAJA MOLDEADA';
  }
  return 'CARRIL DIN';
}

// ─── Extraer datos de producto ───────────────────────────────────
async function getProductData(ref, gamaConfig) {
  try {
    // 1. Fetch product page HTML and extract meta tags
    const pageRes = await fetchWithRetry(`${BASE_URL}/es/es/product/${ref}/`);
    const html = await pageRes.text();
    
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    const productIdMatch = html.match(/<meta\s+name="product-id"\s+content="([^"]+)"/i);
    
    let title = titleMatch?.[1]?.replace(/\s*\|\s*Schneider.*$/, '')?.trim() || ref;
    const name = title.replace(/^[\w-]+\s*-\s*/, '').trim();
    
    const pageData = {
      ref_fabricante: productIdMatch?.[1] || ref,
      name: name || title,
      imagen: imageMatch?.[1]?.replace(/&amp;/g, '&') || null,
    };
    
    // 2. Fetch product card API for PDF URL
    const cardRes = await fetchWithRetry(`${BASE_URL}/products-card/secondary?brand=se&country-code=es&language-code=es&ids=${ref}`);
    const cardJson = await cardRes.json();
    
    const pdfDoc = cardJson.productAdditionalInfos?.[0]?.documents?.find(d => 
      d.documentType === 'Product Data Sheet' || d.title?.includes('Hoja de datos')
    );
    
    // 3. Extract Gama, Subgama, tipo, subfamilia from name
    const { Gama, Subgama } = extractGamaSubgama(pageData.name);
    const tipo = extractTipo(pageData.name);
    const subfamilia = extractSubfamilia(Gama);
    
    return {
      ref_fabricante: pageData.ref_fabricante,
      name: pageData.name,
      marca: MARCA,
      brand_id: 456,
      familia: FAMILIA,
      subfamilia: subfamilia,
      tipo: tipo,
      Gama: Gama,
      Subgama: Subgama,
      imagen: pageData.imagen,
      pdf_url: pdfDoc?.url ? `${BASE_URL}${pdfDoc.url}` : null,
      precio: 0,
    };
  } catch (err) {
    log(`  ⚠️ Error getting data for ${ref}: ${err.message}`);
    return null;
  }
}

// ─── Get product IDs from range API ──────────────────────────────
async function getRangeProductIds(rangeId, maxProducts) {
  const allIds = [];
  let offset = 0;
  const pageSize = 50;
  
  while (allIds.length < maxProducts) {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/ranges/${rangeId}/products?brand=se&country-code=es&language-code=es&No=${offset}&Nrpp=${pageSize}`);
      const data = await res.json();
      
      if (!data.productIds || data.productIds.length === 0) break;
      
      allIds.push(...data.productIds);
      offset += pageSize;
      
      if (data.productIds.length < pageSize) break;
    } catch (err) {
      log(`  ⚠️ Error fetching range page at offset ${offset}: ${err.message}`);
      break;
    }
  }
  
  return allIds.slice(0, maxProducts);
}

// ─── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  SCRAPER SCHNEIDER ELECTRIC — INTERRUPTORES (fetch)');
  console.log('='.repeat(70));
  
  if (DRY_RUN) log('🔍 MODO DRY-RUN: No se guardarán datos en DB');
  if (GAMA_FILTER) log(`🎯 Filtrando por gama: ${GAMA_FILTER}`);
  log(`📦 Máx productos por gama: ${MAX_PRODUCTS}`);
  log(`⏱️ Delay entre requests: ${DELAY_MS}ms`);
  log(`🔄 Reintentos: ${RETRIES}`);

  const productsCount = await getProductsCount();
  log(`📋 Productos actuales en DB: ${productsCount}`);

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

    // 1. Get product IDs from range API
    log(`\n📂 Gama: ${gamaConfig.name} (range ID: ${gamaConfig.rangeId})`);
    const productIds = await getRangeProductIds(gamaConfig.rangeId, MAX_PRODUCTS);
    log(`   📋 ${productIds.length} productos encontrados`);

    // 2. Process each product
    for (let i = 0; i < productIds.length; i++) {
      const ref = productIds[i];
      
      // Verificar si ya existe
      const exists = await checkRefExists(ref);
      if (exists) {
        log(`  [${i + 1}/${productIds.length}] ⏭️ ${ref} ya existe`);
        results.skipped++;
        results.byGama[key].skipped++;
        continue;
      }

      // Get product data
      const productData = await getProductData(ref, gamaConfig);
      
      if (!productData) {
        log(`  [${i + 1}/${productIds.length}] ❌ ${ref} sin datos`);
        results.errors++;
        results.byGama[key].errors++;
        continue;
      }

      results.total++;
      results.byGama[key].total++;

      log(`  [${i + 1}/${productIds.length}] ✅ ${productData.ref_fabricante} | ${productData.name?.substring(0, 60) || 'sin nombre'}`);
      if (productData.pdf_url) log(`    📄 PDF: ${productData.pdf_url.substring(0, 80)}`);
      if (productData.imagen) log(`    🖼️ Imagen: ${productData.imagen.substring(0, 60)}`);

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
      if (i < productIds.length - 1 && DELAY_MS > 0) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }
  }

  // ─── Resumen ───────────────────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('  RESUMEN SCRAPER SCHNEIDER ELECTRIC');
  console.log('='.repeat(70));
  console.log(`  📦 Total scrapeados: ${results.total}`);
  console.log(`  💾 Guardados: ${results.saved}`);
  console.log(`  ⏭️ Saltados (ya existían): ${results.skipped}`);
  console.log(`  ❌ Errores: ${results.errors}`);
  console.log('');

  for (const [key, stats] of Object.entries(results.byGama)) {
    console.log(`  ${GAMAS[key]?.name || key}: ${stats.total} scrapeados, ${stats.saved} guardados, ${stats.skipped} saltados, ${stats.errors} errores`);
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

/**
 * SCRAPER COMPLETO SCHNEIDER ELECTRIC — Todas las familias/gamas
 * 
 * Fases:
 *   1. fetch-ids — Obtiene product IDs de todas las ranges vía fetch nativo (o Playwright como fallback)
 *   2. scrape-details — Por cada product ID, extrae metadatos + URL PDF y guarda en Supabase
 * 
 * Clasificación:
 *   - familia (nivel alto): DISTRIBUCION DE POTENCIA, CONTROL Y SEÑALIZACION, CONTACTORIA Y ARRANQUE...
 *   - subfamilia: tipo de producto (Interruptor, Contactor, PLC, Variador...)
 *   - Gama: línea de producto (ComPacT NSX, TeSys D, Harmony XB4...)
 *   - Subgama: variante específica (opcional)
 * 
 * Uso:
 *   node scripts/scrape-schneider-complete.mjs --phase=fetch-ids     # Solo obtener IDs
 *   node scripts/scrape-schneider-complete.mjs --phase=scrape         # Solo scrapear detalles
 *   node scripts/scrape-schneider-complete.mjs --phase=all            # Completo (defecto)
 *   node scripts/scrape-schneider-complete.mjs --gama=tesys-d-deca    # Gama específica
 *   node scripts/scrape-schneider-complete.mjs --proxy=http://x:8080  # Con proxy
 *   node scripts/scrape-schneider-complete.mjs --resume               # Reanudar desde errores
 *   node scripts/scrape-schneider-complete.mjs --dry-run --limit=5    # Prueba (5 prod por gama)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { insertProduct, checkRefExists, getProductsCount } from '../lib/supabase-sonex.js';

// ─── Config ───────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data', 'range-ids');
const LOG_FILE = path.join(__dirname, 'scrape-schneider-complete.log');
const STATE_FILE = path.join(__dirname, 'scrape-state.json');

const BASE_URL = 'https://www.se.com';

const args = process.argv.slice(2);
const PHASE = args.find(a => a.startsWith('--phase='))?.split('=')[1] || 'all';
const GAMA_FILTER = args.find(a => a.startsWith('--gama='))?.split('=')[1];
const PROXY_URL = args.find(a => a.startsWith('--proxy='))?.split('=')[1];
const DRY_RUN = args.includes('--dry-run');
const RESUME = args.includes('--resume');
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0');
const DELAY_MS = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] || '500');
const BRAND_ID = 456;
const MARCA = 'Schneider Electric';

// ─── CATÁLOGO DE RANGES ──────────────────────────────────────────────────
const RANGES = [
  // ======== DISTRIBUCION DE POTENCIA (existente en DB) ========
  { id: '7556',  name: 'ic60',           familia: 'Distribución de potencia', subfamilia: 'Interruptor Magnetotérmico',           gama: 'Acti 9 iC60',           subgama: '' },
  { id: '39910531', name: 'compact-nsx',  familia: 'Distribución de potencia', subfamilia: 'Interruptor caja moldeada',          gama: 'ComPacT NSX',           subgama: '' },
  { id: '7558',  name: 'vigi',           familia: 'Distribución de potencia', subfamilia: 'Interruptor Diferencial',             gama: 'Acti 9 Vigi',           subgama: '' },
  { id: '7559',  name: 'iid',            familia: 'Distribución de potencia', subfamilia: 'Interruptor Diferencial',             gama: 'Acti 9 iID',            subgama: '' },
  { id: '7566',  name: 'isw',            familia: 'Distribución de potencia', subfamilia: 'Interruptor Seccionador',             gama: 'iSW',                   subgama: '' },
  { id: '7563',  name: 'ict',            familia: 'Distribución de potencia', subfamilia: 'Interruptor Diferencial',             gama: 'Acti 9 iCT',            subgama: '' },
  { id: '65400', name: 'icv40',          familia: 'Distribución de potencia', subfamilia: 'Interruptor Limitador',               gama: 'Acti 9 iCV40',          subgama: '' },
  { id: '1104',  name: 'c60ul',          familia: 'Distribución de potencia', subfamilia: 'Interruptor Magnetotérmico',           gama: 'C60 UL CSA IEC',        subgama: '' },
  { id: '61709', name: 'iprc',           familia: 'Distribución de potencia', subfamilia: 'Interruptor Seccionador',             gama: 'iPRC - iPRI',           subgama: '' },
  { id: '63545', name: 'masterpact-mtz', familia: 'Distribución de potencia', subfamilia: 'Interruptor baja tensión',            gama: 'MasterPact MTZ',        subgama: 'Configurable' },
  { id: '22928838', name: 'prisma-set-p', familia: 'Distribución de potencia', subfamilia: 'Caja Distribucion',        gama: 'PrismaSeT P',               subgama: '' },

  // ======== CONTROL Y SEÑALIZACION ========
  { id: '529',  name: 'timer-relay',      familia: 'Automatización', subfamilia: 'Elemento de Control',       gama: 'Relevadores Temporizadores', subgama: '' },
  { id: '532',  name: 'harmony-relay',    familia: 'Automatización', subfamilia: 'Elemento de Control',       gama: 'Harmony Relay',              subgama: '' },
  { id: '632',  name: 'harmony-xb4',      familia: 'Automatización', subfamilia: 'Pulsador/Selector',         gama: 'Harmony XB4',               subgama: '' },
  { id: '633',  name: 'harmony-xb5',      familia: 'Automatización', subfamilia: 'Pulsador/Selector',         gama: 'Harmony XB5',               subgama: '' },

  // ======== CONTACTORIA Y ARRANQUE ========
  { id: '664',   name: 'tesys-d-deca',    familia: 'Automatización', subfamilia: 'Contactor',                 gama: 'TeSys D/Deca',              subgama: '' },
  { id: '665',   name: 'tesys-f',         familia: 'Automatización', subfamilia: 'Contactor',                 gama: 'TeSys F',                   subgama: '' },
  { id: '684',   name: 'tesys-gv',        familia: 'Automatización', subfamilia: 'Guardamotor',               gama: 'TeSys GV',                  subgama: '' },
  { id: '65746', name: 'tesys-island',    familia: 'Automatización', subfamilia: 'Arrancador',                gama: 'TeSys island',              subgama: '' },
  { id: '1885',  name: 'tesys-lrd',       familia: 'Automatización', subfamilia: 'Relé Térmico',              gama: 'TeSys LRD',                 subgama: '' },
  { id: '1508',  name: 'tesys-t',         familia: 'Automatización', subfamilia: 'Sistema Gestión Motor',    gama: 'TeSys T',                   subgama: '' },

  // ======== CONTROL Y AUTOMATIZACION ========
  { id: '531',   name: 'zelio-logic',     familia: 'Automatización', subfamilia: 'PLC/Relé programable',    gama: 'Zelio Logic',               subgama: '' },
  { id: '1535',  name: 'phaseo-power',    familia: 'Automatización', subfamilia: 'Fuente alimentación',      gama: 'Phaseo',                    subgama: '' },
  { id: '2253',  name: 'altivar-12',      familia: 'Automatización', subfamilia: 'Variador velocidad',      gama: 'Altivar 12',                subgama: '' },
  { id: '62128', name: 'modicon-m221',    familia: 'Automatización', subfamilia: 'PLC',                     gama: 'Modicon M221',              subgama: '' },
  { id: '62129', name: 'modicon-m241',    familia: 'Automatización', subfamilia: 'PLC',                     gama: 'Modicon M241',              subgama: '' },
  { id: '62317', name: 'altivar-atv600',  familia: 'Automatización', subfamilia: 'Variador velocidad',      gama: 'Altivar ATV600',            subgama: '' },
  { id: '63440', name: 'altivar-320',     familia: 'Automatización', subfamilia: 'Variador velocidad',      gama: 'Altivar Machine ATV320',    subgama: '' },
  { id: '63441', name: 'altivar-340',     familia: 'Automatización', subfamilia: 'Variador velocidad',      gama: 'Altivar Machine ATV340',    subgama: '' },

  // ======== CANALIZACION ========
  { id: '1749',  name: 'canalis-kbb',     familia: 'Instalación',            subfamilia: 'Canalización prefabricada', gama: 'Canalis KBB',               subgama: '' },
  { id: '1753',  name: 'canalis-ks',      familia: 'Instalación',            subfamilia: 'Canalización prefabricada', gama: 'Canalis KS',                subgama: '' },
  { id: '63544', name: 'canalis-kr',      familia: 'Instalación',            subfamilia: 'Canalización prefabricada', gama: 'Canalis KR',                subgama: '' },

  // ======== MEDIDA Y CONTROL ========
  { id: '61273', name: 'iem3000',         familia: 'Distribución de potencia', subfamilia: 'Contador energía',          gama: 'PowerLogic iEM3000',        subgama: '' },
  { id: '61281', name: 'powerlogic-pm5000', familia: 'Distribución de potencia', subfamilia: 'Analizador redes',          gama: 'PowerLogic PM5000',         subgama: '' },
  { id: '62399', name: 'powerlogic-t300', familia: 'Distribución de potencia', subfamilia: 'Gateway comunicación',      gama: 'PowerLogic T300',           subgama: '' },
  { id: '63502', name: 'powerlogic-ion7400', familia: 'Distribución de potencia', subfamilia: 'Analizador redes',          gama: 'PowerLogic ION7400',        subgama: '' },
  { id: '63626', name: 'powertag',        familia: 'Distribución de potencia', subfamilia: 'Sensor energía',            gama: 'PowerTag',                  subgama: '' },
  { id: '65660', name: 'powerlogic-a1-a3',familia: 'Distribución de potencia', subfamilia: 'Protección arco',           gama: 'PowerLogic A1/A3',          subgama: '' },

  // ======== ENERGIAS RENOVABLES ========
  { id: '63128',     name: 'evlink-field',   familia: 'Vehículos eléctricos', subfamilia: 'Carga VE',                  gama: 'EVlink Field Services',     subgama: '' },
  { id: '103807887', name: 'evlink-pro-dc',  familia: 'Vehículos eléctricos', subfamilia: 'Carga rápida VE',            gama: 'EVlink Pro DC',             subgama: '' },

  // ======== NUEVAS GAMAS ========
  { id: '64295',     name: 'harmony-st6',    familia: 'Automatización',          subfamilia: 'HMI',                       gama: 'Harmony',                   subgama: 'Harmony ST6' },
  { id: '61225',     name: 'harmony-gto',    familia: 'Automatización',          subfamilia: 'HMI',                       gama: 'Harmony',                   subgama: 'Harmony GTO' },
  { id: '61226',     name: 'harmony-sto-stu',familia: 'Automatización',          subfamilia: 'HMI',                       gama: 'Harmony',                   subgama: 'Harmony STO/STU' },
  { id: '65646',     name: 'harmony-xps',    familia: 'Automatización',          subfamilia: 'Relé de Seguridad',          gama: 'Harmony XPS',               subgama: 'Preventa XPS' },
  { id: '60517',     name: 'xs-sensors',     familia: 'Automatización',          subfamilia: 'Detector Inductivo',        gama: 'Telemecanique Sensors',     subgama: 'OsiSense XS' },
  { id: '60505',     name: 'xc-sensors',     familia: 'Automatización',          subfamilia: 'Final de Carrera',          gama: 'Telemecanique Sensors',     subgama: 'OsiSense XC' },
  { id: '60446',     name: 'harmony-control-relays', familia: 'Automatización',   subfamilia: 'Relé de Control',           gama: 'Harmony Relay',              subgama: 'Zelio Control' },
  { id: '60645',     name: 'tesys-le',       familia: 'Automatización',          subfamilia: 'Arrancador',                gama: 'TeSys',                     subgama: 'TeSys LE' },
  { id: '60635',     name: 'tesys-df',       familia: 'Distribución de potencia', subfamilia: 'Cortacircuito Fusible',     gama: 'TeSys',                     subgama: 'TeSys DF' },
  { id: '65842',     name: 'acti9-ic40',     familia: 'Distribución de potencia', subfamilia: 'Interruptor Magnetotérmico', gama: 'Acti 9',                    subgama: 'Acti 9 iC40' },
  { id: '61314',     name: 'ih-ihp-ita',     familia: 'Automatización',          subfamilia: 'Interruptor Horario',       gama: 'Acti 9',                    subgama: 'Acti 9 IH/IHP' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getActiveRanges() {
  let ranges = RANGES;
  if (GAMA_FILTER) {
    ranges = ranges.filter(r => r.name === GAMA_FILTER);
    if (ranges.length === 0) {
      log(`❌ Gama "${GAMA_FILTER}" no encontrada`);
      process.exit(1);
    }
  }
  return ranges;
}

// ─── FASE 1: FETCH PRODUCT IDs ────────────────────────────────────────────

async function fetchAllProductIds() {
  const ranges = getActiveRanges();
  log(`\n🔍 FASE 1: FETCH PRODUCT IDs — ${ranges.length} ranges`);
  
  fs.mkdirSync(DATA_DIR, { recursive: true });
  
  let hasPlaywright = false;
  try {
    const { chromium } = await import('playwright');
    hasPlaywright = true;
  } catch {
    log('⚠️  Playwright no disponible. Se usará fetch nativo (más propenso a 403).');
  }
  
  const report = { fetched: {}, errors: [], timestamp: new Date().toISOString() };

  for (const range of ranges) {
    log(`\n  🔄 ${range.name} (range ${range.id}) — ${range.familia}/${range.gama}`);
    
    const result = await fetchRangeProductIds(range, hasPlaywright);
    
    if (result.error) {
      log(`  ❌ Error: ${result.error}`);
      report.errors.push({ range: range.name, error: result.error });
      report.fetched[range.name] = { rangeId: range.id, total: null, fetched: 0, error: result.error };
      continue;
    }
    
    log(`  ✅ ${result.productIds.length} productos (total API: ${result.totalRecs})`);
    
    // Guardar a JSON
    const filePath = path.join(DATA_DIR, `${range.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify({
      rangeId: range.id,
      rangeName: range.name,
      familia: range.familia,
      subfamilia: range.subfamilia,
      gama: range.gama,
      subgama: range.subgama,
      busUnit: result.busUnit || '',
      totalRecs: result.totalRecs,
      fetchedCount: result.productIds.length,
      productIds: result.productIds,
      fetchedAt: new Date().toISOString()
    }, null, 2));
    
    report.fetched[range.name] = {
      rangeId: range.id,
      total: result.totalRecs,
      fetched: result.productIds.length
    };
    
    await sleep(1000); // Pausa entre ranges
  }
  
  // Guardar reporte global
  fs.writeFileSync(path.join(DATA_DIR, '_report.json'), JSON.stringify(report, null, 2));
  
  log(`\n📊 REPORTE FINAL:`);
  const totalOK = Object.values(report.fetched).filter((r) => r.fetched > 0).length;
  const totalError = report.errors.length;
  const totalProductIds = Object.values(report.fetched).reduce((s, r) => s + (r.fetched || 0), 0);
  log(`  ✅ ${totalOK} ranges OK, ❌ ${totalError} errors`);
  log(`  📦 Total product IDs: ${totalProductIds}`);
}

async function fetchRangeProductIds(range, usePlaywright) {
  const allIds = [];
  let offset = 0;
  const pageSize = 50;
  let totalRecs = null;
  let busUnit = null;
  
  while (true) {
    const url = `${BASE_URL}/ranges/${range.id}/products?brand=se&country-code=es&language-code=es&No=${offset}&Nrpp=${pageSize}`;
    
    let data;
    
    if (usePlaywright) {
      // Usar Playwright para evitar WAF
      try {
        const { chromium } = await import('playwright');
        const browser = await chromium.launch({ 
          headless: true,
          proxy: PROXY_URL ? { server: PROXY_URL } : undefined
        });
        const page = await browser.newPage({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        await page.goto('https://www.se.com/es/es/', { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(2000);
        
        try {
          data = await page.evaluate(async ({ rangeId, offset, pageSize }) => {
            const relativeUrl = `/ranges/${rangeId}/products?brand=se&country-code=es&language-code=es&No=${offset}&Nrpp=${pageSize}`;
            const resp = await fetch(relativeUrl, {
              headers: { 'Accept': 'application/json' }
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return await resp.json();
          }, { rangeId: range.id, offset, pageSize });
        } finally {
          await browser.close();
        }
      } catch (e) {
        return { error: `Playwright: ${e.message}` };
      }
    } else {
      // Fetch nativo
      try {
        const resp = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.se.com/es/es/'
          }
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        data = await resp.json();
      } catch (e) {
        return { error: `Fetch: ${e.message}` };
      }
    }
    
    if (totalRecs === null) {
      totalRecs = data.totalNumRecs || 0;
      busUnit = data.recs && data.recs[0]?.businessUnit;
    }
    
    const ids = (data.productIds || []).map(p => typeof p === 'string' ? p : p.productId || p.ref || String(p));
    allIds.push(...ids);
    
    if (!totalRecs || allIds.length >= totalRecs || ids.length < pageSize) break;
    
    offset += pageSize;
    await sleep(300);
    
    // Si tenemos límite y lo alcanzamos, cortar
    if (LIMIT > 0 && allIds.length >= LIMIT) {
      allIds.length = LIMIT;
      break;
    }
  }
  
  return { productIds: allIds, totalRecs, busUnit };
}

// ─── FASE 2: SCRAPE DETAILS ──────────────────────────────────────────────

async function scrapeAllDetails() {
  const ranges = getActiveRanges();
  log(`\n📋 FASE 2: SCRAPE DETAILS — ${ranges.length} ranges`);
  
  // Cargar estado previo si resume
  let state = { processed: {}, errors: {} };
  if (RESUME && fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    log(`  📂 Reanudando desde estado anterior (${Object.keys(state.processed).length} productos procesados)`);
  }
  
  let hasPlaywright = false;
  try {
    await import('playwright');
    hasPlaywright = true;
  } catch {
    log('⚠️  Playwright no disponible. Se usará fetch nativo.');
  }
  
  const totals = { new: 0, skipped: 0, errors: 0, total: 0 };
  
  for (const range of ranges) {
    const filePath = path.join(DATA_DIR, `${range.name}.json`);
    
    if (!fs.existsSync(filePath)) {
      log(`  ⏭️  ${range.name} — sin datos de IDs. Ejecuta --phase=fetch-ids primero.`);
      continue;
    }
    
    const rangeData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const productIds = rangeData.productIds || [];
    
    if (productIds.length === 0) {
      log(`  ⏭️  ${range.name} — 0 product IDs. Omitiendo.`);
      continue;
    }
    
    log(`\n  🔄 ${range.name} — ${productIds.length} productos`);
    
    for (let i = 0; i < productIds.length; i++) {
      const ref = productIds[i];
      totals.total++;
      
      // Skip si ya procesado (resume)
      if (state.processed[ref]) {
        totals.skipped++;
        continue;
      }
      
      // Check if already in DB
      const exists = await checkRefExists(ref);
      if (exists) {
        state.processed[ref] = 'exists';
        totals.skipped++;
        process.stdout.write('⏭');
        continue;
      }
      
      // Scrape product details
      const product = await scrapeProductDetail(ref, range, hasPlaywright);
      
      if (!product) {
        state.errors[ref] = 'scrape_failed';
        totals.errors++;
        process.stdout.write('❌');
        continue;
      }
      
      // Save to DB
      if (!DRY_RUN) {
        try {
          await insertProduct(product);
          state.processed[ref] = 'ok';
          totals.new++;
          process.stdout.write('✅');
        } catch (e) {
          state.errors[ref] = e.message;
          totals.errors++;
          process.stdout.write('💾');
        }
      } else {
        totals.new++;
        process.stdout.write('📝');
      }
      
      // Guardar estado periódicamente
      if (totals.total % 50 === 0) {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
      }
      
      // HUD: cada 10 productos, mostrar resumen parcial
      if (totals.total % 10 === 0) {
        process.stdout.write(` [${totals.new}N/${totals.skipped}S/${totals.errors}E]\n  `);
      }
      
      await sleep(DELAY_MS);
      
      // Límite por gama
      if (LIMIT > 0 && (i + 1) >= LIMIT) {
        log(`\n  ⏹️  Límite alcanzado (${LIMIT}) para ${range.name}`);
        break;
      }
    }
    
    log('');
  }
  
  // Guardar estado final
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  
  log(`\n📊 SCRAPE COMPLETADO`);
  log(`  ✅ Nuevos: ${totals.new}`);
  log(`  ⏭️  Existentes: ${totals.skipped}`);
  log(`  ❌ Errores: ${totals.errors}`);
  log(`  📦 Total procesados: ${totals.total}`);
}

function cleanSlug(slug) {
  let decoded = decodeURIComponent(slug);
  decoded = decoded.split('#')[0].split('?')[0];
  decoded = decoded.replace(/\/+$/, '');
  let parts = decoded.split('-');
  let name = parts.join(' ');
  name = name.charAt(0).toUpperCase() + name.slice(1);
  
  name = name.replace(/\bca\b/gi, 'CA');
  name = name.replace(/\bcc\b/gi, 'CC');
  name = name.replace(/\bac\b/gi, 'AC');
  name = name.replace(/\bdc\b/gi, 'DC');
  name = name.replace(/\bip(\d+)\b/gi, 'IP$1');
  name = name.replace(/\b(\d+)v\b/gi, '$1V');
  name = name.replace(/\b(\d+)a\b/gi, '$1A');
  name = name.replace(/\b(\d+)kv\b/gi, '$1kV');
  name = name.replace(/\b(\d+)ka\b/gi, '$1kA');
  name = name.replace(/\b(\d+)es\b/gi, '$1 E/S');
  name = name.replace(/\s+/g, ' ').trim();
  return name;
}

async function fetchNameFromSchneiderAPI(ref) {
  const url = `https://www.se.com/products-card/secondary?brand=se&country-code=es&language-code=es&ids=${ref}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.se.com/es/es/'
    }
  });
  
  if (!res.ok) {
    throw new Error(`API returned status ${res.status}`);
  }
  
  const data = await res.json();
  const info = data.productAdditionalInfos?.[0];
  if (info && info.viewAllDocumentsUrl) {
    const docUrl = info.viewAllDocumentsUrl;
    const match = docUrl.match(/\/product\/([^\/]+)\/([^\/]+)/i);
    if (match && match[2]) {
      const slug = match[2];
      const cleaned = cleanSlug(slug);
      
      let pdfUrl = '';
      if (info.documents && info.documents.length > 0) {
        const sheet = info.documents.find(d => d.documentType === 'Product Data Sheet' || d.title?.includes('Hoja de datos'));
        const doc = sheet || info.documents[0];
        if (doc && doc.url) {
          pdfUrl = doc.url.startsWith('http') ? doc.url : `https://www.se.com${doc.url}`;
        }
      }
      
      return { name: cleaned, pdfUrl };
    }
  }
  return null;
}

async function scrapeProductDetail(ref, range, usePlaywright) {
  try {
    let title = '';
    let pdfUrl = '';
    let imageUrl = '';
    
    // Estrategia Principal: Usar la API secundaria oficial de Schneider (WAF-bypass + nombres en español)
    try {
      const apiResult = await fetchNameFromSchneiderAPI(ref);
      if (apiResult && apiResult.name) {
        title = apiResult.name;
        pdfUrl = apiResult.pdfUrl;
      }
    } catch (apiErr) {
      // Omitir log ruidoso, fallar silenciosamente al scraper de página
    }
    
    // Estrategia Secundaria: Si la API secundaria falló, probar con el scraper de la página del producto
    if (!title) {
      if (usePlaywright) {
        const detail = await scrapeProductDetailPlaywright(ref);
        if (detail) {
          title = detail.title;
          imageUrl = detail.image;
        }
      } else {
        const detail = await scrapeProductDetailFetch(ref);
        if (detail) {
          title = detail.title;
          imageUrl = detail.image;
        }
      }
    }
    
    // Si no conseguimos título, usar al menos la ref
    if (!title) title = ref;
    
    // Si no conseguimos PDF de la API secundaria, probar con la función fallback
    if (!pdfUrl) {
      pdfUrl = await fetchPdfUrl(ref);
    }
    
    return {
      ref_fabricante: ref,
      marca: MARCA,
      name: title.substring(0, 200),
      imagen: imageUrl || '',
      pdf_url: pdfUrl || '',
      familia: range.familia,
      subfamilia: range.subfamilia,
      Gama: range.gama || '',
      Subgama: range.subgama || '',
      precio: 0,
      brand_id: BRAND_ID
    };
    
  } catch (e) {
    log(`\n  ⚠️  Error scrapeando ${ref}: ${e.message}`);
    return null;
  }
}

async function scrapeProductDetailFetch(ref) {
  const url = `${BASE_URL}/es/es/product/${ref}/`;
  
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9'
      }
    });
    
    if (!resp.ok) return null;
    
    const html = await resp.text();
    
    const getMeta = (name) => {
      const match = html.match(new RegExp(`<meta\\s+(?:name|property)="[^"]*${name}[^"]*"\\s+content="([^"]*)"`, 'i'));
      return match ? match[1] : '';
    };
    
    const getOG = (prop) => {
      const match = html.match(new RegExp(`<meta\\s+property="og:${prop}"\\s+content="([^"]*)"`, 'i'));
      return match ? match[1] : '';
    };
    
    const title = getMeta('product-name') || getMeta('name') || getOG('title');
    const description = getMeta('business-desc') || getMeta('description') || getOG('description');
    const image = getOG('image') || getMeta('og:image') || getMeta('thumbnail');
    const category = getMeta('range-name') || getMeta('business-unit-name');
    const busUnit = getMeta('business-unit-name');
    
    return { title, description, image, category, busUnit };
    
  } catch {
    return null;
  }
}

async function scrapeProductDetailPlaywright(ref) {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      headless: true,
      proxy: PROXY_URL ? { server: PROXY_URL } : undefined
    });
    
    const page = await browser.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      locale: 'es-ES'
    });
    
    try {
      await page.goto(`${BASE_URL}/es/es/product/${ref}/`, { 
        waitUntil: 'domcontentloaded', 
        timeout: 15000 
      });
      
      const result = await page.evaluate(() => {
        const getMeta = (name) => {
          const el = document.querySelector(`meta[name*="${name}" i], meta[property*="${name}" i]`);
          return el?.getAttribute('content') || '';
        };
        
        const title = getMeta('product-name') || getMeta('name') || document.title;
        const description = getMeta('business-desc') || getMeta('description');
        const image = getMeta('og:image');
        const category = getMeta('range-name');
        const busUnit = getMeta('business-unit-name');
        
        return { title, description, image, category, busUnit };
      });
      
      return result;
      
    } finally {
      await browser.close();
    }
  } catch {
    return null;
  }
}

async function fetchPdfUrl(ref) {
  const url = `${BASE_URL}/products-card/secondary?brand=se&country-code=es&language-code=es&ids=${ref}`;
  
  try {
    const resp = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!resp.ok) return '';
    
    const data = await resp.json();
    
    // Buscar URL de PDF en la respuesta
    if (data && data.cards && data.cards[0]) {
      return data.cards[0].pdfUrl || data.cards[0].pdf_url || 
             data.cards[0].downloadUrl || data.cards[0].url || '';
    }
    
    return '';
    
  } catch {
    return '';
  }
}

// ─── MAPEO FAMILIA → CATEGORÍA ──────────────────────────────────────────
// Coincide con el existente en familiaMapping.js

function mapCategoria(familia) {
  const mapping = {
    'Distribuci\u00f3n de potencia': 'INTERRUPTORES Y MECANISMOS',
    'CONTROL Y SEÑALIZACION': 'AUTOMATISMOS',
    'CONTACTORIA Y ARRANQUE': 'CONTACTORIA',
    'Automatizaci\u00f3n': 'Automatizaci\u00f3n',
    'CANALIZACION': 'CANALIZACION Y DISTRIBUCION',
    'MEDIDA Y CONTROL': 'MEDIDA Y CONTROL',
    'ENERGIAS RENOVABLES': 'ENERGIAS RENOVABLES',
  };
  return mapping[familia] || 'OTROS';
}

// ─── MAIN ─────────────────────────────────────────────────────────────────

async function main() {
  log('='.repeat(70));
  log('  SCRAPER COMPLETO SCHNEIDER ELECTRIC');
  log(`  Fase: ${PHASE} | Dry-run: ${DRY_RUN} | Resume: ${RESUME}`);
  if (GAMA_FILTER) log(`  Gama filtrada: ${GAMA_FILTER}`);
  if (LIMIT > 0) log(`  Límite por gama: ${LIMIT}`);
  if (PROXY_URL) log(`  Proxy: ${PROXY_URL}`);
  log('='.repeat(70));
  
  const dbCount = await getProductsCount().catch(() => 0);
  log(`📊 Productos actuales en DB: ${dbCount}\n`);
  
  if (PHASE === 'fetch-ids' || PHASE === 'all') {
    await fetchAllProductIds();
  }
  
  if (PHASE === 'scrape' || PHASE === 'all') {
    await scrapeAllDetails();
  }
  
  log('\n✅ Scraper completado');
}

main().catch(e => {
  log(`\n❌ Error fatal: ${e.message}`);
  console.error(e);
  process.exit(1);
});


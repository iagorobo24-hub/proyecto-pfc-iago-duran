/**
 * FETCH ALL RANGE PRODUCT IDS — vía Playwright (bypass WAF cargando homepage global primero)
 * 
 * El WAF de Akamai bloquea fetch directo a la API de ranges, pero si primero
 * cargamos la homepage global (se.com/ww/en/) que NO está bloqueada, las 
 * llamadas fetch desde el contexto de esa página funcionan correctamente.
 * 
 * Salida: scripts/data/range-ids/*.json
 * 
 * Uso:
 *   node scripts/fetch-all-range-ids.mjs                  # Todas las gamas
 *   node scripts/fetch-all-range-ids.mjs --gama=tesys-d   # Una gama específica
 *   node scripts/fetch-all-range-ids.mjs --headless=false # Ver navegador
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data', 'range-ids');
const REPORT_FILE = path.join(DATA_DIR, '_report.json');

const args = process.argv.slice(2);
const GAMA_FILTER = args.find(a => a.startsWith('--gama='))?.split('=')[1];
const HEADLESS = args.includes('--headless=false') ? false : true;

// ─── CATÁLOGO COMPLETO DE RANGES ──────────────────────────────────────────
const RANGES = [
  // DISTRIBUCION DE POTENCIA
  { id: '7556',     name: 'ic60',           familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Interruptor Magnetotérmico',   gama: 'Acti 9 iC60',             subgama: '' },
  { id: '39910531', name: 'compact-nsx',    familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Interruptor caja moldeada',  gama: 'ComPacT NSX',             subgama: '' },
  { id: '7558',     name: 'vigi',           familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Interruptor Diferencial',     gama: 'Acti 9 Vigi',             subgama: '' },
  { id: '7559',     name: 'iid',            familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Interruptor Diferencial',     gama: 'Acti 9 iID',              subgama: '' },
  { id: '7566',     name: 'isw',            familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Interruptor Seccionador',     gama: 'iSW',                     subgama: '' },
  { id: '7563',     name: 'ict',            familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Interruptor Diferencial',     gama: 'Acti 9 iCT',              subgama: '' },
  { id: '65400',    name: 'icv40',          familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Interruptor Limitador',       gama: 'Acti 9 iCV40',            subgama: '' },
  { id: '1104',     name: 'c60ul',          familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Interruptor Magnetotérmico', gama: 'C60 UL CSA IEC',          subgama: '' },
  { id: '61709',    name: 'iprc',           familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Interruptor Seccionador',     gama: 'iPRC - iPRI',             subgama: '' },
  { id: '63545',    name: 'masterpact-mtz', familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Interruptor baja tensión',    gama: 'MasterPact MTZ',          subgama: 'Configurable' },

  // CONTROL Y SEÑALIZACION
  { id: '529',      name: 'timer-relay',     familia: 'CONTROL Y SEÑALIZACION', subfamilia: 'Temporizador',              gama: 'Relevadores Temporizadores', subgama: '' },
  { id: '532',      name: 'harmony-relay',   familia: 'CONTROL Y SEÑALIZACION', subfamilia: 'Relé Electromecánico',      gama: 'Harmony Relay',              subgama: '' },
  { id: '632',      name: 'harmony-xb4',     familia: 'CONTROL Y SEÑALIZACION', subfamilia: 'Pulsador/Selector',         gama: 'Harmony XB4',               subgama: '' },
  { id: '633',      name: 'harmony-xb5',     familia: 'CONTROL Y SEÑALIZACION', subfamilia: 'Pulsador/Selector',         gama: 'Harmony XB5',               subgama: '' },

  // CONTACTORIA Y ARRANQUE
  { id: '664',      name: 'tesys-d-deca',    familia: 'CONTACTORIA Y ARRANQUE', subfamilia: 'Contactor',                 gama: 'TeSys D/Deca',              subgama: '' },
  { id: '665',      name: 'tesys-f',         familia: 'CONTACTORIA Y ARRANQUE', subfamilia: 'Contactor',                 gama: 'TeSys F',                   subgama: '' },
  { id: '684',      name: 'tesys-gv',        familia: 'CONTACTORIA Y ARRANQUE', subfamilia: 'Guardamotor',               gama: 'TeSys GV',                  subgama: '' },
  { id: '65746',    name: 'tesys-island',    familia: 'CONTACTORIA Y ARRANQUE', subfamilia: 'Arrancador',                gama: 'TeSys island',              subgama: '' },

  // CONTROL Y AUTOMATIZACION
  { id: '531',      name: 'zelio-logic',     familia: 'CONTROL Y AUTOMATIZACION', subfamilia: 'PLC/Relé programable',    gama: 'Zelio Logic',               subgama: '' },
  { id: '1535',     name: 'phaseo-power',    familia: 'CONTROL Y AUTOMATIZACION', subfamilia: 'Fuente alimentación',      gama: 'Phaseo',                    subgama: '' },
  { id: '2253',     name: 'altivar-12',      familia: 'CONTROL Y AUTOMATIZACION', subfamilia: 'Variador velocidad',      gama: 'Altivar 12',                subgama: '' },
  { id: '62128',    name: 'modicon-m221',    familia: 'CONTROL Y AUTOMATIZACION', subfamilia: 'PLC',                     gama: 'Modicon M221',              subgama: '' },
  { id: '62129',    name: 'modicon-m241',    familia: 'CONTROL Y AUTOMATIZACION', subfamilia: 'PLC',                     gama: 'Modicon M241',              subgama: '' },
  { id: '62317',    name: 'altivar-atv600',  familia: 'CONTROL Y AUTOMATIZACION', subfamilia: 'Variador velocidad',      gama: 'Altivar ATV600',            subgama: '' },

  // CANALIZACION
  { id: '1749',     name: 'canalis-kbb',     familia: 'CANALIZACION',            subfamilia: 'Canalización prefabricada', gama: 'Canalis KBB',               subgama: '' },
  { id: '1753',     name: 'canalis-ks',      familia: 'CANALIZACION',            subfamilia: 'Canalización prefabricada', gama: 'Canalis KS',                subgama: '' },
  { id: '63544',    name: 'canalis-kr',      familia: 'CANALIZACION',            subfamilia: 'Canalización prefabricada', gama: 'Canalis KR',                subgama: '' },

  // MEDIDA Y CONTROL
  { id: '61273',    name: 'iem3000',         familia: 'MEDIDA Y CONTROL',        subfamilia: 'Contador energía',          gama: 'PowerLogic iEM3000',        subgama: '' },
  { id: '61281',    name: 'powerlogic-pm5000', familia: 'MEDIDA Y CONTROL',      subfamilia: 'Analizador redes',          gama: 'PowerLogic PM5000',         subgama: '' },
  { id: '62399',    name: 'powerlogic-t300', familia: 'MEDIDA Y CONTROL',        subfamilia: 'Gateway comunicación',      gama: 'PowerLogic T300',           subgama: '' },
  { id: '63502',    name: 'powerlogic-ion7400', familia: 'MEDIDA Y CONTROL',     subfamilia: 'Analizador redes',          gama: 'PowerLogic ION7400',        subgama: '' },
  { id: '63626',    name: 'powertag',        familia: 'MEDIDA Y CONTROL',        subfamilia: 'Sensor energía',            gama: 'PowerTag',                  subgama: '' },
  { id: '65660',    name: 'powerlogic-a1-a3', familia: 'MEDIDA Y CONTROL',       subfamilia: 'Protección arco',           gama: 'PowerLogic A1/A3',          subgama: '' },

  // ENERGIAS RENOVABLES
  { id: '63128',     name: 'evlink-field',   familia: 'ENERGIAS RENOVABLES',     subfamilia: 'Carga VE',                  gama: 'EVlink Field Services',     subgama: '' },
  { id: '103807887', name: 'evlink-pro-dc',  familia: 'ENERGIAS RENOVABLES',     subfamilia: 'Carga rápida VE',           gama: 'EVlink Pro DC',             subgama: '' },

  // NUEVAS GAMAS AÑADIDAS
  { id: '64295',     name: 'harmony-st6',    familia: 'AUTOMATIZACION',          subfamilia: 'HMI',                       gama: 'Harmony',                   subgama: 'Harmony ST6' },
  { id: '61225',     name: 'harmony-gto',    familia: 'AUTOMATIZACION',          subfamilia: 'HMI',                       gama: 'Harmony',                   subgama: 'Harmony GTO' },
  { id: '61226',     name: 'harmony-sto-stu',familia: 'AUTOMATIZACION',          subfamilia: 'HMI',                       gama: 'Harmony',                   subgama: 'Harmony STO/STU' },
  { id: '65646',     name: 'harmony-xps',    familia: 'AUTOMATIZACION',          subfamilia: 'Relé de Seguridad',          gama: 'Harmony XPS',               subgama: 'Preventa XPS' },
  { id: '60517',     name: 'xs-sensors',     familia: 'AUTOMATIZACION',          subfamilia: 'Detector Inductivo',        gama: 'Telemecanique Sensors',     subgama: 'OsiSense XS' },
  { id: '60505',     name: 'xc-sensors',     familia: 'AUTOMATIZACION',          subfamilia: 'Final de Carrera',          gama: 'Telemecanique Sensors',     subgama: 'OsiSense XC' },
  { id: '60446',     name: 'harmony-control-relays', familia: 'AUTOMATIZACION',   subfamilia: 'Relé de Control',           gama: 'Harmony Relay',              subgama: 'Zelio Control' },
  { id: '60645',     name: 'tesys-le',       familia: 'AUTOMATIZACION',          subfamilia: 'Arrancador',                gama: 'TeSys',                     subgama: 'TeSys LE' },
  { id: '60635',     name: 'tesys-df',       familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Cortacircuito Fusible',     gama: 'TeSys',                     subgama: 'TeSys DF' },
  { id: '65842',     name: 'acti9-ic40',     familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Interruptor Magnetotérmico', gama: 'Acti 9',                    subgama: 'Acti 9 iC40' },
  { id: '61314',     name: 'ih-ihp-ita',     familia: 'AUTOMATIZACION',          subfamilia: 'Interruptor Horario',       gama: 'Acti 9',                    subgama: 'Acti 9 IH/IHP' },
];

function getActiveRanges() {
  let ranges = RANGES;
  if (GAMA_FILTER) {
    ranges = ranges.filter(r => r.name.includes(GAMA_FILTER) || r.id === GAMA_FILTER);
    if (ranges.length === 0) {
      console.error(`Error: gama "${GAMA_FILTER}" no encontrada`);
      process.exit(1);
    }
  }
  return ranges;
}

async function main() {
  console.log('='.repeat(70));
  console.log('  FETCH ALL RANGE PRODUCT IDs');
  console.log('  Bypass WAF: carga homepage global (ww/en) primero');
  if (GAMA_FILTER) console.log(`  Gama: ${GAMA_FILTER}`);
  console.log('='.repeat(70));

  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`\n📂 Data dir -> ${DATA_DIR}\n`);

  const ranges = getActiveRanges();
  console.log(`📦 ${ranges.length} ranges a procesar\n`);

  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-ES',
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    }
  });
  const page = await context.newPage();

  // ── Cargar homepage global (bypass WAF) ──
  console.log('  🌐 Cargando homepage global (bypass WAF)...');
  await page.goto('https://www.se.com/ww/en/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log('  ✅ Homepage OK — sesión WAF establecida\n');

  const report = { fetched: {}, errors: [], timestamp: new Date().toISOString() };

  for (const range of ranges) {
    const rangeStart = Date.now();
    process.stdout.write(`  🔍 ${range.name.padEnd(18)} (range ${range.id.padEnd(10)}) [${range.familia}] ... `);

    const result = await page.evaluate(async ({ rangeId, pageSize }) => {
      const allIds = [];
      let offset = 0;
      let totalRecs = null;

      while (true) {
        const url = `https://www.se.com/ranges/${rangeId}/products?brand=se&country-code=es&language-code=es&No=${offset}&Nrpp=${pageSize}`;

        try {
          const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
          if (!resp.ok) return { error: `HTTP ${resp.status} at offset ${offset}` };

          const data = await resp.json();
          if (totalRecs === null) totalRecs = data.totalNumRecs;
          if (!data.productIds || data.productIds.length === 0) break;

          allIds.push(...data.productIds);
          if (data.productIds.length < pageSize) break;
          offset += pageSize;
        } catch (err) {
          return { error: err.message };
        }
      }

      return { totalRecs, allIds };
    }, { rangeId: range.id, pageSize: 50 });

    const elapsed = ((Date.now() - rangeStart) / 1000).toFixed(1);

    if (result.error) {
      console.log(`❌ ${result.error} (${elapsed}s)`);
      report.errors.push({ range: range.name, error: result.error });
      report.fetched[range.name] = { rangeId: range.id, total: null, fetched: 0, error: result.error };
      continue;
    }

    const count = result.allIds.length;
    const total = result.totalRecs || count;

    console.log(`✅ ${count}/${total} IDs (${elapsed}s)`);

    // Guardar a JSON
    const fileData = {
      rangeId: range.id,
      rangeName: range.name,
      familia: range.familia,
      subfamilia: range.subfamilia,
      gama: range.gama,
      subgama: range.subgama,
      totalRecs: total,
      fetchedCount: count,
      productIds: result.allIds,
      fetchedAt: new Date().toISOString()
    };

    fs.writeFileSync(path.join(DATA_DIR, `${range.name}.json`), JSON.stringify(fileData, null, 2));

    report.fetched[range.name] = {
      rangeId: range.id,
      total: total,
      fetched: count
    };

    // Pequeña pausa entre ranges
    await page.waitForTimeout(500);
  }

  // Guardar reporte global
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  // Resumen
  const totalOK = Object.values(report.fetched).filter(r => r.fetched > 0).length;
  const totalError = report.errors.length;
  const totalIds = Object.values(report.fetched).reduce((s, r) => s + (r.fetched || 0), 0);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ✅ ${totalOK} ranges OK`);
  if (totalError > 0) console.log(`  ❌ ${totalError} ranges con error`);
  console.log(`  📦 Total product IDs: ${totalIds}`);
  console.log(`  📂 Datos en: ${DATA_DIR}`);
  console.log(`${'='.repeat(70)}`);

  await browser.close();
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});

/**
 * Crear gama Siemens 5SL8 en Supabase (5SL58XX-7, C curve)
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(resolve(__dirname, '../../.env'), 'utf-8');
const KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const URL = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const H = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };

const AMP_MAP = { '01':1, '02':2, '03':3, '04':4, '06':6, '08':8, '10':10, '13':13, '18':15, '16':16, '20':20, '25':25 };
const GAMA = '5SL8';

const entries = Object.entries(AMP_MAP).map(([code, amps]) => ({
  ref_fabricante: `5SL58${code}-7`,
  name: `Magnetotérmico ${GAMA}, 1P+N, ${amps}A, C curva, 6000A (IEC 60898-1)`,
  Gama: GAMA,
  Subgama: `${GAMA} Curva C`,
  brand_id: 458, marca: 'Siemens',
  familia: 'DISTRIBUCION DE POTENCIA', subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN',
  VALIDADO_MANUAL: true, precio: 0,
}));

console.log('Refs:', entries.length);
entries.forEach(e => console.log('  '+e.ref_fabricante+' → '+e.name));

async function run() {
  let ok=0, err=0;
  for (let i=0; i<entries.length; i+=30) {
    const batch = entries.slice(i,i+30);
    const res = await fetch(URL+'/rest/v1/products', { method:'POST', headers:H, body:JSON.stringify(batch) });
    if (res.ok) { ok+=batch.length; process.stdout.write('.'); }
    else { const t=await res.text(); console.error(`\nError ${i}: ${res.status} ${t}`); err+=batch.length; }
    await new Promise(r=>setTimeout(r,150));
  }
  console.log(`\nCreadas: ${ok}, Errores: ${err}`);
}
await run();

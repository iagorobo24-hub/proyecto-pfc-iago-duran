/**
 * normalize-db-families.mjs
 * Normaliza los valores del campo `familia` en la tabla products de Supabase.
 * Unifica todas las variantes en mayúsculas → formato canónico correcto.
 */
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const SONEX_KEY = envContent.match(/SONEX_SUPABASE_KEY=(.+)/)?.[1]?.trim() ||
                  envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim() || '';
const SONEX_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co';

const HEADERS = {
  'apikey': SONEX_KEY,
  'Authorization': `Bearer ${SONEX_KEY}`,
  'Content-Type': 'application/json'
};

// Mapa de valores incorrectos → valor canónico correcto
const FAMILY_FIXES = {
  'AUTOMATIZACION':             'Automatización',
  'AUTOMATIZACION DE EDIFICIOS':'Automatización de edificios',
  'DISTRIBUCION DE POTENCIA':   'Distribución de potencia',
  'INSTALACION':                'Instalación',
  'VEHICULOS_ELECTRICOS':       'Vehículos eléctricos',
  'VEHICULOS ELECTRICOS':       'Vehículos eléctricos',
  'CLIMATIZACION':              'Climatización',
  'COMUNICACION':               'Comunicación',
  'PROTECCION':                 'Protección',
  'ILUMINACION':                'Iluminación',
  'FOTOVOLTAICA':               'Fotovoltaica',
  'HERRAMIENTAS':               'Herramientas',
  'FONTANERIA':                 'Fontanería',
  'ENERGIAS RENOVABLES':        'Energías renovables',
  'CABLES':                     'Cables',
};

async function patchFamilia(wrongValue, correctValue) {
  const url = `${SONEX_URL}/rest/v1/products?familia=eq.${encodeURIComponent(wrongValue)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify({ familia: correctValue })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error PATCH for "${wrongValue}": ${res.status} ${err}`);
  }
  const updated = await res.json();
  return updated.length;
}

console.log('=== NORMALIZANDO FAMILIAS EN SUPABASE ===\n');

let totalFixed = 0;
for (const [wrong, correct] of Object.entries(FAMILY_FIXES)) {
  try {
    const count = await patchFamilia(wrong, correct);
    if (count > 0) {
      console.log(`✅ "${wrong}" → "${correct}"  (${count} productos)`);
      totalFixed += count;
    } else {
      console.log(`ℹ️  "${wrong}" → sin productos con ese valor`);
    }
  } catch (err) {
    console.error(`❌ Error con "${wrong}":`, err.message);
  }
  // Pequeña pausa para no saturar la API
  await new Promise(r => setTimeout(r, 200));
}

console.log(`\n=== RESUMEN ===`);
console.log(`Total productos actualizados: ${totalFixed}`);
console.log('✅ Normalización completada.');

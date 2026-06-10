#!/usr/bin/env node
/**
 * Catalog Database Normalizer — normalize_db_catalog.js
 * Updates plural/misspelled subfamilies in Supabase to standard singular/accented forms.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read environment variables
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
    console.error('⚠️ Error loading env file:', err.message);
  }
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase credentials not found.');
  process.exit(1);
}

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const MAPPINGS = [
  // Instalación
  { from: { subfamilia: 'Canal Instalacion' }, to: { subfamilia: 'Canal de Instalación' } },
  { from: { subfamilia: 'Minicanal' }, to: { subfamilia: 'Mini Canal' } },
  { from: { subfamilia: 'Canalizacion' }, to: { subfamilia: 'Canalización' } },
  { from: { subfamilia: 'Canal Cuadros' }, to: { subfamilia: 'Canal de Instalación' } },
  
  // Fotovoltaica
  { from: { subfamilia: 'Cajas combinadoras' }, to: { subfamilia: 'Caja Combinadora' } },
  { from: { subfamilia: 'Protecciones sobretensión' }, to: { subfamilia: 'Proteccion Sobretension' } },
  { from: { subfamilia: 'Accesorios', familia: 'Fotovoltaica' }, to: { subfamilia: 'Accesorio' } },
  { from: { subfamilia: 'Interruptores CC' }, to: { subfamilia: 'Interruptor CC' } },
  
  // Distribución de potencia / Control Motor
  { from: { subfamilia: 'Relés de Seguridad' }, to: { subfamilia: 'Relé de Seguridad' } },
  { from: { subfamilia: 'Relés Auxiliares' }, to: { subfamilia: 'Relé de Control' } },
  { from: { subfamilia: 'Arrancadores Suaves' }, to: { subfamilia: 'Arrancador Suave' } },
  { from: { subfamilia: 'Relés de Estado Sólido' }, to: { subfamilia: 'Relé de Control' } }
];

async function updateProducts(filter, updates) {
  let queryStr = '';
  if (filter.subfamilia) queryStr += `subfamilia=eq.${encodeURIComponent(filter.subfamilia)}`;
  if (filter.familia) queryStr += `&familia=eq.${encodeURIComponent(filter.familia)}`;

  const url = `${SUPABASE_URL}/rest/v1/products?${queryStr}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify(updates)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error updating products for filter ${JSON.stringify(filter)}: ${res.status} - ${text}`);
  }

  const data = await res.json();
  return data?.length || 0;
}

async function main() {
  console.log('======================================================');
  console.log('🔄 INICIANDO NORMALIZACIÓN DE SUBFAMILIAS EN BASE DE DATOS');
  console.log('======================================================\n');

  for (const map of MAPPINGS) {
    console.log(`⏳ Normalizando "${map.from.subfamilia}"${map.from.familia ? ` (familia: ${map.from.familia})` : ''} -> "${map.to.subfamilia}"...`);
    try {
      const count = await updateProducts(map.from, map.to);
      console.log(`   ✅ ¡Listo! ${count} productos actualizados.\n`);
    } catch (err) {
      console.error(`   ❌ Error durante la actualización:`, err.message);
    }
  }

  console.log('✅ Normalización completada.');
}

main().catch(err => {
  console.error('❌ Error catastrófico:', err);
  process.exit(1);
});

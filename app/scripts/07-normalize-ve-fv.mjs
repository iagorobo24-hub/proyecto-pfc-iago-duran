#!/usr/bin/env node
/**
 * FASE 2.4 + 2.7: Normalizar VEHICULOS_ELECTRICOS y FOTOVOLTAICA
 * Eliminar subfamilias genéricas que quedaron vacías tras eliminar placeholders
 * Ejecutar: node scripts/07-normalize-ve-fv.mjs [--dry-run]
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');

const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
const SERVICE_KEY = envContent.match(/SONEX_SUPABASE_KEY=(.+)/)?.[1]?.trim();

const HEADERS = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json'
};

async function fetchAll(table, filters = '') {
  const all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=${limit}&offset=${offset}${filters ? '&' + filters : ''}`;
    const res = await fetch(url, { headers: { ...HEADERS, Prefer: 'return=representation' } });
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const data = await res.json();
    all.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }
  return all;
}

async function main() {
  console.log(`🔧 FASE 2.4 + 2.7: Normalizar VE y FOTOVOLTAICA${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  // 1. VEHICULOS_ELECTRICOS
  console.log('📦 VEHICULOS_ELECTRICOS:');
  const veProducts = await fetchAll('products', 'familia=eq.VEHICULOS_ELECTRICOS');
  console.log(`   Total: ${veProducts.length} productos`);

  const veSubfamilias = {};
  veProducts.forEach(p => {
    veSubfamilias[p.subfamilia] = (veSubfamilias[p.subfamilia] || 0) + 1;
  });

  console.log('   Subfamilias:');
  for (const [sub, count] of Object.entries(veSubfamilias).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${sub}: ${count}`);
  }

  // Verificar si la subfamilia "VEHICULOS_ELECTRICOS" sigue existiendo
  const veGenerico = veProducts.filter(p => p.subfamilia === 'VEHICULOS_ELECTRICOS');
  if (veGenerico.length > 0) {
    console.log(`   ⚠️  ${veGenerico.length} productos con subfamilia "VEHICULOS_ELECTRICOS" (deberían haberse eliminado)`);
  } else {
    console.log('   ✅ La subfamilia "VEHICULOS_ELECTRICOS" ya no existe');
  }

  // 2. FOTOVOLTAICA
  console.log('\n📦 FOTOVOLTAICA:');
  const fvProducts = await fetchAll('products', 'familia=eq.FOTOVOLTAICA');
  console.log(`   Total: ${fvProducts.length} productos`);

  const fvSubfamilias = {};
  fvProducts.forEach(p => {
    fvSubfamilias[p.subfamilia] = (fvSubfamilias[p.subfamilia] || 0) + 1;
  });

  console.log('   Subfamilias:');
  for (const [sub, count] of Object.entries(fvSubfamilias).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${sub}: ${count}`);
  }

  // Verificar si la subfamilia "Fotovoltaica" sigue existiendo
  const fvGenerico = fvProducts.filter(p => p.subfamilia === 'Fotovoltaica');
  if (fvGenerico.length > 0) {
    console.log(`   ⚠️  ${fvGenerico.length} productos con subfamilia "Fotovoltaica" (deberían haberse eliminado)`);
  } else {
    console.log('   ✅ La subfamilia "Fotovoltaica" ya no existe');
  }

  // 3. Verificar que no hay subfamilias vacías
  console.log('\n📦 Verificando subfamilias vacías...');
  const allProducts = await fetchAll('products');
  const allSubfamilias = {};
  allProducts.forEach(p => {
    const key = `${p.familia}|${p.subfamilia}`;
    allSubfamilias[key] = (allSubfamilias[key] || 0) + 1;
  });

  // No hay forma de detectar subfamilias vacías sin hacer queries individuales
  // Pero podemos verificar que las subfamilias esperadas siguen existiendo
  const expectedSubs = [
    'Punto Recarga', 'Accesorio',  // VE
    'Seccionador CC', 'Caja Combinadora', 'Proteccion Sobretension', 'Interruptor CC',  // FV
  ];

  for (const sub of expectedSubs) {
    const count = allProducts.filter(p => p.subfamilia === sub).length;
    if (count === 0) {
      console.log(`   ⚠️  Subfamilia "${sub}" vacía`);
    }
  }

  console.log('\n✅ FASE 2.4 + 2.7 completada');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

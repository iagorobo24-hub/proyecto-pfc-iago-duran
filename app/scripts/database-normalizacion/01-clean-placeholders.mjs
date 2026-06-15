#!/usr/bin/env node
/**
 * FASE 1.1: Eliminar productos placeholder ("Todos los Productos")
 * Ejecutar: node scripts/01-clean-placeholders.mjs [--dry-run]
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');

const envPath = join(__dirname, '..', '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const SUPABASE_URL = (envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1] || envContent.match(/SUPABASE_URL=(.+)/)?.[1])?.trim();
const SERVICE_KEY = (envContent.match(/SONEX_SUPABASE_KEY=(.+)/)?.[1] || envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1])?.trim();

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ No se encontraron VITE_SUPABASE_URL/SUPABASE_URL o SONEX_SUPABASE_KEY/SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const HEADERS = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

async function fetchAll(table, filters = '') {
  const all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=id,name,familia,subfamilia,marca&limit=${limit}&offset=${offset}${filters ? '&' + filters : ''}`;
    const res = await fetch(url, { headers: { ...HEADERS, Prefer: 'return=representation' } });
    if (!res.ok) throw new Error(`Error fetching ${table}: ${res.status}`);
    const data = await res.json();
    all.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }
  return all;
}

async function deleteProducts(ids) {
  // Supabase REST API limit: delete in batches of 100
  const batchSize = 100;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const url = `${SUPABASE_URL}/rest/v1/products?id=in.(${batch.join(',')})`;
    const res = await fetch(url, { method: 'DELETE', headers: HEADERS });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Error deleting batch ${i / batchSize + 1}: ${res.status} ${err}`);
    }
  }
}

async function main() {
  console.log(`🧹 FASE 1.1: Eliminar productos placeholder${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  // Buscar todos los productos placeholder
  const allProducts = await fetchAll('products');
  const placeholders = allProducts.filter(p => p.name === 'Todos los Productos');

  console.log(`📊 Productos encontrados con nombre "Todos los Productos": ${placeholders.length}`);

  if (placeholders.length === 0) {
    console.log('✅ No hay productos placeholder. Nada que hacer.');
    return;
  }

  // Mostrar distribución por familia
  const byFamilia = {};
  const byMarca = {};
  placeholders.forEach(p => {
    byFamilia[p.familia] = (byFamilia[p.familia] || 0) + 1;
    byMarca[p.marca] = (byMarca[p.marca] || 0) + 1;
  });

  console.log('\n📦 Distribución por familia:');
  for (const [fam, count] of Object.entries(byFamilia).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${fam}: ${count}`);
  }

  console.log('\n📦 Distribución por marca:');
  for (const [marca, count] of Object.entries(byMarca).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${marca}: ${count}`);
  }

  // Eliminar
  if (DRY_RUN) {
    console.log(`\n🔍 DRY RUN: Se eliminarían ${placeholders.length} productos`);
    console.log('   IDs:', placeholders.slice(0, 10).map(p => p.id).join(', '), placeholders.length > 10 ? '...' : '');
    return;
  }

  console.log(`\n🗑️  Eliminando ${placeholders.length} productos...`);
  const ids = placeholders.map(p => p.id);
  await deleteProducts(ids);
  console.log(`✅ ${placeholders.length} productos eliminados correctamente`);

  // Verificar
  const remaining = await fetchAll('products');
  const remainingPlaceholders = remaining.filter(p => p.name === 'Todos los Productos');
  console.log(`\n📊 Verificación: ${remainingPlaceholders.length} productos placeholder restantes`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

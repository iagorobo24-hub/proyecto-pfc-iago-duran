#!/usr/bin/env node
/**
 * FASE 0.1: Backup completo de las tablas products y brands
 * Ejecutar: node scripts/00-backup-db.mjs
 */

import { readFileSync } from 'fs';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = join(__dirname, '..', 'backups');

// Leer configuración de Supabase
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
  'Content-Type': 'application/json'
};

async function fetchAll(table) {
  const all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=${limit}&offset=${offset}&order=id`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`Error fetching ${table}: ${res.status} ${await res.text()}`);
    const data = await res.json();
    all.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }
  return all;
}

async function main() {
  console.log('🔄 Iniciando backup de la base de datos...\n');

  // Crear directorio de backups
  mkdirSync(BACKUP_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  // Backup de products
  console.log('📦 Exportando tabla products...');
  const products = await fetchAll('products');
  const productsPath = join(BACKUP_DIR, `products-backup-${timestamp}.json`);
  writeFileSync(productsPath, JSON.stringify(products, null, 2));
  console.log(`   ✅ ${products.length} productos exportados → ${productsPath}`);

  // Backup de brands
  console.log('📦 Exportando tabla brands...');
  const brands = await fetchAll('brands');
  const brandsPath = join(BACKUP_DIR, `brands-backup-${timestamp}.json`);
  writeFileSync(brandsPath, JSON.stringify(brands, null, 2));
  console.log(`   ✅ ${brands.length} marcas exportadas → ${brandsPath}`);

  // Resumen
  console.log('\n📊 Resumen del backup:');
  console.log(`   - Productos: ${products.length}`);
  console.log(`   - Marcas: ${brands.length}`);
  console.log(`   - Directorio: ${BACKUP_DIR}`);
  console.log(`   - Timestamp: ${timestamp}`);

  // Estadísticas rápidas
  const familias = {};
  const marcas = {};
  let placeholders = 0;
  for (const p of products) {
    familias[p.familia] = (familias[p.familia] || 0) + 1;
    marcas[p.marca] = (marcas[p.marca] || 0) + 1;
    if (p.name === 'Todos los Productos') placeholders++;
  }

  console.log('\n📈 Distribución por familia:');
  for (const [fam, count] of Object.entries(familias).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${fam}: ${count}`);
  }

  console.log('\n📈 Distribución por marca:');
  for (const [marca, count] of Object.entries(marcas).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${marca}: ${count}`);
  }

  console.log(`\n⚠️  Productos placeholder (name="Todos los Productos"): ${placeholders}`);

  console.log('\n✅ Backup completado correctamente.');
}

main().catch(err => {
  console.error('❌ Error durante el backup:', err.message);
  process.exit(1);
});

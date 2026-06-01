#!/usr/bin/env node
/**
 * FASE 0.2: Verificación de taxonomía post-cambios
 * Ejecutar: node scripts/02-verify-taxonomy.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Leer configuración de Supabase
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim();
const SERVICE_KEY = envContent.match(/SONEX_SUPABASE_KEY=(.+)/)?.[1]?.trim();

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ No se encontraron VITE_SUPABASE_URL o SONEX_SUPABASE_KEY en .env');
  process.exit(1);
}

const HEADERS = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json'
};

async function fetchCount(table, filters = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=count${filters ? '&' + filters : ''}`;
  const res = await fetch(url, {
    headers: { ...HEADERS, 'Prefer': 'count=exact', 'Range': '0-0' }
  });
  const range = res.headers.get('content-range');
  if (range) {
    const match = range.match(/\/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

async function fetchAll(table, filters = '') {
  const all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=${limit}&offset=${offset}&order=id${filters ? '&' + filters : ''}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`Error fetching ${table}: ${res.status}`);
    const data = await res.json();
    all.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }
  return all;
}

// Subfamilias estándar de DP (deberían existir en categoriaMapping.js)
const DP_STANDARD_SUBFAMILIAS = [
  'Interruptor Magnetotérmico',
  'Interruptor Diferencial',
  'Proteccion Sobretension',
  'Cortacircuito Fusible',
  'Interruptor Seccionador',
  'Seccionador CC',
  'Interruptor CC',
  'Interruptor Caja Moldeada',
  'Rearmador',
  'Control Aislamiento',
  'Central Reporte',
  'Accesorio',
  'Caja Distribucion',
  'Caja Conexion',
  'Conmutador',
  'Toma Corriente Industrial',
  'Fuente Alimentacion',
  'Timbre',
  'Zumbador',
  'Contactor',
  'Elemento de Control',
  'Bloque Mando Osmoz',
  'Pulsador Osmoz',
  // Nuevas subfamilias
  'Relé de Seguridad',
  'Bornas',
  'Arrancador Suave',
];

// Tipos estándar de DP
const DP_STANDARD_TIPOS = [
  'CARRIL DIN',
  'CAJA MOLDEADA',
  'Piloto luminoso',
  'Contador eléctrico',
  // Tipos extendidos
  'ENVOLVENTE',
  'CUADRO DISTRIBUCION',
  'SUPERFICIE',
  'EMPOTRAR',
  'MONTAJE EN PARED',
];

// Familias válidas
const VALID_FAMILIAS = [
  'DISTRIBUCION DE POTENCIA',
  'AUTOMATIZACION',
  'AUTOMATIZACION DE EDIFICIOS',
  'FOTOVOLTAICA',
  'ILUMINACION',
  'INSTALACION',
  'VEHICULOS_ELECTRICOS',
];

async function main() {
  console.log('🔍 Verificación de taxonomía post-cambios\n');
  console.log('=' .repeat(60));

  let errors = 0;
  let warnings = 0;

  // 1. Contar productos
  const totalProducts = await fetchCount('products');
  console.log(`\n📊 Total productos: ${totalProducts}`);

  // 2. Verificar placeholders
  const products = await fetchAll('products');
  const placeholders = products.filter(p => p.name === 'Todos los Productos');
  if (placeholders.length > 0) {
    console.log(`\n❌ ERRORS: ${placeholders.length} productos con nombre "Todos los Productos"`);
    errors += placeholders.length;
  } else {
    console.log('\n✅ No hay productos placeholder');
  }

  // 3. Verificar familias inexistentes
  const invalidFamilias = products.filter(p => !VALID_FAMILIAS.includes(p.familia));
  if (invalidFamilias.length > 0) {
    console.log(`\n❌ ERRORS: ${invalidFamilias.length} productos con familia inexistente:`);
    const famCounts = {};
    invalidFamilias.forEach(p => { famCounts[p.familia] = (famCounts[p.familia] || 0) + 1; });
    for (const [fam, count] of Object.entries(famCounts)) {
      console.log(`   - "${fam}": ${count} productos`);
    }
    errors += invalidFamilias.length;
  } else {
    console.log('\n✅ Todas las familias son válidas');
  }

  // 4. Verificar subfamilias inconsistentes en DP
  const dpProducts = products.filter(p => p.familia === 'DISTRIBUCION DE POTENCIA');
  const contactores = dpProducts.filter(p => p.subfamilia === 'Contactores');
  if (contactores.length > 0) {
    console.log(`\n❌ ERRORS: ${contactores.length} productos con subfamilia "Contactores" (debería ser "Contactor")`);
    errors += contactores.length;
  }

  const veSubfamilia = products.filter(p => p.familia === 'VEHICULOS_ELECTRICOS' && p.subfamilia === 'VEHICULOS_ELECTRICOS');
  if (veSubfamilia.length > 0) {
    console.log(`\n❌ ERRORS: ${veSubfamilia.length} productos con subfamilia = familia (VEHICULOS_ELECTRICOS)`);
    errors += veSubfamilia.length;
  }

  // 5. Verificar subfamilias no estándar en DP
  const nonStandardSubfamilias = [...new Set(dpProducts.map(p => p.subfamilia))]
    .filter(s => !DP_STANDARD_SUBFAMILIAS.includes(s));
  if (nonStandardSubfamilias.length > 0) {
    console.log(`\n⚠️  WARNINGS: ${nonStandardSubfamilias.length} subfamilias no estándar en DP:`);
    nonStandardSubfamilias.forEach(s => {
      const count = dpProducts.filter(p => p.subfamilia === s).length;
      console.log(`   - "${s}": ${count} productos`);
    });
    warnings += nonStandardSubfamilias.length;
  }

  // 6. Verificar productos con precio = 0
  const noPrice = products.filter(p => !p.precio || p.precio === 0);
  if (noPrice.length > 0) {
    console.log(`\n⚠️  WARNINGS: ${noPrice.length} productos con precio = 0`);
    warnings++;
  }

  // 7. Verificar productos sin imagen
  const noImage = products.filter(p => !p.imagen);
  if (noImage.length > 0) {
    console.log(`\n⚠️  WARNINGS: ${noImage.length} productos sin imagen`);
    warnings++;
  }

  // 8. Verificar productos sin PDF
  const noPdf = products.filter(p => !p.pdf_url);
  if (noPdf.length > 0) {
    console.log(`\n⚠️  WARNINGS: ${noPdf.length} productos sin PDF`);
    warnings++;
  }

  // Resumen
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 RESUMEN:');
  console.log(`   - Total productos: ${totalProducts}`);
  console.log(`   - Errores encontrados: ${errors}`);
  console.log(`   - Warnings encontrados: ${warnings}`);

  if (errors > 0) {
    console.log('\n❌ HAY ERRORES QUE CORREGIR');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  HAY WARNINGS PERO NO ERRORES CRÍTICOS');
    process.exit(0);
  } else {
    console.log('\n✅ TODO CORRECTO');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('❌ Error durante la verificación:', err.message);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * FASE 2.3: Normalizar subfamilias de INSTALACION
 * Ejecutar: node scripts/06-normalize-instalacion.mjs [--dry-run]
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

// Mapeo tipo → nueva subfamilia + acción
const TIPO_TO_SUBFAMILIA = {
  'BORNIERA': { subfamilia: 'Borniera', familia: 'INSTALACION' },
  'CANALES': { subfamilia: 'Canal de Instalación', familia: 'INSTALACION' },
  'Piloto luminoso': { subfamilia: 'Accesorio', familia: 'DISTRIBUCION DE POTENCIA' },
  'Contador eléctrico': { subfamilia: 'Contador Eléctrico', familia: 'INSTALACION' },
  'MINICANALES': { subfamilia: 'Mini Canal', familia: 'INSTALACION' },
  'BANDEJAS': { subfamilia: 'Bandeja Portacables', familia: 'INSTALACION' },
  'CANALIZACION': { subfamilia: 'Canalización', familia: 'INSTALACION' },
  'Módulo I/O': { subfamilia: 'Módulo de E/S', familia: 'AUTOMATIZACION' },
  'CARRIL DIN': { subfamilia: 'Accesorio', familia: 'DISTRIBUCION DE POTENCIA' },
  'Módulo Comunicación': { subfamilia: 'Módulo de Comunicación', familia: 'AUTOMATIZACION' },
  'Caja Conexion': { subfamilia: 'Caja de Conexión', familia: 'DISTRIBUCION DE POTENCIA' },
};

async function fetchAll(table, filters = '') {
  const all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=id,ref_fabricante,name,subfamilia,tipo,familia&limit=${limit}&offset=${offset}${filters ? '&' + filters : ''}`;
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
  console.log(`🔧 FASE 2.3: Normalizar subfamilias de INSTALACION${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  // Buscar productos de INSTALACION con subfamilia "Instalación"
  const products = await fetchAll('products', 'familia=eq.INSTALACION&subfamilia=eq.Instalaci%C3%B3n');
  console.log(`📊 Productos encontrados con subfamilia "Instalación": ${products.length}`);

  if (products.length === 0) {
    console.log('✅ No hay productos con subfamilia "Instalación". Nada que hacer.');
    return;
  }

  // Agrupar por tipo
  const byTipo = {};
  products.forEach(p => {
    const tipo = p.tipo || 'SIN TIPO';
    byTipo[tipo] = (byTipo[tipo] || 0) + 1;
  });

  console.log('\n📦 Distribución por tipo:');
  for (const [tipo, count] of Object.entries(byTipo).sort((a, b) => b[1] - a[1])) {
    const mapping = TIPO_TO_SUBFAMILIA[tipo];
    if (mapping) {
      console.log(`   ${tipo}: ${count} → "${mapping.subfamilia}" (${mapping.familia})`);
    } else {
      console.log(`   ${tipo}: ${count} → SIN MAPEO`);
    }
  }

  if (DRY_RUN) {
    console.log(`\n🔍 DRY RUN: Se actualizarían ${products.length} productos`);
    return;
  }

  // Actualizar cada producto
  let updated = 0;
  for (const product of products) {
    const mapping = TIPO_TO_SUBFAMILIA[product.tipo];
    if (!mapping) {
      console.log(`   ⚠️  ${product.ref_fabricante}: tipo "${product.tipo}" sin mapeo, manteniendo subfamilia actual`);
      continue;
    }

    const updateUrl = `${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({
        subfamilia: mapping.subfamilia,
        familia: mapping.familia
      })
    });
    if (!updateRes.ok) {
      console.error(`   ❌ Error actualizando ${product.ref_fabricante}: ${updateRes.status}`);
      continue;
    }
    updated++;
  }

  console.log(`\n✅ ${updated} productos actualizados`);

  // Verificar familias
  const verifyProducts = await fetchAll('products');
  const instProducts = verifyProducts.filter(p => p.familia === 'INSTALACION');
  const subfamilias = {};
  instProducts.forEach(p => {
    subfamilias[p.subfamilia] = (subfamilias[p.subfamilia] || 0) + 1;
  });

  console.log('\n📊 Subfamilias de INSTALACION después de la normalización:');
  for (const [sub, count] of Object.entries(subfamilias).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${sub}: ${count}`);
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

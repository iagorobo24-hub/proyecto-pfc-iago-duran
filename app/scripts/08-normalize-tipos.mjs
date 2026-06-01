#!/usr/bin/env node
/**
 * FASE 3: Normalizar tipos de DP
 * Ejecutar: node scripts/08-normalize-tipos.mjs [--dry-run]
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

// Mapeo de normalización de tipos
const TIPO_NORMALIZATION = {
  'Cuadros Distribución': 'CUADRO DISTRIBUCION',
  'MONTAJE PAREDES': 'MONTAJE EN PARED',
  // Los demás tipos ya están bien:
  // CARRIL DIN, CAJA MOLDEADA, ENVOLVENTE, SUPERFICIE, EMPOTRAR
  // Piloto luminoso, Contador eléctrico
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
  console.log(`🔧 FASE 3: Normalizar tipos de DP${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  // Buscar productos de DP
  const dpProducts = await fetchAll('products', 'familia=eq.DISTRIBUCION%20DE%20POTENCIA');
  console.log(`📊 Productos de DP: ${dpProducts.length}`);

  // Agrupar por tipo
  const byTipo = {};
  dpProducts.forEach(p => {
    const tipo = p.tipo || 'SIN TIPO';
    byTipo[tipo] = (byTipo[tipo] || 0) + 1;
  });

  console.log('\n📦 Tipos actuales en DP:');
  for (const [tipo, count] of Object.entries(byTipo).sort((a, b) => b[1] - a[1])) {
    const newTipo = TIPO_NORMALIZATION[tipo];
    if (newTipo) {
      console.log(`   ${tipo}: ${count} → "${newTipo}"`);
    } else {
      console.log(`   ${tipo}: ${count} (OK)`);
    }
  }

  if (DRY_RUN) {
    console.log(`\n🔍 DRY RUN: Se actualizarían productos con tipos a normalizar`);
    return;
  }

  // Actualizar cada tipo que necesita normalización
  let totalUpdated = 0;
  for (const [oldTipo, newTipo] of Object.entries(TIPO_NORMALIZATION)) {
    const productsToUpdate = dpProducts.filter(p => p.tipo === oldTipo);
    if (productsToUpdate.length === 0) continue;

    console.log(`\n📝 Actualizando ${productsToUpdate.length} productos de "${oldTipo}" a "${newTipo}"...`);

    const updateUrl = `${SUPABASE_URL}/rest/v1/products?tipo=eq.${encodeURIComponent(oldTipo)}&familia=eq.DISTRIBUCION%20DE%20POTENCIA`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({ tipo: newTipo })
    });
    if (!updateRes.ok) {
      console.error(`   ❌ Error: ${updateRes.status}`);
      continue;
    }
    totalUpdated += productsToUpdate.length;
    console.log(`   ✅ ${productsToUpdate.length} productos actualizados`);
  }

  console.log(`\n✅ Total productos actualizados: ${totalUpdated}`);

  // Verificar
  const verifyProducts = await fetchAll('products', 'familia=eq.DISTRIBUCION%20DE%20POTENCIA');
  const verifyByTipo = {};
  verifyProducts.forEach(p => {
    const tipo = p.tipo || 'SIN TIPO';
    verifyByTipo[tipo] = (verifyByTipo[tipo] || 0) + 1;
  });

  console.log('\n📊 Tipos de DP después de la normalización:');
  for (const [tipo, count] of Object.entries(verifyByTipo).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${tipo}: ${count}`);
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

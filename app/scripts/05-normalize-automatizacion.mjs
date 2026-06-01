#!/usr/bin/env node
/**
 * FASE 2.2: Normalizar subfamilias de AUTOMATIZACION
 * Usar el campo "tipo" para crear subfamilias específicas
 * Ejecutar: node scripts/05-normalize-automatizacion.mjs [--dry-run]
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

// Mapeo tipo → nueva subfamilia
const TIPO_TO_SUBFAMILIA = {
  'Variador Frecuencia': 'Variador de Frecuencia',
  'Autómata Programable': 'Autómata Programable',
  'Relé Térmico': 'Relé Térmico',
  'Contactor Industrial': 'Contactor Industrial',
  'Interruptor Motor': 'Interruptor Motor',
  'Sistema Control': 'Sistema de Control',
  'Soft Starter': 'Arrancador Suave',
  'Actuador Válvula': 'Actuador de Válvula',
  'CARRIL DIN': 'Automatización',  // fallback para los que no se pueden clasificar
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
  console.log(`🔧 FASE 2.2: Normalizar subfamilias de AUTOMATIZACION${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  // Buscar productos de AUTOMATIZACION con subfamilia "Automatización"
  const products = await fetchAll('products', 'familia=eq.AUTOMATIZACION&subfamilia=eq.Automatizaci%C3%B3n');
  console.log(`📊 Productos encontrados con subfamilia "Automatización": ${products.length}`);

  if (products.length === 0) {
    console.log('✅ No hay productos con subfamilia "Automatización". Nada que hacer.');
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
    const newSub = TIPO_TO_SUBFAMILIA[tipo] || 'Automatización';
    console.log(`   ${tipo}: ${count} → "${newSub}"`);
  }

  if (DRY_RUN) {
    console.log(`\n🔍 DRY RUN: Se actualizarían ${products.length} productos`);
    return;
  }

  // Actualizar cada producto
  let updated = 0;
  for (const product of products) {
    const newSubfamilia = TIPO_TO_SUBFAMILIA[product.tipo] || 'Automatización';
    if (newSubfamilia === product.subfamilia) continue; // No cambiar si ya está correcto

    const updateUrl = `${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({ subfamilia: newSubfamilia })
    });
    if (!updateRes.ok) {
      console.error(`   ❌ Error actualizando ${product.ref_fabricante}: ${updateRes.status}`);
      continue;
    }
    updated++;
  }

  console.log(`\n✅ ${updated} productos actualizados`);

  // Verificar
  const verifyProducts = await fetchAll('products', 'familia=eq.AUTOMATIZACION');
  const subfamilias = {};
  verifyProducts.forEach(p => {
    subfamilias[p.subfamilia] = (subfamilias[p.subfamilia] || 0) + 1;
  });

  console.log('\n📊 Subfamilias de AUTOMATIZACION después de la normalización:');
  for (const [sub, count] of Object.entries(subfamilias).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${sub}: ${count}`);
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

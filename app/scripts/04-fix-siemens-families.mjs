#!/usr/bin/env node
/**
 * FASE 1.3: Corregir familias de productos Siemens fuera de DP
 * Ejecutar: node scripts/04-fix-siemens-families.mjs [--dry-run]
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

// Mapeo de correcciones
const FIXES = [
  {
    ref: '7KG96611EB11',
    currentFamilia: 'MEDICION',
    newFamilia: 'INSTALACION',
    newSubfamilia: 'Contador Eléctrico',
    reason: 'Energy Meter → pertenece a INSTALACION'
  },
  {
    ref: '6ES72121HE430XB8',
    currentFamilia: 'AUTOMACION INDUSTRIAL',
    newFamilia: 'AUTOMATIZACION',
    newSubfamilia: 'Autómata Programable',
    reason: 'PLC S7-1200 → pertenece a AUTOMATIZACION'
  }
];

async function main() {
  console.log(`🔧 FASE 1.3: Corregir familias de productos Siemens${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  for (const fix of FIXES) {
    console.log(`\n📦 Buscando producto: ${fix.ref}...`);
    const url = `${SUPABASE_URL}/rest/v1/products?select=id,ref_fabricante,name,familia,subfamilia,tipo,marca&ref_fabricante=eq.${fix.ref}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const products = await res.json();

    if (products.length === 0) {
      console.log(`   ⚠️  Producto ${fix.ref} no encontrado`);
      continue;
    }

    const product = products[0];
    console.log(`   Encontrado: ${product.name}`);
    console.log(`   Familia actual: ${product.familia}`);
    console.log(`   Subfamilia actual: ${product.subfamilia}`);
    console.log(`   Razón: ${fix.reason}`);

    if (DRY_RUN) {
      console.log(`   🔍 DRY RUN: Se actualizaría a familia="${fix.newFamilia}", subfamilia="${fix.newSubfamilia}"`);
      continue;
    }

    // Actualizar
    const updateUrl = `${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({
        familia: fix.newFamilia,
        subfamilia: fix.newSubfamilia
      })
    });
    if (!updateRes.ok) throw new Error(`Error actualizando ${fix.ref}: ${updateRes.status}`);
    console.log(`   ✅ Actualizado a familia="${fix.newFamilia}", subfamilia="${fix.newSubfamilia}"`);
  }

  console.log('\n✅ FASE 1.3 completada');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

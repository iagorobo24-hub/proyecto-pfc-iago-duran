#!/usr/bin/env node
/**
 * FASE 1.2: Corregir subfamilia "Contactores" → "Contactor"
 * Ejecutar: node scripts/03-fix-contactores.mjs [--dry-run]
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

const HEADERS = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json'
};

async function main() {
  console.log(`🔧 FASE 1.2: Corregir "Contactores" → "Contactor"${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  // Buscar productos con subfamilia "Contactores"
  const url = `${SUPABASE_URL}/rest/v1/products?select=id,ref_fabricante,name,subfamilia,familia&subfamilia=eq.Contactores`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  const products = await res.json();

  console.log(`📊 Productos encontrados con subfamilia "Contactores": ${products.length}`);

  if (products.length === 0) {
    console.log('✅ No hay productos con subfamilia "Contactores". Nada que hacer.');
    return;
  }

  products.forEach(p => {
    console.log(`   - ${p.ref_fabricante}: ${p.name} (familia: ${p.familia})`);
  });

  if (DRY_RUN) {
    console.log(`\n🔍 DRY RUN: Se actualizarían ${products.length} productos`);
    return;
  }

  // Actualizar
  console.log(`\n📝 Actualizando ${products.length} productos...`);
  const updateUrl = `${SUPABASE_URL}/rest/v1/products?subfamilia=eq.Contactores`;
  const updateRes = await fetch(updateUrl, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ subfamilia: 'Contactor' })
  });
  if (!updateRes.ok) throw new Error(`Error actualizando: ${updateRes.status}`);
  console.log(`✅ ${products.length} productos actualizados de "Contactores" a "Contactor"`);

  // Verificar
  const verifyUrl = `${SUPABASE_URL}/rest/v1/products?select=count&subfamilia=eq.Contactores`;
  const verifyRes = await fetch(verifyUrl, {
    headers: { ...HEADERS, 'Prefer': 'count=exact', 'Range': '0-0' }
  });
  const range = verifyRes.headers.get('content-range');
  const remaining = range ? parseInt(range.match(/\/(\d+)$/)?.[1] || '0') : 0;
  console.log(`\n📊 Verificación: ${remaining} productos con subfamilia "Contactores" restantes`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

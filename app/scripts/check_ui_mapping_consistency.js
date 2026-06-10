#!/usr/bin/env node
/**
 * UI Mapping Consistency Auditor — check_ui_mapping_consistency.js
 * Verifies that all subfamilies and types in Supabase are mapped in app/src/data/categories.ts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

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
  console.error('❌ Error: Supabase credentials not found in env or app/.env file.');
  process.exit(1);
}

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

// Fetch unique fields from products
async function fetchProductsCategoryFields() {
  const all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    // Only fetch necessary fields to minimize data payload
    const url = `${SUPABASE_URL}/rest/v1/products?select=familia,subfamilia,tipo&limit=${limit}&offset=${offset}&order=id`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error fetching products: ${res.status} - ${text}`);
    }
    const data = await res.json();
    all.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }
  return all;
}

// Dynamically load categories mapping
async function loadCategories() {
  const categoriesPath = path.join(__dirname, '../src/data/categories.ts');
  if (!fs.existsSync(categoriesPath)) {
    console.error(`❌ categories.ts not found at ${categoriesPath}`);
    return null;
  }
  
  const content = fs.readFileSync(categoriesPath, 'utf8');
  let jsContent = content
    .replace(/import type[\s\S]*?from.*/g, '')
    .replace(/: Record<[^>]+>/g, '')
    .replace(/: CategoryMeta/g, '')
    .replace(/:\s*\{\s*categoria:\s*string;\s*subcategoria:\s*string\s*\}\s*\|\s*null/g, '')
    .replace(/:\s*CategoryMeta/g, '')
    .replace(/:\s*string/g, '');

  const tempJsPath = path.join(__dirname, 'temp_categories_for_ui_audit.js');
  fs.writeFileSync(tempJsPath, jsContent);
  
  try {
    const fileUrl = pathToFileURL(tempJsPath).href;
    const module = await import(fileUrl);
    fs.unlinkSync(tempJsPath);
    return module;
  } catch (err) {
    console.error('⚠️ Error loading categories dynamically:', err.message);
    if (fs.existsSync(tempJsPath)) fs.unlinkSync(tempJsPath);
    return null;
  }
}

async function main() {
  console.log('======================================================');
  console.log('🔍 INICIANDO AUDITORÍA DE CONSISTENCIA DE CATEGORÍAS UI');
  console.log('======================================================\n');

  console.log('⌛ Cargando datos...');
  const [productsData, categoriesModule] = await Promise.all([
    fetchProductsCategoryFields(),
    loadCategories()
  ]);

  if (!categoriesModule) {
    console.error('❌ Error: No se pudo cargar el módulo categories.ts');
    process.exit(1);
  }

  const { SUBCATEGORIA_A_CATEGORIA, CATEGORIA_ICONOS, SUBCATEGORIA_ETIQUETAS, getCategoria } = categoriesModule;

  // Find unique combinations of familia + subfamilia + tipo in database
  const dbCombinationsMap = {};
  productsData.forEach(p => {
    const key = `${p.familia || ''} | ${p.subfamilia || ''} | ${p.tipo || ''}`;
    if (!dbCombinationsMap[key]) {
      dbCombinationsMap[key] = {
        familia: p.familia || '',
        subfamilia: p.subfamilia || '',
        tipo: p.tipo || '',
        count: 0
      };
    }
    dbCombinationsMap[key].count++;
  });

  const dbCombinations = Object.values(dbCombinationsMap);
  console.log(`📊 Combinaciones únicas en la base de datos (Familia | Subfamilia | Tipo): ${dbCombinations.length}`);
  console.log(`🏷️  Subfamilias registradas en categories.ts: ${Object.keys(SUBCATEGORIA_A_CATEGORIA).length}\n`);

  let unmappedSubfamilies = {};
  let missingSubcategoriesMap = {};
  let missingCategoriesMap = {};
  let missingEtiquetasMap = {};

  dbCombinations.forEach(comb => {
    const { familia, subfamilia, tipo, count } = comb;

    if (!subfamilia) return; // Handled in check_classification

    // 1. Verify subfamilia exists in mapping
    const mapping = SUBCATEGORIA_A_CATEGORIA[subfamilia];
    if (!mapping) {
      if (!unmappedSubfamilies[subfamilia]) {
        unmappedSubfamilies[subfamilia] = {
          familia,
          example_tipo: tipo,
          product_count: 0
        };
      }
      unmappedSubfamilies[subfamilia].product_count += count;
      return;
    }

    // 2. Verify dynamic/static subcategoria
    let finalSubcat = '';
    if (typeof mapping.subcategoria === 'object') {
      finalSubcat = mapping.subcategoria[tipo] || mapping.subcategoria['default'];
      if (!finalSubcat) {
        const key = `${subfamilia} (tipo: ${tipo})`;
        if (!missingSubcategoriesMap[key]) {
          missingSubcategoriesMap[key] = {
            subfamilia,
            tipo,
            product_count: 0
          };
        }
        missingSubcategoriesMap[key].product_count += count;
      }
    } else {
      finalSubcat = mapping.subcategoria;
    }

    // 3. Verify target category exists in UI config
    const targetCategory = mapping.categoria;
    if (targetCategory && !CATEGORIA_ICONOS[targetCategory]) {
      if (!missingCategoriesMap[targetCategory]) {
        missingCategoriesMap[targetCategory] = {
          subfamilia,
          product_count: 0
        };
      }
      missingCategoriesMap[targetCategory].product_count += count;
    }

    // 4. Verify subcategory label key is mapped in SUBCATEGORIA_ETIQUETAS
    if (finalSubcat && !SUBCATEGORIA_ETIQUETAS[finalSubcat]) {
      if (!missingEtiquetasMap[finalSubcat]) {
        missingEtiquetasMap[finalSubcat] = {
          subfamilia,
          tipo,
          product_count: 0
        };
      }
      missingEtiquetasMap[finalSubcat].product_count += count;
    }
  });

  const unmappedKeys = Object.keys(unmappedSubfamilies);
  const missingSubcatKeys = Object.keys(missingSubcategoriesMap);
  const missingCatKeys = Object.keys(missingCategoriesMap);
  const missingEtiquetaKeys = Object.keys(missingEtiquetasMap);

  console.log('======================================================');
  console.log('📊 RESULTADOS DE CONSISTENCIA DE MAPEO');
  console.log('======================================================');

  // 1. Missing Subfamilies (CRITICAL)
  console.log(`\n❌ Subfamilias de la DB NO registradas en categories.ts (Total: ${unmappedKeys.length}):`);
  if (unmappedKeys.length > 0) {
    unmappedKeys.forEach(sf => {
      const info = unmappedSubfamilies[sf];
      console.log(`  - "${sf}" [Familia: ${info.familia}] (${info.product_count} productos) -> Ej. tipo: "${info.example_tipo}"`);
    });
  } else {
    console.log('  ✅ Todas las subfamilias de la DB están en categories.ts');
  }

  // 2. Missing Subcategories for object mappings (CRITICAL)
  console.log(`\n❌ Tipos específicos no resueltos por mapeo dinámico (Total: ${missingSubcatKeys.length}):`);
  if (missingSubcatKeys.length > 0) {
    missingSubcatKeys.forEach(k => {
      const info = missingSubcategoriesMap[k];
      console.log(`  - Subfamilia: "${info.subfamilia}", Tipo: "${info.tipo}" (${info.product_count} productos)`);
    });
  } else {
    console.log('  ✅ No hay problemas de mapeo dinámico por tipo.');
  }

  // 3. Mismatched Categories (CRITICAL)
  console.log(`\n❌ Categorías de UI mapeadas pero inexistentes en CATEGORIA_ICONOS (Total: ${missingCatKeys.length}):`);
  if (missingCatKeys.length > 0) {
    missingCatKeys.forEach(c => {
      const info = missingCategoriesMap[c];
      console.log(`  - Categoría UI: "${c}" (usada por subfamilia "${info.subfamilia}", afecta a ${info.product_count} productos)`);
    });
  } else {
    console.log('  ✅ Todas las categorías UI mapeadas existen en CATEGORIA_ICONOS.');
  }

  // 4. Missing Labels in SUBCATEGORIA_ETIQUETAS (WARNING)
  console.log(`\n⚠️  Etiquetas de Subcategoría ausentes en SUBCATEGORIA_ETIQUETAS (Total: ${missingEtiquetaKeys.length}):`);
  if (missingEtiquetaKeys.length > 0) {
    missingEtiquetaKeys.forEach(label => {
      const info = missingEtiquetasMap[label];
      console.log(`  - Clave de etiqueta: "${label}" (usada por subfamilia "${info.subfamilia}", afecta a ${info.product_count} productos)`);
    });
  } else {
    console.log('  ✅ Todas las etiquetas de subcategoría están en SUBCATEGORIA_ETIQUETAS.');
  }

  console.log('\n======================================================');
  console.log('📊 RESUMEN FINAL:');
  console.log(`  - Subfamilias sin registrar: ${unmappedKeys.length}`);
  console.log(`  - Mapeos dinámicos fallidos: ${missingSubcatKeys.length}`);
  console.log(`  - Categorías inexistentes: ${missingCatKeys.length}`);
  console.log(`  - Etiquetas ausentes: ${missingEtiquetaKeys.length}`);
  console.log('======================================================');

  // Exits with error if there are unregistered subfamilies, failed dynamic mappings, or missing categories.
  const hasCritical = unmappedKeys.length > 0 || missingSubcatKeys.length > 0 || missingCatKeys.length > 0;
  if (hasCritical) {
    console.log('\n❌ AUDITORÍA FALLIDA: Existen inconsistencias críticas de mapeo UI.');
    process.exit(1);
  } else {
    console.log('\n✅ AUDITORÍA EXITOSA: Todos los productos tienen mapeos UI coherentes.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('\n❌ Error catastrófico durante la auditoría de mapeo:', err);
  process.exit(1);
});

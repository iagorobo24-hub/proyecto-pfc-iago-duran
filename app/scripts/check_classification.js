#!/usr/bin/env node
/**
 * Catalog Classification Auditor — check_classification.js
 * Analyzes products in Supabase and reports errors, warnings, and statistics.
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

// Fetch helper
async function fetchAll(table, select = '*') {
  const all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}&limit=${limit}&offset=${offset}&order=id`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error fetching ${table}: ${res.status} - ${text}`);
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
    return { SUBCATEGORIA_A_CATEGORIA: {}, FULL_CATEGORY_INFO: {} };
  }
  
  const content = fs.readFileSync(categoriesPath, 'utf8');
  let jsContent = content
    .replace(/import type[\s\S]*?from.*/g, '')
    .replace(/: Record<[^>]+>/g, '')
    .replace(/: CategoryMeta/g, '')
    .replace(/:\s*\{\s*categoria:\s*string;\s*subcategoria:\s*string\s*\}\s*\|\s*null/g, '')
    .replace(/:\s*CategoryMeta/g, '')
    .replace(/:\s*string/g, '');

  const tempJsPath = path.join(__dirname, 'temp_categories_for_audit.js');
  fs.writeFileSync(tempJsPath, jsContent);
  
  try {
    const fileUrl = pathToFileURL(tempJsPath).href;
    const { SUBCATEGORIA_A_CATEGORIA, FULL_CATEGORY_INFO } = await import(fileUrl);
    fs.unlinkSync(tempJsPath);
    return { SUBCATEGORIA_A_CATEGORIA, FULL_CATEGORY_INFO };
  } catch (err) {
    console.error('⚠️ Error loading categories dynamically:', err.message);
    if (fs.existsSync(tempJsPath)) fs.unlinkSync(tempJsPath);
    return { SUBCATEGORIA_A_CATEGORIA: {}, FULL_CATEGORY_INFO: {} };
  }
}

async function main() {
  console.log('======================================================');
  console.log('🔍 INICIANDO AUDITORÍA DE CLASIFICACIÓN DEL CATÁLOGO');
  console.log('======================================================\n');

  console.log('⌛ Cargando datos...');
  const [products, brandsData, categoriesConfig] = await Promise.all([
    fetchAll('products', 'id,ref_fabricante,name,marca,brand_id,familia,subfamilia,tipo,Gama,Subgama,precio,imagen,pdf_url,VALIDADO_MANUAL'),
    fetchAll('brands', 'id,name'),
    loadCategories()
  ]);

  const { FULL_CATEGORY_INFO } = categoriesConfig;
  const validFamilies = Object.keys(FULL_CATEGORY_INFO).map(f => f.toUpperCase());

  const brandMap = {};
  brandsData.forEach(b => {
    brandMap[b.id] = b.name;
  });

  console.log(`📊 Total productos cargados: ${products.length}`);
  console.log(`🏢 Total marcas cargadas: ${brandsData.length}\n`);

  let criticalErrors = [];
  let warnings = [];
  
  // Statistical counts
  const familyCounts = {};
  const subfamilyCounts = {};
  const typeCounts = {};
  const brandCounts = {};

  for (const p of products) {
    // 1. Check Brand counts
    brandCounts[p.marca || 'SÍN MARCA'] = (brandCounts[p.marca || 'SÍN MARCA'] || 0) + 1;
    if (p.familia) familyCounts[p.familia] = (familyCounts[p.familia] || 0) + 1;
    if (p.subfamilia) subfamilyCounts[p.subfamilia] = (subfamilyCounts[p.subfamilia] || 0) + 1;
    if (p.tipo) typeCounts[p.tipo] = (typeCounts[p.tipo] || 0) + 1;

    // 2. Scan for empty, legacy, or broken names
    if (!p.name || p.name.trim() === '') {
      criticalErrors.push({
        id: p.id,
        ref: p.ref_fabricante,
        marca: p.marca,
        issue: 'Nombre de producto vacío o nulo'
      });
    } else {
      const lowerName = p.name.toLowerCase();
      if (lowerName.includes('access denied') || lowerName.includes('access_denied')) {
        criticalErrors.push({
          id: p.id,
          ref: p.ref_fabricante,
          marca: p.marca,
          issue: 'Nombre bloqueado por WAF ("Access Denied")'
        });
      } else if (lowerName === 'todos los productos') {
        criticalErrors.push({
          id: p.id,
          ref: p.ref_fabricante,
          marca: p.marca,
          issue: 'Nombre es un placeholder genérico ("Todos los Productos")'
        });
      } else if (lowerName === 'sin nombre' || lowerName === 'sin_nombre') {
        criticalErrors.push({
          id: p.id,
          ref: p.ref_fabricante,
          marca: p.marca,
          issue: 'Nombre es un placeholder ("Sin nombre")'
        });
      }
    }

    // 3. Scan for empty / invalid manufacturer reference (ref_fabricante)
    if (!p.ref_fabricante || p.ref_fabricante.trim() === '') {
      criticalErrors.push({
        id: p.id,
        ref: p.ref_fabricante,
        marca: p.marca,
        issue: 'Referencia de fabricante vacía o nula'
      });
    }

    // 4. Scan for brand mismatches
    if (!p.brand_id) {
      criticalErrors.push({
        id: p.id,
        ref: p.ref_fabricante,
        marca: p.marca,
        issue: 'brand_id nulo o ausente'
      });
    } else {
      const associatedBrandName = brandMap[p.brand_id];
      if (!associatedBrandName) {
        criticalErrors.push({
          id: p.id,
          ref: p.ref_fabricante,
          marca: p.marca,
          issue: `brand_id (${p.brand_id}) no corresponde a ninguna marca registrada`
        });
      } else if (associatedBrandName.toLowerCase() !== p.marca?.toLowerCase()) {
        criticalErrors.push({
          id: p.id,
          ref: p.ref_fabricante,
          marca: p.marca,
          issue: `Discrepancia de marca: marca="${p.marca}", pero brand_id vincula a "${associatedBrandName}"`
        });
      }
    }

    // 5. Scan for classification errors
    if (!p.familia || p.familia.trim() === '') {
      criticalErrors.push({
        id: p.id,
        ref: p.ref_fabricante,
        marca: p.marca,
        issue: 'Familia vacía o nulo'
      });
    } else {
      const upperFamily = p.familia.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const possibleKeys = [
        upperFamily,
        upperFamily.replace(/\s+/g, '_'),
        upperFamily.replace(/_/g, ' ')
      ];
      const isValid = possibleKeys.some(key => validFamilies.includes(key));
      if (!isValid) {
        criticalErrors.push({
          id: p.id,
          ref: p.ref_fabricante,
          marca: p.marca,
          issue: `Familia inválida o no registrada en categories.ts: "${p.familia}"`
        });
      }
    }

    if (!p.subfamilia || p.subfamilia.trim() === '') {
      criticalErrors.push({
        id: p.id,
        ref: p.ref_fabricante,
        marca: p.marca,
        issue: 'Subfamilia vacía o nula'
      });
    } else {
      // Common plural vs singular inconsistencies
      const sf = p.subfamilia.trim();
      if (sf.toLowerCase() === 'contactores') {
        criticalErrors.push({
          id: p.id,
          ref: p.ref_fabricante,
          marca: p.marca,
          issue: `Subfamilia con plural incorrecto: "Contactores" (debe ser "Contactor")`
        });
      }
      if (sf.toLowerCase() === 'interruptores magnetotermicos' || sf.toLowerCase() === 'magnetotermicos') {
        criticalErrors.push({
          id: p.id,
          ref: p.ref_fabricante,
          marca: p.marca,
          issue: `Subfamilia inconsistente: "${sf}" (debe ser "Interruptor Magnetotérmico")`
        });
      }
      if (sf === p.familia) {
        criticalErrors.push({
          id: p.id,
          ref: p.ref_fabricante,
          marca: p.marca,
          issue: `Estructura incorrecta: Subfamilia tiene exactamente el mismo valor que Familia ("${sf}")`
        });
      }
    }

    if (!p.tipo || p.tipo.trim() === '') {
      criticalErrors.push({
        id: p.id,
        ref: p.ref_fabricante,
        marca: p.marca,
        issue: 'Tipo vacío o nulo'
      });
    } else {
      if (p.tipo === p.subfamilia) {
        warnings.push({
          id: p.id,
          ref: p.ref_fabricante,
          marca: p.marca,
          issue: `Tipo es idéntico a Subfamilia ("${p.tipo}")`
        });
      }
    }

    // 6. Warnings (Prices, Images, PDFs, Gamas for key brands)
    if (p.precio < 0) {
      criticalErrors.push({
        id: p.id,
        ref: p.ref_fabricante,
        marca: p.marca,
        issue: `Precio negativo: ${p.precio}`
      });
    } else if (p.precio === 0 || p.precio === null || p.precio === undefined) {
      warnings.push({
        id: p.id,
        ref: p.ref_fabricante,
        marca: p.marca,
        issue: 'Precio es 0 o nulo'
      });
    }

    if (!p.imagen || p.imagen.trim() === '') {
      warnings.push({
        id: p.id,
        ref: p.ref_fabricante,
        marca: p.marca,
        issue: 'Producto sin URL de imagen'
      });
    }

    if (!p.pdf_url || p.pdf_url.trim() === '') {
      warnings.push({
        id: p.id,
        ref: p.ref_fabricante,
        marca: p.marca,
        issue: 'Producto sin URL de hoja técnica PDF'
      });
    }

    // Brand-specific Gama/Subgama validation (Schneider, Siemens)
    if (['schneider electric', 'siemens'].includes(p.marca?.toLowerCase())) {
      if (!p.Gama || p.Gama.trim() === '') {
        warnings.push({
          id: p.id,
          ref: p.ref_fabricante,
          marca: p.marca,
          issue: `Marca "${p.marca}" debería tener una Gama asignada`
        });
      }
      if (!p.Subgama || p.Subgama.trim() === '') {
        warnings.push({
          id: p.id,
          ref: p.ref_fabricante,
          marca: p.marca,
          issue: `Marca "${p.marca}" debería tener una Subgama asignada`
        });
      }
    }
  }

  // OUTPUT AUDIT REPORT
  console.log('======================================================');
  console.log('📊 RESUMEN DE ESTADÍSTICAS DEL CATÁLOGO');
  console.log('======================================================');
  
  console.log('\n🏢 PRODUCTOS POR MARCA:');
  Object.entries(brandCounts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => {
    console.log(`  - ${k}: ${v} productos`);
  });

  console.log('\n⚡ PRODUCTOS POR FAMILIA:');
  Object.entries(familyCounts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => {
    console.log(`  - ${k}: ${v} productos`);
  });

  console.log('\n🔧 TOP 10 SUBFAMILIAS MÁS COMUNES:');
  Object.entries(subfamilyCounts).sort((a,b) => b[1]-a[1]).slice(0, 10).forEach(([k,v]) => {
    console.log(`  - ${k}: ${v} productos`);
  });

  console.log('\n======================================================');
  console.log(`❌ CRITICAL ERRORS ENCONTRADOS: ${criticalErrors.length}`);
  console.log('======================================================');
  
  if (criticalErrors.length > 0) {
    const errorCountByIssue = {};
    criticalErrors.forEach(e => {
      errorCountByIssue[e.issue] = (errorCountByIssue[e.issue] || 0) + 1;
    });
    
    Object.entries(errorCountByIssue).forEach(([issue, count]) => {
      console.log(`  - ${issue}: ${count} incidencias`);
    });

    console.log('\n🔍 Muestra de primeros 10 errores críticos:');
    criticalErrors.slice(0, 10).forEach((e, idx) => {
      console.log(`  [${idx+1}] ID: ${e.id} | Ref: ${e.ref} | Marca: ${e.marca} -> ${e.issue}`);
    });
  } else {
    console.log('  ✅ ¡No se han encontrado errores críticos de clasificación!');
  }

  console.log('\n======================================================');
  console.log(`⚠️  WARNINGS ENCONTRADOS: ${warnings.length}`);
  console.log('======================================================');
  
  if (warnings.length > 0) {
    const warnCountByIssue = {};
    warnings.forEach(w => {
      warnCountByIssue[w.issue] = (warnCountByIssue[w.issue] || 0) + 1;
    });
    
    Object.entries(warnCountByIssue).forEach(([issue, count]) => {
      console.log(`  - ${issue}: ${count} incidencias`);
    });

    console.log('\n🔍 Muestra de primeros 5 warnings:');
    warnings.slice(0, 5).forEach((w, idx) => {
      console.log(`  [${idx+1}] ID: ${w.id} | Ref: ${w.ref} | Marca: ${w.marca} -> ${w.issue}`);
    });
  }

  // Save audit results to a JSON file for detailed examination
  const reportPath = path.join(__dirname, 'catalog_audit_results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total_products: products.length,
    counts: {
      brands: brandCounts,
      families: familyCounts,
      subfamilies: subfamilyCounts,
      types: typeCounts
    },
    critical_errors: {
      count: criticalErrors.length,
      details: criticalErrors
    },
    warnings: {
      count: warnings.length,
      details: warnings
    }
  }, null, 2));
  
  console.log(`\n💾 Reporte completo guardado en: ${reportPath}`);

  if (criticalErrors.length > 0) {
    console.log('\n❌ AUDITORÍA FALLIDA: Se requiere corregir errores de consistencia.');
    process.exit(1);
  } else {
    console.log('\n✅ AUDITORÍA EXITOSA: Catálogo coherente y consistente.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('\n❌ Error catastrófico durante la auditoría:', err);
  process.exit(1);
});

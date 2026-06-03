#!/usr/bin/env node
/**
 * Script para analizar variaciones de nombres en subfamilias, tipos, gamas y subgamas
 * y generar SQL de unificación para Supabase
 */

const fs = require('fs');
const https = require('https');

const envPath = '/home/abu/github_repos/proyecto-pfc-iago-duran/app/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

let URL = '';
let KEY = '';

for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    URL = line.split('=')[1].trim();
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    KEY = line.split('=')[1].trim();
  }
}

const BATCH_SIZE = 1000;

function queryProducts(offset = 0, limit = BATCH_SIZE) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      select: 'id,familia,subfamilia,tipo,marca,brand_id,Gama,Subgama',
      limit: limit.toString(),
      offset: offset.toString()
    });

    const target = URL + '/rest/v1/products?' + params.toString();

    const req = https.request(target, {
      method: 'GET',
      headers: {
        apikey: KEY,
        Authorization: 'Bearer ' + KEY,
        Prefer: 'return=representation',
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        if (res.statusCode !== 200) {
          reject(new Error(`Status ${res.statusCode}: ${text.slice(0, 200)}`));
          return;
        }
        try {
          const data = JSON.parse(text);
          resolve(data);
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function fetchAllProducts() {
  console.log('🚀 Descargando todos los productos...\n');
  
  const allProducts = [];
  let offset = 0;
  let hasMore = true;
  let batchNum = 0;

  while (hasMore) {
    batchNum++;
    console.log(`📦 Batch ${batchNum} (offset: ${offset})...`);
    
    const batch = await queryProducts(offset, BATCH_SIZE);
    allProducts.push(...batch);
    
    if (batch.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      offset += BATCH_SIZE;
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  return allProducts;
}

/**
 * Normaliza un string para comparar (minúsculas, sin tildes, trim)
 */
function normalize(str) {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove tildes
    .replace(/ñ/g, 'nn');
}

/**
 * Analiza variaciones de un campo específico
 */
function analyzeFieldVariations(products, fieldName) {
  const variations = new Map(); // normalized -> [original values]
  
  products.forEach(p => {
    const value = p[fieldName];
    if (!value || typeof value !== 'string') return;
    
    const normalized = normalize(value);
    if (!normalized) return;
    
    if (!variations.has(normalized)) {
      variations.set(normalized, new Set());
    }
    variations.get(normalized).add(value);
  });
  
  // Filtrar solo los que tienen múltiples variaciones
  const multiVariations = [];
  variations.forEach((values, normalized) => {
    if (values.size > 1) {
      multiVariations.push({
        normalized,
        variants: [...values].sort(),
        count: values.size
      });
    }
  });
  
  return multiVariations.sort((a, b) => b.count - a.count);
}

/**
 * Genera SQL de unificación
 */
function generateUnificationSQL(variations, fieldName, tableName = 'products') {
  if (variations.length === 0) {
    return `-- No hay variaciones para unificar en ${fieldName}\n`;
  }
  
  const lines = [
    `-- ============================================`,
    `-- UNIFICACIÓN: ${fieldName.toUpperCase()}`,
    `-- Variaciones encontradas: ${variations.length}`,
    `-- ============================================\n`
  ];
  
  variations.forEach((varData, idx) => {
    const canonical = varData.variants[0]; // El primero será el canónico
    const others = varData.variants.slice(1);
    
    lines.push(`-- Variación ${idx + 1}: "${canonical}" (${others.length} variantes)`);
    others.forEach(variant => {
      lines.push(`UPDATE ${tableName} SET ${fieldName} = '${canonical.replace(/'/g, "''")}' WHERE ${fieldName} = '${variant.replace(/'/g, "''")}';`);
    });
    lines.push('');
  });
  
  return lines.join('\n');
}

/**
 * Análisis completo
 */
async function main() {
  const products = await fetchAllProducts();
  
  console.log(`\n📊 Total productos: ${products.length}\n`);
  
  // Analizar cada campo
  const fields = ['subfamilia', 'tipo', 'Gama', 'Subgama'];
  const analyses = {};
  
  fields.forEach(field => {
    console.log(`🔍 Analizando variaciones en: ${field}...`);
    const variations = analyzeFieldVariations(products, field);
    analyses[field] = variations;
    console.log(`   ↳ ${variations.length} grupos con variaciones múltiples\n`);
  });
  
  // Generar reporte
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // 1. Reporte en texto
  const reportLines = [
    '= '.repeat(50),
    'REPORTE DE VARIACIONES DE NOMBRES',
    '= '.repeat(50),
    `Generado: ${new Date().toLocaleString('es-ES')}`,
    `Total productos analizados: ${products.length}\n`
  ];
  
  fields.forEach(field => {
    const variations = analyses[field];
    reportLines.push(`\n${'='.repeat(60)}`);
    reportLines.push(`CAMPO: ${field.toUpperCase()}`);
    reportLines.push(`Variaciones encontradas: ${variations.length} grupos\n`);
    
    if (variations.length === 0) {
      reportLines.push('  ✓ No hay variaciones (todos los valores son consistentes)\n');
    } else {
      variations.slice(0, 20).forEach((varData, idx) => {
        reportLines.push(`  ${idx + 1}. "${varData.variants[0]}" ← CANÓNICO`);
        varData.variants.slice(1).forEach(v => {
          reportLines.push(`     - "${v}"`);
        });
        reportLines.push(`     Total variantes: ${varData.count}\n`);
      });
      
      if (variations.length > 20) {
        reportLines.push(`  ... y ${variations.length - 20} grupos más (ver SQL completo)\n`);
      }
    }
  });
  
  const reportPath = `/home/abu/github_repos/proyecto-pfc-iago-duran/app/scripts/reporte_variaciones_${timestamp}.txt`;
  fs.writeFileSync(reportPath, reportLines.join('\n'));
  console.log(`📄 Reporte guardado: ${reportPath}`);
  
  // 2. Generar SQL de unificación
  let sqlContent = `-- ============================================
-- UNIFICACIÓN DE NOMBRES - SUPABASE
-- Generado: ${new Date().toLocaleString('es-ES')}
-- Total productos: ${products.length}
-- ============================================

-- INSTRUCCIONES:
-- 1. Revisa el reporte de variaciones primero
-- 2. Ejecuta este SQL en Supabase SQL Editor
-- 3. Verifica los cambios con un SELECT antes de COMMIT
-- 4. Los cambios son IRREVERSIBLES sin backup
-- ============================================

BEGIN;

`;
  
  fields.forEach(field => {
    sqlContent += generateUnificationSQL(analyses[field], field);
    sqlContent += '\n';
  });
  
  sqlContent += `
-- ============================================
-- VERIFICACIÓN POST-UNIFICACIÓN
-- ============================================

-- Verificar cuántos registros únicos hay ahora por campo
SELECT 
  'subfamilia' as campo, 
  COUNT(DISTINCT subfamilia) as unicos 
FROM products
UNION ALL
SELECT 
  'tipo' as campo, 
  COUNT(DISTINCT tipo) as unicos 
FROM products
UNION ALL
SELECT 
  'Gama' as campo, 
  COUNT(DISTINCT "Gama") as unicos 
FROM products
UNION ALL
SELECT 
  'Subgama' as campo, 
  COUNT(DISTINCT "Subgama") as unicos 
FROM products;

-- Si todo está bien, hacer COMMIT:
-- COMMIT;

-- Si algo salió mal, hacer ROLLBACK:
-- ROLLBACK;
`;
  
  const sqlPath = `/home/abu/github_repos/proyecto-pfc-iago-duran/app/scripts/unificacion_nombres_${timestamp}.sql`;
  fs.writeFileSync(sqlPath, sqlContent);
  console.log(`💾 SQL generado: ${sqlPath}`);
  
  // 3. Mostrar resumen
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMEN DE VARIACIONES ENCONTRADAS:');
  console.log('='.repeat(60));
  
  fields.forEach(field => {
    const variations = analyses[field];
    if (variations.length > 0) {
      console.log(`\n${field.toUpperCase()} (${variations.length} grupos):`);
      variations.slice(0, 5).forEach(v => {
        console.log(`  "${v.variants[0]}" ← ${v.variants.slice(1).length} variantes`);
      });
      if (variations.length > 5) {
        console.log(`  ... y ${variations.length - 5} grupos más`);
      }
    } else {
      console.log(`\n${field.toUpperCase()}: ✓ Sin variaciones`);
    }
  });
  
  console.log('\n✅ Archivos generados:');
  console.log(`   - Reporte: ${reportPath}`);
  console.log(`   - SQL: ${sqlPath}`);
  console.log('\n📝 Próximo paso: Revisa el SQL y ejecútalo en Supabase si es correcto.');
}

main().catch(console.error);
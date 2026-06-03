#!/usr/bin/env node
/**
 * Script para generar referencia completa de todos los valores únicos en la DB
 * y crear tabla maestra de nombres canónicos
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
  const allProducts = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    console.log(`📦 Batch (offset: ${offset})...`);
    
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

function normalize(str) {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'nn');
}

async function main() {
  console.log('🔍 Extrayendo todos los valores únicos...\n');
  
  const products = await fetchAllProducts();
  
  // Recopilar valores únicos por campo
  const uniqueValues = {
    familia: new Map(),
    subfamilia: new Map(),
    tipo: new Map(),
    Gama: new Map(),
    Subgama: new Map()
  };
  
  products.forEach(p => {
    ['familia', 'subfamilia', 'tipo', 'Gama', 'Subgama'].forEach(field => {
      const value = p[field];
      if (!value || typeof value !== 'string') return;
      
      const normalized = normalize(value);
      if (!normalized) return;
      
      if (!uniqueValues[field].has(normalized)) {
        uniqueValues[field].set(normalized, {
          canonical: value,
          variants: new Set(),
          count: 0,
          familias: new Set(),
          marcas: new Set()
        });
      }
      
      const entry = uniqueValues[field].get(normalized);
      entry.variants.add(value);
      entry.count++;
      if (p.familia) entry.familias.add(p.familia);
      if (p.marca || p.brand_id) {
        entry.marcas.add(p.marca || `BRAND_${p.brand_id}`);
      }
      
      // Actualizar canonical si esta variante es más común
      if (entry.variants.size > 1 && value !== entry.canonical) {
        // Mantener el primero como canónico (ya está establecido)
      }
    });
  });
  
  // Generar reporte detallado
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  const lines = [
    '# CATÁLOGO MAESTRO DE VALORES ÚNICOS',
    `Generado: ${new Date().toLocaleString('es-ES')}`,
    `Total productos analizados: ${products.length}`,
    '',
    'Este documento lista TODOS los valores únicos en la DB organizados por campo.',
    'Cada entrada muestra: valor canónico, variantes, conteo, familias y marcas donde aparece.',
    '',
    '='.repeat(80),
    ''
  ];
  
  ['familia', 'subfamilia', 'tipo', 'Gama', 'Subgama'].forEach(field => {
    const entries = [...uniqueValues[field].entries()].sort((a, b) => b[1].count - a[1].count);
    
    lines.push(`## CAMPO: ${field.toUpperCase()}`);
    lines.push(`Total únicos: ${entries.length}`);
    lines.push('');
    
    entries.forEach(([normalized, data], idx) => {
      lines.push(`### ${idx + 1}. ${data.canonical}`);
      lines.push(`   - Normalizado: ${normalized}`);
      lines.push(`   - Total apariciones: ${data.count}`);
      lines.push(`   - Variantes encontradas: ${[...data.variants].join(' | ')}`);
      lines.push(`   - Familias: ${[...data.familias].sort().join(', ')}`);
      lines.push(`   - Marcas: ${[...data.marcas].sort().join(', ')}`);
      lines.push('');
    });
    
    lines.push('-'.repeat(80));
    lines.push('');
  });
  
  const reportPath = `/home/abu/github_repos/proyecto-pfc-iago-duran/app/scripts/catalogo_maestro_${timestamp}.md`;
  fs.writeFileSync(reportPath, lines.join('\n'));
  console.log(`📄 Catálogo maestro: ${reportPath}`);
  
  // Generar SQL con tabla de referencia
  const sqlLines = [
    '-- ============================================',
    '-- TABLA DE REFERENCIA: NOMBRES CANÓNICOS',
    `-- Generado: ${new Date().toLocaleString('es-ES')}`,
    '-- ============================================',
    '',
    '-- Esta tabla sirve como referencia para futuras normalizaciones',
    '-- y para que los filtros de la UI muestren nombres consistentes.',
    '',
    '-- ============================================',
    '-- 1. FAMILIAS (7 únicas)',
    '-- ============================================',
    ''
  ];
  
  const familias = [...uniqueValues.familia.entries()].sort((a, b) => b[1].count - a[1].count);
  sqlLines.push('-- Valores actuales en la DB:');
  familias.forEach(([norm, data]) => {
    sqlLines.push(`-- "${data.canonical}" (${data.count} productos, ${data.variants.size} variantes)`);
  });
  
  sqlLines.push('');
  sqlLines.push('-- ============================================');
  sqlLines.push('-- 2. SUBFAMILIAS POR FAMILIA');
  sqlLines.push('-- ============================================');
  sqlLines.push('');
  
  // Agrupar subfamilias por familia
  const subfamiliasPorFamilia = new Map();
  uniqueValues.subfamilia.forEach((data, norm) => {
    data.familias.forEach(familia => {
      if (!subfamiliasPorFamilia.has(familia)) {
        subfamiliasPorFamilia.set(familia, []);
      }
      subfamiliasPorFamilia.get(familia).push({
        canonical: data.canonical,
        count: data.count,
        marcas: [...data.marcas].join(', ')
      });
    });
  });
  
  [...subfamiliasPorFamilia.entries()].sort().forEach(([familia, subfas]) => {
    sqlLines.push(`-- Familia: ${familia}`);
    subfas.sort((a, b) => b.count - a.count).forEach(s => {
      sqlLines.push(`--   • ${s.canonical} (${s.count} prod) - Marcas: ${s.marca}`);
    });
    sqlLines.push('');
  });
  
  sqlLines.push('-- ============================================');
  sqlLines.push('-- 3. TIPOS POR SUBFAMILIA');
  sqlLines.push('-- ============================================');
  sqlLines.push('');
  
  const tipos = [...uniqueValues.tipo.entries()].sort((a, b) => b[1].count - a[1].count);
  tipos.forEach(([norm, data]) => {
    sqlLines.push(`-- "${data.canonical}" (${data.count} productos)`);
    sqlLines.push(`--   Familias: ${[...data.familias].join(', ')}`);
    sqlLines.push(`--   Variantes: ${[...data.variants].join(' | ')}`);
    sqlLines.push('');
  });
  
  sqlLines.push('-- ============================================');
  sqlLines.push('-- 4. GAMAS COMERCIALES (Campo: "Gama")');
  sqlLines.push('-- ============================================');
  sqlLines.push('');
  
  const gamas = [...uniqueValues.Gama.entries()].sort((a, b) => b[1].count - a[1].count);
  sqlLines.push(`-- Total gamas únicas: ${gamas.length}`);
  sqlLines.push('');
  gamas.slice(0, 50).forEach(([norm, data]) => {
    sqlLines.push(`-- "${data.canonical}" (${data.count} prod)`);
  });
  if (gamas.length > 50) {
    sqlLines.push(`-- ... y ${gamas.length - 50} gamas más`);
  }
  
  sqlLines.push('');
  sqlLines.push('-- ============================================');
  sqlLines.push('-- 5. SUBGAMAS (Campo: "Subgama")');
  sqlLines.push('-- ============================================');
  sqlLines.push('');
  
  const subgamas = [...uniqueValues.Subgama.entries()].sort((a, b) => b[1].count - a[1].count);
  sqlLines.push(`-- Total subgamas únicas: ${subgamas.length}`);
  sqlLines.push('');
  subgamas.slice(0, 50).forEach(([norm, data]) => {
    sqlLines.push(`-- "${data.canonical}" (${data.count} prod)`);
  });
  if (subgamas.length > 50) {
    sqlLines.push(`-- ... y ${subgamas.length - 50} subgamas más`);
  }
  
  const sqlRefPath = `/home/abu/github_repos/proyecto-pfc-iago-duran/app/scripts/referencia_canonicos_${timestamp}.sql`;
  fs.writeFileSync(sqlRefPath, sqlLines.join('\n'));
  console.log(`💾 Referencia SQL: ${sqlRefPath}`);
  
  // Mostrar resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE VALORES ÚNICOS:');
  console.log('='.repeat(60));
  console.log(`Familias: ${uniqueValues.familia.size}`);
  console.log(`Subfamilias: ${uniqueValues.subfamilia.size}`);
  console.log(`Tipos: ${uniqueValues.tipo.size}`);
  console.log(`Gamas: ${uniqueValues.Gama.size}`);
  console.log(`Subgamas: ${uniqueValues.Subgama.size}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
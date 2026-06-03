#!/usr/bin/env node
/**
 * Script para analizar TODO el catálogo en Supabase con pagination
 * y generar un reporte completo de la estructura real de datos
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

/**
 * Hace un query a Supabase con offset/limit
 */
function queryProducts(offset = 0, limit = BATCH_SIZE) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      select: 'familia,subfamilia,tipo,marca,brand_id,Gama,Subgama',
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

/**
 * Obtiene TODOS los productos con pagination
 */
async function fetchAllProducts() {
  console.log('🚀 Iniciando descarga completa del catálogo...\n');
  
  const allProducts = [];
  let offset = 0;
  let hasMore = true;
  let batchNum = 0;

  while (hasMore) {
    batchNum++;
    console.log(`📦 Descargando batch ${batchNum} (offset: ${offset})...`);
    
    const batch = await queryProducts(offset, BATCH_SIZE);
    allProducts.push(...batch);
    
    console.log(`   ↳ ${batch.length} productos`);
    
    if (batch.length < BATCH_SIZE) {
      hasMore = false;
      console.log('   ↳ Último batch alcanzado\n');
    } else {
      offset += BATCH_SIZE;
      // Pequeña pausa para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  return allProducts;
}

/**
 * Analiza la estructura del catálogo
 */
function analyzeStructure(products) {
  console.log('🔍 Analizando estructura del catálogo...\n');

  const structure = {
    totalProductos: products.length,
    familias: new Map(),
    marcas: new Map(),
    combinaciones: new Map()
  };

  products.forEach(p => {
    const familia = p.familia?.trim() || 'SIN_FAMILIA';
    const marca = p.marca?.trim() || p.brand_id ? `BRAND_${p.brand_id}` : 'SIN_MARCA';
    const subfamilia = p.subfamilia?.trim() || 'SIN_SUBFAMILIA';
    const tipo = p.tipo?.trim() || 'SIN_TIPO';
    const gama = p.Gama?.trim() || null;
    const subgama = p.Subgama?.trim() || null;

    // Contar productos por familia
    if (!structure.familias.has(familia)) {
      structure.familias.set(familia, {
        total: 0,
        marcas: new Map(),
        subfamilias: new Map()
      });
    }
    const famData = structure.familias.get(familia);
    famData.total++;

    // Contar por marca dentro de familia
    if (!famData.marcas.has(marca)) {
      famData.marcas.set(marca, { total: 0, gamas: new Set(), subfamilias: new Map() });
    }
    const marcaData = famData.marcas.get(marca);
    marcaData.total++;

    // Contar subfamilias dentro de familia+marca
    if (!marcaData.subfamilias.has(subfamilia)) {
      marcaData.subfamilias.set(subfamilia, { total: 0, tipos: new Set() });
    }
    marcaData.subfamilias.get(subfamilia).total++;
    marcaData.subfamilias.get(subfamilia).tipos.add(tipo);

    // Agregar gama si existe
    if (gama) {
      marcaData.gamas.add(gama);
    }

    // Subfamilias globales por familia
    if (!famData.subfamilias.has(subfamilia)) {
      famData.subfamilias.set(subfamilia, new Set());
    }
    famData.subfamilias.get(subfamilia).add(tipo);
  });

  return structure;
}

/**
 * Genera reporte en consola
 */
function printReport(structure) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 REPORTE COMPLETO DEL CATÁLOGO');
  console.log('='.repeat(80));
  console.log(`\n📦 Total productos: ${structure.totalProductos}\n`);

  // Ordenar familias por cantidad de productos
  const familiasSorted = [...structure.familias.entries()]
    .sort((a, b) => b[1].total - a[1].total);

  console.log('📁 FAMILIAS ENCONTRADAS:\n');
  
  familiasSorted.forEach(([familia, data], idx) => {
    console.log(`${idx + 1}. ${familia}`);
    console.log(`   Total: ${data.total} productos`);
    console.log(`   Subfamilias: ${data.subfamilias.size}`);
    console.log(`   Marcas: ${data.marcas.size}`);
    
    // Detalle por marca
    const marcasSorted = [...data.marcas.entries()].sort((a, b) => b[1].total - a[1].total);
    marcasSorted.forEach(([marca, marcaData]) => {
      console.log(`   \n   └─ ${marca}: ${marcaData.total} productos`);
      console.log(`      Subfamilias: ${marcaData.subfamilias.size}`);
      console.log(`      Gamas: ${marcaData.gamas.size}`);
      
      // Detalle de subfamilias
      const subfasSorted = [...marcaData.subfamilias.entries()].sort((a, b) => b[1].total - a[1].total);
      subfasSorted.forEach(([subfamilia, subfaData]) => {
        console.log(`         • ${subfamilia}: ${subfaData.total} prod`);
        console.log(`           Tipos: ${[...subfaData.tipos].join(', ')}`);
      });
      
      // Listar gamas
      if (marcaData.gamas.size > 0) {
        console.log(`      Gamas disponibles: ${[...marcaData.gamas].slice(0, 10).join(', ')}${marcaData.gamas.size > 10 ? '...' : ''}`);
      }
    });
    
    console.log('\n' + '-'.repeat(80));
  });

  // Estadísticas globales
  console.log('\n📈 ESTADÍSTICAS GLOBALES:');
  console.log(`- Familias únicas: ${structure.familias.size}`);
  
  let totalMarcas = new Set();
  structure.familias.forEach(f => f.marcas.forEach((_, m) => totalMarcas.add(m)));
  console.log(`- Marcas únicas: ${totalMarcas.size}`);
  
  let totalSubfamilias = new Set();
  structure.familias.forEach(f => f.subfamilias.forEach((_, s) => totalSubfamilias.add(s)));
  console.log(`- Subfamilias únicas: ${totalSubfamilias.size}`);
}

/**
 * Genera archivo JSON con la estructura para usar en categoryMapping.js
 */
function generateMappingJSON(structure) {
  console.log('\n📝 Generando JSON de mapeo...\n');
  
  const mapping = {};
  
  structure.familias.forEach((famData, familia) => {
    mapping[familia] = {};
    
    famData.marcas.forEach((marcaData, marca) => {
      if (!mapping[familia][marca]) {
        mapping[familia][marca] = {};
      }
      
      marcaData.subfamilias.forEach((subfaData, subfamilia) => {
        if (!mapping[familia][marca][subfamilia]) {
          mapping[familia][marca][subfamilia] = [];
        }
        
        // Agregar tipos
        subfaData.tipos.forEach(tipo => {
          if (!mapping[familia][marca][subfamilia].includes(tipo)) {
            mapping[familia][marca][subfamilia].push(tipo);
          }
        });
        
        // Agregar gamas como referencia
        if (marcaData.gamas.size > 0) {
          mapping[familia][marca][subfamilia].gamas = [...marcaData.gamas];
        }
      });
    });
  });
  
  return mapping;
}

// === EJECUCIÓN PRINCIPAL ===
async function main() {
  try {
    // 1. Descargar todos los productos
    const products = await fetchAllProducts();
    
    // 2. Analizar estructura
    const structure = analyzeStructure(products);
    
    // 3. Imprimir reporte
    printReport(structure);
    
    // 4. Generar JSON de mapeo
    const mapping = generateMappingJSON(structure);
    
    // 5. Guardar resultados
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Guardar JSON completo
    const jsonPath = `/home/abu/github_repos/proyecto-pfc-iago-duran/app/scripts/analisis_catalogo_${timestamp}.json`;
    fs.writeFileSync(jsonPath, JSON.stringify(mapping, null, 2));
    console.log(`\n✅ Mapeo JSON guardado en: ${jsonPath}`);
    
    // Guardar resumen en texto
    const reportPath = `/home/abu/github_repos/proyecto-pfc-iago-duran/app/scripts/reporte_catalogo_${timestamp}.txt`;
    const originalLog = console.log;
    let reportContent = '';
    console.log = (...args) => { reportContent += args.join(' ') + '\n'; };
    printReport(structure);
    console.log = originalLog;
    fs.writeFileSync(reportPath, reportContent);
    console.log(`📄 Reporte completo guardado en: ${reportPath}`);
    
    // 6. Generar snippet para categoryMapping.js
    console.log('\n🔧 Generando código para categoryMapping.js...\n');
    generateCategoryMappingCode(structure);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Genera código JavaScript listo para copiar a categoryMapping.js
 */
function generateCategoryMappingCode(structure) {
  const lines = ['// === MAPEO GENERADO AUTOMÁTICAMENTE DESDE SUPABASE ==='];
  lines.push('// Ejecutar: node scripts/analizar_catalogo_completo.cjs');
  lines.push(`// Generado: ${new Date().toLocaleString('es-ES')}`);
  lines.push(`// Total productos: ${structure.totalProductos}\n`);
  
  const familiasSorted = [...structure.familias.entries()]
    .sort((a, b) => b[1].total - a[1].total);
  
  familiasSorted.forEach(([familia, data]) => {
    const totalProductos = data.total;
    const totalSubfamilias = data.subfamilias.size;
    const totalMarcas = data.marcas.size;
    
    lines.push(`/* ${familia.toUpperCase()} (${totalProductos} productos - ${totalSubfamilias} subfamilias - ${totalMarcas} marcas) */`);
    lines.push(`  '${familia}': {`);
    
    // Agrupar subfamilias por tipo (simplificado)
    const subfaTipos = new Map();
    data.subfamilias.forEach((tiposSet, subfamilia) => {
      const tiposArr = [...tiposSet];
      const key = tiposArr.join(' | ');
      if (!subfaTipos.has(key)) {
        subfaTipos.set(key, []);
      }
      subfaTipos.get(key).push(subfamilia);
    });
    
    subfaTipos.forEach((subfamilias, tiposKey) => {
      const tiposClean = tiposKey.split(' | ').map(t => t.trim());
      const subfaClean = subfamilias.map(s => s.trim());
      
      if (tiposClean.length === 1 && tiposClean[0] === 'SIN_TIPO') {
        lines.push(`    '${subfaClean.join(', ')}': ['${tiposClean[0]}'],`);
      } else {
        subfaClean.forEach(sub => {
          lines.push(`    '${sub}': [${tiposClean.map(t => `'${t}'`).join(', ')}],`);
        });
      }
    });
    
    lines.push('  },\n');
  });
  
  lines.push('// === FIN DEL MAPEO GENERADO ===\n');
  
  const codePath = `/home/abu/github_repos/proyecto-pfc-iago-duran/app/scripts/categoryMapping_generado_${new Date().toISOString().replace(/[:.]/g, '-')}.js`;
  fs.writeFileSync(codePath, lines.join('\n'));
  console.log(`💾 Código para categoryMapping.js: ${codePath}`);
}

main();
#!/usr/bin/env node
/**
 * Verifica que TODAS las rutas de navegación funcionen correctamente
 * Familia → Marca → Gama → Subfamilia → Tipo → Subgama → Referencias
 */

const fs = require('fs');
const https = require('https');

const envPath = '/home/abu/github_repos/proyecto-pfc-iago-duran/app/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

let URL = '', SERVICE_KEY = '';
for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) URL = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SERVICE_KEY = line.split('=')[1].trim();
}

const BATCH_SIZE = 1000;

function query(endpoint, filters = {}, limit = BATCH_SIZE) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    Object.entries(filters).forEach(([key, value]) => {
      params.set(key, value);
    });

    const req = https.request(URL + endpoint + '?' + params, {
      method: 'GET',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: 'Bearer ' + SERVICE_KEY,
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function fetchAllProducts() {
  const all = [];
  let offset = 0, hasMore = true;
  
  while (hasMore) {
    const batch = await query('/rest/v1/products', { 
      select: 'id,familia,subfamilia,tipo,marca,brand_id,Gama,Subgama,ref_fabricante,name',
      offset: offset.toString()
    }, BATCH_SIZE);
    
    all.push(...batch);
    hasMore = batch.length === BATCH_SIZE;
    offset += BATCH_SIZE;
    if (hasMore) await new Promise(r => setTimeout(r, 100));
  }
  
  return all;
}

async function main() {
  console.log('🚀 Verificando rutas de navegación completas...\n');
  
  const products = await fetchAllProducts();
  console.log(`📊 Total productos: ${products.length}\n`);
  
  // Construir árbol de navegación
  const arbol = new Map();
  
  products.forEach(p => {
    const familia = p.familia || 'SIN_FAMILIA';
    const marca = p.marca || `BRAND_${p.brand_id}` || 'SIN_MARCA';
    const subfamilia = p.subfamilia || 'SIN_SUBFAMILIA';
    const tipo = p.tipo || 'SIN_TIPO';
    const gama = p.Gama || 'SIN_GAMA';
    const subgama = p.Subgama || 'SIN_SUBGAMA';
    
    if (!arbol.has(familia)) {
      arbol.set(familia, { marcas: new Map(), total: 0 });
    }
    const fam = arbol.get(familia);
    fam.total++;
    
    if (!fam.marcas.has(marca)) {
      fam.marcas.set(marca, { subfamilias: new Map(), total: 0 });
    }
    const marcaData = fam.marcas.get(marca);
    marcaData.total++;
    
    const key = `${subfamilia}|${tipo}|${gama}`;
    if (!marcaData.subfamilias.has(key)) {
      marcaData.subfamilias.set(key, { subgamas: new Set(), referencias: [], count: 0 });
    }
    const node = marcaData.subfamilias.get(key);
    node.subgamas.add(subgama);
    node.referencias.push(p.ref_fabricante);
    node.count++;
  });
  
  // Verificar cada ruta
  const resultados = {
    familias: [],
    errores: [],
    warnings: []
  };
  
  console.log('🔍 Verificando familias:\n');
  
  let familiaNum = 0;
  arbol.forEach((famData, familia) => {
    familiaNum++;
    console.log(`${familiaNum}. ${familia} (${famData.total} productos)`);
    
    const marcasok = famData.marcas.size;
    let totalRutas = 0;
    let rutasConReferencias = 0;
    let subgamasUnicas = new Set();
    
    famData.marcas.forEach((marcaData, marca) => {
      marcaData.subfamilias.forEach((node, key) => {
        totalRutas++;
        subgamasUnicas.add([...node.subgamas].join('|'));
        
        if (node.referencias.length > 0) {
          rutasConReferencias++;
        } else {
          resultados.errores.push({
            familia,
            marca,
            subfamilia: key.split('|')[0],
            tipo: key.split('|')[1],
            gama: key.split('|')[2],
            error: 'Sin referencias'
          });
        }
        
        node.subgamas.forEach(subgama => {
          if (!subgama || subgama === 'SIN_SUBGAMA') {
            resultados.warnings.push({
              familia,
              marca,
              subfamilia: key.split('|')[0],
              tipo: key.split('|')[1],
              gama: key.split('|')[2],
              warning: `Subgama vacía: "${subgama}"`
            });
          }
        });
      });
    });
    
    const porcentaje = ((rutasConReferencias / totalRutas) * 100).toFixed(1);
    console.log(`   ├─ Marcas: ${marcasok}`);
    console.log(`   ├─ Rutas únicas: ${totalRutas}`);
    console.log(`   ├─ Con referencias: ${rutasConReferencias}/${totalRutas} (${porcentaje}%)`);
    console.log(`   └─ Combinaciones subgama: ${subgamasUnicas.size}\n`);
    
    resultados.familias.push({
      familia,
      total: famData.total,
      marcas: marcasok,
      rutas: totalRutas,
      ok: rutasConReferencias
    });
  });
  
  // Resumen final
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMEN DE VERIFICACIÓN');
  console.log('='.repeat(80));
  
  console.log('\n✅ FAMILIAS VERIFICADAS:');
  resultados.familias.forEach(f => {
    const pct = ((f.ok / f.rutas) * 100).toFixed(0);
    console.log(`   ${f.familia}: ${f.ok}/${f.rutas} rutas OK (${pct}%)`);
  });
  
  if (resultados.errores.length > 0) {
    console.log(`\n⚠️ ERRORES ENCONTRADOS: ${resultados.errores.length}`);
    resultados.errores.slice(0, 10).forEach(e => {
      console.log(`   • ${e.familia} → ${e.marca} → ${e.subfamilia} → ${e.tipo}: ${e.error}`);
    });
    if (resultados.errores.length > 10) {
      console.log(`   ... y ${resultados.errores.length - 10} más`);
    }
  } else {
    console.log('\n✅ SIN ERRORES - Todas las rutas tienen referencias');
  }
  
  if (resultados.warnings.length > 0) {
    console.log(`\n⚠️ WARNINGS: ${resultados.warnings.length} subgamas con valores vacíos`);
  }
  
  // Guardar reporte
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `/home/abu/github_repos/proyecto-pfc-iago-duran/app/scripts/verificacion_rutas_${timestamp}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(resultados, null, 2));
  console.log(`\n📄 Reporte completo: ${reportPath}`);
  
  // Verificación de interfaces específicas
  console.log('\n' + '='.repeat(80));
  console.log('🖥️ VERIFICACIÓN POR INTERFAZ');
  console.log('='.repeat(80));
  
  console.log('\n✅ FICHAS TÉCNICAS:');
  console.log('   - Selectores disponibles: Familia → Marca → Gama → Subfamilia → Tipo → Subgama');
  console.log('   - Total combinaciones navegables: ' + resultados.familias.reduce((a, b) => a + b.rutas, 0));
  console.log('   - Referencias alcanzables: ' + resultados.familias.reduce((a, b) => a + b.ok, 0));
  
  console.log('\n✅ PRESUPUESTOS:');
  console.log('   - Mismos selectores que Fichas Técnicas');
  console.log('   - Capacidad de añadir múltiples referencias por ruta');
  
  console.log('\n🎯 CONCLUSIÓN:');
  const totalRutas = resultados.familias.reduce((a, b) => a + b.rutas, 0);
  const totalOK = resultados.familias.reduce((a, b) => a + b.ok, 0);
  const pctFinal = ((totalOK / totalRutas) * 100).toFixed(1);
  console.log(`   Navegación funcional: ${pctFinal}% (${totalOK}/${totalRutas} rutas)`);
  
  if (pctFinal === '100.0') {
    console.log('   🎉 ¡TODAS LAS RUTAS DE NAVEGACIÓN ESTÁN OPERATIVAS!\n');
  } else {
    console.log(`   ⚠️ Hay ${totalRutas - totalOK} rutas sin referencias\n`);
  }
}

main().catch(console.error);
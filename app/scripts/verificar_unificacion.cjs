#!/usr/bin/env node
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

function query(select, filter, limit = 10000) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({ 
      select,
      limit: limit.toString()
    });
    if (filter) {
      const [key, value] = filter.split('=');
      params.set(key, value);
    }
    
    const req = https.request(URL + '/rest/v1/products?' + params, {
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

async function main() {
  console.log('🔍 Verificando unificación de "Contador Eléctrico"...\n');
  
  // Usar filtro correcto de Supabase: subfamilia=like.*Contador*
  console.log('📥 Consultando productos con "Contador"...');
  let all = await query('subfamilia', 'subfamilia=like.*Contador*', 10000);
  
  if (!Array.isArray(all)) {
    console.log('Error en query:', all);
    all = [];
  }
  
  const grupos = {};
  all.forEach(p => {
    grupos[p.subfamilia] = (grupos[p.subfamilia] || 0) + 1;
  });
  
  console.log('📊 Resultados:');
  Object.entries(grupos).forEach(([subfa, count]) => {
    const icon = subfa === 'Contador Eléctrico' ? '✅' : '⚠️';
    console.log(`   ${icon} "${subfa}": ${count} productos`);
  });
  
  const total = Object.values(grupos).reduce((a, b) => a + b, 0);
  const correctos = grupos['Contador Eléctrico'] || 0;
  
  console.log(`\n📈 Total: ${total} productos`);
  console.log(`✅ Correctos: ${correctos}`);
  
  if (Object.keys(grupos).length === 1 && correctos === total) {
    console.log('\n🎉 ¡UNIFICACIÓN COMPLETADA CON ÉXITO!');
    console.log('   Todos los "Contador eléctrico" ahora son "Contador Eléctrico"');
  } else {
    console.log('\n⚠️ Aún hay variantes por unificar');
  }
}

main();
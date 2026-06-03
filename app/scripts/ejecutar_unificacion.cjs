#!/usr/bin/env node
/**
 * Ejecuta la unificación de "Contador eléctrico" → "Contador Eléctrico"
 */

const fs = require('fs');
const https = require('https');

const envPath = '/home/abu/github_repos/proyecto-pfc-iago-duran/app/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

let URL = '';
let KEY = '';
let SERVICE_KEY = '';

for (const line of lines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    URL = line.split('=')[1].trim();
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    KEY = line.split('=')[1].trim();
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    SERVICE_KEY = line.split('=')[1].trim();
  }
}

// Usar SERVICE_KEY para operaciones de escritura
const WRITE_KEY = SERVICE_KEY || KEY;
console.log('🔑 Usando clave:', SERVICE_KEY ? 'SERVICE_ROLE (escritura)' : 'ANON (solo lectura)');

console.log('🔍 Verificando registros actuales con "Contador eléctrico"...\n');

// 1. Primero verificar cuántos hay
function checkCurrent() {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      select: 'subfamilia',
      subfamilia: 'eq.Contador eléctrico'
    });

    const target = URL + '/rest/v1/products?' + params.toString();

    const req = https.request(target, {
      method: 'GET',
      headers: {
        apikey: KEY,
        Authorization: 'Bearer ' + KEY,
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        if (res.statusCode !== 200) {
          reject(new Error(`Status ${res.statusCode}: ${text}`));
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

// 2. Ejecutar UPDATE
function updateRecords() {
  return new Promise((resolve, reject) => {
    const target = URL + '/rest/v1/products';

    const postData = JSON.stringify({
      subfamilia: 'Contador Eléctrico'
    });

    const params = new URLSearchParams({
      subfamilia: 'eq.Contador eléctrico'
    });

    const req = https.request(target + '?' + params.toString(), {
      method: 'PATCH',
      headers: {
        apikey: WRITE_KEY,
        Authorization: 'Bearer ' + WRITE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        console.log(`\n📡 Status: ${res.statusCode}`);
        
        if (res.statusCode !== 200 && res.statusCode !== 204) {
          reject(new Error(`Status ${res.statusCode}: ${text}`));
          return;
        }
        
        if (res.statusCode === 204) {
          console.log('✅ No hubo registros que actualizar (ya están correctos)');
          resolve(0);
          return;
        }
        
        try {
          const data = JSON.parse(text);
          console.log(`✅ Actualizados: ${data.length} registros`);
          resolve(data.length);
        } catch (e) {
          resolve(0);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 3. Verificar resultado
function verifyResult() {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      select: 'subfamilia',
      'subfamilia': 'ilike.%contador electrico%'
    });

    const target = URL + '/rest/v1/products?' + params.toString();

    const req = https.request(target, {
      method: 'GET',
      headers: {
        apikey: KEY,
        Authorization: 'Bearer ' + KEY,
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        if (res.statusCode !== 200) {
          reject(new Error(`Status ${res.statusCode}: ${text}`));
          return;
        }
        try {
          const data = JSON.parse(text);
          
          // Agrupar por subfamilia
          const grupos = {};
          data.forEach(p => {
            grupos[p.subfamilia] = (grupos[p.subfamilia] || 0) + 1;
          });
          
          resolve(grupos);
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Ejecución principal
async function main() {
  try {
    // 1. Check inicial
    const current = await checkCurrent();
    console.log(`📊 Registros encontrados: ${current.length}`);
    console.log(`   Valores: ${[...new Set(current.map(p => p.subfamilia))].join(', ')}`);
    
    if (current.length === 0) {
      console.log('\n✅ No hay nada que unificar - todos los registros ya están correctos');
      return;
    }
    
    // 2. Ejecutar UPDATE
    console.log('\n🔄 Ejecutando unificación...');
    const updated = await updateRecords();
    
    // 3. Verificar
    console.log('\n🔍 Verificando resultado...');
    const grupos = await verifyResult();
    
    console.log('\n📋 Estado final:');
    Object.entries(grupos).forEach(([subfa, count]) => {
      console.log(`   ${subfa}: ${count} productos`);
    });
    
    const total = Object.values(grupos).reduce((a, b) => a + b, 0);
    console.log(`\n✅ Total unificado: ${total} productos`);
    
    if (Object.keys(grupos).length === 1 && grupos['Contador Eléctrico']) {
      console.log('🎉 ¡Unificación completada con éxito!');
    } else {
      console.log('⚠️ Aún hay variantes - revisar manualmente');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
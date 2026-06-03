#!/usr/bin/env node
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

console.error('🔍 Consultando TODAS las familias en la DB...\n');

// Query para obtener familia y contar
const params = new URLSearchParams({
  select: 'familia',
  'familia': 'not.is.null',
  limit: '10000'
});

const target = URL + '/rest/v1/products?' + params.toString();
console.error('Requesting:', target);

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
    console.error('Status:', res.statusCode);
    console.error('Response length:', text.length);
    
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        // Contar productos por familia
        const familiaCount = {};
        data.forEach(p => {
          const f = p.familia?.trim();
          if (f) {
            familiaCount[f] = (familiaCount[f] || 0) + 1;
          }
        });
        
        const familias = Object.entries(familiaCount)
          .sort((a, b) => b[1] - a[1])
          .map(([familia, count]) => ({ familia, count }));
        
        console.log('\n📊 Total productos:', data.length);
        console.log('📁 Familias únicas:', familias.length);
        console.log('\n=== FAMILIAS EN LA DB ===\n');
        console.log('Familia'.padEnd(45) + 'Productos');
        console.log('='.repeat(60));
        familias.forEach(({ familia, count }) => {
          console.log(familia.padEnd(45) + count.toString().padStart(5));
        });
        console.log('\n=== FIN ===\n');
      } else {
        console.error('Non-array response:', data);
        process.exit(1);
      }
    } catch (e) {
      console.error('Parse error:', e.message);
      console.error('Response:', text.slice(0, 500));
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.end();
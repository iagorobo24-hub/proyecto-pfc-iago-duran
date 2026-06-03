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

function queryFamilia(familia) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      select: 'familia,subfamilia,tipo,marca,Gama,Subgama',
      familia: `eq.${familia}`,
      limit: '10000'
    });
    const req = https.request(
      URL + '/rest/v1/products?' + params.toString(),
      {
        method: 'GET',
        headers: {
          apikey: KEY,
          Authorization: 'Bearer ' + KEY,
          Prefer: 'return=representation',
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString();
          try {
            resolve(JSON.parse(text));
          } catch {
            reject(new Error(text));
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

const familias = ['Fotovoltaica', 'Vehículos eléctricos', 'Iluminación'];

(async () => {
  console.error('🔍 Consultando familias:', familias.join(', '));
  
  const resultados = {};
  for (const fam of familias) {
    console.error(`  → ${fam}...`);
    resultados[fam] = await queryFamilia(fam);
  }
  
  console.log('```sql');
  console.log('-- ===================================================');
  console.log('-- MAPEO CONSOLIDADO: FV + VE + ILUMINACIÓN');
  console.log('-- Generado automáticamente desde Supabase');
  console.log('-- ===================================================');
  console.log('');
  
  for (const [fam, data] of Object.entries(resultados)) {
    if (!Array.isArray(data)) continue;
    console.error(`✅ ${fam}: ${data.length} productos`);
    
    const gamasPorSubfamilia = {};
    for (const r of data) {
      const sf = r.subfamilia || 'Sin subfamilia';
      if (!gamasPorSubfamilia[sf]) gamasPorSubfamilia[sf] = new Set();
      if (r.Gama) gamasPorSubfamilia[sf].add(r.Gama);
    }
    
    console.log(`-- ${fam} (${data.length} productos)`);
    for (const [sf, gamas] of Object.entries(gamasPorSubfamilia).sort()) {
      const tipo = data.find(r => r.subfamilia === sf)?.tipo || 'GENERAL';
      const marca = data.find(r => r.subfamilia === sf)?.marca || 'Legrand';
      for (const gama of [...gamas].sort()) {
        console.log(`INSERT INTO mapeo_productos (familia_destino, subfamilia_canonica, tipo_canonico, gama_canonica, marca_canonica)`);
        console.log(`VALUES ('${fam}','${sf}','${tipo}','${gama}','${marca}')`);
        console.log(`ON CONFLICT (subfamilia_canonica, tipo_canonico, marca_canonica) DO UPDATE SET familia_destino = EXCLUDED.familia_destino;`);
        console.log('');
      }
    }
    console.log('');
  }
  
  console.log('-- VERIFICACIÓN FINAL');
  console.log('SELECT familia_destino, subfamilia_canonica, COUNT(DISTINCT gama_canonica) as gamas, COUNT(*) as aceites');
  console.log('FROM mapeo_productos');
  console.log('WHERE familia_destino IN (\'Fotovoltaica\', \'Vehículos eléctricos\', \'Iluminación\')');
  console.log('GROUP BY familia_destino, subfamilia_canonica');
  console.log('ORDER BY familia_destino, subfamilia_canonica;');
  console.log('```');
})();
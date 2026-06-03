#!/usr/bin/env node
const fs = require('fs');
const https = require('https');

const env = fs.readFileSync('/home/abu/github_repos/proyecto-pfc-iago-duran/app/.env.local', 'utf8');
const URL = env.match(/VITE_SUPABASE_URL=(.+)/)[1].trim();
const KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)[1].trim();

function queryFamilia(familia) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      select: 'familia,subfamilia,tipo,marca,Gama,Subgama',
      familia: `eq.${familia}`,
      limit: '10000'
    });
    const req = https.request(URL + '/rest/v1/products?' + params.toString(), {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, Prefer: 'return=representation' }
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())));
    });
    req.on('error', reject);
    req.end();
  });
}

const familias = ['Automatización', 'Automatización de edificios', 'Distribución de potencia'];

(async () => {
  console.error('🔍 Consultando:', familias.join(', '));
  
  for (const fam of familias) {
    const data = await queryFamilia(fam);
    console.error(`✅ ${fam}: ${data.length} productos`);
    
    if (data.length === 0) continue;
    
    // Agrupar por subfamilia → tipo
    const grupos = {};
    for (const r of data) {
      const sf = r.subfamilia || 'Sin subfamilia';
      const t = r.tipo || 'GENERAL';
      const key = `${sf}|${t}`;
      if (!grupos[key]) grupos[key] = { count: 0, marcas: new Set(), gamas: new Set(), subgamas: new Set() };
      grupos[key].count++;
      if (r.marca) grupos[key].marcas.add(r.marca);
      if (r.Gama) grupos[key].gamas.add(r.Gama);
      if (r.Subgama) grupos[key].subgamas.add(r.Subgama);
    }
    
    console.log(`\n### ${fam.toUpperCase()} (${data.length} productos)`);
    for (const [key, info] of Object.entries(grupos).sort()) {
      const [sf, t] = key.split('|');
      console.log(`- **${sf}** → ${t}`);
      console.log(`  - Productos: ${info.count}`);
      console.log(`  - Marcas: ${[...info.marcas].join(', ')}`);
      console.log(`  - Gamas (${info.gamas.size}): ${[...info.gamas].sort().slice(0, 10).join(', ')}${info.gamas.size > 10 ? '...' : ''}`);
    }
  }
})();
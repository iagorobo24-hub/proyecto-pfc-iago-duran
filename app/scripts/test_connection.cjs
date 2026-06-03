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

console.error('URL:', URL);
console.error('KEY length:', KEY.length);
console.error('KEY starts with:', KEY.slice(0, 15) + '...');

const familia = process.argv[2] || 'Iluminación';
const params = new URLSearchParams({
  select: 'familia,subfamilia,tipo,marca,Gama,Subgama',
  familia: `eq.${familia}`,
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
    if (text.length < 500) {
      console.error('Body:', text);
    }
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        console.log(JSON.stringify({ ok: true, count: data.length, rows: data }, null, 2));
      } else {
        console.error('Non-array response:', data);
        process.exit(1);
      }
    } catch (e) {
      console.error('Parse error:', e.message);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.end();
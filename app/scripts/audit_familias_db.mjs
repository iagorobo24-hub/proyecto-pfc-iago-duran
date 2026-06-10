/**
 * Audit de familias en la BD - usa el mismo patrón que check-db.mjs
 */
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const SONEX_KEY = envContent.match(/SONEX_SUPABASE_KEY=(.+)/)?.[1]?.trim() ||
                  envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim() || '';
const SONEX_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co';

const HEADERS = {
  'apikey': SONEX_KEY,
  'Authorization': `Bearer ${SONEX_KEY}`,
  'Content-Type': 'application/json'
};

// Traer todos los productos (en páginas de 1000)
let allData = [];
let offset = 0;
const PAGE = 1000;
while (true) {
  const res = await fetch(`${SONEX_URL}/rest/v1/products?select=familia,marca&limit=${PAGE}&offset=${offset}`, { headers: HEADERS });
  const chunk = await res.json();
  if (!chunk.length) break;
  allData = allData.concat(chunk);
  if (chunk.length < PAGE) break;
  offset += PAGE;
}

console.log(`Total productos: ${allData.length}`);

// Contar por familia
const fc = {};
allData.forEach(p => { fc[p.familia] = (fc[p.familia]||0)+1; });

const sorted = Object.entries(fc).sort((a,b) => b[1]-a[1]);
console.log('\n=== FAMILIA VALUES IN DB (sorted by count) ===');
sorted.forEach(([k,v]) => console.log(`  ${v.toString().padStart(6)}  ${JSON.stringify(k)}`));
console.log(`\nTotal unique familias: ${sorted.length}`);

// Agrupar por variantes similares (uppercase comparison)
console.log('\n=== POSIBLES DUPLICADOS (mismo valor sin acentos/case) ===');
const norm = s => s ? s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/_/g,' ').trim() : 'NULL';
const groups = {};
sorted.forEach(([k,v]) => {
  const n = norm(k);
  if (!groups[n]) groups[n] = [];
  groups[n].push({ k, v });
});
Object.entries(groups)
  .filter(([, arr]) => arr.length > 1)
  .forEach(([n, arr]) => {
    console.log(`  Normalized: "${n}"`);
    arr.forEach(({k,v}) => console.log(`    → "${k}" (${v} productos)`));
  });

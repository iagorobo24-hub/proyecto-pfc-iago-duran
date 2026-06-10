/**
 * Inspecciona la tabla brands para ver logos actuales
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

const res = await fetch(`${SONEX_URL}/rest/v1/brands?select=*&order=name.asc`, { headers: HEADERS });
const brands = await res.json();

console.log('=== MARCAS EN BD ===\n');
brands.forEach(b => {
  console.log(`ID: ${b.id}`);
  console.log(`  Nombre:    ${b.name}`);
  console.log(`  Website:   ${b.website_url || '(vacío)'}`);
  console.log(`  Logo URL:  ${b.logo_url || '(vacío)'}`);
  console.log(`  Logo file: ${b.logo_filename || '(vacío)'}`);
  // Mostrar todas las columnas disponibles
  const extras = Object.entries(b).filter(([k]) => !['id','name','website_url','logo_url','logo_filename'].includes(k));
  extras.forEach(([k,v]) => console.log(`  ${k}: ${v}`));
  console.log();
});

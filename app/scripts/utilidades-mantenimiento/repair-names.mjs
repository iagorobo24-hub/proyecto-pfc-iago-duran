import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { updateProduct } from '../lib/supabase-sonex.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../..', '.env');

// Load env variables
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SONEX_SUPABASE_KEY;

const HEADERS = {
  'apikey': supabaseServiceKey,
  'Authorization': `Bearer ${supabaseServiceKey}`,
  'Content-Type': 'application/json'
};

function cleanSlug(slug) {
  let decoded = decodeURIComponent(slug);
  // Remove hash or query params
  decoded = decoded.split('#')[0].split('?')[0];
  decoded = decoded.replace(/\/+$/, '');
  let parts = decoded.split('-');
  let name = parts.join(' ');
  name = name.charAt(0).toUpperCase() + name.slice(1);
  
  // Clean common abbreviations to correct casing
  name = name.replace(/\bca\b/gi, 'CA');
  name = name.replace(/\bcc\b/gi, 'CC');
  name = name.replace(/\bac\b/gi, 'AC');
  name = name.replace(/\bdc\b/gi, 'DC');
  name = name.replace(/\bip(\d+)\b/gi, 'IP$1');
  name = name.replace(/\b(\d+)v\b/gi, '$1V');
  name = name.replace(/\b(\d+)a\b/gi, '$1A');
  name = name.replace(/\b(\d+)kv\b/gi, '$1kV');
  name = name.replace(/\b(\d+)ka\b/gi, '$1kA');
  name = name.replace(/\b(\d+)es\b/gi, '$1 E/S');
  
  // Clean double spaces
  name = name.replace(/\s+/g, ' ').trim();
  return name;
}

// Function to fetch name via Schneider secondary API
async function fetchNameFromSchneiderAPI(ref) {
  const url = `https://www.se.com/products-card/secondary?brand=se&country-code=es&language-code=es&ids=${ref}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.se.com/es/es/'
    }
  });
  
  if (!res.ok) {
    throw new Error(`API returned status ${res.status}`);
  }
  
  const data = await res.json();
  const info = data.productAdditionalInfos?.[0];
  if (info && info.viewAllDocumentsUrl) {
    const docUrl = info.viewAllDocumentsUrl;
    const match = docUrl.match(/\/product\/([^\/]+)\/([^\/]+)/i);
    if (match && match[2]) {
      const slug = match[2];
      const cleaned = cleanSlug(slug);
      
      // Look for a PDF url as well
      let pdfUrl = '';
      if (info.documents && info.documents.length > 0) {
        // Look for the product data sheet
        const sheet = info.documents.find(d => d.documentType === 'Product Data Sheet' || d.title?.includes('Hoja de datos'));
        const doc = sheet || info.documents[0];
        if (doc && doc.url) {
          pdfUrl = doc.url.startsWith('http') ? doc.url : `https://www.se.com${doc.url}`;
        }
      }
      
      return { name: cleaned, pdfUrl };
    }
  }
  return null;
}

async function run() {
  const isDryRun = process.argv.includes('--dry-run');
  const limit = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '0');
  
  console.log(`==================================================`);
  console.log(`   REPARADOR DE NOMBRES "ACCESS DENIED" SCHNEIDER`);
  console.log(`   Modo: ${isDryRun ? 'DRY-RUN (Simulación)' : 'PRODUCCIÓN (Escritura DB)'}`);
  if (limit > 0) console.log(`   Límite: ${limit} productos`);
  console.log(`==================================================\n`);
  
  // 1. Fetch products from Supabase
  console.log("Consultando base de datos...");
  let allProducts = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const url = `${supabaseUrl}/rest/v1/products?select=id,ref_fabricante,name,Gama,subfamilia,pdf_url&name=ilike.*access%20denied*&marca=eq.${encodeURIComponent('Schneider Electric')}&limit=${pageSize}&offset=${from}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      console.error("Error consultando Supabase:", await res.text());
      return;
    }
    const data = await res.json();
    allProducts = allProducts.concat(data);
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }
  
  console.log(`Se encontraron ${allProducts.length} productos con "Access Denied" en el nombre.`);
  
  const productsToProcess = limit > 0 ? allProducts.slice(0, limit) : allProducts;
  console.log(`Procesando ${productsToProcess.length} productos...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < productsToProcess.length; i++) {
    const p = productsToProcess[i];
    console.log(`[${i+1}/${productsToProcess.length}] Reparando ${p.ref_fabricante} (ID: ${p.id}, Gama: ${p.Gama})...`);
    
    try {
      const result = await fetchNameFromSchneiderAPI(p.ref_fabricante);
      
      if (result && result.name && result.name.toLowerCase() !== 'access denied') {
        console.log(`  ✨ Encontrado: "${result.name}"`);
        if (result.pdfUrl) {
          console.log(`     PDF Encontrado: "${result.pdfUrl}"`);
        }
        
        if (!isDryRun) {
          const updates = {
            name: result.name
          };
          // If product doesn't have a pdf_url or it's empty, update it
          if ((!p.pdf_url || p.pdf_url.length < 5) && result.pdfUrl) {
            updates.pdf_url = result.pdfUrl;
          }
          
          await updateProduct(p.id, updates);
          console.log(`  ✅ DB actualizada con éxito.`);
        } else {
          console.log(`  📝 [Dry-Run] Se actualizaría con nombre: "${result.name}"`);
        }
        successCount++;
      } else {
        console.log(`  ⚠️ No se encontró información en la API oficial de Schneider.`);
        failCount++;
      }
    } catch (err) {
      console.error(`  ❌ Error procesando ${p.ref_fabricante}:`, err.message);
      failCount++;
    }
    
    // Tiny delay to be nice to the API (200ms - 400ms is enough since it doesn't block)
    const delay = Math.floor(Math.random() * 200) + 200;
    await new Promise(r => setTimeout(r, delay));
  }
  
  console.log(`\n============================`);
  console.log(`Resumen de ejecución:`);
  console.log(`  - Éxitos: ${successCount}`);
  console.log(`  - Fallidos: ${failCount}`);
  console.log(`  - Total intentados: ${productsToProcess.length}`);
  console.log(`============================`);
}

run();

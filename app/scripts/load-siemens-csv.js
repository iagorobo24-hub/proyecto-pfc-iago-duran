/**
 * CARGAR SIEMENS DESDE CSV/EXCEL
 * 
 * Siemens no expone catálogos públicas scrapable.
 * Solución: Cargar desde un archivo CSV/Excel generado manualmente.
 * 
 * Pasos para obtener el catálogo Siemens:
 * 1. Descargar catálogo PDF de Siemens (disponible para distribuidores autorizados)
 * 2. Convertir PDF a CSV usando un extractor (ej: tabula-py, pdftables.com)
 * 3. Limpiar y estructurar el CSV con columnas requeridas
 * 4. Ejecutar este script para cargar en Supabase
 * 
 * Formato CSV esperado:
 * ref_fabricante,name,marca,familia,subfamilia,tipo,Gama,Subgama,imagen,pdf_url,precio
 * 5SL6106-6,"Magnetotérmico, 5SL6, 1P, 6A, B curva",Siemens,DISTRIBUCION DE POTENCIA,Interruptor Magnetotérmico,CARRIL DIN,5SL6,5SL6 B curva,https://...,https://...,0
 * 
 * Uso:
 *   node scripts/load-siemens-csv.js catalog-siemens.csv
 *   node scripts/load-siemens-csv.js --dry-run catalog-siemens.csv
 *   node scripts/load-siemens-csv.js --skip-existing catalog-siemens.csv
 */

import { insertProduct, checkRefExists, getProductsCount, insertBrand, getBrands } from './lib/supabase-sonex.js';
import fs from 'fs';
import path from 'path';

// ─── Parse args ─────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_EXISTING = args.includes('--skip-existing');

if (!args.find(a => !a.startsWith('--'))) {
  console.log(`
Uso: node scripts/load-siemens-csv.js [opciones] <archivo.csv>

Opciones:
  --dry-run      No guardar en DB (solo mostrar qué se cargaría)
  --skip-existing Saltar referencias que ya existen en DB

Ejemplo:
  node scripts/load-siemens-csv.js catalog-siemens.csv
  node scripts/load-siemens-csv.js --dry-run --skip-existing catalog-siemens.csv
  `);
  process.exit(1);
}

const CSV_PATH = args.find(a => !a.startsWith('--'));
const LOG_FILE = path.join(import.meta.dirname, 'load-siemens-csv.log');

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// ─── Leer CSV ────────────────────────────────────────────
function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  
  if (lines.length < 2) {
    throw new Error(`CSV vacío o solo tiene cabecera: ${filePath}`);
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const products = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse simple CSV (no maneja comillas anidadas complejo)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    
    const product = {};
    headers.forEach((h, idx) => {
      product[h] = values[idx] || null;
    });
    
    products.push(product);
  }
  
  return products;
}

// ─── Crear marca Siemens si no existe ────────────────────
async function ensureSiemensBrand() {
  const brands = await getBrands();
  let siemens = brands.find(b => b.name?.toLowerCase().includes('siemens'));
  
  if (!siemens) {
    log('🏷️ Creando marca Siemens...');
    siemens = await insertBrand({
      name: 'Siemens',
      website_url: 'https://www.siemens.com'
    });
    log(`✅ Marca creada: id=${siemens.id}`);
  } else {
    log(`🏷️ Marca Siemens ya existe: id=${siemens.id}`);
  }
  
  return siemens.id;
}

// ─── Normalizar producto Siemens ────────────────────────
function normalizeProduct(row, brandId) {
  const ref = (row.ref_fabricante || '').trim().toUpperCase();
  if (!ref) return null;
  
  // Extraer Gama/Subgama desde referencia si no está en CSV
  let Gama = row.Gama || row.Gama || null;
  let Subgama = row.Subgama || row.Subgama || null;
  
  if (ref.startsWith('5SL6')) {
    Gama = Gama || '5SL6';
    Subgama = Subgama || '5SL6';
  } else if (ref.startsWith('5SY7')) {
    Gama = Gama || '5SY7';
    Subgama = Subgama || '5SY7';
  } else if (ref.startsWith('5SY4')) {
    Gama = Gama || '5SY4';
    Subgama = Subgama || '5SY4';
  } else if (ref.startsWith('3VA')) {
    Gama = Gama || '3VA2';
    Subgama = Subgama || '3VA2';
  }
  
  return {
    ref_fabricante: ref,
    name: row.name?.trim() || ref,
    marca: 'Siemens',
    brand_id: brandId,
    familia: row.familia?.trim() || 'Distribución de potencia',
    subfamilia: row.subfamilia?.trim() || 'Interruptor Magnetotérmico',
    tipo: row.tipo?.trim() || 'CARRIL DIN',
    Gama: Gama || 'Siemens',
    Subgama: Subgama || 'General',
    imagen: row.imagen?.trim() || null,
    pdf_url: row.pdf_url?.trim() || null,
    precio: parseFloat(row.precio?.replace('€', '')?.replace(',', '.') || '0') || 0
  };
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  CARGAR CATÁLOGO SIEMENS DESDE CSV');
  console.log('='.repeat(70));
  
  if (DRY_RUN) log('🔍 MODO DRY-RUN: No se guardarán datos en DB');
  if (SKIP_EXISTING) log('⏭️ Modo SKIP_EXISTING: Saltar referencias duplicadas');
  
  // Leer CSV
  log(`📂 Leyendo archivo: ${CSV_PATH}`);
  let products;
  try {
    products = readCSV(CSV_PATH);
    log(`✅ ${products.length} productos encontrados en CSV`);
  } catch (err) {
    log(`❌ Error leyendo CSV: ${err.message}`);
    process.exit(1);
  }
  
  // Verificar/crear marca Siemens
  const brandId = await ensureSiemensBrand();
  log(`🏷️ Siemens brand_id: ${brandId}`);
  
  const productsCount = await getProductsCount();
  log(`📋 Productos actuales en DB: ${productsCount}`);
  
  // Procesar productos
  let saved = 0, skipped = 0, errors = 0;
  
  for (let i = 0; i < products.length; i++) {
    const product = normalizeProduct(products[i], brandId);
    
    if (!product) {
      log(`  [${i + 1}/${products.length}] ⚠️ Producto sin referencia, saltando`);
      continue;
    }
    
    // Verificar duplicados
    if (SKIP_EXISTING) {
      const exists = await checkRefExists(product.ref_fabricante);
      if (exists) {
        log(`  [${i + 1}/${products.length}] ⏭️ ${product.ref_fabricante} ya existe`);
        skipped++;
        continue;
      }
    }
    
    // Guardar o simular
    if (!DRY_RUN) {
      try {
        await insertProduct(product);
        saved++;
        log(`  [${i + 1}/${products.length}] ✅ ${product.ref_fabricante} guardado`);
      } catch (err) {
        log(`  [${i + 1}/${products.length}] ❌ Error guardando ${product.ref_fabricante}: ${err.message}`);
        errors++;
      }
    } else {
      saved++;
      log(`  [${i + 1}/${products.length}] ✅ ${product.ref_fabricante} (dry-run)`);
    }
  }
  
  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log('  RESUMEN CARGA CSV SIEMENS');
  console.log('='.repeat(70));
  console.log(`  💾 Guardados: ${saved}`);
  console.log(`  ⏭️ Saltados (si aplicó): ${skipped}`);
  console.log(`  ❌ Errores: ${errors}`);
  console.log('='.repeat(70));
  
  log(`📄 Reporte guardado en: ${LOG_FILE}`);
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err.message);
  log(`❌ Error fatal: ${err.message}`);
  process.exit(1);
});

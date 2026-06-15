/**
 * SCRAPING LEGRAND - AMPLIACIÓN SIN DUPLICADOS
 * 
 * Este script:
 * 1. Obtiene todas las referencias Legrand existentes en la BD
 * 2. Scrapea categorías NUEVAS que no se hayan scrapeado antes
 * 3. Filtra automáticamente referencias duplicadas
 * 
 * Uso:
 * node scrape-legrand-ampliado.mjs
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { getAllProductIds, checkRefExists } from '../lib/supabase-sonex.js';

// Categorías de Legrand para scrapear (URLs oficiales)
const CATEGORIAS_LEGRAND = {
  // === DISTRIBUCIÓN DE POTENCIA ===
  acti9_ic60: {
    name: 'Acti 9 iC60 - Interruptores magnetotérmicos',
    url: 'https://www.legrand.es/es/productos/interruptores-automaticos-modulares-acti-9-ic60',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'Interruptor Magnetotérmico',
    tipo: 'CARRIL DIN',
    gama: 'Acti 9 iC60',
  },
  acti9_id: {
    name: 'Acti 9 iID - Interruptores diferenciales',
    url: 'https://www.legrand.es/es/productos/interruptores-diferenciales-acti-9-iid',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'Interruptor Diferencial',
    tipo: 'CARRIL DIN',
    gama: 'Acti 9 iID',
  },
  acti9_ict: {
    name: 'Acti 9 iCT - Contactores',
    url: 'https://www.legrand.es/es/productos/contactores-acti-9-ict',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'Contactor',
    tipo: 'CARRIL DIN',
    gama: 'Acti 9 iCT',
  },
  acti9_itl: {
    name: 'Acti 9 iTL - Telerruptores',
    url: 'https://www.legrand.es/es/productos/telerruptores-acti-9-itl',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'Elemento de Control',
    tipo: 'CARRIL DIN',
    gama: 'Acti 9 iTL',
  },
  acti9_ipr: {
    name: 'Acti 9 iPR - Protectores sobretensión',
    url: 'https://www.legrand.es/es/productos/protectores-sobretension-acti-9-ipr',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'Proteccion Sobretension',
    tipo: 'CARRIL DIN',
    gama: 'Acti 9 iPR',
  },
  acti9_isw: {
    name: 'Acti 9 iSW - Interruptores seccionadores',
    url: 'https://www.legrand.es/es/productos/interruptores-seccionadores-acti-9-isw',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'Interruptor Seccionador',
    tipo: 'CARRIL DIN',
    gama: 'Acti 9 iSW',
  },
  resiy9: {
    name: 'Resi9 - Protección residencial',
    url: 'https://www.legrand.es/es/productos/proteccion-residencial-resi9',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'Interruptor Magnetotérmico',
    tipo: 'CARRIL DIN',
    gama: 'Resi9',
  },
  dpx3_nuevos: {
    name: 'DPX³ - Interruptores caja moldeada (nuevos)',
    url: 'https://www.legrand.es/es/productos/interruptores-caja-moldeada-dpx3',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'Interruptor Caja Moldeada',
    tipo: 'CAJA MOLDEADA',
    gama: 'DPX³',
  },
  compact_nsx: {
    name: 'ComPacT NSX - Interruptores caja moldeada',
    url: 'https://www.legrand.es/es/productos/interruptores-caja-moldeada-compact-nsx',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'Interruptor Caja Moldeada',
    tipo: 'CAJA MOLDEADA',
    gama: 'ComPacT NSX',
  },
  
  // === INSTALACIÓN ===
  olexycable: {
    name: 'OlexyCable - Canales de instalación',
    url: 'https://www.legrand.es/es/productos/canales-instalacion-olexycable',
    familia: 'INSTALACION',
    subfamilia: 'Canal Instalacion',
    tipo: 'CANAL',
    gama: 'OlexyCable',
  },
  olexyblock: {
    name: 'OlexyBlock - Canales para cuadros',
    url: 'https://www.legrand.es/es/productos/canales-cuadros-olexyblock',
    familia: 'INSTALACION',
    subfamilia: 'Canal Cuadros',
    tipo: 'CANAL',
    gama: 'OlexyBlock',
  },
  
  // === ILUMINACIÓN ===
  luxelement: {
    name: 'LuxElement - Luminarias emergencia',
    url: 'https://www.legrand.es/es/productos/luminarias-emergencia-luxelement',
    familia: 'ILUMINACION',
    subfamilia: 'Luminaria Emergencia',
    tipo: 'LUMINARIA',
    gama: 'LuxElement',
  },
  
  // === AUTOMATIZACIÓN ===
  osmoz_completo: {
    name: 'Osmoz - Sistema de automatización',
    url: 'https://www.legrand.es/es/productos/osmoz-sistema-automatizacion',
    familia: 'AUTOMATIZACION',
    subfamilia: 'Sistema Osmoz',
    tipo: 'AUTOMATIZACION',
    gama: 'Osmoz',
  },
  
  // === FOTOVOLTAICA ===
  greenpact: {
    name: 'Green\'t - Soluciones fotovoltaicas',
    url: 'https://www.legrand.es/es/productos/soluciones-fotovoltaicas-green-t',
    familia: 'FOTOVOLTAICA',
    subfamilia: 'Sistema Fotovoltaico',
    tipo: 'FOTOVOLTAICA',
    gama: 'Green\'t',
  },
};

// Obtener referencias existentes
async function getExistingRefs() {
  const products = await getAllProductIds();
  const existingRefs = new Set(products.map(p => p.ref_fabricante?.toLowerCase()));
  console.log(`Referencias existentes en BD: ${existingRefs.size}`);
  return existingRefs;
}

// Scrapear una categoría
async function scrapeCategoria(url, page) {
  const products = [];
  let pageNum = 0;
  let hasMore = true;
  
  while (hasMore && pageNum < 5) { // Máximo 5 páginas
    const pageUrl = pageNum === 0 ? url : `${url}?page=${pageNum}`;
    
    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      const pageProducts = await page.evaluate(() => {
        const items = document.querySelectorAll('[data-product-sku]');
        const results = [];
        const seen = new Set();
        
        for (let item of items) {
          const sku = item.getAttribute('data-product-sku');
          if (!sku || seen.has(sku)) continue;
          seen.add(sku);
          
          let el = item;
          let productUrl = '';
          let productName = '';
          
          for (let i = 0; i < 5 && el; i++) {
            const link = el.querySelector('a[href*="/es/productos/"]');
            if (link) {
              productUrl = link.href.split('?')[0];
              productName = link.textContent?.trim() || '';
              break;
            }
            el = el.parentElement;
          }
          
          if (sku && productName) {
            results.push({ sku, name: productName, url: productUrl });
          }
        }
        return results;
      });
      
      if (pageProducts.length === 0) {
        hasMore = false;
      } else {
        products.push(...pageProducts);
        pageNum++;
        
        const nextLink = await page.$('a[rel="next"], a[aria-label="Siguiente"], .pagination .next');
        hasMore = !!nextLink;
      }
      
      await page.waitForTimeout(1000);
      
    } catch (err) {
      console.error(`Error en página ${pageNum + 1}: ${err.message}`);
      break;
    }
  }
  
  return products;
}

// Main
async function main() {
  console.log('=== INICIO SCRAPING LEGRAND - AMPLIACIÓN ===\n');
  
  // Obtener referencias existentes
  const existingRefs = await getExistingRefs();
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'es-ES,es;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const report = {
    categorias: 0,
    nuevos: 0,
    duplicados: 0,
    errores: 0,
    productos: [],
  };
  
  for (const [catKey, config] of Object.entries(CATEGORIAS_LEGRAND)) {
    console.log(`\n📦 Categoría: ${catKey} - ${config.name}`);
    console.log(`   URL: ${config.url}`);
    
    const products = await scrapeCategoria(config.url, page);
    console.log(`   Productos encontrados: ${products.length}`);
    
    if (products.length === 0) {
      console.log('   ⚠️ No se encontraron productos');
      continue;
    }
    
    report.categorias++;
    
    // Filtrar duplicados
    const nuevosProducts = [];
    for (const p of products) {
      if (existingRefs.has(p.sku.toLowerCase())) {
        report.duplicados++;
      } else {
        nuevosProducts.push(p);
        existingRefs.add(p.sku.toLowerCase());
        report.nuevos++;
        
        report.productos.push({
          ref_fabricante: p.sku,
          name: p.name,
          marca: 'Legrand',
          brand_id: 457,
          familia: config.familia,
          subfamilia: config.subfamilia,
          tipo: config.tipo,
          Gama: config.gama,
          producto_url: p.url,
        });
      }
    }
    
    console.log(`   Nuevos: ${nuevosProducts.length} | Duplicados: ${products.length - nuevosProducts.length}`);
  }
  
  await browser.close();
  
  console.log('\n=== RESUMEN ===');
  console.log(`Categorías procesadas: ${report.categorias}`);
  console.log(`Nuevos productos: ${report.nuevos}`);
  console.log(`Duplicados omitidos: ${report.duplicados}`);
  console.log(`Errores: ${report.errores}`);
  
  // Guardar reporte
  const outputPath = '/mnt/c/Users/iagui/AI Projects/Repos de GitHub/proyecto-pfc-iago-duran/app/scripts/output/legrand-ampliado-report.json';
  writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`\n📁 Reporte guardado: ${outputPath}`);
  
  // Guardar productos para insertar
  if (report.nuevos > 0) {
    const productsPath = '/mnt/c/Users/iagui/AI Projects/Repos de GitHub/proyecto-pfc-iago-duran/app/scripts/output/legrand-nuevos-productos.json';
    writeFileSync(productsPath, JSON.stringify(report.productos, null, 2));
    console.log(`📦 Productos listos para insertar: ${productsPath}`);
    
    console.log('\n✅ ¿Insertar productos en la BD? (y/n)');
    // Aquí podrías añadir la inserción automática si el usuario confirma
  } else {
    console.log('\n✅ No hay productos nuevos para insertar');
  }
  
  return report;
}

main().catch(console.error);

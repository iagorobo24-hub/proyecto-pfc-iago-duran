/**
 * Siemens Category Crawler
 * 
 * Propósito: Crawlear toda la estructura de categorías y subcategorías de Siemens
 * para mapearlas con la taxonomía de la BD (familia, subfamilia, Gama, tipo)
 * 
 * Uso: LD_LIBRARY_PATH=/tmp/playwright-deps/usr/lib/x86_64-linux-gnu node crawl-siemens-categories.mjs
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

// URLs semilla de Siemens por categoría principal
const SEED_URLS = [
  // SIRIUS - Control industrial (contactores, relés, etc.)
  { url: 'https://new.siemens.com/es-es/products/sirius/', categoria: 'SIRIUS' },
  // SENTRON - Distribución de potencia
  { url: 'https://new.siemens.com/es-es/products/energy/power-distribution/sentron.html', categoria: 'SENTRON' },
  // SIMATIC - Automatización (PLCs)
  { url: 'https://new.siemens.com/es-es/products/automation/simatic.html', categoria: 'SIMATIC' },
];

// Patrones de URLs que queremos capturar
const PRODUCT_PATTERNS = [
  /\/products\/[^\/]+\/[^\/]+\.html/i,
  /\/products\/[^\/]+\/[^\/]+\/[^\/]+\.html/i,
  /\/products\/sirius\/[^\/]+\/[^\/]+/i,
];

// Categorías de Siemens que probablemente contienen productos
const CATEGORY_SELECTORS = [
  'a[href*="/products/"]',
  '[class*="category"]',
  '[class*="product"]',
  'nav a',
  '.navigation a',
  '.submenu a',
];

async function crawlSiemensCategories() {
  console.log('🔍 Iniciando crawl de categorías de Siemens...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();
  
  // Estructura para almacenar resultados
  const results = {
    timestamp: new Date().toISOString(),
    categories: [],
    subcategories: [],
    productPages: [],
    taxonomyMapping: [],
  };
  
  // URLs ya visitadas
  const visitedUrls = new Set();
  const urlsToVisit = [];
  
  // Añadir URLs semilla
  for (const seed of SEED_URLS) {
    urlsToVisit.push({ url: seed.url, categoria: seed.categoria, depth: 0 });
  }
  
  let processedCount = 0;
  
  while (urlsToVisit.length > 0 && processedCount < 100) {
    const { url, categoria, depth } = urlsToVisit.shift();
    
    if (visitedUrls.has(url) || depth > 3) {
      continue;
    }
    
    visitedUrls.add(url);
    processedCount++;
    
    console.log(`[${processedCount}] Visitando: ${url} (profundidad: ${depth})`);
    
    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });
      
      // Esperar a que cargue contenido dinámico
      await page.waitForTimeout(5000);
      
      // Extraer título
      const pageTitle = await page.title();
      
      // Extraer todos los enlaces
      const links = await page.evaluate(() => {
        const allLinks = Array.from(document.querySelectorAll('a[href]'));
        return allLinks
          .map(a => ({
            href: a.href,
            text: a.textContent?.trim().substring(0, 200) || '',
          }))
          .filter(l => l.href && l.href.includes('siemens.com'));
      });
      
      // Clasificar enlaces
      const categoryLinks = [];
      const productLinks = [];
      
      for (const link of links) {
        // ¿Es una página de producto?
        const isProduct = PRODUCT_PATTERNS.some(pattern => pattern.test(link.href));
        
        if (isProduct && !results.productPages.find(p => p.url === link.href)) {
          productLinks.push(link);
        } else if (link.href.includes('/products/') && !visitedUrls.has(link.href)) {
          categoryLinks.push(link);
        }
      }
      
      // Registrar categoría actual
      results.categories.push({
        url,
        title: pageTitle,
        categoriaPrincipal: categoria,
        depth,
        subcategoryCount: categoryLinks.length,
        productPageCount: productLinks.length,
      });
      
      // Añadir subcategorías para visitar
      for (const link of categoryLinks) {
        if (!visitedUrls.has(link.href) && urlsToVisit.length < 150) {
          urlsToVisit.push({ 
            url: link.href, 
            categoria: categoria, 
            depth: depth + 1 
          });
        }
      }
      
      // Registrar páginas de producto encontradas
      for (const link of productLinks) {
        results.productPages.push({
          url: link.href,
          title: link.text,
          categoriaPrincipal: categoria,
        });
      }
      
      console.log(`   → Subcategorías encontradas: ${categoryLinks.length}`);
      console.log(`   → Páginas de producto: ${productLinks.length}`);
      
    } catch (error) {
      console.error(`   ERROR en ${url}: ${error.message}`);
    }
  }
  
  await browser.close();
  
  // Generar mapeo preliminar con taxonomía
  console.log('\n📊 Generando mapeo preliminar con taxonomía...\n');
  
  results.taxonomyMapping = generateTaxonomyMapping(results.productPages);
  
  // Guardar resultados
  const outputDir = join(process.cwd(), 'output');
  const outputPath = join(outputDir, 'siemens-crawl-results.json');
  
  try {
    writeFileSync(outputPath, JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error al guardar resultados:', error.message);
  }
  
  console.log(`✅ Crawl completado!`);
  console.log(`📁 Resultados guardados en: ${outputPath}`);
  console.log(`\n📈 Resumen:`);
  console.log(`   - Categorías principales: ${results.categories.length}`);
  console.log(`   - Páginas de producto: ${results.productPages.length}`);
  console.log(`   - Mapeos de taxonomía: ${results.taxonomyMapping.length}`);
  
  // Mostrar mapeo preliminar
  console.log('\n📋 Mapeo preliminar con taxonomía:');
  console.table(results.taxonomyMapping.slice(0, 20));
  
  return results;
}

function generateTaxonomyMapping(productPages) {
  const taxonomyMap = [];
  
  for (const page of productPages) {
    const url = page.url.toLowerCase();
    const title = page.title || '';
    
    // Detección preliminar basada en URL y título
    let familia = 'AUTOMATIZACION';
    let subfamilia = 'Otros';
    let tipo = 'INDUSTRIAL';
    let gama = page.categoriaPrincipal || 'Desconocida';
    
    // SIRIUS -> Contactor, Relé, etc.
    if (url.includes('sirius') || page.categoriaPrincipal === 'SIRIUS') {
      familia = 'AUTOMATIZACION';
      
      if (url.includes('contactor') || url.includes('3rt')) {
        subfamilia = 'Contactor';
        tipo = 'CARRIL DIN';
        gama = 'SIRIUS Control';
      } else if (url.includes('relay') || url.includes('relé')) {
        subfamilia = 'Elemento de Control';
        tipo = 'CARRIL DIN';
        gama = 'SIRIUS';
      } else if (url.includes('protection') || url.includes('proteccion')) {
        subfamilia = 'Proteccion Sobretension';
        tipo = 'CARRIL DIN';
        gama = 'SIRIUS';
      }
    }
    
    // SENTRON -> Distribución de potencia
    if (url.includes('sentron') || page.categoriaPrincipal === 'SENTRON') {
      familia = 'DISTRIBUCION DE POTENCIA';
      
      if (url.includes('circuit') || url.includes('breaker')) {
        subfamilia = 'Interruptor Magnetotérmico';
        tipo = 'CAJA MOLDEADA';
        gama = 'SENTRON';
      } else if (url.includes('switch') || url.includes('seccionador')) {
        subfamilia = 'Interruptor Seccionador';
        tipo = 'CARRIL DIN';
        gama = 'SENTRON';
      }
    }
    
    // SIMATIC -> Automatización (PLCs)
    if (url.includes('simatic') || page.categoriaPrincipal === 'SIMATIC') {
      familia = 'AUTOMATIZACION';
      subfamilia = 'PLC';
      tipo = 'MODULAR';
      gama = 'SIMATIC';
    }
    
    taxonomyMap.push({
      url: page.url,
      title: page.title,
      categoriaOriginal: page.categoriaPrincipal,
      familia,
      subfamilia,
      tipo,
      gama,
    });
  }
  
  return taxonomyMap;
}

// Ejecutar
crawlSiemensCategories().catch(console.error);

/**
 * Siemens Category Crawler - Versión Simplificada
 * 
 * Crawlea categorías específicas de Siemens SIRIUS y SENTRON
 * para mapear con la taxonomía de BD
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

// URLs semilla específicas de Siemens (solo español)
const SEED_URLS = [
  // SIRIUS - Control industrial
  'https://new.siemens.com/es-es/products/sirius/',
  'https://new.siemens.com/es-es/products/sirius/control-3rt7/',
  'https://new.siemens.com/es-es/products/sirius/control-3mt8/',
  'https://new.siemens.com/es-es/products/sirius/command-3sb6/',
  
  // SENTRON - Distribución
  'https://new.siemens.com/es-es/products/energy/power-distribution/sentron.html',
  
  // SIMATIC - Automatización
  'https://new.siemens.com/es-es/products/automation/simatic.html',
];

async function crawlSiemensSimple() {
  console.log('🔍 Iniciando crawl simplificado de Siemens...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    timestamp: new Date().toISOString(),
    pages: [],
    taxonomyMapping: [],
  };
  
  for (const url of SEED_URLS) {
    console.log(`Visitando: ${url}`);
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1920, height: 1080 },
    });
    
    const page = await context.newPage();
    
    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });
      
      await page.waitForTimeout(8000);
      
      // Extraer información
      const pageInfo = await page.evaluate(() => {
        const title = document.title;
        const h1 = document.querySelector('h1')?.textContent?.trim() || '';
        
        // Extraer todos los enlaces
        const links = Array.from(document.querySelectorAll('a[href]'))
          .map(a => ({
            href: a.href,
            text: a.textContent?.trim().substring(0, 100) || '',
          }))
          .filter(l => l.href.includes('siemens.com') && !l.href.includes('#'));
        
        // Extraer texto visible
        const visibleText = document.body?.innerText?.substring(0, 2000) || '';
        
        return { title, h1, links, visibleText };
      });
      
      console.log(`  Título: ${pageInfo.title}`);
      console.log(`  H1: ${pageInfo.h1}`);
      console.log(`  Enlaces encontrados: ${pageInfo.links.length}`);
      
      // Filtrar enlaces relevantes
      const productLinks = pageInfo.links.filter(l => 
        l.href.includes('/products/') && 
        !l.href.includes('mailto:') &&
        l.text.length > 0
      );
      
      console.log(`  Enlaces de producto: ${productLinks.length}`);
      
      results.pages.push({
        url,
        title: pageInfo.title,
        h1: pageInfo.h1,
        links: productLinks.slice(0, 50), // Máximo 50 enlaces por página
      });
      
    } catch (error) {
      console.error(`  ERROR: ${error.message}`);
    }
    
    await context.close();
  }
  
  await browser.close();
  
  // Generar mapeo de taxonomía
  console.log('\n📊 Generando mapeo de taxonomía...\n');
  
  for (const p of results.pages) {
    const url = p.url.toLowerCase();
    const title = (p.title + ' ' + p.h1).toLowerCase();
    
    let familia = 'AUTOMATIZACION';
    let subfamilia = 'Otros';
    let tipo = 'INDUSTRIAL';
    let gama = 'Siemens';
    
    // SIRIUS
    if (url.includes('sirius')) {
      familia = 'AUTOMATIZACION';
      gama = 'SIRIUS';
      
      if (url.includes('3rt') || title.includes('contactor')) {
        subfamilia = 'Contactor';
        tipo = 'CARRIL DIN';
        gama = 'SIRIUS Control';
      } else if (url.includes('3mt')) {
        subfamilia = 'Elemento de Control';
        tipo = 'CARRIL DIN';
      } else if (url.includes('3sb')) {
        subfamilia = 'Elemento de Control';
        tipo = 'PULSADOR';
      }
    }
    
    // SENTRON
    if (url.includes('sentron') || url.includes('power-distribution')) {
      familia = 'DISTRIBUCION DE POTENCIA';
      gama = 'SENTRON';
      
      if (title.includes('breaker') || title.includes('interruptor')) {
        subfamilia = 'Interruptor Magnetotérmico';
        tipo = 'CAJA MOLDEADA';
      }
    }
    
    // SIMATIC
    if (url.includes('simatic')) {
      familia = 'AUTOMATIZACION';
      subfamilia = 'PLC';
      tipo = 'MODULAR';
      gama = 'SIMATIC';
    }
    
    results.taxonomyMapping.push({
      url: p.url,
      title: p.title,
      familia,
      subfamilia,
      tipo,
      gama,
    });
  }
  
  // Guardar resultados
  const outputPath = '/mnt/c/Users/iagui/AI Projects/Repos de GitHub/proyecto-pfc-iago-duran/app/scripts/output/siemens-simple-crawl.json';
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`✅ Crawl completado!`);
  console.log(`📁 Resultados: ${outputPath}`);
  console.log(`\n📈 Resumen:`);
  console.log(`   - Páginas visitadas: ${results.pages.length}`);
  console.log(`   - Mapeos de taxonomía: ${results.taxonomyMapping.length}`);
  
  console.log('\n📋 Mapeo de taxonomía:');
  console.table(results.taxonomyMapping);
  
  return results;
}

crawlSiemensSimple().catch(console.error);

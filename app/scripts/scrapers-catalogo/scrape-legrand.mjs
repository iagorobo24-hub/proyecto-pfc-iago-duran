/**
 * SCRAPER LEGRAND ESPAÑA — PRODUCTOS ELECTRICOS (Playwright)
 * 
 * Usa Playwright para extraer productos de legrand.es.
 * El contenido carga dinámicamente con JavaScript.
 * 
 * Estructura de datos extraídos:
 *   - ref_fabricante: SKU de Legrand (ej: "424900")
 *   - nombre: Nombre completo del producto
 *   - descripcion: Descripción extraída de la página de detalle
 *   - marca: "Legrand"
 *   - familia: Categoría del producto
 *   - subfamilia: Subcategoría
 *   - pdf_url: URL de la ficha técnica (PDF)
 *   - imagen_url: URL de la imagen del producto
 *   - producto_url: URL de la página del producto
 * 
 * Uso:
 *   node scripts/scrape-legrand.mjs                          # Todas las categorías
 *   node scripts/scrape-legrand.mjs --categoria=dpx3         # Solo una categoría
 *   node scripts/scrape-legrand.mjs --dry-run               # Sin guardar en DB
 *   node scripts/scrape-legrand.mjs --max=10                 # Máx productos por categoría
 *   node scripts/scrape-legrand.mjs --delay=2000             # Delay entre páginas (ms)
 * 
 * Requisitos:
 *   LD_LIBRARY_PATH=/tmp/playwright-deps/usr/lib/x86_64-linux-gnu node scripts/scrape-legrand.mjs
 */

import { chromium } from 'playwright';
import { insertProduct, checkRefExists, getProductsCount } from '../lib/supabase-sonex.js';
import fs from 'fs';
import path from 'path';

// ─── Configuración de categorías ────────────────────────────────────────────
// URLs verificadas directamente de legrand.es (menú de productos)
const CATEGORIAS = {
  // Interruptores de caja moldeada DPX³
  dpx3: {
    name: 'Interruptores de caja moldeada DPX³',
    url: 'https://www.legrand.es/es/productos/interruptores-caja-moldeada-dpx3-0',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'CAJA MOLDEADA',
  },
  dpx3_hp: {
    name: 'Interruptores de caja moldeada DPX³ HP (alta potencia)',
    url: 'https://www.legrand.es/es/productos/interruptores-caja-moldeada-dpx3-hp',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'CAJA MOLDEADA',
  },
  dpx3_all: {
    name: 'Interruptores de caja moldeada DPX³ (todos)',
    url: 'https://www.legrand.es/es/productos/interruptores-caja-moldeada-dpx3',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'CAJA MOLDEADA',
  },
  // Protección residencial magnetotérmica y diferencial
  proteccion_residencial: {
    name: 'Protección residencial magnetotérmica y diferencial',
    url: 'https://www.legrand.es/es/productos/proteccion-residencial-magnetotermica-y-diferencial',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'CARRIL DIN',
  },
  // Protección modular magnetotérmica y diferencial
  proteccion_modular: {
    name: 'Protección modular magnetotérmica y diferencial',
    url: 'https://www.legrand.es/es/productos/proteccion-modular-magnetotermica-y-diferencial',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'CARRIL DIN',
  },
  // Protección industrial
  proteccion_industrial: {
    name: 'Protección y distribución industrial',
    url: 'https://www.legrand.es/es/productos/proteccion-y-distribucion-industrial',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'INDUSTRIAL',
  },
  // Protección e industria (ya scrapeada)
  proteccion_e_industria: {
    name: 'Protección e Industria',
    url: 'https://www.legrand.es/es/productos/proteccion-e-industria',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'INDUSTRIAL',
  },
  // Interruptores automáticos (ya scrapeada)
  interruptores_auto: {
    name: 'Interruptores automáticos',
    url: 'https://www.legrand.es/es/productos/interruptores-automaticos',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'CARRIL DIN',
  },
  // Interruptores seccionadores
  seccionadores: {
    name: 'Interruptores seccionadores',
    url: 'https://www.legrand.es/es/productos/interruptores-seccionadores',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'CARRIL DIN',
  },
  // Limitadores de sobretensión
  limitadores: {
    name: 'Limitadores de sobretensión',
    url: 'https://www.legrand.es/es/productos/limitadores-sobretension',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'CARRIL DIN',
  },
  // Guardamotores, contactores y fusibles
  guardamotores: {
    name: 'Guardamotores, contactores y fusibles',
    url: 'https://www.legrand.es/es/productos/guardamotores-contactores-y-fusibles',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'CARRIL DIN',
  },
  // Auxiliares de mando y señalización
  auxiliares_mando: {
    name: 'Auxiliares de mando y señalización',
    url: 'https://www.legrand.es/es/productos/auxiliares-mando-y-senalizacion',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'CARRIL DIN',
  },

  // ===== NUEVAS FAMILIAS =====

  // RESIDENCIAL (bajo DISTRIBUCION DE POTENCIA)
  cajas_modulares: {
    name: 'Cajas modulares para instalaciones residenciales',
    url: 'https://www.legrand.es/es/productos/cajas-modulares-para-instalaciones-residenciales',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'RESIDENCIAL',
  },
  cajas_superficie: {
    name: 'Cajas modulares de superficie y empotrar',
    url: 'https://www.legrand.es/es/productos/cajas-modulares-superficie-y-empotrar',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'RESIDENCIAL',
  },
  hogar_conectado: {
    name: 'Hogar conectado',
    url: 'https://www.legrand.es/es/productos/hogar-conectado',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'RESIDENCIAL',
  },
  proteccion_distribucion_residencial: {
    name: 'Protección y distribución residencial',
    url: 'https://www.legrand.es/es/productos/proteccion-y-distribucion-residencial',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'RESIDENCIAL',
  },

  // TERCIARIO (bajo DISTRIBUCION DE POTENCIA)
  mosaic_sistemas: {
    name: 'Mosaic y Sistemas terciarios',
    url: 'https://www.legrand.es/es/productos/mosaic-y-sistemas-terciarios',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'TERCIARIO',
  },
  proteccion_terciario: {
    name: 'Protección y distribución terciario',
    url: 'https://www.legrand.es/es/productos/proteccion-y-distribucion-terciario',
    familia: 'DISTRIBUCION DE POTENCIA',
    subfamilia: 'TERCIARIO',
  },

  // INSTALACION (nueva familia)
  bandejas_portacables: {
    name: 'Bandeja portacables',
    url: 'https://www.legrand.es/es/productos/bandeja-portacables',
    familia: 'INSTALACION',
    subfamilia: 'BANDEJAS',
  },
  canales_instalacion: {
    name: 'Canales de instalación',
    url: 'https://www.legrand.es/es/productos/canales-instalacion',
    familia: 'INSTALACION',
    subfamilia: 'CANALES',
  },
  minicanales: {
    name: 'Minicanales y microcanales',
    url: 'https://www.legrand.es/es/productos/minicanales-y-microcanales',
    familia: 'INSTALACION',
    subfamilia: 'MINICANALES',
  },
  canalizacion_prefabricada: {
    name: 'Canalización eléctrica prefabricada',
    url: 'https://www.legrand.es/es/productos/canalizacion-electrica-prefabricada',
    familia: 'INSTALACION',
    subfamilia: 'CANALIZACION',
  },
  canales_cuadros: {
    name: 'Canales para cuadros',
    url: 'https://www.legrand.es/es/productos/canales-para-cuadros',
    familia: 'INSTALACION',
    subfamilia: 'CANALES',
  },

  // FOTOVOLTAICA (nueva familia)
  instalaciones_fotovoltaicas: {
    name: 'Instalaciones fotovoltaicas',
    url: 'https://www.legrand.es/es/productos/instalaciones-fotovoltaicas',
    familia: 'FOTOVOLTAICA',
    subfamilia: 'FOTOVOLTAICA',
  },
  proteccion_fotovoltaica: {
    name: 'Protección para aplicaciones fotovoltaicas',
    url: 'https://www.legrand.es/es/productos/proteccion-y-distribucion-para-aplicaciones-fotovoltaicas-eolicas-o-ferroviarias',
    familia: 'FOTOVOLTAICA',
    subfamilia: 'FOTOVOLTAICA',
  },

  // ILUMINACION EMERGENCIA (nueva familia)
  alumbrado_emergencia: {
    name: 'Alumbrado de emergencia',
    url: 'https://www.legrand.es/es/productos/alumbrado-emergencia',
    familia: 'ILUMINACION',
    subfamilia: 'EMERGENCIA',
  },
  luminarias_interior: {
    name: 'Luminarias de emergencia LED de interior',
    url: 'https://www.legrand.es/es/productos/luminarias-emergencia-led-interior',
    familia: 'ILUMINACION',
    subfamilia: 'EMERGENCIA',
  },
  luminarias_estancas: {
    name: 'Luminarias de emergencia LED estancas',
    url: 'https://www.legrand.es/es/productos/luminarias-emergencia-led-estancas',
    familia: 'ILUMINACION',
    subfamilia: 'EMERGENCIA',
  },

  // VEHICULOS ELECTRICOS (nueva familia)
  recarga_vehiculos: {
    name: 'Soluciones para recarga de vehículos eléctricos',
    url: 'https://www.legrand.es/es/productos/soluciones-para-recarga-vehiculos-electricos',
    familia: 'VEHICULOS_ELECTRICOS',
    subfamilia: 'RECARGA',
  },

  // AUTOMATIZACION (nueva familia)
  auxiliares_programacion: {
    name: 'Auxiliares de mando y programación',
    url: 'https://www.legrand.es/es/productos/auxiliares-mando-y-programacion',
    familia: 'AUTOMATIZACION',
    subfamilia: 'AUTOMATIZACION',
  },
};

const MARCA = 'Legrand';
const BASE_URL = 'https://www.legrand.es';

// ─── Parse args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const CATEGORIA_FILTER = args.find(a => a.startsWith('--categoria='))?.split('=')[1];
const DRY_RUN = args.includes('--dry-run');
const MAX_PRODUCTS = parseInt(args.find(a => a.startsWith('--max='))?.split('=')[1] || '100');
const DELAY_MS = parseInt(args.find(a => a.startsWith('--delay='))?.split('=')[1] || '2000');
const RETRIES = parseInt(args.find(a => a.startsWith('--retries='))?.split('=')[1] || '3');

const LOG_FILE = path.join(import.meta.dirname, 'scrape-legrand.log');
const REPORT_FILE = path.join(import.meta.dirname, 'scrape-legrand-report.json');

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// ─── Playwright con LD_LIBRARY_PATH ─────────────────────────────────────────
let browser = null;

async function getBrowser() {
  if (!browser) {
    const libPath = '/tmp/playwright-deps/usr/lib/x86_64-linux-gnu';
    if (fs.existsSync(libPath)) {
      process.env.LD_LIBRARY_PATH = libPath + ':' + (process.env.LD_LIBRARY_PATH || '');
    }
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// ─── Extraer productos de una categoría ─────────────────────────────────────
async function scrapeCategoria(catKey, config, page) {
  log(`Scraping categoría: ${catKey} - ${config.name}`);
  log(`  URL: ${config.url}`);
  
  let allProducts = [];
  let pageNum = 0;
  let hasMore = true;
  
  while (hasMore && allProducts.length < MAX_PRODUCTS) {
    const url = pageNum === 0 ? config.url : `${config.url}?page=${pageNum}`;
    log(`  Página ${pageNum + 1}: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000); // Esperar que carguen productos
      
      // Extraer productos de esta página
      const products = await page.evaluate(() => {
        const items = document.querySelectorAll('[data-product-sku]');
        const results = [];
        const seen = new Set();
        
        for (let item of items) {
          const sku = item.getAttribute('data-product-sku');
          if (!sku || seen.has(sku)) continue;
          seen.add(sku);
          
          // Buscar enlace al producto
          let el = item;
          let productUrl = '';
          let productName = '';
          
          for (let i = 0; i < 5 && el; i++) {
            const link = el.querySelector('a[href*="/es/productos/"]');
            if (link) {
              productUrl = link.href.split('?')[0]; // Limpiar query params
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
      
      if (products.length === 0) {
        hasMore = false;
        log(`  No se encontraron más productos en página ${pageNum + 1}`);
      } else {
        allProducts.push(...products);
        log(`  Encontrados ${products.length} productos (total: ${allProducts.length})`);
        pageNum++;
        
        // Verificar si hay más páginas
        const nextLink = await page.$('a[rel="next"], a[aria-label="Siguiente"], .pagination .next');
        hasMore = !!nextLink;
      }
      
      if (allProducts.length < MAX_PRODUCTS && hasMore) {
        await page.waitForTimeout(DELAY_MS);
      }
      
    } catch (err) {
      log(`  ERROR en página ${pageNum + 1}: ${err.message}`);
      break;
    }
  }
  
  return allProducts.slice(0, MAX_PRODUCTS);
}

// ─── Obtener detalles de un producto (nombre, descripción, PDF) ──────────────
async function scrapeProductDetails(productUrl, page) {
  try {
    await page.goto(productUrl, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);
    
    const details = await page.evaluate(() => {
      const result = {
        nombre: '', // nombre completo del producto
        descripcion: '',
        pdfUrl: '',
        imagenUrl: ''
      };
      
      // Nombre del producto (h1 o similar)
      const titleEl = document.querySelector('h1, [class*="product-title"], [class*="product-name"]');
      if (titleEl) {
        result.nombre = titleEl.textContent?.trim() || '';
      }
      
      // Descripción
      const descEl = document.querySelector('[class*="description"], [class*="resumen"], .product-summary');
      if (descEl) {
        result.descripcion = descEl.textContent?.trim().substring(0, 500) || '';
      }
      
      // PDF / Ficha técnica
      const pdfLink = document.querySelector('a[href*=".pdf"], a[href*="/documentacion-tecnica/"]');
      if (pdfLink) {
        result.pdfUrl = pdfLink.href;
      }
      
      // Imagen
      const imgEl = document.querySelector('[class*="product-image"] img, .product-image img, picture source');
      if (imgEl) {
        result.imagenUrl = imgEl.src || imgEl.getAttribute('srcset')?.split(' ')[0] || '';
      }
      
      return result;
    });
    
    return details;
  } catch (err) {
    log(`  ERROR obteniendo detalles de ${productUrl}: ${err.message}`);
    return { nombre: '', descripcion: '', pdfUrl: '', imagenUrl: '' };
  }
}

// ─── Guardar producto en Supabase ────────────────────────────────────────────
async function saveProduct(product, config, report) {
  if (DRY_RUN) {
    log(`  [DRY-RUN] Guardaría: SKU=${product.sku}, nombre="${product.name}"`);
    report.nuevos++;
    return true;
  }
  
  try {
    // Verificar si ya existe
    const exists = await checkRefExists(product.sku);
    
    if (exists) {
      report.duplicados++;
      return false;
    }
    
    // Preparar producto para Supabase (campos según schema products)
    const record = {
      ref_fabricante: product.sku,
      name: product.nombre || product.name || '',
      marca: MARCA,
      brand_id: 457, // TODO: Obtener brand_id de Legrand con setup-brand
      familia: config.familia,
      subfamilia: config.subfamilia,
      tipo: config.subfamilia, // Por ahora mismo que subfamilia = tipo
      Gama: config.name, // Nombre de la categoría como Gama
      Subgama: '', // Por rellenar si se detecta subfamilia específica
      imagen: product.imagenUrl || '',
      pdf_url: product.pdfUrl || '',
      precio: 0, // Legrand no proporciona precio en scraping
    };
    
    await insertProduct(record);
    report.nuevos++;
    return true;
    
  } catch (err) {
    log(`  ERROR guardando SKU=${product.sku}: ${err.message}`);
    report.errores++;
    return false;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  log('=== INICIO SCRAPING LEGRAND ===');
  
  // Configurar LD_LIBRARY_PATH para Playwright
  const libPath = '/tmp/playwright-deps/usr/lib/x86_64-linux-gnu';
  if (fs.existsSync(libPath)) {
    process.env.LD_LIBRARY_PATH = libPath + ':' + (process.env.LD_LIBRARY_PATH || '');
    log(`LD_LIBRARY_PATH configurado: ${libPath}`);
  } else {
    log('ATENCIÓN: Librerías de Playwright no encontradas en', libPath);
  }
  
  // Filtrar categorías
  const categorias = CATEGORIA_FILTER 
    ? { [CATEGORIA_FILTER]: CATEGORIAS[CATEGORIA_FILTER] }
    : CATEGORIAS;
  
  if (!CATEGORIA_FILTER || !categorias[CATEGORIA_FILTER]) {
    log(`Categorías disponibles: ${Object.keys(CATEGORIAS).join(', ')}`);
    if (CATEGORIA_FILTER) {
      log(`Categoría "${CATEGORIA_FILTER}" no encontrada`);
      process.exit(1);
    }
  }
  
  // Estadísticas
  const report = {
    categorias: Object.keys(categorias).length,
    totalProductos: 0,
    nuevos: 0,
    duplicados: 0,
    errores: 0,
    inicio: new Date().toISOString(),
    fin: null,
  };
  
  let browserInstance;
  try {
    browserInstance = await getBrowser();
    const page = await browserInstance.newPage();
    
    // Configurar agente
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    for (const [catKey, config] of Object.entries(categorias)) {
      log(`\n=== Procesando categoría: ${catKey} ===`);
      
      const productos = await scrapeCategoria(catKey, config, page);
      log(`Total productos en ${catKey}: ${productos.length}`);
      
      report.totalProductos += productos.length;
      
      // Procesar cada producto
      for (const product of productos) {
        // Obtener detalles adicionales (nombre completo, descripción, PDF)
        const details = await scrapeProductDetails(product.url, page);
        
        const productWithDetails = {
          ...product,
          ...details,
          nombre: details.nombre || product.name
        };
        
        await saveProduct(productWithDetails, config, report);
        
        // Delay entre productos para no saturar
        await page.waitForTimeout(DELAY_MS / 2);
      }
    }
    
    await page.close();
    
  } catch (err) {
    log(`ERROR GENERAL: ${err.message}`);
    report.errores++;
  } finally {
    await closeBrowser();
  }
  
  // Reporte final
  report.fin = new Date().toISOString();
  log('\n=== RESUMEN ===');
  log(`Categorías procesadas: ${report.categorias}`);
  log(`Productos encontrados: ${report.totalProductos}`);
  log(`Nuevos guardados: ${report.nuevos}`);
  log(`Duplicados omitidos: ${report.duplicados}`);
  log(`Errores: ${report.errores}`);
  log(`Duración: ${new Date(report.fin) - new Date(report.inicio)}ms`);
  
  // Guardar reporte
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  log(`Reporte guardado: ${REPORT_FILE}`);
  
  log('=== FIN SCRAPING LEGRAND ===');
}

// ─── Ejecutar ────────────────────────────────────────────────────────────────
main().catch(err => {
  console.error('Error Fatal:', err.message);
  process.exit(1);
});
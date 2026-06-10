/**
 * SCRAPER ABB OFFICIAL — CATÁLOGO COMPLETO (Sonepar & Robótica)
 * 
 * Diseñado para extraer e importar todo el catálogo disponible de ABB (7.000+ productos)
 * a partir de los chunks de Sonepar España y el catálogo oficial de robótica en una sola ejecución.
 * 
 * Uso:
 *   node scripts/scrape-abb-official.mjs
 *   node scripts/scrape-abb-official.mjs --dry-run
 */

import { insertProduct, checkRefExists, getBrands } from './lib/supabase-sonex.js';
import fs from 'fs';
import path from 'path';

const MARCA = 'ABB';
const BRAND_ID = 463; // ID verificado para ABB en la base de datos
const CHUNKS_DIR = path.join(import.meta.dirname, '../sonepar-catalog-scraper');
const LOG_FILE = path.join(import.meta.dirname, 'scrape-abb-official.log');
const REPORT_FILE = path.join(import.meta.dirname, 'scrape-abb-official-report.json');

// Catálogo oficial de Robótica que no se distribuye por canales eléctricos normales (Sonepar)
const ROBOTICS_CATALOG = [
  {
    sku: 'ABB-IRB-120',
    name: 'Brazo robótico industrial de 6 ejes ABB IRB 120 3kg',
    familia: 'Robótica',
    subfamilia: 'Robot Industrial',
    tipo: '6 EJES',
    Gama: 'IRB 120',
    Subgama: 'IRB 120-3/0.6',
    pdf_url: 'https://search.abb.com/library/Download.aspx?DocumentID=PR10398EN_Low&LanguageCode=en&Action=Launch',
    imagen: 'https://new.abb.com/images/librariesprovider8/default-album/irb-120-industrial-robot.jpg',
    precio: 18500.00
  },
  {
    sku: 'ABB-IRB-1200-5',
    name: 'Brazo robótico industrial ABB IRB 1200 5kg alcance 0.9m',
    familia: 'Robótica',
    subfamilia: 'Robot Industrial',
    tipo: '6 EJES',
    Gama: 'IRB 1200',
    Subgama: 'IRB 1200-5/0.9',
    pdf_url: 'https://search.abb.com/library/Download.aspx?DocumentID=PR10399EN_Low&LanguageCode=en&Action=Launch',
    imagen: 'https://new.abb.com/images/librariesprovider8/default-album/irb-1200-industrial-robot.jpg',
    precio: 24500.00
  },
  {
    sku: 'ABB-OMNICORE-C30',
    name: 'Controlador de robot industrial compacto ABB OmniCore C30',
    familia: 'Robótica',
    subfamilia: 'Controlador de Robot',
    tipo: 'CONTROLADOR',
    Gama: 'OmniCore',
    Subgama: 'OmniCore C30',
    pdf_url: 'https://search.abb.com/library/Download.aspx?DocumentID=3HAC065036-005&LanguageCode=en&Action=Launch',
    imagen: 'https://new.abb.com/images/librariesprovider8/default-album/omnicore-c30-robot-controller.jpg',
    precio: 6500.00
  },
  {
    sku: 'ABB-OMNICORE-V250XT',
    name: 'Controlador de robot industrial ABB OmniCore V250XT',
    familia: 'Robótica',
    subfamilia: 'Controlador de Robot',
    tipo: 'CONTROLADOR',
    Gama: 'OmniCore',
    Subgama: 'OmniCore V250XT',
    pdf_url: 'https://search.abb.com/library/Download.aspx?DocumentID=3HAC078456-005&LanguageCode=en&Action=Launch',
    imagen: 'https://new.abb.com/images/librariesprovider8/default-album/omnicore-v250xt-robot-controller.jpg',
    precio: 9200.00
  },
  {
    sku: '3HAC064000-001',
    name: 'Consola de programación manual ABB FlexPendant para OmniCore',
    familia: 'Robótica',
    subfamilia: 'Accesorio de Robot',
    tipo: 'CONSOLA',
    Gama: 'FlexPendant',
    Subgama: 'FlexPendant V5',
    pdf_url: 'https://search.abb.com/library/Download.aspx?DocumentID=3HAC064000-001&LanguageCode=en&Action=Launch',
    imagen: 'https://new.abb.com/images/librariesprovider8/default-album/flexpendant-robot-teach-pendant.jpg',
    precio: 2950.00
  },
  {
    sku: 'ABB-IRC5-SINGLE',
    name: 'Controlador de robot industrial modular ABB IRC5 Single Cabinet',
    familia: 'Robótica',
    subfamilia: 'Controlador de Robot',
    tipo: 'CONTROLADOR',
    Gama: 'IRC5',
    Subgama: 'IRC5 Single',
    pdf_url: 'https://search.abb.com/library/Download.aspx?DocumentID=3HAC047400-005&LanguageCode=en&Action=Launch',
    imagen: 'https://new.abb.com/images/librariesprovider8/default-album/irc5-robot-controller.jpg',
    precio: 7800.00
  }
];

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// Cargar clave de API de Supabase para consultas directas
let SUPABASE_KEY = process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!SUPABASE_KEY) {
  try {
    const envPath = path.join(import.meta.dirname, '../..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    SUPABASE_KEY = envContent.match(/SONEX_SUPABASE_KEY=(.+)/)?.[1]?.trim() ||
                   envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim() || '';
  } catch (err) {
    // ignorar
  }
}

// Obtener todas las referencias existentes de ABB para prevenir duplicados en memoria
async function fetchExistingABBRefs() {
  log('⌛ Cargando referencias de productos de ABB existentes para evitar duplicados...');
  const refs = new Set();
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const url = `https://fncmzrnmzmuhlullkrud.supabase.co/rest/v1/products?select=ref_fabricante&marca=eq.ABB&limit=${limit}&offset=${offset}`;
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    };
    
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Error Supabase al consultar referencias de ABB: ${res.status} - ${err}`);
    }
    
    const data = await res.json();
    data.forEach(p => {
      if (p.ref_fabricante) refs.add(p.ref_fabricante.trim());
    });
    
    if (data.length < limit) break;
    offset += limit;
  }
  
  log(`✅ Cargadas ${refs.size} referencias de ABB desde Supabase.`);
  return refs;
}

// Realizar inserción masiva en Supabase
async function insertProductsBulk(products) {
  const url = `https://fncmzrnmzmuhlullkrud.supabase.co/rest/v1/products`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(products)
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error en inserción masiva (POST): ${res.status} - ${errorText}`);
  }
}

// Clasificación taxonómica de ABB
function mapABBProduct(p, brandId) {
  const name = (p.descripcion || p.nombre || '').trim();
  const ref = p.refFabricante || p.codigoArticulo || p.ref || '';
  
  if (!name || !ref) return null;

  // Valores predeterminados
  let familia = 'Instalación';
  let subfamilia = 'Accesorio';
  let tipo = 'ACCESORIO';
  let gama = 'Otros';
  let subgama = '';

  const nameUpper = name.toUpperCase();
  const fam1Upper = (p.descFam1 || '').toUpperCase();
  const fam2Upper = (p.descFam2 || '').toUpperCase();
  const fam3Upper = (p.descFam3 || '').toUpperCase();

  // PVP
  const pvp = p.pvp || '0';
  const cleanedPrice = String(pvp).replace(/\./g, '').replace(',', '.').trim();
  const precio = parseFloat(cleanedPrice) || 0;

  // Imagen
  let image_url = '';
  if (p.imagenes && p.imagenes.length > 0) {
    const imgObj = p.imagenes[0];
    image_url = typeof imgObj === 'string' ? imgObj : (imgObj.imagen || imgObj.url || '');
  }

  // PDF
  const pdf_url = p.urlPdfInfTecnica || '';

  // Reglas de mapeo taxonómico
  // 1. Interruptores Magnetotérmicos
  if (
    (fam1Upper.includes('POTENCIA') || fam2Upper.includes('BAJA TENSION') || fam2Upper.includes('PROTECCION')) &&
    (nameUpper.includes('INT. AUT.') || nameUpper.includes('MAGNETOTERMICO') || nameUpper.includes('INT.AUT.') || nameUpper.includes('AUTOMATICO') || /S[238]0\d/i.test(nameUpper) || /SH20\d/i.test(nameUpper)) &&
    !nameUpper.includes('DIFERENCIAL') && !nameUpper.includes('DIF.') && !nameUpper.includes('BLOQUE')
  ) {
    familia = 'Distribución de potencia';
    subfamilia = 'Interruptor Magnetotérmico';
    tipo = 'CARRIL DIN';
    gama = 'System Pro M';
    const mcbMatch = nameUpper.match(/\b(S20\d|S80\d|SH20\d|S30\d)\b/);
    if (mcbMatch) {
      gama = mcbMatch[1];
    }
  }
  // 2. Interruptores Diferenciales
  else if (
    (fam1Upper.includes('POTENCIA') || fam2Upper.includes('BAJA TENSION') || fam2Upper.includes('DIFERENCIAL')) &&
    (nameUpper.includes('DIFERENCIAL') || nameUpper.includes('INT.DIF.') || nameUpper.includes('INT. DIF.') || /F20\d/i.test(nameUpper) || /FH20\d/i.test(nameUpper))
  ) {
    familia = 'Distribución de potencia';
    subfamilia = 'Interruptor Diferencial';
    tipo = 'CARRIL DIN';
    gama = 'System Pro M';
    const rcdMatch = nameUpper.match(/\b(F20\d|FH20\d)\b/);
    if (rcdMatch) {
      gama = rcdMatch[1];
    }
  }
  // 3. Interruptores Caja Moldeada (MCCB)
  else if (
    fam2Upper.includes('CAJA MOLDEADA') || fam3Upper.includes('CAJA MOLDEADA') || nameUpper.includes('TMAX') || nameUpper.includes('XT1') || nameUpper.includes('XT2') || nameUpper.includes('XT3') || nameUpper.includes('XT4') || nameUpper.includes('XT5') || nameUpper.includes('XT6') || nameUpper.includes('XT7')
  ) {
    familia = 'Distribución de potencia';
    subfamilia = 'Interruptor Caja Moldeada';
    tipo = 'CAJA MOLDEADA';
    gama = 'Tmax XT';
    const mccbMatch = nameUpper.match(/\b(XT\d)\b/);
    if (mccbMatch) {
      subgama = mccbMatch[1];
    }
  }
  // 4. Guardamotores
  else if (
    fam2Upper.includes('MOTOR') || fam3Upper.includes('MOTOR') || nameUpper.includes('GUARDAMOTOR') || /MS116|MS132|MS165/i.test(nameUpper)
  ) {
    familia = 'Automatización';
    subfamilia = 'Guardamotor';
    tipo = 'CARRIL DIN';
    gama = 'MS Series';
    const guardMatch = nameUpper.match(/\b(MS116|MS132|MS165)\b/i);
    if (guardMatch) {
      gama = guardMatch[1].toUpperCase();
    }
  }
  // 5. Contactores
  else if (
    nameUpper.includes('CONTACTOR') || nameUpper.includes('CONT.') || /AF09|AF12|AF16|AF26|AF30|AF38|AF40|AF52|AF65|AF80|AF96/i.test(nameUpper)
  ) {
    familia = 'Automatización';
    subfamilia = 'Contactor';
    tipo = 'CARRIL DIN';
    gama = 'AF Series';
    const contMatch = nameUpper.match(/\b(AF\d+)\b/i);
    if (contMatch) {
      gama = contMatch[1].toUpperCase();
    }
  }
  // 6. Bornas
  else if (
    fam2Upper.includes('BORNAS') || fam3Upper.includes('BORNAS') || fam3Upper.includes('CONEXION') || nameUpper.includes('BORNA') || nameUpper.includes('ZS4') || nameUpper.includes('ZS6') || nameUpper.includes('ZS10')
  ) {
    familia = 'Distribución de potencia';
    subfamilia = 'Bornas';
    tipo = 'CARRIL DIN';
    gama = 'SNK';
  }
  // 7. Fuente Alimentación
  else if (
    (nameUpper.includes('FUENTE') && (nameUpper.includes('ALIMENTACION') || nameUpper.includes('TENSION'))) || /CP-D|CP-E|CP-S|CP-C/i.test(nameUpper)
  ) {
    familia = 'Automatización';
    subfamilia = 'Fuente alimentación';
    tipo = 'CARRIL DIN';
    gama = 'CP Series';
    const pwrMatch = nameUpper.match(/\b(CP-[DECS])\b/i);
    if (pwrMatch) {
      gama = pwrMatch[1].toUpperCase();
    }
  }
  // 8. Relé de Control / Relé de Seguridad
  else if (nameUpper.includes('SENTRY') || nameUpper.includes('SSR10') || nameUpper.includes('BSR10')) {
    familia = 'Automatización';
    subfamilia = 'Relé de Seguridad';
    tipo = 'CARRIL DIN';
    gama = 'Sentry';
  } else if (nameUpper.includes('RELE') || /CR-[MPU]/i.test(nameUpper)) {
    familia = 'Automatización';
    subfamilia = 'Relé de Control';
    tipo = 'CARRIL DIN';
    gama = 'CR Series';
  }
  // 9. Interruptor Seccionador
  else if (nameUpper.includes('SECCIONADOR') || nameUpper.includes('OTP') || /OT[123468]\d/i.test(nameUpper)) {
    familia = 'Distribución de potencia';
    subfamilia = 'Interruptor Seccionador';
    tipo = 'CARRIL DIN';
    gama = 'OT Series';
  }
  // 10. Puntos de recarga
  else if (nameUpper.includes('TERRA') || nameUpper.includes('WALLBOX') || nameUpper.includes('RECUPERACION VEHICULO') || nameUpper.includes('RVE')) {
    familia = 'Vehículos eléctricos';
    subfamilia = 'Puntos de recarga';
    tipo = 'WALLBOX';
    gama = 'Terra AC';
  }
  // 11. Variador velocidad
  else if (nameUpper.includes('VARIADOR') || /ACS\d{3}/i.test(nameUpper)) {
    familia = 'Automatización';
    subfamilia = 'Variador velocidad';
    tipo = 'CARRIL DIN';
    gama = 'ACS Series';
    const drvMatch = nameUpper.match(/\b(ACS\d+)\b/i);
    if (drvMatch) {
      gama = drvMatch[1].toUpperCase();
    }
  }
  // 12. Cajas / Envolventes
  else if (fam2Upper.includes('ENVOLVENTES') || fam2Upper.includes('CUADROS') || nameUpper.includes('ARMARIO') || nameUpper.includes('MISTRAL') || nameUpper.includes('ARIA') || nameUpper.includes('GEMINI')) {
    familia = 'Distribución de potencia';
    subfamilia = 'Caja Distribucion';
    tipo = 'CUADROS';
    if (nameUpper.includes('MISTRAL')) gama = 'System Pro E Comfort';
    else if (nameUpper.includes('ARIA')) gama = 'Aria';
    else if (nameUpper.includes('GEMINI')) gama = 'Gemini';
    else gama = 'Enclosures';
  }
  // 13. Pulsadores / Pilotos
  else if (nameUpper.includes('PULSADOR') || nameUpper.includes('SELECTOR') || nameUpper.includes('PILOTO') || /CP1|CP2|CP3|MP1|MP2|MP3/i.test(nameUpper)) {
    familia = 'Automatización';
    subfamilia = 'Pulsador';
    tipo = 'ELEMENTO MANDO';
    gama = 'Compact';
  }
  // 14. Accesorios / Auxiliares
  else if (nameUpper.includes('CONTACTO AUXILIAR') || nameUpper.includes('BOBINA') || nameUpper.includes('ACCESORIO') || nameUpper.includes('BLOQUE') || nameUpper.includes('PASACABL') || nameUpper.includes('CONTRAPUERTA') || nameUpper.includes('FIJACION') || nameUpper.includes('PUENTE') || /S2C-/i.test(nameUpper)) {
    const isPotencia = fam1Upper.includes('POTENCIA') || fam2Upper.includes('BAJA TENSION');
    familia = isPotencia ? 'Distribución de potencia' : 'Automatización';
    subfamilia = 'Accesorio';
    tipo = 'ACCESORIO';
    gama = 'Accessories';
  }
  // 15. Robótica
  else if (nameUpper.includes('ROBOT') || nameUpper.includes('IRB ') || nameUpper.includes('OMNICORE') || nameUpper.includes('FLEXPENDANT')) {
    familia = 'Robótica';
    if (nameUpper.includes('IRB')) {
      subfamilia = 'Robot Industrial';
      tipo = '6 EJES';
    } else if (nameUpper.includes('OMNICORE') || nameUpper.includes('IRC5')) {
      subfamilia = 'Controlador de Robot';
      tipo = 'CONTROLADOR';
    } else {
      subfamilia = 'Accesorio de Robot';
      tipo = 'CONSOLA';
    }
    gama = 'Robotics';
  }
  // 16. Domótica
  else if (fam1Upper.includes('DOMOTICA') || fam2Upper.includes('KNX') || nameUpper.includes('KNX')) {
    familia = 'Automatización de edificios';
    subfamilia = 'Actuador KNX';
    tipo = 'CARRIL DIN';
    gama = 'i-bus KNX';
  }

  // Refinado de gama si quedó en Otros
  if (gama === 'Otros') {
    const firstWord = name.split(/[ ,-\/]/)[0];
    if (firstWord && firstWord.length > 2 && firstWord.length < 15 && /^[A-Z0-9]+$/i.test(firstWord)) {
      gama = firstWord;
    }
  }

  return {
    ref_fabricante: ref.trim(),
    name: name.substring(0, 150),
    marca: MARCA,
    brand_id: brandId,
    familia: familia,
    subfamilia: subfamilia,
    tipo: tipo,
    Gama: gama,
    Subgama: subgama,
    imagen: image_url || '',
    pdf_url: pdf_url || '',
    precio: precio
  };
}

async function main() {
  log('=== INICIO SCRAPING Y EXTRACCIÓN MASIVA ABB ===');

  const report = {
    totalProductosScan: 0,
    candidatosABB: 0,
    nuevos: 0,
    duplicados: 0,
    errores: 0,
    inicio: new Date().toISOString(),
    fin: null
  };

  if (!SUPABASE_KEY) {
    log('❌ Error: Falta la clave de Supabase en las variables de entorno o archivo .env');
    process.exit(1);
  }

  // 1. Obtener referencias existentes para deduplicación instantánea
  let existingRefs = new Set();
  try {
    existingRefs = await fetchExistingABBRefs();
  } catch (err) {
    log(`⚠️ Advertencia cargando referencias: ${err.message}. Se asume base de datos vacía.`);
  }

  // 2. Escanear chunks de Sonepar
  log(`📂 Escaneando chunks de Sonepar en: ${CHUNKS_DIR}`);
  if (!fs.existsSync(CHUNKS_DIR)) {
    log(`❌ Directorio de chunks no existe: ${CHUNKS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(CHUNKS_DIR).filter(f => f.startsWith('S') && f.endsWith('.json') && !f.includes('progress'));
  log(`Encontrados ${files.length} archivos de chunks.`);

  const productsToProcess = [];

  // Leer Sonepar chunks
  for (const file of files) {
    const filePath = path.join(CHUNKS_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const products = JSON.parse(content);
      report.totalProductosScan += products.length;

      for (const p of products) {
        const brandRaw = (p.marca || p.nombreFabricante || '').trim().toUpperCase();
        if (brandRaw.includes('ABB')) {
          report.candidatosABB++;
          const mapped = mapABBProduct(p, BRAND_ID);
          if (mapped) {
            productsToProcess.push(mapped);
          }
        }
      }
    } catch (err) {
      log(`❌ Error leyendo ${file}: ${err.message}`);
    }
  }

  // 3. Fusionar con catálogo de Robótica
  log(`🤖 Añadiendo catálogo estático de Robótica (${ROBOTICS_CATALOG.length} productos)...`);
  for (const r of ROBOTICS_CATALOG) {
    productsToProcess.push({
      ref_fabricante: r.sku,
      name: r.name,
      marca: MARCA,
      brand_id: BRAND_ID,
      familia: r.familia,
      subfamilia: r.subfamilia,
      tipo: r.tipo,
      Gama: r.Gama,
      Subgama: r.Subgama,
      imagen: r.imagen || '',
      pdf_url: r.pdf_url || '',
      precio: r.precio || 0
    });
  }

  log(`📊 Candidatos totales a procesar (Sonepar + Robótica): ${productsToProcess.length}`);

  // 4. Filtrar duplicados
  const finalBatch = [];
  for (const p of productsToProcess) {
    if (existingRefs.has(p.ref_fabricante)) {
      report.duplicados++;
    } else {
      finalBatch.push(p);
      // Evitar meter duplicados dentro del mismo lote leído
      existingRefs.add(p.ref_fabricante);
    }
  }

  log(`🆕 Candidatos únicos nuevos a insertar: ${finalBatch.length}`);

  // 5. Inserción masiva en lotes de 100
  if (finalBatch.length > 0) {
    if (DRY_RUN) {
      log(`[DRY-RUN] Se omiten las inserciones en la base de datos.`);
      report.nuevos = finalBatch.length;
    } else {
      const batchSize = 100;
      for (let i = 0; i < finalBatch.length; i += batchSize) {
        const batch = finalBatch.slice(i, i + batchSize);
        try {
          await insertProductsBulk(batch);
          report.nuevos += batch.length;
          log(`   ✅ Lote insertado: ${report.nuevos}/${finalBatch.length}`);
        } catch (err) {
          log(`   ❌ Error insertando lote: ${err.message}`);
          report.errores += batch.length;
        }
      }
    }
  } else {
    log('✅ No hay nuevos productos únicos de ABB para insertar.');
  }

  report.fin = new Date().toISOString();
  log('=== RESUMEN SCRAPING ABB OFICIAL ===');
  log(`Total productos escaneados en Sonepar: ${report.totalProductosScan}`);
  log(`Total candidatos de ABB encontrados: ${report.candidatosABB}`);
  log(`Nuevos insertados/procesados: ${report.nuevos}`);
  log(`Duplicados omitidos: ${report.duplicados}`);
  log(`Errores: ${report.errores}`);
  log(`Duración: ${new Date(report.fin) - new Date(report.inicio)}ms`);

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  log(`Reporte guardado en: ${REPORT_FILE}`);
}

main().catch(err => {
  console.error('Fatal Error ABB:', err.message);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * IMPORTACIÓN MASIVA DE PRODUCTOS (Eaton, Finder, Circutor, Phoenix Contact)
 * 
 * Lee los chunks JSON locales de Sonepar, filtra y clasifica los productos,
 * evita duplicados contra la base de datos de Supabase y realiza inserciones en lote.
 * 
 * Ejecutar: node app/scripts/import-massive-brands.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Cargar variables de entorno
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan credenciales de Supabase en el archivo .env');
  process.exit(1);
}

const HEADERS = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const CHUNKS_DIR = path.join(__dirname, '../sonepar-catalog-scraper');
const BRANDS_TO_IMPORT = ['Eaton', 'Finder', 'Circutor', 'Phoenix Contact'];
const LIMIT_PER_BRAND = 10000; // Lote representativo de alta calidad por marca

// Función de mapeo taxonómico
function mapProduct(p, brandId, brandName) {
  const name = (p.descripcion || p.nombre || '').trim();
  const ref = p.refFabricante || p.codigoArticulo || '';
  
  if (!name || !ref) return null;

  let familia = 'Instalación';
  let subfamilia = 'Accesorio';
  let tipo = 'ACCESORIO';
  let gama = 'Otros';
  let subgama = 'Otros';

  const nameUpper = name.toUpperCase();
  const fam1Upper = (p.descFam1 || '').toUpperCase();
  const fam2Upper = (p.descFam2 || '').toUpperCase();

  // Imagen y PDF
  const image_url = p.imagenes?.length > 0 ? (p.imagenes[0].imagen || p.imagenes[0]) : '';
  const pdf_url = p.urlPdfInfTecnica || '';
  const precio = parsePrice(p.pvp);

  if (brandName === 'Finder') {
    familia = 'Automatización';
    subfamilia = 'Relé de Control';
    tipo = 'CARRIL DIN';
    gama = 'Serie Relés';
    
    if (nameUpper.includes('TELERRUPTOR') || nameUpper.includes('PASO A PASO') || nameUpper.includes('TELERUPTOR')) {
      subfamilia = 'Relé de Control';
      gama = 'Serie 20';
      subgama = 'Telerruptor';
    } else if (nameUpper.includes('CONTACTOR')) {
      subfamilia = 'Contactor';
      gama = 'Serie 22';
      subgama = 'Contactor modular';
    } else if (nameUpper.includes('TEMPORIZADOR') || nameUpper.includes('HORARIO') || nameUpper.includes('TIEMPO')) {
      subfamilia = 'Interruptor Horario';
      gama = 'Serie 80';
      subgama = 'Temporizador modular';
    } else if (nameUpper.includes('TERMOSTATO') || nameUpper.includes('CRONO')) {
      familia = 'Climatización';
      subfamilia = 'Termostato';
      gama = 'Serie 7T';
      subgama = 'Termostato de cuadro';
    } else if (nameUpper.includes('ENCHUFABLE') || nameUpper.includes('MINIATURA')) {
      subfamilia = 'Relé de Control';
      tipo = 'ENCHUFABLE';
      gama = 'Serie 40';
      subgama = 'Relé miniatura';
    } else if (nameUpper.includes('ACOPLAMIENTO') || nameUpper.includes('INTERFACE') || nameUpper.includes('ACOPLADOR')) {
      subfamilia = 'Relé de Control';
      gama = 'Serie 38';
      subgama = 'Relé acoplamiento';
    }
  } 
  else if (brandName === 'Eaton') {
    familia = 'Distribución de potencia';
    subfamilia = 'Interruptor Magnetotérmico';
    tipo = 'CARRIL DIN';
    gama = 'Moeller Series';
    
    if (nameUpper.includes('DIFERENCIAL') || nameUpper.includes('INTERRUPTOR DIF') || nameUpper.includes('RCCB') || nameUpper.includes('INT.DIF.')) {
      subfamilia = 'Interruptor Diferencial';
      subgama = 'Diferencial modular';
    } else if (nameUpper.includes('MAGNETOTERMICO') || nameUpper.includes('AUTOMATICO') || nameUpper.includes('MCB') || nameUpper.includes('FAZ') || nameUpper.includes('INT.AUT.')) {
      subfamilia = 'Interruptor Magnetotérmico';
      subgama = 'Magnetotérmico modular';
    } else if (nameUpper.includes('GUARDAMOTOR') || nameUpper.includes('MOTOR STARTER') || nameUpper.includes('PKZM')) {
      familia = 'Automatización';
      subfamilia = 'Guardamotor';
      subgama = 'Protección motor';
    } else if (nameUpper.includes('CONTACTOR') || nameUpper.includes('DILM')) {
      familia = 'Automatización';
      subfamilia = 'Contactor';
      subgama = 'Contactor industrial';
    } else if (nameUpper.includes('SOBRETENSION') || nameUpper.includes('SPD')) {
      subfamilia = 'Proteccion Sobretension';
      subgama = 'Limitador transitorias';
    }
  } 
  else if (brandName === 'Circutor') {
    familia = 'Distribución de potencia';
    subfamilia = 'Accesorio';
    tipo = 'INDUSTRIAL';
    gama = 'Medida y Control';
    
    if (nameUpper.includes('ANALIZADOR') || nameUpper.includes('CVM')) {
      subfamilia = 'Analizador redes';
      subgama = 'Analizador de redes';
    } else if (nameUpper.includes('TRANSFORMADOR') || nameUpper.includes('CORRIENTE') || nameUpper.includes('WGC') || nameUpper.includes('TC ') || nameUpper.includes('TI ')) {
      subfamilia = 'Accesorio';
      tipo = 'TRANSFORMADOR';
      subgama = 'Transformador de intensidad';
    } else if (nameUpper.includes('CONTADOR') || nameUpper.includes('ENERGIA') || nameUpper.includes('MEDIDOR') || nameUpper.includes('CONTR.')) {
      subfamilia = 'Contador energía';
      subgama = 'Medidor de consumo';
    } else if (nameUpper.includes('CARGADOR') || nameUpper.includes('RECUPERACION') || nameUpper.includes('VEHICULO') || nameUpper.includes('WALLBOX') || nameUpper.includes('RVE')) {
      familia = 'Vehículos eléctricos';
      subfamilia = 'Puntos de recarga';
      tipo = 'CARGADOR';
      gama = 'eHome / Urban';
      subgama = 'Cargador de pared';
    }
  } 
  else if (brandName === 'Phoenix Contact') {
    familia = 'Instalación';
    subfamilia = 'Bornas';
    tipo = 'CARRIL DIN';
    gama = 'Industrial Connection';
    
    if (nameUpper.includes('BORNA') || nameUpper.includes('CONECTOR') || nameUpper.includes('TERMINAL') || nameUpper.includes('PT ') || nameUpper.includes('UT ') || nameUpper.includes('UK ')) {
      subfamilia = 'Bornas';
      subgama = 'Borna de conexión';
    } else if (nameUpper.includes('FUENTE') || nameUpper.includes('ALIMENTACION') || nameUpper.includes('POWER') || nameUpper.includes('QUINT') || nameUpper.includes('TRIO')) {
      familia = 'Distribución de potencia';
      subfamilia = 'Fuente alimentación';
      subgama = 'Fuente industrial';
    } else if (nameUpper.includes('RELE') || nameUpper.includes('RIF') || nameUpper.includes('OPTOCOPLADOR') || nameUpper.includes('PLC-RSC')) {
      familia = 'Automatización';
      subfamilia = 'Relé de Control';
      gama = 'Relés de interfaz';
      subgama = 'Relé de acoplamiento';
    } else if (nameUpper.includes('CABLE') || nameUpper.includes('ETHERNET') || nameUpper.includes('RJ45') || nameUpper.includes('M12')) {
      familia = 'Comunicación';
      subfamilia = 'Accesorio';
      tipo = 'CABLE';
      gama = 'Cables de datos';
      subgama = 'Ethernet / Bus';
    } else if (nameUpper.includes('SOBRETENSION') || nameUpper.includes('DESCARGADOR') || nameUpper.includes('VALVETRAB')) {
      subfamilia = 'Proteccion Sobretension';
      subgama = 'Sobretensiones transitorias';
    }
  }

  // Fallback mappings from Sonepar categories if name is too generic
  if (subfamilia === 'Accesorio') {
    if (fam2Upper.includes('CONTACTOR')) {
      familia = 'Automatización';
      subfamilia = 'Contactor';
    } else if (fam2Upper.includes('BORNAS') || fam2Upper.includes('CONEXION')) {
      subfamilia = 'Bornas';
    } else if (fam2Upper.includes('FUENTE') || fam2Upper.includes('ALIMENTACION')) {
      familia = 'Distribución de potencia';
      subfamilia = 'Fuente alimentación';
    }
  }

  return {
    ref_fabricante: ref.trim(),
    name: name.substring(0, 150),
    marca: brandName,
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

function parsePrice(pvp) {
  if (!pvp || pvp === '0' || pvp === '      0') return 0;
  const cleaned = String(pvp).replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// 2. Obtener marcas registradas en la base de datos
async function fetchBrands() {
  const url = `${supabaseUrl}/rest/v1/brands?select=id,name`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Error fetching brands: ${res.status}`);
  return await res.json();
}

// 3. Obtener referencias existentes para evitar duplicados
async function fetchExistingRefs() {
  console.log('⌛ Cargando referencias de productos existentes para evitar duplicados...');
  const allRefs = new Set();
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const url = `${supabaseUrl}/rest/v1/products?select=ref_fabricante&limit=${limit}&offset=${offset}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`Error fetching products refs: ${res.status}`);
    const data = await res.json();
    data.forEach(p => {
      if (p.ref_fabricante) allRefs.add(p.ref_fabricante.trim());
    });
    if (data.length < limit) break;
    offset += limit;
  }
  console.log(`✅ Cargadas ${allRefs.size} referencias de la base de datos.`);
  return allRefs;
}

// 4. Inserción masiva de productos
async function insertProductsBulk(products) {
  const url = `${supabaseUrl}/rest/v1/products`;
  const res = await fetch(url, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(products)
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error en inserción masiva: ${res.status} - ${errorText}`);
  }
  return await res.json();
}

async function main() {
  console.log('======================================================');
  console.log('🚀 INICIANDO IMPORTACIÓN MASIVA DE NUEVAS MARCAS');
  console.log('======================================================\n');

  // 1. Obtener marcas e IDs
  const brands = await fetchBrands();
  const brandMap = {};
  BRANDS_TO_IMPORT.forEach(name => {
    const b = brands.find(brand => brand.name.toLowerCase() === name.toLowerCase());
    if (b) {
      brandMap[name] = b.id;
      console.log(`🏢 Marca "${name}" encontrada con ID: ${b.id}`);
    } else {
      console.error(`❌ Marca "${name}" no encontrada en la base de datos brands. Asegúrate de registrarla primero.`);
      process.exit(1);
    }
  });

  // 1.5. Eliminar productos previos de estas marcas para limpiar referencias de Sonepar antiguas
  console.log('🧹 Eliminando productos previos de estas marcas para limpiar códigos de Sonepar...');
  const deleteUrl = `${supabaseUrl}/rest/v1/products?brand_id=in.(${Object.values(brandMap).join(',')})`;
  const deleteRes = await fetch(deleteUrl, {
    method: 'DELETE',
    headers: HEADERS
  });
  if (!deleteRes.ok) {
    console.error('⚠️ Advertencia al eliminar productos anteriores:', await deleteRes.text());
  } else {
    console.log('✅ Eliminados productos anteriores de Eaton, Finder, Circutor y Phoenix Contact.');
  }

  // 2. Cargar referencias existentes
  const existingRefs = await fetchExistingRefs();

  // 3. Escanear chunks y acumular candidatos por marca
  console.log('\n⌛ Escaneando chunks de Sonepar...');
  const files = fs.readdirSync(CHUNKS_DIR).filter(f => f.startsWith('S') && f.endsWith('.json') && !f.includes('progress'));
  
  const candidates = {
    Eaton: [],
    Finder: [],
    Circutor: [],
    'Phoenix Contact': []
  };

  for (const file of files) {
    const filePath = path.join(CHUNKS_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const products = JSON.parse(content);
      
      for (const p of products) {
        const brandRaw = (p.marca || p.nombreFabricante || '').trim().toUpperCase();
        let matchedBrand = null;
        
        if (brandRaw.includes('EATON')) matchedBrand = 'Eaton';
        else if (brandRaw.includes('FINDER')) matchedBrand = 'Finder';
        else if (brandRaw.includes('CIRCUTOR')) matchedBrand = 'Circutor';
        else if (brandRaw.includes('PHOENIX')) matchedBrand = 'Phoenix Contact';
        
        if (matchedBrand) {
          const ref = p.refFabricante || p.codigoArticulo || p.ref || '';
          if (!ref || existingRefs.has(ref.trim())) continue; // Evitar duplicados

          candidates[matchedBrand].push(p);
        }
      }
    } catch (err) {
      console.error(`Error procesando chunk ${file}:`, err.message);
    }
  }

  // 4. Mapear y priorizar (preferir productos con imagen y/o ficha pdf)
  const finalInsertBatch = [];
  console.log('\n📊 Candidatos únicos encontrados sin duplicados:');
  
  Object.entries(candidates).forEach(([brand, list]) => {
    console.log(`  - ${brand}: ${list.length} candidatos`);
    
    // Ordenar: Prioridad para los que tienen imagen y/o pdf
    list.sort((a, b) => {
      const hasImageA = a.imagenes?.length > 0 ? 1 : 0;
      const hasImageB = b.imagenes?.length > 0 ? 1 : 0;
      const hasPdfA = a.urlPdfInfTecnica ? 1 : 0;
      const hasPdfB = b.urlPdfInfTecnica ? 1 : 0;
      return (hasImageB + hasPdfB) - (hasImageA + hasPdfA);
    });

    // Tomar los primeros LIMIT_PER_BRAND
    const selected = list.slice(0, LIMIT_PER_BRAND);
    let mappedCount = 0;

    selected.forEach(p => {
      const mapped = mapProduct(p, brandMap[brand], brand);
      if (mapped) {
        finalInsertBatch.push(mapped);
        mappedCount++;
      }
    });

    console.log(`    -> Seleccionados para importación: ${mappedCount}`);
  });

  if (finalInsertBatch.length === 0) {
    console.log('\n✅ No hay nuevos productos que insertar. Todos están duplicados u omitidos.');
    return;
  }

  // 5. Insertar en lotes de 100
  console.log(`\n🔄 Insertando ${finalInsertBatch.length} productos en Supabase...`);
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < finalInsertBatch.length; i += batchSize) {
    const batch = finalInsertBatch.slice(i, i + batchSize);
    try {
      await insertProductsBulk(batch);
      inserted += batch.length;
      console.log(`   ✅ Insertado lote ${Math.floor(i / batchSize) + 1} (${inserted}/${finalInsertBatch.length})`);
    } catch (err) {
      console.error(`   ❌ Error en lote ${Math.floor(i / batchSize) + 1}:`, err.message);
    }
  }

  console.log('\n======================================================');
  console.log(`🎉 IMPORTACIÓN FINALIZADA CON ÉXITO: ${inserted} productos insertados.`);
  console.log('======================================================');
}

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});


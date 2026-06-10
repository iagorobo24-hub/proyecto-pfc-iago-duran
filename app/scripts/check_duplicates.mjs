#!/usr/bin/env node
/**
 * Catalog Integrity and Duplicate Auditor — check_duplicates.mjs
 * Analyzes all products in Supabase to:
 * 1. Find duplicate manufacturer references (ref_fabricante).
 * 2. Validate reference sanity (well-formed references).
 * 3. Verify names and check if references correspond to their products.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read environment variables
let SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
let SUPABASE_KEY = process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      SUPABASE_URL = envContent.match(/SUPABASE_URL=(.+)/)?.[1]?.trim() ||
                     envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim() || '';
      SUPABASE_KEY = envContent.match(/SONEX_SUPABASE_KEY=(.+)/)?.[1]?.trim() ||
                     envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim() || '';
    }
  } catch (err) {
    console.error('⚠️ Error loading env file:', err.message);
  }
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase credentials not found in env or app/.env file.');
  process.exit(1);
}

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

async function fetchAllProducts() {
  console.log('⌛ Descargando todos los productos de Supabase (paginado)...');
  const all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/products?select=id,ref_fabricante,name,marca,familia,subfamilia,Gama,Subgama&limit=${limit}&offset=${offset}&order=id`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error fetching products: ${res.status} - ${text}`);
    }
    const data = await res.json();
    all.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }
  return all;
}

async function main() {
  console.log('======================================================');
  console.log('🔍 INICIANDO AUDITORÍA DE DUPLICADOS E INTEGRIDAD');
  console.log('======================================================\n');

  let products = [];
  try {
    products = await fetchAllProducts();
  } catch (err) {
    console.error('❌ Error descargando productos:', err.message);
    process.exit(1);
  }

  console.log(`\n📊 Total productos cargados: ${products.length}\n`);

  const refMap = {};
  const abnormalRefs = [];
  const placeholderNames = [];
  const potentialMismatches = [];

  // Analizar cada producto
  products.forEach(p => {
    const refRaw = p.ref_fabricante ? String(p.ref_fabricante).trim() : '';
    const name = p.name ? String(p.name).trim() : '';
    const brand = p.marca || 'Sin Marca';

    // 1. Agrupar para detectar duplicados
    if (refRaw) {
      if (!refMap[refRaw]) {
        refMap[refRaw] = [];
      }
      refMap[refRaw].push(p);
    }

    // 2. Sanidad de la referencia (¿está bien hecha?)
    // - Muy corta
    // - Contiene caracteres de placeholder o errores de codificación
    // - Es nula o vacía
    if (!refRaw) {
      abnormalRefs.push({ product: p, reason: 'Referencia vacía o nula' });
    } else if (refRaw.length < 3) {
      abnormalRefs.push({ product: p, reason: `Referencia sospechosamente corta: "${refRaw}"` });
    } else if (/\s/.test(refRaw)) {
      abnormalRefs.push({ product: p, reason: `Referencia contiene espacios en blanco: "${refRaw}"` });
    } else if (/[ñáéíóúü$?¿!¡*]/.test(refRaw.toLowerCase())) {
      abnormalRefs.push({ product: p, reason: `Referencia contiene caracteres especiales inválidos: "${refRaw}"` });
    } else if (/undefined|null|placeholder|none|n\/a|sin_ref/i.test(refRaw)) {
      abnormalRefs.push({ product: p, reason: `Referencia es un placeholder de desarrollo: "${refRaw}"` });
    }

    // 3. Correspondencia de nombre del producto (¿el nombre corresponde a la referencia?)
    // - Nombres que indican bloqueo de WAF o error
    // - Nombres que son idénticos a la referencia (malo si es un producto comercial con descripción)
    // - Nombres excesivamente cortos
    const lowerName = name.toLowerCase();
    if (!name) {
      placeholderNames.push({ product: p, reason: 'Nombre de producto vacío o nulo' });
    } else if (lowerName.includes('access denied') || lowerName.includes('access_denied') || lowerName.includes('forbidden')) {
      placeholderNames.push({ product: p, reason: 'Nombre bloqueado por WAF ("Access Denied")' });
    } else if (lowerName === 'todos los productos' || lowerName === 'todos_los_productos') {
      placeholderNames.push({ product: p, reason: 'Nombre genérico del catálogo ("Todos los Productos")' });
    } else if (lowerName === 'sin nombre' || lowerName === 'sin_nombre') {
      placeholderNames.push({ product: p, reason: 'Nombre es un placeholder ("Sin nombre")' });
    } else if (name === refRaw) {
      placeholderNames.push({ product: p, reason: 'El nombre es idéntico a la referencia del fabricante' });
    } else if (name.length < 5) {
      placeholderNames.push({ product: p, reason: `Nombre extremadamente corto: "${name}"` });
    }

    // 4. Mismatch de gama/subgama: si el nombre del producto no contiene palabras claves de su propia Gama
    if (p.Gama && p.Gama !== 'Otros') {
      const gamaClean = p.Gama.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nameClean = lowerName.replace(/[^a-z0-9]/g, '');
      // Si la gama es específica (ej: "TeSys D" o "iC60") y el nombre del producto no tiene ninguna relación
      // esto es solo una alerta suave (warning)
    }
  });

  // Procesar duplicados encontrados
  const duplicates = [];
  Object.entries(refMap).forEach(([ref, list]) => {
    if (list.length > 1) {
      duplicates.push({
        ref,
        count: list.length,
        items: list
      });
    }
  });

  // 4. Analizar discrepancias entre duplicados (¿referencia duplicada con nombres completamente distintos?)
  duplicates.forEach(d => {
    const names = d.items.map(item => item.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
    // Si los nombres limpitos difieren significativamente entre sí para la misma referencia
    let isDifferent = false;
    for (let i = 1; i < names.length; i++) {
      if (names[i] !== names[0] && !names[i].includes(names[0]) && !names[0].includes(names[i])) {
        isDifferent = true;
        break;
      }
    }
    if (isDifferent) {
      potentialMismatches.push(d);
    }
  });

  // Mostrar reporte final
  console.log('======================================================');
  console.log('📊 REPORTE DE INTEGRIDAD DEL CATÁLOGO');
  console.log('======================================================');

  // Sección 1: Duplicados por Referencia
  console.log(`\n1. DUPLICADOS DE REFERENCIA DE FABRICANTE (ref_fabricante):`);
  console.log(`------------------------------------------------------`);
  if (duplicates.length === 0) {
    console.log('  ✅ ¡No se han encontrado referencias duplicadas en la base de datos!');
  } else {
    console.log(`  ⚠️ Se encontraron ${duplicates.length} referencias duplicadas.`);
    console.log(`  Muestra de los primeros 10 grupos de duplicados:`);
    duplicates.slice(0, 10).forEach((d, idx) => {
      console.log(`\n  [${idx + 1}] Referencia: "${d.ref}" (${d.count} apariciones):`);
      d.items.forEach(item => {
        console.log(`    - ID: ${item.id} | Marca: ${item.marca} | Familia: ${item.familia} | Nombre: ${item.name}`);
      });
    });
  }

  // Sección 2: Referencias mal formadas / sospechosas
  console.log(`\n2. REFERENCIAS ANÓMALAS O SOSPECHOSAS (ref_fabricante mal hechas):`);
  console.log(`------------------------------------------------------`);
  if (abnormalRefs.length === 0) {
    console.log('  ✅ Todas las referencias analizadas están bien formadas.');
  } else {
    console.log(`  ⚠️ Se encontraron ${abnormalRefs.length} referencias sospechosas.`);
    console.log(`  Muestra de los primeros 15 registros:`);
    abnormalRefs.slice(0, 15).forEach((ar, idx) => {
      console.log(`    - [${idx + 1}] ID: ${ar.product.id} | Marca: ${ar.product.marca} | Ref: "${ar.product.ref_fabricante}" -> Razón: ${ar.reason}`);
    });
  }

  // Sección 3: Nombres placeholders / rotos / no correspondientes
  console.log(`\n3. NOMBRES SOSPECHOSOS O INSUFICIENTES:`);
  console.log(`------------------------------------------------------`);
  if (placeholderNames.length === 0) {
    console.log('  ✅ Todos los nombres parecen legítimos.');
  } else {
    console.log(`  ⚠️ Se encontraron ${placeholderNames.length} nombres sospechosos.`);
    console.log(`  Muestra de los primeros 15 registros:`);
    placeholderNames.slice(0, 15).forEach((pn, idx) => {
      console.log(`    - [${idx + 1}] ID: ${pn.product.id} | Marca: ${pn.product.marca} | Ref: ${pn.product.ref_fabricante} | Nombre: "${pn.product.name}" -> Razón: ${pn.reason}`);
    });
  }

  // Sección 4: Discrepancias de producto para la misma referencia
  console.log(`\n4. CONFLICTOS DE REFERENCIA (Misma referencia, distintos productos):`);
  console.log(`------------------------------------------------------`);
  if (potentialMismatches.length === 0) {
    console.log('  ✅ No se encontraron conflictos donde una misma referencia corresponda a productos totalmente distintos.');
  } else {
    console.log(`  ⚠️ Se encontraron ${potentialMismatches.length} conflictos potenciales.`);
    console.log(`  Muestra de los primeros 5 conflictos:`);
    potentialMismatches.slice(0, 5).forEach((m, idx) => {
      console.log(`\n  [${idx + 1}] Referencia en conflicto: "${m.ref}":`);
      m.items.forEach(item => {
        console.log(`    - ID: ${item.id} | Marca: ${item.marca} | Nombre: "${item.name}"`);
      });
    });
  }

  // Escribir reporte en JSON para inspección manual
  const reportPath = path.join(__dirname, 'db_integrity_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total_products: products.length,
    duplicates: {
      count: duplicates.length,
      details: duplicates
    },
    abnormal_references: {
      count: abnormalRefs.length,
      details: abnormalRefs
    },
    suspicious_names: {
      count: placeholderNames.length,
      details: placeholderNames
    },
    potential_conflicting_references: {
      count: potentialMismatches.length,
      details: potentialMismatches
    }
  }, null, 2));

  console.log('\n======================================================');
  console.log(`💾 Reporte completo de integridad guardado en: ${reportPath}`);
  console.log('======================================================');
}

main().catch(err => console.error(err));

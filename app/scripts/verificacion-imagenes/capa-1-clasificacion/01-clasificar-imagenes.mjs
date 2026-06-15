#!/usr/bin/env node
/**
 * 01-clasificar-imagenes.mjs
 * Capa 1 del sistema de verificación de imágenes — PFC Iago Durán
 *
 * Clasifica TODAS las imágenes de products.imagen SIN usar IA ni Playwright,
 * mediante descarga directa (las URLs de tienda.sonepar.es/wseportal/...
 * son públicas, confirmado por Antigravity) + hash SHA-256 del contenido.
 *
 * Resultados posibles en imagen_verificacion_estado:
 *   - 'no_carga'        -> la URL no responde, status != 200, o no es image/*
 *   - 'posible_generico' -> imagen sospechosamente pequeña, o exactamente la
 *                            misma imagen (mismo hash) reutilizada en N
 *                            productos distintos (placeholder/fallback)
 *   - 'pendiente_ia'    -> imagen descargada correctamente, parece única,
 *                            queda pendiente de verificación semántica (Capa 2)
 *
 * Resumible: por defecto solo procesa filas con imagen_verificacion_estado
 * IS NULL. Usa --force para reprocesar todo.
 *
 * Uso:
 *   node 01-clasificar-imagenes.mjs [--marca="Finder"] [--limit=100] [--dry-run] [--force]
 *
 * Requiere en .env (ya presentes en el proyecto):
 *   SUPABASE_URL
 *   SONEX_SUPABASE_KEY   (o SUPABASE_SERVICE_ROLE_KEY)
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Directorio de salida fijo respecto a este script (no depende del cwd):
// app/scripts/verificacion-imagenes/capa-1-clasificacion/01-... -> app/scripts/output
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', '..', 'output');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    '❌ Faltan SUPABASE_URL y/o SONEX_SUPABASE_KEY/SUPABASE_SERVICE_ROLE_KEY en .env'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---- Argumentos ----
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;
const marcaArg = args.find((a) => a.startsWith('--marca='));
const marcaFiltro = marcaArg ? marcaArg.split('=')[1] : null;

// ---- Parámetros ----
const CONCURRENCIA = 8;
const TIMEOUT_MS = 15000;
const BYTES_SOSPECHOSO = 1500; // imágenes < 1.5KB suelen ser iconos/placeholders
const REPETICIONES_GENERICO = 3; // mismo hash en >= N productos -> placeholder

// ---- Utilidades ----
async function fetchImagen(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (verificacion-pfc-iago)' },
    });
    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get('content-type') || '',
      bytes: buffer.length,
      hash: createHash('sha256').update(buffer).digest('hex'),
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err.message,
      contentType: '',
      bytes: 0,
      hash: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function pool(items, fn, concurrencia) {
  const resultados = new Array(items.length);
  let indice = 0;
  async function worker() {
    while (indice < items.length) {
      const i = indice++;
      resultados[i] = await fn(items[i], i);
      if ((i + 1) % 200 === 0 || i + 1 === items.length) {
        console.log(`  ... ${i + 1}/${items.length} imágenes procesadas`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrencia }, worker));
  return resultados;
}

// ---- 1. Cargar productos pendientes con paginación ----
console.log('Cargando productos pendientes de clasificación...');

const productos = [];
let offset = 0;
const pageSize = 1000;
let hasMore = true;

while (hasMore) {
  let query = supabase
    .from('products')
    .select('id, name, ref_fabricante, marca, imagen, imagen_verificacion_estado')
    .not('imagen', 'is', null)
    .order('id')
    .range(offset, offset + pageSize - 1);

  if (!force) query = query.is('imagen_verificacion_estado', null);
  if (marcaFiltro) query = query.eq('marca', marcaFiltro);
  
  if (limit) {
    const remaining = limit - productos.length;
    if (remaining <= 0) break;
    query = query.limit(remaining);
  }

  const { data, error } = await query;
  if (error) {
    console.error('❌ Error leyendo Supabase:', error);
    process.exit(1);
  }

  productos.push(...data);
  
  if (data.length < pageSize || (limit && productos.length >= limit)) {
    hasMore = false;
  } else {
    offset += pageSize;
  }
}

console.log(`→ ${productos.length} productos a procesar.\n`);
if (productos.length === 0) {
  console.log('Nada que hacer. (¿Quizás necesitas --force?)');
  process.exit(0);
}

// ---- 2. Descargar + hashear ----
const resultadosFetch = await pool(
  productos,
  async (p) => ({ producto: p, ...(await fetchImagen(p.imagen)) }),
  CONCURRENCIA
);

// ---- 3. Clasificación inicial ----
const hashCount = new Map();
for (const r of resultadosFetch) {
  if (r.ok && r.contentType.startsWith('image/') && r.bytes >= BYTES_SOSPECHOSO) {
    hashCount.set(r.hash, (hashCount.get(r.hash) || 0) + 1);
  }
}

const updates = resultadosFetch.map((r) => {
  const { producto: p } = r;
  let estado, confianza, nota;

  if (!r.ok || r.status !== 200 || !r.contentType.startsWith('image/')) {
    estado = 'no_carga';
    confianza = 'alta';
    nota = `HTTP ${r.status || 'sin respuesta'}${r.error ? ` (${r.error})` : ''} / content-type="${r.contentType}"`;
  } else if (r.bytes < BYTES_SOSPECHOSO) {
    estado = 'posible_generico';
    confianza = 'media';
    nota = `Imagen muy pequeña (${r.bytes} bytes), posible icono/placeholder`;
  } else if (hashCount.get(r.hash) >= REPETICIONES_GENERICO) {
    estado = 'posible_generico';
    confianza = 'media';
    nota = `Misma imagen exacta (hash) usada en ${hashCount.get(r.hash)} productos -> probable placeholder/fallback genérico`;
  } else {
    estado = 'pendiente_ia';
    confianza = null;
    nota = null;
  }

  return {
    id: p.id,
    name: p.name, // Guardamos name para cumplir con la restricción de NOT NULL
    ref_fabricante: p.ref_fabricante,
    marca: p.marca,
    imagen_verificada: estado === 'pendiente_ia' ? null : false,
    imagen_verificacion_estado: estado,
    imagen_verificacion_confianza: confianza,
    imagen_verificacion_nota: nota,
    imagen_verificacion_fecha: new Date().toISOString(),
  };
});

// ---- 4. Resumen ----
const resumen = {};
for (const u of updates) {
  resumen[u.imagen_verificacion_estado] = (resumen[u.imagen_verificacion_estado] || 0) + 1;
}
console.log('\n--- RESUMEN ---');
for (const [estado, n] of Object.entries(resumen)) {
  console.log(`  ${estado}: ${n}`);
}

const porMarca = {};
for (const u of updates) {
  porMarca[u.marca] ??= {};
  porMarca[u.marca][u.imagen_verificacion_estado] =
    (porMarca[u.marca][u.imagen_verificacion_estado] || 0) + 1;
}
console.log('\n--- POR MARCA ---');
for (const [marca, estados] of Object.entries(porMarca)) {
  console.log(`  ${marca}: ${JSON.stringify(estados)}`);
}

// ---- 5. Guardar resultado bruto (para inspección / Capa 2) ----
if (!dryRun) {
  mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(
    OUT_DIR,
    `clasificacion-imagenes-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );
  writeFileSync(outFile, JSON.stringify({ resumen, porMarca, updates }, null, 2));
  console.log(`\n📄 Informe guardado en ${outFile}`);
}

// ---- 6. Escribir en Supabase ----
if (dryRun) {
  console.log('\n🔸 --dry-run activo: no se ha escrito nada en Supabase.');
} else {
  console.log('\nEscribiendo resultados en Supabase...');
  const CHUNK = 500;
  for (let i = 0; i < updates.length; i += CHUNK) {
    const chunk = updates
      .slice(i, i + CHUNK)
      .map(({ id, name, imagen_verificada, imagen_verificacion_estado, imagen_verificacion_confianza, imagen_verificacion_nota, imagen_verificacion_fecha }) => ({
        id,
        name, // Name es NOT NULL en products
        imagen_verificada,
        imagen_verificacion_estado,
        imagen_verificacion_confianza,
        imagen_verificacion_nota,
        imagen_verificacion_fecha,
      }));
    const { error: upErr } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
    if (upErr) console.error(`❌ Error en chunk ${i}-${i + CHUNK}:`, upErr);
    else console.log(`  ✓ chunk ${i}-${Math.min(i + CHUNK, updates.length)} guardado`);
  }
  console.log('\n✅ Listo.');
}

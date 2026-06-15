#!/usr/bin/env node
/**
 * 02-corregir-residuales-no-carga.mjs
 * Capa 1 del sistema de verificación de imágenes — PFC Iago Durán
 *
 * Busca automáticamente TODOS los productos en Supabase que tengan
 * imagen_verificacion_estado = 'no_carga' (imágenes rotas o caídas),
 * busca una imagen de reemplazo válida usando DuckDuckGo (con fetch nativo)
 * y actualiza Supabase, restableciendo el estado de verificación a NULL
 * para que puedan ser re-clasificados.
 *
 * Uso:
 *   node 02-corregir-residuales-no-carga.mjs [--dry-run] [--delay=2000]
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde la raíz del proyecto (3 niveles arriba)
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in env variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ---- Argumentos ----
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const delayArg = args.find((a) => a.startsWith('--delay='));
const delayMs = delayArg ? parseInt(delayArg.split('=')[1], 10) : 2000;

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function isLogoUrl(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  if (lower.includes('/logos/') || lower.includes('logo') || lower.includes('cleanpng') || lower.includes('logotipo')) return true;
  if (lower.includes('placeholder') || lower.includes('avatar') || lower.includes('default')) return true;
  if (lower.includes('no-image') || lower.includes('no_image') || lower.includes('noimage') || lower.includes('image-not-available')) return true;
  const brandLogos = ['schneider.png', 'legrand.png', 'siemens.png', 'abb.png', 'eaton.svg', 'finder.svg', 'circutor.png', 'phoenix.svg'];
  for (const bl of brandLogos) {
    if (lower.endsWith('/' + bl)) return true;
  }
  return false;
}

async function validateImageUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.startsWith('image/')) {
        const arrayBuffer = await res.arrayBuffer();
        const bytes = arrayBuffer.byteLength;
        // Omitir imágenes extremadamente pequeñas (iconos o fallos)
        if (bytes > 1500) {
          return { isValid: true, bytes };
        }
      }
    }
  } catch (err) {
    // ignore
  }
  return { isValid: false };
}

async function searchProductImage(brand, ref) {
  // Limpiar referencia
  let cleanRef = ref.trim();
  if (cleanRef.startsWith('CIR-')) cleanRef = cleanRef.substring(4);
  if (cleanRef.startsWith('PHO-')) cleanRef = cleanRef.substring(4);
  if (cleanRef.startsWith('FND-')) cleanRef = cleanRef.substring(4);
  if (cleanRef.startsWith('EAT-')) cleanRef = cleanRef.substring(4);

  const query = `${brand} ${cleanRef} product image`;
  console.log(`🔍 Buscando en DuckDuckGo: "${query}"`);
  
  try {
    const htmlUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    const htmlRes = await fetch(htmlUrl, { headers: { 'User-Agent': userAgent } });
    if (!htmlRes.ok) return null;
    const html = await htmlRes.text();
    
    const vqdMatch = html.match(/vqd=["']([^"']+)["']/i) || html.match(/vqd:\s*["']([^"']+)["']/i);
    if (!vqdMatch) {
      console.warn('  ⚠️ No se pudo extraer el token vqd.');
      return null;
    }
    const vqd = vqdMatch[1];
    
    const apiUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&o=json&vqd=${vqd}`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        'User-Agent': userAgent,
        'Referer': 'https://duckduckgo.com/'
      }
    });
    if (!apiRes.ok) return null;
    const data = await apiRes.json();
    
    if (data?.results?.length > 0) {
      for (const item of data.results) {
        const imgUrl = item.image;
        if (!imgUrl) continue;
        if (isLogoUrl(imgUrl)) continue;
        
        console.log(`  Probando: ${imgUrl}`);
        const { isValid, bytes } = await validateImageUrl(imgUrl);
        if (isValid) {
          console.log(`  ✅ Imagen válida encontrada (${bytes} bytes): ${imgUrl}`);
          return imgUrl;
        }
      }
    }
  } catch (err) {
    console.error(`  ❌ Error de búsqueda:`, err.message);
  }
  return null;
}

async function main() {
  console.log('======================================================');
  console.log('🛠️ CORRECCIÓN DE IMÁGENES ROTAS RESIDUALES (no_carga)');
  console.log(`Modo: ${dryRun ? 'DRY-RUN (Simulación)' : 'PRODUCCIÓN (Escritura DB)'}`);
  console.log('======================================================\n');

  console.log('⌛ Descargando productos en estado "no_carga" de la DB...');
  const { data: targets, error } = await supabase
    .from('products')
    .select('id, name, marca, ref_fabricante, imagen')
    .eq('imagen_verificacion_estado', 'no_carga');

  if (error) {
    console.error('❌ Error consultando Supabase:', error.message);
    process.exit(1);
  }

  console.log(`→ Encontrados ${targets.length} productos con imágenes rotas.\n`);

  if (targets.length === 0) {
    console.log('✅ ¡Excelente! No hay ningún producto con estado "no_carga". Saliendo.');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const p of targets) {
    console.log(`--------------------------------------------------`);
    console.log(`Producto ID: ${p.id} | Marca: ${p.marca} | Ref: ${p.ref_fabricante}`);
    console.log(`Actual URL rota: ${p.imagen}`);

    const newUrl = await searchProductImage(p.marca, p.ref_fabricante);
    if (newUrl) {
      successCount++;
      if (dryRun) {
        console.log(`  [DRY-RUN] Se habría actualizado a: ${newUrl}`);
      } else {
        console.log(`  Actualizando base de datos...`);
        const { error: updErr } = await supabase
          .from('products')
          .update({
            imagen: newUrl,
            imagen_verificacion_estado: null,
            imagen_verificacion_confianza: null,
            imagen_verificacion_nota: null,
            imagen_verificacion_fecha: null,
            imagen_verificada: null
          })
          .eq('id', p.id);

        if (updErr) {
          console.error(`  ❌ Error actualizando Supabase:`, updErr.message);
        } else {
          console.log(`  ✓ Actualizado correctamente en Supabase (estado reiniciado).`);
        }
      }
    } else {
      failCount++;
      console.log(`  ❌ No se encontró ninguna imagen de reemplazo válida.`);
    }

    // Esperar delay para evitar abusar del buscador
    await new Promise(r => setTimeout(r, delayMs));
  }

  console.log('\n======================================================');
  console.log(`🎉 PROCESO CONCLUIDO`);
  console.log(`  - Productos corregidos: ${successCount}`);
  console.log(`  - Productos no resueltos: ${failCount}`);
  console.log('======================================================');
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err.message);
  process.exit(1);
});

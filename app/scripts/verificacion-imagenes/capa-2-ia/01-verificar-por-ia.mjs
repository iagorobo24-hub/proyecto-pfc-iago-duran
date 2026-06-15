#!/usr/bin/env node
/**
 * 01-verificar-por-ia.mjs
 * Capa 2 del sistema de verificación de imágenes — PFC Iago Durán
 *
 * Realiza una validación semántica e inteligente de las imágenes de los productos
 * en estado 'pendiente_ia' utilizando visión artificial (LMM google/gemini-2.5-flash)
 * a través de la API de OpenRouter.
 *
 * Estrategia:
 * 1. Consulta los productos en estado 'pendiente_ia'.
 * 2. Descarga localmente la imagen del producto, la convierte a base64 para evitar
 *    geobloqueos del modelo y la envía junto al prompt a OpenRouter.
 * 3. Evalúa si la imagen coincide visualmente con la descripción técnica, marca y subfamilia.
 * 4. Actualiza Supabase:
 *    - coincide = true  -> 'verificada' y imagen_verificada = true
 *    - coincide = false -> 'rechazada_ia' y imagen_verificada = false
 *    - error de red/caída de imagen -> degradación reactiva a 'no_carga'
 *
 * Uso:
 *   node 01-verificar-por-ia.mjs [--dry-run] [--resume] [--limit=10] [--marca="Finder"] [--delay=1500] [--concurrency=2]
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde la raíz del proyecto (3 niveles arriba para /app, 4 para la raíz del workspace)
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const openRouterKey = process.env.OPENROUTER_API_KEY;
const nvidiaKey = process.env.NVIDIA_NIM_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in env variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const PROGRESS_FILE = path.join(__dirname, '../../..', 'scrape-ia-progress.json');

// ---- Argumentos ----
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const resume = args.includes('--resume');
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 10; // Default seguro a 10
const brandArg = args.find((a) => a.startsWith('--marca='));
const brandFilter = brandArg ? brandArg.split('=')[1] : null;
const delayArg = args.find((a) => a.startsWith('--delay='));
const delayMs = delayArg ? parseInt(delayArg.split('=')[1], 10) : 1500;
const concurrencyArg = args.find((a) => a.startsWith('--concurrency='));
const concurrency = concurrencyArg ? parseInt(concurrencyArg.split('=')[1], 10) : 2;

const providerArg = args.find((a) => a.startsWith('--provider='));
const provider = providerArg ? providerArg.split('=')[1] : 'openrouter'; // 'openrouter' o 'nvidia'
const modelArg = args.find((a) => a.startsWith('--model='));
const defaultModel = provider === 'nvidia' ? 'meta/llama-3.2-11b-vision-instruct' : 'google/gemini-2.5-flash';
const model = modelArg ? modelArg.split('=')[1] : defaultModel;

let apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
let authHeader = `Bearer ${openRouterKey}`;
let extraHeaders = {
  'HTTP-Referer': 'https://proyecto-pfc-iago-duran.vercel.app',
  'X-Title': 'Proyectos PFC Verification'
};

if (provider === 'nvidia') {
  apiUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
  authHeader = `Bearer ${nvidiaKey}`;
  extraHeaders = {};
  if (!nvidiaKey) {
    console.error('❌ Error: NVIDIA_NIM_API_KEY not found in env variables.');
    process.exit(1);
  }
} else {
  if (!openRouterKey) {
    console.error('❌ Error: OPENROUTER_API_KEY not found in env variables.');
    process.exit(1);
  }
}

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchPendingProducts() {
  console.log('⌛ Descargando productos en estado "pendiente_ia" de la DB...');
  const all = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    let query = supabase
      .from('products')
      .select('id, name, ref_fabricante, marca, subfamilia, imagen, imagen_verificacion_estado')
      .eq('imagen_verificacion_estado', 'pendiente_ia')
      .not('imagen', 'is', null)
      .order('id')
      .range(from, from + pageSize - 1);

    if (brandFilter) {
      query = query.eq('marca', brandFilter);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
    all.push(...data);
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }
  return all;
}

// Descarga una imagen remota y la convierte a base64 Data URL
async function getBase64Image(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': userAgent },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    
    let contentType = res.headers.get('content-type') || 'image/jpeg';
    contentType = contentType.split(';')[0].trim();
    if (contentType === 'image/jpg') {
      contentType = 'image/jpeg';
    }
    if (!contentType.startsWith('image/')) return null;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

// Extrae el objeto JSON desde una respuesta que podría tener bloques markdown ```json
function extractJson(text) {
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  }
  
  // Buscar límites del JSON {} si queda texto residual
  const startIdx = clean.indexOf('{');
  const endIdx = clean.lastIndexOf('}');
  if (startIdx >= 0 && endIdx >= 0) {
    clean = clean.substring(startIdx, endIdx + 1);
  }
  
  return JSON.parse(clean);
}

async function verifyWithVisionModel(p, base64Url) {
  const prompt = `Se te proporciona un componente o producto eléctrico con los siguientes datos del catálogo:
- Nombre: "${p.name}"
- Marca: "${p.marca}"
- Subfamilia: "${p.subfamilia || 'No especificada'}"

Analiza la imagen adjunta y determina si coincide semánticamente con dicho producto.
Considera lo siguiente:
1. Coincidencia de tipo: Si el producto es un "contactor", la imagen debe mostrar un contactor (no un cable, ni un interruptor, ni un logo, ni una gráfica de curvas).
2. Coincidencia de marca: Si es posible ver la marca en el equipo, verifica que no sea una marca competidora (por ejemplo, si el producto es Finder y la imagen tiene un logo de Schneider, entonces NO coincide).
3. Coincidencia de modelo/referencia: Si hay texto legible en el producto (como una referencia o serie), verifica si apoya la descripción.
4. Si la imagen es solo un logotipo o una imagen de "sin imagen disponible", considera coincide = false.

Responde ÚNICAMENTE con un JSON en el siguiente formato, sin bloques markdown de código. Asegúrate de escapar cualquier comilla doble interna en los campos de texto usando barra invertida (\") para que el JSON sea válido:
{
  "coincide": true | false,
  "confianza": "alta" | "media" | "baja",
  "categoria_detectada": "tipo de componente detectado (ej: contactor, magnetotérmico, rele, logo, etc.)",
  "explicacion": "explicación breve en español de la decisión"
}`;

  let retries = 5;
  let delay = 2000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          ...extraHeaders
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: { url: base64Url }
                }
              ]
            }
          ],
          max_tokens: 300
        })
      });

      if (!res.ok) {
        const text = await res.text();
        if (res.status === 429 || res.status >= 500) {
          if (attempt === retries) {
            throw new Error(`${provider === 'nvidia' ? 'Nvidia NIM' : 'OpenRouter'} API error: ${res.status} - ${text}`);
          }
          console.warn(`\n⚠️ [Attempt ${attempt}/${retries}] Got status ${res.status} for product ID ${p.id}. Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        throw new Error(`${provider === 'nvidia' ? 'Nvidia NIM' : 'OpenRouter'} API error: ${res.status} - ${text}`);
      }

      const result = await res.json();
      const content = result.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from model');
      }

      let parsed;
      try {
        parsed = extractJson(content);
      } catch (jsonErr) {
        console.warn(`\n⚠️ Raw model response that failed JSON parse for product ID ${p.id}:\n-------------------\n${content}\n-------------------`);
        throw new Error(`JSON parse error: ${jsonErr.message}`);
      }
      return parsed;
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      console.warn(`\n⚠️ [Attempt ${attempt}/${retries}] Request failed for product ID ${p.id}: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

async function main() {
  console.log('======================================================');
  console.log('🧠 CAPA 2: AUDITORÍA SEMÁNTICA CON IA VISUAL');
  console.log(`Modo: ${dryRun ? 'DRY-RUN (Simulación)' : 'PRODUCCIÓN (Escritura DB)'}`);
  if (brandFilter) console.log(`Filtro de Marca: ${brandFilter}`);
  console.log(`Límite de esta ejecución: ${limit} productos`);
  console.log(`Concurrencia: ${concurrency} workers | Delay: ${delayMs}ms`);
  console.log('======================================================\n');

  const pendingProducts = await fetchPendingProducts();
  console.log(`\n📊 Análisis de la DB:`);
  console.log(`  - Total productos en "pendiente_ia": ${pendingProducts.length}`);

  if (pendingProducts.length === 0) {
    console.log('\n✅ No hay productos pendientes de clasificación en la Capa 2. Saliendo.');
    return;
  }

  // Cargar progreso anterior
  let progress = { processed: {}, results: [] };
  if (resume && fs.existsSync(PROGRESS_FILE)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      console.log(`🔄 Reanudando desde progreso guardado: ${Object.keys(progress.processed).length} productos procesados.`);
    } catch (err) {
      console.warn('⚠️ No se pudo leer el archivo de progreso. Iniciando de cero.');
    }
  }

  const productsToProcess = pendingProducts.filter(p => {
    const proc = progress.processed[p.id];
    if (!proc) return true;
    if (proc.status === 'error') return true;
    return false;
  });
  const queue = productsToProcess.slice(0, limit);

  if (queue.length === 0) {
    console.log('\n✅ Todos los productos objetivo ya han sido procesados. Saliendo.');
    return;
  }

  console.log(`\n🚀 Iniciando procesamiento por IA para ${queue.length} productos...`);
  const startTime = Date.now();

  let currentIndex = 0;
  let successCount = 0;
  let rejectedCount = 0;
  let errorCount = 0;

  const workers = Array.from({ length: concurrency }).map(async (_, workerId) => {
    while (true) {
      let p = null;
      let idx = 0;
      
      synchronizedBlock: {
        if (currentIndex >= queue.length) break;
        p = queue[currentIndex];
        idx = currentIndex;
        currentIndex++;
      }

      const ref = p.ref_fabricante || 'S/R';
      try {
        // 1. Obtener imagen en base64
        const base64Url = await getBase64Image(p.imagen);
        
        if (!base64Url) {
          // Degradación reactiva: la imagen no carga en absoluto
          console.log(`\n[Worker ${workerId}] ❌ ID ${p.id} (Ref: ${ref}) -> Imagen rota (degradando a no_carga)`);
          
          progress.processed[p.id] = { status: 'no_carga', error: 'Failed to download image' };
          errorCount++;
          
          if (!dryRun) {
            await supabase
              .from('products')
              .update({
                imagen_verificada: false,
                imagen_verificacion_estado: 'no_carga',
                imagen_verificacion_confianza: 'alta',
                imagen_verificacion_nota: 'La imagen falló al descargarse en la fase de IA',
                imagen_verificacion_fecha: new Date().toISOString()
              })
              .eq('id', p.id);
          }
          continue;
        }

        // 2. Evaluar mediante Vision LMM
        const classification = await verifyWithVisionModel(p, base64Url);
        const { coincide, confianza, categoria_detectada, explicacion } = classification;

        progress.processed[p.id] = {
          status: coincide ? 'verified' : 'rejected',
          coincide,
          confianza,
          categoria_detectada,
          explicacion
        };
        progress.results.push({ id: p.id, ref, brand: p.marca, coincide, categoria_detectada, explicacion });

        if (coincide) {
          successCount++;
          console.log(`\n[Worker ${workerId}] ✅ ID ${p.id} (Ref: ${ref}) -> COINCIDE (${categoria_detectada}) | Confianza: ${confianza}`);
        } else {
          rejectedCount++;
          console.log(`\n[Worker ${workerId}] ⚠️ ID ${p.id} (Ref: ${ref}) -> RECHAZADO (${categoria_detectada}) | Explicación: ${explicacion}`);
        }

        if (!dryRun) {
          await supabase
            .from('products')
            .update({
              imagen_verificada: coincide,
              imagen_verificacion_estado: coincide ? 'verificada' : 'rechazada_ia',
              imagen_verificacion_confianza: confianza,
              imagen_verificacion_nota: explicacion,
              imagen_verificacion_fecha: new Date().toISOString()
            })
            .eq('id', p.id);
        }

      } catch (err) {
        console.error(`\n[Worker ${workerId}] 💥 Error procesando ID ${p.id}:`, err.message);
        progress.processed[p.id] = { status: 'error', error: err.message };
        errorCount++;
      }

      // Guardar progreso periódicamente
      if (idx % 5 === 0 || idx === queue.length - 1) {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
      }

      // Delay para respetar límites de la API de OpenRouter
      await new Promise(r => setTimeout(r, delayMs));
    }
  });

  await Promise.all(workers);
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

  // Limpiar archivo de progreso si se completó la cola de limit completa
  if (currentIndex >= queue.length) {
    try {
      fs.unlinkSync(PROGRESS_FILE);
      console.log('\n🧹 Archivo de progreso temporal eliminado.');
    } catch {}
  }

  const elapsedMinutes = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log(`\n======================================================`);
  console.log(`🎉 PROCESO CONCLUIDO EN ${elapsedMinutes} MINUTOS`);
  console.log(`  - Coinciden (Aceptados):  ${successCount}`);
  console.log(`  - No coinciden (Rechazados): ${rejectedCount}`);
  console.log(`  - Errores / Rotos:        ${errorCount}`);
  console.log('======================================================');
  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err.message);
  process.exit(1);
});

/**
 * @file sonexCatalogContext.js
 * @description Proveedor de contexto dinámico para el chatbot SONEX.
 * Analiza el mensaje del usuario para extraer referencias de productos o términos clave,
 * consulta el catálogo en Supabase y construye un bloque de contexto textual estructurado
 * para alimentar el prompt del modelo de lenguaje (RAG simplificado).
 */

import catalogService from './catalogService'

// Patrón RegExp para capturar referencias típicas de fabricantes de material eléctrico
// (Ej: A9F18116, S201-C16, 3RT2015-1AP01)
const PATRON_REFERENCIA = /\b([A-Z]{1,}[\d]{1,}[A-Z0-9-]*)\b/

/**
 * Intenta extraer una referencia técnica de fabricante a partir del mensaje del usuario.
 * Valida la longitud para evitar falsos positivos de palabras comunes.
 * 
 * @param {string} text - Texto del mensaje del usuario
 * @returns {(string|null)} Referencia encontrada o null
 */
function extractReference(text) {
  const match = text.match(PATRON_REFERENCIA)
  if (!match) return null
  const ref = match[1]
  if (ref.length < 4 || ref.length > 30) return null
  return ref
}

// Listado de Stop Words en español para depurar las búsquedas libres de la IA
// y obtener palabras clave de búsqueda más puras (Lookup O(1)).
const STOP_WORDS = new Set([
  'el','la','los','las','un','una','que','es','por','para','con','del',
  'en','de','su','al','como','mas','pero','sus','entre','sobre','todo',
  'tiene','hay','son','cual','donde','cuando','buscar','necesito',
  'puedes','dame','muestra','quiero','saber','informacion',
  'precio','precios','referencia','referencias','marca','modelo','modelos',
  'producto','productos','ficha','fichas','tecnica','tecnicas',
])

/**
 * Limpia y extrae las palabras clave relevantes de un mensaje para realizar búsquedas.
 * Elimina signos de puntuación, pasa a minúsculas y filtra stop words.
 * 
 * @param {string} text - Mensaje del usuario
 * @returns {string} Términos de búsqueda concatenados
 */
function extractSearchTerms(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 6)
    .join(' ')
}

/**
 * Formatea la información técnica de un producto en un bloque de texto descriptivo estructurado.
 * 
 * @param {object} producto - Datos del producto
 * @returns {string} Texto formateado
 */
function formatProductoDetalle(producto) {
  let text = ''
  text += `【PRODUCTO】 Ref: ${producto.ref_fabricante}\n`
  text += `  Nombre: ${producto.name}\n`
  text += `  Marca: ${producto.marca || 'N/A'}\n`
  text += `  Familia: ${producto.familia || 'N/A'}\n`
  if (producto.subfamilia) text += `  Subfamilia: ${producto.subfamilia}\n`
  if (producto.tipo) text += `  Tipo: ${producto.tipo}\n`
  if (producto.Gama) text += `  Gama comercial: ${producto.Gama}\n`
  if (producto.Subgama) text += `  Subgama: ${producto.Subgama}\n`
  if (producto.precio) text += `  Precio: ${producto.precio}€\n`
  if (producto.descripcion) text += `  Descripción: ${producto.descripcion}\n`
  return text
}

/**
 * Formatea un conjunto de productos relacionados en un bloque de texto compacto.
 * Muestra como máximo los primeros 10 elementos e indica si hay excedentes.
 * 
 * @param {Array} productos - Listado de productos encontrados
 * @returns {string} Texto compacto formateado
 */
function formatProductosCompact(productos) {
  if (productos.length === 0) return ''
  let text = `【PRODUCTOS RELACIONADOS (${productos.length})】\n`
  productos.slice(0, 10).forEach((p, i) => {
    text += `  ${i + 1}. [${p.ref_fabricante}] ${p.name}`
    text += ` | ${p.marca || '?'}`
    text += ` | ${p.familia || ''}${p.subfamilia ? ` > ${p.subfamilia}` : ''}`
    if (p.precio) text += ` | ${p.precio}€`
    text += '\n'
  })
  if (productos.length > 10) text += `  ... y ${productos.length - 10} más\n`
  return text
}

/**
 * Construye el contexto de marcas disponibles para una categoría activa dada.
 * 
 * @param {string} activeCategory - Categoría o familia activa
 * @returns {Promise<string>} Bloque de contexto
 */
async function buildCategoryContext(activeCategory) {
  try {
    const marcas = await catalogService.getMarcasPorCategoria(activeCategory)
    let text = `【CATEGORÍA ACTIVA: ${activeCategory}】\n`
    if (marcas.length > 0) {
      text += `  Marcas disponibles (${marcas.length}): ${marcas.slice(0, 8).map(m => m.nombre).join(', ')}${marcas.length > 8 ? '...' : ''}\n`
    }
    return text
  } catch {
    return `【CATEGORÍA ACTIVA: ${activeCategory}】\n`
  }
}

/**
 * Analiza el mensaje y el estado de la app para armar un bloque de contexto consolidado del catálogo.
 * Este texto se concatena al prompt del sistema para guiar y enriquecer las respuestas de la IA.
 * 
 * @export
 * @param {string} userMessage - Mensaje enviado por el usuario
 * @param {string} [activeCategory=null] - Categoría/familia seleccionada en el chatbot
 * @returns {Promise<string>} Bloque de contexto consolidado para la IA
 */
export async function buildCatalogContext(userMessage, activeCategory = null) {
  try {
    const stats = await catalogService.getCatalogStats()

    const parts = []
    parts.push(`【ESTADÍSTICAS】 Total productos en catálogo: ${stats.totalProducts}`)

    // 1. Agregar contexto de la categoría activa si está presente
    if (activeCategory) {
      const catCtx = await buildCategoryContext(activeCategory)
      if (catCtx) parts.push(catCtx)
    }

    // 2. Si detecta una referencia técnica, cargar y agregar el detalle del producto unívoco
    const ref = extractReference(userMessage)
    if (ref) {
      const producto = await catalogService.getProductoPorRef(ref)
      if (producto) {
        parts.push(formatProductoDetalle(producto))
        return parts.join('\n')
      }
    }

    // 3. De lo contrario, buscar por términos/palabras clave y devolver listado compacto
    const keywords = extractSearchTerms(userMessage)
    if (keywords) {
      const productos = await catalogService.buscarProductos(keywords, 10)
      const formatted = formatProductosCompact(productos)
      if (formatted) parts.push(formatted)
    }

    return parts.join('\n')
  } catch (error) {
    console.error('[CatalogContext] Error:', error)
    return ''
  }
}


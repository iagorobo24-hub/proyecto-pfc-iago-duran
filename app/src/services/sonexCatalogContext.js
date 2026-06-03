import catalogService from './catalogService'

const PATRON_REFERENCIA = /\b([A-Z]{2,}[\d]{1,}[A-Z0-9-]{3,})\b/

function extractReference(text) {
  const match = text.match(PATRON_REFERENCIA)
  if (!match) return null
  const ref = match[1]
  if (ref.length < 4 || ref.length > 30) return null
  return ref
}

const STOP_WORDS = new Set([
  'el','la','los','las','un','una','que','es','por','para','con','del',
  'en','de','su','al','como','mas','pero','sus','entre','sobre','todo',
  'tiene','hay','son','cual','donde','cuando','buscar','necesito',
  'puedes','dame','muestra','quiero','saber','informacion',
  'precio','precios','referencia','referencias','marca','modelo','modelos',
  'producto','productos','ficha','fichas','tecnica','tecnicas',
])

function extractSearchTerms(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 6)
    .join(' ')
}

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

export async function buildCatalogContext(userMessage, activeCategory = null) {
  try {
    const stats = await catalogService.getCatalogStats()

    const parts = []
    parts.push(`【ESTADÍSTICAS】 Total productos en catálogo: ${stats.totalProducts}`)

    if (activeCategory) {
      const catCtx = await buildCategoryContext(activeCategory)
      if (catCtx) parts.push(catCtx)
    }

    const ref = extractReference(userMessage)
    if (ref) {
      const producto = await catalogService.getProductoPorRef(ref)
      if (producto) {
        parts.push(formatProductoDetalle(producto))
        return parts.join('\n')
      }
    }

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

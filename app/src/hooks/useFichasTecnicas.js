import { useState } from 'react'
import { callAnthropicAI, parseAIJsonResponse } from '../services/anthropicService'
import catalogService from '../services/catalogService'

/* Prompts para la API de Anthropic — system prompt separado del input */
const SYSTEM_FICHA = `Eres un técnico especialista en material eléctrico e industrial de Proyectos PFC España con 15 años de experiencia. El técnico de mostrador te consulta sobre un producto.

Si la consulta es demasiado vaga para identificar un producto concreto (una sola palabra genérica, síntoma sin contexto, o descripción que aplica a decenas de productos), responde ÚNICAMENTE con este JSON:
{"error": true, "mensaje": "descripción breve del problema con la consulta", "sugerencias": ["consulta más específica 1", "consulta más específica 2", "consulta más específica 3"]}

Si la consulta identifica un producto concreto, responde ÚNICAMENTE con este JSON (sin backticks ni markdown):
{
  "nombre": "nombre comercial completo",
  "referencia": "referencia fabricante",
  "fabricante": "fabricante",
  "categoria": "categoría",
  "precio_orientativo": "rango orientativo en € sin IVA (ej: 45–65€)",
  "descripcion": "descripción técnica de 2-3 frases",
  "caracteristicas": ["característica técnica 1", "característica técnica 2", "característica técnica 3", "característica técnica 4"],
  "aplicaciones": ["aplicación 1", "aplicación 2", "aplicación 3"],
  "compatibilidades": ["compatible con 1", "compatible con 2"],
  "normas": ["norma 1", "norma 2"],
  "consejo_tecnico": "consejo práctico de instalación o selección en 1-2 frases"
}`

/* Hook principal — búsqueda IA para FichasTecnicas */
export default function useFichasTecnicas() {
  const [consulta, setConsulta] = useState('')
  const [resultado, setResultado] = useState(null)
  const [resultadosBusqueda, setResultadosBusqueda] = useState([])
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  /* Buscar producto real en el catálogo o en la IA */
  const buscar = async (q = consulta) => {
    if (!q.trim()) return
    setCargando(true)
    setResultado(null)
    setResultadosBusqueda([])
    setError(null)

    try {
      // 1. INTENTAR BÚSQUEDA EN CATÁLOGO REAL (POR REFERENCIA)
      const productoReal = await catalogService.getProductoPorRef(q.trim())
      
      if (productoReal) {
        const fichaReal = mapProductoAFicha(productoReal)
        
        // 2. BUSCAR CARACTERÍSTICAS ADICIONALES CON IA
        try {
          const { text } = await callAnthropicAI({
            model: 'anthropic/claude-3.5-haiku',
            max_tokens: 800,
            system: `Eres un asistente técnico de Proyectos PFC. El producto es: ${productoReal.nombre} (Ref: ${productoReal.ref_fabricante}). Proporciona solo las características técnicas en JSON:
{"caracteristicas": ["característica 1", "característica 2"], "aplicaciones": ["app 1"], "normas": ["norma 1"]}`,
            messages: [{ role: 'user', content: 'Dame las características técnicas de este producto' }],
          })
          
          const parsed = parseAIJsonResponse(text, (p) => p.caracteristicas || p.aplicaciones)
          if (!parsed.error) {
            Object.assign(fichaReal, parsed)
          }
        } catch (e) {
          console.warn('No se pudieron obtener características:', e)
        }
        
        setResultado(fichaReal)
        setCargando(false)
        return
      }

      // 2. INTENTAR BÚSQUEDA POR PALABRAS CLAVE (NOMBRE)
      const productosPorNombre = await catalogService.buscarProductos(q.trim())
      if (productosPorNombre.length > 0) {
        if (productosPorNombre.length === 1) {
          const fichaReal = mapProductoAFicha(productosPorNombre[0])
          setResultado(fichaReal)
        } else {
          setResultadosBusqueda(productosPorNombre.map(mapProductoAFicha))
        }
        setCargando(false)
        return
      }

      // 3. SI NO HAY RESULTADOS REALES, PREGUNTAR A LA IA (RAG)
      const { text } = await callAnthropicAI({
        model: 'anthropic/claude-3.5-haiku',
        max_tokens: 1000,
        system: SYSTEM_FICHA,
        messages: [{ role: 'user', content: q }],
      })

      const parsed = parseAIJsonResponse(text, (p) => p.error || (p.nombre && p.referencia))
      if (parsed.error) {
        setError(parsed)
      } else {
        setResultado(parsed)
      }
    } catch (err) {
      setError({ error: true, mensaje: err.message || 'Error al procesar la respuesta.', sugerencias: [] })
    }
    setCargando(false)
  }

  /* Helper para unificar formato de producto real -> formato ficha técnica */
  const mapProductoAFicha = (p) => ({
    nombre: p.name || p.nombre,
    referencia: p.ref_fabricante || p.ref,
    fabricante: p.marca,
    marca: p.marca,
    familia: p.familia,
    categoria: p.tipo || p.subfamilia || p.familia,
    precio_orientativo: p.precio ? `${p.precio} €` : 'Consultar',
    precio: p.precio,
    descripcion: p.name || p.nombre,
    pdf_url: p.pdf_url || p.pdf || p.pdfUrl,
    esReal: true
  })

  return {
    consulta, setConsulta,
    resultado, setResultado,
    resultadosBusqueda,
    error,
    cargando,
    buscar,
  }
}

import { useState, useCallback, useMemo, useEffect } from 'react'
import catalogService from '../services/catalogService'
import { useToast } from '../contexts/ToastContext'
import { callAnthropicAI, parseAIJsonResponse } from '../services/anthropicService'
import { getCategoria, CATEGORIA_ICONOS } from '../data/categoriaMapping'

function construirGrupos(subfamiliasConTipos) {
  const grupos = {}
  for (const { subfamilia, tipo } of subfamiliasConTipos) {
    const mapping = getCategoria(subfamilia, tipo)
    if (!mapping) continue
    const { categoria, subcategoria } = mapping
    if (!grupos[categoria]) {
      grupos[categoria] = { icon: CATEGORIA_ICONOS[categoria] || '📁', subcategorias: {} }
    }
    if (!grupos[categoria].subcategorias[subcategoria]) {
      grupos[categoria].subcategorias[subcategoria] = []
    }
    grupos[categoria].subcategorias[subcategoria].push({ subfamilia, tipo })
  }
  return grupos
}

export default function useNavegacionFichas() {
 const { toast } = useToast()
 
 const [paso, setPaso] = useState('categorias')
 const [categorias, setCategorias] = useState([])
 const [categoria, setCategoria] = useState(null)
 const [marca, setMarca] = useState(null)
 const [gama, setGama] = useState(null)
 const [tipo, setTipo] = useState(null)
 const [referencia, setReferencia] = useState(null)

 const [categoriaGrupo, setCategoriaGrupo] = useState(null)
 const [subcategoria, setSubcategoria] = useState(null)
 const [grupos, setGrupos] = useState({})

 const [marcasDisponibles, setMarcasDisponibles] = useState([])
 const [gamasDisponibles, setGamasDisponibles] = useState([])
 const [tiposDisponibles, setTiposDisponibles] = useState([])
 const [referenciasDisponibles, setReferenciasDisponibles] = useState([])
 const [cargando, setCargando] = useState(false)
 const [error, setError] = useState(null)
 const [historial, setHistorial] = useState([])

const [aiFicha, setAiFicha] = useState(null)
const [aiCargando, setAiCargando] = useState(false)

async function cargarInfoIA(ficha) {
  setAiCargando(true)
  const nombreProd = ficha.name || ficha.nombre || ''
  const marcaProd = ficha.marca || ''
  const refProd = ficha.ref_fabricante || ficha.ref || ''

  try {
    const { text } = await callAnthropicAI({
      model: 'anthropic/claude-3.5-haiku',
      max_tokens: 1000,
      system: `Eres un técnico especialista en material eléctrico e industrial.
Dado un producto con su nombre, marca y referencia, busca mentalmente en tu conocimiento técnico y responde ÚNICAMENTE con este JSON (sin markdown ni backticks):
{
  "caracteristicas": ["característica técnica 1", "característica técnica 2", "característica técnica 3", "característica técnica 4", "característica técnica 5"],
  "aplicaciones": ["aplicación 1", "aplicación 2", "aplicación 3"],
  "normas": ["norma 1", "norma 2"],
  "url_manual": "URL donde encontrar el manual si la conoces, o cadena vacía",
  "consejo_tecnico": "consejo práctico de instalación, selección o mantenimiento en 1-2 frases"
}`,
      messages: [
        { role: 'user', content: `Producto: ${nombreProd}\nMarca: ${marcaProd}\nReferencia: ${refProd}\n\nProporciona las características técnicas, aplicaciones, normas y consejo técnico.` }
      ],
    })

    const parsed = parseAIJsonResponse(text)
    if (!parsed.error) {
      setAiFicha(parsed.data)
    }
  } catch (e) {
    console.warn('No se pudieron obtener datos por IA:', e)
  }
  setAiCargando(false)
}

useEffect(() => {
  async function load() {
   setCargando(true)
   try {
    await catalogService.initCatalog()
    const cats = await catalogService.getCategorias()
    setCategorias(cats)
   } catch (err) {
    console.error('Error cargando categorías:', err)
    setError('Error al cargar categorías')
   } finally {
    setCargando(false)
   }
  }
  load()
 }, [])

 useEffect(() => {
  if (!categoria) return;
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const data = await catalogService.getMarcasPorCategoria(categoria)
    setMarcasDisponibles(data)
   } catch (err) {
    console.error('Error cargando marcas:', err)
    setError('Error al cargar marcas')
   } finally {
    setCargando(false)
   }
  }
  load()
 }, [categoria])

 useEffect(() => {
  if (!categoria || !marca) return;
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const pares = await catalogService.getSubfamiliasConTipos(marca, categoria)
    const g = construirGrupos(pares)

    if (Object.keys(g).length > 0) {
      setGrupos(g)
      setCategoriaGrupo(null)
      setSubcategoria(null)
      setGamasDisponibles([])
      setTiposDisponibles([])
      setPaso('categorias_grupo')
      setHistorial(prev => [...prev, { paso: 'marcas' }])
    } else {
      const data = await catalogService.getGamasPorMarcaYCategoria(marca, categoria)
      setGamasDisponibles(data.map(g => g.nombre))
      setGrupos({})
      setCategoriaGrupo(null)
      setSubcategoria(null)
    }
   } catch (err) {
    console.error('Error cargando gamas:', err)
    setError('Error al cargar gamas')
   } finally {
    setCargando(false)
   }
  }
  load()
 }, [categoria, marca])

 useEffect(() => {
  if (!categoria || !marca || !gama) return;
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const data = await catalogService.getTiposPorGamaMarcaYFamilia(gama, marca, categoria)
    setTiposDisponibles(data)
   } catch (err) {
    console.error('Error cargando tipos:', err)
    setError('Error al cargar tipos')
   } finally {
    setCargando(false)
   }
  }
  load()
 }, [categoria, marca, gama])

 useEffect(() => {
  if (!categoria || !marca || !gama || !tipo) return;
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const products = await catalogService.getProductosPorFiltro(categoria, marca, gama, tipo)
    setReferenciasDisponibles(products)
   } catch (err) {
    console.error('Error cargando productos:', err)
    setError('Error al cargar productos')
   } finally {
    setCargando(false)
   }
  }
  load()
 }, [categoria, marca, gama, tipo])

 const seleccionarCategoria = useCallback((catId) => {
  setCategoria(catId)
  setMarca(null)
  setGama(null)
  setTipo(null)
  setCategoriaGrupo(null)
  setSubcategoria(null)
  setGrupos({})
  setReferencia(null)
  setAiFicha(null)
  setPaso('marcas')
  setHistorial(prev => [...prev, { paso: 'categorias' }])
 }, [])

 const seleccionarMarca = useCallback((marcaNombre) => {
  setMarca(marcaNombre)
  setGama(null)
  setTipo(null)
  setReferencia(null)
  setAiFicha(null)
  setPaso('gamas')
  setHistorial(prev => [...prev, { paso: 'marcas' }])
 }, [])

 const seleccionarCategoriaGrupo = useCallback((cat) => {
  setCategoriaGrupo(cat)
  setSubcategoria(null)
  setReferencia(null)
  setAiFicha(null)
  setPaso('subcategorias')
  setHistorial(prev => [...prev, { paso: 'categorias_grupo' }])
 }, [])

 const seleccionarSubcategoria = useCallback(async (subcat) => {
  if (!categoriaGrupo || !grupos[categoriaGrupo]) return
  const filtros = grupos[categoriaGrupo].subcategorias[subcat]
  if (!filtros) return
  setCargando(true)
  setSubcategoria(subcat)
  setReferencia(null)
  setAiFicha(null)
  setError(null)
  try {
    const products = await catalogService.getProductosPorSubcategoria(categoria, marca, filtros)
    setReferenciasDisponibles(products)
    setPaso('referencias')
    setHistorial(prev => [...prev, { paso: 'subcategorias' }])
  } catch (err) {
    console.error('Error cargando productos:', err)
    setError('Error al cargar productos')
  }
  setCargando(false)
 }, [categoria, marca, categoriaGrupo, grupos])

 const seleccionarGama = useCallback((gamaNombre) => {
  setGama(gamaNombre)
  setTipo(null)
  setReferencia(null)
  setAiFicha(null)
  setPaso('tipos')
  setHistorial(prev => [...prev, { paso: 'gamas' }])
 }, [])

 const seleccionarTipo = useCallback((tipoNombre) => {
  setTipo(tipoNombre)
  setReferencia(null)
  setAiFicha(null)
  setPaso('referencias')
  setHistorial(prev => [...prev, { paso: 'tipos' }])
 }, [])

 const seleccionarReferencia = useCallback(async (producto) => {
   setCargando(true)
   setError(null)
   setAiFicha(null)
   try {
    let ficha = producto
    if (typeof producto === 'string' || typeof producto === 'number') {
     ficha = await catalogService.getProductoPorRef(producto)
    }
    if (ficha) {
     setReferencia(ficha)
     setPaso('ficha')
     setHistorial(prev => [...prev, { paso: 'referencias' }])
     cargarInfoIA(ficha)
    }
   } catch (err) {
    console.error('Error cargando ficha:', err)
    setError('Error al cargar ficha')
   } finally {
    setCargando(false)
   }
  }, [])

 const volver = useCallback(() => {
  const nuevoHistorial = [...historial]
  const anterior = nuevoHistorial.pop()
  if (!anterior) { reiniciar(); return; }
  setPaso(anterior.paso)
  setHistorial(nuevoHistorial)
 }, [historial])

 const reiniciar = useCallback(() => {
  setPaso('categorias')
  setCategoria(null)
  setMarca(null)
  setGama(null)
  setTipo(null)
  setCategoriaGrupo(null)
  setSubcategoria(null)
  setGrupos({})
  setReferencia(null)
  setAiFicha(null)
  setHistorial([])
 }, [])

 const buscarReferenciaDirecta = useCallback(async (refId) => {
   if (!refId) return false
   setCargando(true)
   setAiFicha(null)
   try {
    const ficha = await catalogService.getProductoPorRef(refId)
    if (ficha) {
     setCategoria(ficha.familia || ficha.category)
     setMarca(ficha.marca || ficha.brand)
     setGama(ficha.gama || ficha.subfamily)
     setTipo(ficha.tipo || ficha.type)
     setReferencia(ficha)
     setPaso('ficha')
     setHistorial(prev => [...prev, { paso: 'categorias' }])
     setCargando(false)
     cargarInfoIA(ficha)
     return true
    }
   } catch (e) {
    console.error('Error en búsqueda directa:', e)
   }
   setCargando(false)
   return false
  }, [])

const breadcrumb = useMemo(() => {
  const b = []
  if (categoria) b.push(categoria)
  if (marca) b.push(marca)
  if (categoriaGrupo) {
    b.push(categoriaGrupo)
    if (subcategoria) b.push(subcategoria)
  } else {
    if (gama) b.push(gama)
    if (tipo) b.push(tipo)
  }
  if (referencia) b.push({ label: referencia.ref_fabricante || referencia.ref, imagen: referencia.imagen })
  return b
}, [categoria, marca, gama, tipo, categoriaGrupo, subcategoria, referencia])

 return {
  paso, categoria, marca, gama, tipo, categoriaGrupo, subcategoria, grupos,
  referencia, historial, cargando, error,
  categorias, marcasDisponibles, gamasDisponibles, tiposDisponibles, referenciasDisponibles,
  breadcrumb,
  seleccionarCategoria, seleccionarMarca, seleccionarCategoriaGrupo, seleccionarSubcategoria,
  seleccionarGama, seleccionarTipo,
  seleccionarReferencia, volver, reiniciar, buscarReferenciaDirecta,
  aiFicha, aiCargando
 }
}

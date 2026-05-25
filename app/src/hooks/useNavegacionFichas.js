import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import catalogService from '../services/catalogService'
import { useToast } from '../contexts/ToastContext'
import { callAnthropicAI, parseAIJsonResponse } from '../services/anthropicService'
import { getCategoria, CATEGORIA_ICONOS } from '../data/categoriaMapping'
import useMemoriaUsuario from './useMemoriaUsuario'

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

function clearStatesAfter(paso, setters) {
  switch(paso) {
    case 'categorias':
      setters.setMarca(null)
      setters.setGama(null)
      setters.setGamaComercial(null)
      setters.setTipo(null)
      setters.setCategoriaGrupo(null)
      setters.setSubcategoria(null)
      setters.setSubgama(null)
      setters.setGamasComercialesDisponibles([])
      setters.setSubgamasDisponibles([])
      setters.setReferencia(null)
      setters.setReferenciasDisponibles([])
      setters.setGrupos({})
      break
    case 'marcas':
      setters.setGama(null)
      setters.setGamaComercial(null)
      setters.setTipo(null)
      setters.setCategoriaGrupo(null)
      setters.setSubcategoria(null)
      setters.setSubgama(null)
      setters.setGamasComercialesDisponibles([])
      setters.setSubgamasDisponibles([])
      setters.setReferencia(null)
      setters.setReferenciasDisponibles([])
      setters.setGrupos({})
      break
    case 'categorias_grupo':
      setters.setSubcategoria(null)
      setters.setGamaComercial(null)
      setters.setSubgama(null)
      setters.setGamasComercialesDisponibles([])
      setters.setSubgamasDisponibles([])
      setters.setReferencia(null)
      setters.setReferenciasDisponibles([])
      break
    case 'subcategorias':
      setters.setGamaComercial(null)
      setters.setSubgama(null)
      setters.setGamasComercialesDisponibles([])
      setters.setSubgamasDisponibles([])
      setters.setReferencia(null)
      setters.setReferenciasDisponibles([])
      break
    case 'gamas':
      setters.setTipo(null)
      setters.setGamaComercial(null)
      setters.setSubgama(null)
      setters.setGamasComercialesDisponibles([])
      setters.setSubgamasDisponibles([])
      setters.setReferencia(null)
      setters.setReferenciasDisponibles([])
      break
    case 'tipos':
      setters.setGamaComercial(null)
      setters.setSubgama(null)
      setters.setGamasComercialesDisponibles([])
      setters.setSubgamasDisponibles([])
      setters.setReferencia(null)
      setters.setReferenciasDisponibles([])
      break
    case 'gamas_comerciales':
      setters.setSubgama(null)
      setters.setSubgamasDisponibles([])
      setters.setReferencia(null)
      setters.setReferenciasDisponibles([])
      break
    case 'subgamas':
      setters.setReferencia(null)
      setters.setReferenciasDisponibles([])
      break
  }
}

export default function useNavegacionFichas() {
 const { toast } = useToast()
 const memoria = useMemoriaUsuario()
 
 const [paso, setPaso] = useState('categorias')
 const [categorias, setCategorias] = useState([])
 const [categoria, setCategoria] = useState(null)
 const [marca, setMarca] = useState(null)
 const [subgama, setSubgama] = useState(null)
 const [gamaComercial, setGamaComercial] = useState(null)
 const [gama, setGama] = useState(null)
 const [tipo, setTipo] = useState(null)
 const [referencia, setReferencia] = useState(null)

 const [categoriaGrupo, setCategoriaGrupo] = useState(null)
 const [subcategoria, setSubcategoria] = useState(null)
 const [grupos, setGrupos] = useState({})

 const [marcasDisponibles, setMarcasDisponibles] = useState([])
 const [gamasDisponibles, setGamasDisponibles] = useState([])
 const [tiposDisponibles, setTiposDisponibles] = useState([])
 const [gamasComercialesDisponibles, setGamasComercialesDisponibles] = useState([])
 const [subgamasDisponibles, setSubgamasDisponibles] = useState([])
 const [referenciasDisponibles, setReferenciasDisponibles] = useState([])
 const [cargando, setCargando] = useState(false)
 const [error, setError] = useState(null)
 const [historial, setHistorial] = memoria.fichas.historial.use()

 const [aiCache, setAiCache] = memoria.fichas.aiCache.use()
 const aiCacheRef = useRef(aiCache)
 useEffect(() => { aiCacheRef.current = aiCache }, [aiCache])
 const [aiCargando, setAiCargando] = useState(false)
 const [sugerenciasBusqueda, setSugerenciasBusqueda] = useState([])
 const [busquedaCargando, setBusquedaCargando] = useState(false)

 const aiFicha = useMemo(() => {
   const key = referencia ? (referencia.ref_fabricante || referencia.ref || '') : ''
   return key && aiCache[key] ? aiCache[key] : null
 }, [referencia, aiCache])

 async function cargarInfoIA(ficha) {
  const key = ficha.ref_fabricante || ficha.ref || ''
  if (aiCacheRef.current[key]) return

  setAiCargando(true)
  const nombreProd = ficha.name || ficha.nombre || ''
  const marcaProd = ficha.marca || ''
  const refProd = key

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
      setAiCache(prev => ({ ...prev, [key]: parsed.data }))
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
      setGamaComercial(null)
      setGamasComercialesDisponibles([])
      setSubgama(null)
      setSubgamasDisponibles([])
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

 useEffect(() => {
  if (paso !== 'gamas_comerciales') return
  if (!categoria || !marca) return

  async function load() {
   setCargando(true)
   setError(null)
   try {
    let gamas = []
    if (categoriaGrupo && subcategoria) {
      const filtros = grupos[categoriaGrupo]?.subcategorias[subcategoria]
      if (filtros) gamas = await catalogService.getGamasPorSubcategoria(categoria, marca, filtros)
    } else if (gama && tipo) {
      gamas = await catalogService.getGamasPorFiltro(categoria, marca, gama, tipo)
    }
    setGamasComercialesDisponibles(gamas)

    if (gamas.length === 0) {
      let subgamas = []
      if (categoriaGrupo && subcategoria) {
        const filtros = grupos[categoriaGrupo]?.subcategorias[subcategoria]
        if (filtros) subgamas = await catalogService.getSubgamasPorSubcategoria(categoria, marca, filtros)
      } else if (gama && tipo) {
        subgamas = await catalogService.getSubgamasPorFiltro(categoria, marca, gama, tipo)
      }
      setSubgamasDisponibles(subgamas)

      if (subgamas.length === 0) {
        let products = []
        if (categoriaGrupo && subcategoria) {
          const filtros = grupos[categoriaGrupo]?.subcategorias[subcategoria]
          if (filtros) products = await catalogService.getProductosPorSubcategoria(categoria, marca, filtros)
        } else if (gama && tipo) {
          products = await catalogService.getProductosPorFiltro(categoria, marca, gama, tipo)
        }
        setReferenciasDisponibles(products)
        setPaso('referencias')
        setHistorial(prev => [...prev, { paso: 'gamas_comerciales' }])
      } else {
        setPaso('subgamas')
        setHistorial(prev => [...prev, { paso: 'gamas_comerciales' }])
      }
    }
   } catch (err) {
    console.error('Error cargando gamas:', err)
    setError('Error al cargar gamas')
   } finally {
    setCargando(false)
   }
  }
  load()
 }, [paso, categoria, marca, categoriaGrupo, subcategoria, gama, tipo, grupos])

 useEffect(() => {
  if (paso !== 'subgamas') return
  if (!categoria || !marca) return

  async function load() {
   setCargando(true)
   setError(null)
   try {
    let subgamas = []
    if (categoriaGrupo && subcategoria) {
      const filtros = grupos[categoriaGrupo]?.subcategorias[subcategoria]
      if (filtros) subgamas = await catalogService.getSubgamasPorSubcategoria(categoria, marca, filtros)
    } else if (gama && tipo) {
      subgamas = await catalogService.getSubgamasPorFiltro(categoria, marca, gama, tipo)
    }
    setSubgamasDisponibles(subgamas)

    if (subgamas.length === 0) {
      let products = []
      if (categoriaGrupo && subcategoria) {
        const filtros = grupos[categoriaGrupo]?.subcategorias[subcategoria]
        if (filtros) products = await catalogService.getProductosPorSubcategoria(categoria, marca, filtros)
      } else if (gama && tipo) {
        products = await catalogService.getProductosPorFiltro(categoria, marca, gama, tipo)
      }
      setReferenciasDisponibles(products)
      setPaso('referencias')
      setHistorial(prev => [...prev, { paso: 'subgamas' }])
    }
   } catch (err) {
    console.error('Error cargando subgamas:', err)
    setError('Error al cargar subgamas')
   } finally {
    setCargando(false)
   }
  }
  load()
 }, [paso, categoria, marca, categoriaGrupo, subcategoria, gama, tipo, grupos])

 const seleccionarCategoria = useCallback((catId) => {
  setCategoria(catId)
  setMarca(null)
  setGama(null)
  setTipo(null)
  setCategoriaGrupo(null)
  setSubcategoria(null)
  setGrupos({})
  setReferencia(null)
  setPaso('marcas')
  setHistorial(prev => [...prev, { paso: 'categorias' }])
 }, [])

 const seleccionarMarca = useCallback((marcaNombre) => {
  setMarca(marcaNombre)
  setGama(null)
  setTipo(null)
  setReferencia(null)
  setPaso('gamas')
  setHistorial(prev => [...prev, { paso: 'marcas' }])
 }, [])

 const seleccionarCategoriaGrupo = useCallback((cat) => {
  setCategoriaGrupo(cat)
  setSubcategoria(null)
  setSubgama(null)
  setSubgamasDisponibles([])
  setReferencia(null)
  setPaso('subcategorias')
  setHistorial(prev => [...prev, { paso: 'categorias_grupo' }])
 }, [])

 const seleccionarSubcategoria = useCallback((subcat) => {
  if (!categoriaGrupo || !grupos[categoriaGrupo]) return
  const filtros = grupos[categoriaGrupo].subcategorias[subcat]
  if (!filtros) return
  setSubcategoria(subcat)
  setGamaComercial(null)
  setGamasComercialesDisponibles([])
  setSubgama(null)
  setSubgamasDisponibles([])
  setReferencia(null)
  setReferenciasDisponibles([])
  setError(null)
  setPaso('gamas_comerciales')
  setHistorial(prev => [...prev, { paso: 'subcategorias' }])
 }, [categoriaGrupo, grupos])

 const seleccionarGama = useCallback((gamaNombre) => {
  setGama(gamaNombre)
  setTipo(null)
  setSubgama(null)
  setSubgamasDisponibles([])
  setReferencia(null)
  setPaso('tipos')
  setHistorial(prev => [...prev, { paso: 'gamas' }])
 }, [])

 const seleccionarTipo = useCallback((tipoNombre) => {
  setTipo(tipoNombre)
  setGamaComercial(null)
  setGamasComercialesDisponibles([])
  setSubgama(null)
  setSubgamasDisponibles([])
  setReferencia(null)
  setReferenciasDisponibles([])
  setPaso('gamas_comerciales')
  setHistorial(prev => [...prev, { paso: 'tipos' }])
 }, [])

 const seleccionarGamaComercial = useCallback((gc) => {
  setGamaComercial(gc)
  setSubgama(null)
  setSubgamasDisponibles([])
  setReferencia(null)
  setReferenciasDisponibles([])
  setError(null)
  setPaso('subgamas')
  setHistorial(prev => [...prev, { paso: 'gamas_comerciales' }])
 }, [])

 const seleccionarSubgama = useCallback(async (sg) => {
  setSubgama(sg)
  setReferencia(null)
  setReferenciasDisponibles([])
  setCargando(true)
  setError(null)
  try {
    let products = []
    if (categoriaGrupo && subcategoria) {
      const filtros = grupos[categoriaGrupo]?.subcategorias[subcategoria]
      if (filtros) products = await catalogService.getProductosPorSubcategoria(categoria, marca, filtros, gamaComercial, sg)
    } else if (gama && tipo) {
      products = await catalogService.getProductosPorFiltro(categoria, marca, gama, tipo, gamaComercial, sg)
    }
    setReferenciasDisponibles(products)
    setPaso('referencias')
    setHistorial(prev => [...prev, { paso: 'subgamas' }])
  } catch (err) {
    console.error('Error cargando productos por subgama:', err)
    setError('Error al cargar productos')
  }
  setCargando(false)
 }, [categoria, marca, categoriaGrupo, subcategoria, gama, tipo, gamaComercial, grupos])

 const seleccionarReferencia = useCallback(async (producto) => {
   setCargando(true)
   setError(null)

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

 const clearAfter = useCallback((restoredPaso) => {
  clearStatesAfter(restoredPaso, {
    setMarca, setGama, setGamaComercial, setTipo, setCategoriaGrupo,
    setSubcategoria, setSubgama, setSubgamasDisponibles,
    setGamasComercialesDisponibles,
    setReferencia, setReferenciasDisponibles, setGrupos
  })
 }, [])

 const volver = useCallback(() => {
  const nuevoHistorial = [...historial]
  const anterior = nuevoHistorial.pop()
  if (!anterior) { reiniciar(); return; }
  setPaso(anterior.paso)
  setHistorial(nuevoHistorial)
  clearAfter(anterior.paso)
 }, [historial, clearAfter])

 const irAPaso = useCallback((breadcrumbIndex) => {
  if (breadcrumbIndex >= historial.length) return
  const targetEntry = historial[breadcrumbIndex]
  setPaso(targetEntry.paso)
  setHistorial(historial.slice(0, breadcrumbIndex))
  clearAfter(targetEntry.paso)
 }, [historial, clearAfter])

 const reiniciar = useCallback(() => {
  setPaso('categorias')
  setCategoria(null)
  setMarca(null)
  setGamaComercial(null)
  setSubgama(null)
  setGama(null)
  setTipo(null)
  setCategoriaGrupo(null)
  setSubcategoria(null)
  setGamasComercialesDisponibles([])
  setSubgamasDisponibles([])
  setGrupos({})
  setReferencia(null)
  setReferenciasDisponibles([])
  setHistorial([])
 }, [])

  const buscarReferenciaDirecta = useCallback(async (refId) => {
    if (!refId) return false
    setCargando(true)

    try {
     const ficha = await catalogService.getProductoPorRef(refId)
     if (ficha) {
      setCategoria(ficha.familia || ficha.category)
      setMarca(ficha.marca || ficha.brand)
      setGamaComercial(ficha.Gama || null)
      setSubgama(ficha.Subgama || null)
      setGama(ficha.gama || ficha.subfamily)
      setTipo(ficha.tipo || ficha.type)
      setReferencia(ficha)
      setPaso('ficha')
      setHistorial(prev => [...prev, { paso: 'categorias' }])
      setCargando(false)
      cargarInfoIA(ficha)
      return true
     }
     const porNombre = await catalogService.buscarProductos(refId)
     if (porNombre && porNombre.length > 0) {
      if (porNombre.length === 1) {
       const f = porNombre[0]
       setCategoria(f.familia || f.category)
       setMarca(f.marca || f.brand)
       setGamaComercial(f.Gama || null)
       setSubgama(f.Subgama || null)
       setGama(f.subfamilia || f.gama)
       setTipo(f.tipo || f.type)
       setReferencia(f)
       setPaso('ficha')
       setHistorial(prev => [...prev, { paso: 'categorias' }])
       setCargando(false)
       cargarInfoIA(f)
       return true
      }
      setReferenciasDisponibles(porNombre)
      setPaso('referencias')
      setHistorial(prev => [...prev, { paso: 'categorias' }])
      setCargando(false)
      return true
     }
    } catch (e) {
     console.error('Error en búsqueda directa:', e)
    }
    setCargando(false)
    return false
   }, [])

 const buscarPorNombre = useCallback(async (termino) => {
   if (!termino || termino.trim().length < 2) {
    setSugerenciasBusqueda([])
    return
   }
   setBusquedaCargando(true)
   try {
    const results = await catalogService.buscarProductosConLimite(termino, 5)
    setSugerenciasBusqueda(results)
   } catch {
    setSugerenciasBusqueda([])
   }
   setBusquedaCargando(false)
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
  if (gamaComercial) b.push(gamaComercial)
  if (subgama) b.push(subgama)
  if (referencia) b.push({ label: referencia.ref_fabricante || referencia.ref, imagen: referencia.imagen })
  return b
 }, [categoria, marca, gamaComercial, gama, tipo, categoriaGrupo, subcategoria, subgama, referencia])

 return {
  paso, categoria, marca, gamaComercial, subgama, gama, tipo, categoriaGrupo, subcategoria, grupos,
  referencia, historial, cargando, error,
  categorias, marcasDisponibles, gamasDisponibles, tiposDisponibles, gamasComercialesDisponibles, subgamasDisponibles, referenciasDisponibles,
  breadcrumb, sugerenciasBusqueda, busquedaCargando,
  seleccionarCategoria, seleccionarMarca, seleccionarCategoriaGrupo, seleccionarSubcategoria,
  seleccionarGama, seleccionarTipo, seleccionarGamaComercial, seleccionarSubgama,
  seleccionarReferencia, volver, irAPaso, reiniciar, buscarReferenciaDirecta, buscarPorNombre,
  aiFicha, aiCargando
 }
}

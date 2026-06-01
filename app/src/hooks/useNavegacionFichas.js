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

 export default function useNavegacionFichas() {
 const { toast } = useToast()
 const memoria = useMemoriaUsuario()
 const requestIdRef = useRef(0)
 
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
  const prevMarcaRef = useRef(null)
  useEffect(() => { prevMarcaRef.current = marca }, [marca])
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
  const reqId = ++requestIdRef.current
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const data = await catalogService.getMarcasPorCategoria(categoria)
    if (reqId !== requestIdRef.current) return
    setMarcasDisponibles(data)
   } catch (err) {
    if (reqId !== requestIdRef.current) return
    console.error('Error cargando marcas:', err)
    setError('Error al cargar marcas')
   } finally {
    if (reqId === requestIdRef.current) setCargando(false)
   }
  }
  load()
 }, [categoria])

  useEffect(() => {
   if (!categoria || !marca) return;
  const reqId = ++requestIdRef.current
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const pares = await catalogService.getSubfamiliasConTipos(marca, categoria)
    const g = construirGrupos(pares)

    if (reqId !== requestIdRef.current) return
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
     if (paso === 'marcas') setPaso('categorias_grupo')
    } else {
      const data = await catalogService.getGamasPorMarcaYCategoria(marca, categoria)
      if (reqId !== requestIdRef.current) return
      setGamasDisponibles(data.map(g => g.nombre))
      setGrupos({})
      setCategoriaGrupo(null)
      setSubcategoria(null)
    }
   } catch (err) {
    if (reqId !== requestIdRef.current) return
    console.error('Error cargando gamas:', err)
    setError('Error al cargar gamas')
   } finally {
    if (reqId === requestIdRef.current) setCargando(false)
   }
  }
  load()
 }, [categoria, marca])

  useEffect(() => {
   if (!categoria || !marca || !gama) return;
   const reqId = ++requestIdRef.current
   async function load() {
    setCargando(true)
    setError(null)
    try {
     const data = await catalogService.getTiposPorGamaMarcaYFamilia(gama, marca, categoria)
     if (reqId !== requestIdRef.current) return
     setTiposDisponibles(data)
    } catch (err) {
     if (reqId !== requestIdRef.current) return
     console.error('Error cargando tipos:', err)
     setError('Error al cargar tipos')
    } finally {
     if (reqId === requestIdRef.current) setCargando(false)
    }
   }
   load()
  }, [categoria, marca, gama])

  useEffect(() => {
  if (!categoria || !marca || !gama || !tipo) return;
  const reqId = ++requestIdRef.current
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const products = await catalogService.getProductosPorFiltro(categoria, marca, gama, tipo)
    if (reqId !== requestIdRef.current) return
    setReferenciasDisponibles(products)
   } catch (err) {
    if (reqId !== requestIdRef.current) return
    console.error('Error cargando productos:', err)
    setError('Error al cargar productos')
   } finally {
    if (reqId === requestIdRef.current) setCargando(false)
   }
  }
  load()
 }, [categoria, marca, gama, tipo])

  useEffect(() => {
  if (paso !== 'gamas_comerciales') return
  if (!categoria || !marca) return

  const reqId = ++requestIdRef.current
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
    if (reqId !== requestIdRef.current) return
    setGamasComercialesDisponibles(gamas)

    if (gamas.length === 0) {
      let subgamas = []
      if (categoriaGrupo && subcategoria) {
        const filtros = grupos[categoriaGrupo]?.subcategorias[subcategoria]
        if (filtros) subgamas = await catalogService.getSubgamasPorSubcategoria(categoria, marca, filtros)
      } else if (gama && tipo) {
        subgamas = await catalogService.getSubgamasPorFiltro(categoria, marca, gama, tipo)
      }
      if (reqId !== requestIdRef.current) return
      setSubgamasDisponibles(subgamas)

      if (subgamas.length === 0) {
        let products = []
        if (categoriaGrupo && subcategoria) {
          const filtros = grupos[categoriaGrupo]?.subcategorias[subcategoria]
          if (filtros) products = await catalogService.getProductosPorSubcategoria(categoria, marca, filtros)
        } else if (gama && tipo) {
          products = await catalogService.getProductosPorFiltro(categoria, marca, gama, tipo)
        }
        if (reqId !== requestIdRef.current) return
        setReferenciasDisponibles(products)
        setPaso('referencias')
      } else {
        setPaso('subgamas')
      }
    }
   } catch (err) {
    if (reqId !== requestIdRef.current) return
    console.error('Error cargando gamas:', err)
    setError('Error al cargar gamas')
   } finally {
    if (reqId === requestIdRef.current) setCargando(false)
   }
  }
  load()
 }, [paso, categoria, marca, categoriaGrupo, subcategoria, gama, tipo, grupos])

  useEffect(() => {
  if (paso !== 'subgamas') return
  if (!categoria || !marca) return

  const reqId = ++requestIdRef.current
  async function load() {
   setCargando(true)
   setError(null)
   try {
    let subgamas = []
    if (categoriaGrupo && subcategoria) {
      const filtros = grupos[categoriaGrupo]?.subcategorias[subcategoria]
      if (filtros) subgamas = await catalogService.getSubgamasPorSubcategoria(categoria, marca, filtros, gamaComercial)
    } else if (gama && tipo) {
      subgamas = await catalogService.getSubgamasPorFiltro(categoria, marca, gama, tipo, gamaComercial)
    }
    if (reqId !== requestIdRef.current) return
    setSubgamasDisponibles(subgamas)

    if (subgamas.length === 0) {
      let products = []
      if (categoriaGrupo && subcategoria) {
        const filtros = grupos[categoriaGrupo]?.subcategorias[subcategoria]
        if (filtros) products = await catalogService.getProductosPorSubcategoria(categoria, marca, filtros, gamaComercial)
      } else if (gama && tipo) {
        products = await catalogService.getProductosPorFiltro(categoria, marca, gama, tipo, gamaComercial)
      }
      if (reqId !== requestIdRef.current) return
      setReferenciasDisponibles(products)
      setPaso('referencias')
    }
   } catch (err) {
    if (reqId !== requestIdRef.current) return
    console.error('Error cargando subgamas:', err)
    setError('Error al cargar subgamas')
   } finally {
    if (reqId === requestIdRef.current) setCargando(false)
   }
  }
  load()
 }, [paso, categoria, marca, categoriaGrupo, subcategoria, gama, tipo, gamaComercial, grupos])

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
  setHistorial(prev => [...prev, { paso: 'marcas' }])
  // Don't set paso here — the useEffect for [categoria, marca] will set it
  // to either 'categorias_grupo' (DP) or 'gamas' (legacy) based on data
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

 const volver = useCallback(() => {
  const nuevoHistorial = [...historial]
  const anterior = nuevoHistorial.pop()
  if (!anterior) { reiniciar(); return; }
  setPaso(anterior.paso)
  setHistorial(nuevoHistorial)
  // Inline clear — avoids stale closure issue with clearAfter
  switch (anterior.paso) {
    case 'marcas':
      setCategoriaGrupo(null); setGama(null); setTipo(null)
      setGamasComercialesDisponibles([]); setSubgamasDisponibles([]); setReferenciasDisponibles([])
      break
    case 'categorias_grupo':
      setSubcategoria(null)
      setGamaComercial(null); setSubgama(null); setGamasComercialesDisponibles([]); setSubgamasDisponibles([]); setReferenciasDisponibles([])
      break
    case 'subcategorias':
      setGamaComercial(null); setSubgama(null); setGamasComercialesDisponibles([]); setSubgamasDisponibles([]); setReferenciasDisponibles([])
      break
    case 'gamas':
      setTipo(null)
      setGamasComercialesDisponibles([]); setSubgamasDisponibles([]); setReferenciasDisponibles([])
      break
    case 'tipos':
      setGamaComercial(null); setSubgama(null); setGamasComercialesDisponibles([]); setSubgamasDisponibles([]); setReferenciasDisponibles([])
      break
    case 'gamas_comerciales':
      setSubgama(null); setSubgamasDisponibles([]); setReferenciasDisponibles([])
      break
    case 'subgamas':
      setReferencia(null); setReferenciasDisponibles([])
      break
  }
 }, [historial])

 const irAPaso = useCallback((breadcrumbIndex) => {
  // Build the list of steps from CURRENT STATE (not from historial)
  // This matches how breadcrumb useMemo builds its items
  const stateSteps = []
  if (categoria) stateSteps.push('categorias')
  if (marca) stateSteps.push('marcas')
  if (categoriaGrupo) {
    stateSteps.push('categorias_grupo')
    if (subcategoria) stateSteps.push('subcategorias')
  } else {
    if (gama) stateSteps.push('gamas')
    if (tipo) stateSteps.push('tipos')
  }
  if (gamaComercial) stateSteps.push('gamas_comerciales')
  if (subgama) stateSteps.push('subgamas')
  if (referencia) stateSteps.push('referencias')

  if (breadcrumbIndex >= stateSteps.length) return
  const stepToClear = stateSteps[breadcrumbIndex]

  // Clear everything AFTER this step
  switch (stepToClear) {
    case 'categorias':
      setMarca(null); setCategoriaGrupo(null); setSubcategoria(null)
      setGama(null); setTipo(null); setGamaComercial(null); setSubgama(null)
      setGamasComercialesDisponibles([]); setSubgamasDisponibles([])
      setReferencia(null); setReferenciasDisponibles([]); setGrupos({})
      break
    case 'marcas':
      setCategoriaGrupo(null); setSubcategoria(null)
      setGama(null); setTipo(null); setGamaComercial(null); setSubgama(null)
      setGamasComercialesDisponibles([]); setSubgamasDisponibles([])
      setReferencia(null); setReferenciasDisponibles([]); setGamasDisponibles([]); setTiposDisponibles([])
      break
    case 'categorias_grupo':
      setSubcategoria(null); setGamaComercial(null); setSubgama(null)
      setGamasComercialesDisponibles([]); setSubgamasDisponibles([])
      setReferencia(null); setReferenciasDisponibles([])
      break
    case 'subcategorias':
      setGamaComercial(null); setSubgama(null)
      setGamasComercialesDisponibles([]); setSubgamasDisponibles([])
      setReferencia(null); setReferenciasDisponibles([])
      break
    case 'gamas':
      setTipo(null); setGamaComercial(null); setSubgama(null)
      setGamasComercialesDisponibles([]); setSubgamasDisponibles([])
      setReferencia(null); setReferenciasDisponibles([]); setTiposDisponibles([])
      break
    case 'tipos':
      setGamaComercial(null); setSubgama(null)
      setGamasComercialesDisponibles([]); setSubgamasDisponibles([])
      setReferencia(null); setReferenciasDisponibles([])
      break
    case 'gamas_comerciales':
      setSubgama(null); setSubgamasDisponibles([])
      setReferencia(null); setReferenciasDisponibles([])
      break
    case 'subgamas':
      setReferencia(null); setReferenciasDisponibles([])
      break
  }

  // Determine paso to display
  const stepPasoMap = {
    categorias: 'categorias',
    marcas: 'marcas',
    categorias_grupo: 'categorias_grupo',
    subcategorias: 'subcategorias',
    gamas: 'gamas',
    tipos: 'tipos',
    gamas_comerciales: 'gamas_comerciales',
    subgamas: 'subgamas',
    referencias: 'referencias',
  }

  setPaso(stepPasoMap[stepToClear] || 'categorias')
  setHistorial(historial.slice(0, breadcrumbIndex))

  // Reload data for the target step if needed
  if (stepToClear === 'categorias_grupo' && marca && categoria && Object.keys(grupos).length === 0) {
    catalogService.getSubfamiliasConTipos(marca, categoria).then(pares => {
      const g = construirGrupos(pares)
      setGrupos(g)
    }).catch(err => console.error('Error reloading groups:', err))
  }
  if (stepToClear === 'gamas' && marca && categoria && gamasDisponibles.length === 0) {
    catalogService.getGamasPorMarcaYCategoria(marca, categoria).then(data => {
      setGamasDisponibles(data.map(g => g.nombre))
    }).catch(err => console.error('Error reloading gamas:', err))
  }
 }, [historial, categoria, marca, gama, tipo, categoriaGrupo, subcategoria, gamaComercial, subgama, referencia, grupos, gamasDisponibles])

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
      const fam = ficha.familia || ficha.category
      const mar = ficha.marca || ficha.brand
      setCategoria(fam)
      setMarca(mar)
      setGamaComercial(ficha.Gama || null)
      setSubgama(ficha.Subgama || null)
      setReferencia(ficha)
      setPaso('ficha')
      setHistorial(prev => [...prev, { paso: 'categorias' }])
      setCargando(false)
      cargarInfoIA(ficha)

      // Load intermediate navigation state in background
      if (fam && mar) {
        try {
          const pares = await catalogService.getSubfamiliasConTipos(mar, fam)
          const g = construirGrupos(pares)
          if (Object.keys(g).length > 0) {
            setGrupos(g)
            for (const [catName, catData] of Object.entries(g)) {
              for (const [subName, filtros] of Object.entries(catData.subcategorias)) {
                const matches = filtros.some(f =>
                  f.subfamilia === ficha.subfamilia && f.tipo === ficha.tipo
                )
                if (matches) {
                  setCategoriaGrupo(catName)
                  setSubcategoria(subName)
                  break
                }
              }
            }
          } else {
            const data = await catalogService.getGamasPorMarcaYCategoria(mar, fam)
            setGamasDisponibles(data.map(g => g.nombre))
            setGama(ficha.subfamilia || null)
            setTipo(ficha.tipo || null)
          }
        } catch (e) {
          console.warn('Error loading intermediate state:', e)
        }
      }
      return true
     }
     const porNombre = await catalogService.buscarProductos(refId)
     if (porNombre && porNombre.length > 0) {
      if (porNombre.length === 1) {
       const f = porNombre[0]
       const fam = f.familia || f.category
       const mar = f.marca || f.brand
       setCategoria(fam)
       setMarca(mar)
       setGamaComercial(f.Gama || null)
       setSubgama(f.Subgama || null)
       setReferencia(f)
       setPaso('ficha')
       setHistorial(prev => [...prev, { paso: 'categorias' }])
       setCargando(false)
       cargarInfoIA(f)

       // Load intermediate state
       if (fam && mar) {
         try {
           const pares = await catalogService.getSubfamiliasConTipos(mar, fam)
           const g = construirGrupos(pares)
           if (Object.keys(g).length > 0) {
             setGrupos(g)
             for (const [catName, catData] of Object.entries(g)) {
               for (const [subName, filtros] of Object.entries(catData.subcategorias)) {
                 const matches = filtros.some(fi =>
                   fi.subfamilia === f.subfamilia && fi.tipo === f.tipo
                 )
                 if (matches) {
                   setCategoriaGrupo(catName)
                   setSubcategoria(subName)
                   break
                 }
               }
             }
           } else {
             const data = await catalogService.getGamasPorMarcaYCategoria(mar, fam)
             setGamasDisponibles(data.map(g => g.nombre))
             setGama(f.subfamilia || null)
             setTipo(f.tipo || null)
           }
         } catch (e) {
           console.warn('Error loading intermediate state:', e)
         }
       }
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

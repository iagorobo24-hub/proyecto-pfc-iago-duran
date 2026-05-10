/**
 * Hook para navegación jerárquica PROFUNDA conectado a Supabase
 * Flujo: Categoría (N1) → MARCA → Gama (N2) → Tipo (N3) → Referencia
 */
import { useState, useCallback, useMemo, useEffect } from 'react'
import catalogService, { getCategorias } from '../services/catalogService'
import { useToast } from '../contexts/ToastContext'

export default function useNavegacionFichas() {
 const { toast } = useToast()
 
 // Estados de navegación
 const [paso, setPaso] = useState('categorias')
 const [categorias, setCategorias] = useState([])
 const [categoria, setCategoria] = useState(null)
 const [marca, setMarca] = useState(null)
 const [gama, setGama] = useState(null)
 const [tipo, setTipo] = useState(null)
 const [referencia, setReferencia] = useState(null)

 const [marcasDisponibles, setMarcasDisponibles] = useState([])
 const [gamasDisponibles, setGamasDisponibles] = useState([])
 const [tiposDisponibles, setTiposDisponibles] = useState([])
 const [referenciasDisponibles, setReferenciasDisponibles] = useState([])
 const [cargando, setCargando] = useState(false)
 const [error, setError] = useState(null)
 const [historial, setHistorial] = useState([])

 // Cargar categorías desde Supabase al montar
 useEffect(() => {
  async function loadCategorias() {
   setCargando(true)
   setError(null)
   try {
    const cats = await getCategorias()
    setCategorias(cats)
    if (cats.length === 0) {
     setError('No se pudieron cargar las categorías')
     toast.error('Error al cargar categorías')
    }
   } catch (err) {
    setError(err.message || 'Error al cargar categorías')
    toast.error(err.message || 'Error al cargar categorías')
   } finally {
    setCargando(false)
   }
  }
  loadCategorias()
 }, [toast])

 // 1. Cargar Marcas al seleccionar Categoría
 useEffect(() => {
  if (!categoria) return;
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const data = await catalogService.getMarcasPorCategoria(categoria)
    setMarcasDisponibles(data)
    if (data.length === 0) {
     toast.info(`La categoría ${categoria} no tiene productos sincronizados.`, { id: 'no-data' })
    }
   } catch (err) {
    setError(err.message || 'Error al cargar marcas')
    toast.error(err.message || 'Error al cargar marcas')
   } finally {
    setCargando(false)
   }
  }
  load()
 }, [categoria, toast])

 // 2. Cargar Gamas al seleccionar Marca
 useEffect(() => {
  if (!categoria || !marca) return;
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const data = await catalogService.getGamasPorMarcaYCategoria(marca, categoria)
    setGamasDisponibles(data.map(g => g.nombre))
   } catch (err) {
    setError(err.message || 'Error al cargar gamas')
    toast.error(err.message || 'Error al cargar gamas')
   } finally {
    setCargando(false)
   }
  }
  load()
 }, [categoria, marca])

 // 3. Cargar Tipos al seleccionar Gama
 useEffect(() => {
  if (!categoria || !marca || !gama) return;
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const data = await catalogService.getTiposPorGamaMarcaYFamilia(gama, marca, categoria)
    setTiposDisponibles(data)
   } catch (err) {
    setError(err.message || 'Error al cargar tipos')
    toast.error(err.message || 'Error al cargar tipos')
   } finally {
    setCargando(false)
   }
  }
  load()
 }, [categoria, marca, gama])

 // 4. Cargar Productos al seleccionar Tipo
 useEffect(() => {
  if (!categoria || !marca || !gama || !tipo) return;
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const products = await catalogService.getProductosPorFiltro(categoria, marca, gama, tipo)
    setReferenciasDisponibles(products)
   } catch (err) {
    setError(err.message || 'Error al cargar productos')
    toast.error(err.message || 'Error al cargar productos')
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

 const seleccionarGama = useCallback((gamaNombre) => {
  setGama(gamaNombre)
  setTipo(null)
  setReferencia(null)
  setPaso('tipos')
  setHistorial(prev => [...prev, { paso: 'gamas' }])
 }, [])

 const seleccionarTipo = useCallback((tipoNombre) => {
  setTipo(tipoNombre)
  setReferencia(null)
  setPaso('referencias')
  setHistorial(prev => [...prev, { paso: 'tipos' }])
 }, [])

 const seleccionarReferencia = useCallback(async (refId) => {
  setCargando(true)
  setError(null)
  try {
   const ficha = await catalogService.getProductoPorRef(refId)
   setReferencia(ficha)
   setPaso('ficha')
   setHistorial(prev => [...prev, { paso: 'referencias' }])
  } catch (err) {
   setError(err.message || 'Error al cargar ficha')
   toast.error(err.message || 'Error al cargar ficha')
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
  setReferencia(null)
  setHistorial([])
 }, [])

 const buscarReferenciaDirecta = useCallback(async (refId) => {
  if (!refId) return false
  setCargando(true)
  setError(null)
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
    return true
   }
  } catch (e) {
   setError(e.message || 'Error en búsqueda directa')
  }
  setCargando(false)
  return false
 }, [])

 const breadcrumb = useMemo(() => {
  const b = []
  if (categoria) b.push(categoria)
  if (marca) b.push(marca)
  if (gama) b.push(gama)
  if (tipo) b.push(tipo)
  return b
 }, [categoria, marca, gama, tipo])

 return {
  paso, categoria, marca, gama, tipo, referencia, historial, cargando, error,
  categorias, marcasDisponibles, gamasDisponibles, tiposDisponibles, referenciasDisponibles,
  breadcrumb, seleccionarCategoria, seleccionarMarca, seleccionarGama, seleccionarTipo,
  seleccionarReferencia, volver, reiniciar, buscarReferenciaDirecta
 }
}

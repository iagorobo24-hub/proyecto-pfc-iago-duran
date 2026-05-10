/**
 * Hook para navegación jerárquica conectado a Supabase
 * Flujo: Categoría → Marca → Gama → Tipo → Referencia
 */
import { useState, useCallback, useMemo, useEffect } from 'react'
import catalogService from '../services/catalogService'
import { useToast } from '../contexts/ToastContext'

export default function useNavegacionFichas() {
 const { toast } = useToast()
 
 // Estados
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

 // Cargar categorías al montar
 useEffect(() => {
  async function load() {
   setCargando(true)
   try {
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

 // Cargar marcas al seleccionar categoría
 useEffect(() => {
  if (!categoria) return;
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const data = await catalogService.getMarcasPorCategoria(categoria)
    setMarcasDisponibles(data)
    if (data.length === 0) {
     console.log('ℹ️', categoria, 'no tiene marcas')
    }
   } catch (err) {
    console.error('Error cargando marcas:', err)
    setError('Error al cargar marcas')
   } finally {
    setCargando(false)
   }
  }
  load()
 }, [categoria])

 // Cargar gamas al seleccionar marca
 useEffect(() => {
  if (!categoria || !marca) return;
  async function load() {
   setCargando(true)
   setError(null)
   try {
    const data = await catalogService.getGamasPorMarcaYCategoria(marca, categoria)
    setGamasDisponibles(data.map(g => g.nombre))
   } catch (err) {
    console.error('Error cargando gamas:', err)
    setError('Error al cargar gamas')
   } finally {
    setCargando(false)
   }
  }
  load()
 }, [categoria, marca])

 // Cargar tipos al seleccionar gama
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

 // Cargar productos al seleccionar tipo
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

 // Funciones de navegación
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
  setReferencia(null)
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
    setGama(ficha.gama || ficha.subfamily)
    setTipo(ficha.tipo || ficha.type)
    setReferencia(ficha)
    setPaso('ficha')
    setHistorial(prev => [...prev, { paso: 'categorias' }])
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

import { useState, useEffect, useCallback, useRef } from 'react'
import { Outlet, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import catalogService from '../../services/catalogService'
import { getCategoriaMeta } from '../../data/categories'
import usePresupuestos from '../../hooks/usePresupuestos'
import PresupuestosContext from './PresupuestosContext'
import styles from '../../tools/Presupuestos.module.css'

const genNum = () => {
  const d = new Date()
  return `SNP-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`
}

export default function PresupuestosLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()

  const hook = usePresupuestos()
  const [numPresupuesto, setNumPresupuesto] = useState(genNum())
  const [categorias, setCategorias] = useState([])
  const [consulta, setConsulta] = useState('')
  const [sugerenciasBusqueda, setSugerenciasBusqueda] = useState([])
  const [busquedaCargando, setBusquedaCargando] = useState(false)
  const debounceRef = useRef(null)
  const processedImportRef = useRef('')

  useEffect(() => {
    catalogService.getCategorias().then(dbCats => {
      const enriched = dbCats.map(cat => {
        const meta = getCategoriaMeta(cat.id)
        return { id: cat.id, label: meta.label || cat.label || cat.id, icon: meta.icon || cat.icon || '📁' }
      })
      setCategorias(enriched)
    }).catch(() => setCategorias([]))
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (consulta.trim().length >= 2) {
      setBusquedaCargando(true)
      debounceRef.current = setTimeout(async () => {
        const results = await catalogService.buscarProductos(consulta)
        setSugerenciasBusqueda(results)
        setBusquedaCargando(false)
      }, 250)
    } else {
      setSugerenciasBusqueda([])
      setBusquedaCargando(false)
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [consulta])

  useEffect(() => {
    const nuevo = searchParams.get('nuevo') === '1'
    const productoParam = searchParams.get('producto')
    const referencia = searchParams.get('referencia')
    const precioParam = searchParams.get('precio')
    const importKey = `${nuevo ? 'nuevo' : 'add'}:${referencia || ''}:${productoParam || ''}`

    if (!referencia || processedImportRef.current === importKey) return
    processedImportRef.current = importKey

    let cancelled = false
    async function importFromQuery() {
      let producto = productoParam
      let precio = parseFloat(precioParam) || 0

      if (!producto) {
        const catalogProduct = await catalogService.getProductoPorRef(referencia)
        if (cancelled) return
        if (catalogProduct) {
          producto = catalogProduct.name
          precio = precio || catalogProduct.precio || 0
        }
      }

      if (nuevo) {
        hook.dispatchPartidas({ type: 'CLEAR' })
        hook.setCategoria('')
        setNumPresupuesto(genNum())
      }

      hook.dispatchPartidas({
        type: 'ADD_FROM_CATALOG',
        ref: referencia,
        desc: producto || referencia,
        precio,
      })
      toast.show(`${referencia} añadido al presupuesto`, 'success')
      navigate('/app/presupuestos/editor', { replace: true })
    }

    importFromQuery()
    return () => { cancelled = true }
  }, [searchParams, hook.dispatchPartidas, hook.setCategoria, navigate, toast])

  const guardarPresupuesto = useCallback(() => {
    if (hook.partidas.length === 0) { toast.show('Añade al menos un producto', 'error'); return }
    const presupuesto = {
      id: numPresupuesto,
      numero: numPresupuesto,
      fecha: new Date().toISOString(),
      fechaCreacion: new Date().toISOString(),
      cliente: hook.datosCliente,
      partidas: hook.partidas,
      categoria: hook.categoria,
      total: hook.partidas.reduce((s, p) => s + p.precio_total, 0),
      totales: hook.calcularTotales(),
      datos: hook.datosCliente,
    }
    const nuevo = [presupuesto, ...hook.historial].slice(0, 20)
    hook.setHistorial(nuevo)
    toast.show('Presupuesto guardado', 'success')
  }, [hook, numPresupuesto, toast])

  const cargarPresupuesto = useCallback((h) => {
    hook.dispatchPartidas({ type: 'SET', payload: h.partidas || [] })
    hook.setDatosCliente(h.cliente || hook.datosCliente)
    setNumPresupuesto(h.numero)
    hook.setCategoria(h.categoria || '')
    navigate('/app/presupuestos/editor')
  }, [hook, navigate])

  const eliminarPresupuesto = useCallback((index) => {
    const nuevo = hook.historial.filter((_, i) => i !== index)
    hook.setHistorial(nuevo)
    toast.show('Presupuesto eliminado', 'success')
  }, [hook, toast])

  const totalBase = hook.partidas.reduce((s, p) => s + p.precio_total, 0)
  const ivaAmount = totalBase * (hook.datosCliente.iva / 100)
  const totalFinal = totalBase + ivaAmount

  const handleCategoriaClick = useCallback((catId) => {
    hook.setCategoria(catId)
    if (!location.pathname.includes('seleccion')) {
      navigate('/app/presupuestos/seleccion')
    }
  }, [hook.setCategoria, navigate, location.pathname])

  const handleSearchResultClick = useCallback((p) => {
    const key = p.ref_fabricante || p.ref
    hook.dispatchPartidas({ type: 'ADD_FROM_CATALOG', ref: key, desc: p.name || p.desc, precio: p.precio || 0 })
    toast.show(`${key} añadido al presupuesto`, 'success')
    setConsulta('')
    setSugerenciasBusqueda([])
  }, [hook.dispatchPartidas, toast])

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && sugerenciasBusqueda.length > 0) {
      handleSearchResultClick(sugerenciasBusqueda[0])
    }
  }, [sugerenciasBusqueda, handleSearchResultClick])

  const isActive = (catId) => hook.categoria === catId
  const isGestionActive = location.pathname.includes('gestion')

  const value = {
    ...hook,
    historial: hook.historial,
    numPresupuesto,
    setNumPresupuesto,
    totalBase,
    ivaAmount,
    totalFinal,
    guardarPresupuesto,
    cargarPresupuesto,
    eliminarPresupuesto,
    genNum,
  }

  return (
    <PresupuestosContext.Provider value={value}>
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Presupuestos">
          <div className={styles.sidebar__search} role="search">
            <input
              className={styles.sidebar__searchInput}
              value={consulta}
              onChange={e => setConsulta(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar referencia..."
              aria-label="Buscar producto por referencia o nombre"
              aria-autocomplete="list"
              autoComplete="off"
            />
            {sugerenciasBusqueda.length > 0 && (
              <ul className={styles.sidebar__sugerencias} role="listbox" aria-label="Sugerencias de búsqueda">
                {sugerenciasBusqueda.map(p => (
                  <li
                    key={p.id}
                    className={styles.sidebar__sugerenciaItem}
                    role="option"
                    tabIndex={0}
                    onClick={() => handleSearchResultClick(p)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSearchResultClick(p) }}
                  >
                    <span className={styles.sidebar__sugerenciaRef}>{p.ref_fabricante}</span>
                    <span className={styles.sidebar__sugerenciaName}>{p.name}</span>
                    <span className={styles.sidebar__sugerenciaMarca}>{p.marca}</span>
                  </li>
                ))}
              </ul>
            )}
            {busquedaCargando && <div className={styles.sidebar__busquedaCargando}>Buscando...</div>}
          </div>
          <div className={styles.sidebar__label} id="presup-categories-label">Categorías</div>
          <nav aria-labelledby="presup-categories-label">
            {categorias.map(c => (
              <button
                key={c.id}
                className={`${styles.sidebar__catBtn} ${isActive(c.id) ? styles.sidebar__catBtnActive : ''}`}
                onClick={() => handleCategoriaClick(c.id)}
                aria-pressed={isActive(c.id)}
                aria-label={`Seleccionar ${c.label}`}
              >
                <div className={styles.sidebar__catBtn__icon} aria-hidden="true">{c.icon}</div>
                <div className={styles.sidebar__catBtn__info}>
                  <div className={styles.sidebar__catBtn__name}>{c.label}</div>
                  <div className={styles.sidebar__catBtn__count}>Ver catálogo</div>
                </div>
              </button>
            ))}
          </nav>

          <div className={styles.sidebar__actions}>
            <button
              className={`${styles.sidebar__actionBtn} ${location.pathname === '/app/presupuestos' && !hook.categoria ? styles.sidebar__actionBtnActive : ''}`}
              onClick={() => { hook.setCategoria(''); hook.dispatchPartidas({ type: 'CLEAR' }); navigate('/app/presupuestos') }}
            >
              <span aria-hidden="true">💰</span>
              Nuevo presupuesto
            </button>
            <button
              className={`${styles.sidebar__actionBtn} ${isGestionActive ? styles.sidebar__actionBtnActive : ''}`}
              onClick={() => navigate('/app/presupuestos/gestion')}
            >
              <span aria-hidden="true">📋</span>
              Gestión ({hook.historial.length})
            </button>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.main__content}>
            <Outlet />
          </div>
        </main>
      </div>
    </PresupuestosContext.Provider>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { Outlet, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import catalogService from '../../services/catalogService'
import { getCategoriaMeta } from '../../data/categoryMapping'
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
    const producto = searchParams.get('producto')
    const referencia = searchParams.get('referencia')
    const precio = searchParams.get('precio')
    if (producto && referencia) {
      hook.dispatchPartidas({ type: 'ADD_FROM_CATALOG', ref: referencia, desc: producto, precio: parseFloat(precio) || 0 })
      navigate('/app/presupuestos/editor', { replace: true })
    }
  }, [])

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

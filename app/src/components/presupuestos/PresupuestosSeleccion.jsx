import { useState, useEffect, useMemo } from 'react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FULL_CATEGORY_INFO } from '../../data/categoryMapping'
import catalogService from '../../services/catalogService'
import Button from '../ui/Button'
import { usePresupuestosContext } from './PresupuestosContext'
import styles from '../../tools/Presupuestos.module.css'

const CATEGORIAS = Object.keys(FULL_CATEGORY_INFO).map(key => ({
  id: key,
  label: key,
  icon: FULL_CATEGORY_INFO[key].icon,
}))

export default function PresupuestosSeleccion() {
  const navigate = useNavigate()
  const { categoria, partidas, dispatchPartidas, totalBase } = usePresupuestosContext()

  const [marca, setMarca] = useState(null)
  const [gama, setGama] = useState(null)
  const [tipo, setTipo] = useState(null)
  const [marcasDisponibles, setMarcasDisponibles] = useState([])
  const [gamasDisponibles, setGamasDisponibles] = useState([])
  const [tiposDisponibles, setTiposDisponibles] = useState([])
  const [productosDisponibles, setProductosDisponibles] = useState([])
  const [pasoCatalogo, setPasoCatalogo] = useState('marcas')
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false)
  const [filtroCatalogo, setFiltroCatalogo] = useState('')
  const [anadidos, setAnadidos] = useState({})

  useEffect(() => {
    console.log('[PresupuestosSeleccion] useEffect[ categoria] — categoria:', categoria)
    setCargandoCatalogo(true)
    catalogService.getMarcasPorCategoria(categoria).then(data => {
      console.log('[PresupuestosSeleccion] Marcas loaded:', data.length, data.slice(0, 3))
      setMarcasDisponibles(data)
      setPasoCatalogo('marcas')
      setCargandoCatalogo(false)
    }).catch(err => {
      console.error('[PresupuestosSeleccion] Error loading marcas:', err)
      setCargandoCatalogo(false)
    })
  }, [categoria])

  useEffect(() => {
    if (!marca) return
    setCargandoCatalogo(true)
    catalogService.getGamasPorMarcaYCategoria(marca, categoria).then(data => {
      setGamasDisponibles(data.map(g => g.nombre))
      setCargandoCatalogo(false)
    })
  }, [categoria, marca])

  useEffect(() => {
    if (!marca || !gama) return
    setCargandoCatalogo(true)
    catalogService.getTiposPorGamaMarcaYFamilia(gama, marca, categoria).then(data => {
      setTiposDisponibles(data)
      setCargandoCatalogo(false)
    })
  }, [categoria, marca, gama])

  useEffect(() => {
    if (!marca || !gama || !tipo) return
    setCargandoCatalogo(true)
    catalogService.getProductosPorFiltro(categoria, marca, gama, tipo).then(data => {
      setProductosDisponibles(data)
      setCargandoCatalogo(false)
    })
  }, [categoria, marca, gama, tipo])

  const anadirProducto = (prod) => {
    const key = prod.ref_fabricante || prod.ref
    dispatchPartidas({ type: 'ADD_FROM_CATALOG', ref: key, desc: prod.name || prod.desc, precio: prod.precio })
    setAnadidos(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
  }

  const breadcrumbItems = useMemo(() => {
    const items = []
    items.push({
      label: CATEGORIAS.find(c => c.id === categoria)?.label || 'Seleccionar',
      onClick: () => { setMarca(null); setGama(null); setTipo(null); setProductosDisponibles([]); setPasoCatalogo('marcas') },
    })
    if (marca) items.push({
      label: marca,
      onClick: () => { setGama(null); setTipo(null); setProductosDisponibles([]); setPasoCatalogo('gamas') },
    })
    if (gama) items.push({
      label: gama,
      onClick: () => { setTipo(null); setProductosDisponibles([]); setPasoCatalogo('tipos') },
    })
    if (tipo) items.push({ label: tipo, current: true })
    return items
  }, [categoria, marca, gama, tipo])

  const renderBreadcrumb = () => (
    <div className={styles.breadcrumb}>
      {breadcrumbItems.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className={styles.breadcrumb__sep}>›</span>}
          {item.onClick ? (
            <button className={styles.breadcrumb__link} onClick={item.onClick}>{item.label}</button>
          ) : (
            <span className={styles.breadcrumb__current}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )

  const catLabel = CATEGORIAS.find(c => c.id === categoria)?.label || ''

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <span aria-hidden="true">{CATEGORIAS.find(c => c.id === categoria)?.icon}</span>
          {' '}{catLabel}
        </h1>
        <p className={styles.pageSubtitle}>Selecciona marca, gama y tipo para encontrar productos</p>
      </div>

      {renderBreadcrumb()}

      {cargandoCatalogo && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
          Cargando catálogo...
        </div>
      )}

      {!cargandoCatalogo && pasoCatalogo === 'marcas' && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Selecciona una marca
          </h3>
          <div className={styles.catalogGrid}>
            {marcasDisponibles.map(m => (
              <button
                key={m.nombre}
                className={styles.productCard}
                onClick={() => { setMarca(m.nombre); setPasoCatalogo('gamas') }}
              >
                <div className={styles.productCard__ref}>{m.nombre}</div>
                <div className={styles.productCard__desc}>Ver gamas disponibles</div>
              </button>
            ))}
            {marcasDisponibles.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyState__icon}>📭</div>
                <div className={styles.emptyState__title}>Sin marcas</div>
                <div className={styles.emptyState__text}>No hay marcas disponibles en esta categoría</div>
              </div>
            )}
          </div>
        </div>
      )}

      {!cargandoCatalogo && pasoCatalogo === 'gamas' && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Selecciona una gama
          </h3>
          <div className={styles.catalogGrid}>
            {gamasDisponibles.map(g => (
              <button
                key={g}
                className={styles.productCard}
                onClick={() => { setGama(g); setPasoCatalogo('tipos') }}
              >
                <div className={styles.productCard__ref}>{g}</div>
                <div className={styles.productCard__desc}>Ver tipos de producto</div>
              </button>
            ))}
            {gamasDisponibles.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyState__icon}>📭</div>
                <div className={styles.emptyState__title}>Sin gamas</div>
                <div className={styles.emptyState__text}>No hay gamas disponibles para esta marca</div>
              </div>
            )}
          </div>
        </div>
      )}

      {!cargandoCatalogo && pasoCatalogo === 'tipos' && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Selecciona un tipo
          </h3>
          <div className={styles.catalogGrid}>
            {tiposDisponibles.map(t => (
              <button
                key={t}
                className={styles.productCard}
                onClick={() => { setTipo(t); setPasoCatalogo('productos') }}
              >
                <div className={styles.productCard__ref}>{t}</div>
                <div className={styles.productCard__desc}>Ver productos</div>
              </button>
            ))}
            {tiposDisponibles.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyState__icon}>📭</div>
                <div className={styles.emptyState__title}>Sin tipos</div>
                <div className={styles.emptyState__text}>No hay tipos disponibles para esta gama</div>
              </div>
            )}
          </div>
        </div>
      )}

      {!cargandoCatalogo && pasoCatalogo === 'productos' && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {productosDisponibles.length} producto{productosDisponibles.length !== 1 ? 's' : ''}
            </h3>
            <div className={styles.catalogSearch} style={{ maxWidth: '300px' }}>
              <input
                className={styles.catalogSearch__input}
                placeholder="Filtrar productos..."
                value={filtroCatalogo}
                onChange={e => setFiltroCatalogo(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.catalogGrid}>
            {(filtroCatalogo
              ? productosDisponibles.filter(p =>
                  (p.ref_fabricante || '').toLowerCase().includes(filtroCatalogo.toLowerCase()) ||
                  (p.name || '').toLowerCase().includes(filtroCatalogo.toLowerCase())
                )
              : productosDisponibles
            ).map(prod => {
              const key = prod.ref_fabricante || prod.ref
              const vecesAnadido = anadidos[key] || 0
              return (
                <button
                  key={prod.id || key}
                  className={`${styles.productCard} ${vecesAnadido > 0 ? styles['productCard--popular'] : ''}`}
                  onClick={() => anadirProducto(prod)}
                >
                  <div className={styles.productCard__ref}>{key}</div>
                  <div className={styles.productCard__desc}>{prod.name || ''}</div>
                  <div className={styles.productCard__price}>{prod.precio ? `${prod.precio.toFixed(2)} €` : '—'}</div>
                  {vecesAnadido > 0 && (
                    <span className={styles.productCard__added}>✓ ×{vecesAnadido}</span>
                  )}
                  {prod.imagen && (
                    <img
                      src={prod.imagen}
                      alt={key}
                      style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', marginTop: '8px', alignSelf: 'center' }}
                    />
                  )}
                </button>
              )
            })}
            {productosDisponibles.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyState__icon}>📭</div>
                <div className={styles.emptyState__title}>Sin productos</div>
                <div className={styles.emptyState__text}>No hay productos disponibles para esta selección</div>
              </div>
            )}
          </div>
        </div>
      )}

      {pasoCatalogo !== 'marcas' && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Button variant="ghost" size="sm" onClick={() => {
            if (pasoCatalogo === 'productos') { setTipo(null); setProductosDisponibles([]); setPasoCatalogo('tipos') }
            else if (pasoCatalogo === 'tipos') { setGama(null); setProductosDisponibles([]); setPasoCatalogo('gamas') }
            else if (pasoCatalogo === 'gamas') { setMarca(null); setProductosDisponibles([]); setPasoCatalogo('marcas') }
          }}>
            ← Volver
          </Button>
        </div>
      )}

      {partidas.length > 0 && (
        <div className={styles.catalogBar}>
          <div className={styles.catalogBar__info}>
            <span>{partidas.length} producto{partidas.length > 1 ? 's' : ''} añadido{partidas.length > 1 ? 's' : ''}</span>
            <span className={styles.catalogBar__total}>{totalBase.toFixed(2)} €</span>
          </div>
          <div className={styles.catalogBar__actions}>
            <Button variant="secondary" size="md" onClick={() => navigate('/app/presupuestos')}>
              Cambiar categoría
            </Button>
            <Button variant="primary" size="md" onClick={() => navigate('editor')}>
              Ir al presupuesto →
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

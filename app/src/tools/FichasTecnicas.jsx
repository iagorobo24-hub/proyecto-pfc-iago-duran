import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import useFichasTecnicas from '../hooks/useFichasTecnicas'
import useNavegacionFichas from '../hooks/useNavegacionFichas'
import { FULL_CATEGORY_INFO } from '../data/categoryMapping'
import { getEtiquetaSubcategoria } from '../data/etiquetasSubcategoria'
import { MARCAS } from '../data/marcasLogos'
import { getBrandLogo, getBrandColor, getBrandLogoData } from '../services/brandLogoService'
import Button from '../components/ui/Button'
import { sanitizeUrl } from '../services/anthropicService'
import Input from '../components/ui/Input'
import {
  CircleCenter,
  OrbitRing,
  OrbitRow,
  BrandCard,
  GamaCard,
  RefCard,
  FichaCard,
  TipCard,
  Breadcrumb,
  ViewToggle
} from '../components/ui/CircleLayout'
import ProductTable, { supportsTableView } from '../components/ui/ProductTable'
import { extractCurve, extractAmps, extractPoles, POLA_ORDER } from '../hooks/useProductTable'
import styles from './FichasTecnicas.module.css'

/* Componente Skeleton con atributos de accesibilidad */
const SkeletonCard = ({ type = 'brand' }) => {
  const baseStyle = {
    background: 'linear-gradient(90deg, var(--gray-100) 25%, var(--gray-50) 50%, var(--gray-100) 75%)',
    backgroundSize: '200% 100%',
    animation: `${styles.shimmer} 1.5s infinite`,
    borderRadius: '12px',
  }

  if (type === 'brand') return <div style={{ ...baseStyle, width: '120px', height: '140px' }} aria-hidden="true" />
  if (type === 'gama') return <div style={{ ...baseStyle, width: '100%', height: '60px', marginBottom: '12px' }} aria-hidden="true" />
  if (type === 'ref') return <div style={{ ...baseStyle, width: '180px', height: '100px' }} aria-hidden="true" />
  return <div style={{ ...baseStyle, width: '100%', height: '200px' }} aria-hidden="true" />
}

export default function FichasTecnicas() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    paso, categoria, marca, gamaComercial, subgama, gama, tipo, categoriaGrupo, subcategoria, grupos,
    referencia,
    categorias, marcasDisponibles, gamasDisponibles,
    tiposDisponibles, gamasComercialesDisponibles, subgamasDisponibles, referenciasDisponibles,
    breadcrumb, cargando: navegacionCargando, sugerenciasBusqueda, busquedaCargando,
    seleccionarCategoria, seleccionarMarca, seleccionarGama,
    seleccionarTipo, seleccionarCategoriaGrupo, seleccionarSubcategoria, seleccionarGamaComercial, seleccionarSubgama,
    seleccionarReferencia, volver, irAPaso, reiniciar,
    buscarReferenciaDirecta, buscarPorNombre, aiFicha, aiCargando,
  } = useNavegacionFichas()

  const {
    consulta,
    setConsulta,
    resultado,
    resultadosBusqueda,
    error,
    cargando: busquedaIACargando,
    buscar,
  } = useFichasTecnicas()

  const [modo, setModo] = React.useState('navegacion')
  const [refFilter, setRefFilter] = React.useState('')
  const debounceRef = React.useRef(null)

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (consulta.trim().length >= 2) {
      debounceRef.current = setTimeout(() => buscarPorNombre(consulta), 250)
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [consulta, buscarPorNombre])
  
  const catInfo = FULL_CATEGORY_INFO[categoria] || {}
  const isCargando = navegacionCargando || busquedaIACargando

  const copiarReferencia = (ref) => {
    navigator.clipboard.writeText(ref)
    toast.show(`Referencia "${ref}" copiada`, 'success')
  }

  const añadirPresupuesto = (ficha) => {
    if (!ficha) return
    const params = new URLSearchParams({
      producto: ficha.name || ficha.desc || ficha.nombre || '',
      referencia: ficha.ref_fabricante || ficha.ref || '',
      precio: ficha.precio || '0',
    })
    navigate(`/app/presupuestos?${params.toString()}`)
    toast.show(`${ficha.ref_fabricante || ficha.ref} añadido al presupuesto`, 'success')
  }

  const abrirPDF = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const getUrlFabricante = (prod) => {
    if (!prod) return null
    // Priorizar enlaces a página de producto en el array de documentos
    const docPágina = prod.documentos?.find(d => d.nombre?.toLowerCase().includes('página') || d.nombre?.toLowerCase().includes('enlace'))
    if (docPágina?.url) return docPágina.url
    // Fallback a cualquier hoja de datos
    const docFicha = prod.documentos?.find(d => d.nombre?.toLowerCase().includes('hoja') || d.url?.includes('prysmiangroup') || d.url?.includes('generalcable'))
    if (docFicha?.url) return docFicha.url
    // Fallback final al pdfUrl antiguo
    return prod.pdf_url || prod.pdfUrl
  }

  const marcasConLogo = marcasDisponibles.map(m => {
    const logoData = getBrandLogoData(m.nombre)
    return {
      ...m,
      logo: logoData.logo || '',
      logoFallback: logoData.initials,
      logoGradient: logoData.gradient,
      color: MARCAS[m.nombre]?.color || logoData.gradient
    }
  })

  /* ── Sidebar ─ */
  const renderSidebar = () => (
    <aside className={styles.sidebar} aria-label="Categorías de productos">
      {/* Buscador con sugerencias */}
      <div className={styles.sidebar__search} role="search">
        <input
          id="catalog-search"
          className={styles.sidebar__searchInput}
          value={consulta}
          onChange={e => setConsulta(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              buscarReferenciaDirecta(consulta).then(found => {
                if (!found) buscar()
              })
            }
          }}
          placeholder="Buscar referencia o nombre..."
          aria-label="Buscar producto por referencia o nombre comercial"
          aria-autocomplete="list"
          autoComplete="off"
        />
        {sugerenciasBusqueda.length > 0 && (
          <ul className={styles.sugerencias} role="listbox" aria-label="Sugerencias de búsqueda">
            {sugerenciasBusqueda.map(p => (
              <li
                key={p.id}
                className={styles.sugerenciaItem}
                role="option"
                tabIndex={0}
                onClick={() => {
                  seleccionarReferencia(p)
                  setConsulta('')
                }}
                onKeyDown={e => { if (e.key === 'Enter') { seleccionarReferencia(p); setConsulta('') } }}
              >
                <span className={styles.sugerenciaRef}>{p.ref_fabricante}</span>
                <span className={styles.sugerenciaName}>{p.name}</span>
                <span className={styles.sugerenciaMarca}>{p.marca}</span>
              </li>
            ))}
          </ul>
        )}
        {busquedaCargando && <div className={styles.busquedaCargando}>Buscando...</div>}
        <Button
          variant="primary"
          size="sm"
          loading={isCargando}
          onClick={() => {
            buscarReferenciaDirecta(consulta).then(found => {
              if (!found) buscar()
            })
          }}
          aria-label="Ejecutar búsqueda"
          style={{ width: '100%' }}
        >
          Buscar
        </Button>
      </div>

      <div className={styles.sidebar__label} id="categories-label">Categorías</div>
      <nav aria-labelledby="categories-label">
        {categorias.map(cat => (
          <button
            key={cat.id}
            className={`${styles.sidebar__catBtn} ${categoria === cat.id ? styles.sidebar__catBtnActive : ''}`}
            onClick={() => { seleccionarCategoria(cat.id); setModo('navegacion') }}
            aria-pressed={categoria === cat.id}
            aria-label={`Ver productos de ${cat.label}`}
          >
            <div className={styles.sidebar__catBtn__icon} aria-hidden="true">{cat.icon}</div>
            <div className={styles.sidebar__catBtn__info}>
              <div className={styles.sidebar__catBtn__name}>{cat.label}</div>
              <div className={styles.sidebar__catBtn__count}>Ver marcas</div>
            </div>
          </button>
        ))}
      </nav>
      <div className={styles.sidebar__footer}>
        <p className={styles.sidebar__footerText}>Proyectos PFC · Iago Durán</p>
        <p className={styles.sidebar__footerText}>PFC CFGS · 2026</p>
      </div>
    </aside>
  )

  /* ── Skeleton Loaders ─ */
  const renderSkeletons = () => (
    <div className={styles.circleLayout} aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Cargando catálogo...</span>
      <OrbitRing size="inner" className={styles.animPulse} />
      <div className={styles.orbitRows}>
        <OrbitRow>
          <SkeletonCard type={paso === 'gamas' ? 'gama' : 'brand'} />
          <SkeletonCard type={paso === 'gamas' ? 'gama' : 'brand'} />
        </OrbitRow>
        <OrbitRow>
          <SkeletonCard type={paso === 'gamas' ? 'gama' : 'brand'} />
        </OrbitRow>
      </div>
    </div>
  )

  /* ── Main content ─ */
  const renderMain = () => {
    if (isCargando) return renderSkeletons()

    /* Resultados múltiples de búsqueda real */
    if (resultadosBusqueda && resultadosBusqueda.length > 0) {
      return (
        <div className={styles.circleLayout}>
          <div className={styles.sectionHeader}>
            <span className={`${styles.label} ${styles['label--brand']}`}>{resultadosBusqueda.length} resultados encontrados</span>
            <h2 className={styles.sectionTitle}>Selecciona un producto</h2>
          </div>
          <div className={styles.orbitRows} role="list">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', width: '100%', padding: '20px' }}>
              {resultadosBusqueda.map(p => (
                <div key={p.ref} className={styles.aiCard} style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => seleccionarReferencia(p.ref)}>
                  <div className={styles.aiCard__name} style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{p.nombre}</div>
                  <div className={styles.aiCard__ref} style={{ color: 'var(--blue-600)', fontWeight: 'bold' }}>REF: {p.ref}</div>
                  <div className={styles.aiCard__specs}>
                    <span className={styles.aiCard__spec}>{p.marca}</span>
                    <span className={styles.aiCard__spec}>{p.precio}€</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    /* Estado vacío inicial */
    if (!categoria && modo === 'navegacion') {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyState__icon} aria-hidden="true">📋</div>
          <h2 className={styles.emptyState__title}>Fichas Técnicas</h2>
          <p className={styles.emptyState__desc}>
            Selecciona una categoría del panel izquierdo o busca por referencia para navegar por el catálogo.
          </p>
        </div>
      )
    }

    /* Marcas */
    if (paso === 'marcas') {
      return (
        <div className={styles.circleLayout}>
          <OrbitRing size="inner" className={styles.animPulse} aria-hidden="true" />
          <OrbitRing size="outer" className={styles.animPulse} aria-hidden="true" />

          <CircleCenter
            icon={catInfo.icon}
            title={categorias.find(c => c.id === categoria)?.label}
            desc={catInfo.desc}
            tip={catInfo.tip}
          />

          <div className={styles.orbitRows} role="list" aria-label="Marcas disponibles">
            <OrbitRow>
              {marcasConLogo.slice(0, 2).map(m => (
                <div key={m.nombre} role="listitem">
                  <BrandCard
                    logo={m.logo}
                    logoFallback={m.logoFallback}
                    logoGradient={m.logoGradient}
                    name={m.nombre}
                    count="Ver gamas"
                    onClick={() => seleccionarMarca(m.nombre)}
                  />
                </div>
              ))}
            </OrbitRow>
            {marcasConLogo.length > 2 && (
              <OrbitRow>
                {marcasConLogo.slice(2, 5).map(m => (
                  <div key={m.nombre} role="listitem">
                    <BrandCard
                      logo={m.logo}
                      logoFallback={m.logoFallback}
                      logoGradient={m.logoGradient}
                      name={m.nombre}
                      count="Ver gamas"
                      onClick={() => seleccionarMarca(m.nombre)}
                    />
                  </div>
                ))}
              </OrbitRow>
            )}
            {marcasConLogo.length === 0 && (
               <OrbitRow>
                 <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>No hay marcas disponibles.</p>
               </OrbitRow>
            )}
          </div>
        </div>
      )
    }

    /* Categorías agrupadas (DP flow) */
    if (paso === 'categorias_grupo') {
      const categoriasList = Object.entries(grupos)
      return (
        <div className={styles.circleLayout}>
          <CircleCenter
            icon={catInfo.icon}
            title="Elige categoría"
            desc={marca}
          />
          <div className={styles.orbitRows} role="list" aria-label="Categorías de producto">
            {categoriasList.map(([cat, info]) => (
              <OrbitRow key={cat} role="listitem">
                <button
                  className={styles.tipoCard}
                  onClick={() => seleccionarCategoriaGrupo(cat)}
                  aria-label={`Seleccionar categoría ${cat}`}
                >
                  <span aria-hidden="true" style={{ fontSize: '1.25rem', marginRight: '8px' }}>{info.icon}</span>
                  <span className={styles.tipoCard__name}>{cat}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </OrbitRow>
            ))}
            {categoriasList.length === 0 && (
              <OrbitRow>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>No hay categorías disponibles.</p>
              </OrbitRow>
            )}
          </div>
        </div>
      )
    }

    /* Subcategorías (DP flow) */
    if (paso === 'subcategorias' && categoriaGrupo && grupos[categoriaGrupo]) {
      const subcats = Object.entries(grupos[categoriaGrupo].subcategorias)
      return (
        <div className={styles.circleLayout}>
          <CircleCenter
            icon={grupos[categoriaGrupo]?.icon}
            title={categoriaGrupo}
            desc="Selecciona tipo de producto"
          />
          <div className={styles.orbitRows} role="list" aria-label="Subcategorías">
            {subcats.map(([subcat, filtros]) => (
              <OrbitRow key={subcat} role="listitem">
                <button
                  className={styles.tipoCard}
                  onClick={() => seleccionarSubcategoria(subcat)}
                  aria-label={`Seleccionar ${getEtiquetaSubcategoria(subcat)}`}
                >
                  <span className={styles.tipoCard__name}>{getEtiquetaSubcategoria(subcat)}</span>
                  <span className={styles.tipoCard__count}>{filtros.length} filtro{filtros.length !== 1 ? 's' : ''}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </OrbitRow>
            ))}
            {subcats.length === 0 && (
              <OrbitRow>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>No hay subcategorías disponibles.</p>
              </OrbitRow>
            )}
          </div>
        </div>
      )
    }

    /* Gamas comerciales */
    if (paso === 'gamas_comerciales') {
      return (
        <div className={styles.circleLayout}>
          <CircleCenter
            icon={catInfo.icon}
            title="Elige gama"
            desc={categoriaGrupo ? `${marca} › ${categoriaGrupo} › ${getEtiquetaSubcategoria(subcategoria)}` : `${marca} › ${gama} › ${tipo}`}
          />
          <div className={styles.orbitRows} role="list" aria-label="Gamas disponibles">
            {gamasComercialesDisponibles.length > 0 ? (
              gamasComercialesDisponibles.map(gc => (
                <OrbitRow key={gc} role="listitem">
                  <button
                    className={styles.tipoCard}
                    onClick={() => seleccionarGamaComercial(gc)}
                    aria-label={`Seleccionar gama ${gc}`}
                  >
                    <span className={styles.tipoCard__name}>{gc}</span>
                    <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                  </button>
                </OrbitRow>
              ))
            ) : (
              <OrbitRow>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Cargando gamas...</p>
              </OrbitRow>
            )}
          </div>
        </div>
      )
    }

    /* Subgamas */
    if (paso === 'subgamas') {
      return (
        <div className={styles.circleLayout}>
          <CircleCenter
            icon={catInfo.icon}
            title="Elige subgama"
            desc={categoriaGrupo ? `${marca} › ${categoriaGrupo} › ${getEtiquetaSubcategoria(subcategoria)}` : `${marca} › ${gama} › ${tipo}`}
          />
          <div className={styles.orbitRows} role="list" aria-label="Subgamas disponibles">
            {subgamasDisponibles.length > 0 ? (
              subgamasDisponibles.map(sg => (
                <OrbitRow key={sg} role="listitem">
                  <button
                    className={styles.tipoCard}
                    onClick={() => seleccionarSubgama(sg)}
                    aria-label={`Seleccionar subgama ${sg}`}
                  >
                    <span className={styles.tipoCard__name}>{sg}</span>
                    <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                  </button>
                </OrbitRow>
              ))
            ) : (
              <OrbitRow>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Cargando subgamas...</p>
              </OrbitRow>
            )}
          </div>
        </div>
      )
    }

    /* Gamas */
    if (paso === 'gamas') {
      return (
        <div className={styles.circleLayout}>
          <CircleCenter
            icon={catInfo.icon}
            title="Elige gama"
            desc={marca}
          />

          <div className={styles.orbitRows} role="list" aria-label={`Gamas de ${marca}`}>
            {gamasDisponibles.length > 0 ? (
              gamasDisponibles.map((gName, i) => (
                <OrbitRow key={gName} role="listitem">
                  <GamaCard
                    name={gName}
                    meta="Ver productos"
                    onClick={() => seleccionarGama(gName)}
                  />
                </OrbitRow>
              ))
            ) : (
              <OrbitRow>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>No hay gamas disponibles.</p>
              </OrbitRow>
            )}
          </div>
        </div>
      )
    }

    /* Tipos */
    if (paso === 'tipos') {
      return (
        <div className={styles.circleLayout}>
          <CircleCenter
            icon={catInfo.icon}
            title="Elige tipo"
            desc={`${gama} — ${marca}`}
          />

          <div className={styles.orbitRows} role="list" aria-label="Tipos de productos">
            {tiposDisponibles.map(t => (
              <OrbitRow key={t} role="listitem">
                <button
                  className={styles.tipoCard}
                  onClick={() => seleccionarTipo(t)}
                  aria-label={`Seleccionar tipo ${t}`}
                >
                  <span className={styles.tipoCard__name}>{t}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </OrbitRow>
            ))}
          </div>
        </div>
      )
    }

    /* Referencias */
    if (paso === 'referencias') {
      const soportaVistaAgrupada = supportsTableView(referenciasDisponibles)
      const esMagnetotermico = soportaVistaAgrupada && referenciasDisponibles.every(
        p => (p.subfamilia || '').trim() === 'Interruptor Magnetotérmico'
      )
      const filteredRefs = refFilter
        ? referenciasDisponibles.filter(p =>
            (p.ref_fabricante || '').toLowerCase().includes(refFilter.toLowerCase()) ||
            (p.name || '').toLowerCase().includes(refFilter.toLowerCase())
          )
        : referenciasDisponibles

      const CURVE_ORDER = ['B', 'C', 'D', 'K', 'MA', 'TMD', 'Z']
      const curveGroups = esMagnetotermico ? (() => {
        const groups = {}
        for (const p of referenciasDisponibles) {
          const curve = extractCurve(p.name || '') || '?'
          const amp = extractAmps(p.name || '')
          const poles = extractPoles(p.name || '') || '?'
          if (!groups[curve]) groups[curve] = { _poles: {} }
          if (!groups[curve]._poles[poles]) groups[curve]._poles[poles] = []
          groups[curve]._poles[poles].push({ ...p, _amp: amp })
        }
        for (const c of Object.keys(groups)) {
          for (const pole of Object.keys(groups[c]._poles)) {
            groups[c]._poles[pole].sort(
              (a, b) => a._amp - b._amp || (a.ref_fabricante || '').localeCompare(b.ref_fabricante || '')
            )
          }
          groups[c]._count = Object.values(groups[c]._poles).reduce((sum, arr) => sum + arr.length, 0)
        }
        return groups
      })() : null

      return (
        <div className={styles.circleLayout}>
          <div className={styles.sectionHeader} role="status">
            <span className={`${styles.label} ${styles['label--brand']}`}>
              {filteredRefs.length} / {referenciasDisponibles.length} referencias
            </span>
            <h2 className={styles.sectionTitle}>{gamaComercial ? `${gamaComercial}${subgama ? ` — ${subgama}` : ''}` : subgama || (gama && tipo ? `${gama} — ${tipo}` : '')}</h2>
          </div>

          {referenciasDisponibles.length > 12 && (
            <div style={{ padding: '0 16px 8px', maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Filtrar referencias..."
                value={refFilter}
                onChange={e => setRefFilter(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '8px',
                  border: '1.5px solid var(--gray-200)', fontSize: '0.875rem',
                  outline: 'none', boxSizing: 'border-box',
                }}
                aria-label="Filtrar referencias por código o nombre"
              />
            </div>
          )}

          {esMagnetotermico ? (
            <div className={styles.refsScroll}>
              {Object.keys(curveGroups).length > 0 ? (
                Object.keys(curveGroups)
                  .sort((a, b) => {
                    const ia = CURVE_ORDER.indexOf(a)
                    const ib = CURVE_ORDER.indexOf(b)
                    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
                  })
                  .map(curve => {
                    const curveData = curveGroups[curve]
                    const poleKeys = Object.keys(curveData._poles).sort(
                      (a, b) => {
                        const ia = POLA_ORDER.indexOf(a)
                        const ib = POLA_ORDER.indexOf(b)
                        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
                      }
                    )
                    return (
                      <div key={curve} className={styles.curveSection}>
                        <div className={styles.curveHeader}>
                          <span className={styles.curveBadge}>Curva {curve}</span>
                          <span className={styles.curveCount}>{curveData._count} ref.</span>
                        </div>
                        {poleKeys.map(poles => (
                          <div key={poles} className={styles.poleSection}>
                            <div className={styles.poleHeader}>
                              <span className={styles.poleBadge}>{poles}</span>
                              <span className={styles.poleCount}>{curveData._poles[poles].length} ref.</span>
                            </div>
                            <div className={styles.curveGrid}>
                              {curveData._poles[poles].map(p => (
                                <RefCard
                                  key={p.id}
                                  code={p.ref_fabricante}
                                  desc={p.name}
                                  price={p.precio}
                                  image={p.imagen}
                                  onClick={() => seleccionarReferencia(p)}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                  No hay referencias disponibles
                </div>
              )}
            </div>
          ) : soportaVistaAgrupada ? (
            <ProductTable
              products={referenciasDisponibles}
              onSelect={seleccionarReferencia}
            />
          ) : (
            <div className={styles.refsScroll}>
              {filteredRefs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', width: '100%', padding: '16px' }}>
                  {filteredRefs.map(p => (
                    <div key={p.id} role="listitem" style={{ display: 'flex' }}>
                      <RefCard
                        code={p.ref_fabricante}
                        desc={p.name}
                        price={p.precio}
                        image={p.imagen}
                        onClick={() => seleccionarReferencia(p)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                  {refFilter ? 'No hay referencias que coincidan con el filtro' : 'No hay referencias disponibles'}
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    /* Ficha */
    if (paso === 'ficha' && referencia) {
      const fichaDesc = referencia.name || referencia.desc || ''
      return (
        <div className={styles.circleLayout}>
          <article className={styles.fichaSection} aria-label={`Detalles de ${fichaDesc}`}>
            <FichaCard
              refCode={referencia.ref_fabricante || referencia.ref}
              desc={fichaDesc}
              price={referencia.precio}
              image={referencia.imagen}
              specs={[
                ['Marca', referencia.marca],
                ['Familia', referencia.familia],
                ['Gama', referencia.subfamilia || referencia.gama],
                ['Tipo', referencia.tipo],
              ]}
              actions={[
                { label: 'Copiar referencia', variant: 'primary', onClick: () => copiarReferencia(referencia.ref_fabricante || referencia.ref) },
                { label: 'Ficha fabricante', variant: 'secondary', onClick: () => abrirPDF(getUrlFabricante(referencia)) },
                { label: 'Presupuesto', variant: 'secondary', onClick: () => añadirPresupuesto(referencia) },
              ]}
            />

            {aiCargando && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-500)' }}>
                Buscando información técnica...
              </div>
            )}

            {aiFicha && (
              <div className={styles.aiInfo}>
                {aiFicha.caracteristicas && aiFicha.caracteristicas.length > 0 && (
                  <div className={styles.aiInfo__block}>
                    <h3 className={styles.aiInfo__title}>Características Técnicas</h3>
                    <ul className={styles.aiInfo__list}>
                      {aiFicha.caracteristicas.map((c, i) => (
                        <li key={i} className={styles.aiInfo__item}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiFicha.aplicaciones && aiFicha.aplicaciones.length > 0 && (
                  <div className={styles.aiInfo__block}>
                    <h3 className={styles.aiInfo__title}>Aplicaciones</h3>
                    <ul className={styles.aiInfo__list}>
                      {aiFicha.aplicaciones.map((a, i) => (
                        <li key={i} className={styles.aiInfo__item}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiFicha.normas && aiFicha.normas.length > 0 && (
                  <div className={styles.aiInfo__block}>
                    <h3 className={styles.aiInfo__title}>Normas</h3>
                    <ul className={styles.aiInfo__list}>
                      {aiFicha.normas.map((n, i) => (
                        <li key={i} className={styles.aiInfo__item}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiFicha.url_manual && (
                  <div className={styles.aiInfo__block}>
                    <h3 className={styles.aiInfo__title}>Manual / Documentación</h3>
                    <a href={sanitizeUrl(aiFicha.url_manual)} target="_blank" rel="noopener noreferrer" className={styles.aiInfo__link}>
                      {aiFicha.url_manual}
                    </a>
                  </div>
                )}

                {aiFicha.consejo_tecnico && (
                  <TipCard text={aiFicha.consejo_tecnico} />
                )}
              </div>
            )}

            {!aiCargando && !aiFicha && (
              <TipCard text={`Producto: ${fichaDesc}. Marca: ${referencia.marca || ''}. Verificado por Proyectos PFC Tools.`} />
            )}
          </article>
        </div>
      )
    }

    /* Resultado Búsqueda */
    if (resultado && !error) {
      return (
        <div className={styles.circleLayout}>
          <div className={styles.aiResult} role="status" aria-live="polite">
            <h2 className={styles.sectionTitle}>Resultado Búsqueda</h2>
            <div className={styles.aiCard}>
              <div className={styles.aiCard__name}>{resultado.desc || resultado.nombre}</div>
              <div className={styles.aiCard__ref}>{resultado.ref || resultado.referencia}</div>
              <div className={styles.aiCard__desc}>{resultado.desc || resultado.descripcion}</div>
              {resultado.marca && (
                <div className={styles.aiCard__specs}>
                   <span className={styles.aiCard__spec}>{resultado.marca}</span>
                   <span className={styles.aiCard__spec}>{resultado.familia}</span>
                </div>
              )}
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
               <Button 
                 variant="primary" 
                 size="sm" 
                 onClick={() => seleccionarReferencia(resultado.ref || resultado.referencia)}
                 aria-label="Ver detalles completos del producto"
               >
                  Ver Ficha Completa
               </Button>
            </div>
          </div>
        </div>
      )
    }

    /* Error */
    if (error) {
      return (
        <div className={styles.circleLayout}>
          <div className={styles.errorBox} role="alert">
            <div className={styles.errorBox__title}>⚠ Sin resultados</div>
            <div className={styles.errorBox__msg}>{error.mensaje}</div>
            {error.sugerencias?.length > 0 && (
              <div className={styles.suggWrap}>
                {error.sugerencias.map((s, i) => (
                  <Button 
                    key={i} 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setConsulta(s); buscar(s) }}
                    aria-label={`Buscar sugerencia: ${s}`}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className={styles.layout}>
      {renderSidebar()}
      <main className={styles.main} id="main-content">
        <div className={styles.main__content}>

      {/* Breadcrumb con navegación semántica */}
      {breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb">
          <Breadcrumb
            items={[
              ...breadcrumb.map((item, i) => {
                const isLast = i === breadcrumb.length - 1
                const label = typeof item === 'string' ? item : item.label
                const image = typeof item === 'object' ? item.imagen : undefined
                const isReferencia = paso === 'ficha' && isLast && typeof item === 'object'
                return {
                  label: isReferencia ? referencia.ref_fabricante || referencia.ref : label,
                  image: isReferencia ? referencia.imagen : image,
                  onClick: i < breadcrumb.length - 1 ? () => irAPaso(i) : undefined,
                  current: isLast,
                }
              }),
            ]}
          />
        </nav>
      )}

          {/* Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              <span aria-hidden="true">{categoria ? (catInfo.icon || '') : ''}</span>
              {' '}
              {categoria ? categorias.find(c => c.id === categoria)?.label : 'Fichas Técnicas'}
            </h1>
            {categoria && (
              <ViewToggle
                options={[{ label: 'Navegar', value: 'navegacion' }, { label: 'Buscar', value: 'busqueda' }]}
                active={modo}
                onChange={setModo}
              />
            )}
          </div>

          {/* Main content */}
          <section aria-live="polite">
            {renderMain()}
          </section>

          {/* Back button */}
          {(paso !== 'categorias' && paso !== 'busqueda' && categoria) && (
            <div className={styles.backWrap}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={volver}
                aria-label="Volver al paso anterior"
              >
                ← Volver
              </Button>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

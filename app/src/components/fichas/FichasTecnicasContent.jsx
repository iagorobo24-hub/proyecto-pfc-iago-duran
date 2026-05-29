import React, { useState, useEffect } from 'react'
import { getBrandLogoData } from '../../services/brandLogoService'
import { MARCAS } from '../../data/marcasLogos'
import { sanitizeUrl } from '../../services/anthropicService'
import { getEtiquetaSubcategoria } from '../../data/etiquetasSubcategoria'
import Button from '../ui/Button'
import { TipCard } from '../ui/CircleLayout'
import LinearRefCard from './LinearRefCard'
import LinearFichaCard from './LinearFichaCard'
import ProductTable, { supportsTableView } from '../ui/ProductTable'
import {
  extractCurve, extractAmps, extractPoles, POLA_ORDER,
  getCurvasDisponibles, getTiposDiferencial, getPolosDisponibles,
  getCalibresDisponibles, getSensibilidadesDisponibles,
  getFrameworksDisponibles,
  filterProductsBy,
} from '../../hooks/useProductTable'
import FichasTecnicasSkeleton from './FichasTecnicasSkeleton'
import VistaCurvaTipo from './VistaCurvaTipo'
import VistaPolos from './VistaPolos'
import VistaCalibre from './VistaCalibre'
import VistaFramework from './VistaFramework'
import VistaCardConImagen from './VistaCardConImagen'
import styles from '../../tools/FichasTecnicas.module.css'

const getUrlFabricante = (prod) => {
  if (!prod) return null
  const docPagina = prod.documentos?.find(d => d.nombre?.toLowerCase().includes('pagina') || d.nombre?.toLowerCase().includes('enlace'))
  if (docPagina?.url) return docPagina.url
  const docFicha = prod.documentos?.find(d => d.nombre?.toLowerCase().includes('hoja') || d.url?.includes('prysmiangroup') || d.url?.includes('generalcable'))
  if (docFicha?.url) return docFicha.url
  return prod.pdf_url || prod.pdfUrl
}

function FichasTecnicasContent({
  paso,
  categoria,
  marca,
  gamaComercial,
  subgama,
  gama,
  tipo,
  categoriaGrupo,
  subcategoria,
  grupos,
  referencia,
  categorias,
  marcasDisponibles,
  gamasDisponibles,
  tiposDisponibles,
  gamasComercialesDisponibles,
  subgamasDisponibles,
  referenciasDisponibles,
  aiFicha,
  aiCargando,
  isCargando,
  resultado,
  error,
  resultadosBusqueda,
  modo,
  catInfo,
  onSeleccionarMarca,
  onSeleccionarGama,
  onSeleccionarTipo,
  onSeleccionarCategoriaGrupo,
  onSeleccionarSubcategoria,
  onSeleccionarGamaComercial,
  onSeleccionarSubgama,
  onSeleccionarReferencia,
  onCopiarReferencia,
  onAnadirPresupuesto,
}) {
  const [refFilter, setRefFilter] = useState('')
  const [vistaFramework, setVistaFramework] = useState(null)
  const [vistaCurva, setVistaCurva] = useState(null)
  const [vistaTipo, setVistaTipo] = useState(null)
  const [vistaPolos, setVistaPolos] = useState(null)
  const [vistaCalibre, setVistaCalibre] = useState(null)
  const [vistaSensibilidad, setVistaSensibilidad] = useState(null)

  useEffect(() => {
    setVistaFramework(null)
    setVistaCurva(null)
    setVistaTipo(null)
    setVistaPolos(null)
    setVistaCalibre(null)
    setVistaSensibilidad(null)
  }, [categoria, marca, gamaComercial, subgama, gama, tipo, categoriaGrupo, subcategoria])

  const renderHeader = (icon, title, desc) => (
    <div className={styles.linearHeader}>
      {icon && <div className={styles.linearHeader__icon}>{icon}</div>}
      {title && <div className={styles.linearHeader__title}>{title}</div>}
      {desc && <div className={styles.linearHeader__desc}>{desc}</div>}
    </div>
  )

  const abrirPDF = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (isCargando) {
    return <FichasTecnicasSkeleton paso={paso} />
  }

  if (resultadosBusqueda && resultadosBusqueda.length > 0) {
    return (
      <div className={styles.linearLayout}>
        <div className={styles.sectionHeader}>
          <span className={`${styles.label} ${styles['label--brand']}`}>{resultadosBusqueda.length} resultados encontrados</span>
          <h2 className={styles.sectionTitle}>Selecciona un producto</h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            width: '100%',
            padding: '0 20px',
          }}
        >
          {resultadosBusqueda.map(p => (
            <div
              key={p.ref}
              className={styles.aiCard}
              style={{ cursor: 'pointer', textAlign: 'left' }}
              onClick={() => onSeleccionarReferencia(p.ref)}
            >
              <div className={styles.aiCard__name} style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                {p.nombre}
              </div>
              <div className={styles.aiCard__ref} style={{ color: 'var(--blue-600)', fontWeight: 'bold' }}>
                REF: {p.ref}
              </div>
              <div className={styles.aiCard__specs}>
                <span className={styles.aiCard__spec}>{p.marca}</span>
                <span className={styles.aiCard__spec}>{p.precio}€</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

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

  if (paso === 'marcas') {
    const marcasConLogo = marcasDisponibles.map(m => {
      const logoData = getBrandLogoData(m.nombre)
      return {
        ...m,
        logo: logoData.logo || '',
        logoFallback: logoData.initials,
        logoGradient: logoData.gradient,
        color: MARCAS[m.nombre]?.color || logoData.gradient,
      }
    })

    return (
      <div className={styles.linearLayout}>
        {renderHeader(catInfo.icon, categorias.find(c => c.id === categoria)?.label, catInfo.desc)}

        {marcasConLogo.length > 0 ? (
          <div className={styles.brandGrid} role="list" aria-label="Marcas disponibles">
            {marcasConLogo.map(m => (
              <div key={m.nombre} role="listitem">
                <button
                  className={styles.brandCard}
                  onClick={() => onSeleccionarMarca(m.nombre)}
                  aria-label={`Seleccionar marca ${m.nombre}`}
                >
                  <div className={styles.brandCard__logo}>
                    {m.logo ? (
                      <img src={m.logo} alt={m.nombre} />
                    ) : (
                      <div className={styles.brandCard__logoFallback} style={{ background: m.logoGradient || m.logoColor }}>
                        {m.logoFallback}
                      </div>
                    )}
                  </div>
                  <div className={styles.brandCard__name}>{m.nombre}</div>
                  <div className={styles.brandCard__count}>Ver gamas</div>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No hay marcas disponibles.</p>
        )}
      </div>
    )
  }

  if (paso === 'categorias_grupo') {
    const categoriasList = Object.entries(grupos)
    return (
      <div className={styles.linearLayout}>
        {renderHeader(catInfo.icon, 'Elige categoría', marca)}
        {categoriasList.length > 0 ? (
          <div className={styles.itemList} role="list" aria-label="Categorías de producto">
            {categoriasList.map(([cat, info]) => (
              <div key={cat} role="listitem" style={{ width: '100%' }}>
                <button
                  className={styles.tipoCard}
                  onClick={() => onSeleccionarCategoriaGrupo(cat)}
                  aria-label={`Seleccionar categoría ${cat}`}
                >
                  <span aria-hidden="true" style={{ fontSize: '1.25rem', marginRight: '8px' }}>{info.icon}</span>
                  <span className={styles.tipoCard__name}>{cat}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>No hay categorías disponibles.</p>
        )}
      </div>
    )
  }

  if (paso === 'subcategorias' && categoriaGrupo && grupos[categoriaGrupo]) {
    const subcats = Object.entries(grupos[categoriaGrupo].subcategorias)
    return (
      <div className={styles.linearLayout}>
        {renderHeader(grupos[categoriaGrupo]?.icon, categoriaGrupo, 'Selecciona tipo de producto')}
        {subcats.length > 0 ? (
          <div className={styles.itemList} role="list" aria-label="Subcategorías">
            {subcats.map(([subcat, filtros]) => (
              <div key={subcat} role="listitem" style={{ width: '100%' }}>
                <button
                  className={styles.tipoCard}
                  onClick={() => onSeleccionarSubcategoria(subcat)}
                  aria-label={`Seleccionar ${getEtiquetaSubcategoria(subcat)}`}
                >
                  <span className={styles.tipoCard__name}>{getEtiquetaSubcategoria(subcat)}</span>
                  <span className={styles.tipoCard__count}>{filtros.length} filtro{filtros.length !== 1 ? 's' : ''}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>No hay subcategorías disponibles.</p>
        )}
      </div>
    )
  }

  if (paso === 'gamas_comerciales') {
    return (
      <div className={styles.linearLayout}>
        {renderHeader(catInfo.icon, 'Elige gama', categoriaGrupo ? `${marca} › ${categoriaGrupo} › ${getEtiquetaSubcategoria(subcategoria)}` : `${marca} › ${gama} › ${tipo}`)}
        {gamasComercialesDisponibles.length > 0 ? (
          <div className={styles.itemList} role="list" aria-label="Gamas disponibles">
            {gamasComercialesDisponibles.map(gc => (
              <div key={gc} role="listitem" style={{ width: '100%' }}>
                <button
                  className={styles.tipoCard}
                  onClick={() => onSeleccionarGamaComercial(gc)}
                  aria-label={`Seleccionar gama ${gc}`}
                >
                  <span className={styles.tipoCard__name}>{gc}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Cargando gamas...</p>
        )}
      </div>
    )
  }

  if (paso === 'subgamas') {
    return (
      <div className={styles.linearLayout}>
        {renderHeader(catInfo.icon, 'Elige subgama', categoriaGrupo ? `${marca} › ${categoriaGrupo} › ${getEtiquetaSubcategoria(subcategoria)}` : `${marca} › ${gama} › ${tipo}`)}
        {subgamasDisponibles.length > 0 ? (
          <div className={styles.itemList} role="list" aria-label="Subgamas disponibles">
            {subgamasDisponibles.map(sg => (
              <div key={sg} role="listitem" style={{ width: '100%' }}>
                <button
                  className={styles.tipoCard}
                  onClick={() => onSeleccionarSubgama(sg)}
                  aria-label={`Seleccionar subgama ${sg}`}
                >
                  <span className={styles.tipoCard__name}>{sg}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Cargando subgamas...</p>
        )}
      </div>
    )
  }

  if (paso === 'gamas') {
    return (
      <div className={styles.linearLayout}>
        {renderHeader(catInfo.icon, 'Elige gama', marca)}
        {gamasDisponibles.length > 0 ? (
          <div className={styles.itemList} role="list" aria-label={`Gamas de ${marca}`}>
            {gamasDisponibles.map((gName) => (
              <div key={gName} role="listitem" style={{ width: '100%' }}>
                <button
                  className={styles.tipoCard}
                  onClick={() => onSeleccionarGama(gName)}
                  aria-label={`Seleccionar gama ${gName}`}
                >
                  <span className={styles.tipoCard__name}>{gName}</span>
                  <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No hay gamas disponibles.</p>
        )}
      </div>
    )
  }

  if (paso === 'tipos') {
    return (
      <div className={styles.linearLayout}>
        {renderHeader(catInfo.icon, 'Elige tipo', `${gama} — ${marca}`)}
        <div className={styles.itemList} role="list" aria-label="Tipos de productos">
          {tiposDisponibles.map(t => (
            <div key={t} role="listitem" style={{ width: '100%' }}>
              <button
                className={styles.tipoCard}
                onClick={() => onSeleccionarTipo(t)}
                aria-label={`Seleccionar tipo ${t}`}
              >
                <span className={styles.tipoCard__name}>{t}</span>
                <span className={styles.tipoCard__arrow} aria-hidden="true">›</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (paso === 'referencias') {
    const soportaVistaAgrupada = supportsTableView(referenciasDisponibles)
    const esMCCB = soportaVistaAgrupada && referenciasDisponibles.every(
      p => (p.subfamilia || '').trim() === 'Interruptor Caja Moldeada'
    )
    const esMagnetotermico = soportaVistaAgrupada && referenciasDisponibles.every(
      p => (p.subfamilia || '').trim() === 'Interruptor Magnetotérmico'
    )

    if (soportaVistaAgrupada) {
      const mode = esMCCB ? 'mccb' : esMagnetotermico ? 'magneto' : 'diferencial'

      const currentStep = mode === 'mccb'
        ? (!vistaFramework ? 'framework' : !vistaCurva ? 'curva' : !vistaPolos ? 'polos' : vistaCalibre === null ? 'calibre' : 'tabla')
        : mode === 'magneto'
          ? (!vistaCurva ? 'curva' : !vistaPolos ? 'polos' : vistaCalibre === null ? 'calibre' : 'tabla')
          : (!vistaTipo ? 'tipo' : !vistaPolos ? 'polos' : vistaSensibilidad === null ? 'sensibilidad' : 'tabla')

      const frameworksDisponibles = getFrameworksDisponibles(referenciasDisponibles)
      const curvasDisponibles = getCurvasDisponibles(referenciasDisponibles)
      const tiposDisponibles = getTiposDiferencial(referenciasDisponibles)

      const buildCounts = (items, extractFn) => {
        const counts = {}
        for (const item of items) {
          counts[item] = filterProductsBy(referenciasDisponibles, { [extractFn]: item }).length
        }
        return counts
      }

      const curvaCounts = esMagnetotermico ? buildCounts(curvasDisponibles, 'curve') : {}
      const tipoCounts = !esMagnetotermico ? buildCounts(tiposDisponibles, 'tipo') : {}

      const polosDisponibles = getPolosDisponibles(referenciasDisponibles, {
        framework: vistaFramework || undefined,
        curve: vistaCurva || undefined,
        tipo: vistaTipo || undefined,
      })

      const poleCounts = buildCounts(polosDisponibles, 'polos')

      // Obtener imagen representativa para cada opción de polos
      const getPolosImage = (polo) => {
        const filtrados = filterProductsBy(referenciasDisponibles, {
          curve: vistaCurva || undefined,
          tipo: vistaTipo || undefined,
          polos: polo,
        })
        return filtrados.find(p => p.imagen)?.imagen || null
      }

      // Obtener imagen representativa para cada calibre
      const getCalibreImage = (calibre) => {
        const filtrados = filterProductsBy(referenciasDisponibles, {
          curve: vistaCurva || undefined,
          tipo: vistaTipo || undefined,
          polos: vistaPolos,
          calibre: calibre,
        })
        return filtrados.find(p => p.imagen)?.imagen || null
      }

      // Obtener imagen representativa para cada sensibilidad
      const getSensibilidadImage = (sensibilidad) => {
        const filtrados = filterProductsBy(referenciasDisponibles, {
          tipo: vistaTipo || undefined,
          polos: vistaPolos,
          sensibilidad: sensibilidad,
        })
        return filtrados.find(p => p.imagen)?.imagen || null
      }

      const filtro = mode === 'mccb'
        ? { framework: vistaFramework, curve: vistaCurva, polos: vistaPolos, calibre: vistaCalibre }
        : mode === 'magneto'
          ? { curve: vistaCurva, polos: vistaPolos, calibre: vistaCalibre }
          : { tipo: vistaTipo, polos: vistaPolos, sensibilidad: vistaSensibilidad }
      const productosFiltrados = filterProductsBy(referenciasDisponibles, filtro)

      const handleBackSubStep = () => {
        if (currentStep === 'polos') {
          if (mode === 'mccb') setVistaFramework(null)
          else if (mode === 'magneto') setVistaCurva(null)
          else setVistaTipo(null)
        } else if (currentStep === 'calibre' || currentStep === 'sensibilidad') {
          setVistaPolos(null)
        } else if (currentStep === 'tabla') {
          if (mode === 'mccb') setVistaCalibre(null)
          else if (mode === 'magneto') setVistaCalibre(null)
          else setVistaSensibilidad(null)
        }
      }

      const stepLabel = mode === 'mccb'
        ? { icon: '⚡', label: `NSX${vistaFramework || '...'}`, sub: vistaCurva ? `Curva ${vistaCurva}` : vistaPolos ? `${vistaPolos}` : '', last: vistaCalibre !== null ? `${vistaCalibre}A` : '' }
        : mode === 'magneto'
          ? { icon: vistaCurva || '?', label: `Curva ${vistaCurva || '...'}`, sub: vistaPolos ? `${vistaPolos}` : '', last: vistaCalibre !== null ? `${vistaCalibre} A` : '' }
          : { icon: vistaTipo || '?', label: `Tipo ${vistaTipo || '...'}`, sub: vistaPolos ? `${vistaPolos}` : '', last: vistaSensibilidad !== null ? `${vistaSensibilidad} mA` : '' }

      return (
        <div className={styles.linearLayout}>
          <div className={styles.vistaSteps}>
            <span className={styles.vistaStep}>
              {stepLabel.icon}
              {currentStep !== 'framework' && currentStep !== 'curva' && currentStep !== 'tipo' && (
                <span className={styles.vistaStepArrow}> › </span>
              )}
            </span>
            {currentStep !== 'framework' && currentStep !== 'curva' && currentStep !== 'tipo' && (
              <span className={styles.vistaStep}>{stepLabel.label}</span>
            )}
            {(currentStep === 'calibre' || currentStep === 'sensibilidad' || currentStep === 'tabla') && (
              <>
                <span className={styles.vistaStepArrow}> › </span>
                <span className={styles.vistaStep}>{stepLabel.sub}</span>
              </>
            )}
            {currentStep === 'tabla' && (
              <>
                <span className={styles.vistaStepArrow}> › </span>
                <span className={styles.vistaStep}>{stepLabel.last}</span>
              </>
            )}
          </div>

          {currentStep === 'framework' && (
            <VistaFramework
              frameworks={frameworksDisponibles}
              counts={buildCounts(frameworksDisponibles, 'framework')}
              onSelect={(fw) => setVistaFramework(fw)}
            />
          )}
          {currentStep === 'curva' && (
            <VistaCurvaTipo mode="magneto" curvas={curvasDisponibles} counts={curvaCounts} onSelect={setVistaCurva} />
          )}
          {currentStep === 'tipo' && (
            <VistaCurvaTipo mode="diferencial" tipos={tiposDisponibles} counts={tipoCounts} onSelect={setVistaTipo} />
          )}
          {currentStep === 'polos' && (
            <div className={styles.cardGrid} role="list" aria-label="Selección de polos">
              {polosDisponibles.map(polo => {
                const count = poleCounts[polo] || 0
                const image = getPolosImage(polo)
                const badge = mode === 'mccb' ? `NSX${vistaFramework || ''} ${vistaCurva || ''}` : mode === 'magneto' ? `${vistaCurva || ''} ${polo}` : `${vistaTipo || ''} ${polo}`
                return (
                  <VistaCardConImagen
                    key={polo}
                    badge={badge}
                    name={polo}
                    desc={`${count} ref.`}
                    count={count}
                    image={image}
                    onSelect={setVistaPolos}
                  />
                )
              })}
            </div>
          )}
          {currentStep === 'calibre' && (
                      <>
                        <div className={styles.cardGrid} role="list" aria-label="Selección de calibre">
                          {getCalibresDisponibles(referenciasDisponibles, {
                            framework: mode === 'mccb' ? vistaFramework : undefined,
                            curve: mode !== 'mccb' ? vistaCurva : undefined,
                            polos: vistaPolos,
                          }).map(calibre => {
                            const filtrados = filterProductsBy(referenciasDisponibles, {
                              framework: mode === 'mccb' ? vistaFramework : undefined,
                              curve: mode !== 'mccb' ? vistaCurva : undefined,
                              tipo: vistaTipo || undefined,
                              polos: vistaPolos,
                              calibre: calibre,
                            })
                            const count = filtrados.length
                            const image = getCalibreImage(calibre)
                            return (
                              <VistaCardConImagen
                                key={calibre}
                                badge={`${calibre} A`}
                                name={`${calibre} A`}
                                desc={`${count} ref.`}
                                count={count}
                                image={image}
                                onSelect={() => setVistaCalibre(calibre)}
                              />
                            )
                          })}
                        </div>
                      </>
          )}
          {currentStep === 'sensibilidad' && (
            <>\n              <div className={styles.cardGrid} role="list" aria-label="Selección de sensibilidad">
                {getSensibilidadesDisponibles(referenciasDisponibles, { tipo: vistaTipo, polos: vistaPolos }).map(sensibilidad => {
                  const filtrados = filterProductsBy(referenciasDisponibles, {
                    tipo: vistaTipo || undefined,
                    polos: vistaPolos,
                    sensibilidad: sensibilidad,
                  })
                  const count = filtrados.length
                  const image = getSensibilidadImage(sensibilidad)
                  return (
                    <VistaCardConImagen
                      key={sensibilidad}
                      badge={`${sensibilidad} mA`}
                      name={`${sensibilidad} mA`}
                      desc={`${count} ref.`}
                      count={count}
                      image={image}
                      onSelect={() => setVistaSensibilidad(sensibilidad)}
                    />
                  )
                })}
              </div>
            </>
          )}
          {currentStep === 'tabla' && (
            <>\n              <div className={styles.sectionHeader}>
                <span className={`${styles.label} ${styles['label--brand']}`}>
                  {productosFiltrados.length} referencias
                </span>
              </div>
              {productosFiltrados.length <= 12 ? (
                <div className={styles.cardGrid} role="list" aria-label="Referencias disponibles">
                  {productosFiltrados.map((p, i) => (
                    <div
                      key={p.id}
                      style={{ animation: `fadeInUp 0.4s var(--ease-out) both`, animationDelay: `${i * 30}ms` }}
                    >
                      <LinearRefCard
                        code={p.ref_fabricante}
                        desc={p.name}
                        price={p.precio}
                        image={p.imagen}
                        marca={p.marca}
                        onClick={() => onSeleccionarReferencia(p)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <ProductTable products={productosFiltrados} onSelect={onSeleccionarReferencia} />
              )}
            </>
          )}

          {currentStep !== 'curva' && currentStep !== 'tipo' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <Button variant="ghost" size="sm" onClick={handleBackSubStep} aria-label="Volver al paso anterior">
                ← Atrás
              </Button>
            </div>
          )}
        </div>
      )
    }

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
      <div className={styles.linearLayout}>
        <div className={styles.sectionHeader} role="status">
          <span className={`${styles.label} ${styles['label--brand']}`}>
            {filteredRefs.length} / {referenciasDisponibles.length} referencias
          </span>
          <h2 className={styles.sectionTitle}>
            {gamaComercial ? `${gamaComercial}${subgama ? ` — ${subgama}` : ''}` : subgama || (gama && tipo ? `${gama} — ${tipo}` : '')}
          </h2>
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
                            {curveData._poles[poles].map((p, i) => (
                              <div key={p.id} style={{ animation: `fadeInUp 0.4s var(--ease-out) both`, animationDelay: `${i * 30}ms` }}>
                                <LinearRefCard
                                  code={p.ref_fabricante}
                                  desc={p.name}
                                  price={p.precio}
                                  image={p.imagen}
                                  marca={p.marca}
                                  onClick={() => onSeleccionarReferencia(p)}
                                />
                              </div>
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
            onSelect={onSeleccionarReferencia}
          />
        ) : (
          <div className={styles.refsScroll}>
            {filteredRefs.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '20px',
                  width: '100%',
                  padding: '16px',
                }}
              >
                {filteredRefs.map((p, i) => (
                  <div key={p.id} role="listitem" style={{ display: 'flex', animation: `fadeInUp 0.4s var(--ease-out) both`, animationDelay: `${i * 30}ms` }}>
                    <LinearRefCard
                      code={p.ref_fabricante}
                      desc={p.name}
                      price={p.precio}
                      image={p.imagen}
                      marca={p.marca}
                      onClick={() => onSeleccionarReferencia(p)}
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

  if (paso === 'ficha' && referencia) {
    const fichaDesc = referencia.name || referencia.desc || ''
    return (
      <div className={styles.linearLayout}>
        <article className={styles.fichaSection} aria-label={`Detalles de ${fichaDesc}`}>
          <LinearFichaCard
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
              { label: 'Copiar referencia', variant: 'primary', onClick: () => onCopiarReferencia(referencia.ref_fabricante || referencia.ref) },
              { label: 'Ficha fabricante', variant: 'secondary', onClick: () => abrirPDF(getUrlFabricante(referencia)) },
              { label: 'Presupuesto', variant: 'secondary', onClick: () => onAnadirPresupuesto(referencia) },
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

  if (resultado && !error) {
    return (
      <div className={styles.linearLayout}>
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
              onClick={() => onSeleccionarReferencia(resultado.ref || resultado.referencia)}
              aria-label="Ver detalles completos del producto"
            >
              Ver Ficha Completa
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.linearLayout}>
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
                  onClick={() => onSeleccionarReferencia(s)}
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

export default React.memo(FichasTecnicasContent)

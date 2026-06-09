import React from 'react'
import styles from '../../tools/FichasTecnicas.module.css'
import {
  extractCurve, extractAmps, extractPoles, POLA_ORDER,
  getCurvasDisponibles, getTiposDiferencial, getPolosDisponibles,
  getCalibresDisponibles, getSensibilidadesDisponibles,
  getFrameworksDisponibles,
  filterProductsBy,
  supportsTableView,
  CURVA_DESC,
  SENSIBILIDAD_DESC,
  ampToStandard,
  extractSensitivity,
} from '../../hooks/useProductTable'
import VistaCurvaTipo from './VistaCurvaTipo'
import VistaCardConImagen from './VistaCardConImagen'
import ProductTable from '../ui/ProductTable'
import LinearRefCard from './LinearRefCard'
import Button from '../ui/Button'

const CURVE_ORDER = ['B', 'C', 'D', 'K', 'MA', 'TMD', 'Z']

const sortRefs = (products) => {
  return [...products].sort((a, b) => {
    const polesA = extractPoles(a.name)
    const polesB = extractPoles(b.name)
    const idxA = POLA_ORDER.indexOf(polesA)
    const idxB = POLA_ORDER.indexOf(polesB)
    const orderA = idxA === -1 ? 999 : idxA
    const orderB = idxB === -1 ? 999 : idxB

    if (orderA !== orderB) {
      return orderA - orderB
    }

    const ampsA = extractAmps(a.name)
    const ampsB = extractAmps(b.name)
    if (ampsA !== ampsB) {
      return ampsA - ampsB
    }

    return (a.ref_fabricante || '').localeCompare(b.ref_fabricante || '')
  })
}

export default function StepReferencias({
  referenciasDisponibles,
  gamaComercial,
  subgama,
  gama,
  tipo,
  vistaFramework, setVistaFramework,
  vistaCurva, setVistaCurva,
  vistaTipo, setVistaTipo,
  vistaPolos, setVistaPolos,
  vistaCalibre, setVistaCalibre,
  vistaSensibilidad, setVistaSensibilidad,
  onSeleccionarReferencia,
}) {
  const esMCCB = referenciasDisponibles.every(
    p => (p.subfamilia || '').trim() === 'Interruptor Caja Moldeada'
  )
  const esMagnetotermico = referenciasDisponibles.every(
    p => (p.subfamilia || '').trim() === 'Interruptor Magnetotérmico'
  )

  if (!supportsTableView(referenciasDisponibles)) {
    return <StepReferenciasSimple
      referenciasDisponibles={referenciasDisponibles}
      gamaComercial={gamaComercial}
      subgama={subgama}
      gama={gama}
      tipo={tipo}
      onSeleccionarReferencia={onSeleccionarReferencia}
    />
  }

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

  const getPolosImage = (polo) => {
    const filtrados = filterProductsBy(referenciasDisponibles, {
      curve: vistaCurva || undefined,
      tipo: vistaTipo || undefined,
      polos: polo,
    })
    return filtrados.find(p => p.imagen)?.imagen || null
  }

  const getCalibreImage = (calibre) => {
    const filtrados = filterProductsBy(referenciasDisponibles, {
      curve: vistaCurva || undefined,
      tipo: vistaTipo || undefined,
      polos: vistaPolos,
      calibre: calibre,
    })
    return filtrados.find(p => p.imagen)?.imagen || null
  }

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
      )}
      {currentStep === 'sensibilidad' && (
        <div className={styles.cardGrid} role="list" aria-label="Selección de sensibilidad">
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
      )}
      {currentStep === 'tabla' && (
        <>
          <div className={styles.sectionHeader}>
            <span className={`${styles.label} ${styles['label--brand']}`}>
              {productosFiltrados.length} referencias
            </span>
          </div>
          <div className={styles.refsScroll} style={{ width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
            <div className={styles.fourColGrid} role="list" aria-label="Referencias disponibles">
              {sortRefs(productosFiltrados).map((p, i) => (
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
          </div>
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

// ── Simple list view (non-table products) ─────────────────────────────────────

function StepReferenciasSimple({
  referenciasDisponibles,
  gamaComercial,
  subgama,
  gama,
  tipo,
  onSeleccionarReferencia,
}) {
  const [refFilter, setRefFilter] = React.useState('')

  const sortedRefs = React.useMemo(() => {
    const refs = refFilter
      ? referenciasDisponibles.filter(p =>
          (p.ref_fabricante || '').toLowerCase().includes(refFilter.toLowerCase()) ||
          (p.name || '').toLowerCase().includes(refFilter.toLowerCase())
        )
      : referenciasDisponibles

    return sortRefs(refs)
  }, [referenciasDisponibles, refFilter])

  const specs = React.useMemo(() => {
    const curves = {}
    const poles = {}
    const sens = {}

    referenciasDisponibles.forEach(p => {
      const c = extractCurve(p.name)
      const pol = extractPoles(p.name)
      const s = extractSensitivity(p.name)

      if (c && c !== '?') curves[c] = (curves[c] || 0) + 1
      if (pol && pol !== '?') poles[pol] = (poles[pol] || 0) + 1
      if (s > 0) sens[s] = (sens[s] || 0) + 1
    })

    return { curves, poles, sens }
  }, [referenciasDisponibles])

  const renderSummary = () => {
    const hasCurves = Object.keys(specs.curves).length > 0
    const hasPoles = Object.keys(specs.poles).length > 0
    const hasSens = Object.keys(specs.sens).length > 0

    if (!hasCurves && !hasPoles && !hasSens) return null

    return (
      <div className={styles.summaryCard}>
        <div className={styles.summaryTitle}>Distribución de la gama</div>
        
        {hasCurves && (
          <div className={styles.summaryGroup}>
            <span className={styles.summaryLabel}>Curvas:</span>
            <div className={styles.summaryChips}>
              {Object.entries(specs.curves).sort().map(([c, count]) => (
                <span key={c} className={styles.summaryChip} title={CURVA_DESC[c] || ''}>
                  <strong>Curva {c}</strong>: {count} {count === 1 ? 'ref.' : 'refs.'}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasSens && (
          <div className={styles.summaryGroup}>
            <span className={styles.summaryLabel}>Sensibilidad:</span>
            <div className={styles.summaryChips}>
              {Object.entries(specs.sens).sort((a, b) => Number(a[0]) - Number(b[0])).map(([s, count]) => (
                <span key={s} className={styles.summaryChip} title={SENSIBILIDAD_DESC[s] || ''}>
                  <strong>{s} mA</strong>: {count} {count === 1 ? 'ref.' : 'refs.'}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasPoles && (
          <div className={styles.summaryGroup}>
            <span className={styles.summaryLabel}>Polos:</span>
            <div className={styles.summaryChips}>
              {POLA_ORDER.filter(p => specs.poles[p]).map(pola => {
                const count = specs.poles[pola]
                const label = pola === '1P' ? '1 Polo' :
                              pola === '1P+N' ? '1 Polo + Neutro' :
                              pola === '2P' ? '2 Polos' :
                              pola === '3P' ? '3 Polos' :
                              pola === '3P+N' ? '3 Polos + Neutro' :
                              pola === '4P' ? '4 Polos' : pola
                return (
                  <span key={pola} className={styles.summaryChip}>
                    <strong>{label}</strong>: {count} {count === 1 ? 'ref.' : 'refs.'}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.linearLayout}>
      <div className={styles.sectionHeader} role="status">
        <span className={`${styles.label} ${styles['label--brand']}`}>
          {sortedRefs.length} / {referenciasDisponibles.length} referencias
        </span>
        <h2 className={styles.sectionTitle}>
          {gamaComercial ? `${gamaComercial}${subgama ? ` — ${subgama}` : ''}` : subgama || (gama && tipo ? `${gama} — ${tipo}` : '')}
        </h2>
      </div>

      {referenciasDisponibles.length > 12 && (
        <div style={{ padding: '0 16px 8px', maxWidth: '400px', width: '100%', boxSizing: 'border-box' }}>
          <input
            type="text"
            placeholder="Filtrar referencias..."
            value={refFilter}
            onChange={e => setRefFilter(e.target.value)}
            className={styles.filterInput}
            aria-label="Filtrar referencias por código o nombre"
          />
        </div>
      )}

      {renderSummary()}

      <div className={styles.refsScroll} style={{ width: '100%', padding: '0 16px', boxSizing: 'border-box' }}>
        {sortedRefs.length > 0 ? (
          <div className={styles.fourColGrid} role="list" aria-label="Referencias disponibles">
            {sortedRefs.map((p, i) => (
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
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>
            {refFilter ? 'No hay referencias que coincidan con el filtro' : 'No hay referencias disponibles'}
          </div>
        )}
      </div>
    </div>
  )
}
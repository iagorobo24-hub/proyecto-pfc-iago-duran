import React from 'react'
import styles from '../../tools/FichasTecnicas.module.css'
import {
  extractCurve, extractAmps, extractPoles, POLA_ORDER,
  getCurvasDisponibles, getTiposDiferencial, getPolosDisponibles,
  getCalibresDisponibles, getSensibilidadesDisponibles,
  getFrameworksDisponibles,
  filterProductsBy,
  supportsTableView,
} from '../../hooks/useProductTable'
import VistaCurvaTipo from './VistaCurvaTipo'
import VistaCardConImagen from './VistaCardConImagen'
import ProductTable from '../ui/ProductTable'
import LinearRefCard from './LinearRefCard'
import Button from '../ui/Button'

const CURVE_ORDER = ['B', 'C', 'D', 'K', 'MA', 'TMD', 'Z']

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

  const filteredRefs = refFilter
    ? referenciasDisponibles.filter(p =>
        (p.ref_fabricante || '').toLowerCase().includes(refFilter.toLowerCase()) ||
        (p.name || '').toLowerCase().includes(refFilter.toLowerCase())
      )
    : referenciasDisponibles

  const esMagnetotermico = referenciasDisponibles.every(
    p => (p.subfamilia || '').trim() === 'Interruptor Magnetotérmico'
  )
  const soportaVistaAgrupada = supportsTableView(referenciasDisponibles)

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
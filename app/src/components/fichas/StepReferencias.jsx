import React from 'react'
import styles from '../../tools/FichasTecnicas.module.css'
import {
  extractCurve, extractAmps, extractPoles, POLA_ORDER,
  CURVA_DESC, SENSIBILIDAD_DESC, extractSensitivity,
} from '../../hooks/useProductTable'
import LinearRefCard from './LinearRefCard'

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
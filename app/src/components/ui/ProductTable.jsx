import React from 'react'
import styles from './ProductTable.module.css'
import { groupByTable, supportsTableView } from '../../hooks/useProductTable'

export { supportsTableView }

function VirtualSection({ children, placeholderHeight = 240 }) {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef(null)
  const once = React.useRef(false)

  React.useEffect(() => {
    if (once.current) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          once.current = true
          observer.disconnect()
        }
      },
      { rootMargin: '600px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={styles.virtualSection} style={{ minHeight: isVisible ? 0 : placeholderHeight }}>
      {isVisible ? children : null}
    </div>
  )
}

const RefButton = React.memo(function RefButton({ item, onSelect }) {
  return (
    <button
      className={styles.refBtn}
      onClick={() => onSelect?.(item)}
      title={item.name}
    >
      {item.ref_fabricante}
    </button>
  )
})

function findRepresentativeImage(rows) {
  const prefOrder = ['4P', '3P+N', '3P', '2P', '1P+N', '1P']
  for (const pola of prefOrder) {
    const key = Object.keys(rows).find(k => k.endsWith('-' + pola))
    if (!key) continue
    const ampMap = rows[key]
    for (const amp of Object.keys(ampMap)) {
      const item = ampMap[amp].find(p => p.imagen)
      if (item) return item.imagen
    }
  }
  return null
}

export default function ProductTable({ products, onSelect }) {
  const table = React.useMemo(() => groupByTable(products), [products])
  if (!table) return null

  const { polas, calibres } = table

  if (table.type === 'diferencial') {
    return <DiferencialTable table={table} polas={polas} calibres={calibres} products={products} onSelect={onSelect} />
  }

  return <MagnetotermicoTable table={table} polas={polas} calibres={calibres} products={products} onSelect={onSelect} />
}

const MagnetotermicoTable = React.memo(function MagnetotermicoTable({ table, polas, calibres, products, onSelect }) {
  const { sections } = table
  if (!sections || sections.length === 0 || polas.length === 0) return null

  return (
    <div className={styles.wrap}>
      {sections.map(section => {
        const { rows, subgama, curve } = section
        const activePolas = polas.filter(p => rows[curve + '-' + p])
        if (activePolas.length === 0) return null

        const repImage = findRepresentativeImage(rows)

        return (
          <VirtualSection key={subgama + '-' + curve} placeholderHeight={240}>
            <div className={styles.section}>
              <div className={styles.header}>
                {repImage && (
                  <div className={styles.repImage}>
                    <img src={repImage} alt="" className={styles.repImage__img} loading="lazy" />
                  </div>
                )}
                <span className={styles.badge}>{subgama !== 'general' ? subgama : (products[0]?.Gama || products[0]?.marca)}</span>
                <span className={styles.curveLabel}>Curva {curve}</span>
              </div>
              <div className={styles.table}>
                <div className={styles.tableHeader}>
                  <div className={styles.cellCalibre}>A</div>
                  {activePolas.map(p => (
                    <div key={p} className={styles.cellPola}>{p}</div>
                  ))}
                </div>
                {calibres.map(amp => {
                  const hasAny = activePolas.some(p => rows[curve + '-' + p]?.[amp])
                  if (!hasAny) return null
                  return (
                    <div key={amp} className={styles.tableRow}>
                      <div className={styles.cellCalibre}>{amp}</div>
                      {activePolas.map(pola => {
                        const items = rows[curve + '-' + pola]?.[amp]
                        if (!items) return <div key={pola} className={`${styles.cellRef} ${styles.cellRefEmpty}`} />
                        return (
                          <div key={pola} className={styles.cellRef}>
                            {items.map((p) => (
                              <RefButton key={p.id || p.ref_fabricante} item={p} onSelect={onSelect} />
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </VirtualSection>
        )
      })}
    </div>
  )
})

const DiferencialTable = React.memo(function DiferencialTable({ table, polas, calibres, products, onSelect }) {
  const { sensitivities } = table
  if (sensitivities.length === 0 || polas.length === 0) return null

  return (
    <div className={styles.wrap}>
      {sensitivities.map(sens => {
        const activePolas = polas.filter(p => table.rows[sens + '-' + p])
        if (activePolas.length === 0) return null

        const repImage = findRepresentativeImage(table.rows)

        return (
          <VirtualSection key={sens} placeholderHeight={240}>
            <div className={styles.section}>
              <div className={styles.header}>
                {repImage && (
                  <div className={styles.repImage}>
                    <img src={repImage} alt="" className={styles.repImage__img} loading="lazy" />
                  </div>
                )}
                <span className={styles.badge}>{products[0]?.Gama || products[0]?.marca}</span>
                <span className={styles.curveLabel}>{sens} mA</span>
              </div>
              <div className={styles.table}>
                <div className={styles.tableHeader}>
                  <div className={styles.cellCalibre}>A</div>
                  {activePolas.map(p => (
                    <div key={p} className={styles.cellPola}>{p}</div>
                  ))}
                </div>
                {calibres.map(amp => {
                  const hasAny = activePolas.some(p => table.rows[sens + '-' + p]?.[amp])
                  if (!hasAny) return null
                  return (
                    <div key={amp} className={styles.tableRow}>
                      <div className={styles.cellCalibre}>{amp}</div>
                      {activePolas.map(pola => {
                        const items = table.rows[sens + '-' + pola]?.[amp]
                        if (!items) return <div key={pola} className={`${styles.cellRef} ${styles.cellRefEmpty}`} />
                        return (
                          <div key={pola} className={styles.cellRef}>
                            {items.map((p) => (
                              <RefButton key={p.id || p.ref_fabricante} item={p} onSelect={onSelect} />
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </VirtualSection>
        )
      })}
    </div>
  )
})

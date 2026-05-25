import React from 'react'
import styles from './ProductTable.module.css'
import { groupByTable, supportsTableView } from '../../hooks/useProductTable'

export { supportsTableView }

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
  const table = groupByTable(products)
  if (!table) return null

  const { polas, calibres } = table

  if (table.type === 'diferencial') {
    return <DiferencialTable table={table} polas={polas} calibres={calibres} products={products} onSelect={onSelect} />
  }

  return <MagnetotermicoTable table={table} polas={polas} calibres={calibres} products={products} onSelect={onSelect} />
}

function MagnetotermicoTable({ table, polas, calibres, products, onSelect }) {
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
          <div key={subgama + '-' + curve} className={styles.section}>
            <div className={styles.header}>
              {repImage && (
                <div className={styles.repImage}>
                  <img src={repImage} alt="" className={styles.repImage__img} />
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
                          {items.map((p, i) => (
                            <button
                              key={p.id || p.ref_fabricante}
                              className={styles.refBtn}
                              onClick={() => onSelect?.(p)}
                              title={p.name}
                            >
                              {p.ref_fabricante}
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DiferencialTable({ table, polas, calibres, products, onSelect }) {
  const { sensitivities } = table
  if (sensitivities.length === 0 || polas.length === 0) return null

  return (
    <div className={styles.wrap}>
      {sensitivities.map(sens => {
        const activePolas = polas.filter(p => table.rows[sens + '-' + p])
        if (activePolas.length === 0) return null

        const repImage = findRepresentativeImage(table.rows)

        return (
          <div key={sens} className={styles.section}>
            <div className={styles.header}>
              {repImage && (
                <div className={styles.repImage}>
                  <img src={repImage} alt="" className={styles.repImage__img} />
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
                          {items.map((p, i) => (
                            <button
                              key={p.id || p.ref_fabricante}
                              className={styles.refBtn}
                              onClick={() => onSelect?.(p)}
                              title={p.name}
                            >
                              {p.ref_fabricante}
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

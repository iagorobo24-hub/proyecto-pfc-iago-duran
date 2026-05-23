import React from 'react'
import styles from './ProductTable.module.css'
import { groupByTable, supportsTableView } from '../../hooks/useProductTable'

export { supportsTableView }

export default function ProductTable({ products, onSelect }) {
  const table = groupByTable(products)
  if (!table) return null

  const { rows, polas, calibres } = table

  if (table.type === 'diferencial') {
    return <DiferencialTable table={table} rows={rows} polas={polas} calibres={calibres} products={products} onSelect={onSelect} />
  }

  return <MagnetotermicoTable table={table} rows={rows} polas={polas} calibres={calibres} products={products} onSelect={onSelect} />
}

function MagnetotermicoTable({ table, rows, polas, calibres, products, onSelect }) {
  const { curvas } = table
  if (curvas.length === 0 || polas.length === 0) return null

  return (
    <div className={styles.wrap}>
      {curvas.map(curve => {
        const activePolas = polas.filter(p => rows[curve + '-' + p])
        if (activePolas.length === 0) return null

        return (
          <div key={curve} className={styles.section}>
            <div className={styles.header}>
              <span className={styles.badge}>{products[0]?.Gama || products[0]?.marca}</span>
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

function DiferencialTable({ table, rows, polas, calibres, products, onSelect }) {
  const { sensitivities } = table
  if (sensitivities.length === 0 || polas.length === 0) return null

  return (
    <div className={styles.wrap}>
      {sensitivities.map(sens => {
        const activePolas = polas.filter(p => rows[sens + '-' + p])
        if (activePolas.length === 0) return null

        return (
          <div key={sens} className={styles.section}>
            <div className={styles.header}>
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
                const hasAny = activePolas.some(p => rows[sens + '-' + p]?.[amp])
                if (!hasAny) return null
                return (
                  <div key={amp} className={styles.tableRow}>
                    <div className={styles.cellCalibre}>{amp}</div>
                    {activePolas.map(pola => {
                      const items = rows[sens + '-' + pola]?.[amp]
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

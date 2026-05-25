import React from 'react'
import styles from './BudgetPrintView.module.css'

export default function BudgetPrintView({ presupuesto, datosCliente, numPresupuesto }) {
  const totalBase = presupuesto.reduce((s, p) => s + p.precio_total, 0)
  const ivaAmount = totalBase * ((datosCliente?.iva || 21) / 100)
  const totalFinal = totalBase + ivaAmount

  const fecha = new Date().toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className={styles.printPage}>
      <div className={styles.header}>
        <div className={styles.companyInfo}>
          <div className={styles.companyName}>PFC TOOLS</div>
          <p className={styles.companyTagline}>Proyectos de Automatización Industrial · CFGS</p>
        </div>
        <div className={styles.budgetMeta}>
          <div className={styles.budgetTitle}>PRESUPUESTO</div>
          <p className={styles.budgetNum}>{numPresupuesto}</p>
          <p className={styles.budgetDate}>{fecha}</p>
        </div>
      </div>

      {datosCliente?.nombre && (
        <div className={styles.clientSection}>
          <div className={styles.clientTitle}>Datos del cliente</div>
          <div className={styles.clientGrid}>
            <div><span className={styles.clientLabel}>Cliente: </span><span className={styles.clientValue}>{datosCliente.nombre}</span></div>
            <div><span className={styles.clientLabel}>CIF/NIF: </span><span className={styles.clientValue}>{datosCliente.cif || '—'}</span></div>
            {datosCliente.contacto && <div><span className={styles.clientLabel}>Contacto: </span><span className={styles.clientValue}>{datosCliente.contacto}</span></div>}
            {datosCliente.email && <div><span className={styles.clientLabel}>Email: </span><span className={styles.clientValue}>{datosCliente.email}</span></div>}
            {datosCliente.direccion && <div><span className={styles.clientLabel}>Dirección: </span><span className={styles.clientValue}>{datosCliente.direccion}, {datosCliente.poblacion || ''} {datosCliente.cp || ''}</span></div>}
            {datosCliente.provincia && <div><span className={styles.clientLabel}>Provincia: </span><span className={styles.clientValue}>{datosCliente.provincia}</span></div>}
          </div>
        </div>
      )}

      <div className={styles.tableWrap}>
        <div className={styles.tableTitle}>Partidas</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Descripción</th>
              <th>Cant.</th>
              <th>Precio Ud.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {presupuesto.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  No hay partidas
                </td>
              </tr>
            )}
            {presupuesto.map((p, i) => (
              <tr key={p._id ?? i}>
                <td className={styles.refCell}>{p.ref || '—'}</td>
                <td className={styles.descCell}>{p.desc || ''}</td>
                <td>{p.cantidad}</td>
                <td>{p.precio_unitario.toFixed(2)} €</td>
                <td>{p.precio_total.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.totalsSection}>
        <div className={styles.totalRow}>
          <span>Base imponible</span>
          <span>{totalBase.toFixed(2)} €</span>
        </div>
        <div className={styles.totalRow}>
          <span>IVA ({datosCliente?.iva || 21}%)</span>
          <span>{ivaAmount.toFixed(2)} €</span>
        </div>
        <div className={styles.totalRowFinal}>
          <span>Total</span>
          <span>{totalFinal.toFixed(2)} €</span>
        </div>
      </div>

      <div className={styles.termsSection}>
        <div className={styles.termsBlock}>
          <div className={styles.termsLabel}>Forma de pago</div>
          <div>{datosCliente?.forma_pago || 'Transferencia'}</div>
        </div>
        <div className={styles.termsBlock}>
          <div className={styles.termsLabel}>Plazo de entrega</div>
          <div>{datosCliente?.plazo_entrega || '15 días'}</div>
        </div>
        <div className={styles.termsBlock}>
          <div className={styles.termsLabel}>Validez</div>
          <div>{datosCliente?.validez || '30 días'}</div>
        </div>
      </div>

      <div className={styles.footer}>
        PFC Tools · Automatización Industrial · contacto@pfctools.com · Documento generado electrónicamente
      </div>
    </div>
  )
}

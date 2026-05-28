import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BudgetPrintView from './BudgetPrintView'
import { usePresupuestosContext } from './PresupuestosContext'
import styles from '../../tools/Presupuestos.module.css'

export default function PresupuestosPdf() {
  const navigate = useNavigate()
  const { partidas, datosCliente, numPresupuesto } = usePresupuestosContext()
  const printRef = useRef(null)
  const [exportando, setExportando] = useState(false)

  const exportarPDF = async () => {
    if (!printRef.current) return
    setExportando(true)
    try {
      const { generarPDFPresupuesto } = await import('../../utils/pdfGenerator')
      await generarPDFPresupuesto({
        presupuesto: partidas,
        datosCliente,
        numPresupuesto,
        elemento: printRef.current,
      })
    } catch (err) {
      console.error('Error al exportar PDF:', err)
    }
    setExportando(false)
  }

  return (
    <div className={styles.pdfOverlay}>
      <div className={styles.pdfToolbar}>
        <button className={styles.pdfToolbar__btn} onClick={() => navigate('../editor')}>
          ← Volver al editor
        </button>
        <button className={styles.pdfToolbar__btn} onClick={exportarPDF} disabled={exportando}>
          {exportando ? 'Generando PDF...' : '📄 Descargar PDF'}
        </button>
      </div>
      <div className={styles.pdfContainer} ref={printRef}>
        <BudgetPrintView
          presupuesto={partidas}
          datosCliente={datosCliente}
          numPresupuesto={numPresupuesto}
        />
      </div>
    </div>
  )
}

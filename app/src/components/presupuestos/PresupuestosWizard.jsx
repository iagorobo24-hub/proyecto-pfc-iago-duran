import { useNavigate } from 'react-router-dom'
import { usePresupuestosContext } from './PresupuestosContext'
import styles from '../../tools/Presupuestos.module.css'
import PresupuestosSeleccion from './PresupuestosSeleccion'

export default function PresupuestosWizard() {
  const navigate = useNavigate()
  const { categoria, historial, cargarPresupuesto } = usePresupuestosContext()

  if (categoria) {
    return <PresupuestosSeleccion />
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '2rem' }}>💰</span>
          <h1 className={styles.pageTitle}>Presupuestos</h1>
        </div>
        <p className={styles.pageSubtitle}>Selecciona una categoría del panel izquierdo para navegar por el catálogo</p>
      </div>

      <div className={styles.emptyState}>
        <div className={styles.emptyState__icon}>📋</div>
        <div className={styles.emptyState__title}>Nuevo Presupuesto</div>
        <div className={styles.emptyState__text}>
          Selecciona una categoría del panel izquierdo para empezar a añadir productos al presupuesto.
        </div>
      </div>

      {historial.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-400)' }}>
              Últimos presupuestos
            </h3>
            <button
              style={{
                fontSize: '0.75rem',
                color: 'var(--blue-600)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
              onClick={() => navigate('/app/presupuestos/gestion')}
            >
              Ver todos ({historial.length})
            </button>
          </div>
          <div className={styles.historialList}>
            {historial.slice(0, 5).map((h, i) => (
              <button key={i} className={styles.historialItem} onClick={() => cargarPresupuesto(h)}>
                <div className={styles.historialItem__header}>
                  <span className={styles.historialItem__delegacion}>{h.numero}</span>
                  <span className={styles.historialItem__fecha}>
                    {new Date(h.fecha).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className={styles.historialItem__turno}>
                  {h.cliente?.nombre || 'Sin cliente'} · {h.partidas?.length || 0} partidas
                </div>
                <div className={styles.historialItem__total}>{h.total?.toFixed(2) || '0'}€</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

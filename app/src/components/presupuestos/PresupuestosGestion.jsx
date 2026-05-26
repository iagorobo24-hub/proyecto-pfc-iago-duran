import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import { usePresupuestosContext } from './PresupuestosContext'
import styles from '../../tools/Presupuestos.module.css'

export default function PresupuestosGestion() {
  const navigate = useNavigate()
  const { historial, cargarPresupuesto, eliminarPresupuesto } = usePresupuestosContext()

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mis presupuestos</h1>
        <p className={styles.pageSubtitle}>
          {historial.length} presupuesto{historial.length !== 1 ? 's' : ''} guardado{historial.length !== 1 ? 's' : ''}
        </p>
      </div>

      {historial.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
          <p>No hay presupuestos guardados todavía.</p>
          <div style={{ marginTop: '16px' }}>
            <Button variant="primary" size="md" onClick={() => navigate('/app/presupuestos')}>
              Crear presupuesto
            </Button>
          </div>
        </div>
      )}

      {historial.length > 0 && (
        <div className={styles.gestionList}>
          {historial.map((h, i) => (
            <div key={i} className={styles.gestionItem}>
              <div className={styles.gestionItem__info} onClick={() => cargarPresupuesto(h)}>
                <div className={styles.gestionItem__header}>
                  <span className={styles.gestionItem__num}>{h.numero}</span>
                  <span className={styles.gestionItem__fecha}>
                    {new Date(h.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className={styles.gestionItem__cliente}>{h.cliente?.nombre || 'Sin cliente'}</div>
                <div className={styles.gestionItem__meta}>
                  {h.partidas?.length || 0} partidas · Total: {h.total?.toFixed(2) || '0'}€
                </div>
              </div>
              <div className={styles.gestionItem__actions}>
                <button
                  className={styles.gestionItem__delete}
                  onClick={() => eliminarPresupuesto(i)}
                  title="Eliminar presupuesto"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/presupuestos')}>
          ← Volver
        </Button>
      </div>
    </>
  )
}

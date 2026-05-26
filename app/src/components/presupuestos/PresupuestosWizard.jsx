import { useNavigate } from 'react-router-dom'
import { FULL_CATEGORY_INFO } from '../../data/categoryMapping'
import Button from '../ui/Button'
import { usePresupuestosContext } from './PresupuestosContext'
import styles from '../../tools/Presupuestos.module.css'

const CATEGORIAS = Object.keys(FULL_CATEGORY_INFO).map(key => ({
  id: key,
  label: key,
  icon: FULL_CATEGORY_INFO[key].icon,
}))

export default function PresupuestosWizard() {
  const navigate = useNavigate()
  const { categoria, setCategoria, historial, cargarPresupuesto } = usePresupuestosContext()

  return (
    <>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '2rem' }}>💰</span>
          <h1 className={styles.pageTitle}>Presupuestos</h1>
        </div>
        <p className={styles.pageSubtitle}>Genera presupuestos técnicos seleccionando referencias del catálogo</p>
      </div>

      <h3
        style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--gray-600)',
          marginBottom: '24px',
        }}
      >
        Selecciona la categoría de instalación
      </h3>
      <div className={styles.categoriasGrid}>
        {CATEGORIAS.map(c => (
          <button
            key={c.id}
            className={`${styles.catCard} ${categoria === c.id ? styles['catCard--active'] : ''}`}
            onClick={() => setCategoria(c.id)}
          >
            <span className={styles.catCard__icon}>{c.icon}</span>
            <span className={styles.catCard__name}>{c.label}</span>
          </button>
        ))}
      </div>

      {categoria && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Button variant="primary" size="lg" onClick={() => navigate('seleccion')}>
            Ver catálogo de {CATEGORIAS.find(c => c.id === categoria)?.label} →
          </Button>
        </div>
      )}

      {historial.length > 0 && !categoria && (
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
              onClick={() => navigate('gestion')}
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

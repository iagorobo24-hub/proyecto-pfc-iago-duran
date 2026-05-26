import Button from '../ui/Button'
import styles from '../../tools/SimuladorAlmacen.module.css'

export default function SimuladorEtapa({
  ETAPAS,
  etapaActual,
  tiempoEtapa,
  fmtT,
  estandarActual,
  semaforoActual,
  incActiva,
  feedbackInc,
  log,
  avanzarEtapa,
  responderIncidencia,
  continuarTrasFeedback,
}) {
  return (
    <div className={styles.circleLayout}>
      <div className={styles.timer}>{fmtT(tiempoEtapa)}</div>

      {semaforoActual && (
        <span
          className={`${styles.badge} ${semaforoActual.label === 'OK' ? 'badge--basico' : semaforoActual.label === 'Lento' ? 'badge--intermedio' : 'badge--avanzado'}`}
          style={{
            background: semaforoActual.bg,
            color: semaforoActual.color,
            padding: '4px 12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-full)',
          }}
        >
          ● {semaforoActual.label}
        </span>
      )}

      {!incActiva && !feedbackInc && (
        <div className={styles.fichaCard} style={{ maxWidth: 600, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                ETAPA ACTIVA
              </div>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>{ETAPAS[etapaActual].icono}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-800)' }}>{ETAPAS[etapaActual].nombre}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '4px' }}>{ETAPAS[etapaActual].desc}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--gray-400)', marginBottom: '4px' }}>ESTÁNDAR</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                {estandarActual ? fmtT(estandarActual) : 'N/A'}
              </div>
            </div>
          </div>
          <Button variant="primary" size="md" onClick={avanzarEtapa} style={{ width: '100%' }}>
            {etapaActual < ETAPAS.length - 1 ? `Completar ${ETAPAS[etapaActual].nombre} →` : 'Completar ciclo ✓'}
          </Button>
        </div>
      )}

      {incActiva && !feedbackInc && (
        <div className={styles.incidenciaCard}>
          <div className={styles.incidenciaCard__title}>⚡ {incActiva.titulo}</div>
          <div className={styles.incidenciaCard__desc}>{incActiva.descripcion}</div>
          <div className={styles.incidenciaCard__opciones}>
            {incActiva.opciones.map((op, i) => (
              <button key={i} className={styles.incidenciaCard__opcion} onClick={() => responderIncidencia(op)}>
                {op.texto}
              </button>
            ))}
          </div>
        </div>
      )}

      {feedbackInc && (
        <div
          className={`${styles.incidenciaCard__feedback} ${feedbackInc.correcto ? styles['incidenciaCard__feedback--correcto'] : styles['incidenciaCard__feedback--incorrecto']}`}
          style={{ padding: '20px', borderRadius: 'var(--radius-lg)', maxWidth: 600, width: '100%' }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.25rem' }}>{feedbackInc.correcto ? '✅' : '⚠️'}</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: feedbackInc.correcto ? 'var(--success)' : 'var(--warning)' }}>
              {feedbackInc.correcto ? '¡Correcto!' : 'Respuesta incorrecta'}
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: '16px' }}>{feedbackInc.feedback}</div>
          <Button variant="primary" size="sm" onClick={continuarTrasFeedback}>Continuar →</Button>
        </div>
      )}

      {log.length > 0 && (
        <div style={{ maxWidth: 600, width: '100%', marginTop: '24px' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.06em', marginBottom: '8px' }}>
            LOG DE EVENTOS
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {log.map((entry, i) => (
              <div
                key={i}
                style={{
                  fontSize: '0.75rem', fontFamily: 'monospace',
                  color: i === 0 ? 'var(--blue-800)' : 'var(--gray-400)',
                  marginBottom: '4px', lineHeight: 1.4,
                  paddingBottom: '6px',
                  borderBottom: i < log.length - 1 ? '1px solid var(--gray-50)' : 'none',
                }}
              >
                {entry}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

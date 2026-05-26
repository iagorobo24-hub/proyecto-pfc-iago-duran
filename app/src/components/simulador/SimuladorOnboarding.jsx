import styles from '../../tools/SimuladorAlmacen.module.css'

export default function SimuladorOnboarding({
  operario,
  historial,
  mostrarHistorial,
  setMostrarHistorial,
  iniciarSimulacion,
  verHistorial,
  pedidosDemo,
}) {
  return (
    <div className={styles.circleLayout}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '2rem' }}>📋</span>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '4px' }}>
          Hola, {operario.nombre}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)' }}>Elige un modo de simulación</p>
      </div>

      <div className={styles.etapasGrid} style={{ gap: '12px' }}>
        <button onClick={() => iniciarSimulacion(pedidosDemo[0], 'entrenamiento')} className={styles.etapaCard} style={{ minWidth: '240px' }}>
          <span style={{ fontSize: '2rem' }}>🎓</span>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)' }}>Entrenamiento</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Con feedback inmediato</span>
        </button>
        <button onClick={() => iniciarSimulacion(pedidosDemo[0], 'evaluacion')} className={styles.etapaCard} style={{ minWidth: '240px' }}>
          <span style={{ fontSize: '2rem' }}>📝</span>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-800)' }}>Evaluación</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Sin ayuda durante el proceso</span>
        </button>
      </div>

      {historial.length > 0 && (
        <div style={{ marginTop: '32px', width: '100%', maxWidth: '600px' }}>
          <button
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
            style={{
              fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-500)',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto',
            }}
          >
            {mostrarHistorial ? '▲' : '▼'} Últimas simulaciones ({historial.length})
          </button>
          {mostrarHistorial && (
            <div className={styles.historialList} style={{ marginTop: '12px' }}>
              {historial.slice(0, 5).map((h, i) => (
                <button key={i} className={styles.historialItem} onClick={() => verHistorial(h)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{h.pedido.producto}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--blue-800)' }}>
                      {h.puntuacion}/100
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                    {new Date(h.fecha).toLocaleDateString('es-ES')} · {h.operario}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

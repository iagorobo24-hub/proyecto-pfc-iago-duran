import Button from '../ui/Button'
import styles from '../../tools/SimuladorAlmacen.module.css'

export default function SimuladorResultados({
  pedidoActivo,
  tiempos,
  ETAPAS,
  puntuacionActual,
  fmtT,
  incResueltas,
  getEstandar,
  getSemaforo,
  cargando,
  analisis,
  resetear,
  volver,
}) {
  return (
    <div className={styles.circleLayout}>
      <div className={styles.resultsCard}>
        <div className={styles.resultsCard__title}>Simulación completada</div>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '24px' }}>
          {pedidoActivo.producto}
        </p>

        <div className={styles.resultsCard__stats}>
          {[
            { label: 'Puntuación', valor: `${puntuacionActual}`, unidad: '/100' },
            { label: 'Tiempo', valor: fmtT(tiempos.reduce((a, b) => a + b, 0)) },
            { label: 'Incidencias', valor: `${incResueltas.filter(r => r.correcto).length}/${incResueltas.length}` },
          ].map(({ label, valor, unidad }) => (
            <div key={label} className={styles.resultsCard__stat}>
              <div className={styles.resultsCard__statValue}>{valor}</div>
              {unidad && <div className={styles.resultsCard__statLabel}>{unidad}</div>}
              <div className={styles.resultsCard__statLabel}>{label}</div>
            </div>
          ))}
        </div>

        <div className={styles.fichaCard} style={{ marginBottom: '16px', padding: '0', overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid', gridTemplateColumns: '140px 80px 80px 60px 1fr',
              padding: '10px 16px', background: 'var(--gray-50)',
              fontSize: '0.625rem', fontWeight: 600, color: 'var(--gray-400)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}
          >
            {['Etapa', 'Tiempo', 'Estándar', 'Desv.', 'Resultado'].map(h => <div key={h}>{h}</div>)}
          </div>
          {ETAPAS.map((e, i) => {
            const est = getEstandar(i, pedidoActivo.categoria) || 75
            const desv = Math.round(((tiempos[i] - est) / est) * 100)
            const sem = getSemaforo(tiempos[i], est)
            return (
              <div
                key={i}
                style={{
                  display: 'grid', gridTemplateColumns: '140px 80px 80px 60px 1fr',
                  padding: '11px 16px',
                  borderBottom: i < 4 ? '1px solid var(--gray-100)' : 'none',
                  alignItems: 'center',
                  background: i % 2 === 0 ? 'var(--white)' : 'var(--gray-50)',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span>{e.icono}</span><span>{e.nombre}</span>
                </div>
                <div style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontSize: '0.8125rem' }}>
                  {fmtT(tiempos[i])}
                </div>
                <div style={{ color: 'var(--gray-400)', fontVariantNumeric: 'tabular-nums', fontSize: '0.8125rem' }}>
                  {fmtT(est)}
                </div>
                <div style={{ fontWeight: 600, color: desv > 0 ? 'var(--error)' : 'var(--success)', fontSize: '0.8125rem' }}>
                  {desv > 0 ? '+' : ''}{desv}%
                </div>
                <div
                  style={{
                    display: 'inline-block', padding: '2px 8px',
                    background: sem?.bg, color: sem?.color,
                    fontSize: '0.625rem', fontWeight: 600, borderRadius: 'var(--radius-full)',
                  }}
                >
                  {sem?.label || '—'}
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles.tipCard} style={{ textAlign: 'left', marginBottom: '16px' }}>
          <div className={styles.tipCard__label}>✦ Análisis IA</div>
          {cargando ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--gray-400)', fontSize: '0.8125rem' }}>
              <div className={styles.spinner} /> Analizando sesión…
            </div>
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {analisis}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button variant="primary" onClick={resetear}>Nueva simulación →</Button>
          <Button variant="secondary" onClick={volver}>Volver</Button>
        </div>
      </div>
    </div>
  )
}

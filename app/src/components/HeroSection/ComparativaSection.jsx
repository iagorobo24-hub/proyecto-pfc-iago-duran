import styles from './ComparativaSection.module.css'

const COMPARATIVAS = [
  {
    antes: 'Buscar en 5 catálogos PDF distintos',
    despues: 'Consulta unificada con IA en segundos',
    icono: '🔍',
    metricas: { antes: '25 min', despues: '2 min', mejora: '-92%' },
  },
  {
    antes: 'Errores de picking cada 10 pedidos',
    despues: 'Simulador con incidencias reales',
    icono: '📦',
    metricas: { antes: '10% error', despues: '2% error', mejora: '-80%' },
  },
  {
    antes: 'Presupuestos a mano en Excel',
    despues: 'Generación con referencias del catálogo',
    icono: '📄',
    metricas: { antes: '45 min', despues: '5 min', mejora: '-89%' },
  },
  {
    antes: 'Incidencias en papel sin trazabilidad',
    despues: 'Dashboard con diagnóstico IA automático',
    icono: '🛡️',
    metricas: { antes: '4h respuesta', despues: '30min respuesta', mejora: '-87%' },
  },
]

export default function ComparativaSection() {
  return (
    <section className={styles.section} id="comparativa">
      <div className={styles.container}>
        <div className={styles.badge}>IMPACTO REAL</div>
        <h2 className={styles.title}>Antes vs. Después</h2>
        <p className={styles.subtitle}>
          La diferencia que marca contar con herramientas técnicas integradas
        </p>

        <div className={styles.grid}>
          {COMPARATIVAS.map((item, i) => (
            <motion.div
              key={i}
              className={styles.card}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <div className={styles.icon}>{item.icono}</div>
              <div className={styles.columns}>
                <div className={styles.colAntes}>
                  <div className={styles.colLabel}>Antes</div>
                  <div className={styles.colValue}>{item.antes}</div>
                  <div className={styles.colMetrica}>{item.metricas.antes}</div>
                </div>
                <div className={styles.vs}>VS</div>
                <div className={styles.colDespues}>
                  <div className={styles.colLabel}>Después</div>
                  <div className={styles.colValue}>{item.despues}</div>
                  <div className={styles.colMejora}>{item.metricas.mejora}</div>
                </div>
              </div>
              <div className={styles.bar}>
                <div className={styles.barBg}>
                  <div
                    className={styles.barFill}
                    style={{ width: item.metricas.mejora }}
                  />
                </div>
                <span className={styles.barLabel}>{item.metricas.mejora}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

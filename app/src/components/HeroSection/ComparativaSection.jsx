import { motion } from 'framer-motion'
import styles from './ComparativaSection.module.css'

const COMPARATIVAS = [
  {
    antes: 'Buscar referencias en fuentes separadas',
    despues: 'Consulta unificada desde el catálogo y SONEX',
    beneficio: 'Menos cambio de contexto',
    icono: '🔍',
  },
  {
    antes: 'Practicar procesos de almacén solo de forma teórica',
    despues: 'Recorrer un flujo interactivo con incidencias y puntuación',
    beneficio: 'Práctica guiada',
    icono: '📦',
  },
  {
    antes: 'Preparar presupuestos manualmente',
    despues: 'Partir de referencias del catálogo y exportar el resultado',
    beneficio: 'Flujo más consistente',
    icono: '📄',
  },
  {
    antes: 'Registrar incidencias sin un flujo común',
    despues: 'Centralizar registro, seguimiento y diagnóstico asistido',
    beneficio: 'Mayor trazabilidad',
    icono: '🛡️',
  },
]

export default function ComparativaSection() {
  return (
    <section className={styles.section} id="comparativa">
      <div className={styles.container}>
        <div className={styles.badge}>MEJORAS DE FLUJO</div>
        <h2 className={styles.title}>Antes vs. con la suite</h2>
        <p className={styles.subtitle}>
          Beneficios funcionales derivados de integrar herramientas y datos en un mismo entorno. No se presentan porcentajes sin una medición reproducible que los respalde.
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
                </div>
                <div className={styles.vs}>VS</div>
                <div className={styles.colDespues}>
                  <div className={styles.colLabel}>Con la suite</div>
                  <div className={styles.colValue}>{item.despues}</div>
                </div>
              </div>
              <div className={styles.bar}>
                <span className={styles.barLabel}>{item.beneficio}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

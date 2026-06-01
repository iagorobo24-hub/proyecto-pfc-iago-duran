import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { ROADMAP_PHASES, ROADMAP_CATEGORIES } from '../../data/roadmapData';
import styles from './styles/Roadmap.module.css';

const statusConfig = {
  done: { icon: CheckCircle2, label: 'Completado', className: 'done' },
  progress: { icon: Loader2, label: 'En progreso', className: 'progress' },
  pending: { icon: Circle, label: 'Pendiente', className: 'pending' },
}

function PhaseCard({ phase }) {
  const StatusIcon = statusConfig[phase.status].icon
  const cat = ROADMAP_CATEGORIES[phase.category]
  const catColor = `var(${cat.color})`

  return (
    <motion.div
      className={styles.phaseCard}
      variants={item}
      style={{ '--cat-color': catColor }}
    >
      <div className={styles.phaseHeader}>
        <div className={styles.phaseIcon} style={{ color: catColor, borderColor: catColor }}>
          <StatusIcon size={20} className={phase.status === 'progress' ? styles.spinning : ''} />
        </div>
        <div className={styles.phaseInfo}>
          <div className={styles.phaseMeta}>
            <span className={styles.phaseLabel}>{phase.version}</span>
            <span className={styles.phaseDate}>{phase.date}</span>
          </div>
          <h3 className={styles.phaseTitle}>{phase.title}</h3>
        </div>
        <span className={`${styles.statusBadge} ${styles[phase.status]}`}>
          {statusConfig[phase.status].label}
        </span>
      </div>
      <ul className={styles.itemsList}>
        {phase.items.map((item, j) => (
          <li key={j} className={styles.item}>
            {phase.status === 'done' && <CheckCircle2 size={12} />}
            {phase.status === 'progress' && <span className={styles.dot} />}
            {phase.status === 'pending' && <span className={`${styles.dot} ${styles.dotPending}`} />}
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Roadmap() {
  const categories = Object.entries(ROADMAP_CATEGORIES)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, cat]) => ({
      key,
      ...cat,
      phases: ROADMAP_PHASES.filter(p => p.category === key),
    }))
    .filter(c => c.phases.length > 0)

  const doneCount = ROADMAP_PHASES.filter(p => p.status === 'done').length
  const totalCount = ROADMAP_PHASES.length

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.badge}>Evolución del proyecto</span>
          <h2 className={styles.title}>Roadmap</h2>
          <p className={styles.subtitle}>
            {doneCount} de {totalCount} fases completadas. Cada fase suma capacidades nuevas al ecosistema.
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
        </motion.header>

        {categories.map(cat => (
          <div key={cat.key} className={styles.categoryGroup}>
            <div className={styles.categoryHeader} style={{ '--cat-color': `var(${cat.color})` }}>
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <h3 className={styles.categoryTitle}>{cat.label}</h3>
              <span className={styles.categoryCount}>{cat.phases.length} fases</span>
            </div>

            <motion.div
              className={styles.timeline}
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {cat.phases.map((phase) => (
                <PhaseCard key={phase.id} phase={phase} />
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}

import { useNavigate } from 'react-router-dom'
import styles from './DashboardWidget.module.css'

export default function DashboardWidget({ icon, title, route, metric, subtitle, color = 'var(--color-brand)', children }) {
  const navigate = useNavigate()

  return (
    <div className={styles.card} onClick={() => navigate(route)}>
      <div className={styles.header}>
        <div className={styles.iconWrap} style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
          {icon}
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.title}>{title}</div>
          {metric !== undefined && metric !== null && (
            <div className={styles.metric} style={{ color }}>{metric}</div>
          )}
        </div>
      </div>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      {children && <div className={styles.body}>{children}</div>}
    </div>
  )
}

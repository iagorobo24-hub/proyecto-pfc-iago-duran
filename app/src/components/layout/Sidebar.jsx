import { NavLink, useLocation } from 'react-router-dom'
import {
  FileText, Warehouse, ShieldAlert, TrendingUp,
  Euro, GraduationCap, Bot
} from 'lucide-react'
import styles from './Sidebar.module.css'
import { TOOLS, TOOLS_BY_PATH, normalizeToolPath } from '../../config/tools'

const ICONS = {
  FileText,
  Warehouse,
  ShieldAlert,
  TrendingUp,
  Euro,
  GraduationCap,
  Bot,
}

/* Sidebar — navegación + info de la herramienta activa */
export default function Sidebar({ collapsed = false }) {
  const { pathname } = useLocation()
  const activePath = normalizeToolPath(pathname)
  const tool = TOOLS_BY_PATH[activePath] || TOOLS_BY_PATH['/fichas']
  const Icon = ICONS[tool.icon] || FileText

  return (
    <aside className={styles.sidebar} role="navigation" aria-label="Menú de herramientas">
      {/* Icono de la herramienta activa */}
      <div className={`${styles.iconSection} ${collapsed ? styles.iconSectionCollapsed : ''}`}>
        <div className={styles.iconWrap} title={tool.nombre} aria-label={`Herramienta: ${tool.nombre}`}>
          <Icon size={collapsed ? 22 : 24} strokeWidth={1.5} aria-hidden="true" />
        </div>
        {!collapsed && (
          <p className={styles.toolNombre} role="heading" aria-level="2">{tool.nombre}</p>
        )}
      </div>

      {/* Navegación a todas las herramientas */}
      {!collapsed && (
        <nav className={styles.navSection} aria-label="Herramientas">
          {TOOLS.map(t => {
            const ToolIcon = ICONS[t.icon] || FileText
            const isActive = t.path === activePath
            return (
              <NavLink
                key={t.path}
                to={t.appPath}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <ToolIcon size={16} strokeWidth={1.5} aria-hidden="true" />
                <span className={styles.navItemLabel}>{t.nombre}</span>
              </NavLink>
            )
          })}
        </nav>
      )}

      {/* Descripción y consejo — solo de la herramienta activa */}
      {!collapsed && (
        <div className={styles.infoSection}>
          <p className={styles.descripcion}>{tool.descripcion}</p>
          <div className={styles.consejo}>
            <span className={styles.consejoLabel}>Consejo</span>
            <p className={styles.consejoTexto}>{tool.consejo}</p>
          </div>
        </div>
      )}
    </aside>
  )
}

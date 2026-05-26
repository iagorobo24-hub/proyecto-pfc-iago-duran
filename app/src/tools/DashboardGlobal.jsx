import { BookOpen, Warehouse, ShieldAlert, BarChart3, Receipt, GraduationCap, Bot, Activity } from 'lucide-react'
import useMemoriaUsuario from '../hooks/useMemoriaUsuario'
import DashboardWidget from '../components/ui/DashboardWidget'
import { getAnalyticsSummary } from '../hooks/useAnalytics'
import styles from './DashboardGlobal.module.css'

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Ahora'
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function DashboardGlobal() {
  const memoria = useMemoriaUsuario()

  const fichas = memoria.fichas.historial.use()[0]
  const incidencias = memoria.incidencias.listado.use()[0]
  const presupuestos = memoria.presupuestos.historial.use()[0]
  const kpiHistorial = memoria.kpi.historial.use()[0]

  const criticas = incidencias.filter(i => i.severidad === 'Crítica' && i.estado !== 'Resuelta').length
  const ultimaFicha = fichas.length > 0 ? fichas[fichas.length - 1] : null
  const kpiReciente = kpiHistorial.length > 0 ? kpiHistorial[kpiHistorial.length - 1] : null

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <h1 className={styles.title}>Panel de control</h1>
        <p className={styles.subtitle}>Resumen rápido de todas las herramientas</p>
      </div>

      <div className={styles.grid}>
        <DashboardWidget
          icon={<BookOpen size={22} />}
          title="Fichas Técnicas"
          route="/app/fichas"
          metric={ultimaFicha ? '✓' : '—'}
          subtitle={ultimaFicha ? `Última: ${ultimaFicha.name || ultimaFicha.ref || ultimaFicha}` : 'Aún sin consultas'}
          color="var(--blue-600)"
        >
          {fichas.length > 0 && `${fichas.length} productos vistos`}
        </DashboardWidget>

        <DashboardWidget
          icon={<Warehouse size={22} />}
          title="Simulador Almacén"
          route="/app/almacen"
          metric="—"
          subtitle="Simula pedidos y optimiza rutas"
          color="var(--success)"
        />

        <DashboardWidget
          icon={<ShieldAlert size={22} />}
          title="Incidencias"
          route="/app/incidencias"
          metric={criticas > 0 ? criticas : incidencias.length}
          subtitle={
            criticas > 0
              ? `${criticas} crítica${criticas > 1 ? 's' : ''} sin resolver`
              : `${incidencias.length} incidencia${incidencias.length !== 1 ? 's' : ''} registrada${incidencias.length !== 1 ? 's' : ''}`
          }
          color={criticas > 0 ? 'var(--error)' : 'var(--warning)'}
        >
          {incidencias.filter(i => i.estado === 'Resuelta').length} resueltas
        </DashboardWidget>

        <DashboardWidget
          icon={<BarChart3 size={22} />}
          title="KPI Logístico"
          route="/app/kpi"
          metric={kpiReciente ? '✓' : '—'}
          subtitle={kpiReciente ? `Último: ${kpiReciente.fecha ? formatDate(kpiReciente.fecha) : 'reciente'}` : 'Aún sin datos'}
          color="var(--color-brand)"
        >
          {kpiHistorial.length > 0 && `${kpiHistorial.length} informe${kpiHistorial.length !== 1 ? 's' : ''}`}
        </DashboardWidget>

        <DashboardWidget
          icon={<Receipt size={22} />}
          title="Presupuestos"
          route="/app/presupuestos"
          metric={presupuestos.length}
          subtitle={`${presupuestos.length} presupuesto${presupuestos.length !== 1 ? 's' : ''}`}
          color="var(--warning)"
        >
          {presupuestos.length > 0 && (
            <>Último: {formatDate(presupuestos[presupuestos.length - 1].fechaCreacion || presupuestos[presupuestos.length - 1].fecha)}</>
          )}
        </DashboardWidget>

        <DashboardWidget
          icon={<GraduationCap size={22} />}
          title="Formación Interna"
          route="/app/formacion"
          metric="—"
          subtitle="Matriz de competencias y planes"
          color="var(--blue-600)"
        />

        <DashboardWidget
          icon={<Bot size={22} />}
          title="SONEX"
          route="/app/sonex"
          metric="—"
          subtitle="Asistente técnico con IA"
          color="var(--blue-600)"
        />
      </div>

      <AnalyticsFooter />
    </div>
  )
}

function AnalyticsFooter() {
  const summary = getAnalyticsSummary()
  const topTools = Object.entries(summary.toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)

  return (
    <div className={styles.analyticsSection}>
      <div className={styles.analyticsHeader}>
        <Activity size={16} />
        <span>Actividad</span>
      </div>
      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsItem}>
          <div className={styles.analyticsValue}>{summary.total}</div>
          <div className={styles.analyticsLabel}>Eventos totales</div>
        </div>
        <div className={styles.analyticsItem}>
          <div className={styles.analyticsValue}>{summary.hoy}</div>
          <div className={styles.analyticsLabel}>Hoy</div>
        </div>
        <div className={styles.analyticsItem}>
          <div className={styles.analyticsValue}>{summary.pageViews}</div>
          <div className={styles.analyticsLabel}>Vistas de página</div>
        </div>
        <div className={styles.analyticsItem}>
          <div className={styles.analyticsValue}>{summary.uniquePages}</div>
          <div className={styles.analyticsLabel}>Rutas distintas</div>
        </div>
        <div className={styles.analyticsItem}>
          <div className={styles.analyticsValue}>{summary.aiErrors}</div>
          <div className={styles.analyticsLabel}>Errores IA</div>
        </div>
        <div className={styles.analyticsItem}>
          <div className={styles.analyticsValue}>{summary.searchNoResults}</div>
          <div className={styles.analyticsLabel}>Búsquedas sin resultado</div>
        </div>
      </div>
      {topTools.length > 0 && (
        <div className={styles.analyticsTools}>
          {topTools.map(([tool, count]) => (
            <span key={tool} className={styles.analyticsTool}>
              {tool}: {count}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

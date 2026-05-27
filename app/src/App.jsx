import { Suspense, lazy, Component } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import LoginPage from './components/auth/LoginPage'
import LandingPage from './pages/LandingPage'
import useDocumentTitle from './hooks/useDocumentTitle'

const FichasTecnicas = lazy(() => import('./tools/FichasTecnicas'))
const SimuladorAlmacen = lazy(() => import('./tools/SimuladorAlmacen'))
const DashboardIncidencias = lazy(() => import('./tools/DashboardIncidencias'))
const KpiLogistico = lazy(() => import('./tools/KpiLogistico'))
const PresupuestosLayout = lazy(() => import('./components/presupuestos/PresupuestosLayout'))
const PresupuestosWizard = lazy(() => import('./components/presupuestos/PresupuestosWizard'))
const PresupuestosSeleccion = lazy(() => import('./components/presupuestos/PresupuestosSeleccion'))
const PresupuestosEditor = lazy(() => import('./components/presupuestos/PresupuestosEditor'))
const PresupuestosGestion = lazy(() => import('./components/presupuestos/PresupuestosGestion'))
const PresupuestosPdf = lazy(() => import('./components/presupuestos/PresupuestosPdf'))
const FormacionInterna = lazy(() => import('./tools/FormacionInterna'))
const Sonex = lazy(() => import('./tools/Sonex'))
const DashboardGlobal = lazy(() => import('./tools/DashboardGlobal'))

const FichasTecnicasPage = () => { useDocumentTitle('Fichas Técnicas', 'Catálogo de productos eléctricos con IA — Schneider, ABB, Siemens'); return <FichasTecnicas /> }
const SimuladorAlmacenPage = () => { useDocumentTitle('Simulador Almacén', 'Simula procesos de almacén logístico con incidencias reales'); return <SimuladorAlmacen /> }
const DashboardIncidenciasPage = () => { useDocumentTitle('Incidencias', 'Gestión y diagnóstico de incidencias industriales con IA'); return <DashboardIncidencias /> }
const KpiLogisticoPage = () => { useDocumentTitle('KPI Logístico', 'Métricas y análisis de rendimiento logístico'); return <KpiLogistico /> }
const FormacionInternaPage = () => { useDocumentTitle('Formación Interna', 'Matriz de competencias y planes de formación'); return <FormacionInterna /> }
const SonexPage = () => { useDocumentTitle('SONEX', 'Asistente técnico con IA para mantenimiento industrial'); return <Sonex /> }
const DashboardGlobalPage = () => { useDocumentTitle('Dashboard', 'Panel de control de todas las herramientas'); return <DashboardGlobal /> }

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info) }
  render() {
    if (this.state.error) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', padding: '40px', fontFamily: 'var(--font-body)', color: 'var(--gray-800)', background: 'var(--gray-50)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Algo salió mal</h2>
          <p style={{ color: 'var(--gray-500)', maxWidth: 400, textAlign: 'center' }}>
            {this.state.error.message || 'Error inesperado al cargar la herramienta.'}
          </p>
          <button onClick={() => { this.setState({ error: null }); window.location.reload() }}
            style={{ padding: '10px 24px', background: 'var(--color-brand)', color: 'var(--color-on-brand)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--blue-800)' }}>
    <div className="animate-pulse">Cargando herramienta...</div>
  </div>
)

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Suspense fallback={<PageLoader />}><DashboardGlobalPage /></Suspense>} />
          <Route path="fichas"       element={<Suspense fallback={<PageLoader />}><FichasTecnicasPage /></Suspense>} />
          <Route path="almacen"      element={<Suspense fallback={<PageLoader />}><SimuladorAlmacenPage /></Suspense>} />
          <Route path="incidencias"  element={<Suspense fallback={<PageLoader />}><DashboardIncidenciasPage /></Suspense>} />
          <Route path="kpi"          element={<Suspense fallback={<PageLoader />}><KpiLogisticoPage /></Suspense>} />
          <Route path="presupuestos" element={<Suspense fallback={<PageLoader />}><PresupuestosLayout /></Suspense>}>
            <Route index element={<Suspense fallback={<PageLoader />}><PresupuestosWizard /></Suspense>} />
            <Route path="seleccion" element={<Suspense fallback={<PageLoader />}><PresupuestosSeleccion /></Suspense>} />
            <Route path="editor" element={<Suspense fallback={<PageLoader />}><PresupuestosEditor /></Suspense>} />
            <Route path="gestion" element={<Suspense fallback={<PageLoader />}><PresupuestosGestion /></Suspense>} />
            <Route path="pdf" element={<Suspense fallback={<PageLoader />}><PresupuestosPdf /></Suspense>} />
          </Route>
          <Route path="formacion"    element={<Suspense fallback={<PageLoader />}><FormacionInternaPage /></Suspense>} />
          <Route path="sonex"        element={<Suspense fallback={<PageLoader />}><SonexPage /></Suspense>} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}

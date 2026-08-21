/**
 * @file App.jsx
 * @description Componente principal de la aplicación que gestiona el enrutamiento global,
 * la carga perezosa (lazy loading) de pantallas, el manejo de errores (ErrorBoundary)
 * y la persistencia de títulos de página.
 */

import { Suspense, lazy, Component } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import LoginPage from './components/auth/LoginPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import CloudFeatureGate from './components/auth/CloudFeatureGate'
import LandingPage from './pages/LandingPage'
import NotFound from './pages/NotFound'
import useDocumentTitle from './hooks/useDocumentTitle'
import styles from './components/ui/ErrorBoundary.module.css'

// Carga perezosa (lazy loading) de los módulos y herramientas para optimizar el tamaño del bundle inicial.
// Cada componente se cargará bajo demanda del cliente.
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

/**
 * Wrappers funcionales de páginas que establecen el título del documento (SEO y usabilidad)
 * y devuelven el respectivo componente.
 */
const FichasTecnicasPage = () => { useDocumentTitle('Fichas Técnicas', 'Catálogo de productos eléctricos con IA — Schneider, ABB, Siemens'); return <FichasTecnicas /> }
const SimuladorAlmacenPage = () => { useDocumentTitle('Simulador Almacén', 'Simula procesos de almacén logístico con incidencias reales'); return <SimuladorAlmacen /> }
const DashboardIncidenciasPage = () => { useDocumentTitle('Incidencias', 'Gestión y diagnóstico de incidencias industriales con IA'); return <DashboardIncidencias /> }
const KpiLogisticoPage = () => { useDocumentTitle('KPI Logístico', 'Métricas y análisis de rendimiento logístico'); return <KpiLogistico /> }
const FormacionInternaPage = () => { useDocumentTitle('Formación Interna', 'Matriz de competencias y planes de formación'); return <FormacionInterna /> }
const SonexPage = () => { useDocumentTitle('SONEX', 'Asistente técnico con IA para mantenimiento industrial'); return <Sonex /> }
const DashboardGlobalPage = () => { useDocumentTitle('Dashboard', 'Panel de control de todas las herramientas'); return <DashboardGlobal /> }

/**
 * ErrorBoundary componente de clase para capturar errores de renderizado en cualquier
 * componente descendiente, evitando que toda la aplicación se caiga.
 * 
 * @class ErrorBoundary
 * @extends {Component}
 */
class ErrorBoundary extends Component {
  state = { error: null }

  /**
   * Actualiza el estado para que el siguiente renderizado muestre la interfaz de fallback.
   * @param {Error} error - El error capturado
   */
  static getDerivedStateFromError(error) { return { error } }

  /**
   * Registra los detalles del error capturado.
   * @param {Error} error - El error capturado
   * @param {object} info - Información del componente donde ocurrió el error
   */
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info) }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.container}>
          <h2 className={styles.title}>Algo salió mal</h2>
          <p className={styles.message}>
            {this.state.error.message || 'Error inesperado al cargar la herramienta.'}
          </p>
          <button className={styles.retryBtn} onClick={() => { this.setState({ error: null }); window.location.reload() }}>
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

/**
 * Componente visual de fallback mostrado mientras se cargan los módulos lazy-loaded.
 */
const PageLoader = () => (
  <div className={styles.loader}>
    <div className={styles.animatePulse}>Cargando herramienta...</div>
  </div>
)

/**
 * Componente de entrada principal de la aplicación.
 * Define la estructura de rutas usando React Router.
 * 
 * @export
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Ruta pública principal (Landing Page) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Ruta de autenticación pública */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas privadas de la aplicación, protegidas por autenticación */}
        <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          {/* Index de la aplicación privada (Dashboard Global) */}
          <Route index element={<Suspense fallback={<PageLoader />}><DashboardGlobalPage /></Suspense>} />
          
          {/* Módulos principales */}
          <Route path="fichas"       element={<Suspense fallback={<PageLoader />}><CloudFeatureGate><FichasTecnicasPage /></CloudFeatureGate></Suspense>} />
          <Route path="almacen"      element={<Suspense fallback={<PageLoader />}><SimuladorAlmacenPage /></Suspense>} />
          <Route path="incidencias"  element={<Suspense fallback={<PageLoader />}><DashboardIncidenciasPage /></Suspense>} />
          <Route path="kpi"          element={<Suspense fallback={<PageLoader />}><KpiLogisticoPage /></Suspense>} />
          
          {/* Subrutas del sistema de Presupuestos */}
          <Route path="presupuestos" element={<Suspense fallback={<PageLoader />}><PresupuestosLayout /></Suspense>}>
            <Route index element={<Suspense fallback={<PageLoader />}><PresupuestosWizard /></Suspense>} />
            <Route path="seleccion" element={<Suspense fallback={<PageLoader />}><CloudFeatureGate><PresupuestosSeleccion /></CloudFeatureGate></Suspense>} />
            <Route path="editor" element={<Suspense fallback={<PageLoader />}><PresupuestosEditor /></Suspense>} />
            <Route path="gestion" element={<Suspense fallback={<PageLoader />}><PresupuestosGestion /></Suspense>} />
            <Route path="pdf" element={<Suspense fallback={<PageLoader />}><PresupuestosPdf /></Suspense>} />
          </Route>
          
          {/* Módulos de formación e IA */}
          <Route path="formacion"    element={<Suspense fallback={<PageLoader />}><FormacionInternaPage /></Suspense>} />
          <Route path="sonex"        element={<Suspense fallback={<PageLoader />}><CloudFeatureGate><SonexPage /></CloudFeatureGate></Suspense>} />
          
          {/* Manejo de rutas desconocidas dentro de la aplicación */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}

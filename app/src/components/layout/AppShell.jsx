import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts'
import KeyboardShortcutsOverlay from './KeyboardShortcutsOverlay'
import { safeGetItem, safeSetItem } from '../../utils/storage'
import { trackEvent, trackPageView } from '../../hooks/useAnalytics'
import styles from './AppShell.module.css'

/* Hook para detectar si estamos en mobile/tablet */
function useMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

/* AppShell — contenedor principal con sidebar colapsable */
export default function AppShell() {
  const location = useLocation()
  const isMobile = useMobile()
  const [collapsed, setCollapsed] = useState(() => {
    return safeGetItem('Proyectos PFC_sidebar_collapsed') === 'true'
  })

  useEffect(() => {
    safeSetItem('Proyectos PFC_sidebar_collapsed', collapsed)
  }, [collapsed])

  useEffect(() => {
    trackPageView(location.pathname)
    trackEvent('herramienta', 'apertura', location.pathname)
  }, [location.pathname])

  const [shortcutsVisible, setShortcutsVisible] = useState(false)
  const [searchVisible, setSearchVisible] = useState(false)
  const searchRef = useRef(null)
  const mainRef = useRef(null)

  useKeyboardShortcuts({
    onToggleSidebar: () => setCollapsed(c => !c),
    onToggleShortcuts: () => setShortcutsVisible(v => !v),
    onSearch: () => setSearchVisible(true),
    shortcutsVisible,
  })

  const saltarContenido = (e) => {
    e.preventDefault()
    mainRef.current?.focus()
    mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div
      className={styles.shell}
      style={{ '--sidebar-w': collapsed ? '64px' : '240px' }}
    >
      {/* Skip Link para accesibilidad */}
      <a
        href="#main-content"
        className={styles.skipLink}
        onClick={saltarContenido}
      >
        Saltar al contenido principal
      </a>

      <div className={styles.topbar}>
        <Topbar />
      </div>

      {/* Sidebar solo en desktop — en mobile/tablet no se monta */}
      {!isMobile && (
        <div className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
          <Sidebar collapsed={collapsed} />
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      )}

<main className={styles.main} ref={mainRef} tabIndex="-1" id="main-content">
          {/* KEY basada en location fuerza a React a reiniciar el componente al cambiar de ruta */}
          <Outlet key={location.pathname} />
        </main>

      {shortcutsVisible && (
        <KeyboardShortcutsOverlay onClose={() => setShortcutsVisible(false)} />
      )}

      {searchVisible && (
        <div className={styles.searchOverlay} onClick={() => setSearchVisible(false)}>
          <div className={styles.searchPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.searchInputWrap}>
              <Search size={18} className={styles.searchIcon} />
              <input
                ref={searchRef}
                type="text"
                className={styles.searchInput}
                placeholder="Buscar productos, referencias, herramientas..."
                onKeyDown={e => {
                  if (e.key === 'Escape') setSearchVisible(false)
                }}
              />
            </div>
            <p className={styles.searchHint}>Escribe para buscar. Pulsa <kbd className={styles.searchKbd}>Esc</kbd> para cerrar.</p>
          </div>
        </div>
      )}
    </div>
  )
}
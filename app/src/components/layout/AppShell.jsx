/**
 * @file AppShell.jsx
 * @description Contenedor principal de diseño (layout) de la aplicación privada.
 * Proporciona un shell responsivo con barra superior (Topbar), barra lateral (Sidebar) colapsable,
 * atajos de teclado globales, overlay de búsqueda con auto-enfoque y soporte de accesibilidad (skip link).
 */

import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts'
import KeyboardShortcutsOverlay from './KeyboardShortcutsOverlay'
import { supabase } from '../../supabase/supabaseClient'
import { useAuth } from '../../contexts/AuthContext'
import { safeGetItem, safeSetItem } from '../../utils/storage'
import { trackEvent, trackPageView } from '../../hooks/useAnalytics'
import styles from './AppShell.module.css'

function useMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function AppShell() {
  const { user, backendMode } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useMobile()
  const [collapsed, setCollapsed] = useState(() => {
    return safeGetItem('Proyectos PFC_sidebar_collapsed') === 'true'
  })

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('user_data')
      .select('data')
      .eq('user_id', user.id)
      .eq('module', 'preferencias')
      .eq('key', 'sidebar')
      .maybeSingle()
      .then(({ data: row }) => {
        if (row?.data === true || row?.data === 'true') {
          setCollapsed(true)
        }
      })
      .catch(() => {})
  }, [user?.id])

  useEffect(() => {
    safeSetItem('Proyectos PFC_sidebar_collapsed', collapsed ? 'true' : 'false')
    if (!user?.id) return
    Promise.resolve(
      supabase
        .from('user_data')
        .upsert({
          user_id: user.id,
          module: 'preferencias',
          key: 'sidebar',
          data: collapsed,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id, module, key' })
    ).catch(() => {})
  }, [collapsed, user?.id])

  useEffect(() => {
    trackPageView(location.pathname)
    trackEvent('herramienta', 'apertura', location.pathname)
  }, [location.pathname])

  const [shortcutsVisible, setShortcutsVisible] = useState(false)
  const [searchVisible, setSearchVisible] = useState(false)
  const searchRef = useRef(null)
  const mainRef = useRef(null)

  useEffect(() => {
    if (searchVisible) {
      const timer = setTimeout(() => {
        searchRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [searchVisible])

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

      {backendMode !== 'cloud' && (
        <div className={styles.cloudStatus} role="status">
          {backendMode === 'local'
            ? 'Modo local · Cloud desactivado'
            : 'Modo local · Cloud no disponible'}
        </div>
      )}

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
        <Outlet />
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
                  if (e.key === 'Enter' && e.target.value.trim().length >= 2) {
                    navigate(`/app/fichas?q=${encodeURIComponent(e.target.value.trim())}`)
                    setSearchVisible(false)
                  }
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

import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const TOOL_ROUTES = {
  '1': '/app/fichas',
  '2': '/app/almacen',
  '3': '/app/incidencias',
  '4': '/app/kpi',
  '5': '/app/presupuestos',
  '6': '/app/formacion',
  '7': '/app/sonex',
}

export default function useKeyboardShortcuts({ onToggleSidebar, onToggleShortcuts, onSearch, shortcutsVisible }) {
  const navigate = useNavigate()

  const handleKeyDown = useCallback((e) => {
    const target = e.target
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

    if (e.key === 'Escape' && shortcutsVisible) {
      e.preventDefault()
      onToggleShortcuts?.()
      return
    }

    if (e.key === '?' && !isInput) {
      e.preventDefault()
      onToggleShortcuts?.()
      return
    }

    if ((e.ctrlKey || e.metaKey) && TOOL_ROUTES[e.key]) {
      e.preventDefault()
      navigate(TOOL_ROUTES[e.key])
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      onToggleSidebar?.()
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !isInput) {
      e.preventDefault()
      onSearch?.()
      return
    }
  }, [navigate, onToggleSidebar, onToggleShortcuts, onSearch, shortcutsVisible])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

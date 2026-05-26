import { useCallback } from 'react'
import { safeGetJSON, safeSetJSON } from '../utils/storage'

const ANALYTICS_KEY = 'pfc_analytics_events'
const MAX_EVENTS = 500

export function getAnalytics() {
  return safeGetJSON(ANALYTICS_KEY, [])
}

export function trackEvent(categoria, accion, etiqueta = '', valor = null) {
  const events = getAnalytics()
  events.push({
    categoria,
    accion,
    etiqueta,
    valor,
    ts: Date.now(),
    ruta: window.location.pathname,
  })
  safeSetJSON(ANALYTICS_KEY, events.slice(-MAX_EVENTS))
}

export function getAnalyticsSummary() {
  const events = getAnalytics()
  const now = Date.now()
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const pageViews = events.filter(e => e.categoria === 'pageview')
  const uniquePages = [...new Set(pageViews.map(e => e.ruta))]
  const todayEvents = events.filter(e => e.ts >= today.getTime())
  const aiErrors = events.filter(e => e.categoria === 'ia' && e.accion === 'error')
  const searchNoResults = events.filter(e => e.categoria === 'busqueda' && e.accion === 'sin_resultados')
  const toolUsage = events.filter(e => e.categoria === 'herramienta')

  const toolCounts = {}
  toolUsage.forEach(e => {
    const tool = e.etiqueta || 'desconocida'
    toolCounts[tool] = (toolCounts[tool] || 0) + 1
  })

  const pageCounts = {}
  pageViews.forEach(e => {
    const ruta = e.ruta
    pageCounts[ruta] = (pageCounts[ruta] || 0) + 1
  })

  return {
    total: events.length,
    hoy: todayEvents.length,
    pageViews: pageViews.length,
    uniquePages: uniquePages.length,
    pageCounts,
    toolCounts,
    aiErrors: aiErrors.length,
    searchNoResults: searchNoResults.length,
    ultimoEvento: events.length > 0 ? events[events.length - 1].ts : null,
  }
}

export function clearAnalytics() {
  safeSetJSON(ANALYTICS_KEY, [])
}

export default function useAnalytics() {
  const track = useCallback((categoria, accion, etiqueta = '', valor = null) => {
    trackEvent(categoria, accion, etiqueta, valor)
  }, [])

  const trackPageView = useCallback((ruta) => {
    trackEvent('pageview', 'visita', ruta)
  }, [])

  const trackToolOpen = useCallback((toolName) => {
    trackEvent('herramienta', 'apertura', toolName)
  }, [])

  const trackSearch = useCallback((query, resultados) => {
    trackEvent('busqueda', resultados > 0 ? 'con_resultados' : 'sin_resultados', query, resultados)
  }, [])

  const trackAIError = useCallback((model, error) => {
    trackEvent('ia', 'error', model, error)
  }, [])

  const trackShortcut = useCallback((shortcut) => {
    trackEvent('atajo', 'uso', shortcut)
  }, [])

  return {
    track,
    trackPageView,
    trackToolOpen,
    trackSearch,
    trackAIError,
    trackShortcut,
    summary: getAnalyticsSummary,
  }
}

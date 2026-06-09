/**
 * @file ToastContext.jsx
 * @description Proveedor de contexto para el sistema global de notificaciones emergentes (Toasts).
 * Permite disparar notificaciones efímeras (info, success, error, warning) con auto-ocultado.
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

// Creación del contexto de Toasts
const ToastContext = createContext(null)

/**
 * Componente Proveedor que expone la función para mostrar Toasts y renderiza el contenedor flotante.
 * 
 * @export
 * @param {object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {JSX.Element}
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  /**
   * Muestra un Toast agregándolo a la lista activa y programando su remoción.
   * 
   * @param {string} mensaje - Texto a mostrar
   * @param {('info'|'success'|'error'|'warning')} [tipo='info'] - Estilo y severidad del toast
   * @param {number} [duracion=3000] - Tiempo de vida en milisegundos
   */
  const show = useCallback((mensaje, tipo = 'info', duracion = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, mensaje, tipo }])
    
    // Programar la remoción tras cumplirse la duración
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duracion)
  }, [])

  // Memorizar el valor para evitar la recreación del objeto literal en cada render del proveedor
  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

/**
 * Hook personalizado para consumir el contexto de toasts.
 * Expone un método simplificado `toast.show(msg, type)`.
 * 
 * @export
 * @returns {object} { toast: { show: function } }
 */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return { toast: ctx }
}

/**
 * Contenedor visual de toasts con posicionamiento fijo.
 * 
 * @param {object} props - Propiedades
 * @param {Array} props.toasts - Listado de notificaciones activas
 */
function ToastContainer({ toasts }) {
  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 9999,
    }} role="status" aria-live="polite">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}

// Mapa de estilos de colores basado en tokens CSS de la app
const TOAST_THEME = {
  info:    { bg: 'var(--color-surface)', color: 'var(--color-text)' },
  success: { bg: 'var(--success)', color: 'var(--gray-900)' },
  error:   { bg: 'var(--color-error)', color: 'var(--color-on-brand)' },
  warning: { bg: 'var(--warning)', color: 'var(--gray-900)' },
}

/**
 * Representa un mensaje de toast individual.
 * 
 * @param {object} props
 * @param {object} props.toast - Datos de la notificación
 */
function ToastItem({ toast }) {
  const { bg, color } = TOAST_THEME[toast.tipo] || TOAST_THEME.info

  return (
    <div style={{
      background: bg,
      color,
      padding: '10px 16px',
      borderRadius: '6px',
      fontSize: '13px',
      fontFamily: 'var(--font-sans)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: '320px',
      animation: 'fadeIn 150ms ease',
      border: toast.tipo === 'info' ? '1px solid var(--color-border)' : 'none',
    }} role="alert">
      {toast.mensaje}
    </div>
  )
}


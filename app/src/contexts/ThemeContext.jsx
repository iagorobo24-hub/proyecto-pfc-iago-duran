/**
 * @file ThemeContext.jsx
 * @description Proveedor de contexto para el tema (oscuro/claro) de la aplicación.
 * Gestiona la sincronización con localStorage y Supabase (preferencias de usuario),
 * y aplica una transición de vista animada tipo "círculo expansivo" (View Transitions API)
 * al alternar entre temas en navegadores compatibles.
 */

import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { supabase } from '../supabase/supabaseClient'
import { safeGetItem, safeSetItem } from '../utils/storage'

// Creación del contexto de tema
const ThemeContext = createContext()

/**
 * Componente Proveedor que gestiona el estado oscuro/claro y la transición visual.
 * 
 * @export
 * @param {object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {JSX.Element}
 */
export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    // Inicialización sincrónica desde localStorage
    const saved = safeGetItem('Proyectos PFC_theme')
    if (saved) return saved === 'dark'
    return false
  })

  // Cachear el ID del usuario en una referencia mutable para evitar llamadas repetidas a Supabase
  const userIdRef = useRef(null)
  const [userId, setUserId] = useState(null)

  // Suscribirse a auth para obtener el ID de usuario activo
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null
      userIdRef.current = uid
      setUserId(uid)
    })
    // Consultar sesión activa actual al arrancar
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null
      userIdRef.current = uid
      setUserId(uid)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Sincronizar tema preferido desde Supabase una vez autenticado el usuario
  useEffect(() => {
    if (!userId) return
    supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .eq('module', 'preferencias')
      .eq('key', 'tema')
      .maybeSingle()
      .then(({ data: row }) => {
        // Solo actualiza si difiere del valor actual en localStorage
        if (row?.data && row.data !== safeGetItem('Proyectos PFC_theme')) {
          const temaSupabase = row.data === 'dark'
          setDark(temaSupabase)
        }
      })
      .catch(() => {})
  }, [userId])

  // Aplicar tema en el DOM e intentar guardarlo local y remotamente ante cada cambio
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    safeSetItem('Proyectos PFC_theme', dark ? 'dark' : 'light')
    if (!userIdRef.current) return
    
    // Guardar la preferencia en Supabase en segundo plano
    Promise.resolve(
      supabase
        .from('user_data')
        .upsert({
          user_id: userIdRef.current,
          module: 'preferencias',
          key: 'tema',
          data: dark ? 'dark' : 'light',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id, module, key' })
    ).catch(() => {})
  }, [dark])

  /**
   * Cambia el tema activo con una animación circular suave basada en la API View Transitions.
   * Si no está soportada o el usuario prefiere reducir el movimiento, realiza un cambio directo.
   * 
   * @param {MouseEvent} event - Evento del clic que gatilló el cambio de tema
   */
  const toggle = useCallback((event) => {
    // Si el navegador no soporta la API o prefiere reducción de movimiento, cambio simple
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDark(prev => !prev)
      return
    }

    // Calcular coordenadas del clic del usuario para iniciar la expansión circular
    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? window.innerHeight / 2
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // Determinar la dirección de la transición antes de actualizar el estado
    const isDarkToLight = dark // true si estamos en oscuro y vamos a claro
    const isLightToDark = !dark // true si estamos en claro y vamos a oscuro

    // Iniciar la transición de vista del DOM
    const transition = document.startViewTransition(() => {
      // flushSync fuerza a React a actualizar síncronamente el DOM en este ciclo
      const nextDark = !dark
      flushSync(() => {
        setDark(nextDark)
      })
      // Forzamos el atributo del tema inmediatamente para que la API de transición capture los estados
      document.documentElement.setAttribute('data-theme', nextDark ? 'dark' : 'light')
    })

    // Ejecutar la animación de clipping circular
    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      
      // Si pasa de Claro -> Oscuro: animamos la llegada del nuevo estado (new)
      // Si pasa de Oscuro -> Claro: animamos la salida del antiguo estado (old)
      document.documentElement.animate(
        {
          clipPath: isLightToDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 400,
          easing: 'ease-in-out',
          pseudoElement: isLightToDark ? '::view-transition-new(root)' : '::view-transition-old(root)',
        }
      )
    })
  }, [dark])

  // Memorizar el valor del contexto
  const themeValue = useMemo(() => ({ dark, toggle }), [dark, toggle])

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook personalizado para consumir el tema actual y su toggle.
 * 
 * @returns {object} { dark: boolean, toggle: function }
 */
export const useTheme = () => useContext(ThemeContext)


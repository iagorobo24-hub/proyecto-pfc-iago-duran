import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react'
import { flushSync } from 'react-dom'
import { supabase } from '../supabase/supabaseClient'
import { safeGetItem, safeSetItem } from '../utils/storage'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = safeGetItem('Proyectos PFC_theme')
    if (saved) return saved === 'dark'
    return false
  })

  // Cachear userId para evitar getUser() repetido en cada toggle
  const userIdRef = useRef(null)
  const [userId, setUserId] = useState(null)

  // Suscribir a auth para obtener el userId una sola vez
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null
      userIdRef.current = uid
      setUserId(uid)
    })
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null
      userIdRef.current = uid
      setUserId(uid)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Cargar tema desde Supabase si el usuario está autenticado
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
        if (row?.data && row.data !== safeGetItem('Proyectos PFC_theme')) {
          const temaSupabase = row.data === 'dark'
          setDark(temaSupabase)
        }
      })
      .catch(() => {})
  }, [userId])

  // Guardar en localStorage y Supabase
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    safeSetItem('Proyectos PFC_theme', dark ? 'dark' : 'light')
    if (!userIdRef.current) return
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

  const toggle = (event) => {
    // Si el navegador no soporta la API o prefiere reducción de movimiento, cambio simple
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDark(prev => !prev)
      return
    }

    // Calcular coordenadas del clic para que el círculo salga desde ahí
    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? window.innerHeight / 2
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      // flushSync es vital aquí para que React actualice el DOM de forma síncrona
      const nextDark = !dark
      flushSync(() => {
        setDark(nextDark)
      })
      // Forzamos el atributo manualmente para que View Transitions lo vea "ahora"
      document.documentElement.setAttribute('data-theme', nextDark ? 'dark' : 'light')
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      
      // Animamos el pseudo-elemento correspondiente según la dirección del cambio
      // Si estamos en DARK (dark=true) y vamos a LIGHT, animamos el OLD (el que se va)
      // Si estamos en LIGHT (dark=false) y vamos a DARK, animamos el NEW (el que llega)
      document.documentElement.animate(
        {
          clipPath: dark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 400,
          easing: 'ease-in-out',
          pseudoElement: dark ? '::view-transition-old(root)' : '::view-transition-new(root)',
        }
      )
    })
  }

  const themeValue = useMemo(() => ({ dark, toggle }), [dark, toggle])

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

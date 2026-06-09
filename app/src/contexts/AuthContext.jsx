/**
 * @file AuthContext.jsx
 * @description Proveedor de contexto para la gestión del estado de autenticación de usuarios.
 * Integra la sesión con Supabase Auth, proporciona funciones de inicio/cierre de sesión
 * y maneja la migración de datos locales (localStorage) a la base de datos remota de Supabase.
 */

import { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { migrateLocalStorageToSupabase } from '../utils/migrateLocalStorage'

// Creación del contexto de autenticación
const AuthContext = createContext()

/**
 * Hook personalizado para consumir el contexto de autenticación.
 * Lanza un error si se consume fuera de AuthProvider.
 * 
 * @export
 * @returns {object} Contexto de autenticación (user, loading, loginWithGoogle, logout)
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

/**
 * Componente Proveedor que gestiona el ciclo de vida de la sesión de usuario de Supabase.
 * Muestra una pantalla de carga mientras se recupera la sesión inicial.
 * 
 * @export
 * @param {object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const migratedRef = useRef(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // Soporte para E2E tests con Playwright — solo en desarrollo para simular usuarios
    if (import.meta.env.DEV && window.__PW_MOCK_USER__) {
      setUser(window.__PW_MOCK_USER__)
      setLoading(false)
      return
    }
    
    // Verificar sesión existente en Supabase al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))

    // Suscribirse a cambios en el estado de autenticación (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Migrar datos de localStorage a Supabase una vez por sesión tras el login exitoso
  useEffect(() => {
    if (user?.id && !migratedRef.current) {
      migratedRef.current = true
      migrateLocalStorageToSupabase(user.id).then(result => {
        if (result.migrated > 0) {
          console.log(`[Auth] Migrados ${result.migrated} campos de localStorage → Supabase`)
        }
      }).catch(e => console.warn('[Auth] Error en migración:', e.message))
    }
  }, [user])

  /**
   * Inicia el proceso de login OAuth con Google a través de Supabase.
   * Redirige al usuario al flujo de Google y regresa al origen de la app.
   */
  const loginWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) {
      console.error('[Auth] Error login:', error.message)
      throw new Error(error.message || 'Error al iniciar sesión con Google')
    }
    return data
  }, [])

  /**
   * Cierra la sesión activa en Supabase Auth y limpia el estado local de la app.
   */
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  // Memorizar el valor del contexto para evitar que los consumidores se re-rendericen
  // innecesariamente cuando cambien referencias de funciones locales.
  const value = useMemo(() => ({ user, loading, loginWithGoogle, logout }), [user, loading, loginWithGoogle, logout])

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        // Interfaz visual de carga para la sesión inicial del usuario
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
          fontFamily: 'var(--font-sans, sans-serif)',
        }} role="status" aria-label="Cargando sesión">
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <div style={{
              width: '36px', height: '36px',
              border: '3px solid var(--color-border)',
              borderTopColor: 'var(--color-brand)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }} />
            <span>Cargando sesión…</span>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : children}
    </AuthContext.Provider>
  )
}
import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase } from '../supabase/supabaseClient'

const AuthContext = createContext()

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Soporte para E2E tests con Playwright
    if (window.__PW_MOCK_USER__) {
      setUser(window.__PW_MOCK_USER__)
      setLoading(false)
      return
    }
    // Verificar sesión existente en Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  /* Login con Google via Supabase */
  async function loginWithGoogle() {
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
  }

  /* Logout */
  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = useMemo(() => ({ user, loading, loginWithGoogle, logout }), [user, loading, loginWithGoogle, logout])

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
          fontFamily: 'var(--font-sans, sans-serif)',
        }}>
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
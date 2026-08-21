/* eslint-disable react-hooks/set-state-in-effect -- auth state is initialized from Playwright/Supabase external session sources */
/**
 * @file AuthContext.jsx
 * @description Authentication state provider with graceful local/degraded operation.
 * Cloud session initialization never blocks rendering of the public application tree.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { supabaseConfig } from '../supabase/config'
import { migrateLocalStorageToSupabase } from '../utils/migrateLocalStorage'

const AuthContext = createContext()
export const AUTH_INIT_TIMEOUT_MS = 5000

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const initialBackendMode = supabaseConfig.mode === 'cloud' ? 'cloud' : 'local'
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(initialBackendMode === 'cloud')
  const [backendMode, setBackendMode] = useState(initialBackendMode)
  const migratedRef = useRef(false)

  useEffect(() => {
    if (import.meta.env.DEV && window.__PW_MOCK_USER__) {
      setUser(window.__PW_MOCK_USER__)
      setLoading(false)
      return
    }

    if (supabaseConfig.mode !== 'cloud') {
      setLoading(false)
      return
    }

    let active = true
    let subscription
    const timeoutId = window.setTimeout(() => {
      if (!active) return
      console.warn('[Auth] La inicialización cloud superó el tiempo máximo; continuando en modo degradado.')
      setBackendMode('unavailable')
      setLoading(false)
    }, AUTH_INIT_TIMEOUT_MS)

    supabase.auth.getSession()
      .then(({ data }) => {
        if (!active) return
        window.clearTimeout(timeoutId)
        setUser(data?.session?.user ?? null)
        setBackendMode('cloud')
        setLoading(false)
      })
      .catch((error) => {
        if (!active) return
        window.clearTimeout(timeoutId)
        console.warn('[Auth] No se pudo inicializar la sesión cloud:', error?.message || error)
        setBackendMode('unavailable')
        setLoading(false)
      })

    try {
      const result = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return
        setUser(session?.user ?? null)
        setBackendMode('cloud')
        setLoading(false)
      })
      subscription = result?.data?.subscription
    } catch (error) {
      console.warn('[Auth] No se pudo suscribir al estado cloud:', error?.message || error)
    }

    return () => {
      active = false
      window.clearTimeout(timeoutId)
      subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (backendMode === 'cloud' && user?.id && !migratedRef.current) {
      migratedRef.current = true
      migrateLocalStorageToSupabase(user.id).then(result => {
        if (result.migrated > 0) {
          console.log(`[Auth] Migrados ${result.migrated} campos de localStorage → Supabase`)
        }
      }).catch(error => console.warn('[Auth] Error en migración:', error.message))
    }
  }, [backendMode, user])

  const loginWithGoogle = useCallback(async () => {
    if (backendMode !== 'cloud') {
      throw new Error(
        backendMode === 'local'
          ? 'La autenticación cloud no está disponible en modo local.'
          : 'La autenticación cloud no está disponible temporalmente.',
      )
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/app',
      },
    })

    if (error) {
      console.error('[Auth] Error login:', error.message)
      throw new Error(error.message || 'Error al iniciar sesión con Google')
    }
    return data
  }, [backendMode])

  const logout = useCallback(async () => {
    if (backendMode !== 'cloud') {
      setUser(null)
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }, [backendMode])

  const value = useMemo(
    () => ({ user, loading, backendMode, loginWithGoogle, logout }),
    [user, loading, backendMode, loginWithGoogle, logout],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

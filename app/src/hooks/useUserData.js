/**
 * Hook genérico de persistencia — Supabase (autenticado) + localStorage (fallback/offline).
 *
 * Reemplaza a useFirestoreSync. Cada módulo recibe su propio campo de datos.
 *
 * Uso:
 *   const { data, loading, save, remove } = useUserData('incidencias', 'listado', [], ['pfc_incidencias'])
 *
 *
 *   useEffect(() => { if (data) setState(data) }, [data])
 *
 *
 *   save([...newData])
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { safeGetJSON, safeSetJSON, safeRemoveItem } from '../utils/storage'

export default function useUserData(module, field, defaultValue = null, legacyKeys = []) {
  const { user } = useAuth()
  const userId = user?.id || null
  const [data, setData] = useState(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)
  const migratedRef = useRef(false)

  // Deriva la key de localStorage del módulo+field
  const localStorageKey = `pfc_u_${module}_${field}`

  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!userId) {
      // Sin sesión → solo localStorage
      const local = safeGetJSON(localStorageKey, defaultValue)
      if (mountedRef.current) {
        setData(local)
        setLoading(false)
      }
      return
    }

    try {
      const { data: rows, error: supError } = await supabase
        .from('user_data')
        .select('data')
        .eq('user_id', userId)
        .eq('module', module)
        .eq('key', field)
        .maybeSingle()

      if (supError) throw supError

      if (rows?.data !== undefined) {
        const parsed = rows.data
        if (mountedRef.current) setData(parsed)
        // Cache en localStorage
        safeSetJSON(localStorageKey, parsed)
      } else {
        // No hay datos en Supabase, probar localStorage como respaldo
        const local = safeGetJSON(localStorageKey, defaultValue)
        if (mountedRef.current) setData(local)
      }
    } catch (e) {
      console.warn(`[useUserData] Error cargando ${module}.${field} de Supabase:`, e.message)
      setError(e.message)
      // Fallback a localStorage
      const local = safeGetJSON(localStorageKey, defaultValue)
      if (mountedRef.current) setData(local)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [userId, module, field, localStorageKey, defaultValue])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Auto-migrar datos desde claves legacy de localStorage
  useEffect(() => {
    if (!loading && userId && legacyKeys.length > 0 && !migratedRef.current) {
      migratedRef.current = true
      ;(async () => {
        for (const legacyKey of legacyKeys) {
          const legacy = safeGetJSON(legacyKey)
          if (legacy === null || legacy === undefined) continue
          try {
            const payload = {
              user_id: userId,
              module,
              key: field,
              data: legacy,
              updated_at: new Date().toISOString(),
            }
            await supabase.from('user_data').upsert(payload, {
              onConflict: 'user_id, module, key',
              ignoreDuplicates: true, // No sobrescribir si ya existe
            })
            safeRemoveItem(legacyKey)
            console.log(`[useUserData] Migrados datos legacy '${legacyKey}' → ${module}.${field}`)
          } catch (e) {
            console.warn(`[useUserData] Error migrando '${legacyKey}':`, e.message)
          }
        }
      })()
    }
  }, [loading, userId, module, field, legacyKeys])

  const save = useCallback(async (newData) => {
    // Siempre guardar en localStorage (offline/fallback)
    safeSetJSON(localStorageKey, newData)
    if (mountedRef.current) setData(newData)

    if (!userId) return // Sin sesión → solo localStorage

    try {
      const payload = {
        user_id: userId,
        module,
        key: field,
        data: newData,
        updated_at: new Date().toISOString(),
      }

      const { error: supError } = await supabase
        .from('user_data')
        .upsert(payload, {
          onConflict: 'user_id, module, key',
          ignoreDuplicates: false,
        })

      if (supError) throw supError
    } catch (e) {
      console.warn(`[useUserData] Error guardando ${module}.${field} en Supabase:`, e.message)
      setError(e.message)
    }
  }, [userId, module, field, localStorageKey])

  const remove = useCallback(async () => {
    safeRemoveItem(localStorageKey)
    if (mountedRef.current) setData(defaultValue)

    if (!userId) return

    try {
      const { error: supError } = await supabase
        .from('user_data')
        .delete()
        .eq('user_id', userId)
        .eq('module', module)
        .eq('key', field)

      if (supError) throw supError
    } catch (e) {
      console.warn(`[useUserData] Error eliminando ${module}.${field} de Supabase:`, e.message)
      setError(e.message)
    }
  }, [userId, module, field, localStorageKey, defaultValue])

  const migrateFromLocal = useCallback(async (legacyKey) => {
    if (!userId) return null
    const legacy = safeGetJSON(legacyKey)
    if (legacy === null || legacy === undefined) return null

    // Guardar en Supabase
    await save(legacy)
    // Borrar legacy key
    safeRemoveItem(legacyKey)
    return legacy
  }, [userId, save])

  return {
    data,
    loading,
    error,
    save,
    remove,
    migrateFromLocal,
    reload: cargar,
  }
}

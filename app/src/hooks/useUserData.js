/* eslint-disable react-hooks/set-state-in-effect -- hook synchronizes asynchronously loaded persisted data into local editable state */
/**
 * @file useUserData.js
 * @description Hook genérico de persistencia híbrida: Supabase (para usuarios autenticados)
 * y localStorage (como almacenamiento local offline/respaldo).
 * Sincroniza automáticamente los datos locales con Supabase al iniciar sesión,
 * maneja migraciones de versiones anteriores y evita la sobreescritura de datos durante cargas asíncronas.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { safeGetJSON, safeSetJSON, safeRemoveItem } from '../utils/storage'
import { log } from '../utils/logger'
import { isMigrationComplete } from '../utils/migrateLocalStorage'

/**
 * Hook personalizado para persistencia híbrida local/remota.
 * 
 * @export
 * @param {string} module - Módulo de la aplicación (ej: 'incidencias', 'presupuestos')
 * @param {string} field - Campo de configuración o listado (ej: 'listado')
 * @param {*} [defaultValue=null] - Valor inicial si no se encuentra registro persistido
 * @param {string[]} [legacyKeys=[]] - Claves obsoletas en localStorage para auto-migrar
 * @returns {object} { data, loading, error, save, remove, migrateFromLocal, reload }
 */
export default function useUserData(module, field, defaultValue = null, legacyKeys = []) {
  const { user } = useAuth()
  const userId = user?.id || null
  const [data, setData] = useState(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const mountedRef = useRef(true)
  const migratedRef = useRef(false)
  
  // Verifica si el proceso de migración único (one-shot) ya finalizó para este usuario
  const [migrationDone, setMigrationDone] = useState(() => isMigrationComplete(userId))

  // Clave formateada para almacenamiento local
  const localStorageKey = `pfc_u_${module}_${field}`

  // Monitorea y detecta la finalización de la migración en segundo plano
  useEffect(() => {
    if (userId && !migrationDone) {
      const interval = setInterval(() => {
        if (isMigrationComplete(userId)) {
          setMigrationDone(true)
          clearInterval(interval)
        }
      }, 500)
      return () => clearInterval(interval)
    }
  }, [userId, migrationDone])

  // Lógica de descarte para evitar fugas de memoria al desmontar el componente
  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  // Referencia para mantener el valor por defecto estable en callbacks asíncronos
  const defaultValueRef = useRef(defaultValue)
  useEffect(() => {
    defaultValueRef.current = defaultValue
  }, [defaultValue])

  /**
   * Carga los datos desde Supabase (si el usuario está logueado y migrado) o desde localStorage.
   */
  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!userId) {
      // Sin sesión iniciada: cargar directamente de localStorage
      const local = safeGetJSON(localStorageKey, defaultValueRef.current)
      if (mountedRef.current) {
        setData(local)
        setLoading(false)
      }
      return
    }

    // Si la migración global de localStorage -> Supabase está en proceso,
    // solo leemos localmente para prevenir la sobreescritura con estados por defecto vacíos.
    if (!isMigrationComplete(userId)) {
      const local = safeGetJSON(localStorageKey, defaultValueRef.current)
      if (mountedRef.current) {
        setData(local)
        setLoading(false)
      }
      return
    }

    try {
      // Consultar registro único del módulo y campo para el usuario actual
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
        // Actualizar caché de respaldo local
        safeSetJSON(localStorageKey, parsed)
      } else {
        // No hay datos aún en Supabase: usar caché local como respaldo
        const local = safeGetJSON(localStorageKey, defaultValueRef.current)
        if (mountedRef.current) setData(local)
      }
    } catch (e) {
      console.warn(`[useUserData] Error cargando ${module}.${field} de Supabase:`, e.message)
      setError(e.message)
      // Recuperar de local en caso de error de conexión/servidor
      const local = safeGetJSON(localStorageKey, defaultValueRef.current)
      if (mountedRef.current) setData(local)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [userId, module, field, localStorageKey])

  // Desencadenar la carga de datos iniciales o ante cambios de sesión
  useEffect(() => {
    cargar()
  }, [cargar])

  // Auto-migración de claves legacy antiguas individuales de localStorage a la base de datos
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
            // upsert ignorando duplicados para no sobreescribir datos más nuevos
            await supabase.from('user_data').upsert(payload, {
              onConflict: 'user_id, module, key',
              ignoreDuplicates: true,
            })
            safeRemoveItem(legacyKey) // Limpiar clave vieja
            log(`[useUserData] Migrados datos legacy '${legacyKey}' → ${module}.${field}`)
          } catch (e) {
            console.warn(`[useUserData] Error migrando '${legacyKey}':`, e.message)
          }
        }
      })()
    }
  }, [loading, userId, module, field, legacyKeys])

  /**
   * Guarda nueva información tanto local como remotamente (Supabase) de manera asíncrona.
   * 
   * @param {*} newData - Información a persistir
   */
  const save = useCallback(async (newData) => {
    // Primero persistir localmente para garantizar velocidad visual (optimistic UI)
    safeSetJSON(localStorageKey, newData)
    if (mountedRef.current) setData(newData)

    if (!userId) return // Usuario anónimo -> finalizar aquí

    // Evita subir a la nube si la migración global está pendiente
    if (!isMigrationComplete(userId)) return

    try {
      const payload = {
        user_id: userId,
        module,
        key: field,
        data: newData,
        updated_at: new Date().toISOString(),
      }

      // Guardar y pisar valor en Supabase
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

  /**
   * Elimina por completo los datos persistidos en ambos almacenamientos.
   */
  const remove = useCallback(async () => {
    safeRemoveItem(localStorageKey)
    if (mountedRef.current) setData(defaultValueRef.current)

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
  }, [userId, module, field, localStorageKey])

  /**
   * Forzar migración manual desde una clave legacy de localStorage.
   */
  const migrateFromLocal = useCallback(async (legacyKey) => {
    if (!userId) return null
    const legacy = safeGetJSON(legacyKey)
    if (legacy === null || legacy === undefined) return null

    await save(legacy)
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


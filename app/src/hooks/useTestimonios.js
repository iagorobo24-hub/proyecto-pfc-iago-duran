import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { safeGetJSON, safeSetJSON, safeRemoveItem } from '../utils/storage'

const LS_KEY = 'pfc_testimonios'

export default function useTestimonios() {
  const { user } = useAuth()
  const [testimonios, setTestimonios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Cargar testimonios desde Supabase al montar
  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)

    try {
      const { data, error: supError } = await supabase
        .from('testimonios')
        .select('*')
        .order('created_at', { ascending: false })

      if (supError) throw supError

      if (data && data.length > 0) {
        setTestimonios(data)
        // Cache local
        safeSetJSON(LS_KEY, data)
      } else {
        // Fallback: si Supabase devuelve vacío, probar localStorage
        const local = safeGetJSON(LS_KEY, [])
        if (local.length > 0) {
          setTestimonios(local)
        } else {
          setTestimonios([])
        }
      }
    } catch (e) {
      console.warn('[Testimonios] Error cargando de Supabase, usando localStorage:', e.message)
      setError(e.message)
      const local = safeGetJSON(LS_KEY, [])
      setTestimonios(local)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const agregar = useCallback(async (nuevo) => {
    // Optimistic: añadir al estado local inmediatamente
    const tempId = Date.now()
    const optimista = { ...nuevo, id: tempId, created_at: new Date().toISOString() }
    setTestimonios(prev => [optimista, ...prev])

    try {
      const payload = {
        nombre: nuevo.nombre.trim(),
        email: nuevo.email?.trim() || null,
        texto: nuevo.texto.trim(),
        rating: nuevo.rating,
        user_id: user?.id || null,
      }

      const { data, error: supError } = await supabase
        .from('testimonios')
        .insert(payload)
        .select()
        .single()

      if (supError) throw supError

      // Reemplazar el optimista con el real de la DB
      setTestimonios(prev =>
        prev.map(t => t.id === tempId ? { ...data, id: data.id } : t)
      )

      // Actualizar cache local
      const local = safeGetJSON(LS_KEY, [])
      safeSetJSON(LS_KEY, [data, ...local])

      return data
    } catch (e) {
      console.warn('[Testimonios] Error guardando en Supabase, guardando solo local:', e.message)

      // Fallback: guardar en localStorage
      const local = safeGetJSON(LS_KEY, [])
      const localEntry = { ...nuevo, id: tempId, created_at: new Date().toISOString() }
      safeSetJSON(LS_KEY, [localEntry, ...local])
      setError(e.message)

      return null
    }
  }, [user])

  const eliminar = useCallback(async (id) => {
    // Optimistic: eliminar del estado local
    const prev = testimonios
    setTestimonios(prev => prev.filter(t => t.id !== id))

    try {
      const { error: supError } = await supabase
        .from('testimonios')
        .delete()
        .eq('id', id)

      if (supError) throw supError

      // Actualizar cache local
      const local = safeGetJSON(LS_KEY, [])
      safeSetJSON(LS_KEY, local.filter(t => t.id !== id))
    } catch (e) {
      console.warn('[Testimonios] Error eliminando de Supabase:', e.message)
      // Rollback optimista
      setTestimonios(prev)
      setError(e.message)
    }
  }, [testimonios])

  const migrarDesdeLocal = useCallback(async () => {
    const local = safeGetJSON(LS_KEY, [])
    if (!local.length || !user?.id) return

    const insertados = []
    for (const t of local) {
      if (!t.nombre || !t.texto || !t.rating) continue
      try {
        const { data } = await supabase
          .from('testimonios')
          .insert({
            nombre: t.nombre,
            email: t.email || null,
            texto: t.texto,
            rating: t.rating,
            user_id: user.id,
            created_at: t.fecha || t.created_at || new Date().toISOString(),
          })
          .select()
          .single()
        if (data) insertados.push(data)
      } catch {
        // Si falla uno, seguir con el siguiente
      }
    }

    if (insertados.length > 0) {
      safeRemoveItem(LS_KEY)
      setTestimonios(prev => [...insertados, ...prev])
    }
  }, [user])

  // Auto-migrar localStorage → Supabase cuando el usuario existe
  useEffect(() => {
    if (!cargando && user?.id) {
      const local = safeGetJSON(LS_KEY, [])
      if (local.length > 0) {
        migrarDesdeLocal()
      }
    }
  }, [cargando, user, migrarDesdeLocal])

  return {
    testimonios,
    cargando,
    error,
    agregar,
    eliminar,
    migrarDesdeLocal,
  }
}

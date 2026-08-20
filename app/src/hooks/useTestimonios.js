/* eslint-disable react-hooks/set-state-in-effect -- hook loads and migrates testimonials from Supabase/localStorage external sources */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { safeGetJSON, safeSetJSON, safeRemoveItem } from '../utils/storage'

const LS_KEY = 'pfc_testimonios'
const PUBLIC_COLUMNS = 'id,nombre,texto,rating,created_at'

function toPublicTestimonio(row) {
  if (!row) return row
  return {
    id: row.id,
    nombre: row.nombre,
    texto: row.texto,
    rating: row.rating,
    created_at: row.created_at,
  }
}

export default function useTestimonios() {
  const { user } = useAuth()
  const [testimonios, setTestimonios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)

    try {
      const { data, error: supError } = await supabase
        .from('testimonios')
        .select(PUBLIC_COLUMNS)
        .order('created_at', { ascending: false })

      if (supError) throw supError

      if (data && data.length > 0) {
        const publicData = data.map(toPublicTestimonio)
        setTestimonios(publicData)
        safeSetJSON(LS_KEY, publicData)
      } else {
        const local = safeGetJSON(LS_KEY, [])
        setTestimonios(local.length > 0 ? local.map(toPublicTestimonio) : [])
      }
    } catch (e) {
      console.warn('[Testimonios] Error cargando de Supabase, usando localStorage:', e.message)
      setError(e.message)
      const local = safeGetJSON(LS_KEY, [])
      setTestimonios(local.map(toPublicTestimonio))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const agregar = useCallback(async (nuevo) => {
    const tempId = Date.now()
    const optimista = toPublicTestimonio({
      ...nuevo,
      id: tempId,
      created_at: new Date().toISOString(),
    })
    setTestimonios(prev => [optimista, ...prev])

    try {
      const payload = {
        nombre: nuevo.nombre.trim(),
        texto: nuevo.texto.trim(),
        rating: nuevo.rating,
        user_id: user?.id || null,
      }

      const { data, error: supError } = await supabase
        .from('testimonios')
        .insert(payload)
        .select(PUBLIC_COLUMNS)
        .single()

      if (supError) throw supError

      const publicData = toPublicTestimonio(data)
      setTestimonios(prev =>
        prev.map(t => t.id === tempId ? publicData : t)
      )

      const local = safeGetJSON(LS_KEY, []).map(toPublicTestimonio)
      safeSetJSON(LS_KEY, [publicData, ...local])

      return publicData
    } catch (e) {
      console.warn('[Testimonios] Error guardando en Supabase, guardando solo local:', e.message)

      const local = safeGetJSON(LS_KEY, []).map(toPublicTestimonio)
      const localEntry = toPublicTestimonio({
        ...nuevo,
        id: tempId,
        created_at: new Date().toISOString(),
      })
      safeSetJSON(LS_KEY, [localEntry, ...local])
      setError(e.message)

      return null
    }
  }, [user])

  const eliminar = useCallback(async (id) => {
    const prev = testimonios
    setTestimonios(current => current.filter(t => t.id !== id))

    try {
      const { error: supError } = await supabase
        .from('testimonios')
        .delete()
        .eq('id', id)

      if (supError) throw supError

      const local = safeGetJSON(LS_KEY, []).map(toPublicTestimonio)
      safeSetJSON(LS_KEY, local.filter(t => t.id !== id))
    } catch (e) {
      console.warn('[Testimonios] Error eliminando de Supabase:', e.message)
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
        const { data, error: supError } = await supabase
          .from('testimonios')
          .insert({
            nombre: t.nombre,
            texto: t.texto,
            rating: t.rating,
            user_id: user.id,
            created_at: t.created_at || new Date().toISOString(),
          })
          .select(PUBLIC_COLUMNS)
          .single()

        if (!supError && data) insertados.push(toPublicTestimonio(data))
      } catch {
        // Si falla uno, seguir con el siguiente.
      }
    }

    if (insertados.length > 0) {
      safeRemoveItem(LS_KEY)
      setTestimonios(prev => [...insertados, ...prev])
    }
  }, [user])

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

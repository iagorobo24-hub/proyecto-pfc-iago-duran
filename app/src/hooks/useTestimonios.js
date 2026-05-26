import { useState, useEffect } from 'react'
import { safeGetJSON, safeSetJSON } from '../utils/storage'

const KEY = 'pfc_testimonios'

export default function useTestimonios() {
  const [testimonios, setTestimonios] = useState([])

  // Cargar datos sólo en cliente (evita errores de hidratación)
  useEffect(() => {
    const stored = safeGetJSON(KEY, [])
    if (stored && stored.length > 0) {
      setTestimonios(stored)
    }
  }, [])

  const agregar = (nuevo) => {
    const actualizados = [...testimonios, { ...nuevo, id: Date.now() }]
    safeSetJSON(KEY, actualizados)
    setTestimonios(actualizados)
  }

  const eliminar = (id) => {
    const actualizados = testimonios.filter(t => t.id !== id)
    safeSetJSON(KEY, actualizados)
    setTestimonios(actualizados)
  }

  return { testimonios, agregar, eliminar }
}

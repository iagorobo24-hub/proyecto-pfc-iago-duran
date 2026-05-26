import { useState } from 'react'
import { safeGetJSON, safeSetJSON } from '../utils/storage'

const KEY = 'pfc_testimonios'

export default function useTestimonios() {
  const [testimonios, setTestimonios] = useState(() => safeGetJSON(KEY, []))

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

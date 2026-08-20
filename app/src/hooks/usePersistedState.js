/* eslint-disable react-hooks/set-state-in-effect -- hook mirrors asynchronously loaded persisted state by contract */
/**
 * @file usePersistedState.js
 * @description Hook personalizado que simplifica el uso de estado persistente.
 * Une useState de React con useUserData para manejar la persistencia local (localStorage)
 * y remota (Supabase) en una sola línea de código, reduciendo código repetitivo.
 */

import { useState, useEffect, useCallback } from 'react'
import useUserData from './useUserData'

/**
 * Hook de persistencia de estado unificado.
 * Permite cambiar el estado localmente mientras propaga los cambios a localStorage y Supabase.
 * 
 * @export
 * @param {string} module - Nombre del módulo de la aplicación (ej: 'sonex')
 * @param {string} field - Nombre de la clave/campo (ej: 'sesiones')
 * @param {*} [defaultValue=null] - Valor por defecto inicial si no hay datos persistidos
 * @param {string[]} [legacyKeys=[]] - Listado de claves antiguas de localStorage para auto-migrar
 * @returns {[any, function]} Tupla con el estado actual y la función para actualizarlo (tipo useState)
 */
export default function usePersistedState(module, field, defaultValue = null, legacyKeys = []) {
  // Obtiene los datos cargados desde el almacenamiento unificado de useUserData
  const { data: stored, save } = useUserData(module, field, defaultValue, legacyKeys)
  
  // Estado local sincronizado
  const [state, setState] = useState(defaultValue)

  // Efecto que actualiza el estado local una vez que se cargan o cambian los datos persistidos
  useEffect(() => {
    if (stored !== undefined && stored !== null) {
      setState(stored)
    }
  }, [stored])

  /**
   * Función estable para actualizar tanto el estado local como el persistido.
   * Acepta tanto valores directos como funciones actualizadoras (setState style).
   */
  const setPersisted = useCallback((val) => {
    setState(prev => {
      const next = typeof val === 'function' ? val(prev) : val
      save(next) // Propagar cambios
      return next
    })
  }, [save])

  return [state, setPersisted]
}


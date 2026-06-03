import { useState, useEffect, useCallback } from 'react'
import useUserData from './useUserData'

/**
 * usePersistedState — Combines useState + useUserData into one.
 * Eliminates the repetitive useEffect + setX wrapper pattern.
 *
 * Before (10 lines):
 *   const { data: storedX, save: saveX } = useUserData('mod', 'field', default)
 *   const [x, setXState] = useState(default)
 *   useEffect(() => { if (storedX !== undefined) setXState(storedX) }, [storedX])
 *   const setX = useCallback((val) => {
 *     setXState(prev => { const next = typeof val === 'function' ? val(prev) : val; saveX(next); return next })
 *   }, [saveX])
 *
 * After (1 line):
 *   const [x, setX] = usePersistedState('mod', 'field', default, ['pfc_legacy_key'])
 */
export default function usePersistedState(module, field, defaultValue = null, legacyKeys = []) {
  const { data: stored, save } = useUserData(module, field, defaultValue, legacyKeys)
  const [state, setState] = useState(defaultValue)

  useEffect(() => {
    if (stored !== undefined && stored !== null) {
      setState(stored)
    }
  }, [stored])

  const setPersisted = useCallback((val) => {
    setState(prev => {
      const next = typeof val === 'function' ? val(prev) : val
      save(next)
      return next
    })
  }, [save])

  return [state, setPersisted]
}

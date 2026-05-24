import { useState, useEffect } from 'react'
import { safeGetJSON, safeSetJSON } from '../utils/storage'

/**
 * Hook de sincronización SIMPLIFICADO - solo localStorage (sin Firebase)
 * Para mantener compatibilidad con el código existente
 */
export default function useFirestoreSync(collectionPath, docId = 'default', initialData = null, localStorageKey = null) {
  const [data, setData] = useState(initialData)
  const [syncStatus, setSyncStatus] = useState('idle')
  
  // Usar localStorageKey o generar uno basado en collectionPath
  const storageKey = localStorageKey || `pfc_${collectionPath}_${docId}`.replace(/\//g, '_')

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const stored = safeGetJSON(storageKey)
    if (stored) {
      setData(stored)
      setSyncStatus('synced')
    } else {
      setSyncStatus('synced')
    }
  }, [storageKey])

  // Guardar datos en localStorage
  const saveData = (newData) => {
    setData(newData)
    const ok = safeSetJSON(storageKey, newData)
    setSyncStatus(ok ? 'synced' : 'error')
  }

  return {
    data,
    saveData,
    syncStatus,
  }
}

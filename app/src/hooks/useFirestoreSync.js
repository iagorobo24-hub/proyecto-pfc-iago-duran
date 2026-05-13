import { useState, useEffect } from 'react'

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
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setData(JSON.parse(stored))
        setSyncStatus('synced')
      } else {
        setSyncStatus('synced')
      }
    } catch (e) {
      console.warn('Error loading from localStorage:', e)
      setSyncStatus('error')
    }
  }, [storageKey])

  // Guardar datos en localStorage
  const saveData = (newData) => {
    try {
      setData(newData)
      localStorage.setItem(storageKey, JSON.stringify(newData))
      setSyncStatus('synced')
    } catch (e) {
      console.error('Error saving to localStorage:', e)
      setSyncStatus('error')
    }
  }

  return {
    data,
    saveData,
    syncStatus,
  }
}

import { useState, useEffect } from 'react';

/**
 * Hook simple de sincronización - usa localStorage en lugar de Firebase
 * Para el proyecto-fin-ciclo con Supabase
 */
export default function useFirestoreSync(collection, docId, defaultValue = [], storageKey) {
  const [data, setData] = useState(defaultValue);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSynced, setLastSynced] = useState(null);

  // Cargar datos desde localStorage al inicio
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setData(JSON.parse(stored));
      }
      setSyncStatus('synced');
      setLastSynced(new Date());
    } catch (e) {
      console.warn('Error loading from localStorage:', e);
      setSyncStatus('error');
    }
  }, [storageKey]);

  // Guardar datos en localStorage
  const saveData = async (newData) => {
    try {
      setSyncStatus('syncing');
      localStorage.setItem(storageKey, JSON.stringify(newData));
      setData(newData);
      setSyncStatus('synced');
      setLastSynced(new Date());
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
      setSyncStatus('error');
    }
  };

  return {
    data,
    saveData,
    syncStatus,
    lastSynced,
    isLocalOnly: true
  };
}

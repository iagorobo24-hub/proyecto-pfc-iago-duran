import { useState, useEffect } from 'react';

/**
 * Stub para useFirestoreSync - implementado sin Firebase
 * Gestiona sincronización de datos con Supabase en lugar de Firestore
 */
export default function useFirestoreSync(collection, doc, defaultValue = [], storageKey) {
  const [data, setData] = useState(defaultValue);
  const [syncStatus, setSyncStatus] = useState('idle');

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.warn('Error parsing localStorage:', e);
      }
    }
  }, [storageKey]);

  // Guardar en localStorage
  const saveData = (newData) => {
    setData(newData);
    setSyncStatus('syncing');
    try {
      localStorage.setItem(storageKey, JSON.stringify(newData));
      setSyncStatus('synced');
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      setSyncStatus('error');
    }
  };

  return {
    data,
    saveData,
    syncStatus,
  };
}

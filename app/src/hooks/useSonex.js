import { useState, useEffect, useRef, useCallback } from 'react';
import useFirestoreSync from './useFirestoreSync';

/**
 * Hook personalizado para Sonex - Asistente virtual Proyectos PFC
 * Gestiona historial de chat y configuraciones de sesión
 */
export function useSonex() {
  // Sync para historial de chat (ahora usa localStorage)
  const { data: historialData, saveData: saveHistorial, syncStatus: chatSync } = useFirestoreSync(
    'sonex',
    'history',
    [],
    'pfc_sonex_historial'
  );

  // Estados locales
  const [messages, setMessages] = useState(historialData || []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("");
  const [modoActivo, setModoActivo] = useState("busqueda");
  const [refsTurno, setRefsTurno] = useState([]);
  
  const messagesEndRef = useRef(null);

  // Normalizar timestamps al cargar mensajes
  const normalizarMensajes = (msgs) => {
    if (!Array.isArray(msgs)) return [];
    return msgs.map(m => ({
      ...m,
      timestamp: m.timestamp instanceof Date 
        ? m.timestamp 
        : (m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp?.seconds ? m.timestamp.seconds * 1000 : Date.now()))
    }));
  };

  // Actualizar mensajes cuando cambian los datos sincronizados
  useEffect(() => {
    if (historialData) {
      const normalizados = normalizarMensajes(historialData);
      setMessages(normalizados);
    }
  }, [historialData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const guardarMensaje = useCallback((nuevoMensaje) => {
    const msgNormalizado = {
      ...nuevoMensaje,
      timestamp: nuevoMensaje.timestamp instanceof Date 
        ? nuevoMensaje.timestamp 
        : new Date()
    };
    const nuevoHistorial = [...messages, msgNormalizado].slice(-100);
    setMessages(nuevoHistorial);
    saveHistorial(nuevoHistorial);
  }, [messages, saveHistorial]);

  const limpiarChat = () => {
    setMessages([]);
    saveHistorial([]);
  };

  const exportarChat = () => {
    const texto = messages.map(m => 
      `[${m.timestamp.toLocaleTimeString()}] ${m.role === 'user' ? 'Tú' : 'SONEX'}: ${m.content}`
    ).join('\n');
    return texto;
  };

  // Cargar sugerencias populares (hardcoded para evitar Firebase)
  const [sugerenciasPopulares, setSugerenciasPopulares] = useState([
    'Interruptor magnetotérmico',
    'Cable eléctrico',
    'Placa solar',
    'Domótica',
    'Iluminación LED'
  ]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);

  return {
    // Estados
    messages, setMessages,
    input, setInput,
    isLoading, setIsLoading,
    categoriaActiva, setCategoriaActiva,
    modoActivo, setModoActivo,
    refsTurno, setRefsTurno,
    sugerenciasPopulares,
    loadingSugerencias,

    // Refs
    messagesEndRef,

    // Acciones
    guardarMensaje,
    limpiarChat,
    exportarChat,
    scrollToBottom,

    // Sync status
    syncStatus: chatSync,
  };
}

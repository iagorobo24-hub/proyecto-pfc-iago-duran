/**
 * @file useSonex.js
 * @description Hook personalizado para gestionar el estado de conversación, historial
 * y sesiones del asistente técnico con IA "SONEX".
 * Se encarga de guardar y recuperar chats históricos, crear nuevas sesiones de chat,
 * limpiar la sesión actual, formatear mensajes y exportar conversaciones.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import usePersistedState from './usePersistedState';

// Listado estático de sugerencias populares. Se define a nivel de módulo (hoisted)
// para evitar re-crear la referencia del array en cada ciclo de renderizado.
const SUGERENCIAS_POPULARES = [
  'Interruptor magnetotérmico',
  'Cable eléctrico',
  'Placa solar',
  'Domótica',
  'Iluminación LED',
];

/**
 * Genera un ID único para una nueva sesión de chat basándose en la fecha y un aleatorio.
 * @returns {string} ID único formateado
 */
function generateId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Genera un título automático para el chat basándose en el primer mensaje del usuario.
 * @param {Array} messages - Listado de mensajes actuales
 * @returns {string} Título del chat
 */
function generateTitle(messages) {
  const first = messages.find(m => m.role === 'user');
  if (!first) return 'Nuevo chat';
  return first.content.length > 40 ? first.content.slice(0, 40) + '...' : first.content;
}

/**
 * Normaliza las fechas/timestamps de los mensajes recuperados para convertirlos a objetos Date nativos.
 * Soporta timestamps de Firestore/Supabase (segundos) o strings ISO.
 * 
 * @param {Array} msgs - Mensajes crudos
 * @returns {Array} Mensajes normalizados con objetos Date en `timestamp`
 */
function normalizarMensajes(msgs) {
  if (!Array.isArray(msgs)) return [];
  return msgs.map(m => ({
    ...m,
    timestamp: m.timestamp instanceof Date
      ? m.timestamp
      : (m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp?.seconds ? m.timestamp.seconds * 1000 : Date.now()))
  }));
}

/**
 * Crea un objeto de sesión de chat en blanco o con mensajes predefinidos.
 * 
 * @param {Array} [messages=[]] - Mensajes iniciales
 * @returns {object} Objeto de sesión de chat listo para ser persistido
 */
function createSessionObj(messages = []) {
  return {
    id: generateId(),
    title: messages.length > 0 ? generateTitle(messages) : 'Nuevo chat',
    messages: messages.map(m => ({ ...m, timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Hook de negocio para gestionar el asistente virtual SONEX.
 * Mantiene la persistencia del historial empleando el hook usePersistedState.
 * 
 * @export
 * @returns {object} Lógica, estados y acciones del asistente
 */
export function useSonex() {
  // Persistencia de sesiones de chat en localStorage/Supabase bajo el namespace 'sonex.sesiones'
  const [sessions, setSessions] = usePersistedState('sonex', 'sesiones', [], ['pfc_sonex_historial'])
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Referencia mutable al estado de mensajes para evitar que las funciones callback dependientes
  // del estado se re-creen innecesariamente cuando cambien los mensajes.
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages }, [messages]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('');
  const [modoActivo, setModoActivo] = useState('busqueda');
  const [refsTurno, setRefsTurno] = useState([]);

  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false)

  /**
   * Obtiene la sesión de chat actualmente activa.
   */
  const getActiveSession = useCallback(() => {
    return sessions.find(s => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  /**
   * Guarda los mensajes actuales en el listado de sesiones persistidas.
   */
  const saveCurrentMessages = useCallback((msgOverrides) => {
    setSessions(prev => {
      const msgs = msgOverrides !== undefined ? msgOverrides : messagesRef.current;
      return prev.map(s =>
        s.id === activeSessionId
          ? { 
              ...s, 
              messages: msgs.map(m => ({ ...m, timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp })), 
              title: msgs.length > 0 ? generateTitle(msgs) : s.title, 
              updatedAt: new Date().toISOString() 
            }
          : s
      );
    });
  }, [activeSessionId, setSessions]);

  // Inicialización de la sesión por defecto tras cargar el historial de sesiones
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    if (sessions.length > 0) {
      if (!activeSessionId) {
        const last = sessions[sessions.length - 1]
        setActiveSessionId(last.id)
        setMessages(normalizarMensajes(last.messages))
      }
    } else {
      const session = createSessionObj([])
      setSessions([session])
      setActiveSessionId(session.id)
    }
  }, [sessions.length, activeSessionId, sessions, setSessions])

  /**
   * Realiza un desplazamiento (scroll) suave de la pantalla hacia el último mensaje.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll al final del chat cuando llega un nuevo mensaje
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Guarda un nuevo mensaje en el listado de la conversación activa.
   * Evita duplicados comparando IDs de mensaje.
   * 
   * @param {object} nuevoMensaje - Mensaje con estructura { id, role, content, timestamp }
   */
  const guardarMensaje = useCallback((nuevoMensaje) => {
    const msgNormalizado = {
      ...nuevoMensaje,
      timestamp: nuevoMensaje.timestamp instanceof Date ? nuevoMensaje.timestamp : new Date(),
    };
    const currentMessages = messagesRef.current;
    const exists = currentMessages.find(m => m.id === msgNormalizado.id);
    const updatedMessages = exists
      ? currentMessages.map(m => m.id === msgNormalizado.id ? msgNormalizado : m)
      : [...currentMessages, msgNormalizado];
      
    // Limita la cantidad en memoria a los últimos 100 mensajes para optimizar rendimiento
    const trimmed = updatedMessages.slice(-100);
    setMessages(trimmed);
    saveCurrentMessages(trimmed);
  }, [saveCurrentMessages]);

  /**
   * Crea una nueva sesión de chat en blanco, guardando primero la sesión previa.
   */
  const createNewSession = useCallback(() => {
    saveCurrentMessages();
    const session = createSessionObj([]);
    setSessions(prev => [...prev, session]);
    setActiveSessionId(session.id);
    setMessages([]);
    setRefsTurno([]);
    setCategoriaActiva('');
    setModoActivo('busqueda');
  }, [saveCurrentMessages, setSessions]);

  /**
   * Cambia a otra sesión histórica de chat.
   * 
   * @param {string} sessionId - ID de la sesión objetivo
   */
  const switchSession = useCallback((sessionId) => {
    if (sessionId === activeSessionId) return;
    saveCurrentMessages();
    const target = sessions.find(s => s.id === sessionId);
    if (target) {
      setActiveSessionId(sessionId);
      setMessages(normalizarMensajes(target.messages));
      setRefsTurno([]);
    }
  }, [activeSessionId, sessions, saveCurrentMessages]);

  /**
   * Elimina una sesión del historial y redirige a otra existente o crea una nueva.
   * 
   * @param {string} sessionId - ID de la sesión a eliminar
   */
  const deleteSession = useCallback((sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        const next = remaining[remaining.length - 1];
        setActiveSessionId(next.id);
        setMessages(normalizarMensajes(next.messages));
      } else {
        const session = createSessionObj([]);
        setSessions([session]);
        setActiveSessionId(session.id);
        setMessages([]);
      }
    }
  }, [activeSessionId, sessions, setSessions]);

  /**
   * Limpia todos los mensajes de la conversación activa.
   */
  const limpiarChat = useCallback(() => {
    setMessages([]);
    saveCurrentMessages([]);
  }, [saveCurrentMessages]);

  /**
   * Exporta toda la conversación activa como un bloque de texto plano.
   * @returns {string} Bloque de texto plano formateado
   */
  const exportarChat = useCallback(() => {
    return messages.map(m =>
      `[${m.timestamp instanceof Date ? m.timestamp.toLocaleTimeString() : ''}] ${m.role === 'user' ? 'Tú' : 'SONEX'}: ${m.content}`
    ).join('\n');
  }, [messages]);

  const activeSession = getActiveSession();

  return {
    sessions,
    activeSessionId,
    activeSession,
    messages, setMessages,
    input, setInput,
    isLoading, setIsLoading,
    categoriaActiva, setCategoriaActiva,
    modoActivo, setModoActivo,
    refsTurno, setRefsTurno,
    sugerenciasPopulares: SUGERENCIAS_POPULARES,
    messagesEndRef,
    guardarMensaje,
    limpiarChat,
    exportarChat,
    scrollToBottom,
    createNewSession,
    switchSession,
    deleteSession,
  };
}


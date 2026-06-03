import { useState, useEffect, useRef, useCallback } from 'react';
import usePersistedState from './usePersistedState';

function generateId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function generateTitle(messages) {
  const first = messages.find(m => m.role === 'user');
  if (!first) return 'Nuevo chat';
  return first.content.length > 40 ? first.content.slice(0, 40) + '...' : first.content;
}

function normalizarMensajes(msgs) {
  if (!Array.isArray(msgs)) return [];
  return msgs.map(m => ({
    ...m,
    timestamp: m.timestamp instanceof Date
      ? m.timestamp
      : (m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp?.seconds ? m.timestamp.seconds * 1000 : Date.now()))
  }));
}

function createSessionObj(messages = []) {
  return {
    id: generateId(),
    title: messages.length > 0 ? generateTitle(messages) : 'Nuevo chat',
    messages: messages.map(m => ({ ...m, timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function useSonex() {
  const [sessions, setSessions] = usePersistedState('sonex', 'sesiones', [], ['pfc_sonex_historial'])
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages }, [messages]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('');
  const [modoActivo, setModoActivo] = useState('busqueda');
  const [refsTurno, setRefsTurno] = useState([]);

  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false)

  const getActiveSession = useCallback(() => {
    return sessions.find(s => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  const saveCurrentMessages = useCallback((msgOverrides) => {
    setSessions(prev => {
      const msgs = msgOverrides !== undefined ? msgOverrides : messagesRef.current;
      return prev.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: msgs.map(m => ({ ...m, timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp })), title: msgs.length > 0 ? generateTitle(msgs) : s.title, updatedAt: new Date().toISOString() }
          : s
      );
    });
  }, [activeSessionId]);

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
  }, [sessions.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const guardarMensaje = useCallback((nuevoMensaje) => {
    const msgNormalizado = {
      ...nuevoMensaje,
      timestamp: nuevoMensaje.timestamp instanceof Date ? nuevoMensaje.timestamp : new Date(),
    };
    const exists = messages.find(m => m.id === msgNormalizado.id);
    const updatedMessages = exists
      ? messages.map(m => m.id === msgNormalizado.id ? msgNormalizado : m)
      : [...messages, msgNormalizado];
    const trimmed = updatedMessages.slice(-100);
    setMessages(trimmed);
    saveCurrentMessages(trimmed);
  }, [messages, saveCurrentMessages]);

  const createNewSession = useCallback(() => {
    saveCurrentMessages();
    const session = createSessionObj([]);
    setSessions(prev => [...prev, session]);
    setActiveSessionId(session.id);
    setMessages([]);
    setRefsTurno([]);
    setCategoriaActiva('');
    setModoActivo('busqueda');
  }, [saveCurrentMessages]);

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
  }, [activeSessionId, sessions]);

  const limpiarChat = useCallback(() => {
    setMessages([]);
    saveCurrentMessages([]);
  }, [saveCurrentMessages]);

  const exportarChat = useCallback(() => {
    return messages.map(m =>
      `[${m.timestamp instanceof Date ? m.timestamp.toLocaleTimeString() : ''}] ${m.role === 'user' ? 'Tú' : 'SONEX'}: ${m.content}`
    ).join('\n');
  }, [messages]);

  const sugerenciasPopulares = [
    'Interruptor magnetotérmico',
    'Cable eléctrico',
    'Placa solar',
    'Domótica',
    'Iluminación LED',
  ];

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
    sugerenciasPopulares,
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

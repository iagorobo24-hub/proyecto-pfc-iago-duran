import { useState, useEffect, useRef, useCallback } from 'react';
import { safeGetJSON, safeSetJSON, safeRemoveItem } from '../utils/storage';

const STORAGE_KEY = 'pfc_sonex_sessions';

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
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('');
  const [modoActivo, setModoActivo] = useState('busqueda');
  const [refsTurno, setRefsTurno] = useState([]);

  const messagesEndRef = useRef(null);

  const persistSessions = useCallback((updatedSessions) => {
    safeSetJSON(STORAGE_KEY, updatedSessions);
  }, []);

  const getActiveSession = useCallback(() => {
    return sessions.find(s => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  const saveCurrentMessages = useCallback((msgOverrides) => {
    setSessions(prev => {
      const msgs = msgOverrides !== undefined ? msgOverrides : messages;
      const updated = prev.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: msgs.map(m => ({ ...m, timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp })), title: msgs.length > 0 ? generateTitle(msgs) : s.title, updatedAt: new Date().toISOString() }
          : s
      );
      persistSessions(updated);
      return updated;
    });
  }, [activeSessionId, messages, persistSessions]);

  useEffect(() => {
    try {
      const oldData = safeGetJSON('pfc_sonex_historial');
      const stored = safeGetJSON(STORAGE_KEY);

      if (stored) {
        const parsed = stored;
        setSessions(parsed);
        if (parsed.length > 0) {
          const last = parsed[parsed.length - 1];
          setActiveSessionId(last.id);
          setMessages(normalizarMensajes(last.messages));
        } else {
          const session = createSessionObj([]);
          setSessions([session]);
          setActiveSessionId(session.id);
          persistSessions([session]);
        }
      } else if (oldData) {
        const oldMessages = normalizarMensajes(oldData);
        const session = createSessionObj(oldMessages);
        setSessions([session]);
        setActiveSessionId(session.id);
        setMessages(oldMessages);
        persistSessions([session]);
        safeRemoveItem('pfc_sonex_historial');
      } else {
        const session = createSessionObj([]);
        setSessions([session]);
        setActiveSessionId(session.id);
        persistSessions([session]);
      }
    } catch (e) {
      console.warn('Error loading sessions:', e);
    }
  }, []);

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
    const updatedMessages = [...messages, msgNormalizado].slice(-100);
    setMessages(updatedMessages);
    saveCurrentMessages(updatedMessages);
  }, [messages, saveCurrentMessages]);

  const createNewSession = useCallback(() => {
    saveCurrentMessages();
    const session = createSessionObj([]);
    setSessions(prev => {
      const updated = [...prev, session];
      persistSessions(updated);
      return updated;
    });
    setActiveSessionId(session.id);
    setMessages([]);
    setRefsTurno([]);
    setCategoriaActiva('');
    setModoActivo('busqueda');
  }, [saveCurrentMessages, persistSessions]);

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
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      persistSessions(updated);
      return updated;
    });
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
        persistSessions([session]);
      }
    }
  }, [activeSessionId, sessions, persistSessions]);

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

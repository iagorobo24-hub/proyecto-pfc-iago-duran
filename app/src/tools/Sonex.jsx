import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { Clock, Plus, Trash2, MessageSquare, ChevronLeft } from 'lucide-react'
import catalogService from '../services/catalogService'
import { renderMarkdown } from '../utils/markdown'
import { FULL_CATEGORY_INFO } from '../data/categoryMapping'
import { useToast } from '../contexts/ToastContext'
import { useSonex } from '../hooks/useSonex'
import { trackEvent } from '../hooks/useAnalytics'
import styles from './Sonex.module.css'

const CATEGORIAS = Object.keys(FULL_CATEGORY_INFO).map(key => ({
  id: key,
  label: key,
  icon: FULL_CATEGORY_INFO[key].icon
}));

const MODO_OBJETOS = [
  { id: "busqueda", label: "🔍 Búsqueda", desc: "Buscar referencias y especificaciones" },
  { id: "comparativa", label: "⚖️ Comparativa", desc: "Comparar productos" },
  { id: "asistencia", label: "🤝 Asistencia", desc: "Selección y recomendaciones" },
  { id: "formacion", label: "📚 Formación", desc: "Instalación y uso" },
];

export default function Sonex() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    sessions, activeSessionId,
    messages, input, setInput, isLoading, setIsLoading,
    categoriaActiva, setCategoriaActiva, modoActivo, setModoActivo,
    refsTurno, setRefsTurno,
    messagesEndRef, sugerenciasPopulares,
    guardarMensaje,
    createNewSession, switchSession, deleteSession,
  } = useSonex();
  const [view, setView] = useState('chat');

  const extraerReferencias = async (texto) => {
    if (!texto) return [];
    
    // Detectar patrones que parecen referencias (Alfanuméricos, mayúsculas, min 5 caracteres)
    const patron = /\b([A-Z]{2,}[\d]{1,}[A-Z0-9]{1,}[A-Z0-9\-]*)\b/g;
    const matches = [...new Set(texto.match(patron) || [])].filter(ref => ref.length >= 5 && ref.length <= 30 && /\d/.test(ref));
    
    if (matches.length === 0) return [];

    // Buscar los datos reales en Firestore para verificar existencia
    try {
      const resultados = await Promise.all(
        matches.slice(0, 5).map(ref => catalogService.getProductoPorRef(ref))
      );
      return resultados.filter(Boolean).slice(0, 3);
    } catch (error) {
      console.error("Error al extraer referencias de Firestore:", error);
      return [];
    }
  };

  const irAFicha = (referencia) => { navigate(`/app/fichas?ref=${encodeURIComponent(referencia)}`); toast.show(`Abriendo ficha de ${referencia}`, 'success'); };
  const irAPresupuesto = (item) => { navigate(`/app/presupuestos?${new URLSearchParams({ producto: item.desc, referencia: item.ref })}`); toast.show(`${item.ref} añadido al presupuesto`, 'success'); };

  const [streamingText, setStreamingText] = useState('');

  const buildSystemPrompt = () => {
    const modoInstrucciones = {
      busqueda: 'Modo BÚSQUEDA activado. Responde con referencias técnicas exactas, especificaciones detalladas y datos concretos de productos. Prioriza códigos de referencia, secciones, materiales y rangos de operación. Sé preciso y directo.',
      comparativa: 'Modo COMPARATIVA activado. Organiza la respuesta en tablas comparativas con pros y contras. Destaca diferencias técnicas clave, rendimiento, precio relativo y caso de uso ideal para cada opción. Concluye con una recomendación clara.',
      asistencia: 'Modo ASISTENCIA activado. Actúa como asesor técnico: escucha la necesidad, valora el contexto de instalación, sugiere la solución más adecuada y explica por qué. Ofrece alternativas viables y consejos de montaje o compatibilidad.',
      formacion: 'Modo FORMACIÓN activado. Explica conceptos técnicos de forma didáctica y estructurada. Incluye normativa aplicable (REBT, UNE), pasos de instalación, esquemas conceptuales y buenas prácticas. Usa un tono pedagógico pero profesional.',
    };

    const categoriaTexto = categoriaActiva
      ? `\nEl usuario consulta desde la categoría: ${categoriaActiva}. Enfoca tu respuesta en productos y soluciones de esta familia técnica.`
      : '';

    return `Eres SONEX, un técnico superior del sector eléctrico con 20 años de experiencia en instalaciones industriales, automatización, domótica, climatización y energías renovables. Tu conocimiento abarca normativa vigente (REBT, UNE, IEC), productos de material eléctrico, sistemas de control y herramientas de medición.

Directrices obligatorias:
- Responde siempre con rigor técnico y lenguaje profesional.
- Nunca inventes productos, referencias, especificaciones o soluciones que no estén basadas en la realidad.
- Si no sabes algo, indícalo claramente en lugar de improvisar.
- Prioriza la seguridad y el cumplimiento normativo en cada recomendación.
- Sé conciso: ve al grano sin rodeos.
- Usa un tono formal pero cercano, como un compañero experto al que se le consulta en el mostrador técnico.

${modoInstrucciones[modoActivo] || modoInstrucciones.busqueda}${categoriaTexto}`;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    const userMsgId = Date.now();
    guardarMensaje({ id: userMsgId, role: "user", content: userMessage, timestamp: new Date() });
    setIsLoading(true);
    setStreamingText('');

    trackEvent('ia', 'consulta', modoActivo, userMessage.length)
    try {
      const { callAnthropicAIStream } = await import('../services/anthropicService');
      const aiMsgId = userMsgId + 1;

      guardarMensaje({ id: aiMsgId, role: "assistant", content: '', timestamp: new Date(), referencias: [] });

      let fullText = '';
      await callAnthropicAIStream(
        {
          provider: 'openrouter',
          model: "anthropic/claude-3.5-haiku",
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: [{ role: "user", content: userMessage }]
        },
        (chunk) => {
          fullText += chunk;
          setStreamingText(fullText);
        }
      );

      const refs = await extraerReferencias(fullText);
      guardarMensaje({ id: aiMsgId, role: "assistant", content: fullText, timestamp: new Date(), referencias: refs });
      if (refs.length > 0) setRefsTurno(prev => [...prev, ...refs]);
      setStreamingText('');
    } catch (error) {
      trackEvent('ia', 'error', modoActivo, error?.message || 'unknown')
      toast.show("Error al procesar la consulta");
      setStreamingText('');
    }
    setIsLoading(false);
  };

  const handleCategoriaClick = (categoriaId) => {
    setCategoriaActiva(categoriaActiva === categoriaId ? "" : categoriaId);
  };

  const handleModoClick = (modoId) => {
    setModoActivo(modoId);
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };

  const sugerenciasMostrar = (sugerenciasPopulares || []).length > 0 ? sugerenciasPopulares : ["Buscar variadores 3kW", "Comparar contactores", "Recomendar iluminación LED", "Ayuda con instalación VE", "Especificaciones cuadro"];

  return (
    <div className={styles.layout}>
      {/* Panel izquierdo */}
      <div className={styles.panelBusqueda}>
        {/* Header SONEX */}
        <div className={styles.sonexHeader}>
          <div className={styles.sonexIcon}>
            <span className={styles.sonexIconLetter}>S</span>
          </div>
          <div className={styles.sonexInfo}>
            <div className={styles.sonexName}>SONEX <span className={styles.sonexVersion}>v7</span></div>
            <div className={styles.sonexStatus}>
              <span className={styles.statusDot} />
              Asistente técnico IA · Sector Eléctrico
            </div>
          </div>
          <div className={styles.headerActions}>
            <button onClick={() => setView(view === 'history' ? 'chat' : 'history')} className={styles.historyToggle} title={view === 'history' ? 'Cerrar historial' : 'Historial de chats'}>
              {view === 'history' ? <ChevronLeft size={18} /> : <Clock size={18} />}
            </button>
            <button onClick={() => { createNewSession(); setView('chat'); }} className={styles.newChatBtn} title="Nuevo chat">
              <Plus size={18} />
            </button>
          </div>
        </div>

        {view === 'history' ? (
          <div className={styles.historyList}>
            {sessions.length === 0 ? (
              <div className={styles.historyEmpty}>
                <MessageSquare size={32} />
                <p>No hay chats guardados</p>
              </div>
            ) : (
              [...sessions].reverse().map(session => (
                <button
                  key={session.id}
                  className={`${styles.historyItem} ${session.id === activeSessionId ? styles.historyItemActive : ''}`}
                  onClick={() => { switchSession(session.id); setView('chat'); }}
                >
                  <div className={styles.historyItemContent}>
                    <span className={styles.historyItemTitle}>{session.title}</span>
                    <span className={styles.historyItemMeta}>
                      {session.messages.length} mensajes · {new Date(session.updatedAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (window.confirm('¿Eliminar esta conversación?')) deleteSession(session.id); }}
                    className={styles.historyItemDelete}
                    title="Eliminar chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </button>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Modos */}
            <div className={styles.seccion}>
              <div className={styles.seccionLabel}>MODO DE OPERACIÓN</div>
              <div role="tablist" aria-label="Modo de operación">
                {MODO_OBJETOS.map(modo => (
                  <button key={modo.id} role="tab" aria-selected={modoActivo === modo.id} onClick={() => handleModoClick(modo.id)} className={`${styles.modoBtn} ${modoActivo === modo.id ? styles['modoBtn--active'] : ''}`}>
                    <span className={styles.modoBtnLabel}>{modo.label}</span>
                    <span className={styles.modoBtnDesc}>{modo.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categorías */}
            <div className={styles.seccion}>
              <div className={styles.seccionLabel}>CATEGORÍAS</div>
              <div className={styles.categoriasGrid}>
                {CATEGORIAS.map(cat => (
                  <button key={cat.id} onClick={() => handleCategoriaClick(cat.id)} className={`${styles.catBtn} ${categoriaActiva === cat.id ? styles['catBtn--active'] : ''}`}>
                    <span className={styles.catBtnIcon}>{cat.icon}</span>
                    <span className={styles.catBtnLabel}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Referencias */}
            {refsTurno.length > 0 && (
              <div className={styles.seccion}>
                <div className={styles.seccionLabel}>REFERENCIAS EN TURNO ({refsTurno.length})</div>
                {refsTurno.slice(0, 5).map((ref, i) => (
                  <button key={i} className={styles.refCard} onClick={() => irAFicha(ref.ref)}>
                    <span className={styles.refCard__ref}>{ref.ref}</span>
                    <span className={styles.refCard__desc}>{ref.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Panel derecho — Chat */}
      <div className={styles.chatContainer}>
        <div className={styles.chatMessages}>
          {messages.length === 0 ? (
            <div className={styles.emptyChat}>
              <div className={styles.emptyChatAvatar}>S</div>
              <h2 className={styles.emptyChatTitle}>¿En qué puedo ayudarte?</h2>
              <p className={styles.emptyChatText}>
                Soy SONEX, tu asistente técnico especializado en material eléctrico e industrial.
                Pregúntame por referencias, comparativas o recomendaciones.
              </p>
              {sugerenciasMostrar.length > 0 && (
                <div className={styles.emptyChatSuggestions}>
                  {sugerenciasMostrar.slice(0, 4).map((sug, i) => (
                    <button key={i} onClick={() => setInput(sug)} className={styles.sugerenciaBtn}>{sug}</button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            messages.map((message, idx) => {
              const isLastAssistant = idx === messages.length - 1 && message.role === 'assistant' && !message.content && streamingText;
              const displayContent = isLastAssistant ? streamingText : message.content;
              return (
              <div key={message.id} className={`${styles.message} ${message.role === 'user' ? styles['message--user'] : ''}`}>
                <div className={styles.message__avatar}>{message.role === 'user' ? 'T' : 'S'}</div>
                <div className={styles.message__content}>
                  <div className={`${styles.message__bubble} ${message.role}`}>
                    {message.role === 'user' ? displayContent : <div className={styles.markdownContent} dangerouslySetInnerHTML={{ __html: renderMarkdown(displayContent) }} />}
                  </div>
                  {message.role === 'assistant' && message.referencias && message.referencias.length > 0 && (
                    <div className={styles.messageRefs}>
                      {message.referencias.map(item => (
                        <div key={item.ref} className={styles.messageRef}>
                          <button onClick={() => irAFicha(item.ref)} className={styles.messageRefBtn}>
                            📄 Ficha: {item.ref}
                          </button>
                          <button onClick={() => irAPresupuesto(item)} className={`${styles.messageRefBtn} ${styles.messageRefBtnSecondary}`}>
                            💶 Añadir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                    <div className={styles.message__time}>{message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              );
            })
          )}

          {isLoading && !streamingText && (
            <div className={styles.message}>
              <div className={styles.message__avatar} style={{ background: 'var(--blue-800)', color: 'var(--white)' }}>S</div>
              <div className={styles.message__content}>
                <div className={styles.message__bubble} style={{ background: 'var(--white)', border: '1px solid var(--gray-100)' }}>
                  <div className={styles.loadingDots}>
                    {[0, 1, 2].map(i => <div key={i} className={styles.loadingDots__dot} />)}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontStyle: 'italic', marginLeft: '8px' }}>SONEX está escribiendo...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className={styles.chatInput}>
          <div className={styles.chatInputContainer}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe tu consulta técnica..."
              className={styles.chatInputField}
              rows={1}
              disabled={isLoading}
              aria-label="Consulta técnica para SONEX"
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className={styles.chatSendBtn}
              aria-label="Enviar consulta"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

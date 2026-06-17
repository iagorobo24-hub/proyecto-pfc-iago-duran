/**
 * @file Sonex.jsx
 * @description Pantalla de la herramienta "SONEX" (Asistente Técnico con IA).
 * Proporciona un chat interactivo con soporte de streaming en tiempo real, selección de modos de operación
 * (búsqueda, comparativa, asistencia, formación) e integración contextual del catálogo técnico (RAG).
 * Utiliza importaciones dinámicas para diferir la carga de módulos pesados de IA y optimizar el bundle.
 */

import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { Clock, Plus, Trash2, MessageSquare, ChevronLeft } from 'lucide-react'
import catalogService from '../services/catalogService'
import { renderMarkdown } from '../utils/markdown'
import { getCategoriaMeta } from '../data/categories'
import { useToast } from '../contexts/ToastContext'
import { useSonex } from '../hooks/useSonex'
import { trackEvent } from '../hooks/useAnalytics'
import SonexProductResults from '../components/sonex/SonexProductResults'
import styles from './Sonex.module.css'

// Modos de operación técnica disponibles en el panel lateral
const MODO_OBJETOS = [
  { id: "busqueda", label: "🔍 Búsqueda", desc: "Buscar referencias y especificaciones" },
  { id: "comparativa", label: "⚖️ Comparativa", desc: "Comparar productos" },
  { id: "asistencia", label: "🤝 Asistencia", desc: "Selección y recomendaciones" },
  { id: "formacion", label: "📚 Formación", desc: "Instalación y uso" },
];

/**
 * Componente principal de la herramienta de asistente SONEX.
 * 
 * @export
 * @returns {JSX.Element}
 */
export default function Sonex() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extraer estados y funciones persistentes del hook de negocio
  const {
    sessions, activeSessionId,
    messages, input, setInput, isLoading, setIsLoading,
    categoriaActiva, setCategoriaActiva, modoActivo, setModoActivo,
    refsTurno, setRefsTurno,
    messagesEndRef, sugerenciasPopulares,
    guardarMensaje,
    createNewSession, switchSession, deleteSession,
  } = useSonex();
  
  const [view, setView] = useState('chat'); // Estado de vista activo: 'chat' o 'history' (historial)
  const [categorias, setCategorias] = useState([]);

  // Carga inicial y enriquecimiento de categorías técnicas desde la base de datos
  useEffect(() => {
    catalogService.getCategorias().then(dbCats => {
      const enriched = dbCats.map(cat => {
        const meta = getCategoriaMeta(cat.id)
        return {
          id: cat.id,
          label: meta.label || cat.label || cat.id,
          icon: meta.icon || cat.icon || '📁',
        }
      })
      setCategorias(enriched)
    }).catch(() => setCategorias([]))
  }, [])

  /**
   * Analiza el texto de respuesta de la IA mediante expresiones regulares para extraer referencias,
   * valida su existencia consultando el catálogo y devuelve un array de productos válidos.
   * 
   * @param {string} texto - Respuesta de la IA
   * @returns {Promise<Array>} Listado de referencias confirmadas existentes en la base de datos (máx 3)
   */
  const extraerReferencias = async (texto) => {
    if (!texto) return [];
    
    // RegExp para capturar strings alfanuméricos en mayúsculas de longitud 5-30 que contengan al menos un número
    const patron = /\b([A-Z]{2,}[\d]{1,}[A-Z0-9]{1,}[A-Z0-9-]*)\b/g;
    const matches = [...new Set(texto.match(patron) || [])].filter(ref => ref.length >= 5 && ref.length <= 30 && /\d/.test(ref));
    
    if (matches.length === 0) return [];

    try {
      // Validar la existencia de los códigos extraídos de forma concurrente (límite a los primeros 5)
      const resultados = await Promise.all(
        matches.slice(0, 5).map(ref => catalogService.getProductoPorRef(ref))
      );
      // Retornar solo aquellos productos que existen de forma real (máximo 3 referencias)
      return resultados.filter(Boolean).slice(0, 3);
    } catch (error) {
      console.error("Error al extraer referencias de Firestore:", error);
      return [];
    }
  };

  /**
   * Navega a la vista de fichas técnicas filtrando por una referencia determinada.
   */
  const getProductRef = (item) => item?.ref_fabricante || item?.ref || item || ''

  const irAFicha = (item) => {
    const referencia = getProductRef(item)
    if (!referencia) return
    trackEvent('sonex', 'sonex_open_ficha', referencia)
    navigate(`/app/fichas?ref=${encodeURIComponent(referencia)}`)
    toast.show(`Abriendo ficha de ${referencia}`, 'success')
  };

  /**
   * Redirige al asistente de presupuestos cargando el producto detectado.
   */
  const irAPresupuesto = (item) => {
    const referencia = getProductRef(item)
    if (!referencia) return
    const producto = item?.name || item?.desc || ''
    const precio = item?.precio ? String(item.precio) : '0'
    const params = new URLSearchParams({
      nuevo: '1',
      producto,
      referencia,
      precio,
    })
    trackEvent('sonex', 'sonex_add_budget', referencia)
    navigate(`/app/presupuestos?${params.toString()}`)
    toast.show(`${referencia} añadido a un presupuesto nuevo`, 'success')
  };

  const copiarReferencia = async (referencia) => {
    if (!referencia) return
    await navigator.clipboard.writeText(referencia)
    toast.show(`Referencia "${referencia}" copiada`, 'success')
  }

  // Texto acumulado durante el streaming de la respuesta de la IA
  const [streamingText, setStreamingText] = useState('');

  /**
   * Construye el prompt de sistema personalizado para la IA (Claude) basado en
   * el modo de operación activo, la categoría filtrada y el contexto RAG del catálogo.
   * 
   * @param {string} [catalogContext=''] - Datos reales del catálogo inyectados dinámicamente
   * @returns {string} Prompt final consolidado
   */
  const buildSystemPrompt = (catalogContext = '') => {
    const modoInstrucciones = {
      busqueda: 'Modo BÚSQUEDA activado. Responde con referencias técnicas exactas, especificaciones detalladas y datos concretos de productos. Prioriza códigos de referencia, secciones, materiales y rangos de operación. Sé preciso y directo.',
      comparativa: 'Modo COMPARATIVA activado. Organiza la respuesta en tablas comparativas con pros y contras. Destaca diferencias técnicas clave, rendimiento, precio relativo y caso de uso ideal para cada opción. Concluye con una recomendación clara.',
      asistencia: 'Modo ASISTENCIA activado. Actúa como asesor técnico: escucha la necesidad, valora el contexto de instalación, sugiere la solución más adecuada y explica por qué. Ofrece alternativas viables y consejos de montaje o compatibilidad.',
      formacion: 'Modo FORMACIÓN activado. Explica conceptos técnicos de forma didáctica y estructurada. Incluye normativa aplicable (REBT, UNE), pasos de instalación, esquemas conceptuales y buenas prácticas. Usa un tono pedagógico pero profesional.',
    };

    const categoriaTexto = categoriaActiva
      ? `\nEl usuario consulta desde la categoría: ${categoriaActiva}. Enfoca tu respuesta en productos y soluciones de esta familia técnica.`
      : '';

    const catalogSection = catalogContext
      ? `\n\n## CONTEXTO REAL DEL CATÁLOGO\n\nA continuación tienes datos REALES extraídos de la base de datos del catálogo.\nDEBES basar tu respuesta en estos datos cuando sean relevantes.\nSi el usuario pregunta por productos, referencias, precios o disponibilidad, USA estos datos.\nCuando encuentres productos en estos datos, INDÍCALO explícitamente (ej: "Según los datos de nuestro catálogo..." o "disponemos en base de datos...").\nSi la información no está en estos datos, indícalo y usa tu conocimiento técnico.\n\n${catalogContext}`
      : '';

    return `Eres SONEX, un técnico superior del sector eléctrico con 20 años de experiencia en instalaciones industriales, automatización, domótica, climatización y energías renovables. Tu conocimiento abarca normativa vigente (REBT, UNE, IEC), productos de material eléctrico, sistemas de control y herramientas de medición.
 
Directrices obligatorias:
- Responde siempre con rigor técnico y lenguaje profesional.
- Nunca inventes productos, referencias, especificaciones o soluciones que no estén basadas en la realidad.
- Si no sabes algo, indícalo claramente en lugar de improvisar.
- Prioriza la seguridad y el cumplimiento normativo en cada recomendación.
- Sé conciso: ve al grano sin rodeos.
- Usa un tono formal pero cercano, como un compañero experto al que se le consulta en el mostrador técnico.
 
${modoInstrucciones[modoActivo] || modoInstrucciones.busqueda}${categoriaTexto}${catalogSection}`;
  };

  /**
   * Manejador de envío de mensaje del usuario.
   * Emplea importación dinámica de servicios pesados para diferir la descarga de código JavaScript
   * hasta que sea estrictamente necesario.
   */
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
      const aiMsgId = userMsgId + 1;
      const { prepareSonexTurn } = await import('../services/sonexTurnOrchestrator');
      const turn = await prepareSonexTurn(userMessage, { activeCategory: categoriaActiva });

      trackEvent('sonex', 'sonex_intent_detected', turn.intent, turn.criteria.confidence)

      if (turn.kind === 'clarification') {
        guardarMensaje({
          id: aiMsgId,
          role: "assistant",
          content: turn.assistantMessage || 'Necesito algún dato técnico más para buscar referencias exactas.',
          timestamp: new Date(),
          referencias: [],
          catalogCards: [],
          externalCards: [],
          criteria: turn.criteria,
          intent: turn.intent,
        });
        setStreamingText('');
        return;
      }

      const historial = messages
        .filter(m => m.content)
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }));
      historial.push({ role: "user", content: userMessage });

      const { callAnthropicAIStream } = await import('../services/anthropicService');

      if (turn.kind === 'catalog') {
        const catalogCards = turn.catalogCards || [];
        trackEvent('sonex', 'sonex_catalog_results', turn.intent, catalogCards.length)
        guardarMensaje({
          id: aiMsgId,
          role: "assistant",
          content: '',
          timestamp: new Date(),
          referencias: [],
          catalogCards,
          externalCards: turn.externalCards || [],
          criteria: turn.criteria,
          intent: turn.intent,
        });

        let fullText = '';
        try {
          await callAnthropicAIStream(
            {
              provider: 'openrouter',
              model: "meta-llama/llama-3.3-70b-instruct:free",
              max_tokens: 800,
              system: buildSystemPrompt(turn.catalogContext),
              messages: historial,
            },
            (chunk) => {
              fullText += chunk;
              setStreamingText(fullText);
            }
          );
        } catch (error) {
          trackEvent('ia', 'error', modoActivo, error?.message || 'unknown')
          fullText = turn.assistantMessage || 'He preparado resultados de catálogo verificados para revisar.';
        }

        guardarMensaje({
          id: aiMsgId,
          role: "assistant",
          content: fullText || turn.assistantMessage || '',
          timestamp: new Date(),
          referencias: [],
          catalogCards,
          externalCards: turn.externalCards || [],
          criteria: turn.criteria,
          intent: turn.intent,
        });
        if (catalogCards.length > 0) {
          setRefsTurno(prev => [...prev, ...catalogCards.map(result => result.product)]);
        }
        setStreamingText('');
        return;
      }

      // ── BUNDLE SIZE OPTIMIZATION (Dynamic Imports) ──
      // Importar dinámicamente el contexto textual del catálogo solo para consultas generales
      const { buildCatalogContext } = await import('../services/sonexCatalogContext');
      const catalogContext = await buildCatalogContext(userMessage, categoriaActiva);
      guardarMensaje({ id: aiMsgId, role: "assistant", content: '', timestamp: new Date(), referencias: [] });

      let fullText = '';
      
      // Llamar al stream de la API de Claude
      await callAnthropicAIStream(
        {
          provider: 'openrouter',
          model: "meta-llama/llama-3.3-70b-instruct:free", 
          max_tokens: 1000,
          system: buildSystemPrompt(catalogContext),
          messages: historial,
        },
        (chunk) => {
          fullText += chunk;
          setStreamingText(fullText); // Actualizar el texto acumulado del streaming
        }
      );

      // Una vez concluido el streaming, extraer y verificar referencias técnicas
      const refs = await extraerReferencias(fullText);
      guardarMensaje({ id: aiMsgId, role: "assistant", content: fullText, timestamp: new Date(), referencias: refs });
      if (refs.length > 0) setRefsTurno(prev => [...prev, ...refs]);
      setStreamingText('');
    } catch (error) {
      trackEvent('ia', 'error', modoActivo, error?.message || 'unknown')
      toast.show("Error al procesar la consulta");
      setStreamingText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoriaClick = (categoriaId) => {
    setCategoriaActiva(categoriaActiva === categoriaId ? "" : categoriaId);
  };

  const handleModoClick = (modoId) => {
    setModoActivo(modoId);
  };

  const handleKeyPress = (e) => { 
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      handleSendMessage(); 
    } 
  };

  const sugerenciasMostrar = (sugerenciasPopulares || []).length > 0 
    ? sugerenciasPopulares 
    : ["Buscar variadores 3kW", "Comparar contactores", "Recomendar iluminación LED", "Ayuda con instalación VE", "Especificaciones cuadro"];

  return (
    <div className={styles.layout}>
      {/* Panel izquierdo: Controles e Historial */}
      <div className={styles.panelBusqueda}>
        {/* Cabecera SONEX */}
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
          // Vista de Historial de Conversaciones
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
          // Vista de Controles Activos del Chat
          <>
            {/* Selección del Modo */}
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

            {/* Selección de Categoría Técnica */}
            <div className={styles.seccion}>
              <div className={styles.seccionLabel}>CATEGORÍAS</div>
              <div className={styles.categoriasGrid}>
                {categorias.map(cat => (
                  <button key={cat.id} onClick={() => handleCategoriaClick(cat.id)} className={`${styles.catBtn} ${categoriaActiva === cat.id ? styles['catBtn--active'] : ''}`}>
                    <span className={styles.catBtnIcon}>{cat.icon}</span>
                    <span className={styles.catBtnLabel}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Referencias Extraídas en el Turno Activo */}
            {refsTurno.length > 0 && (
              <div className={styles.seccion}>
                <div className={styles.seccionLabel}>REFERENCIAS EN TURNO ({refsTurno.length})</div>
                {refsTurno.slice(0, 5).map((ref, i) => (
                  <button key={getProductRef(ref) || i} className={styles.refCard} onClick={() => irAFicha(ref)}>
                    <span className={styles.refCard__ref}>{getProductRef(ref)}</span>
                    <span className={styles.refCard__desc}>{ref.name || ref.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Panel derecho: Área del Chat */}
      <div className={styles.chatContainer}>
        <div className={styles.chatMessages}>
          {messages.length === 0 ? (
            // Mensaje de Bienvenida y Sugerencias de Consultas Rápidas
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
            // Mensajes Activos en la Conversación
            messages.map((message, idx) => {
              const isLastAssistant = idx === messages.length - 1 && message.role === 'assistant' && !message.content && streamingText;
              const displayContent = isLastAssistant ? streamingText : message.content;
              return (
                <div key={message.id} className={`${styles.message} ${message.role === 'user' ? styles['message--user'] : styles['message--assistant']}`}>
                  <div className={styles.message__avatar}>{message.role === 'user' ? 'T' : 'S'}</div>
                  <div className={styles.message__content}>
                    <div className={`${styles.message__bubble} ${message.role}`}>
                      {message.role === 'user' 
                        ? displayContent 
                        : <div className={styles.markdownContent} dangerouslySetInnerHTML={{ __html: renderMarkdown(displayContent) }} />
                      }
                    </div>
                    {message.role === 'assistant' && (message.catalogCards?.length > 0 || message.externalCards?.length > 0) && (
                      <SonexProductResults
                        catalogCards={message.catalogCards || []}
                        externalCards={message.externalCards || []}
                        onOpenFicha={irAFicha}
                        onAddBudget={irAPresupuesto}
                        onCopyRef={copiarReferencia}
                      />
                    )}
                    {/* Botones de acción contextuales para referencias detectadas en el texto */}
                    {message.role === 'assistant' && !(message.catalogCards?.length > 0) && message.referencias && message.referencias.length > 0 && (
                      <div className={styles.messageRefs}>
                        {message.referencias.map(item => (
                          <div key={getProductRef(item)} className={styles.messageRef}>
                            <button onClick={() => irAFicha(item)} className={styles.messageRefBtn}>
                              📄 Ficha: {getProductRef(item)}
                            </button>
                            <button onClick={() => irAPresupuesto(item)} className={`${styles.messageRefBtn} ${styles.messageRefBtnSecondary}`}>
                              💶 Añadir
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={styles.message__time}>
                      {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Loader de burbuja mientras se espera la primera respuesta de red de la IA */}
          {isLoading && !streamingText && (
            <div className={styles.message}>
              <div className={`${styles.message__avatar} ${styles.loadingAvatar}`}>S</div>
              <div className={styles.message__content}>
                <div className={`${styles.message__bubble} ${styles.loadingBubble}`}>
                  <div className={styles.loadingDots}>
                    {[0, 1, 2].map(i => <div key={i} className={styles.loadingDots__dot} />)}
                  </div>
                  <span className={styles.loadingText}>SONEX está escribiendo...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de Entrada de Texto */}
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


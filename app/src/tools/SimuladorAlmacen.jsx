import { useState, useEffect, useRef } from "react";
import Button from '../components/ui/Button'
import useMemoriaUsuario from '../hooks/useMemoriaUsuario'
import useSimuladorMultijugador from '../hooks/useSimuladorMultijugador'
import SimuladorPerfil from '../components/simulador/SimuladorPerfil'
import SimuladorOnboarding from '../components/simulador/SimuladorOnboarding'
import SimuladorEtapa from '../components/simulador/SimuladorEtapa'
import SimuladorResultados from '../components/simulador/SimuladorResultados'
import SalaMultijugador from '../components/simulador/SalaMultijugador'
import RankingMultijugador from '../components/simulador/RankingMultijugador'
import styles from './SimuladorAlmacen.module.css'

const ETAPAS = [
  { id: 0, nombre: "Recepción",    icono: "📥", desc: "Verificación de albarán y conteo de bultos",        estandar: 60  },
  { id: 1, nombre: "Ubicación",    icono: "📦", desc: "Transporte e introducción en ubicación WMS",        estandar: 90  },
  { id: 2, nombre: "Picking",      icono: "🔍", desc: "Extracción del producto de su ubicación",           estandar: null },
  { id: 3, nombre: "Verificación", icono: "✅", desc: "Comprobación de referencia y cantidad",             estandar: 30  },
  { id: 4, nombre: "Expedición",   icono: "🚚", desc: "Etiquetado y preparación para envío",               estandar: 45  },
];

const ESTANDAR_PICKING = {
  "Variador": 180, "Contactor": 45, "Sensor": 60, "PLC": 120,
  "Relé": 40, "Cable": 90, "Interruptor": 50, "Otro": 75,
};

const PEDIDOS_DEMO = [
  { id: 1, producto: "Variador ATV320 2.2kW", referencia: "ATV320U22M2",   categoria: "Variador",     cantidad: 1, cliente: "Instalaciones García",   urgente: true,  dificultad: "Intermedio" },
  { id: 2, producto: "Contactor LC1D40 220V", referencia: "LC1D40M7",      categoria: "Contactor",    cantidad: 3, cliente: "Mantenimiento Repsol",    urgente: false, dificultad: "Básico"      },
  { id: 3, producto: "Sensor inductivo IF5932", referencia: "IF5932",       categoria: "Sensor",       cantidad: 2, cliente: "Planta Ford Almussafes",  urgente: false, dificultad: "Básico"      },
  { id: 4, producto: "PLC Modicon M241",       referencia: "TM241CE24R",    categoria: "PLC",          cantidad: 1, cliente: "Inyección Plásticos S.A.", urgente: true,  dificultad: "Avanzado"    },
  { id: 5, producto: "Cable RVK 3x2.5mm²",    referencia: "RVK-3X2.5-100", categoria: "Cable",        cantidad: 5, cliente: "Obra polígono Grela",     urgente: false, dificultad: "Básico"      },
];

const INCIDENCIAS = [
  { id: "INC-01", etapa: 0, titulo: "Discrepancia en el albarán", descripcion: "El albarán indica 3 unidades pero en el pallet solo hay 2.", opciones: [
    { texto: "Registrar con 2 unidades y abrir incidencia al proveedor", correcto: true, feedback: "Correcto. Se registra lo recibido realmente y se notifica la discrepancia." },
    { texto: "Aceptar las 3 unidades en el sistema confiando en el albarán", correcto: false, feedback: "Incorrecto. Nunca se registra más stock del que existe físicamente." },
    { texto: "Devolver todo el pedido", correcto: false, feedback: "Incorrecto. Solo se devuelve si hay daño, no por discrepancia numérica." },
  ]},
  { id: "INC-02", etapa: 0, titulo: "Embalaje dañado", descripcion: "Una caja presenta golpes visibles.", opciones: [
    { texto: "Abrir la caja, verificar y fotografiar antes de firmar", correcto: true, feedback: "Correcto. Verificar y documentar antes de firmar conforme." },
    { texto: "Firmar conforme sin revisar", correcto: false, feedback: "Incorrecto. Firmar sin revisar implica aceptar posibles daños." },
  ]},
  { id: "INC-03", etapa: 1, titulo: "Ubicación WMS ocupada", descripcion: "La ubicación asignada ya tiene otro artículo.", opciones: [
    { texto: "Notificar al responsable y esperar reasignación", correcto: true, feedback: "Correcto. El responsable debe resolver el error de inventario." },
    { texto: "Colocar encima del existente", correcto: false, feedback: "Incorrecto. Mezclar productos genera errores de stock." },
  ]},
  { id: "INC-04", etapa: 2, titulo: "Referencia no encontrada", descripcion: "El WMS indica ubicación C-07-2 pero está vacía.", opciones: [
    { texto: "Reportar hueco y buscar en ubicaciones adyacentes", correcto: true, feedback: "Correcto. Registrar el hueco y buscar antes de declarar rotura." },
    { texto: "Marcar el pedido como no servible", correcto: false, feedback: "Incorrecto. Primero hay que buscar en otras ubicaciones." },
  ]},
  { id: "INC-05", etapa: 3, titulo: "Cantidad verificada mayor", descripcion: "El escáner confirma 4 unidades pero el pedido pide 3.", opciones: [
    { texto: "Devolver 1 unidad y verificar con las 3 correctas", correcto: true, feedback: "Correcto. Nunca se envía más de lo pedido." },
    { texto: "Incluir las 4 unidades como cortesía", correcto: false, feedback: "Incorrecto. Genera descuadres de stock e ingresos no registrados." },
  ]},
  { id: "INC-06", etapa: 4, titulo: "Dirección incompleta", descripcion: "Falta el número de nave en la etiqueta.", opciones: [
    { texto: "Contactar con el cliente para completar antes de etiquetar", correcto: true, feedback: "Correcto. Una etiqueta incompleta genera retrasos en la entrega." },
    { texto: "Etiquetar y enviar igualmente", correcto: false, feedback: "Incorrecto. El transportista no puede entregar con dirección incompleta." },
  ]},
  { id: "INC-07", etapa: 2, titulo: "Cantidad insuficiente", descripcion: "El pedido es de 3 contactores pero solo hay 1.", opciones: [
    { texto: "Coger 1, reportar diferencia y consultar stock alternativo", correcto: true, feedback: "Correcto. Servir lo disponible y gestionar el faltante." },
    { texto: "Esperar a que llegue más stock", correcto: false, feedback: "Incorrecto. El pedido queda bloqueado. Hay que gestionar el faltante." },
  ]},
  { id: "INC-08", etapa: 3, titulo: "Código de barras no escanea", descripcion: "El lector no lee el código del PLC.", opciones: [
    { texto: "Limpiar y reintentar; si falla, verificar manualmente", correcto: true, feedback: "Correcto. Solucionar el problema técnico o verificar manualmente." },
    { texto: "Dar por válida sin confirmar", correcto: false, feedback: "Incorrecto. Saltar la verificación es el origen de la mayoría de errores." },
  ]},
];

const fmtT = (s) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
const getEstandar = (etapaId, categoria) => etapaId === 2 ? (ESTANDAR_PICKING[categoria] || 75) : ETAPAS[etapaId].estandar;
const getSemaforo = (t, est) => {
  if (!est) return null;
  const pct = (t / est) * 100;
  if (pct <= 100) return { label: "OK", color: "var(--success)", bg: "var(--success-soft)" };
  if (pct <= 150) return { label: "Lento", color: "var(--warning)", bg: "var(--warning-soft)" };
  return { label: "Muy lento", color: "var(--color-error)", bg: "var(--color-error-soft)" };
};
const calcPuntuacion = (tiempos, categoria, incResueltas) => {
  let pts = 100;
  tiempos.forEach((t, i) => { const sem = getSemaforo(t, getEstandar(i, categoria)); if (sem?.label === "Muy lento") pts -= 10; else if (sem?.label === "Lento") pts -= 5; });
  incResueltas.forEach(r => { if (!r.correcto) pts -= 5; });
  return Math.max(0, pts);
};
const PROMPT_ANALISIS = (pedido, tiempos, categoria, incResueltas, operario) => {
  const estandares = ETAPAS.map((_, i) => getEstandar(i, categoria) || 75);
  const desv = tiempos.map((t, i) => Math.round(((t - estandares[i]) / estandares[i]) * 100));
  const incFalladas = incResueltas.filter(r => !r.correcto);
  return `Eres el responsable de logística de la empresa. Analiza la sesión.\nOperario: ${operario || "Anónimo"}\nPedido: ${pedido.producto} (${pedido.referencia})\n\nTiempos:\n${ETAPAS.map((e, i) => `- ${e.nombre}: ${tiempos[i]}s (est: ${estandares[i]}s, ${desv[i] > 0 ? "+" : ""}${desv[i]}%)`).join("\n")}\nTotal: ${tiempos.reduce((a, b) => a + b, 0)}s\nIncidencias: ${incResueltas.length} presentadas${incFalladas.length > 0 ? `, ${incFalladas.length} falladas` : ", todas correctas"}.\n\n3 párrafos: (1) rendimiento por etapa con tiempos, (2) gestión de incidencias, (3) recomendación accionable. Tono constructivo.`;
};

export default function SimuladorAlmacen() {
  const memoria = useMemoriaUsuario()
  const [historial, setHistorial] = memoria.simulador.historial.use()
  const [pantalla, setPantalla] = useState("perfil");
  const [operario, setOperario] = memoria.simulador.perfil.use()
  const [modoSim, setModoSim] = useState("entrenamiento");
  const [modoJuego, setModoJuego] = useState("solo");
  const multiplayer = useSimuladorMultijugador(operario)

  const isMultiplayer = modoJuego === "multijugador" && multiplayer.roomCode
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [etapaActual, setEtapaActual] = useState(0);
  const [tiempos, setTiempos] = useState([]);
  const [tiempoEtapa, setTiempoEtapa] = useState(0);
  const [log, setLog] = useState([]);
  const [analisis, setAnalisis] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [toast, setToast] = useState("");
  const [incActiva, setIncActiva] = useState(null);
  const [incResueltas, setIncResueltas] = useState([]);
  const [incPendientes, setIncPendientes] = useState([]);
  const [feedbackInc, setFeedbackInc] = useState(null);

  const intervalRef = useRef(null);
  const inicioEtapaRef = useRef(null);
  const [puntuacionPropia, setPuntuacionPropia] = useState(0);

  const guardarPerfil = () => { if (!operario.nombre.trim()) return; setOperario(operario); setPantalla("onboarding"); };
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  useEffect(() => {
    if (pantalla === "simulacion" && !incActiva && !feedbackInc) {
      inicioEtapaRef.current = Date.now();
      setTiempoEtapa(0);
      intervalRef.current = setInterval(() => setTiempoEtapa(Math.floor((Date.now() - inicioEtapaRef.current) / 1000)), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [pantalla, etapaActual, incActiva, feedbackInc]);

  const sortearIncidencias = () => {
    const pool = [...INCIDENCIAS]; const elegidas = [];
    [0, 1].forEach(etapa => { const c = pool.filter(i => i.etapa === etapa); if (c.length) elegidas.push(c[Math.floor(Math.random() * c.length)].id); });
    const c234 = pool.filter(i => [2, 3].includes(i.etapa)); if (c234.length) elegidas.push(c234[Math.floor(Math.random() * c234.length)].id);
    if (Math.random() > 0.5) { const c4 = pool.filter(i => i.etapa === 4); if (c4.length) elegidas.push(c4[Math.floor(Math.random() * c4.length)].id); }
    return elegidas;
  };

  const iniciarSimulacion = (pedido, modo) => {
    setPedidoActivo(pedido); setModoSim(modo); setEtapaActual(0); setTiempos([]); setLog([]); setAnalisis(""); setIncResueltas([]); setIncActiva(null); setFeedbackInc(null); setIncPendientes(sortearIncidencias()); setPuntuacionPropia(0);
    addLog(`▶ Pedido: ${pedido.producto} [${modo === "evaluacion" ? "EVALUACIÓN" : "ENTRENAMIENTO"}]`); setPantalla("simulacion");
  };

  const addLog = (msg) => { const hora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); setLog(prev => [`[${hora}] ${msg}`, ...prev].slice(0, 25)); };

  const comprobarIncidencia = (etapaId) => {
    const candidatas = incPendientes.filter(id => INCIDENCIAS.find(i => i.id === id)?.etapa === etapaId);
    if (candidatas.length) { const id = candidatas[0]; setIncPendientes(prev => prev.filter(i => i !== id)); setIncActiva(INCIDENCIAS.find(i => i.id === id)); if (intervalRef.current) clearInterval(intervalRef.current); }
  };

  const responderIncidencia = (opcion) => {
    const resultado = { titulo: incActiva.titulo, correcto: opcion.correcto, feedback: opcion.feedback };
    setIncResueltas(prev => [...prev, resultado]);
    setFeedbackInc(resultado);
    addLog(`⚡ INC: ${incActiva.titulo} → ${resultado.correcto ? "✅" : "❌"}`);
  };

  const continuarTrasFeedback = () => { setFeedbackInc(null); setIncActiva(null); intervalRef.current = setInterval(() => setTiempoEtapa(Math.floor((Date.now() - inicioEtapaRef.current) / 1000)), 1000); };

  const avanzarEtapa = () => {
    const tiempo = tiempoEtapa;
    setTiempos(prev => [...prev, tiempo]);
    addLog(`✓ ${ETAPAS[etapaActual].nombre}: ${fmtT(tiempo)}`);
    const siguiente = etapaActual + 1;
    const totalTime = [...tiempos, tiempo].reduce((a, b) => a + b, 0);
    if (isMultiplayer && multiplayer.actualizarProgreso) {
      multiplayer.actualizarProgreso({ etapa: siguiente, puntuacion: calcPuntuacion([...tiempos, tiempo], pedidoActivo?.categoria, incResueltas), tiempoTotal: totalTime });
    }
    if (siguiente < ETAPAS.length) {
      setEtapaActual(siguiente);
      if (intervalRef.current) clearInterval(intervalRef.current);
      comprobarIncidencia(siguiente);
    } else {
      finalizarSimulacion(tiempo);
    }
  };

  const finalizarSimulacion = (ultimoTiempo) => {
    const todosTiempos = [...tiempos, ultimoTiempo];
    const punt = calcPuntuacion(todosTiempos, pedidoActivo.categoria, incResueltas);
    setPuntuacionPropia(punt);
    if (isMultiplayer && multiplayer.finalizarPartida) {
      multiplayer.finalizarPartida({ puntuacion: punt, tiempoTotal: todosTiempos.reduce((a, b) => a + b, 0) });
    }
    const nuevaEntrada = { fecha: new Date().toISOString(), pedido: pedidoActivo, tiempos: todosTiempos, puntuacion: punt, incResueltas, operario: operario.nombre, modo: modoSim };
    const nuevoHistorial = [nuevaEntrada, ...historial].slice(0, 20);
    setHistorial(nuevoHistorial);
    setPantalla("resultado");
    if (cargando) return;
    setCargando(true);

    const callAI = async () => {
      try {
        const { callAnthropicAI } = await import('../services/anthropicService');
        const { text } = await callAnthropicAI({ 
          model: "anthropic/claude-3.5-haiku", 
          max_tokens: 800, 
          messages: [{ role: "user", content: PROMPT_ANALISIS(pedidoActivo, todosTiempos, pedidoActivo.categoria, incResueltas, operario.nombre) }] 
        });
        setAnalisis(text || "");
      } catch (error) {
        setAnalisis("Error al conectar con la IA.");
      } finally {
        setCargando(false);
      }
    };

    callAI();
  };

  const resetear = () => { setPantalla("onboarding"); setPedidoActivo(null); setTiempos([]); setIncResueltas([]); setIncActiva(null); setFeedbackInc(null); setAnalisis(""); };
  const verHistorial = (entrada) => { setPedidoActivo(entrada.pedido); setTiempos(entrada.tiempos); setIncResueltas(entrada.incResueltas || []); setPantalla("resultado"); setMostrarHistorial(false); };

  const estandarActual = getEstandar(etapaActual, pedidoActivo?.categoria);
  const semaforoActual = estandarActual ? getSemaforo(tiempoEtapa, estandarActual) : null;
  const puntuacionActual = calcPuntuacion(tiempos, pedidoActivo?.categoria, incResueltas);

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.main__content}>

          <div className={styles.pageHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2rem' }}>🏭</span>
              <h1 className={styles.pageTitle}>Simulador Almacén</h1>
            </div>
            <p className={styles.pageSubtitle}>Reproduce el ciclo completo de un pedido con incidencias reales</p>
          </div>

          {pantalla === "perfil" && (
            <SimuladorPerfil
              operario={operario}
              setOperario={setOperario}
              guardarPerfil={guardarPerfil}
            />
          )}

          {pantalla === "onboarding" && !multiplayer.partidaIniciada && (
            <>
              <div className={styles.modeToggle}>
                <button
                  className={`${styles.modeToggle__btn} ${modoJuego === 'solo' ? styles['modeToggle__btn--active'] : ''}`}
                  onClick={() => setModoJuego('solo')}
                >🎯 Solo</button>
                <button
                  className={`${styles.modeToggle__btn} ${modoJuego === 'multijugador' ? styles['modeToggle__btn--active'] : ''}`}
                  onClick={() => setModoJuego('multijugador')}
                >👥 Multijugador</button>
              </div>

              {modoJuego === 'solo' && (
                <SimuladorOnboarding
                  operario={operario}
                  historial={historial}
                  mostrarHistorial={mostrarHistorial}
                  setMostrarHistorial={setMostrarHistorial}
                  iniciarSimulacion={iniciarSimulacion}
                  verHistorial={verHistorial}
                  pedidosDemo={PEDIDOS_DEMO}
                />
              )}

              {modoJuego === 'multijugador' && (
                <SalaMultijugador
                  roomCode={multiplayer.roomCode}
                  jugadores={multiplayer.jugadores}
                  rol={multiplayer.rol}
                  error={multiplayer.error}
                  eventos={multiplayer.eventos}
                  partidaIniciada={multiplayer.partidaIniciada}
                  crearSala={multiplayer.crearSala}
                  unirseSala={multiplayer.unirseSala}
                  iniciarPartida={multiplayer.iniciarPartida}
                  abandonarSala={multiplayer.abandonarSala}
                />
              )}
            </>
          )}

          {pantalla === "onboarding" && multiplayer.partidaIniciada && (
            <div className={styles.circleLayout} style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎮</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px' }}>
                ¡Partida lista!
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                La simulación va a comenzar. Selecciona un pedido para empezar.
              </p>
              <SimuladorOnboarding
                operario={operario}
                historial={[]}
                mostrarHistorial={false}
                setMostrarHistorial={() => {}}
                iniciarSimulacion={(pedido, modo) => { iniciarSimulacion(pedido, modo || 'evaluacion') }}
                verHistorial={() => {}}
                pedidosDemo={PEDIDOS_DEMO}
              />
            </div>
          )}

          {pantalla === "simulacion" && pedidoActivo && (
            <SimuladorEtapa
              ETAPAS={ETAPAS}
              etapaActual={etapaActual}
              tiempoEtapa={tiempoEtapa}
              fmtT={fmtT}
              estandarActual={estandarActual}
              semaforoActual={semaforoActual}
              incActiva={incActiva}
              feedbackInc={feedbackInc}
              log={log}
              avanzarEtapa={avanzarEtapa}
              responderIncidencia={responderIncidencia}
              continuarTrasFeedback={continuarTrasFeedback}
            />
          )}

          {pantalla === "resultado" && pedidoActivo && tiempos.length > 0 && (
            <>
              {isMultiplayer && (
                <RankingMultijugador
                  jugadores={multiplayer.jugadores}
                  puntuacionPropia={puntuacionPropia}
                />
              )}
              <SimuladorResultados
                pedidoActivo={pedidoActivo}
                tiempos={tiempos}
                ETAPAS={ETAPAS}
                puntuacionActual={puntuacionActual}
                fmtT={fmtT}
                incResueltas={incResueltas}
                getEstandar={getEstandar}
                getSemaforo={getSemaforo}
                cargando={cargando}
                analisis={analisis}
                resetear={resetear}
                volver={() => {
                  if (isMultiplayer) multiplayer.abandonarSala()
                  setPantalla("onboarding")
                }}
              />
            </>
          )}

          {toast && (
            <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', padding: '8px 20px', background: 'var(--gray-800)', color: 'var(--white)', borderRadius: 'var(--radius-full)', fontSize: '0.8125rem', fontWeight: 500, zIndex: 999 }}>
              {toast}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

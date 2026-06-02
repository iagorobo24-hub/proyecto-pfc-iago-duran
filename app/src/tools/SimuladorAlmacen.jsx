import { useState, useRef, useEffect, useCallback } from "react";
import Button from '../components/ui/Button'
import useUserData from '../hooks/useUserData'
import useSimuladorMultijugador from '../hooks/useSimuladorMultijugador'
import { ETAPAS, PEDIDOS_DEMO, INCIDENCIAS, fmtT, getEstandar, getSemaforo, calcPuntuacion, PROMPT_ANALISIS } from '../data/simulador/simuladorData'
import SimuladorPerfil from '../components/simulador/SimuladorPerfil'
import SimuladorOnboarding from '../components/simulador/SimuladorOnboarding'
import SimuladorEtapa from '../components/simulador/SimuladorEtapa'
import SimuladorResultados from '../components/simulador/SimuladorResultados'
import SalaMultijugador from '../components/simulador/SalaMultijugador'
import RankingMultijugador from '../components/simulador/RankingMultijugador'
import styles from './SimuladorAlmacen.module.css'

export default function SimuladorAlmacen() {
  const { data: storedHistorial, save: saveHistorial } = useUserData('simulador', 'historial', [], [
    'pfc_simulador_historial',
  ])
  const { data: storedPerfil, save: savePerfil } = useUserData('simulador', 'perfil', { nombre: '', turno: 'Mañana', area: 'Almacén' }, [
    'pfc_simulador_perfil',
  ])
  const [historial, setHistorialState] = useState([])
  const [operario, setOperarioState] = useState({ nombre: '', turno: 'Mañana', area: 'Almacén' })

  useEffect(() => { if (storedHistorial) setHistorialState(storedHistorial) }, [storedHistorial])
  useEffect(() => { if (storedPerfil) setOperarioState(storedPerfil) }, [storedPerfil])

  const setHistorial = useCallback((val) => {
    setHistorialState(prev => {
      const next = typeof val === 'function' ? val(prev) : val
      saveHistorial(next)
      return next
    })
  }, [saveHistorial])

  const setOperario = useCallback((val) => {
    setOperarioState(prev => {
      const next = typeof val === 'function' ? val(prev) : val
      savePerfil(next)
      return next
    })
  }, [savePerfil])
  const [pantalla, setPantalla] = useState("perfil");
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
  const [incActiva, setIncActiva] = useState(null);
  const [incResueltas, setIncResueltas] = useState([]);
  const [incPendientes, setIncPendientes] = useState([]);
  const [feedbackInc, setFeedbackInc] = useState(null);

  const intervalRef = useRef(null);
  const inicioEtapaRef = useRef(null);
  const [puntuacionPropia, setPuntuacionPropia] = useState(0);

  const guardarPerfil = () => { if (!operario.nombre.trim()) return; setOperario(operario); setPantalla("onboarding"); };

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
              <div className={styles.modeToggle} role="tablist" aria-label="Modo de juego">
                <button
                  role="tab"
                  aria-selected={modoJuego === 'solo'}
                  className={`${styles.modeToggle__btn} ${modoJuego === 'solo' ? styles['modeToggle__btn--active'] : ''}`}
                  onClick={() => setModoJuego('solo')}
                >🎯 Solo</button>
                <button
                  role="tab"
                  aria-selected={modoJuego === 'multijugador'}
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

        </div>
      </main>
    </div>
  );
}

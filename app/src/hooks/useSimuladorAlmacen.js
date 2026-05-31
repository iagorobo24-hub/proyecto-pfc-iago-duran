import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { ETAPAS, INCIDENCIAS, PEDIDOS_DEMO, fmtT, getEstandar, getSemaforo, calcPuntuacion, PROMPT_ANALISIS } from '../data/simulador/simuladorData'

export { ETAPAS, PEDIDOS_DEMO, fmtT, getEstandar, getSemaforo, calcPuntuacion, PROMPT_ANALISIS }

function sortearIncidencias() {
  const pool = [...INCIDENCIAS]
  const elegidas = []
  ;[0, 1].forEach(etapa => {
    const c = pool.filter(i => i.etapa === etapa)
    if (c.length) elegidas.push(c[Math.floor(Math.random() * c.length)].id)
  })
  const c234 = pool.filter(i => [2, 3].includes(i.etapa))
  if (c234.length) elegidas.push(c234[Math.floor(Math.random() * c234.length)].id)
  if (Math.random() > 0.5) {
    const c4 = pool.filter(i => i.etapa === 4)
    if (c4.length) elegidas.push(c4[Math.floor(Math.random() * c4.length)].id)
  }
  return elegidas
}

export default function useSimuladorAlmacen({ historial, setHistorial, operario, multiplayer }) {
  const [pantalla, setPantalla] = useState("perfil")
  const [modoSim, setModoSim] = useState("entrenamiento")
  const [pedidoActivo, setPedidoActivo] = useState(null)
  const [etapaActual, setEtapaActual] = useState(0)
  const [tiempos, setTiempos] = useState([])
  const [tiempoEtapa, setTiempoEtapa] = useState(0)
  const [log, setLog] = useState([])
  const [analisis, setAnalisis] = useState("")
  const [cargando, setCargando] = useState(false)
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [toast, setToast] = useState("")
  const [incActiva, setIncActiva] = useState(null)
  const [incResueltas, setIncResueltas] = useState([])
  const [incPendientes, setIncPendientes] = useState([])
  const [feedbackInc, setFeedbackInc] = useState(null)
  const [puntuacionPropia, setPuntuacionPropia] = useState(0)

  const intervalRef = useRef(null)
  const inicioEtapaRef = useRef(null)
  const toastTimeoutRef = useRef(null)

  const isMultiplayer = multiplayer?.roomCode

  useEffect(() => {
    if (pantalla === "simulacion" && !incActiva && !feedbackInc) {
      inicioEtapaRef.current = Date.now()
      setTiempoEtapa(0)
      intervalRef.current = setInterval(() => setTiempoEtapa(Math.floor((Date.now() - inicioEtapaRef.current) / 1000)), 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [pantalla, etapaActual, incActiva, feedbackInc])

  const addLog = useCallback((msg) => {
    const hora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    setLog(prev => [`[${hora}] ${msg}`, ...prev].slice(0, 25))
  }, [])

  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast(msg)
    toastTimeoutRef.current = setTimeout(() => setToast(""), 2500)
  }, [])

  useEffect(() => {
    return () => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current) }
  }, [])

  const comprobarIncidencia = useCallback((etapaId) => {
    setIncPendientes(prev => {
      const candidatas = prev.filter(id => INCIDENCIAS.find(i => i.id === id)?.etapa === etapaId)
      if (candidatas.length) {
        const id = candidatas[0]
        setIncActiva(INCIDENCIAS.find(i => i.id === id))
        if (intervalRef.current) clearInterval(intervalRef.current)
        return prev.filter(i => i !== id)
      }
      return prev
    })
  }, [])

  const finalizarSimulacion = useCallback((todosTiempos, pedido, incResueltasArr, modo, nombreOperario) => {
    const punt = calcPuntuacion(todosTiempos, pedido.categoria, incResueltasArr)
    setPuntuacionPropia(punt)
    if (isMultiplayer && multiplayer?.finalizarPartida) {
      multiplayer.finalizarPartida({ puntuacion: punt, tiempoTotal: todosTiempos.reduce((a, b) => a + b, 0) })
    }
    const nuevaEntrada = { fecha: new Date().toISOString(), pedido, tiempos: todosTiempos, puntuacion: punt, incResueltas: incResueltasArr, operario: nombreOperario, modo }
    setHistorial(prev => [nuevaEntrada, ...prev].slice(0, 20))
    setPantalla("resultado")

    const callAI = async () => {
      setCargando(true)
      try {
        const { callAnthropicAI } = await import('../services/anthropicService')
        const { text } = await callAnthropicAI({
          model: "anthropic/claude-3.5-haiku",
          max_tokens: 800,
          messages: [{ role: "user", content: PROMPT_ANALISIS(pedido, todosTiempos, pedido.categoria, incResueltasArr, nombreOperario) }]
        })
        setAnalisis(text || "")
      } catch {
        setAnalisis("Error al conectar con la IA.")
      } finally {
        setCargando(false)
      }
    }
    callAI()
  }, [isMultiplayer, multiplayer, setHistorial])

  const iniciarSimulacion = useCallback((pedido, modo) => {
    setPedidoActivo(pedido)
    setModoSim(modo)
    setEtapaActual(0)
    setTiempos([])
    setLog([])
    setAnalisis("")
    setIncResueltas([])
    setIncActiva(null)
    setFeedbackInc(null)
    setIncPendientes(sortearIncidencias())
    setPuntuacionPropia(0)
    setPantalla("simulacion")
    const hora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    setLog([`[${hora}] ▶ Pedido: ${pedido.producto} [${modo === "evaluacion" ? "EVALUACIÓN" : "ENTRENAMIENTO"}]`])
  }, [])

  const incActivaRef = useRef(incActiva)
  useEffect(() => { incActivaRef.current = incActiva }, [incActiva])

  const responderIncidencia = useCallback((opcion) => {
    const current = incActivaRef.current
    if (!current) return
    const resultado = { titulo: current.titulo, correcto: opcion.correcto, feedback: opcion.feedback }
    setIncResueltas(prev => [...prev, resultado])
    setFeedbackInc(resultado)
    setIncActiva(null)
    const hora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    setLog(prev => [`[${hora}] ⚡ INC: ${current.titulo} → ${resultado.correcto ? "✅" : "❌"}`, ...prev].slice(0, 25))
  }, [])

  const continuarTrasFeedback = useCallback(() => {
    setFeedbackInc(null)
    setIncActiva(null)
    intervalRef.current = setInterval(() => setTiempoEtapa(Math.floor((Date.now() - inicioEtapaRef.current) / 1000)), 1000)
  }, [])

  const avanzarEtapa = useCallback(() => {
    const tiempo = tiempoEtapa
    const hora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    setLog(prev => [`[${hora}] ✓ ${ETAPAS[etapaActual].nombre}: ${fmtT(tiempo)}`, ...prev].slice(0, 25))
    const siguiente = etapaActual + 1

    let todosTiempos
    setTiempos(prev => {
      todosTiempos = [...prev, tiempo]
      return todosTiempos
    })

    if (isMultiplayer && multiplayer?.actualizarProgreso) {
      multiplayer.actualizarProgreso({
        etapa: siguiente,
        puntuacion: calcPuntuacion(todosTiempos, pedidoActivo?.categoria, incResueltas),
        tiempoTotal: todosTiempos.reduce((a, b) => a + b, 0),
      })
    }

    if (siguiente < ETAPAS.length) {
      setEtapaActual(siguiente)
      if (intervalRef.current) clearInterval(intervalRef.current)
      comprobarIncidencia(siguiente)
    } else {
      finalizarSimulacion(todosTiempos, pedidoActivo, incResueltas, modoSim, operario.nombre)
    }
  }, [tiempoEtapa, etapaActual, pedidoActivo, incResueltas, modoSim, operario, isMultiplayer, multiplayer, comprobarIncidencia, finalizarSimulacion])

  const resetear = useCallback(() => {
    setPantalla("onboarding")
    setPedidoActivo(null)
    setTiempos([])
    setIncResueltas([])
    setIncActiva(null)
    setFeedbackInc(null)
    setAnalisis("")
  }, [])

  const verHistorial = useCallback((entrada) => {
    setPedidoActivo(entrada.pedido)
    setTiempos(entrada.tiempos)
    setIncResueltas(entrada.incResueltas || [])
    setPantalla("resultado")
    setMostrarHistorial(false)
  }, [])

  const guardarPerfil = useCallback((operarioData) => {
    if (!operarioData.nombre.trim()) return
    setPantalla("onboarding")
  }, [])

  const estandarActual = useMemo(() => getEstandar(etapaActual, pedidoActivo?.categoria), [etapaActual, pedidoActivo?.categoria])
  const semaforoActual = useMemo(() => estandarActual ? getSemaforo(tiempoEtapa, estandarActual) : null, [tiempoEtapa, estandarActual])
  const puntuacionActual = useMemo(() => calcPuntuacion(tiempos, pedidoActivo?.categoria, incResueltas), [tiempos, pedidoActivo?.categoria, incResueltas])

  return {
    pantalla,
    setPantalla,
    modoSim,
    pedidoActivo,
    etapaActual,
    tiempos,
    tiempoEtapa,
    log,
    analisis,
    cargando,
    mostrarHistorial,
    setMostrarHistorial,
    toast,
    incActiva,
    incResueltas,
    feedbackInc,
    puntuacionPropia,
    estandarActual,
    semaforoActual,
    puntuacionActual,
    ETAPAS,
    fmtT,
    getEstandar,
    getSemaforo,
    PEDIDOS_DEMO,
    guardarPerfil,
    showToast,
    iniciarSimulacion,
    avanzarEtapa,
    responderIncidencia,
    continuarTrasFeedback,
    resetear,
    verHistorial,
  }
}
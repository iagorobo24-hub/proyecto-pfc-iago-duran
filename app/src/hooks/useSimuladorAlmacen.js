import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

export const ETAPAS = [
  { id: 0, nombre: "Recepción",    icono: "📥", desc: "Verificación de albarán y conteo de bultos",        estandar: 60  },
  { id: 1, nombre: "Ubicación",    icono: "📦", desc: "Transporte e introducción en ubicación WMS",        estandar: 90  },
  { id: 2, nombre: "Picking",      icono: "🔍", desc: "Extracción del producto de su ubicación",           estandar: null },
  { id: 3, nombre: "Verificación", icono: "✅", desc: "Comprobación de referencia y cantidad",             estandar: 30  },
  { id: 4, nombre: "Expedición",   icono: "🚚", desc: "Etiquetado y preparación para envío",               estandar: 45  },
]

export const ESTANDAR_PICKING = {
  "Variador": 180, "Contactor": 45, "Sensor": 60, "PLC": 120,
  "Relé": 40, "Cable": 90, "Interruptor": 50, "Otro": 75,
}

export const PEDIDOS_DEMO = [
  { id: 1, producto: "Variador ATV320 2.2kW", referencia: "ATV320U22M2",   categoria: "Variador",     cantidad: 1, cliente: "Instalaciones García",   urgente: true,  dificultad: "Intermedio" },
  { id: 2, producto: "Contactor LC1D40 220V", referencia: "LC1D40M7",      categoria: "Contactor",    cantidad: 3, cliente: "Mantenimiento Repsol",    urgente: false, dificultad: "Básico"      },
  { id: 3, producto: "Sensor inductivo IF5932", referencia: "IF5932",       categoria: "Sensor",       cantidad: 2, cliente: "Planta Ford Almussafes",  urgente: false, dificultad: "Básico"      },
  { id: 4, producto: "PLC Modicon M241",       referencia: "TM241CE24R",    categoria: "PLC",          cantidad: 1, cliente: "Inyección Plásticos S.A.", urgente: true,  dificultad: "Avanzado"    },
  { id: 5, producto: "Cable RVK 3x2.5mm²",    referencia: "RVK-3X2.5-100", categoria: "Cable",        cantidad: 5, cliente: "Obra polígono Grela",     urgente: false, dificultad: "Básico"      },
]

export const INCIDENCIAS = [
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
]

export const fmtT = (s) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`

export const getEstandar = (etapaId, categoria) =>
  etapaId === 2 ? (ESTANDAR_PICKING[categoria] || 75) : ETAPAS[etapaId].estandar

export const getSemaforo = (t, est) => {
  if (!est) return null
  const pct = (t / est) * 100
  if (pct <= 100) return { label: "OK", color: "var(--success)", bg: "var(--success-soft)" }
  if (pct <= 150) return { label: "Lento", color: "var(--warning)", bg: "var(--warning-soft)" }
  return { label: "Muy lento", color: "var(--color-error)", bg: "var(--color-error-soft)" }
}

export const calcPuntuacion = (tiempos, categoria, incResueltas) => {
  let pts = 100
  tiempos.forEach((t, i) => {
    const sem = getSemaforo(t, getEstandar(i, categoria))
    if (sem?.label === "Muy lento") pts -= 10
    else if (sem?.label === "Lento") pts -= 5
  })
  incResueltas.forEach(r => { if (!r.correcto) pts -= 5 })
  return Math.max(0, pts)
}

export const PROMPT_ANALISIS = (pedido, tiempos, categoria, incResueltas, operario) => {
  const estandares = ETAPAS.map((_, i) => getEstandar(i, categoria) || 75)
  const desv = tiempos.map((t, i) => Math.round(((t - estandares[i]) / estandares[i]) * 100))
  const incFalladas = incResueltas.filter(r => !r.correcto)
  return `Eres el responsable de logística de la empresa. Analiza la sesión.\nOperario: ${operario || "Anónimo"}\nPedido: ${pedido.producto} (${pedido.referencia})\n\nTiempos:\n${ETAPAS.map((e, i) => `- ${e.nombre}: ${tiempos[i]}s (est: ${estandares[i]}s, ${desv[i] > 0 ? "+" : ""}${desv[i]}%)`).join("\n")}\nTotal: ${tiempos.reduce((a, b) => a + b, 0)}s\nIncidencias: ${incResueltas.length} presentadas${incFalladas.length > 0 ? `, ${incFalladas.length} falladas` : ", todas correctas"}.\n\n3 párrafos: (1) rendimiento por etapa con tiempos, (2) gestión de incidencias, (3) recomendación accionable. Tono constructivo.`
}

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
export const ETAPAS = [
  { id: 0, nombre: "Recepción",    icono: "📥", desc: "Verificación de albarán y conteo de bultos",        estandar: 60  },
  { id: 1, nombre: "Ubicación",    icono: "📦", desc: "Transporte e introducción en ubicación WMS",        estandar: 90  },
  { id: 2, nombre: "Picking",      icono: "🔍", desc: "Extracción del producto de su ubicación",           estandar: null },
  { id: 3, nombre: "Verificación", icono: "✅", desc: "Comprobación de referencia y cantidad",             estandar: 30  },
  { id: 4, nombre: "Expedición",   icono: "🚚", desc: "Etiquetado y preparación para envío",               estandar: 45  },
];

export const ESTANDAR_PICKING = {
  "Variador": 180, "Contactor": 45, "Sensor": 60, "PLC": 120,
  "Relé": 40, "Cable": 90, "Interruptor": 50, "Otro": 75,
};

export const PEDIDOS_DEMO = [
  { id: 1, producto: "Variador ATV320 2.2kW", referencia: "ATV320U22M2",   categoria: "Variador",     cantidad: 1, cliente: "Instalaciones García",   urgente: true,  dificultad: "Intermedio" },
  { id: 2, producto: "Contactor LC1D40 220V", referencia: "LC1D40M7",      categoria: "Contactor",    cantidad: 3, cliente: "Mantenimiento Repsol",    urgente: false, dificultad: "Básico"      },
  { id: 3, producto: "Sensor inductivo IF5932", referencia: "IF5932",       categoria: "Sensor",       cantidad: 2, cliente: "Planta Ford Almussafes",  urgente: false, dificultad: "Básico"      },
  { id: 4, producto: "PLC Modicon M241",       referencia: "TM241CE24R",    categoria: "PLC",          cantidad: 1, cliente: "Inyección Plásticos S.A.", urgente: true,  dificultad: "Avanzado"    },
  { id: 5, producto: "Cable RVK 3x2.5mm²",    referencia: "RVK-3X2.5-100", categoria: "Cable",        cantidad: 5, cliente: "Obra polígono Grela",     urgente: false, dificultad: "Básico"      },
];

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
];

// ── Helpers ────────────────────────────────────────────────
export function fmtT(s) {
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

export function getEstandar(etapaId, categoria) {
  return etapaId === 2
    ? (ESTANDAR_PICKING[categoria] || 75)
    : ETAPAS[etapaId]?.estandar ?? null;
}

export function getSemaforo(t, est) {
  if (!est) return null;
  const pct = (t / est) * 100;
  if (pct <= 100) return { label: "OK",      color: "var(--success)",       bg: "var(--success-soft)" };
  if (pct <= 150) return { label: "Lento",    color: "var(--warning)",        bg: "var(--warning-soft)" };
  return                  { label: "Muy lento", color: "var(--color-error)",     bg: "var(--color-error-soft)" };
}

export function calcPuntuacion(tiempos, categoria, incResueltas) {
  let pts = 100;
  tiempos.forEach((t, i) => {
    const sem = getSemaforo(t, getEstandar(i, categoria));
    if (sem?.label === "Muy lento") pts -= 10;
    else if (sem?.label === "Lento") pts -= 5;
  });
  incResueltas.forEach(r => { if (!r.correcto) pts -= 5; });
  return Math.max(0, pts);
}

export function PROMPT_ANALISIS(pedido, tiempos, categoria, incResueltas, operario) {
  const estandares = ETAPAS.map((_, i) => getEstandar(i, categoria) || 75);
  const desv = tiempos.map((t, i) => Math.round(((t - estandares[i]) / estandares[i]) * 100));
  const incFalladas = incResueltas.filter(r => !r.correcto);
  return `Eres el responsable de logística de la empresa. Analiza la sesión.\nOperario: ${operario || "Anónimo"}\nPedido: ${pedido.producto} (${pedido.referencia})\n\nTiempos:\n${ETAPAS.map((e, i) => `- ${e.nombre}: ${tiempos[i]}s (est: ${estandares[i]}s, ${desv[i] > 0 ? "+" : ""}${desv[i]}%)`).join("\n")}\nTotal: ${tiempos.reduce((a, b) => a + b, 0)}s\nIncidencias: ${incResueltas.length} presentadas${incFalladas.length > 0 ? `, ${incFalladas.length} falladas` : ", todas correctas"}.\n\n3 párrafos: (1) rendimiento por etapa con tiempos, (2) gestión de incidencias, (3) recomendación accionable. Tono constructivo.`;
}
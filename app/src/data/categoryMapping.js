/**
 * Metadata de categorías del catálogo.
 * Source of truth para iconos, descripciones y consejos por familia.
 *
 * NOTA: Las categorías se cargan dinámicamente de la DB via catalogService.getCategorias().
 * Este archivo SOLO provee metadata complementaria (icon, desc, tip, label).
 * La key es el nombre exacto de la familia en la DB (UPPERCASE, sin normalizar).
 */
export const FULL_CATEGORY_INFO = {
  "AUTOMATIZACION": {
    label: 'Automatización',
    icon: '⚙️',
    desc: 'Contactores, relés térmicos, interruptores horarios y control modular para automatización industrial.',
    tip: 'Verifica la intensidad de empleo (A) y la tensión de la bobina del contactor.'
  },
  "AUTOMATIZACION DE EDIFICIOS": {
    label: 'Automatización de edificios',
    icon: '🏘️',
    desc: 'Domótica, sistemas KNX, videoporteros y mecanismos de control inteligente.',
    tip: 'Asegura la compatibilidad entre dispositivos y el protocolo de control (cableado o inalámbrico).'
  },
  "CABLES": {
    label: 'Cables',
    icon: '🧶',
    desc: 'Cables de baja, media y alta tensión, mangueras y conductores especiales.',
    tip: 'Selecciona según la sección (mm²), el número de conductores y el aislamiento (PVC, Libre de Halógenos, etc.).'
  },
  "DISTRIBUCION DE POTENCIA": {
    label: 'Distribución de potencia',
    icon: '⚡',
    desc: 'Aparamenta modular, envolventes, cuadros eléctricos y sistemas de gestión de cableado.',
    tip: 'Verifica la intensidad nominal (A), el poder de corte (kA) y el número de polos necesario.'
  },
  "FOTOVOLTAICA": {
    label: 'Fotovoltaica',
    icon: '☀️',
    desc: 'Paneles solares, inversores, reguladores de carga, cajas combinadoras y protecciones para instalaciones fotovoltaicas.',
    tip: 'Dimensiona el campo fotovoltaico según la potencia del inversor y verifica las protecciones en CC (sobretensión, seccionadores).'
  },
  "ILUMINACION": {
    label: 'Iluminación',
    icon: '💡',
    desc: 'Luminarias LED para interior, exterior, industrial, decorativa y alumbrado de emergencia.',
    tip: 'Calcula el nivel de iluminación requerido (lux) y elige la temperatura de color adecuada (K).'
  },
  "INSTALACION": {
    label: 'Instalación',
    icon: '📏',
    desc: 'Canalizaciones, bandejas portacables, minicanales y sistemas de instalación.',
    tip: 'Elige el tipo de canal según el número y sección de los conductores.'
  },
  "VEHICULOS_ELECTRICOS": {
    label: 'Vehículos eléctricos',
    icon: '🚗',
    desc: 'Puntos de recarga, protección para recarga y accesorios para movilidad eléctrica.',
    tip: 'Verifica la potencia de carga (kW), el tipo de conector (Tipo 2, CCS) y la protección diferencial tipo B o F.'
  },
  "CLIMATIZACION": {
    label: 'Climatización',
    icon: '🌡️',
    desc: 'Equipos de climatización, ventilación y aire acondicionado.',
    tip: 'Calcula la potencia frigorífica necesaria según la superficie y el aislamiento.'
  },
  "COMUNICACION": {
    label: 'Comunicación',
    icon: '📡',
    desc: 'Equipos de red, comunicaciones y sistemas de transmisión de datos.',
    tip: 'Verifica el tipo de cable (UTP, FTP) y la categoría (Cat5e, Cat6, etc.).'
  },
  "HERRAMIENTAS": {
    label: 'Herramientas',
    icon: '🔧',
    desc: 'Herramientas manuales, eléctricas y de medición para instalación.',
    tip: 'Elige la herramienta adecuada para cada tipo de trabajo y verifica su calibración.'
  },
  "PROTECCION": {
    label: 'Protección',
    icon: '🛡️',
    desc: 'Equipos de protección individual (EPIs) y seguridad eléctrica.',
    tip: 'Usa siempre el EPI adecuado para el trabajo y verifica su estado antes de usarlo.'
  },
  "FONTANERIA": {
    label: 'Fontanería',
    icon: '💧',
    desc: 'Equipos y materiales para instalaciones de fontanería y saneamiento.',
    tip: 'Selecciona los materiales según el tipo de fluido y la presión de trabajo.'
  },
  "ENERGIAS RENOVABLES": {
    label: 'Energías renovables',
    icon: '🌱',
    desc: 'Sistemas de energía renovable: solar, eólica y otras fuentes limpias.',
    tip: 'Estudia el recurso disponible (sol, viento) antes de dimensionar la instalación.'
  }
}

/**
 * Busca metadata de una familia por su nombre raw de DB.
 * Busca exacto → uppercase → fallback genérico.
 */
export function getCategoriaMeta(familia) {
  if (!familia) return { label: 'Sin categoría', icon: '📁', desc: '', tip: '' }
  if (FULL_CATEGORY_INFO[familia]) return FULL_CATEGORY_INFO[familia]
  const upper = familia.toUpperCase()
  if (FULL_CATEGORY_INFO[upper]) return FULL_CATEGORY_INFO[upper]
  return { label: familia, icon: '📁', desc: '', tip: '' }
}

/**
 * Mapeo completo de gamas comerciales por familia y subfamilia.
 * Generado automáticamente desde Supabase (scripts/generate_mapeo_consolidado.cjs)
 * Última actualización: 2026-06-02
 */
export const GAMAS_POR_FAMILIA = {
  /* FOTOVOLTAICA (24 productos - 5 subfamilias - 5 gamas) */
  'Fotovoltaica': {
    'Accesorios': ['Descargador PV Accesorio'],
    'Cajas combinadoras': ['Plexo³ PV'],
    'Interruptores CC': ['DX³ 800V='],
    'Protecciones sobretensión': ['Descargador PV'],
    'Seccionador CC': ['Seccionador DC'],
  },
  
  /* VEHÍCULOS ELÉCTRICOS (29 productos - 3 subfamilias - 5 gamas) */
  'Vehículos eléctricos': {
    'Accesorios': ["Green'up Accesorio"],
    'Protección para recarga': ['Acti 9'],
    'Puntos de recarga': ["Green'up Accesorio", "Green'up Home", "Green'up One", "Green'up Premium"],
  },
  
  /* ILUMINACIÓN (64 productos - 4 subfamilias - 13 gamas) */
  'Iluminación': {
    'Accesorio': ['C3LED Accesorio', 'Señalizacion', 'URA21 Accesorio'],
    'Bateria': ['Bateria Repuesto'],
    'Linterna': ['Linterna'],
    'Luminaria Emergencia': [
      'B65LED',
      'C3LED',
      'C3LED Autotest',
      'C3LED Estandar',
      'INOXLED',
      'NFL65 Estanca',
      'NT65 Estanca',
      'TEXLED',
    ],
  },
  
  /* AUTOMATIZACIÓN (251 productos - 12 subfamilias - 12 gamas) */
  'Automatización': {
    'Arrancador Suave': ['Soft Starter'],
    'Autómata Programable': ['Autómata Programable', '6ES7'],
    'Bloque Mando Osmoz': ['Osmoz', 'Acti 9 Osmoz'],
    'Contactor Industrial': ['Contactor Industrial'],
    'Contactor': ['Acti 9 iCT'],
    'Elemento de Control': ['Control Modular', 'Crepuscular', 'Interruptor Horario', 'Minuteria', 'Temporizador', 'iTL'],
    'Fuente Alimentacion': ['Fuente Conmutada'],
    'Interruptor Diferencial': ['Acti9 iCV40'],
    'Módulo de E/S': ['Módulo I/O'],
    'Pulsador Osmoz': ['Osmoz'],
    'Variador de Frecuencia': ['Variador Frecuencia'],
  },
  
  /* AUTOMATIZACIÓN DE EDIFICIOS (49 productos - 17 subfamilias - 9 gamas) */
  'Automatización de edificios': {
    'Acoplador KNX': ['KNX'],
    'Actuador HVAC KNX': ['KNX HVAC'],
    'Actuador HVAC': ['Smather Netatmo'],
    'Actuador KNX': ['KNX'],
    'Base Conectada': ['Hogar Conectado'],
    'Compensador': ['Hogar Conectado'],
    'Controlador KNX': ['KNX'],
    'Detector Movimiento': ['Hogar Conectado'],
    'Interface KNX': ['KNX'],
    'Interruptor Rotulo': ['Seguridad Rotulos'],
    'Mando Smart': ['Hogar Conectado'],
    'Micromodulo Smart': ['Hogar Conectado'],
    'Pasarela KNX': ['KNX DALI'],
    'Pulsador Telemando': ['Telemando'],
    'Router KNX': ['KNX'],
    'Sensor KNX': ['Green-I'],
    'Telemando': ['Telemando'],
  },
  
  /* DISTRIBUCIÓN DE POTENCIA (1000 productos - 26 subfamilias - 40+ gamas) */
  'Distribución de potencia': {
    'Accesorio': ['DPX³ Accesorio', 'Borna Tierra', 'Cortacircuito Accesorio', 'Cubrebornas', 'Mosaic', 'Obturador', 'Proteccion Bornas', 'Linergy', 'Prisma', 'Practibox Accesorio', 'A9E Pulsadores', 'Señalizacion'],
    'Arrancadores Suaves': ['3RW4'],
    'Bornas': ['5TB4'],
    'Caja Conexion': ['Plexo³'],
    'Caja Distribucion': ['Nedbox', 'Practibox'],
    'Central Reporte': ['Control Aislamiento'],
    'Conmutador': ['Conmutador'],
    'Contactor': ['5TT5'],
    'Contador eléctrico': ['Medición'],
    'Control Aislamiento': ['Control Aislamiento'],
    'Cortacircuito Fusible': ['Cortacircuito Seccionable'],
    'Interruptor Diferencial': ['5SY7', 'Acti 9', 'Acti 9 Vigi para iC60', 'Interruptor diferencial Acti 9 iID', 'RX³ Diferencial', 'TX³ Diferencial'],
    'Interruptor Magnetotérmico': ['ComPacT NSX', 'DPX³ 250', 'DPX³ 250 HP', '3VA2', '5JS6', '5SL3', '5SL30', '5SL4', '5SL58', '5SL6', '5SL60', '5SY4', '5SY6'],
    'Interruptor Seccionador': ['Vistop', 'iSW'],
    'Proteccion Sobretension': ['Limitador Sobretension', 'iPRC - iPRI', 'Mosaic'],
    'Rearmador': ['Rearmador diferencial'],
    'Relés de Seguridad': ['3RK1'],
    'Timbre': ['Señalizacion Acustica'],
    'Toma Corriente Industrial': ['Toma Industrial'],
    'Zumbador': ['Señalizacion Acustica'],
  },
}

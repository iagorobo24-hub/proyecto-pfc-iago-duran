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

export const SUBCATEGORY_LABELS = {
  /* Vehículos eléctricos */
  'Puntos de recarga': 'Puntos de recarga',
  'Protección para recarga': 'Protección para recarga',
  'Accesorios': 'Accesorios',
  
  /* Fotovoltaica */
  'Inversores y reguladores': 'Inversores y reguladores',
  'Seccionadores CC': 'Seccionadores CC',
  'Cajas combinadoras': 'Cajas combinadoras',
  'Protecciones sobretensión': 'Protecciones sobretensión',
  'Interruptores CC': 'Interruptores CC',
  
  /* Automatización */
  'Interruptor Magnetotérmico': 'Interruptor Magnetotérmico',
  'Interruptor Diferencial': 'Interruptor Diferencial',
  'Contactor': 'Contactor',
  'Elemento de Control': 'Elemento de Control',
  'Proteccion Sobretension': 'Protección Sobretensión',
  'Interruptor Seccionador': 'Interruptor Seccionador',
  'Rearmador': 'Rearmador Diferencial',
  'Accesorio': 'Accesorio',
  'Bloque Mando Osmoz': 'Bloque Mando Osmoz',
  'Pulsador Osmoz': 'Pulsador Osmoz',
  'Fuente Alimentacion': 'Fuente Alimentación',
}

export const TYPE_LABELS = {
  /* Fotovoltaica */
  'CARRIL DIN': 'Carril DIN',
  'Controlador Solar': 'Controlador Solar',
  'Monitor CC': 'Monitor CC',
  'Cajas para FV': 'Cajas para FV',
  
  /* General */
  'CAJA MOLDEADA': 'Caja Moldeada',
  'Piloto luminoso': 'Piloto Luminoso',
  'Contador eléctrico': 'Contador Eléctrico',
}

export const CATEGORY_IDS = {
  "cables": "Cables",
  "potencia": "Distribución de potencia",
  "automatizacion": "Automatización",
  "domotica": "Automatización de edificios",
  "fotovoltaica": "Fotovoltaica",
  "iluminacion": "Iluminación",
  "instalacion": "Instalación",
  "vehiculos": "Vehículos eléctricos",
}

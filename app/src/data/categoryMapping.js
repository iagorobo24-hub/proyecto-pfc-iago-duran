export const FULL_CATEGORY_INFO = {
  /* 🚗 VEHÍCULOS ELÉCTRICOS - MAPEO COMPLETO (29 productos)
   * 
   * Estructura:
   * ├── Puntos de recarga (23) - Legrand
   * │   └─ RECARGA
   * │      ├─ Green'up One
   * │      ├─ Green'up Home
   * │      └─ Green'up Premium
   * ├── Protección para recarga (5) - Schneider Electric
   * │   └─ CARRIL DIN
   * │      └─ Acti9 iID (tipo B EV)
   * └── Accesorios (1) - Legrand
   *     └─ RECARGA
   *        └─ Poste metálico Green'up
   */
  "AUTOMATIZACION": {
    icon: '⚙️',
    desc: 'Contactores, relés térmicos, interruptores horarios y control modular para automatización industrial.',
    tip: 'Verifica la intensidad de empleo (A) y la tensión de la bobina del contactor.'
  },
  "AUTOMATIZACION DE EDIFICIOS": {
    icon: '🏘️',
    desc: 'Domótica, sistemas KNX, videoporteros y mecanismos de control inteligente.',
    tip: 'Asegura la compatibilidad entre dispositivos y el protocolo de control (cableado o inalámbrico).'
  },
  "CABLES": {
    icon: '🧶',
    desc: 'Cables de baja, media y alta tensión, mangueras y conductores especiales.',
    tip: 'Selecciona según la sección (mm²), el número de conductores y el aislamiento (PVC, Libre de Halógenos, etc.).'
  },
  "DISTRIBUCION DE POTENCIA": {
    icon: '⚡',
    desc: 'Aparamenta modular, envolventes, cuadros eléctricos y sistemas de gestión de cableado.',
    tip: 'Verifica la intensidad nominal (A), el poder de corte (kA) y el número de polos necesario.'
  },
  "FOTOVOLTAICA": {
    icon: '☀️',
    desc: 'Paneles solares, inversores, baterías y puntos de recarga para movilidad eléctrica.',
    tip: 'Dimensiona el campo fotovoltaico según el consumo anual y la superficie disponible en cubierta.'
  },
  "ILUMINACION": {
    icon: '💡',
    desc: 'Luminarias LED para interior, exterior, industrial, decorativa y alumbrado de emergencia.',
    tip: 'Calcula el nivel de iluminación requerido (lux) y elige la temperatura de color adecuada (K).'
  },
  "INSTALACION": {
    icon: '📏',
    desc: 'Canalizaciones, bandejas portacables, minicanales y sistemas de instalación.',
    tip: 'Elige el tipo de canal según el número y sección de los conductores.'
  },
  "VEHICULOS ELECTRICOS": {
    icon: '🚗',
    desc: 'Puntos de recarga, protección para recarga y accesorios para movilidad eléctrica.',
    tip: 'Verifica la potencia de carga (kW), el tipo de conector (Tipo 2, CCS) y la protección diferencial tipo B o F.'
  },
  "Vehículos eléctricos": {
    icon: '🚗',
    desc: 'Puntos de recarga, protección para recarga y accesorios para movilidad eléctrica.',
    tip: 'Verifica la potencia de carga (kW), el tipo de conector (Tipo 2, CCS) y la protección diferencial tipo B o F.'
  },
  "CLIMATIZACION": {
    icon: '🌡️',
    desc: 'Equipos de climatización, ventilación y aire acondicionado.',
    tip: 'Calcula la potencia frigorífica necesaria según la superficie y el aislamiento.'
  },
  "COMUNICACION": {
    icon: '📡',
    desc: 'Equipos de red, comunicaciones y sistemas de transmisión de datos.',
    tip: 'Verifica el tipo de cable (UTP, FTP) y la categoría (Cat5e, Cat6, etc.).'
  },
  "HERRAMIENTAS": {
    icon: '🔧',
    desc: 'Herramientas manuales, eléctricas y de medición para instalación.',
    tip: 'Elige la herramienta adecuada para cada tipo de trabajo y verifica su calibración.'
  },
  "PROTECCION": {
    icon: '🛡️',
    desc: 'Equipos de protección individual (EPIs) y seguridad eléctrica.',
    tip: 'Usa siempre el EPI adecuado para el trabajo y verifica su estado antes de usarlo.'
  },
  "FONTANERIA": {
    icon: '💧',
    desc: 'Equipos y materiales para instalaciones de fontanería y saneamiento.',
    tip: 'Selecciona los materiales según el tipo de fluido y la presión de trabajo.'
  },
  "ENERGIAS RENOVABLES": {
    icon: '🌱',
    desc: 'Sistemas de energía renovable: solar, eólica y otras fuentes limpias.',
    tip: 'Estudia el recurso disponible (sol, viento) antes de dimensionar la instalación.'
  }
}

export const SUBCATEGORY_LABELS = {
  /* Vehículos eléctricos */
  'Puntos de recarga': 'Puntos de recarga',
  'Protección para recarga': 'Protección para recarga',
  'Accesorios': 'Accesorios',
  
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
  'CARRIL DIN': 'Carril DIN',
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
  "vehiculos": "Vehículos eléctricos", // ← Nombre canónico (sin barra, con tilde)
}

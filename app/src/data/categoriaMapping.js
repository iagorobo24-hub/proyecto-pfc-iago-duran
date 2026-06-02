export const SUBCATEGORIA_A_CATEGORIA = {
  'Interruptor Magnetotérmico': {
    categoria: 'Protección',
    subcategoria: {
      'CARRIL DIN': 'Magnetotérmico modular',
      'CAJA MOLDEADA': 'Magnetotérmico MCCB',
    },
  },
  'Interruptor Diferencial': { categoria: 'Protección', subcategoria: 'Diferencial' },
  'Proteccion Sobretension': { categoria: 'Protección', subcategoria: 'Sobretensión' },
  'Cortacircuito Fusible': { categoria: 'Protección', subcategoria: 'Fusibles' },
  'Interruptor Seccionador': { categoria: 'Seccionamiento', subcategoria: 'Seccionador' },
  'Seccionador CC': { categoria: 'Seccionamiento', subcategoria: 'Seccionador CC' },
  'Interruptor CC': { categoria: 'Seccionamiento', subcategoria: 'Interruptor CC' },
  'Interruptor Caja Moldeada': { categoria: 'Protección', subcategoria: 'Magnetotérmico MCCB' },
  'Rearmador': { categoria: 'Accesorios', subcategoria: 'Rearme' },
  'Control Aislamiento': { categoria: 'Accesorios', subcategoria: 'Control aislamiento' },
  'Central Reporte': { categoria: 'Accesorios', subcategoria: 'Central reporte' },
  'Accesorio': {
    categoria: 'Accesorios',
    subcategoria: {
      'Piloto luminoso': 'Pilotaje',
      'Contador eléctrico': 'Medida',
      'CARRIL DIN': 'Distribución',
    },
  },
  'Caja Distribucion': { categoria: 'Accesorios', subcategoria: 'Cajas distribución' },
  'Caja Conexion': { categoria: 'Accesorios', subcategoria: 'Cajas conexión' },
  'Conmutador': { categoria: 'Accesorios', subcategoria: 'Conmutación' },
  'Toma Corriente Industrial': { categoria: 'Accesorios', subcategoria: 'Tomas corriente' },
  'Fuente Alimentacion': { categoria: 'Accesorios', subcategoria: 'Fuentes alimentación' },
  'Timbre': { categoria: 'Accesorios', subcategoria: 'Señalización' },
  'Zumbador': { categoria: 'Accesorios', subcategoria: 'Señalización' },
  'Contactor': { categoria: 'Control Motor', subcategoria: 'Contactor' },
  'Elemento de Control': { categoria: 'Control Motor', subcategoria: 'Relés y control' },
  'Bloque Mando Osmoz': { categoria: 'Control Motor', subcategoria: 'Pulsadores' },
  'Pulsador Osmoz': { categoria: 'Control Motor', subcategoria: 'Pulsadores' },
  'Relé de Seguridad': { categoria: 'Accesorios', subcategoria: 'Relés y seguridad' },
  'Bornas': { categoria: 'Accesorios', subcategoria: 'Bornas y terminales' },
  'Arrancador Suave': { categoria: 'Control Motor', subcategoria: 'Arrancadores suaves' },
  'Contactor Industrial': { categoria: 'Control Motor', subcategoria: 'Contactor Industrial' },
  'Interruptor Motor': { categoria: 'Control Motor', subcategoria: 'Interruptor Motor' },
  'Relé Térmico': { categoria: 'Control Motor', subcategoria: 'Relé Térmico' },
  'Autómata Programable': { categoria: 'Control Motor', subcategoria: 'Autómata Programable' },
  'Variador de Frecuencia': { categoria: 'Control Motor', subcategoria: 'Variador de Frecuencia' },
  'Sistema de Control': { categoria: 'Control Motor', subcategoria: 'Sistema de Control' },
  'Actuador de Válvula': { categoria: 'Control Motor', subcategoria: 'Actuador de Válvula' },

  /* ── ILUMINACION ─────────────────────────────────────────────── */
  'Luminaria Emergencia': { categoria: 'Iluminación', subcategoria: 'Luminarias emergencia' },
  'Linterna': { categoria: 'Iluminación', subcategoria: 'Linternas' },
  'Bateria': { categoria: 'Iluminación', subcategoria: 'Baterías' },

  /* ── INSTALACION ────────────────────────────────────────────── */
  'Borniera': { categoria: 'Instalación', subcategoria: 'Bornieras' },
  'Canal de Instalación': { categoria: 'Instalación', subcategoria: 'Canales' },
  'Mini Canal': { categoria: 'Instalación', subcategoria: 'Mini canal' },
  'Bandeja Portacables': { categoria: 'Instalación', subcategoria: 'Bandejas portacables' },
  'Canalización': { categoria: 'Instalación', subcategoria: 'Canalizaciones' },

  /* ── VEHICULOS ELECTRICOS ───────────────────────────────────── */
  'Puntos de recarga': { categoria: 'Vehículo Eléctrico', subcategoria: 'Puntos de recarga' },
  'Protección para recarga': { categoria: 'Vehículo Eléctrico', subcategoria: 'Protección recarga' },

  /* ── FOTOVOLTAICA ───────────────────────────────────────────── */
  /* Sin mapping explícito — el fallback de construirGrupos agrupa
     por nombre de subfamilia. Evitar duplicar claves con DP
     (ej: 'Seccionador CC' colisiona entre DP y FV). */

  /* ── AUTOMATIZACION DE EDIFICIOS ────────────────────────────── */
  'Acoplador KNX': { categoria: 'Domótica', subcategoria: 'Dispositivos KNX' },
  'Actuador HVAC KNX': { categoria: 'Domótica', subcategoria: 'Actuadores HVAC' },
  'Actuador HVAC': { categoria: 'Domótica', subcategoria: 'Actuadores HVAC' },
  'Actuador KNX': { categoria: 'Domótica', subcategoria: 'Dispositivos KNX' },
  'Base Conectada': { categoria: 'Domótica', subcategoria: 'Hogar conectado' },
  'Compensador': { categoria: 'Domótica', subcategoria: 'Hogar conectado' },
  'Controlador KNX': { categoria: 'Domótica', subcategoria: 'Dispositivos KNX' },
  'Detector Movimiento': { categoria: 'Domótica', subcategoria: 'Hogar conectado' },
  'Interface KNX': { categoria: 'Domótica', subcategoria: 'Dispositivos KNX' },
  'Interruptor Rotulo': { categoria: 'Domótica', subcategoria: 'Seguridad' },
  'Mando Smart': { categoria: 'Domótica', subcategoria: 'Hogar conectado' },
  'Micromodulo Smart': { categoria: 'Domótica', subcategoria: 'Hogar conectado' },
  'Pasarela KNX': { categoria: 'Domótica', subcategoria: 'Dispositivos KNX' },
  'Pulsador Telemando': { categoria: 'Domótica', subcategoria: 'Telemando' },
  'Router KNX': { categoria: 'Domótica', subcategoria: 'Dispositivos KNX' },
  'Sensor KNX': { categoria: 'Domótica', subcategoria: 'Dispositivos KNX' },
  'Telemando': { categoria: 'Domótica', subcategoria: 'Telemando' },

  /* ── AUTOMATIZACION (completar faltantes) ────────────────────── */
  'Módulo de E/S': { categoria: 'Control Motor', subcategoria: 'Módulos E/S' },
  'Módulo de Comunicación': { categoria: 'Control Motor', subcategoria: 'Módulos comunicación' },
}

export function getCategoria(subfamilia, tipo) {
  const entry = SUBCATEGORIA_A_CATEGORIA[subfamilia]
  if (!entry) return null
  if (typeof entry.subcategoria === 'object') {
    return {
      categoria: entry.categoria,
      subcategoria: entry.subcategoria[tipo] || entry.subcategoria.default || subfamilia,
    }
  }
  return {
    categoria: entry.categoria,
    subcategoria: entry.subcategoria,
  }
}

export const CATEGORIA_ICONOS = {
  'Protección': '🛡️',
  'Seccionamiento': '🔌',
  'Accesorios': '🔧',
  'Control Motor': '⚙️',
  'Domótica': '🏘️',
  'Energía Solar': '☀️',
  'Iluminación': '💡',
  'Instalación': '📏',
  'Vehículo Eléctrico': '🚗',
  'Cables': '🧶',
  'Climatización': '🌡️',
  'Comunicación': '📡',
  'Herramientas': '🔨',
  'Fontanería': '💧',
  'Energías renovables': '🌱',
}

import type { CategoryMapping, CategoryMeta } from '../types/categories'

/**
 * Subfamilia → Categoría/Subcategoría mapping (for DP grouped navigation)
 */
export const SUBCATEGORIA_A_CATEGORIA: Record<string, CategoryMapping> = {
  'Interruptor Magnetotérmico': { categoria: 'Protección', subcategoria: { 'CARRIL DIN': 'Magnetotérmico modular', 'CAJA MOLDEADA': 'Magnetotérmico MCCB' } },
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
  'Accesorio': { categoria: 'Accesorios', subcategoria: { 'Piloto luminoso': 'Pilotaje', 'Contador eléctrico': 'Medida', 'CARRIL DIN': 'Distribución', 'default': 'Distribución' } },
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
  'Pulsador/Selector': { categoria: 'Control Motor', subcategoria: 'Pulsadores' },
  'Pulsador': { categoria: 'Control Motor', subcategoria: 'Pulsadores' },
  'Relé de Seguridad': { categoria: 'Accesorios', subcategoria: 'Relés y seguridad' },
  'HMI': { categoria: 'Control Motor', subcategoria: 'Interfaces HMI' },
  'Detector Inductivo': { categoria: 'Control Motor', subcategoria: 'Sensores' },
  'Final de Carrera': { categoria: 'Control Motor', subcategoria: 'Sensores' },
  'Interruptor Horario': { categoria: 'Control Motor', subcategoria: 'Relés y control' },
  'Relé de Control': { categoria: 'Control Motor', subcategoria: 'Relés y control' },
  'Bornas': { categoria: 'Accesorios', subcategoria: 'Bornas y terminales' },
  'Arrancador Suave': { categoria: 'Control Motor', subcategoria: 'Arrancadores suaves' },
  'Arrancador': { categoria: 'Control Motor', subcategoria: 'Arrancadores suaves' },
  'Guardamotor': { categoria: 'Control Motor', subcategoria: 'Interruptor Motor' },
  'Contactor Industrial': { categoria: 'Control Motor', subcategoria: 'Contactor Industrial' },
  'Interruptor Motor': { categoria: 'Control Motor', subcategoria: 'Interruptor Motor' },
  'Relé Térmico': { categoria: 'Control Motor', subcategoria: 'Relé Térmico' },
  'Autómata Programable': { categoria: 'Control Motor', subcategoria: 'Autómata Programable' },
  'Variador de Frecuencia': { categoria: 'Control Motor', subcategoria: 'Variador de Frecuencia' },
  'Sistema de Control': { categoria: 'Control Motor', subcategoria: 'Sistema de Control' },
  'Actuador de Válvula': { categoria: 'Control Motor', subcategoria: 'Actuador de Válvula' },
  'Módulo de E/S': { categoria: 'Control Motor', subcategoria: 'Módulos E/S' },
  'Módulo de Comunicación': { categoria: 'Control Motor', subcategoria: 'Módulos comunicación' },
  'Luminaria Emergencia': { categoria: 'Iluminación', subcategoria: 'Luminarias emergencia' },
  'Linterna': { categoria: 'Iluminación', subcategoria: 'Linternas' },
  'Bateria': { categoria: 'Iluminación', subcategoria: 'Baterías' },
  'Borniera': { categoria: 'Instalación', subcategoria: 'Bornieras' },
  'Canal de Instalación': { categoria: 'Instalación', subcategoria: 'Canales' },
  'Mini Canal': { categoria: 'Instalación', subcategoria: 'Mini canal' },
  'Bandeja Portacables': { categoria: 'Instalación', subcategoria: 'Bandejas portacables' },
  'Canalización': { categoria: 'Instalación', subcategoria: 'Canalizaciones' },
  'Puntos de recarga': { categoria: 'Vehículo Eléctrico', subcategoria: 'Puntos de recarga' },
  'Protección para recarga': { categoria: 'Vehículo Eléctrico', subcategoria: 'Protección recarga' },
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
  'Contador Eléctrico': { categoria: 'Accesorios', subcategoria: 'Medida' },
  'Contador energía': { categoria: 'Accesorios', subcategoria: 'Medida' },
  'Analizador redes': { categoria: 'Accesorios', subcategoria: 'Medida' },
  'Sensor energía': { categoria: 'Accesorios', subcategoria: 'Medida' },
  'Gateway comunicación': { categoria: 'Control Motor', subcategoria: 'Módulos comunicación' },
  'PLC/Relé programable': { categoria: 'Control Motor', subcategoria: 'Autómata Programable' },
  'PLC': { categoria: 'Control Motor', subcategoria: 'Autómata Programable' },
  'Variador velocidad': { categoria: 'Control Motor', subcategoria: 'Variador de Frecuencia' },
  'Fuente alimentación': { categoria: 'Accesorios', subcategoria: 'Fuentes alimentación' },
  'Protección arco': { categoria: 'Accesorios', subcategoria: 'Relés y seguridad' },
  'Carga rápida VE': { categoria: 'Vehículo Eléctrico', subcategoria: 'Puntos de recarga' },
  'Carga VE': { categoria: 'Vehículo Eléctrico', subcategoria: 'Puntos de recarga' },
  'Canalización prefabricada': { categoria: 'Instalación', subcategoria: 'Canalizaciones' },
  'Caja Combinadora': { categoria: 'Energía Solar', subcategoria: 'Cajas combinadoras' },
  'Termostato': { categoria: 'Climatización', subcategoria: 'Termostatos' },
  // Robótica ABB
  'Robot Industrial': { categoria: 'Robótica', subcategoria: 'Robot Industrial' },
  'Controlador de Robot': { categoria: 'Robótica', subcategoria: 'Controlador de Robot' },
  'Accesorio de Robot': { categoria: 'Robótica', subcategoria: 'Accesorio de Robot' },
}

export function getCategoria(subfamilia: string, tipo: string): { categoria: string; subcategoria: string } | null {
  const entry = SUBCATEGORIA_A_CATEGORIA[subfamilia]
  if (!entry) return null
  if (typeof entry.subcategoria === 'object') {
    return {
      categoria: entry.categoria,
      subcategoria: entry.subcategoria[tipo] || entry.subcategoria['default'] || subfamilia,
    }
  }
  return { categoria: entry.categoria, subcategoria: entry.subcategoria }
}

export const CATEGORIA_ICONOS: Record<string, string> = {
  'Protección': '🛡️', 'Seccionamiento': '🔌', 'Accesorios': '🔧', 'Control Motor': '⚙️',
  'Domótica': '🏘️', 'Energía Solar': '☀️', 'Iluminación': '💡', 'Instalación': '📏',
  'Vehículo Eléctrico': '🚗', 'Cables': '🧶', 'Climatización': '🌡️', 'Comunicación': '📡',
  'Herramientas': '🔨', 'Fontanería': '💧', 'Energías renovables': '🌱', 'Robótica': '🤖',
}

export const SUBCATEGORIA_ETIQUETAS: Record<string, string> = {
  'Magnetotérmico modular': 'Magnetotérmico modular', 'Magnetotérmico MCCB': 'Magnetotérmico MCCB',
  'Diferencial': 'Diferencial', 'Sobretensión': 'Sobretensión', 'Fusibles': 'Fusibles',
  'Seccionador': 'Seccionador', 'Seccionador CC': 'Seccionador CC', 'Interruptor CC': 'Interruptor CC',
  'Rearme': 'Rearme', 'Control aislamiento': 'Control aislamiento', 'Central reporte': 'Central reporte',
  'Pilotaje': 'Pilotaje', 'Medida': 'Medida', 'Distribución': 'Distribución',
  'Cajas distribución': 'Cajas distribución', 'Cajas conexión': 'Cajas conexión',
  'Conmutación': 'Conmutación', 'Tomas corriente': 'Tomas corriente',
  'Fuentes alimentación': 'Fuentes alimentación', 'Señalización': 'Señalización',
  'Contactor': 'Contactor', 'Relés y control': 'Relés y control', 'Pulsadores': 'Pulsadores',
  'Relés y seguridad': 'Relés y seguridad', 'Bornas y terminales': 'Bornas y terminales',
  'Arrancadores suaves': 'Arrancadores suaves', 'Contactor Industrial': 'Contactor Industrial',
  'Interfaces HMI': 'Interfaces HMI', 'Sensores': 'Sensores',
  'Interruptor Motor': 'Interruptor Motor', 'Relé Térmico': 'Relé Térmico',
  'Arrancador Suave': 'Arrancador Suave', 'Sistema de Control': 'Sistema de Control',
  'Actuador de Válvula': 'Actuador de Válvula', 'Luminarias emergencia': 'Luminarias de emergencia',
  'Linternas': 'Linternas', 'Baterías': 'Baterías', 'Bornieras': 'Bornieras',
  'Canales': 'Canales de instalación', 'Mini canal': 'Mini canal',
  'Bandejas portacables': 'Bandejas portacables', 'Canalizaciones': 'Canalizaciones',
  'Puntos de recarga': 'Puntos de recarga', 'Protección recarga': 'Protección para recarga',
  'Dispositivos KNX': 'Dispositivos KNX', 'Actuadores HVAC': 'Actuadores HVAC',
  'Hogar conectado': 'Hogar conectado', 'Seguridad': 'Seguridad', 'Telemando': 'Telemando',
  'Módulos E/S': 'Módulos E/S', 'Módulos comunicación': 'Módulos de comunicación',
  'Autómata Programable': 'Autómata Programable',
  'Variador de Frecuencia': 'Variador de Frecuencia',
  'Cajas combinadoras': 'Cajas combinadoras',
  'Termostatos': 'Termostatos',
  // Robótica
  'Robot Industrial': 'Robot Industrial', 'Controlador de Robot': 'Controlador de Robot',
  'Accesorio de Robot': 'Accesorio de Robot',
}

export function getEtiquetaSubcategoria(key: string): string {
  return SUBCATEGORIA_ETIQUETAS[key] || key
}

export const FULL_CATEGORY_INFO: Record<string, CategoryMeta> = {
  "AUTOMATIZACION": { label: 'Automatización', icon: '⚙️', desc: 'Contactores, relés térmicos, interruptores horarios y control modular para automatización industrial.', tip: 'Verifica la intensidad de empleo (A) y la tensión de la bobina del contactor.' },
  "AUTOMATIZACION DE EDIFICIOS": { label: 'Automatización de edificios', icon: '🏘️', desc: 'Domótica, sistemas KNX, videoporteros y mecanismos de control inteligente.', tip: 'Asegura la compatibilidad entre dispositivos y el protocolo de control (cableado o inalámbrico).' },
  "CABLES": { label: 'Cables', icon: '🧶', desc: 'Cables de baja, media y alta tensión, mangueras y conductores especiales.', tip: 'Selecciona según la sección (mm²), el número de conductores y el aislamiento (PVC, Libre de Halógenos, etc.).' },
  "PROTECCIONES Y CUADROS": { label: 'Protecciones y Cuadros', icon: '⚡', desc: 'Aparamenta modular, envolventes, cuadros eléctricos y sistemas de gestión de cableado.', tip: 'Verifica la intensidad nominal (A), el poder de corte (kA) y el número de polos necesario.' },
  "FOTOVOLTAICA": { label: 'Fotovoltaica', icon: '☀️', desc: 'Paneles solares, inversores, reguladores de carga, cajas combinadoras y protecciones para instalaciones fotovoltaicas.', tip: 'Dimensiona el campo fotovoltaico según la potencia del inversor y verifica las protecciones en CC (sobretensión, seccionadores).' },
  "ILUMINACION": { label: 'Iluminación', icon: '💡', desc: 'Luminarias LED para interior, exterior, industrial, decorativa y alumbrado de emergencia.', tip: 'Calcula el nivel de iluminación requerido (lux) y elige la temperatura de color adecuada (K).' },
  "INSTALACION": { label: 'Instalación', icon: '📏', desc: 'Canalizaciones, bandejas portacables, minicanales y sistemas de instalación.', tip: 'Elige el tipo de canal según el número y sección de los conductores.' },
  "VEHICULOS_ELECTRICOS": { label: 'Vehículos eléctricos', icon: '🚗', desc: 'Puntos de recarga, protección para recarga y accesorios para movilidad eléctrica.', tip: 'Verifica la potencia de carga (kW), el tipo de conector (Tipo 2, CCS) y la protección diferencial tipo B o F.' },
  "CLIMATIZACION": { label: 'Climatización', icon: '🌡️', desc: 'Equipos de climatización, ventilación y aire acondicionado.', tip: 'Calcula la potencia frigorífica necesaria según la superficie y el aislamiento.' },
  "COMUNICACION": { label: 'Comunicación', icon: '📡', desc: 'Equipos de red, comunicaciones y sistemas de transmisión de datos.', tip: 'Verifica el tipo de cable (UTP, FTP) y la categoría (Cat5e, Cat6, etc.).' },
  "HERRAMIENTAS": { label: 'Herramientas', icon: '🔧', desc: 'Herramientas manuales, eléctricas y de medición para instalación.', tip: 'Elige la herramienta adecuada para cada tipo de trabajo y verifica su calibración.' },
  "PROTECCION": { label: 'Protección', icon: '🛡️', desc: 'Equipos de protección individual (EPIs) y seguridad eléctrica.', tip: 'Usa siempre el EPI adecuado para el trabajo y verifica su estado antes de usarlo.' },
  "FONTANERIA": { label: 'Fontanería', icon: '💧', desc: 'Equipos y materiales para instalaciones de fontanería y saneamiento.', tip: 'Selecciona los materiales según el tipo de fluido y la presión de trabajo.' },
  "ENERGIAS RENOVABLES": { label: 'Energías renovables', icon: '🌱', desc: 'Sistemas de energía renovable: solar, eólica y otras fuentes limpias.', tip: 'Estudia el recurso disponible (sol, viento) antes de dimensionar la instalación.' },
  "ROBOTICA": { label: 'Robótica', icon: '🤖', desc: 'Brazos robóticos industriales, controladores de robot y accesorios de automatización de gama alta.', tip: 'Selecciona el robot según la capacidad de carga (payload), el alcance máximo y el tipo de controlador.' },
}

export function getCategoriaMeta(familia: string): CategoryMeta {
  if (!familia) return { label: 'Sin categoría', icon: '📁', desc: '', tip: '' }
  if (FULL_CATEGORY_INFO[familia]) return FULL_CATEGORY_INFO[familia]

  const normalKey = familia.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').trim()
  for (const key of [normalKey, normalKey.replace(/\s+/g, '_'), normalKey.replace(/_/g, ' ')]) {
    if (FULL_CATEGORY_INFO[key]) return FULL_CATEGORY_INFO[key]
  }

  return { label: familia, icon: '📁', desc: '', tip: '' }
}

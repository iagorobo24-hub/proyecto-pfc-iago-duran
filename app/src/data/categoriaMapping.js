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

export function getSubfamiliasPorCategoria(familia, categoria, subfamilias) {
  return subfamilias.filter(sf => {
    const entry = SUBCATEGORIA_A_CATEGORIA[sf]
    return entry && entry.categoria === categoria
  })
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
}

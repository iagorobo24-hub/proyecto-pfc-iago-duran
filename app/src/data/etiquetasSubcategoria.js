export const SUBCATEGORIA_ETIQUETAS = {
  'Magnetotérmico modular': 'Magnetotérmico modular',
  'Magnetotérmico MCCB': 'Magnetotérmico MCCB',
  'Diferencial': 'Diferencial',
  'Sobretensión': 'Sobretensión',
  'Fusibles': 'Fusibles',
  'Seccionador': 'Seccionador',
  'Seccionador CC': 'Seccionador CC',
  'Interruptor CC': 'Interruptor CC',
  'Rearme': 'Rearme',
  'Control aislamiento': 'Control aislamiento',
  'Central reporte': 'Central reporte',
  'Pilotaje': 'Pilotaje',
  'Medida': 'Medida',
  'Distribución': 'Distribución',
  'Cajas distribución': 'Cajas distribución',
  'Cajas conexión': 'Cajas conexión',
  'Conmutación': 'Conmutación',
  'Tomas corriente': 'Tomas corriente',
  'Fuentes alimentación': 'Fuentes alimentación',
  'Señalización': 'Señalización',
  'Contactor': 'Contactor',
  'Relés y control': 'Relés y control',
  'Pulsadores': 'Pulsadores',
}

export function getEtiquetaSubcategoria(key) {
  return SUBCATEGORIA_ETIQUETAS[key] || key
}

export default SUBCATEGORIA_ETIQUETAS

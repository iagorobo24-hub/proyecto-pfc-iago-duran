export const SUBCATEGORIA_ETIQUETAS = {
  /* DP */
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
  'Relés y seguridad': 'Relés y seguridad',
  'Bornas y terminales': 'Bornas y terminales',
  'Arrancadores suaves': 'Arrancadores suaves',
  'Contactor Industrial': 'Contactor Industrial',
  'Interruptor Motor': 'Interruptor Motor',
  'Relé Térmico': 'Relé Térmico',
  'Arrancador Suave': 'Arrancador Suave',
  'Sistema de Control': 'Sistema de Control',
  'Actuador de Válvula': 'Actuador de Válvula',
  /* Iluminación */
  'Luminarias emergencia': 'Luminarias de emergencia',
  'Linternas': 'Linternas',
  'Baterías': 'Baterías',
  /* Instalación */
  'Bornieras': 'Bornieras',
  'Canales': 'Canales de instalación',
  'Mini canal': 'Mini canal',
  'Bandejas portacables': 'Bandejas portacables',
  'Canalizaciones': 'Canalizaciones',
  /* Vehículos eléctricos */
  'Puntos de recarga': 'Puntos de recarga',
  'Protección recarga': 'Protección para recarga',
  /* Domótica */
  'Dispositivos KNX': 'Dispositivos KNX',
  'Actuadores HVAC': 'Actuadores HVAC',
  'Hogar conectado': 'Hogar conectado',
  'Seguridad': 'Seguridad',
  'Telemando': 'Telemando',
  /* Automatización */
  'Módulos E/S': 'Módulos E/S',
  'Módulos comunicación': 'Módulos de comunicación',
}

export function getEtiquetaSubcategoria(key) {
  return SUBCATEGORIA_ETIQUETAS[key] || key
}

export default SUBCATEGORIA_ETIQUETAS

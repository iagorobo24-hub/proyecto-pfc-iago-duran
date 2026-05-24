/**
 * NORMALIZAR TAXONOMÍA LEGRAND
 *
 * Corrige subfamilia, tipo, Gama y Subgama de todos los productos Legrand.
 * También reasigna familia cuando un producto está mal categorizado.
 *
 * Uso: node scripts/normalize-legrand.mjs
 *      node scripts/normalize-legrand.mjs --dry-run
 *      node scripts/normalize-legrand.mjs --dry-run --family=ILUMINACION
 */

const SONEX_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co'
const SONEX_KEY = process.env.SONEX_SUPABASE_KEY || ''

const HEADERS = {
  'apikey': SONEX_KEY,
  'Authorization': `Bearer ${SONEX_KEY}`,
  'Content-Type': 'application/json',
}

const DRY_RUN = process.argv.includes('--dry-run')
const FILTER_FAMILY = process.argv.find(a => a.startsWith('--family='))
const TARGET_FAMILY = FILTER_FAMILY ? FILTER_FAMILY.split('=')[1] : null

async function fetchAPI(path, options = {}) {
  const url = `${SONEX_URL}/rest/v1/${path}`
  const res = await fetch(url, { ...options, headers: { ...HEADERS, ...options.headers } })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase API error ${res.status}: ${err}`)
  }
  const ct = res.headers.get('content-type')
  if (ct && ct.includes('application/json')) return res.json()
  return null
}

// ─── REGLAS POR PATRÓN DE REFERENCIA ─────────────────────────
// Tienen prioridad máxima. Match por ref_fabricante exacto o prefijo.

const REF_RULES = [
  // --- KNX / Automatización (deben ir a AUTOMATIZACION DE EDIFICIOS) ---
  { pattern: /^00265[4-8]/,  familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Actuador KNX',         tipo: 'CARRIL DIN',    Gama: 'KNX' },
  { pattern: /^00266[5-8]/,  familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Pasarela KNX',         tipo: 'CARRIL DIN',    Gama: 'KNX DALI' },
  { pattern: /^040149/,       familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Compensador',          tipo: 'CARRIL DIN',    Gama: 'Hogar Conectado' },
  { pattern: /^048910/,       familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Actuador HVAC',        tipo: 'CARRIL DIN',    Gama: 'Smather Netatmo' },
  { pattern: /^064840/,       familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Base Conectada',       tipo: 'EMPOTRAR',      Gama: 'Hogar Conectado' },
  { pattern: /^003900/,       familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Telemando',            tipo: 'CARRIL DIN',    Gama: 'Telemando' },
  { pattern: /^060948/,       familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Pulsador Telemando',   tipo: 'CARRIL DIN',    Gama: 'Telemando' },
  { pattern: /^038050/,       familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Interruptor Rotulo',   tipo: 'CARRIL DIN',    Gama: 'Seguridad Rotulos' },

  // --- Osmoz (pulsadores y bloques de mando) ---
  { pattern: /^0229/,         subfamilia: 'Bloque Mando Osmoz',       tipo: 'CARRIL DIN',    Gama: 'Osmoz' },
  { pattern: /^0237/,         subfamilia: 'Pulsador Osmoz',           tipo: 'CARRIL DIN',    Gama: 'Osmoz' },

  // --- Nedbox (cajas modulares empotrar) ---
  { pattern: /^00151[1-4]/,   subfamilia: 'Caja Distribucion',        tipo: 'ENVOLVENTE',    Gama: 'Nedbox' },
  { pattern: /^00152[1-4]/,   subfamilia: 'Caja Distribucion',        tipo: 'ENVOLVENTE',    Gama: 'Nedbox' },
  { pattern: /^00153[1-4]/,   subfamilia: 'Caja Distribucion',        tipo: 'ENVOLVENTE',    Gama: 'Nedbox' },
  { pattern: /^001490/,       subfamilia: 'Accesorio',                tipo: 'ENVOLVENTE',    Gama: 'Nedbox' },
  { pattern: /^001491/,       subfamilia: 'Accesorio',                tipo: 'ENVOLVENTE',    Gama: 'Nedbox' },

  // --- Cubrebornas ---
  { pattern: /^00130[1-6]/,   subfamilia: 'Accesorio',                tipo: 'CARRIL DIN',    Gama: 'Cubrebornas' },
  { pattern: /^00135[6-8]/,   subfamilia: 'Accesorio',                tipo: 'CARRIL DIN',    Gama: 'Cubrebornas' },
  { pattern: /^00169[01]/,    subfamilia: 'Accesorio',                tipo: 'CARRIL DIN',    Gama: 'Proteccion Bornas' },

  // --- Obturadores ---
  { pattern: /^00166[0-5]/,   subfamilia: 'Accesorio',                tipo: 'CARRIL DIN',    Gama: 'Obturador' },

  // --- Practibox ---
  { pattern: /^13410[02]/,    subfamilia: 'Accesorio',                tipo: 'ENVOLVENTE',    Gama: 'Practibox Accesorio' },
  { pattern: /^1340/,         subfamilia: 'Caja Distribucion',        tipo: 'ENVOLVENTE',    Gama: 'Practibox' },
  { pattern: /^1341[2-8]/,    subfamilia: 'Caja Distribucion',        tipo: 'ENVOLVENTE',    Gama: 'Practibox' },
  { pattern: /^1350/,         subfamilia: 'Caja Distribucion',        tipo: 'ENVOLVENTE',    Gama: 'Practibox' },
  { pattern: /^1351/,         subfamilia: 'Caja Distribucion',        tipo: 'ENVOLVENTE',    Gama: 'Practibox' },
  { pattern: /^1348(06|07)/,  subfamilia: 'Accesorio',                tipo: 'CARRIL DIN',    Gama: 'Borna Tierra' },

  // --- Plexo³ (cajas de conexión) ---
  { pattern: /^00191[7-9]/,   subfamilia: 'Caja Conexion',            tipo: 'ENVOLVENTE',    Gama: 'Plexo³' },
]

// ─── REGLAS POR GAMA (para grupos que ya tienen buena Gama asignada) ───

const GAMA_RULES = [
  // --- DISTRIBUCION DE POTENCIA ---

  // DPX³ Caja Moldeada 250
  { gama: 'Interruptores de caja moldeada DPX³',              subfamilia: 'Interruptor Caja Moldeada', tipo: 'CAJA MOLDEADA', Gama: 'DPX³ 250' },
  // DPX³ 250 HP
  { gama: 'Interruptores de caja moldeada DPX³ HP (alta potencia)', subfamilia: 'Interruptor Caja Moldeada', tipo: 'CAJA MOLDEADA', Gama: 'DPX³ 250 HP' },
  // DPX³ accesorios (bloques diferenciales, contactos de señalización)
  { gama: 'Interruptores de caja moldeada DPX³ (todos)',      subfamilia: 'Accesorio',                tipo: 'CAJA MOLDEADA', Gama: 'DPX³ Accesorio' },

  // Vistop seccionadores
  { gama: 'Interruptores seccionadores',                      subfamilia: 'Interruptor Seccionador',  tipo: 'CARRIL DIN',    Gama: 'Vistop' },

  // Limitadores de sobretensión
  { gama: 'Limitadores de sobretensión',                      subfamilia: 'Proteccion Sobretension',   tipo: 'CARRIL DIN',    Gama: 'Limitador Sobretension' },

  // Cortacircuitos fusibles (Guardamotores, contactores y fusibles)
  { gama: 'Guardamotores, contactores y fusibles',            subfamilia: 'Cortacircuito Fusible',     tipo: 'CARRIL DIN',    Gama: 'Cortacircuito Seccionable' },

  // --- INSTALACION / CANALIZACION ---

  { gama: 'Bandeja portacables',                              subfamilia: 'Bandeja Portacables',       tipo: 'BANDEJAS',      Gama: 'Omega' },
  { gama: 'Canales de instalación',                           subfamilia: 'Canal Instalacion',         tipo: 'CANALES',       Gama: 'DLP Monobloc' },
  { gama: 'Minicanales y microcanales',                       subfamilia: 'Minicanal',                 tipo: 'MINICANALES',   Gama: 'DLPlus' },
  { gama: 'Canalización eléctrica prefabricada',              subfamilia: 'Canalizacion',              tipo: 'CANALIZACION',  Gama: 'LBplus' },
  { gama: 'Canales para cuadros',                             subfamilia: 'Canal Cuadros',             tipo: 'CANALES',       Gama: 'Lina 25' },

  // --- ILUMINACION ---

  { gama: 'Alumbrado de emergencia',                          subfamilia: 'Luminaria Emergencia',      tipo: 'EMERGENCIA',    Gama: 'C3LED' },
  { gama: 'Luminarias de emergencia LED de interior',         subfamilia: 'Luminaria Emergencia',      tipo: 'EMERGENCIA',    Gama: 'C3LED' },
  { gama: 'Luminarias de emergencia LED estancas',            subfamilia: 'Luminaria Emergencia',      tipo: 'EMERGENCIA',    Gama: 'B65LED' },

  // --- FOTOVOLTAICA ---

  { gama: 'Instalaciones fotovoltaicas',                      subfamilia: 'Caja Combinadora',          tipo: 'FOTOVOLTAICA',  Gama: 'Plexo³ PV' },

  // --- VEHICULOS ELECTRICOS ---

  { gama: 'Soluciones para recarga de vehículos eléctricos',  subfamilia: 'Punto Recarga',             tipo: 'RECARGA',       Gama: 'Green\'up' },

  // --- HOGAR CONECTADO (debe ir a AUTOMATIZACION DE EDIFICIOS) ---

  { gama: 'Hogar conectado',                                  familia: 'AUTOMATIZACION DE EDIFICIOS',  subfamilia: 'Dispositivo Smart', tipo: 'EMPOTRAR', Gama: 'Hogar Conectado' },

  // --- KNX / TERCIARIO (debe ir a AUTOMATIZACION DE EDIFICIOS) ---

  { gama: 'Mosaic y Sistemas terciarios',                     familia: 'AUTOMATIZACION DE EDIFICIOS',  subfamilia: 'Controlador KNX', tipo: 'CARRIL DIN', Gama: 'KNX' },

  // --- AUTOMATIZACION ---

  { gama: 'Auxiliares de mando y señalización',               subfamilia: 'Bloque Mando',              tipo: 'CARRIL DIN',    Gama: 'Osmoz' },
  { gama: 'Auxiliares de mando y programación',               subfamilia: 'Elemento de Control',       tipo: 'CARRIL DIN',    Gama: 'Control Modular' },
]

// ─── REGLAS POR NOMBRE (keywords en name) ─────────────────────

const NAME_RULES = [
  // Timbre / Zumbador
  { keyword: 'Timbre modular',            subfamilia: 'Timbre',                    tipo: 'CARRIL DIN',    Gama: 'Señalizacion Acustica' },
  { keyword: 'Zumbador modular',          subfamilia: 'Zumbador',                  tipo: 'CARRIL DIN',    Gama: 'Señalizacion Acustica' },

  // Relés temporizados
  { keyword: 'Relé temporizado',          subfamilia: 'Elemento de Control',       tipo: 'CARRIL DIN',    Gama: 'Temporizador' },
  { keyword: 'Temporizador',              subfamilia: 'Elemento de Control',       tipo: 'CARRIL DIN',    Gama: 'Temporizador' },

  // Minutería
  { keyword: 'Minutería',                 subfamilia: 'Elemento de Control',       tipo: 'CARRIL DIN',    Gama: 'Minuteria' },
  { keyword: 'Minuteria',                 subfamilia: 'Elemento de Control',       tipo: 'CARRIL DIN',    Gama: 'Minuteria' },

  // Interruptor horario / programable
  { keyword: 'Interruptor horario programable', subfamilia: 'Elemento de Control', tipo: 'CARRIL DIN',    Gama: 'Interruptor Horario' },
  { keyword: 'Interruptor horario digital',     subfamilia: 'Elemento de Control', tipo: 'CARRIL DIN',    Gama: 'Interruptor Horario' },
  { keyword: 'Interruptor horario para',        subfamilia: 'Elemento de Control', tipo: 'CARRIL DIN',    Gama: 'Interruptor Horario' },

  // Crepuscular
  { keyword: 'Interruptor crepuscular',   subfamilia: 'Elemento de Control',       tipo: 'CARRIL DIN',    Gama: 'Crepuscular' },

  // Fuente de alimentación
  { keyword: 'Fuente de alimentación',     subfamilia: 'Fuente Alimentacion',      tipo: 'CARRIL DIN',    Gama: 'Fuente Conmutada' },

  // Controlador de aislamiento
  { keyword: 'Controlador permanente de aislamiento', subfamilia: 'Control Aislamiento', tipo: 'CARRIL DIN', Gama: 'Control Aislamiento' },
  { keyword: 'Central reporte de estado',  subfamilia: 'Central Reporte',          tipo: 'CARRIL DIN',    Gama: 'Control Aislamiento' },

  // Conmutadores
  { keyword: 'Conmutador de',             subfamilia: 'Conmutador',                tipo: 'CARRIL DIN',    Gama: 'Conmutador' },
  { keyword: 'Conmutador ',               subfamilia: 'Conmutador',                tipo: 'CARRIL DIN',    Gama: 'Conmutador' },

  // Diferenciales TX³
  { keyword: 'Diferencial TX³',           subfamilia: 'Interruptor Diferencial',   tipo: 'CARRIL DIN',    Gama: 'TX³ Diferencial' },
  { keyword: 'Diferencial RX³',           subfamilia: 'Interruptor Diferencial',   tipo: 'CARRIL DIN',    Gama: 'RX³ Diferencial' },

  // Magnetotérmicos TX³
  { keyword: 'Magnetotérmico TX³',        subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN',   Gama: 'TX³ Magnetotermico' },

  // Magnetotérmicos RX³
  { keyword: 'Magnetotérmico RX³',        subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN',   Gama: 'RX³ Magnetotermico' },

  // Interruptor automático Mosaic
  { keyword: 'Interruptor automático magnetotérmico Mosaic', subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN', Gama: 'Mosaic' },
  { keyword: 'Interruptor automático diferencial Mosaic',    subfamilia: 'Interruptor Diferencial',    tipo: 'CARRIL DIN', Gama: 'Mosaic' },

  // Soporte/adaptador para Mosaic
  { keyword: 'Soporte para mecanismos Mosaic', subfamilia: 'Accesorio', tipo: 'CARRIL DIN', Gama: 'Mosaic' },
  { keyword: 'Adaptador para pulsatería',     subfamilia: 'Accesorio', tipo: 'CARRIL DIN', Gama: 'Mosaic' },
  { keyword: 'Adaptador para equipamientos',  subfamilia: 'Accesorio', tipo: 'CARRIL DIN', Gama: 'Mosaic' },

  // Tomas de corriente industriales
  { keyword: 'Toma de corriente',         subfamilia: 'Toma Corriente Industrial', tipo: 'SUPERFICIE',    Gama: 'Toma Industrial' },

  // Indicador fusión / empuñadura / contacto auxiliar para cortacircuito
  { keyword: 'Indicador de fusión',       subfamilia: 'Accesorio',                tipo: 'CARRIL DIN',    Gama: 'Cortacircuito Accesorio' },
  { keyword: 'Empuñadura',                subfamilia: 'Accesorio',                tipo: 'CARRIL DIN',    Gama: 'Cortacircuito Accesorio' },
  { keyword: 'Contacto auxiliar',         subfamilia: 'Accesorio',                tipo: 'CARRIL DIN',    Gama: 'Cortacircuito Accesorio' },

  // Cortacircuitos
  { keyword: 'Cortacircuito seccionable', subfamilia: 'Cortacircuito Fusible',     tipo: 'CARRIL DIN',    Gama: 'Cortacircuito Seccionable' },

  // --- FOTOVOLTAICA ---
  { keyword: 'Descargador de sobretensiones fotovoltaica', subfamilia: 'Proteccion Sobretension', tipo: 'CARRIL DIN', Gama: 'Descargador PV' },
  { keyword: 'Cartucho extraíble',         subfamilia: 'Accesorio',                tipo: 'CARRIL DIN',    Gama: 'Descargador PV Accesorio' },
  { keyword: 'Caja Plexo³',               subfamilia: 'Caja Combinadora',          tipo: 'FOTOVOLTAICA',  Gama: 'Plexo³ PV' },
  { keyword: 'Interruptor seccionador de corriente continua', subfamilia: 'Seccionador CC', tipo: 'CARRIL DIN', Gama: 'Seccionador DC' },
  { keyword: 'Interruptor-seccionador modular con maneta',    subfamilia: 'Seccionador CC', tipo: 'CARRIL DIN', Gama: 'Seccionador DC' },
  { keyword: 'Interruptor seccionador rotativo modular corriente continua', subfamilia: 'Seccionador CC', tipo: 'CARRIL DIN', Gama: 'Seccionador DC' },
  { keyword: 'Interruptor-seccionador modular de corriente continua', subfamilia: 'Seccionador CC', tipo: 'CARRIL DIN', Gama: 'Seccionador DC' },
  { keyword: 'Interruptor automático modular de corriente continua', subfamilia: 'Interruptor CC', tipo: 'CARRIL DIN', Gama: 'DX³ 800V=' },

  // --- VEHICULOS ELECTRICOS ---
  { keyword: "Green'up One",              subfamilia: 'Punto Recarga',             tipo: 'RECARGA',       Gama: "Green'up One" },
  { keyword: "Green'Up Home",             subfamilia: 'Punto Recarga',             tipo: 'RECARGA',       Gama: "Green'up Home" },
  { keyword: "Green'up Premium",          subfamilia: 'Punto Recarga',             tipo: 'RECARGA',       Gama: "Green'up Premium" },
  { keyword: 'Poste metálico',            subfamilia: 'Accesorio',                tipo: 'RECARGA',       Gama: "Green'up Accesorio" },
  { keyword: 'Pie de fijación',           subfamilia: 'Accesorio',                tipo: 'RECARGA',       Gama: "Green'up Accesorio" },
  { keyword: 'Toma de carga',             subfamilia: 'Punto Recarga',             tipo: 'RECARGA',       Gama: "Green'up One" },
  { keyword: 'Toma de recarga para vehículo eléctrico', subfamilia: 'Punto Recarga', tipo: 'RECARGA',    Gama: "Green'up Home" },

  // --- KNX específicos (no capturados por Gama) ---
  { keyword: 'Controlador KNX multiaplicaciones',             familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Controlador KNX',    tipo: 'CARRIL DIN', Gama: 'KNX' },
  { keyword: 'Controlador KNX ON/OFF',                        familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Controlador KNX',    tipo: 'CARRIL DIN', Gama: 'KNX' },
  { keyword: 'Sistema KNX',                                   familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Interface KNX',      tipo: 'CARRIL DIN', Gama: 'KNX' },
  { keyword: 'Interfaz KNX',                                  familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Interface KNX',      tipo: 'CARRIL DIN', Gama: 'KNX' },
  { keyword: 'Pasarela KNX DALI DIN 64',                      familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Pasarela KNX',       tipo: 'CARRIL DIN', Gama: 'KNX DALI' },
  { keyword: 'CONTROLADOR HVAC KNX',                          familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Actuador HVAC KNX',  tipo: 'CARRIL DIN', Gama: 'KNX HVAC' },
  { keyword: 'Acoplador de línea KNX',                        familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Acoplador KNX',      tipo: 'CARRIL DIN', Gama: 'KNX' },
  { keyword: 'Router IP KNX',                                 familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Router KNX',         tipo: 'CARRIL DIN', Gama: 'KNX' },
  { keyword: 'Room Controller KNX',                           familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Controlador KNX',    tipo: 'CARRIL DIN', Gama: 'KNX' },
  { keyword: 'Green-I',                                       familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Sensor KNX',         tipo: 'EMPOTRAR',   Gama: 'Green-I' },

  // --- Hogar Conectado específicos ---
  { keyword: 'Salida de cables conectada',                    familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Base Conectada',      tipo: 'EMPOTRAR',   Gama: 'Hogar Conectado' },
  { keyword: 'Adhesivos para comandos inalámbricos',          familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Accesorio Smart',     tipo: 'EMPOTRAR',   Gama: 'Hogar Conectado' },
  { keyword: 'Detector de movimiento inalámbrico',            familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Detector Movimiento', tipo: 'SUPERFICIE', Gama: 'Hogar Conectado' },
  { keyword: 'Micromódulo de iluminación conectado',          familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Micromodulo Smart',   tipo: 'CARRIL DIN', Gama: 'Hogar Conectado' },
  { keyword: 'Micromódulo conectado de iluminación',          familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Micromodulo Smart',   tipo: 'CARRIL DIN', Gama: 'Hogar Conectado' },
  { keyword: 'Micromódulo conectado para puertas',            familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Micromodulo Smart',   tipo: 'CARRIL DIN', Gama: 'Hogar Conectado' },
  { keyword: 'Micromódulo de persianas conectado',            familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Micromodulo Smart',   tipo: 'CARRIL DIN', Gama: 'Hogar Conectado' },
  { keyword: 'Comando de iluminación auxiliar inalámbrico',   familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Mando Smart',         tipo: 'SUPERFICIE', Gama: 'Hogar Conectado' },
  { keyword: 'Mando a distancia de bolsillo',                 familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Mando Smart',         tipo: 'SUPERFICIE', Gama: 'Hogar Conectado' },
  { keyword: 'Comando doble de iluminación inalámbrico',      familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Mando Smart',         tipo: 'SUPERFICIE', Gama: 'Hogar Conectado' },
  { keyword: 'Comando para persiana inalámbrico',             familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Mando Smart',         tipo: 'SUPERFICIE', Gama: 'Hogar Conectado' },
  { keyword: 'Comando de iluminación inalámbrico',            familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Mando Smart',         tipo: 'SUPERFICIE', Gama: 'Hogar Conectado' },
  { keyword: 'Comando de iluminación con opción de regulación', familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Mando Smart',       tipo: 'SUPERFICIE', Gama: 'Hogar Conectado' },
  { keyword: 'Base de corriente conectada Plexo',             familia: 'AUTOMATIZACION DE EDIFICIOS', subfamilia: 'Base Conectada',      tipo: 'SUPERFICIE', Gama: 'Hogar Conectado' },

  // --- ILUMINACION (específicos) ---
  { keyword: 'Luminaria de emergencia C3LED ESTANDAR',  subfamilia: 'Luminaria Emergencia', tipo: 'EMERGENCIA', Gama: 'C3LED Estandar' },
  { keyword: 'Luminaria de emergencia C3LEDA UTOTEST',  subfamilia: 'Luminaria Emergencia', tipo: 'EMERGENCIA', Gama: 'C3LED Autotest' },
  { keyword: 'Luminaria de emergencia G5LED',           subfamilia: 'Luminaria Emergencia', tipo: 'EMERGENCIA', Gama: 'G5LED' },
  { keyword: 'Luminaria de emergencia B65LED',          subfamilia: 'Luminaria Emergencia', tipo: 'EMERGENCIA', Gama: 'B65LED' },
  { keyword: 'Luminaria de emergencia NT65',            subfamilia: 'Luminaria Emergencia', tipo: 'EMERGENCIA', Gama: 'NT65 Estanca' },
  { keyword: 'Luminaria de emergencia NFL65',           subfamilia: 'Luminaria Emergencia', tipo: 'EMERGENCIA', Gama: 'NFL65 Estanca' },
  { keyword: 'Luminaria de emergencia INOXLED',         subfamilia: 'Luminaria Emergencia', tipo: 'EMERGENCIA', Gama: 'INOXLED' },
  { keyword: 'Luminaria de emergenciaA TEXLED',         subfamilia: 'Luminaria Emergencia', tipo: 'EMERGENCIA', Gama: 'TEXLED' },
  { keyword: 'Linterna recargable',                     subfamilia: 'Linterna',              tipo: 'EMERGENCIA', Gama: 'Linterna' },
  { keyword: 'Difusor prismático',                      subfamilia: 'Accesorio',              tipo: 'EMERGENCIA', Gama: 'C3LED Accesorio' },
  { keyword: 'Caja de empotrar C3',                     subfamilia: 'Accesorio',              tipo: 'EMERGENCIA', Gama: 'C3LED Accesorio' },
  { keyword: 'Conjunto banderola',                      subfamilia: 'Accesorio',              tipo: 'EMERGENCIA', Gama: 'C3LED Accesorio' },
  { keyword: 'Conjunto suspensión',                     subfamilia: 'Accesorio',              tipo: 'EMERGENCIA', Gama: 'C3LED Accesorio' },
  { keyword: 'Caja de empotrar URA21',                  subfamilia: 'Accesorio',              tipo: 'EMERGENCIA', Gama: 'URA21 Accesorio' },
  { keyword: 'Batería de repuesto',                     subfamilia: 'Bateria',                tipo: 'EMERGENCIA', Gama: 'Bateria Repuesto' },
  { keyword: 'Batería Ni-Mh',                           subfamilia: 'Bateria',                tipo: 'EMERGENCIA', Gama: 'Bateria Repuesto' },
  { keyword: 'Batería 2x3',                             subfamilia: 'Bateria',                tipo: 'EMERGENCIA', Gama: 'Bateria Repuesto' },
  { keyword: 'Etiqueta de señalización',                subfamilia: 'Accesorio',              tipo: 'EMERGENCIA', Gama: 'Señalizacion' },
]

// ─── FUNCIÓN PARA EXTRAER SUBGAMA DEL NOMBRE ────────────────

function extractSubgama(name, currentGama) {
  if (!name) return ''

  // Para bandejas: extraer dimensiones (ej: "75x50")
  const dimMatch = name.match(/(\d+x\d+)/)
  if (dimMatch && currentGama === 'Bandeja portacables') {
    const dim = dimMatch[1]
    const tipo = name.includes('Lisa') ? 'Lisa' : name.includes('Perforada') ? 'Perforada' : ''
    return tipo ? `${dim} ${tipo}` : dim
  }

  // Para canales: extraer dimensiones
  if (dimMatch && name.includes('DLP')) {
    return dimMatch[1]
  }

  // Para minicanales: extraer dimensiones
  if (dimMatch && name.includes('DLPlus')) {
    return dimMatch[1]
  }

  // Para Lina 25: extraer dimensiones
  if (dimMatch && name.includes('Lina')) {
    return dimMatch[1]
  }

  // Para luminarias de emergencia: extraer lúmenes
  const lumenMatch = name.match(/(\d+)\s*lúmenes?/i)
  if (lumenMatch) {
    const lum = lumenMatch[1]
    const horas = name.match(/(\d+)h/)
    return horas ? `${lum}lm ${horas[1]}h` : `${lum}lm`
  }

  // Para baterías: extraer voltaje y capacidad
  const battMatch = name.match(/([\d,]+V\s*[\d,]+Ah)/i)
  if (battMatch) return battMatch[1]

  // Para magnetotérmicos / diferenciales: extraer amperaje + curva
  const ampMatch = name.match(/(\d+)A/)
  const curva = name.match(/curva\s*([A-Z])/i)
  const polos = name.match(/(\d+)P/)
  const gamaLC = (currentGama || '').toLowerCase()
  if (ampMatch && (gamaLC.includes('magnetotermico') || gamaLC.includes('diferencial'))) {
    let sg = `${ampMatch[1]}A`
    if (curva) sg += ` curva ${curva[1].toUpperCase()}`
    if (polos) sg = `${polos[1]}P ${sg}`
    return sg
  }

  // Para interruptores horarios: tipo (digital/analógico)
  if (name.includes('digital')) return 'Digital'
  if (name.includes('analógico') || name.includes('Analogico')) return 'Analogico'

  // Para fuentes de alimentación: voltaje y corriente
  const psMatch = name.match(/salida\s*(\d+V\w*)\s*[–-]\s*([\d,]+A)/i)
  if (psMatch) return `${psMatch[1]} ${psMatch[2]}`
  const psSimple = name.match(/(\d+Vcc)\s*[–-]\s*([\d,]+A)/i)
  if (psSimple) return `${psSimple[1]} ${psSimple[2]}`

  // Para puntos de recarga: potencia
  const kwMatch = name.match(/([\d,]+kW)/i)
  if (kwMatch && name.includes('Green')) {
    const modo = name.match(/Modo\s*(\d)/i)
    return modo ? `${kwMatch[1]} Modo ${modo[1]}` : kwMatch[1]
  }

  // Para seccionadores CC: voltaje y corriente
  const dcMatch = name.match(/(\d+V[=≈]?)\s*[–-]\s*(\d+)A/)
  if (dcMatch) return `${dcMatch[1]} ${dcMatch[2]}A`

  // Para DPX³ / caja moldeada: amperaje
  if (currentGama?.includes('DPX³') || name.includes('DPX³')) {
    const a = name.match(/(\d+)A/)
    const p = name.match(/(\d+)P/)
    if (a) return p ? `${p[1]}P ${a[1]}A` : `${a[1]}A`
  }

  // Para Vistop seccionadores: amperaje
  if (name.includes('Vistop')) {
    const a = name.match(/(\d+)A/)
    if (a) return `${a[1]}A`
  }

  // Para tomas de corriente: amperaje y polos
  if (name.includes('Toma de corriente') || name.includes('Toma corriente')) {
    const a = name.match(/(\d+)\s*A/)
    const p = name.match(/(\d+)P\+N\+T/)
    if (p) return `${a ? a[1] : ''} ${p[1]}P+N+T`.trim()
    const p2 = name.match(/(\d+)P\+T/)
    if (a && p2) return `${a[1]}A ${p2[1]}P+T`
    if (a) return `${a[1]}A`
  }

  // Para cortacircuitos: tipo de cartucho
  if (name.includes('Cortacircuito') || name.includes('cortacircuito')) {
    const cartucho = name.match(/cartucho.*?(\d+x\d+)/i)
    const polos = name.match(/(\d+)P/)
    if (cartucho && polos) return `${polos[1]}P ${cartucho[1]}`
    if (cartucho) return cartucho[1]
  }

  // Para Nedbox: filas
  const filas = name.match(/(\d+)\s*fila/)
  if (filas && name.includes('Nedbox')) {
    const mods = name.match(/(\d+\+?\d*)\s*módulos?/)
    return mods ? `${filas[1]} filas ${mods[1]} mod` : `${filas[1]} filas`
  }

  // Para cubrebornas: módulos
  const mods = name.match(/(\d+)\s*módulos?/)
  if (mods && name.includes('cubrebornas')) {
    return `${mods[1]} mod`
  }

  // Para obturadores: módulos
  if (mods && name.includes('Obturador')) {
    return `${mods[1]} mod`
  }

  return ''
}

// ─── FUNCIÓN PRINCIPAL ──────────────────────────────────────

async function main() {
  console.log('📦 Cargando productos Legrand...')

  const allProducts = []
  for (let offset = 0; ; offset += 1000) {
    const select = 'id,ref_fabricante,name,familia,subfamilia,tipo,Gama,Subgama'
    const filter = TARGET_FAMILY
      ? `marca=eq.Legrand&familia=eq.${encodeURIComponent(TARGET_FAMILY)}`
      : 'marca=eq.Legrand'
    const data = await fetchAPI(`products?select=${select}&${filter}&limit=1000&offset=${offset}`)
    allProducts.push(...data)
    if (!data || data.length < 1000) break
  }

  console.log(`📋 ${allProducts.length} productos cargados${TARGET_FAMILY ? ` (familia=${TARGET_FAMILY})` : ''}\n`)

  let changes = []
  let unchanged = 0
  let noRule = 0

  for (const p of allProducts) {
    let rule = null
    const name = (p.name || '').trim()

    // 1. Intentar regla por patrón de referencia (más específica)
    for (const rr of REF_RULES) {
      if (rr.pattern.test(p.ref_fabricante || '')) {
        rule = { ...rr }
        // Si la regla no especifica familia, mantener la actual
        if (!rule.familia) rule.familia = p.familia
        break
      }
    }

    // 2. Si no hay regla de ref, intentar por keyword en nombre
    if (!rule) {
      for (const nr of NAME_RULES) {
        if (name.includes(nr.keyword)) {
          rule = { ...nr }
          if (!rule.familia) rule.familia = p.familia
          break
        }
      }
    }

    // 3. Si no hay regla de keyword, intentar por Gama actual
    if (!rule && p.Gama) {
      for (const gr of GAMA_RULES) {
        if (gr.gama === p.Gama) {
          rule = { ...gr }
          if (!rule.familia) rule.familia = p.familia
          break
        }
      }
    }

    if (!rule) {
      noRule++
      if (noRule <= 10) {
        console.log(`⚠️  Sin regla: [${p.familia}] ${p.Gama} | ${p.ref_fabricante} | ${(p.name || '').slice(0, 60)}`)
      }
      continue
    }

    // Extraer Subgama
    const subgama = extractSubgama(name, p.Gama)

    // Verificar si realmente hay cambios
    const famChanged = rule.familia !== p.familia
    const subChanged = rule.subfamilia !== p.subfamilia
    const tipoChanged = rule.tipo !== p.tipo
    const gamaChanged = rule.Gama !== p.Gama
    const subgChanged = subgama !== (p.Subgama || '')

    if (!famChanged && !subChanged && !tipoChanged && !gamaChanged && !subgChanged) {
      unchanged++
      continue
    }

    changes.push({
      id: p.id,
      ref: p.ref_fabricante,
      antes: {
        familia: p.familia,
        subfamilia: p.subfamilia,
        tipo: p.tipo,
        Gama: p.Gama,
        Subgama: p.Subgama,
      },
      despues: {
        familia: rule.familia,
        subfamilia: rule.subfamilia,
        tipo: rule.tipo,
        Gama: rule.Gama,
        Subgama: subgama,
      },
    })
  }

  console.log(`\n✅ Sin cambios: ${unchanged}`)
  console.log(`🔄 Cambios: ${changes.length}`)
  if (noRule > 0) console.log(`⚠️  Sin regla: ${noRule} (mostrando primeras 10)`)

  if (changes.length === 0) {
    console.log('\n✨ Todo normalizado.')
    return
  }

  // Mostrar resumen por familia
  const byFamilia = {}
  changes.forEach(c => {
    const f = c.despues.familia
    if (!byFamilia[f]) byFamilia[f] = []
    byFamilia[f].push(c)
  })

  console.log('\n📊 RESUMEN DE CAMBIOS:')
  Object.entries(byFamilia).forEach(([fam, cs]) => {
    console.log(`\n  📁 ${fam} (${cs.length} cambios):`)
    const byGama = {}
    cs.forEach(c => {
      const key = `${c.despues.subfamilia}/${c.despues.tipo}/${c.despues.Gama}`
      if (!byGama[key]) byGama[key] = 0
      byGama[key]++
    })
    Object.entries(byGama).sort((a, b) => b[1] - a[1]).forEach(([key, cnt]) => {
      console.log(`    ${cnt.toString().padStart(3)}x  ${key}`)
    })
  })

  // Mostrar algunos ejemplos
  console.log('\n📝 EJEMPLOS:')
  const examples = changes.filter(c => c.antes.subfamilia !== c.despues.subfamilia || c.antes.tipo !== c.despues.tipo).slice(0, 15)
  examples.forEach(c => {
    const famStr = c.antes.familia !== c.despues.familia ? ` [${c.antes.familia}→${c.despues.familia}]` : ''
    console.log(`  ${(c.ref||'').padEnd(10)}  ${c.antes.subfamilia}/${c.antes.tipo} → ${c.despues.subfamilia}/${c.despues.tipo}${famStr}`)
    if (c.antes.Gama !== c.despues.Gama || c.antes.Subgama !== c.despues.Subgama) {
      console.log(`  ${''.padEnd(10)}  Gama: "${c.antes.Gama}" → "${c.despues.Gama}"`)
    }
    if (c.despues.Subgama) {
      console.log(`  ${''.padEnd(10)}  Subgama: "${c.despues.Subgama}"`)
    }
  })

  if (DRY_RUN) {
    console.log('\n🔷 DRY RUN — no se aplicaron cambios.')
    return
  }

  console.log('\n💾 Aplicando cambios...')
  let errors = 0
  for (const c of changes) {
    const body = JSON.stringify({
      familia: c.despues.familia,
      subfamilia: c.despues.subfamilia,
      tipo: c.despues.tipo,
      Gama: c.despues.Gama,
      Subgama: c.despues.Subgama,
    })
    const res = await fetch(`${SONEX_URL}/rest/v1/products?id=eq.${c.id}`, {
      method: 'PATCH',
      headers: { ...HEADERS, 'Prefer': 'return=minimal' },
      body,
    })
    if (res.status >= 400) {
      console.error(`❌ Error actualizando ${c.ref} (id=${c.id}): status ${res.status}`)
      errors++
    }
  }

  console.log(`\n✅ ${changes.length - errors} productos actualizados.`)
  if (errors > 0) console.log(`❌ ${errors} errores.`)
}

main().catch(console.error)

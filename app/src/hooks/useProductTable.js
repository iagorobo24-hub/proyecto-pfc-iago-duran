export const POLA_ORDER = ['1P', '1P+N', '2P', '3P', '3P+N', '4P']
export const CURVE_ORDER = ['B', 'C', 'D', 'K', 'MA', 'TMD', 'Z']
const AMP_STEPS = [0.5, 1, 1.6, 2, 2.5, 3, 4, 5, 6, 6.3, 8, 10, 12.5, 13, 15, 16, 20, 25, 30, 32, 40, 50, 63, 80, 100, 125, 150, 160, 200, 220, 250, 320, 400, 500, 570, 630, 800, 1000, 1250, 1600]

export function extractSubgama(name) {
  if (!name) return ''
  const m = name.match(/\b(C60[NHLS]|C60BPR|C60BP|C60SP|C60H-DC|C60L|C60H|C60N|N40N|N40VIGI|iC60|iC60N|iC60H|iC60L|iID|Vigi|NSX[^-]|NSX\d+|R9F|RX3|TX3|Resi9)\b/i)
  if (m) return m[1].replace(/\biC60\b/i, 'iC60').replace(/\bNSX/i, 'NSX')
  return ''
}

export function extractFramework(name) {
  if (!name) return ''
  const m = name.match(/\bNSX(\d{2,3})[A-Z]?\b/i)
  if (m) return m[1]
  return ''
}

export const FRAMEWORK_ORDER = ['15', '25', '40', '63', '80', '100', '125', '160', '200', '250', '320', '400', '500', '630']

const MAGNETOTERMICO_GAMAS = [
  'Acti 9 iC60',
  'C60 UL CSA IEC',
  'ComPacT NSX',
  'Resi9',
  'RX³ Magnetotermico',
  'TX³ Magnetotermico',
  'Mosaic',
]

const DIFERENCIAL_GAMAS = [
  'Interruptor diferencial Acti 9 iID',
  'iD',
  'Acti 9 Vigi para iC60',
  'RX³ Diferencial',
  'TX³ Diferencial',
  'Mosaic',
]

const SENSITIVITY_ORDER = [10, 30, 100, 300, 500, 1000]

export function supportsTableView(products) {
  if (!products || products.length === 0) return false

  const allMagnetotermico = products.every(
    p => (p.subfamilia || '').trim() === 'Interruptor Magnetotérmico'
  )
  const allDiferencial = products.every(
    p => (p.subfamilia || '').trim() === 'Interruptor Diferencial'
  )
  const allMCCB = products.every(
    p => (p.subfamilia || '').trim() === 'Interruptor Caja Moldeada'
  )

  if (!allMagnetotermico && !allDiferencial && !allMCCB) return false

  const gama = products[0]?.Gama || products[0]?.gama || ''

  if (allMagnetotermico) return MAGNETOTERMICO_GAMAS.includes(gama)
  if (allDiferencial) return DIFERENCIAL_GAMAS.includes(gama)
  if (allMCCB) return MAGNETOTERMICO_GAMAS.includes(gama)

  return false
}

export function extractSensitivity(name) {
  if (!name) return 0
  const m = name.match(/(\d+)\s*mA/)
  if (m) return parseInt(m[1], 10)
  return 0
}

export function extractPoles(name) {
  if (!name) return '?'
  const m = name.match(/(\d+)\s*P\s*\+\s*N/i)
  if (m) return m[1] + 'P+N'
  const m2 = name.match(/(\d+)P(?:\d+R)?\b/i)
  if (m2) return m2[1] + 'P'
  const m3 = name.match(/(\d+)\s*polo/i)
  if (m3) return m3[1] + 'P'
  const m4 = name.match(/(\d+)\s*polos/i)
  if (m4) return m4[1] + 'P'
  const m5 = name.match(/[–-](\d+)P\b/)
  if (m5) return m5[1] + 'P'
  return '?'
}

export function extractAmps(name) {
  if (!name) return 0
  const m = name.match(/([\d.]+)\s*A\b/)
  if (m) return parseFloat(m[1])
  const m2 = name.match(/\b([\d.]+)(?=\s*A)/)
  if (m2) return parseFloat(m2[1])
  const m3 = name.match(/([\d.]+)\s+kA/)
  if (m3) return 0
  return 0
}

export function extractCurve(name) {
  if (!name) return '?'
  const m = name.match(/curva\s+([A-Z]+)/i)
  if (m) return m[1].toUpperCase()
  const m2 = name.match(/\b([A-Z]+)\s+curva/i)
  if (m2) return m2[1].toUpperCase()
  const m3 = name.match(/\b([A-DKZMA]+)\s*Curve\b/i)
  if (m3) return m3[1].toUpperCase()
  const m4 = name.match(/\b([A-DKZMA])\s+(?:A\s*)?[\d.]+/)
  if (m4 && !m4[0].includes('AC') && !m4[0].includes('DC') && !m4[0].includes(' kA')) return m4[1]
  if (name.includes('TMD') || name.includes('Micrologic')) return 'TMD'
  if (name.startsWith('R9F')) return 'C'
  return '?'
}

export function ampToStandard(amp) {
  let closest = AMP_STEPS[0]
  for (const s of AMP_STEPS) {
    if (s >= amp) { closest = s; break }
    closest = s
  }
  if (Math.abs(amp - closest) / closest > 0.1) return amp
  return closest
}

export function extractTipoDiferencial(name) {
  if (!name) return ''
  const m = name.match(/\b(Tipo\s+)?(AC|Hpi|Si)\b/i)
  if (m) {
    const v = m[2].toUpperCase()
    if (v === 'Hpi') return 'Hpi'
    if (v === 'Si') return 'Si'
    return v
  }
  const m2 = name.match(/\b(Clase\s+)?([A-F])\b/)
  if (m2) {
    const v = m2[2].toUpperCase()
    if (['A', 'B', 'F'].includes(v)) return v
  }
  return ''
}

export function getFrameworksDisponibles(products) {
  const frameworks = new Set()
  for (const p of products) {
    const fw = extractFramework(p.name)
    if (fw && FRAMEWORK_ORDER.includes(fw)) frameworks.add(fw)
  }
  return FRAMEWORK_ORDER.filter(fw => frameworks.has(fw))
}

export function getCurvasDisponibles(products) {
  const curves = new Set()
  for (const p of products) {
    const c = extractCurve(p.name)
    if (c && c !== '?' && CURVE_ORDER.includes(c)) curves.add(c)
  }
  return CURVE_ORDER.filter(c => curves.has(c))
}

export function getTiposDiferencial(products) {
  const tipos = new Set()
  for (const p of products) {
    const t = extractTipoDiferencial(p.name)
    if (t) tipos.add(t)
    if (p.tipo && ['AC', 'A', 'F', 'B', 'Hpi', 'Si'].includes(p.tipo)) tipos.add(p.tipo)
  }
  return ['AC', 'A', 'F', 'B', 'Hpi', 'Si'].filter(t => tipos.has(t))
}

export function getPolosDisponibles(products, filtro = {}) {
  const polas = new Set()
  for (const p of products) {
    if (filtro.curve && extractCurve(p.name) !== filtro.curve) continue
    const pola = extractPoles(p.name)
    if (pola && pola !== '?' && POLA_ORDER.includes(pola)) polas.add(pola)
  }
  return POLA_ORDER.filter(p => polas.has(p))
}

export function getCalibresDisponibles(products, filtro = {}) {
  const amps = new Set()
  for (const p of products) {
    if (filtro.curve && extractCurve(p.name) !== filtro.curve) continue
    if (filtro.polos && extractPoles(p.name) !== filtro.polos) continue
    if (filtro.sensibilidad && extractSensitivity(p.name) !== filtro.sensibilidad) continue
    const amp = extractAmps(p.name)
    if (amp > 0) amps.add(ampToStandard(amp))
  }
  return [...amps].sort((a, b) => a - b)
}

export function getSensibilidadesDisponibles(products, filtro = {}) {
  const sens = new Set()
  for (const p of products) {
    if (filtro.tipo && extractTipoDiferencial(p.name) !== filtro.tipo) continue
    if (filtro.polos && extractPoles(p.name) !== filtro.polos) continue
    const s = extractSensitivity(p.name)
    if (s > 0 && SENSITIVITY_ORDER.includes(s)) sens.add(s)
  }
  return SENSITIVITY_ORDER.filter(s => sens.has(s))
}

export function filterProductsBy(products, filtro = {}) {
  return products.filter(p => {
    if (filtro.curve && extractCurve(p.name) !== filtro.curve) return false
    if (filtro.tipo && extractTipoDiferencial(p.name) !== filtro.tipo) return false
    if (filtro.polos && extractPoles(p.name) !== filtro.polos) return false
    if (filtro.calibre !== undefined && filtro.calibre !== null) {
      const amp = ampToStandard(extractAmps(p.name))
      if (amp !== filtro.calibre) return false
    }
    if (filtro.sensibilidad !== undefined && filtro.sensibilidad !== null) {
      if (extractSensitivity(p.name) !== filtro.sensibilidad) return false
    }
    return true
  })
}

export const CURVA_DESC = {
  B: 'Protección de personas — baja sobreintensidad',
  C: 'Protección general — uso estándar',
  D: 'Protección de motores — alta sobreintensidad',
  K: 'Circuitos especiales — carga inductiva',
  MA: 'Protección de motores — solo magnético',
  Z: 'Semiconductores — muy baja sobreintensidad',
  TMD: 'Térmico-magnético ajustable (ComPacT NSX)',
}

export const TIPO_DIFERENCIAL_DESC = {
  AC: 'Corriente alterna senoidal',
  A: 'CA + pulsos unidireccionales',
  F: 'CA + pulsos + altas frecuencias',
  B: 'CA + CC + pulsos',
  Hpi: 'Alta inmunidad — evita disparos intempestivos',
  Si: 'Selectivo — retardo intencionado',
}

export const SENSIBILIDAD_DESC = {
  10: 'Equipos muy sensibles',
  30: 'Protección de personas',
  100: 'Personas + incendios',
  300: 'Protección contra incendios',
  500: 'Protección contra incendios',
  1000: 'Protección contra incendios',
}

export function groupByTable(products) {
  if (!products || products.length === 0) return null
  if (!supportsTableView(products)) return null

  const subfamilia = (products[0]?.subfamilia || '').trim()

  if (subfamilia === 'Interruptor Diferencial') {
    return groupByTableDiferencial(products)
  }

  return groupByTableMagnetotermico(products)
}

function groupByTableDiferencial(products) {
  const rows = {}
  let calibreMin = Infinity
  let calibreMax = -Infinity

  products.forEach(p => {
    const pola = extractPoles(p.name)
    if (pola === '?' || !POLA_ORDER.includes(pola)) return

    const rawAmp = extractAmps(p.name)
    if (rawAmp === 0) return
    const amp = ampToStandard(rawAmp)

    const sens = extractSensitivity(p.name)
    if (sens === 0) return

    const key = sens + '-' + pola
    if (!rows[key]) rows[key] = {}
    if (!rows[key][amp]) rows[key][amp] = []
    rows[key][amp].push(p)

    if (amp < calibreMin) calibreMin = amp
    if (amp > calibreMax) calibreMax = amp
  })

  const sensitivities = [...new Set(Object.keys(rows).map(k => parseInt(k.split('-')[0])))]
    .filter(s => SENSITIVITY_ORDER.includes(s))
    .sort((a, b) => SENSITIVITY_ORDER.indexOf(a) - SENSITIVITY_ORDER.indexOf(b))

  const polas = [...new Set(Object.keys(rows).map(k => k.split('-')[1]))]
    .filter(p => POLA_ORDER.includes(p))
    .sort((a, b) => POLA_ORDER.indexOf(a) - POLA_ORDER.indexOf(b))

  const sortedAmps = AMP_STEPS.filter(a => a >= calibreMin && a <= calibreMax)

  return { rows, sensitivities, polas, calibres: sortedAmps, type: 'diferencial' }
}

function groupByTableMagnetotermico(products) {
  const groups = {}
  let calibreMin = Infinity
  let calibreMax = -Infinity

  products.forEach(p => {
    const pola = extractPoles(p.name)
    if (pola === '?') return

    const rawAmp = extractAmps(p.name)
    if (rawAmp === 0) return
    const amp = ampToStandard(rawAmp)

    let curve = extractCurve(p.name)

    if (curve === '?') {
      if (p.name && (p.name.includes('TMD') || p.name.includes('Micrologic'))) {
        curve = 'TMD'
      } else if (p.name && p.name.includes('MA')) {
        curve = 'MA'
      } else {
        return
      }
    }

    const subgama = extractSubgama(p.name) || 'general'
    const groupKey = subgama + '|' + curve
    if (!groups[groupKey]) groups[groupKey] = { rows: {}, subgama, curve }
    if (!groups[groupKey].rows[curve + '-' + pola]) groups[groupKey].rows[curve + '-' + pola] = {}
    if (!groups[groupKey].rows[curve + '-' + pola][amp]) groups[groupKey].rows[curve + '-' + pola][amp] = []
    groups[groupKey].rows[curve + '-' + pola][amp].push(p)

    if (amp < calibreMin) calibreMin = amp
    if (amp > calibreMax) calibreMax = amp
  })

  const polasSet = new Set()
  Object.values(groups).forEach(g => {
    Object.keys(g.rows).forEach(k => polasSet.add(k.split('-')[1]))
  })
  const polas = [...polasSet]
    .filter(p => POLA_ORDER.includes(p))
    .sort((a, b) => POLA_ORDER.indexOf(a) - POLA_ORDER.indexOf(b))

  const sortedAmps = AMP_STEPS.filter(a => a >= calibreMin && a <= calibreMax)

  const sections = Object.values(groups)
    .filter(g => {
      const hasData = Object.values(g.rows).some(cellMap =>
        Object.values(cellMap).some(items => items.length > 0)
      )
      return hasData
    })

  return { sections, polas, calibres: sortedAmps, type: 'magnetotermico' }
}

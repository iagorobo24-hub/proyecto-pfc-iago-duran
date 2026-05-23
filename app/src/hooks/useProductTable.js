const POLA_ORDER = ['1P', '1P+N', '2P', '3P', '3P+N', '4P']
const CURVE_ORDER = ['B', 'C', 'D', 'K', 'MA', 'TMD', 'Z']
const AMP_STEPS = [0.5, 1, 1.6, 2, 2.5, 3, 4, 5, 6, 6.3, 8, 10, 12.5, 13, 15, 16, 20, 25, 30, 32, 40, 50, 63, 80, 100, 125, 150, 160, 200, 220, 250, 320, 400, 500, 570, 630, 800, 1000, 1250, 1600]

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

  if (!allMagnetotermico && !allDiferencial) return false

  const gama = products[0]?.Gama || products[0]?.gama || ''

  if (allMagnetotermico) return MAGNETOTERMICO_GAMAS.includes(gama)
  if (allDiferencial) return DIFERENCIAL_GAMAS.includes(gama)

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
  const rows = {}
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

    const key = curve + '-' + pola
    if (!rows[key]) rows[key] = {}
    if (!rows[key][amp]) rows[key][amp] = []
    rows[key][amp].push(p)

    if (amp < calibreMin) calibreMin = amp
    if (amp > calibreMax) calibreMax = amp
  })

  const curvas = [...new Set(Object.keys(rows).map(k => k.split('-')[0]))]
    .filter(c => CURVE_ORDER.includes(c))
    .sort((a, b) => CURVE_ORDER.indexOf(a) - CURVE_ORDER.indexOf(b))

  const polas = [...new Set(Object.keys(rows).map(k => k.split('-')[1]))]
    .filter(p => POLA_ORDER.includes(p))
    .sort((a, b) => POLA_ORDER.indexOf(a) - POLA_ORDER.indexOf(b))

  const sortedAmps = AMP_STEPS.filter(a => a >= calibreMin && a <= calibreMax)

  return { rows, curvas, polas, calibres: sortedAmps, type: 'magnetotermico' }
}

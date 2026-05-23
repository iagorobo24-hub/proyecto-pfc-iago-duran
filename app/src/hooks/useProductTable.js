const POLA_ORDER = ['1P', '1P+N', '2P', '3P', '3P+N', '4P']

function extractPoles(name) {
  if (!name) return '?'
  const m = name.match(/(\d+)P\+N/i)
  if (m) return m[1] + 'P+N'
  const m2 = name.match(/(\d+)P\b/i)
  if (m2) return m2[1] + 'P'
  return '?'
}

function extractAmps(name) {
  if (!name) return 0
  const m = name.match(/(\d+)\s*A\b/)
  if (m) return parseInt(m[1])
  const m2 = name.match(/\b(\d+)(?=\s*A)/)
  if (m2) return parseInt(m2[1])
  const m3 = name.match(/(\d+)(?:\s*[A])(?:\s|,|\.|$)/)
  if (m3) return parseInt(m3[1])
  return 0
}

function extractCurve(name) {
  if (!name) return '?'
  const m = name.match(/curva\s+([A-DKZ])/i)
  if (m) return m[1]
  const m2 = name.match(/\b([A-DKZ])\s*curva/i)
  if (m2) return m2[1]
  const m3 = name.match(/\b([A-DKZ])\s+(?:A\s*)?\d/);
  if (m3) return m3[1]
  return '?'
}

export function groupByTable(products) {
  if (!products || products.length === 0) return null

  const isMagnetotermico = products.some(
    p => p.subfamilia === 'Interruptor Magnetotérmico'
  )
  if (!isMagnetotermico) return null

  const rows = {}
  let calibreMin = Infinity
  let calibreMax = -Infinity

  products.forEach(p => {
    const pola = extractPoles(p.name)
    const amp = extractAmps(p.name)
    const curve = extractCurve(p.name)

    if (!pola || pola === '?' || !amp) return

    const key = curve + '-' + pola
    if (!rows[key]) rows[key] = {}
    if (!rows[key][amp]) rows[key][amp] = []
    rows[key][amp].push(p)

    if (amp < calibreMin) calibreMin = amp
    if (amp > calibreMax) calibreMax = amp
  })

  const curvas = [...new Set(Object.keys(rows).map(k => k.split('-')[0]))].sort()
  const polas = [...new Set(Object.keys(rows).map(k => k.split('-')[1]))]
    .filter(p => POLA_ORDER.includes(p))
    .sort((a, b) => POLA_ORDER.indexOf(a) - POLA_ORDER.indexOf(b))

  calibreMin = Math.max(calibreMin, 1)
  calibreMax = Math.min(calibreMax, 63)

  const calibres = []
  const calibreSteps = [1, 2, 3, 4, 5, 6, 8, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 220, 250, 320, 400, 500, 570, 630]
  calibreSteps.forEach(a => {
    if (a >= calibreMin && a <= calibreMax) calibres.push(a)
  })

  return { rows, curvas, polas, calibres }
}

export function getTableData(products) {
  return groupByTable(products)
}
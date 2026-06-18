import {
  ampToStandard,
  extractAmps,
  extractCurve,
  extractPoles,
  extractSensitivity,
  filterProductsBy,
} from '../hooks/useProductTable'

export {
  ampToStandard,
  extractAmps,
  extractCurve,
  extractPoles,
  extractSensitivity,
  filterProductsBy,
}

export function normalizeSpecText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function productSearchText(product = {}) {
  return [
    product.ref_fabricante,
    product.ref,
    product.name,
    product.desc,
    product.marca,
    product.familia,
    product.subfamilia,
    product.tipo,
    product.Gama,
    product.Subgama,
  ].filter(Boolean).join(' ')
}

function productTechnicalText(product = {}) {
  return [
    product.ref_fabricante,
    product.ref,
    product.name,
    product.tipo,
    product.Gama,
    product.Subgama,
  ].filter(Boolean).join(' ')
}

function sameText(left, right) {
  return normalizeSpecText(left) === normalizeSpecText(right)
}

function includesText(text, term) {
  return normalizeSpecText(text).includes(normalizeSpecText(term))
}

function sameAmp(left, right) {
  if (!left || !right) return false
  return ampToStandard(Number(left)) === ampToStandard(Number(right))
}

function extractBreakingCapacitiesKa(value = '') {
  const text = normalizeSpecText(value).replace(/,/g, '.')
  const capacities = []

  for (const match of text.matchAll(/\b(\d+(?:\.\d+)?)\s*k\s*a\b/g)) {
    const valueKa = Number(match[1])
    if (Number.isFinite(valueKa)) capacities.push(valueKa)
  }

  for (const match of text.matchAll(/\b(\d{4,6})\s*a\b/g)) {
    const valueA = Number(match[1])
    if (Number.isFinite(valueA)) capacities.push(valueA / 1000)
  }

  return [...new Set(capacities)]
}

function requestedBreakingCapacityKa(value) {
  return extractBreakingCapacitiesKa(value)[0]
}

function sameBreakingCapacity(productCapacities, requested) {
  const requestedKa = requestedBreakingCapacityKa(requested)
  if (!requestedKa) return false
  return productCapacities.some(value => Math.abs(value - requestedKa) < 0.01)
}

export function extractProductSpecs(product = {}) {
  const text = productSearchText(product)
  const technicalText = productTechnicalText(product)
  const poles = extractPoles(technicalText)
  const amps = extractAmps(technicalText)
  const curveFromName = extractCurve(product.name || product.desc || '')
  const curve = curveFromName && curveFromName !== '?' ? curveFromName : extractCurve(technicalText)
  const sensitivityMa = extractSensitivity(technicalText)

  return {
    text,
    normalizedText: normalizeSpecText(text),
    poles: poles && poles !== '?' ? poles : undefined,
    amps: amps > 0 ? ampToStandard(amps) : undefined,
    curve: curve && curve !== '?' ? curve : undefined,
    sensitivityMa: sensitivityMa > 0 ? sensitivityMa : undefined,
    breakingCapacitiesKa: extractBreakingCapacitiesKa(technicalText),
  }
}

export function scoreProductMatch(product = {}, criteria = {}) {
  const specs = extractProductSpecs(product)
  let score = 0
  const matchedSpecs = []
  const missingSpecs = []

  const addMatch = (label, points) => {
    matchedSpecs.push(label)
    score += points
  }
  const addMiss = (label, penalty = 0) => {
    missingSpecs.push(label)
    score -= penalty
  }

  if (criteria.family) {
    if (sameText(product.familia, criteria.family)) addMatch(`Familia ${criteria.family}`, 10)
    else addMiss(`Familia ${criteria.family}`, 12)
  }

  if (criteria.subfamily) {
    if (sameText(product.subfamilia, criteria.subfamily)) addMatch(`Subfamilia ${criteria.subfamily}`, 28)
    else addMiss(`Subfamilia ${criteria.subfamily}`, 24)
  }

  if (criteria.brand) {
    if (includesText(product.marca, criteria.brand)) addMatch(`Marca ${product.marca}`, 16)
    else addMiss(`Marca ${criteria.brand}`, 12)
  }

  if (criteria.amps) {
    if (specs.amps && sameAmp(specs.amps, criteria.amps)) addMatch(`${ampToStandard(criteria.amps)} A`, 18)
    else addMiss(`${criteria.amps} A`, specs.amps ? 14 : 5)
  }

  if (criteria.poles) {
    if (specs.poles === criteria.poles) addMatch(criteria.poles, 16)
    else addMiss(criteria.poles, specs.poles ? 12 : 4)
  }

  if (criteria.curve) {
    if (specs.curve === criteria.curve) addMatch(`Curva ${criteria.curve}`, 12)
    else addMiss(`Curva ${criteria.curve}`, specs.curve ? 10 : 3)
  }

  if (criteria.sensitivityMa) {
    if (specs.sensitivityMa === criteria.sensitivityMa) addMatch(`${criteria.sensitivityMa} mA`, 14)
    else addMiss(`${criteria.sensitivityMa} mA`, specs.sensitivityMa ? 12 : 4)
  }

  if (criteria.breakingCapacity) {
    if (sameBreakingCapacity(specs.breakingCapacitiesKa, criteria.breakingCapacity)) addMatch(criteria.breakingCapacity, 10)
    else addMiss(criteria.breakingCapacity, specs.breakingCapacitiesKa.length > 0 ? 8 : 3)
  }

  const rawTermMatches = (criteria.rawTerms || [])
    .filter(term => term.length > 2 && includesText(specs.text, term))
    .slice(0, 4)
  if (rawTermMatches.length > 0) {
    score += rawTermMatches.length * 3
    matchedSpecs.push(...rawTermMatches.map(term => `Término ${term}`))
  }

  if (product.imagen) score += 2
  if (product.pdf_url) score += 1

  const name = normalizeSpecText(product.name)
  const brand = normalizeSpecText(product.marca)
  if (!name || (brand && name === brand)) {
    addMiss('Nombre poco descriptivo', 8)
  }

  const requestedSpecs = [
    criteria.amps,
    criteria.poles,
    criteria.curve,
    criteria.sensitivityMa,
  ].filter(Boolean).length
  const technicalMatches = matchedSpecs.filter(spec =>
    / A$|mA$|kA$|^\dP|Curva /.test(spec)
  ).length

  let matchType = 'related'
  if (criteria.subfamily && sameText(product.subfamilia, criteria.subfamily) && requestedSpecs > 0 && technicalMatches >= requestedSpecs) {
    matchType = 'exact'
  } else if (score >= 34 || technicalMatches > 0) {
    matchType = 'partial'
  }

  return {
    score: Math.max(0, score),
    matchType,
    matchedSpecs: [...new Set(matchedSpecs)],
    missingSpecs: [...new Set(missingSpecs)],
  }
}

export function matchesCriteria(product = {}, criteria = {}) {
  const result = scoreProductMatch(product, criteria)
  if (criteria.family && !sameText(product.familia, criteria.family)) return false
  if (criteria.subfamily && !sameText(product.subfamilia, criteria.subfamily)) return false
  if (criteria.brand && !includesText(product.marca, criteria.brand)) return false
  if (criteria.amps && result.missingSpecs.includes(`${criteria.amps} A`)) return false
  if (criteria.poles && result.missingSpecs.includes(criteria.poles)) return false
  if (criteria.curve && result.missingSpecs.includes(`Curva ${criteria.curve}`)) return false
  if (criteria.sensitivityMa && result.missingSpecs.includes(`${criteria.sensitivityMa} mA`)) return false
  if (criteria.breakingCapacity && result.missingSpecs.includes(criteria.breakingCapacity)) return false
  return true
}

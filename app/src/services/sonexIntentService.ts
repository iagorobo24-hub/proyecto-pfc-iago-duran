import type { SonexIntent, SonexIntentResult, SonexProductCriteria } from '../types/sonex';

const PRODUCT_PATTERNS = [
  {
    productType: 'magnetotermico',
    family: 'Protecciones y Cuadros',
    subfamily: 'Interruptor Magnetotérmico',
    terms: ['magnetotermico', 'magnetotérmico', 'automatico', 'automático', 'mcb', 'pia'],
  },
  {
    productType: 'diferencial',
    family: 'Protecciones y Cuadros',
    subfamily: 'Interruptor Diferencial',
    terms: ['diferencial', 'rccb', 'id'],
  },
  {
    productType: 'caja moldeada',
    family: 'Protecciones y Cuadros',
    subfamily: 'Interruptor Caja Moldeada',
    terms: ['caja moldeada', 'compacto', 'mccb'],
  },
  {
    productType: 'contactor',
    family: 'Automatización',
    subfamily: 'Contactor',
    terms: ['contactor', 'contactores'],
  },
  {
    productType: 'variador',
    family: 'Automatización',
    subfamily: 'Variador de Frecuencia',
    terms: ['variador', 'variador de frecuencia', 'vfd'],
  },
  {
    productType: 'fuente alimentacion',
    family: 'Automatización',
    subfamily: 'Fuente alimentación',
    terms: ['fuente alimentacion', 'fuente alimentación', 'fuente 24v'],
  },
  {
    productType: 'guardamotor',
    family: 'Automatización',
    subfamily: 'Guardamotor',
    terms: ['guardamotor', 'guardamotor magnetico', 'guardamotor magnético'],
  },
] as const;

const LOOKUP_WORDS = [
  'necesito',
  'puedo usar',
  'que referencias',
  'qué referencias',
  'opciones',
  'recomienda',
  'recomiendame',
  'recomiéndame',
  'busca',
  'buscar',
  'dame',
  'selecciona',
]

const BUDGET_WORDS = ['anadir', 'añadir', 'presupuesto', 'partida', 'oferta', 'cotizacion', 'cotización']
const COMPARISON_WORDS = ['compara', 'comparar', 'diferencias', 'mejor opcion', 'mejor opción', 'versus', ' vs ']
const TECHNICAL_WORDS = ['norma', 'instalar', 'calcular', 'dimensionar', 'proteccion', 'protección', 'maniobra', 'mantenimiento']

const RANGE_WORDS = ['gama', 'serie', 'linea', 'subgama', 'rango']
const CATALOG_OBJECT_WORDS = ['referencia', 'referencias', 'ref', 'refs', 'modelo', 'modelos', 'producto', 'productos']

const KNOWN_BRAND_ALIASES = [
  { canonical: 'Schneider Electric', aliases: ['schneider electric', 'schneider'] },
  { canonical: 'Phoenix Contact', aliases: ['phoenix contact', 'phoenix'] },
  { canonical: 'Mitsubishi Electric', aliases: ['mitsubishi electric', 'mitsubishi'] },
  { canonical: 'IFM Electronic', aliases: ['ifm electronic', 'ifm'] },
  { canonical: 'Pepperl+Fuchs', aliases: ['pepperl+fuchs', 'pepperl fuchs', 'pepperl'] },
  { canonical: 'Philips Lighting', aliases: ['philips lighting', 'philips'] },
  { canonical: 'SMA Solar', aliases: ['sma solar', 'sma'] },
  { canonical: 'ABB', aliases: ['abb'] },
  { canonical: 'Siemens', aliases: ['siemens'] },
  { canonical: 'Ledvance', aliases: ['ledvance'] },
  { canonical: 'Zemper', aliases: ['zemper'] },
  { canonical: 'Wallbox', aliases: ['wallbox'] },
  { canonical: 'Hager', aliases: ['hager'] },
  { canonical: 'Fronius', aliases: ['fronius'] },
  { canonical: 'Pylontech', aliases: ['pylontech'] },
  { canonical: 'Legrand', aliases: ['legrand'] },
  { canonical: 'Eaton', aliases: ['eaton'] },
  { canonical: 'Finder', aliases: ['finder'] },
  { canonical: 'Circutor', aliases: ['circutor'] },
] as const;

const STOP_WORDS = new Set([
  'para', 'por', 'con', 'sin', 'que', 'una', 'uno', 'unos', 'unas', 'del', 'las', 'los',
  'necesito', 'necesitas', 'quiero', 'puedo', 'usar', 'dame', 'dime', 'busca', 'buscar', 'opciones', 'referencias',
  'producto', 'productos', 'marca', 'fabricante', 'presupuesto', 'partida',
])

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function includesAny(normalized: string, words: string[]): boolean {
  return words.some(word => normalized.includes(normalizeText(word)))
}

function includesProductTerm(normalized: string, term: string): boolean {
  const normalizedTerm = normalizeText(term).trim()
  const pattern = escapeRegExp(normalizedTerm).replace(/\s+/g, '\\s+')
  const matcher = new RegExp(`(^|[^\\p{L}\\d])${pattern}([^\\p{L}\\d]|$)`, 'u')
  return matcher.test(normalized)
}

function findProductPattern(normalized: string) {
  return PRODUCT_PATTERNS.find(pattern =>
    pattern.terms.some(term => includesProductTerm(normalized, term))
  )
}

function extractNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

function extractPoles(message: string): string | undefined {
  const compactMatch = message.match(/\b(1\s*p\s*\+\s*n|3\s*p\s*\+\s*n|[1234]\s*p)\b/i)
  if (compactMatch) return compactMatch[1].replace(/\s+/g, '').toUpperCase()

  const polesWithNeutral = message.match(/\b(1|3)\s*(?:polo|polos)\s*(?:\+|y|con)?\s*(?:n|neutro)\b/i)
  if (polesWithNeutral) return `${polesWithNeutral[1]}P+N`

  const naturalMatch = message.match(/\b([1234])\s*(?:polo|polos)\b/i)
  if (naturalMatch) return `${naturalMatch[1]}P`

  const namedPoles = [
    { pattern: /\bmonopolar(?:es)?\b/i, value: '1P' },
    { pattern: /\bbipolar(?:es)?\b/i, value: '2P' },
    { pattern: /\btripolar(?:es)?\b/i, value: '3P' },
    { pattern: /\btetrapolar(?:es)?\b/i, value: '4P' },
  ]
  return namedPoles.find(item => item.pattern.test(message))?.value
}

function extractAmps(message: string): number | undefined {
  const match = message.match(/\b(\d+(?:[.,]\d+)?)\s*(?:a|amperios?)\b/i)
  return extractNumber(match?.[1])
}

function extractCurve(message: string): string | undefined {
  const match = message.match(/\bcurva\s*([bcdkz])\b/i) || message.match(/\b([bcdkz])\s*curva\b/i)
  return match?.[1]?.toUpperCase()
}

function extractSensitivity(message: string): number | undefined {
  const match = message.match(/\b(\d+(?:[.,]\d+)?)\s*ma\b/i)
  return extractNumber(match?.[1])
}

function extractBreakingCapacity(message: string): string | undefined {
  const match = message.match(/\b(\d+(?:[.,]\d+)?)\s*ka\b/i)
  return match ? `${match[1].replace(',', '.')} kA` : undefined
}

function extractVoltage(message: string): string | undefined {
  const match = message.match(/\b(\d+(?:[.,]\d+)?)\s*v(?:cc|ca|dc|ac)?\b/i)
  return match ? `${match[1].replace(',', '.')} V` : undefined
}

function extractQuantity(message: string): number | undefined {
  const match = message.match(/\b(\d+)\s*(?:uds?|unidades?|piezas?|referencias?|refs?|modelos?|productos?)\b/i)
  return match ? Number(match[1]) : undefined
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findKnownBrand(value: string): string | undefined {
  const normalized = normalizeText(value)
  for (const brand of KNOWN_BRAND_ALIASES) {
    for (const alias of brand.aliases) {
      const normalizedAlias = normalizeText(alias)
      const matcher = new RegExp(`(^|[^\\p{L}\\d])${escapeRegExp(normalizedAlias)}([^\\p{L}\\d]|$)`, 'u')
      if (matcher.test(normalized)) return brand.canonical
    }
  }
  return undefined
}

function extractBrand(message: string): string | undefined {
  const match = message.match(/\b(?:marca|fabricante)\s+([\p{L}\d][\p{L}\d ._-]{1,32})/iu)
  if (!match) return findKnownBrand(message)
  const candidate = match[1]
    .split(/\b(?:de|del|con|para|curva|polo|polos|amperios?|referencia|ref|modelo|serie)\b|\b\d+(?:[.,]\d+)?\s*(?:p|a|ma|ka|v)\b/i)[0]
    .replace(/\s+\d.*$/, '')
    .trim()
  if (!candidate || /\d/.test(candidate)) return undefined
  return findKnownBrand(candidate) || candidate
}

function extractRawTerms(message: string): string[] {
  return [...new Set(
    normalizeText(message)
      .replace(/[^\p{L}\d\s+-]/gu, ' ')
      .split(/\s+/)
      .map(term => term.trim())
      .filter(term => term.length > 2 && !STOP_WORDS.has(term))
      .slice(0, 8)
  )]
}

function buildCriteria(message: string): SonexProductCriteria {
  const normalized = normalizeText(message)
  const productPattern = findProductPattern(normalized)
  const amps = extractAmps(message)
  const poles = extractPoles(message)
  const curve = extractCurve(message)
  const sensitivityMa = extractSensitivity(message)
  const brand = extractBrand(message)
  const rawTerms = extractRawTerms(message)

  let confidence = 0.12
  if (productPattern) confidence += 0.34
  if (includesAny(normalized, LOOKUP_WORDS)) confidence += 0.14
  if (includesAny(normalized, BUDGET_WORDS)) confidence += 0.12
  if (includesAny(normalized, COMPARISON_WORDS)) confidence += 0.12
  if (brand) confidence += 0.08
  confidence += [amps, poles, curve, sensitivityMa].filter(Boolean).length * 0.08
  if (includesAny(normalized, RANGE_WORDS) && includesAny(normalized, CATALOG_OBJECT_WORDS)) confidence += 0.12
  confidence = Math.min(0.98, Number(confidence.toFixed(2)))

  return {
    productType: productPattern?.productType,
    family: productPattern?.family,
    subfamily: productPattern?.subfamily,
    brand,
    poles,
    curve,
    amps,
    sensitivityMa,
    breakingCapacity: extractBreakingCapacity(message),
    voltage: extractVoltage(message),
    quantity: extractQuantity(message),
    rawTerms,
    confidence,
  }
}

function getClarificationQuestion(criteria: SonexProductCriteria): string | undefined {
  if (!criteria.productType) return undefined

  const hasAnyTechnicalSpec = Boolean(criteria.amps || criteria.poles || criteria.curve || criteria.sensitivityMa)
  if (hasAnyTechnicalSpec) return undefined

  if (criteria.productType === 'magnetotermico') {
    return 'Necesito concretar calibre, número de polos y curva para buscar referencias exactas en catálogo.'
  }
  if (criteria.productType === 'diferencial') {
    return 'Necesito concretar calibre, número de polos y sensibilidad en mA para buscar diferenciales exactos.'
  }
  return undefined
}

export function detectSonexIntent(message: string): SonexIntentResult {
  const text = message.trim()
  const normalized = normalizeText(text)
  const criteria = buildCriteria(text)
  const hasProduct = Boolean(criteria.productType)
  const hasLookup = includesAny(normalized, LOOKUP_WORDS)
  const hasBudget = includesAny(normalized, BUDGET_WORDS)
  const hasComparison = includesAny(normalized, COMPARISON_WORDS)
  const hasTechnical = includesAny(normalized, TECHNICAL_WORDS)
  const hasRangeCatalogRequest = hasLookup
    && Boolean(criteria.brand)
    && includesAny(normalized, RANGE_WORDS)
    && includesAny(normalized, CATALOG_OBJECT_WORDS)

  let intent: SonexIntent = 'technical_question'
  if (hasBudget) intent = 'budget_action'
  else if (hasProduct && hasComparison) intent = 'product_comparison'
  else if (hasProduct && hasLookup && normalized.includes('recom')) intent = 'product_recommendation'
  else if (hasProduct && (hasLookup || criteria.confidence >= 0.5)) intent = 'catalog_lookup'
  else if (hasRangeCatalogRequest) intent = 'catalog_lookup'
  else if (!hasProduct && !hasTechnical) intent = 'technical_question'

  const clarificationQuestion = ['catalog_lookup', 'product_recommendation', 'budget_action'].includes(intent)
    ? getClarificationQuestion(criteria)
    : undefined

  if (clarificationQuestion) {
    intent = 'clarification_needed'
  }

  return {
    intent,
    criteria,
    needsClarification: Boolean(clarificationQuestion),
    clarificationQuestion,
  }
}

export function isCatalogIntent(intent: SonexIntent): boolean {
  return ['catalog_lookup', 'product_recommendation', 'product_comparison', 'budget_action'].includes(intent)
}

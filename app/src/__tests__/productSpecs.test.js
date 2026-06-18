import { describe, expect, it } from 'vitest'
import { extractProductSpecs, matchesCriteria, scoreProductMatch } from '../utils/productSpecs'

const EXACT_PRODUCT = {
  id: 1,
  ref_fabricante: 'REF-216C',
  name: 'Magnetotérmico modular 2P 16A C curva',
  marca: 'Marca Norte',
  familia: 'Protecciones y Cuadros',
  subfamilia: 'Interruptor Magnetotérmico',
  tipo: 'CARRIL DIN',
  Gama: 'Serie Compacta',
  imagen: 'https://example.test/product.png',
  pdf_url: 'https://example.test/product.pdf',
}

describe('productSpecs', () => {
  it('extracts reusable technical specs from product fields', () => {
    const specs = extractProductSpecs(EXACT_PRODUCT)

    expect(specs.poles).toBe('2P')
    expect(specs.amps).toBe(16)
    expect(specs.curve).toBe('C')
  })

  it('scores exact catalog matches above partial matches', () => {
    const exact = scoreProductMatch(EXACT_PRODUCT, {
      family: 'Protecciones y Cuadros',
      subfamily: 'Interruptor Magnetotérmico',
      poles: '2P',
      curve: 'C',
      amps: 16,
      rawTerms: ['magnetotermico'],
      confidence: 0.9,
    })

    const partial = scoreProductMatch(
      { ...EXACT_PRODUCT, ref_fabricante: 'REF-110C', name: 'Magnetotérmico modular 1P 10A C curva' },
      {
        family: 'Protecciones y Cuadros',
        subfamily: 'Interruptor Magnetotérmico',
        poles: '2P',
        curve: 'C',
        amps: 16,
        rawTerms: ['magnetotermico'],
        confidence: 0.9,
      }
    )

    expect(exact.matchType).toBe('exact')
    expect(partial.matchType).toBe('partial')
    expect(exact.score).toBeGreaterThan(partial.score)
  })

  it('matches criteria only when requested specs are satisfied', () => {
    expect(matchesCriteria(EXACT_PRODUCT, {
      subfamily: 'Interruptor Magnetotérmico',
      poles: '2P',
      curve: 'C',
      amps: 16,
      rawTerms: [],
      confidence: 0.8,
    })).toBe(true)

    expect(matchesCriteria(EXACT_PRODUCT, {
      subfamily: 'Interruptor Magnetotérmico',
      poles: '4P',
      curve: 'C',
      amps: 16,
      rawTerms: [],
      confidence: 0.8,
    })).toBe(false)
  })
})

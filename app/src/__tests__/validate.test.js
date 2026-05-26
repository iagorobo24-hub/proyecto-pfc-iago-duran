import { describe, it, expect } from 'vitest'
import { shape, validateProduct, validateBrand } from '../utils/validate'

describe('shape', () => {
  const schema = {
    name: { type: 'string', required: true, trim: true, maxLength: 50 },
    age: { type: 'number', default: 0 },
    active: { type: 'boolean', default: false },
    optional: { type: 'string', default: 'default' },
  }

  const validate = shape(schema)

  it('validates complete valid data', () => {
    const result = validate({ name: 'Test', age: '25', active: 'true' })
    expect(result.name).toBe('Test')
    expect(result.age).toBe(25)
    expect(result.active).toBe(true)
  })

  it('applies default values for missing optional fields', () => {
    const result = validate({ name: 'Test' })
    expect(result.age).toBe(0)
    expect(result.active).toBe(false)
    expect(result.optional).toBe('default')
  })

  it('trims string values', () => {
    const result = validate({ name: '  hello  ' })
    expect(result.name).toBe('hello')
  })

  it('truncates strings over maxLength', () => {
    const long = 'a'.repeat(100)
    const result = validate({ name: long })
    expect(result.name.length).toBe(50)
  })

  it('converts string age to number', () => {
    const result = validate({ name: 'Test', age: '30' })
    expect(result.age).toBe(30)
  })

  it('returns null for null data', () => {
    expect(validate(null)).toBeNull()
  })

  it('returns null for undefined data', () => {
    expect(validate(undefined)).toBeNull()
  })

  it('validates array of objects', () => {
    const items = [
      { name: 'First', age: '20' },
      { name: 'Second', age: '30' },
    ]
    const result = validate(items)
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('First')
    expect(result[1].name).toBe('Second')
  })

  it('uses default for NaN number conversion', () => {
    const result = validate({ name: 'Test', age: 'not-a-number' })
    expect(result.age).toBe(0)
  })

  it('converts to boolean correctly', () => {
    expect(validate({ name: 'T', active: true }).active).toBe(true)
    expect(validate({ name: 'T', active: false }).active).toBe(false)
    expect(validate({ name: 'T', active: 'false' }).active).toBe(true)
  })
})

describe('validateProduct', () => {
  it('validates a complete product', () => {
    const product = {
      id: 1,
      ref_fabricante: 'ABC-123',
      name: 'Test Product',
      marca: 'Test Brand',
      familia: 'Test Family',
      precio: '29.99',
    }
    const result = validateProduct(product)
    expect(result.id).toBe(1)
    expect(result.ref_fabricante).toBe('ABC-123')
    expect(result.name).toBe('Test Product')
    expect(result.precio).toBe(29.99)
  })

  it('applies defaults for missing optional fields', () => {
    const result = validateProduct({ id: 1, ref_fabricante: 'REF' })
    expect(result.name).toBe('')
    expect(result.marca).toBe('')
    expect(result.familia).toBe('')
    expect(result.descripcion).toBe('')
    expect(result.precio).toBe(0)
  })

  it('handles null data', () => {
    expect(validateProduct(null)).toBeNull()
  })

  it('validates array of products', () => {
    const products = [
      { id: 1, ref_fabricante: 'A' },
      { id: 2, ref_fabricante: 'B' },
    ]
    const result = validateProduct(products)
    expect(result).toHaveLength(2)
    expect(result[0].ref_fabricante).toBe('A')
  })

  it('trims ref_fabricante', () => {
    const result = validateProduct({ id: 1, ref_fabricante: '  REF-001  ' })
    expect(result.ref_fabricante).toBe('REF-001')
  })
})

describe('validateBrand', () => {
  it('validates a complete brand', () => {
    const result = validateBrand({ id: 1, name: 'Test Brand' })
    expect(result.id).toBe(1)
    expect(result.name).toBe('Test Brand')
  })

  it('trims brand name', () => {
    const result = validateBrand({ id: 1, name: '  Schneider  ' })
    expect(result.name).toBe('Schneider')
  })

  it('handles null data', () => {
    expect(validateBrand(null)).toBeNull()
  })
})

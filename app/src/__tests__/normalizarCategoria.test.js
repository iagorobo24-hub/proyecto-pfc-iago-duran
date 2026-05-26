import { describe, it, expect } from 'vitest'
import { normalizarCategoria, esCategoriaValida, normalizarFamilia, normalizarNombreCategoria } from '../utils/normalizarCategoria'

describe('normalizarCategoria', () => {
  it('returns uppercase trimmed text', () => {
    expect(normalizarCategoria('Cables')).toBe('CABLES')
  })

  it('removes accents', () => {
    expect(normalizarCategoria('Distribución de Potencia')).toBe('DISTRIBUCION DE POTENCIA')
  })

  it('removes accents on all vowels', () => {
    expect(normalizarCategoria('ÁÉÍÓÚ Último')).toBe('AEIOU ULTIMO')
  })

  it('handles ñ correctly', () => {
    expect(normalizarCategoria('Año 2024')).toBe('ANO 2024')
  })

  it('removes special characters', () => {
    expect(normalizarCategoria('Protección Eléctrica!')).toBe('PROTECCION ELECTRICA')
  })

  it('normalizes multiple spaces', () => {
    expect(normalizarCategoria('  HERRAMIENTAS   Y   ACCESORIOS  ')).toBe('HERRAMIENTAS Y ACCESORIOS')
  })

  it('replaces hyphens with spaces', () => {
    expect(normalizarCategoria('BAJA-TENSIÓN')).toBe('BAJA TENSION')
  })

  it('returns null for null input', () => {
    expect(normalizarCategoria(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(normalizarCategoria(undefined)).toBeNull()
  })

  it('returns null for non-string input', () => {
    expect(normalizarCategoria(123)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(normalizarCategoria('')).toBeNull()
  })

  it('returns empty string for whitespace-only input', () => {
    expect(normalizarCategoria('   ')).toBe('')
  })
})

describe('esCategoriaValida', () => {
  it('returns true for valid category', () => {
    expect(esCategoriaValida('CABLES')).toBe(true)
    expect(esCategoriaValida('INTERRUPTORES Y MECANISMOS')).toBe(true)
    expect(esCategoriaValida('AUTOMATISMOS')).toBe(true)
  })

  it('returns false for invalid category', () => {
    expect(esCategoriaValida('INVENTADA')).toBe(false)
  })

  it('normalizes before checking', () => {
    expect(esCategoriaValida('cables')).toBe(true)
    expect(esCategoriaValida('Iluminación')).toBe(true)
  })

  it('returns false for null', () => {
    expect(esCategoriaValida(null)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(esCategoriaValida('')).toBe(false)
  })
})

describe('normalizarFamilia', () => {
  it('returns exact match from FAMILIA_A_CATEGORIA', () => {
    expect(normalizarFamilia('CABLES')).toBe('CABLES')
    expect(normalizarFamilia('DISTRIBUCION DE POTENCIA')).toBe('INTERRUPTORES Y MECANISMOS')
    expect(normalizarFamilia('DOMOTICA')).toBe('DOMOTICA')
  })

  it('normalizes and finds match', () => {
    expect(normalizarFamilia('Distribución de Potencia')).toBe('INTERRUPTORES Y MECANISMOS')
    expect(normalizarFamilia('Fontanería')).toBe('FONTANERIA')
  })

  it('finds partial match', () => {
    expect(normalizarFamilia('CABLES DE BAJA TENSIÓN')).toBe('CABLES')
  })

  it('returns null for unmapped family', () => {
    expect(normalizarFamilia('NONEXISTENT FAMILY')).toBeNull()
  })

  it('returns null for null input', () => {
    expect(normalizarFamilia(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(normalizarFamilia(undefined)).toBeNull()
  })

  it('maps HVAC variants to CLIMATIZACION', () => {
    expect(normalizarFamilia('CLIMATIZACION')).toBe('CLIMATIZACION')
    expect(normalizarFamilia('HVAC')).toBe('CLIMATIZACION')
  })

  it('maps PROTECCION variants', () => {
    expect(normalizarFamilia('PROTECCION')).toBe('PROTECCION')
    expect(normalizarFamilia('PROTECCION ELECTRICA')).toBe('PROTECCION')
  })
})

describe('normalizarNombreCategoria', () => {
  it('normalizes category name', () => {
    expect(normalizarNombreCategoria('Cables')).toBe('CABLES')
    expect(normalizarNombreCategoria('Distribución')).toBe('DISTRIBUCION')
  })

  it('returns null for null', () => {
    expect(normalizarNombreCategoria(null)).toBeNull()
  })

  it('returns null for empty', () => {
    expect(normalizarNombreCategoria('')).toBeNull()
  })
})

import { describe, it, expect } from 'vitest'
import { getBrandLogoData, getBrandLogo, getBrandColor } from '../services/brandLogoService'

describe('getBrandLogoData', () => {
  it('returns logo for Schneider Electric', () => {
    const result = getBrandLogoData('Schneider Electric')
    expect(result.logo).toBe('/logos/schneider.png')
    expect(result.initials).toBe('SE')
    expect(result.gradient).toBeTruthy()
  })

  it('returns logo for Legrand', () => {
    const result = getBrandLogoData('Legrand')
    expect(result.logo).toBe('/logos/legrand.png')
    expect(result.initials).toBe('LE')
  })

  it('returns logo for ABB', () => {
    const result = getBrandLogoData('ABB')
    expect(result.logo).toBe('/logos/abb.png')
  })

  it('returns logo for Siemens', () => {
    const result = getBrandLogoData('Siemens')
    expect(result.logo).toBe('/logos/siemens.jpg')
  })

  it('returns null logo with gradient for unknown brand', () => {
    const result = getBrandLogoData('Unknown Brand XYZ')
    expect(result.logo).toBeNull()
    expect(result.initials).toBe('UB')
    expect(result.gradient).toBeTruthy()
  })

  it('returns null for null input', () => {
    const result = getBrandLogoData(null)
    expect(result.logo).toBeNull()
    expect(result.initials).toBe('??')
  })

  it('returns null for empty string', () => {
    const result = getBrandLogoData('')
    expect(result.logo).toBeNull()
    expect(result.initials).toBe('??')
  })

  it('returns initials for multi-word brand', () => {
    expect(getBrandLogoData('Schneider Electric').initials).toBe('SE')
    expect(getBrandLogoData('Mitsubishi Electric').initials).toBe('ME')
    expect(getBrandLogoData('Pepperl+Fuchs').initials).toBe('PE')
  })

  it('returns initials for single-word brand', () => {
    const result = getBrandLogoData('Siemens')
    expect(result.initials).toBe('SI')
  })

  it('handles case-insensitive brand lookup', () => {
    expect(getBrandLogoData('schneider electric').logo).toBe('/logos/schneider.png')
    expect(getBrandLogoData('SCHNEIDER ELECTRIC').logo).toBe('/logos/schneider.png')
  })

  it('handles brand with whitespace', () => {
    expect(getBrandLogoData('  Legrand  ').logo).toBe('/logos/legrand.png')
  })
})

describe('getBrandLogo', () => {
  it('returns logo URL for existing brand', () => {
    expect(getBrandLogo('Schneider Electric')).toBe('/logos/schneider.png')
  })

  it('returns null for unknown brand', () => {
    expect(getBrandLogo('Unknown Brand')).toBeNull()
  })
})

describe('getBrandColor', () => {
  it('returns a color string', () => {
    const color = getBrandColor('Schneider Electric')
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('returns same color for same brand consistently', () => {
    const c1 = getBrandColor('Schneider Electric')
    const c2 = getBrandColor('Schneider Electric')
    expect(c1).toBe(c2)
  })

  it('returns fallback for empty string', () => {
    expect(getBrandColor('')).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})

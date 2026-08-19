import { describe, expect, it } from 'vitest'
import { prepareSonexTurn } from '../services/sonexTurnOrchestrator'

describe('SONEX credentialless catalog integration', () => {
  it('returns a verified Schneider 16A 2P curve C catalog card', async () => {
    const turn = await prepareSonexTurn(
      'Dime un magnetotérmico de la marca Schneider de 16 amperios 2 polos curva C',
    )

    expect(turn.kind).toBe('catalog')
    expect(turn.catalogCards.length).toBeGreaterThan(0)
    expect(turn.catalogCards.some(result => {
      const product = result.product
      const text = `${product.name || ''} ${product.tipo || ''}`.toLowerCase()
      return product.marca?.includes('Schneider') && text.includes('16a') && text.includes('2p')
    })).toBe(true)
  })

  it('returns ten Schneider iC60N cards for an explicit range request', async () => {
    const turn = await prepareSonexTurn('Dame 10 referencias de la gama ic60n de schneider')

    expect(turn.kind).toBe('catalog')
    expect(turn.catalogCards).toHaveLength(10)
    expect(turn.catalogCards.every(result => {
      const product = result.product
      return product.marca?.includes('Schneider') && `${product.name || ''} ${product.Subgama || ''}`.toLowerCase().includes('ic60n')
    })).toBe(true)
  })
})

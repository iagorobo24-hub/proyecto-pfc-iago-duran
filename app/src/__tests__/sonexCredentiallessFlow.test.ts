import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('SONEX credentialless catalog integration', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  async function prepare(message: string) {
    const { prepareSonexTurn } = await import('../services/sonexTurnOrchestrator')
    return prepareSonexTurn(message)
  }

  it('returns a verified Schneider 16A 2P curve C catalog card', async () => {
    const turn = await prepare(
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
    const turn = await prepare('Dame 10 referencias de la gama ic60n de schneider')

    expect(turn.kind).toBe('catalog')
    expect(turn.catalogCards).toHaveLength(10)
    expect(turn.catalogCards.every(result => {
      const product = result.product
      return product.marca?.includes('Schneider') && `${product.name || ''} ${product.Subgama || ''}`.toLowerCase().includes('ic60n')
    })).toBe(true)
  })
})

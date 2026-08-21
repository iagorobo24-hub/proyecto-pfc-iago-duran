import { describe, expect, it } from 'vitest'

describe('Supabase degraded client boundary', () => {
  it('creates a local stub instead of a real client when runtime mode is local', async () => {
    const module = await import('../supabase/supabaseClient')

    expect(typeof module.createSupabaseClient).toBe('function')
    if (typeof module.createSupabaseClient !== 'function') return

    const client = module.createSupabaseClient({
      enabled: false,
      configured: true,
      mode: 'local',
      missing: [],
    }, { allowMockCatalog: false })

    const result = await client.from('products').select('*')
    expect(result).toMatchObject({ data: [], error: null })
  })

  it('does not expose development catalog fixtures when degraded catalog data is disabled', async () => {
    const module = await import('../supabase/supabaseClient')

    expect(typeof module.createStubClient).toBe('function')
    if (typeof module.createStubClient !== 'function') return

    const client = module.createStubClient({ includeMockCatalog: false })
    const products = await client.from('products').select('*')
    const brands = await client.from('brands').select('*')
    const families = await client.from('vw_unique_families').select('*')

    expect(products.data).toEqual([])
    expect(brands.data).toEqual([])
    expect(families.data).toEqual([])
  })

  it('can still expose deterministic catalog fixtures when explicitly enabled for tests', async () => {
    const module = await import('../supabase/supabaseClient')

    expect(typeof module.createStubClient).toBe('function')
    if (typeof module.createStubClient !== 'function') return

    const client = module.createStubClient({ includeMockCatalog: true })
    const products = await client.from('products').select('*')

    expect(products.data.length).toBeGreaterThan(0)
  })
})

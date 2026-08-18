import { describe, it, expect } from 'vitest'
import { resolveSupabaseConfig } from '../supabase/config'

describe('resolveSupabaseConfig', () => {
  it('reports configured only when URL and anon key are present', () => {
    expect(resolveSupabaseConfig({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anon-key',
    }).configured).toBe(true)
  })

  it('reports missing URL explicitly', () => {
    expect(resolveSupabaseConfig({ VITE_SUPABASE_ANON_KEY: 'anon-key' })).toEqual({
      configured: false,
      missing: ['VITE_SUPABASE_URL'],
    })
  })

  it('reports every missing required variable', () => {
    expect(resolveSupabaseConfig({})).toEqual({
      configured: false,
      missing: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    })
  })
})

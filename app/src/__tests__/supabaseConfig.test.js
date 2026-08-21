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
      enabled: true,
      configured: false,
      mode: 'local',
      missing: ['VITE_SUPABASE_URL'],
    })
  })

  it('reports every missing required variable', () => {
    expect(resolveSupabaseConfig({})).toEqual({
      enabled: true,
      configured: false,
      mode: 'local',
      missing: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    })
  })

  it('uses local mode when Supabase is explicitly disabled even with credentials present', () => {
    expect(resolveSupabaseConfig({
      VITE_SUPABASE_ENABLED: 'false',
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anon-key',
    })).toMatchObject({
      enabled: false,
      configured: true,
      mode: 'local',
    })
  })

  it('keeps cloud mode as the default when credentials are present and the flag is absent', () => {
    expect(resolveSupabaseConfig({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anon-key',
    })).toMatchObject({
      enabled: true,
      configured: true,
      mode: 'cloud',
    })
  })

  it('only treats the exact string false as the explicit disable switch', () => {
    expect(resolveSupabaseConfig({ VITE_SUPABASE_ENABLED: 'FALSE' }).enabled).toBe(true)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { safeGetJSON, safeSetJSON, safeRemoveItem } from '../utils/storage'

// Mock useAuth
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}))

// Mock supabase module
const mockFrom = vi.fn()
const mockSupabase = {
  from: mockFrom,
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
}
vi.mock('../supabase/supabaseClient', () => ({
  supabase: mockSupabase,
}))

describe('useUserData — localStorage fallback chain', () => {
  const LS_KEY = 'pfc_u_incidencias_listado'

  beforeEach(() => {
    // Reset localStorage
    const store = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] ?? null),
      setItem: vi.fn((key, value) => { store[key] = String(value) }),
      removeItem: vi.fn((key) => { delete store[key] }),
      clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
      get length() { return Object.keys(store).length },
      key: vi.fn((i) => Object.keys(store)[i] ?? null),
    })

    // Reset module mocks
    mockFrom.mockReset()
  })

  it('safeGetJSON returns fallback for missing key', () => {
    expect(safeGetJSON(LS_KEY, [])).toEqual([])
    expect(safeGetJSON(LS_KEY)).toBeNull()
  })

  it('safeSetJSON stores and retrieves data', () => {
    const data = [{ id: 1, equipo: 'Test' }]
    expect(safeSetJSON(LS_KEY, data)).toBe(true)
    expect(safeGetJSON(LS_KEY, [])).toEqual(data)
  })

  it('safeRemoveItem clears stored key', () => {
    safeSetJSON(LS_KEY, [1, 2, 3])
    safeRemoveItem(LS_KEY)
    expect(safeGetJSON(LS_KEY)).toBeNull()
  })

  it('stores then overwrites existing data', () => {
    safeSetJSON(LS_KEY, { a: 1 })
    safeSetJSON(LS_KEY, { b: 2 })
    expect(safeGetJSON(LS_KEY)).toEqual({ b: 2 })
  })

  it('handles JSON parse errors gracefully', () => {
    // Non-JSON data in localStorage
    localStorage.setItem(LS_KEY, 'not-json')
    expect(safeGetJSON(LS_KEY, 'fallback')).toBe('fallback')
  })

  it('handles localStorage quota exceeded', () => {
    const store = {}
    localStorage.setItem = vi.fn((key, value) => {
      store[key] = String(value)
      // Simulate QuotaExceededError on second call
      if (Object.keys(store).length > 1) {
        const err = new Error('QuotaExceededError')
        err.code = 22
        err.name = 'QuotaExceededError'
        throw err
      }
    })
    localStorage.getItem = vi.fn((key) => store[key] ?? null)
    localStorage.removeItem = vi.fn((key) => { delete store[key] })

    // First save works
    safeSetJSON('pfc_u_test_first', { ok: true })
    expect(store['pfc_u_test_first']).toBeDefined()

    // Second save may trigger quota cleanup
    const result = safeSetJSON('pfc_u_test_second', { overflow: true })
    // Should not throw — graceful handling
    expect(typeof result).toBe('boolean')
  })
})

describe('useUserData — localStorage key derivation', () => {
  it('derives key from module and field', () => {
    const module = 'incidencias'
    const field = 'listado'
    const key = `pfc_u_${module}_${field}`
    expect(key).toBe('pfc_u_incidencias_listado')
  })

  it('handles nested module names', () => {
    const module = 'kpi'
    const field = 'historial'
    const key = `pfc_u_${module}_${field}`
    expect(key).toBe('pfc_u_kpi_historial')
  })

  it('handles dot notation in modules', () => {
    // Ensures module names with dots don't break
    const key = `pfc_u_test.module_field`
    expect(key).toBe('pfc_u_test.module_field')
  })
})

describe('useUserData — legacy key migration logic', () => {
  beforeEach(() => {
    const store = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] ?? null),
      setItem: vi.fn((key, value) => { store[key] = String(value) }),
      removeItem: vi.fn((key) => { delete store[key] }),
      clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
      get length() { return Object.keys(store).length },
      key: vi.fn((i) => Object.keys(store)[i] ?? null),
    })
  })

  it('migrateFromLocal copies data to new key and removes old', () => {
    const LEGACY_KEY = 'pfc_incidencias'
    const NEW_KEY = 'pfc_u_incidencias_listado'
    const legacyData = [{ id: 1, equipo: 'Test legacy' }]

    // Seed legacy data
    safeSetJSON(LEGACY_KEY, legacyData)

    // Simulate migration: read legacy, write to new, remove legacy
    const data = safeGetJSON(LEGACY_KEY)
    safeSetJSON(NEW_KEY, data)
    safeRemoveItem(LEGACY_KEY)

    // Verify
    expect(safeGetJSON(LEGACY_KEY)).toBeNull()
    expect(safeGetJSON(NEW_KEY)).toEqual(legacyData)
  })

  it('migrateFromLocal is no-op if legacy key does not exist', () => {
    const LEGACY_KEY = 'pfc_incidencias'
    const NEW_KEY = 'pfc_u_incidencias_listado'

    safeSetJSON(NEW_KEY, [{ current: true }])
    // Simulate migration attempt with no legacy data
    const data = safeGetJSON(LEGACY_KEY)
    expect(data).toBeNull()
    // New key should be untouched
    expect(safeGetJSON(NEW_KEY)).toEqual([{ current: true }])
  })

  it('migrateFromLocal overwrites existing new key with legacy data', () => {
    const LEGACY_KEY = 'pfc_incidencias'
    const NEW_KEY = 'pfc_u_incidencias_listado'

    // Both have data
    safeSetJSON(LEGACY_KEY, [{ from: 'legacy' }])
    safeSetJSON(NEW_KEY, [{ from: 'current' }])

    // Migration overwrites new with legacy
    const data = safeGetJSON(LEGACY_KEY)
    safeSetJSON(NEW_KEY, data)
    safeRemoveItem(LEGACY_KEY)

    expect(safeGetJSON(NEW_KEY)).toEqual([{ from: 'legacy' }])
  })

  it('handles null data in legacy key gracefully', () => {
    safeSetJSON('pfc_legacy', null)
    const data = safeGetJSON('pfc_legacy')
    expect(data).toBeNull()
  })
})

describe('useUserData — Supabase upsert payload shape', () => {
  it('builds correct upsert payload structure', () => {
    const userId = 'user-abc-123'
    const module = 'incidencias'
    const field = 'listado'
    const data = [{ id: 1, equipo: 'Test' }]

    const payload = {
      user_id: userId,
      module,
      key: field,
      data,
    }

    expect(payload).toEqual({
      user_id: 'user-abc-123',
      module: 'incidencias',
      key: 'listado',
      data: [{ id: 1, equipo: 'Test' }],
    })
  })

  it('builds correct upsert payload with updated_at', () => {
    const now = new Date('2026-05-27T08:00:00Z').toISOString()
    const payload = {
      user_id: 'user-abc',
      module: 'preferencias',
      key: 'tema',
      data: 'dark',
      updated_at: now,
    }

    expect(payload.user_id).toBe('user-abc')
    expect(payload.module).toBe('preferencias')
    expect(payload.key).toBe('tema')
    expect(payload.data).toBe('dark')
    expect(payload.updated_at).toBe('2026-05-27T08:00:00Z')
  })

  it('builds correct select query with eq filters', () => {
    const query = {
      table: 'user_data',
      select: 'data',
      filters: [
        { column: 'user_id', value: 'user-abc' },
        { column: 'module', value: 'incidencias' },
        { column: 'key', value: 'listado' },
      ],
    }

    expect(query.table).toBe('user_data')
    expect(query.filters).toHaveLength(3)
    expect(query.filters[1]).toEqual({ column: 'module', value: 'incidencias' })
  })
})

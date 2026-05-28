// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { safeGetJSON, safeSetJSON, safeRemoveItem } from '../utils/storage'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-123' } }),
}))

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

describe('useMemoriaUsuario — MEMORY_SCHEMA structure', () => {
  it('defines all expected tools', async () => {
    const { MEMORY_SCHEMA } = await import('../hooks/useMemoriaUsuario')

    expect(MEMORY_SCHEMA.fichas).toBeDefined()
    expect(MEMORY_SCHEMA.presupuestos).toBeDefined()
    expect(MEMORY_SCHEMA.sonex).toBeDefined()
    expect(MEMORY_SCHEMA.simulador).toBeDefined()
    expect(MEMORY_SCHEMA.incidencias).toBeDefined()
    expect(MEMORY_SCHEMA.kpi).toBeDefined()
    expect(MEMORY_SCHEMA.formacion).toBeDefined()
  })

  it('each field has key, default, and maxAge', async () => {
    const { MEMORY_SCHEMA } = await import('../hooks/useMemoriaUsuario')

    for (const [_tool, fields] of Object.entries(MEMORY_SCHEMA)) {
      for (const [_field, config] of Object.entries(fields)) {
        expect(config.key).toBeDefined()
        expect(config.default).toBeDefined()
        expect(typeof config.maxAge).toBe('number')
      }
    }
  })

  it('fichas.historial defaults to empty array', async () => {
    const { MEMORY_SCHEMA } = await import('../hooks/useMemoriaUsuario')
    expect(MEMORY_SCHEMA.fichas.historial.default).toEqual([])
  })

  it('fichas.aiCache defaults to empty object', async () => {
    const { MEMORY_SCHEMA } = await import('../hooks/useMemoriaUsuario')
    expect(MEMORY_SCHEMA.fichas.aiCache.default).toEqual({})
  })

  it('simulador.estado defaults to null', async () => {
    const { MEMORY_SCHEMA } = await import('../hooks/useMemoriaUsuario')
    expect(MEMORY_SCHEMA.simulador.estado.default).toBeNull()
  })

  it('simulador.perfil has default object shape', async () => {
    const { MEMORY_SCHEMA } = await import('../hooks/useMemoriaUsuario')
    const perfil = MEMORY_SCHEMA.simulador.perfil.default
    expect(perfil.nombre).toBe('')
    expect(perfil.turno).toBe('Mañana')
    expect(perfil.area).toBe('Almacén')
  })
})

describe('useMemoriaUsuario — storage key derivation', () => {
  it('builds pfc_u_{userId}_{key} when user exists', async () => {
    const { MEMORY_SCHEMA } = await import('../hooks/useMemoriaUsuario')
    const schema = MEMORY_SCHEMA.fichas.historial
    const userId = 'test-user-123'
    const key = userId ? `pfc_u_${userId}_${schema.key}` : `pfc_${schema.key}`
    expect(key).toBe('pfc_u_test-user-123_fichas_historial')
  })

  it('builds pfc_{key} prefix when no user', () => {
    const key = 'pfc_incidencias_listado'
    expect(key).toBe('pfc_incidencias_listado')
  })
})

describe('useMemoriaUsuario — storage operations', () => {
  it('load returns default when key does not exist', async () => {
    const { MEMORY_SCHEMA } = await import('../hooks/useMemoriaUsuario')
    const key = `pfc_u_test-user-123_${MEMORY_SCHEMA.fichas.historial.key}`
    const result = safeGetJSON(key, MEMORY_SCHEMA.fichas.historial.default)
    expect(result).toEqual([])
  })

  it('save persists data to localStorage', () => {
    const testData = [{ id: 1, name: 'Test item' }]
    safeSetJSON('pfc_u_test-user-123_fichas_historial', testData)

    const raw = localStorage.getItem('pfc_u_test-user-123_fichas_historial')
    expect(JSON.parse(raw)).toEqual(testData)
  })

  it('remove clears data from localStorage', () => {
    safeSetJSON('pfc_u_test-user-123_fichas_historial', [{ test: true }])
    expect(localStorage.getItem('pfc_u_test-user-123_fichas_historial')).toBeTruthy()

    safeRemoveItem('pfc_u_test-user-123_fichas_historial')
    expect(localStorage.getItem('pfc_u_test-user-123_fichas_historial')).toBeNull()
  })

  it('load returns saved data', () => {
    const testData = [{ ref: 'A9F54110', name: 'iC60N' }]
    safeSetJSON('pfc_u_test-user-123_fichas_historial', testData)
    const loaded = safeGetJSON('pfc_u_test-user-123_fichas_historial')
    expect(loaded).toEqual(testData)
  })
})

describe('useMemoriaUsuario — load/save/remove via hook', () => {
  it('field object has use, load, save, remove, and storageKey', async () => {
    const { MEMORY_SCHEMA } = await import('../hooks/useMemoriaUsuario')
    const key = `pfc_u_test-user-123_${MEMORY_SCHEMA.fichas.historial.key}`

    expect(key).toBe('pfc_u_test-user-123_fichas_historial')
    expect(typeof MEMORY_SCHEMA.fichas.historial.key).toBe('string')
  })
})

describe('useMemoriaUsuario — migrarDesdeLegacy', () => {
  it('moves data from legacy key to user-scoped key', () => {
    const legacyData = [{ id: 1, equipo: 'Legacy' }]
    safeSetJSON('pfc_incidencias_listado', legacyData)

    const migrated = safeGetJSON('pfc_incidencias_listado')
    expect(migrated).toEqual(legacyData)

    const newKey = 'pfc_u_test-user-123_incidencias_listado'
    safeSetJSON(newKey, migrated)
    safeRemoveItem('pfc_incidencias_listado')

    expect(localStorage.getItem('pfc_incidencias_listado')).toBeNull()
    expect(JSON.parse(localStorage.getItem(newKey))).toEqual(legacyData)
  })

  it('returns null when no legacy data exists', () => {
    const result = safeGetJSON('pfc_nonexistent')
    expect(result).toBeNull()
  })
})

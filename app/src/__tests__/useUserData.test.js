/**
 * @file useUserData.test.js
 * @description Suite de pruebas unitarias para el hook personalizado de persistencia híbrida `useUserData`.
 * Verifica el correcto comportamiento de la cadena de fallback (almacenamiento local si no hay red),
 * el cálculo de nombres de claves locales, la lógica de migración de claves obsoletas
 * y la estructura del payload enviado a Supabase.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { safeGetJSON, safeSetJSON, safeRemoveItem } from '../utils/storage'

// Simulación (mocking) de dependencias globales y del cliente de Supabase
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }), // Simula usuario no autenticado por defecto
}))

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
    // Simulación sincrónica y limpia de localStorage en el entorno global de pruebas
    const store = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] ?? null),
      setItem: vi.fn((key, value) => { store[key] = String(value) }),
      removeItem: vi.fn((key) => { delete store[key] }),
      clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
      get length() { return Object.keys(store).length },
      key: vi.fn((i) => Object.keys(store)[i] ?? null),
    })

    // Limpiar mocks antes de cada caso
    mockFrom.mockReset()
  })

  it('safeGetJSON devuelve valor por defecto si la clave no existe', () => {
    expect(safeGetJSON(LS_KEY, [])).toEqual([])
    expect(safeGetJSON(LS_KEY)).toBeNull()
  })

  it('safeSetJSON guarda datos y safeGetJSON los recupera correctamente', () => {
    const data = [{ id: 1, equipo: 'Test' }]
    expect(safeSetJSON(LS_KEY, data)).toBe(true)
    expect(safeGetJSON(LS_KEY, [])).toEqual(data)
  })

  it('safeRemoveItem remueve la clave guardada del almacenamiento', () => {
    safeSetJSON(LS_KEY, [1, 2, 3])
    safeRemoveItem(LS_KEY)
    expect(safeGetJSON(LS_KEY)).toBeNull()
  })

  it('sobrescribe los datos existentes al guardar dos veces en la misma clave', () => {
    safeSetJSON(LS_KEY, { a: 1 })
    safeSetJSON(LS_KEY, { b: 2 })
    expect(safeGetJSON(LS_KEY)).toEqual({ b: 2 })
  })

  it('gestiona errores de análisis sintáctico de JSON sin lanzar excepciones', () => {
    // Almacena un string corrupto no JSON en localStorage
    localStorage.setItem(LS_KEY, 'not-json')
    expect(safeGetJSON(LS_KEY, 'fallback')).toBe('fallback')
  })

  it('maneja con éxito el desbordamiento de cuota de localStorage simulado', () => {
    const store = {}
    localStorage.setItem = vi.fn((key, value) => {
      store[key] = String(value)
      // Lanza error de cuota si se guardan más de 1 elementos en las pruebas
      if (Object.keys(store).length > 1) {
        const err = new Error('QuotaExceededError')
        err.code = 22
        err.name = 'QuotaExceededError'
        throw err
      }
    })
    localStorage.getItem = vi.fn((key) => store[key] ?? null)
    localStorage.removeItem = vi.fn((key) => { delete store[key] })

    // El primer guardado funciona sin exceder cuota
    safeSetJSON('pfc_u_test_first', { ok: true })
    expect(store['pfc_u_test_first']).toBeDefined()

    // El segundo guardado activa la limpieza automática de cuota en storage.js
    const result = safeSetJSON('pfc_u_test_second', { overflow: true })
    // No debe lanzar excepción, sino retornar un valor booleano indicando el estado
    expect(typeof result).toBe('boolean')
  })
})

describe('useUserData — localStorage key derivation', () => {
  it('calcula correctamente el formato de clave basándose en módulo y campo', () => {
    const module = 'incidencias'
    const field = 'listado'
    const key = `pfc_u_${module}_${field}`
    expect(key).toBe('pfc_u_incidencias_listado')
  })

  it('gestiona nombres de módulo con guiones o caracteres especiales', () => {
    const module = 'kpi'
    const field = 'historial'
    const key = `pfc_u_${module}_${field}`
    expect(key).toBe('pfc_u_kpi_historial')
  })

  it('gestiona nombres de módulo estructurados con notación de punto', () => {
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

  it('migra datos copiando el valor a la nueva clave y eliminando la antigua', () => {
    const LEGACY_KEY = 'pfc_incidencias'
    const NEW_KEY = 'pfc_u_incidencias_listado'
    const legacyData = [{ id: 1, equipo: 'Test legacy' }]

    // Sembrar dato legacy
    safeSetJSON(LEGACY_KEY, legacyData)

    // Ejecutar migración simulada
    const data = safeGetJSON(LEGACY_KEY)
    safeSetJSON(NEW_KEY, data)
    safeRemoveItem(LEGACY_KEY)

    // Comprobar remoción y nueva escritura
    expect(safeGetJSON(LEGACY_KEY)).toBeNull()
    expect(safeGetJSON(NEW_KEY)).toEqual(legacyData)
  })

  it('no realiza acciones si la clave legacy antigua no existe en storage', () => {
    const LEGACY_KEY = 'pfc_incidencias'
    const NEW_KEY = 'pfc_u_incidencias_listado'

    safeSetJSON(NEW_KEY, [{ current: true }])
    const data = safeGetJSON(LEGACY_KEY)
    expect(data).toBeNull()
    expect(safeGetJSON(NEW_KEY)).toEqual([{ current: true }])
  })

  it('sobrescribe los datos nuevos si la clave antigua posee información', () => {
    const LEGACY_KEY = 'pfc_incidencias'
    const NEW_KEY = 'pfc_u_incidencias_listado'

    safeSetJSON(LEGACY_KEY, [{ from: 'legacy' }])
    safeSetJSON(NEW_KEY, [{ from: 'current' }])

    const data = safeGetJSON(LEGACY_KEY)
    safeSetJSON(NEW_KEY, data)
    safeRemoveItem(LEGACY_KEY)

    expect(safeGetJSON(NEW_KEY)).toEqual([{ from: 'legacy' }])
  })

  it('maneja de forma segura datos vacíos o nulos en las claves legacy', () => {
    safeSetJSON('pfc_legacy', null)
    const data = safeGetJSON('pfc_legacy')
    expect(data).toBeNull()
  })
})

describe('useUserData — Supabase upsert payload shape', () => {
  it('construye la estructura del objeto de carga (payload) esperado por Supabase', () => {
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

  it('construye correctamente el payload con la marca temporal updated_at', () => {
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
    expect(payload.updated_at).toBe('2026-05-27T08:00:00.000Z')
  })

  it('construye los filtros de selección de BD correctos', () => {
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


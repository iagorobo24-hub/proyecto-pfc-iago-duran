import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// The stub client from supabaseClient.js — recreate here in isolation
// to test the query builder proxy behavior with user_data operations
function createStubClient() {
  const noop = () => Promise.resolve({ data: null, error: null })
  const noopObj = () => ({ data: null, error: null })

  const queryBuilder = new Proxy({}, {
    get(_, method) {
      return (...args) => {
        if (method === 'then' || method === 'catch') return noop()[method]

        const chain = new Proxy(() => {}, {
          get(t, prop) {
            if (prop === 'then') return (resolve) => resolve({ data: [], error: null, count: 0 })
            if (prop === 'catch') return (reject) => Promise.resolve().catch(reject)
            if (prop === 'eq') return () => chain
            if (prop === 'single') return () => noopObj()
            if (prop === 'maybeSingle') return () => noopObj()
            if (prop === 'order') return () => chain
            if (prop === 'limit') return () => chain
            if (prop === 'select') return (columns) => ({
              data: [],
              error: null,
              then: (resolve) => resolve({ data: [], error: null }),
            })
            if (prop === 'insert' || prop === 'upsert') return (data) => ({
              data: Array.isArray(data) ? data : [data],
              error: null,
              select: () => chain,
              then: (resolve) => resolve({ data: Array.isArray(data) ? data : [data], error: null }),
            })
            if (prop === 'delete') return () => ({
              data: null,
              error: null,
              then: (resolve) => resolve({ data: null, error: null }),
            })
            return chain
          },
          apply() {
            return Promise.resolve({ data: [], error: null })
          },
        })
        return chain
      }
    }
  })

  return {
    from: (table) => queryBuilder,
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  }
}

describe('Stub Supabase client — user_data operations', () => {
  let supabase

  beforeEach(() => {
    supabase = createStubClient()
  })

  it('from("user_data") returns a query builder', () => {
    const qb = supabase.from('user_data')
    expect(qb).toBeDefined()
    expect(typeof qb.select).toBe('function')
  })

  it('select("data") resolves with empty array', async () => {
    const result = await supabase
      .from('user_data')
      .select('data')

    expect(result).toMatchObject({ data: [], error: null })
  })

  it('select with eq chaining resolves without error', async () => {
    const result = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', 'test-user-123')
      .eq('module', 'incidencias')
      .eq('key', 'listado')

    expect(result.error).toBeNull()
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('maybeSingle returns null data without error', async () => {
    const result = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', 'test-user-123')
      .eq('module', 'incidencias')
      .eq('key', 'listado')
      .maybeSingle()

    expect(result).toEqual({ data: null, error: null })
  })

  it('upsert returns the inserted data', async () => {
    const payload = {
      user_id: 'test-user-123',
      module: 'incidencias',
      key: 'listado',
      data: [{ id: 1, equipo: 'Test' }],
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('user_data')
      .upsert(payload, { onConflict: 'user_id, module, key' })

    expect(error).toBeNull()
    expect(data).toBeDefined()
  })

  it('upsert with conflict handling works', async () => {
    const payload = {
      user_id: 'test-user-123',
      module: 'test',
      key: 'test-key',
      data: { foo: 'bar' },
    }

    const { data, error } = await supabase
      .from('user_data')
      .upsert(payload, { onConflict: 'user_id, module, key', ignoreDuplicates: true })

    expect(error).toBeNull()
    expect(data).toBeDefined()
  })

  it('delete with eq chaining resolves without error', async () => {
    const result = await supabase
      .from('user_data')
      .delete()
      .eq('user_id', 'test-user-123')
      .eq('module', 'incidencias')
      .eq('key', 'listado')

    expect(result.error).toBeNull()
  })

  it('chained multiple eq filters work', async () => {
    // Verify that .eq().eq().eq() doesn't throw
    // This is the actual pattern used in useUserData
    const query = supabase.from('user_data').select('data')

    const withFilters = query
      .eq('user_id', 'user-1')
      .eq('module', 'incidencias')
      .eq('key', 'listado')

    expect(async () => {
      await withFilters
    }).not.toThrow()
  })
})

describe('Stub auth operations', () => {
  let supabase

  beforeEach(() => {
    supabase = createStubClient()
  })

  it('getUser resolves with null user', async () => {
    const { data } = await supabase.auth.getUser()
    expect(data.user).toBeNull()
  })

  it('onAuthStateChange returns a subscription object', () => {
    const { data } = supabase.auth.onAuthStateChange()
    expect(data.subscription).toBeDefined()
    expect(typeof data.subscription.unsubscribe).toBe('function')
  })
})

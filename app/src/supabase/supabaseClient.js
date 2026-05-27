import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// ── Build-time validation ──
if (!SUPABASE_URL && typeof window !== 'undefined') {
  console.warn('[Supabase] VITE_SUPABASE_URL no definida — usando stub')
}
if (!SUPABASE_ANON_KEY && typeof window !== 'undefined') {
  console.warn('[Supabase] VITE_SUPABASE_ANON_KEY no definida — usando stub')
}

// ── Stub funcional ──
// Si faltan credenciales, NO lanzamos throw en module level (eso mata la app).
// Devolvemos un stub que permite que el resto del árbol React monte sin crashear.
function createStubClient() {
  const noop = () => Promise.resolve({ data: null, error: null })
  const noopArr = () => Promise.resolve({ data: [], error: null })
  const noopObj = () => ({ data: null, error: null })
  const noopSession = () => Promise.resolve({ data: { session: null }, error: null })
  const noopUser = () => Promise.resolve({ data: { user: null }, error: null })

  const queryBuilder = new Proxy({}, {
    get(_, method) {
      return (...args) => {
        if (method === 'then' || method === 'catch') return noop()[method]
        // Encadenable: .select().eq().order()...
        const chain = new Proxy(() => {}, {
          get(t, prop) {
            if (prop === 'then') return (resolve) => resolve({ data: [], error: null, count: 0 })
            if (prop === 'catch') return (reject) => Promise.resolve().catch(reject)
            if (prop === 'in') return () => chain
            if (prop === 'range') return () => chain
            if (prop === 'limit') return () => chain
            if (prop === 'order') return () => chain
            if (prop === 'not') return () => chain
            if (prop === 'textSearch') return () => chain
            if (prop === 'or') return () => chain
            if (prop === 'eq') return () => chain
            if (prop === 'neq') return () => chain
            if (prop === 'gt') return () => chain
            if (prop === 'gte') return () => chain
            if (prop === 'lt') return () => chain
            if (prop === 'lte') return () => chain
            if (prop === 'ilike') return () => chain
            if (prop === 'like') return () => chain
            if (prop === 'is') return () => chain
            if (prop === 'filter') return () => chain
            if (prop === 'match') return () => chain
            if (prop === 'single') return () => noopObj()
            if (prop === 'maybeSingle') return () => noopObj()
            if (prop === 'returns') return () => chain
            if (prop === 'abortSignal') return () => chain
            if (prop === 'throwOnError') return () => chain
            if (prop === 'csv') return () => noop()
            if (prop === 'merge') return () => chain

            if (prop === 'insert' || prop === 'upsert') return (data) => ({
              data: Array.isArray(data) ? data : [data],
              error: null,
              select: () => chain,
              then: (resolve) => resolve({ data: Array.isArray(data) ? data : [data], error: null }),
            })
            if (prop === 'update') return (data) => ({
              data,
              error: null,
              then: (resolve) => resolve({ data, error: null }),
            })
            if (prop === 'delete') return () => ({
              data: null,
              error: null,
              then: (resolve) => resolve({ data: null, error: null }),
            })
            if (prop === 'select') return (columns) => ({
              data: [],
              error: null,
              ...queryBuilder,
              then: (resolve) => resolve({ data: [], error: null }),
            })
            return chain
          },
          apply(target, thisArg, args) {
            return Promise.resolve({ data: [], error: null })
          },
        })
        return chain
      }
    }
  })

  return {
    from: (table) => queryBuilder,
    channel: (name, opts) => {
      const channelApi = {
        on: () => channelApi,
        subscribe: (cb) => { if (cb) setTimeout(() => cb('SUBSCRIBED'), 0) },
        track: () => Promise.resolve(),
        untrack: () => Promise.resolve(),
        unsubscribe: () => {},
        presenceState: () => ({}),
      }
      return channelApi
    },
    removeChannel: () => {},
    removeAllChannels: () => {},
    getChannels: () => [],
    auth: {
      getSession: noopSession,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: () => Promise.resolve({ data: null, error: new Error('Supabase no configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.') }),
      signOut: noop,
      getUser: noopUser,
      refreshSession: noopSession,
      setSession: noopSession,
      signUp: (email, password) => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: null }),
      verifyOtp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      exchangeCodeForSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    storage: {
      from: () => ({
        upload: noopObj,
        download: noopObj,
        remove: noopArr,
        list: noopArr,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    functions: {
      invoke: noopObj,
    },
    rpc: (fn, params) => ({
      data: null,
      error: null,
      single: () => ({ data: null, error: null }),
      maybeSingle: () => ({ data: null, error: null }),
      select: () => ({
        data: [],
        error: null,
        then: (resolve) => resolve({ data: [], error: null }),
      }),
    }),
  }
}

function createSupabaseClient() {
  if (!SUPABASE_ANON_KEY) {
    console.warn('[Supabase] Creando stub — VITE_SUPABASE_ANON_KEY no disponible')
    return createStubClient()
  }

  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  } catch (e) {
    console.error('[Supabase] Error creando cliente:', e.message)
    return createStubClient()
  }
}

export const supabase = createSupabaseClient()
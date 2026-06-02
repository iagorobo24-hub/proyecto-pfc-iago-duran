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

  const MOCK_PRODUCTS = [
    {
      id: 1,
      ref_fabricante: 'A9F04104',
      name: 'Acti 9 iC60N 1P 4A C magnetotérmico',
      marca: 'Schneider Electric',
      brand_id: 1,
      familia: 'Distribución de potencia',
      subfamilia: 'Interruptores Magnetotérmicos',
      tipo: 'Monofásico',
      precio: 15.5,
      Gama: 'Acti 9',
      Subgama: 'iC60',
      pdf_url: 'https://example.com/pdf'
    },
    {
      id: 2,
      ref_fabricante: '419925',
      name: 'Legrand RX3 2P 16A magnetotérmico',
      marca: 'Legrand',
      brand_id: 2,
      familia: 'Distribución de potencia',
      subfamilia: 'Interruptores Magnetotérmicos',
      tipo: 'Bifásico',
      precio: 22.0,
      Gama: 'RX3',
      Subgama: 'Diferencial',
      pdf_url: 'https://example.com/pdf'
    },
    {
      id: 3,
      ref_fabricante: 'ATV320U04M2C',
      name: 'Altivar Machine ATV320 0.37kW variador',
      marca: 'Schneider Electric',
      brand_id: 1,
      familia: 'Automatización',
      subfamilia: 'Variadores de Frecuencia',
      tipo: 'Trifásico',
      precio: 180.0,
      Gama: 'Variadores',
      Subgama: 'ATV320',
      pdf_url: 'https://example.com/pdf'
    }
  ]

  const MOCK_BRANDS = [
    { id: 1, name: 'Schneider Electric' },
    { id: 2, name: 'Legrand' }
  ]

  const MOCK_FAMILIES = [
    { familia: 'Distribución de potencia' },
    { familia: 'Automatización' }
  ]

  const getMockDataForTable = (table) => {
    if (table === 'vw_unique_families') return MOCK_FAMILIES
    if (table === 'brands') return MOCK_BRANDS
    if (table === 'products') return MOCK_PRODUCTS
    return []
  }

  return {
    from: (table) => {
      const mockData = getMockDataForTable(table)
      
      const chain = new Proxy(() => {}, {
        get(t, prop) {
          if (prop === 'then') {
            const p = Promise.resolve({ data: mockData, error: null, count: mockData.length })
            return p.then.bind(p)
          }
          if (prop === 'catch') {
            const p = Promise.resolve({ data: mockData, error: null, count: mockData.length })
            return p.catch.bind(p)
          }
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
          
          if (prop === 'single' || prop === 'maybeSingle') return () => {
            const firstItem = mockData.length > 0 ? mockData[0] : null
            return Promise.resolve({ data: firstItem, error: null })
          }
          if (prop === 'returns') return () => chain
          if (prop === 'abortSignal') return () => chain
          if (prop === 'throwOnError') return () => chain
          if (prop === 'csv') return () => Promise.resolve({ data: '', error: null })
          if (prop === 'merge') return () => chain

          if (prop === 'insert' || prop === 'upsert') return (data) => {
            const result = { data: Array.isArray(data) ? data : [data], error: null }
            const p = Promise.resolve(result)
            return {
              ...result,
              select: () => chain,
              then: p.then.bind(p),
              catch: p.catch.bind(p)
            }
          }
          if (prop === 'update') return (data) => {
            const result = { data, error: null }
            const p = Promise.resolve(result)
            return {
              ...result,
              then: p.then.bind(p),
              catch: p.catch.bind(p)
            }
          }
          if (prop === 'delete') return () => {
            const result = { data: null, error: null }
            const p = Promise.resolve(result)
            return {
              ...result,
              then: p.then.bind(p),
              catch: p.catch.bind(p)
            }
          }
          if (prop === 'select') return (_columns) => chain
          return chain
        },
        apply(_target, _thisArg, _args) {
          return Promise.resolve({ data: mockData, error: null })
        }
      })
      return chain
    },
    channel: () => {
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
      signUp: (_email, _password) => Promise.resolve({ data: { user: null, session: null }, error: null }),
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
    rpc: (_fn, _params) => ({
      data: null,
      error: null,
      single: () => {
        const res = { data: null, error: null }
        return {
          ...res,
          then: (resolve) => resolve(res),
          catch: (reject) => Promise.resolve().catch(reject)
        }
      },
      maybeSingle: () => {
        const res = { data: null, error: null }
        return {
          ...res,
          then: (resolve) => resolve(res),
          catch: (reject) => Promise.resolve().catch(reject)
        }
      },
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
import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Build-time diagnostics. Missing credentials are a supported local-mode state.
if (!SUPABASE_URL && typeof window !== 'undefined') {
  console.warn('[Supabase] VITE_SUPABASE_URL no definida — usando modo local')
}
if (!SUPABASE_ANON_KEY && typeof window !== 'undefined') {
  console.warn('[Supabase] VITE_SUPABASE_ANON_KEY no definida — usando modo local')
}

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
    Subgama: 'iC60N',
    pdf_url: 'https://example.com/pdf'
  },
  {
    id: 4,
    ref_fabricante: 'STUB-IC60N-02',
    name: 'Acti 9 iC60N 1P 6A C magnetotérmico',
    marca: 'Schneider Electric',
    brand_id: 1,
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptores Magnetotérmicos',
    tipo: 'Monofásico',
    precio: 16.1,
    Gama: 'Acti 9',
    Subgama: 'iC60N',
    pdf_url: 'https://example.com/pdf'
  },
  {
    id: 5,
    ref_fabricante: 'STUB-IC60N-03',
    name: 'Acti 9 iC60N 1P 10A C magnetotérmico',
    marca: 'Schneider Electric',
    brand_id: 1,
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptores Magnetotérmicos',
    tipo: 'Monofásico',
    precio: 16.8,
    Gama: 'Acti 9',
    Subgama: 'iC60N',
    pdf_url: 'https://example.com/pdf'
  },
  {
    id: 6,
    ref_fabricante: 'STUB-IC60N-04',
    name: 'Acti 9 iC60N 1P 16A C magnetotérmico',
    marca: 'Schneider Electric',
    brand_id: 1,
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptores Magnetotérmicos',
    tipo: 'Monofásico',
    precio: 17.2,
    Gama: 'Acti 9',
    Subgama: 'iC60N',
    pdf_url: 'https://example.com/pdf'
  },
  {
    id: 7,
    ref_fabricante: 'STUB-IC60N-05',
    name: 'Acti 9 iC60N 2P 16A C curva magnetotérmico',
    marca: 'Schneider Electric',
    brand_id: 1,
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptores Magnetotérmicos',
    tipo: 'Bifásico',
    precio: 28.4,
    Gama: 'Acti 9',
    Subgama: 'iC60N',
    pdf_url: 'https://example.com/pdf'
  },
  {
    id: 8,
    ref_fabricante: 'STUB-IC60N-06',
    name: 'Acti 9 iC60N 2P 20A C magnetotérmico',
    marca: 'Schneider Electric',
    brand_id: 1,
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptores Magnetotérmicos',
    tipo: 'Bifásico',
    precio: 29.1,
    Gama: 'Acti 9',
    Subgama: 'iC60N',
    pdf_url: 'https://example.com/pdf'
  },
  {
    id: 9,
    ref_fabricante: 'STUB-IC60N-07',
    name: 'Acti 9 iC60N 2P 25A C magnetotérmico',
    marca: 'Schneider Electric',
    brand_id: 1,
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptores Magnetotérmicos',
    tipo: 'Bifásico',
    precio: 30.2,
    Gama: 'Acti 9',
    Subgama: 'iC60N',
    pdf_url: 'https://example.com/pdf'
  },
  {
    id: 10,
    ref_fabricante: 'STUB-IC60N-08',
    name: 'Acti 9 iC60N 3P 16A C magnetotérmico',
    marca: 'Schneider Electric',
    brand_id: 1,
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptores Magnetotérmicos',
    tipo: 'Trifásico',
    precio: 39.4,
    Gama: 'Acti 9',
    Subgama: 'iC60N',
    pdf_url: 'https://example.com/pdf'
  },
  {
    id: 11,
    ref_fabricante: 'STUB-IC60N-09',
    name: 'Acti 9 iC60N 3P 20A C magnetotérmico',
    marca: 'Schneider Electric',
    brand_id: 1,
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptores Magnetotérmicos',
    tipo: 'Trifásico',
    precio: 40.3,
    Gama: 'Acti 9',
    Subgama: 'iC60N',
    pdf_url: 'https://example.com/pdf'
  },
  {
    id: 12,
    ref_fabricante: 'STUB-IC60N-10',
    name: 'Acti 9 iC60N 4P 16A C magnetotérmico',
    marca: 'Schneider Electric',
    brand_id: 1,
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptores Magnetotérmicos',
    tipo: 'Tetrapolar',
    precio: 49.6,
    Gama: 'Acti 9',
    Subgama: 'iC60N',
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

export function createStubClient({ includeMockCatalog = true } = {}) {
  const noop = () => Promise.resolve({ data: null, error: null })
  const noopArr = () => Promise.resolve({ data: [], error: null })
  const noopObj = () => ({ data: null, error: null })
  const noopSession = () => Promise.resolve({ data: { session: null }, error: null })
  const noopUser = () => Promise.resolve({ data: { user: null }, error: null })

  const getMockDataForTable = (table) => {
    if (!includeMockCatalog) return []
    if (table === 'vw_unique_families') return MOCK_FAMILIES
    if (table === 'brands') return MOCK_BRANDS
    if (table === 'products') return MOCK_PRODUCTS
    return []
  }

  return {
    from: (table) => {
      const mockData = getMockDataForTable(table)

      const chain = new Proxy(() => {}, {
        get(_target, prop) {
          if (prop === 'then') {
            const p = Promise.resolve({ data: mockData, error: null, count: mockData.length })
            return p.then.bind(p)
          }
          if (prop === 'catch') {
            const p = Promise.resolve({ data: mockData, error: null, count: mockData.length })
            return p.catch.bind(p)
          }
          if (['in', 'range', 'limit', 'order', 'not', 'textSearch', 'or', 'eq', 'neq',
            'gt', 'gte', 'lt', 'lte', 'ilike', 'like', 'is', 'filter', 'match',
            'returns', 'abortSignal', 'throwOnError', 'merge'].includes(prop)) {
            return () => chain
          }
          if (prop === 'single' || prop === 'maybeSingle') {
            return () => Promise.resolve({
              data: mockData.length > 0 ? mockData[0] : null,
              error: null,
            })
          }
          if (prop === 'csv') return () => Promise.resolve({ data: '', error: null })
          if (prop === 'insert' || prop === 'upsert') {
            return (data) => {
              const result = { data: Array.isArray(data) ? data : [data], error: null }
              const p = Promise.resolve(result)
              return {
                ...result,
                select: () => chain,
                then: p.then.bind(p),
                catch: p.catch.bind(p),
              }
            }
          }
          if (prop === 'update') {
            return (data) => {
              const result = { data, error: null }
              const p = Promise.resolve(result)
              return {
                ...result,
                then: p.then.bind(p),
                catch: p.catch.bind(p),
              }
            }
          }
          if (prop === 'delete') {
            return () => {
              const result = { data: null, error: null }
              const p = Promise.resolve(result)
              return {
                ...result,
                then: p.then.bind(p),
                catch: p.catch.bind(p),
              }
            }
          }
          if (prop === 'select') return () => chain
          return chain
        },
        apply() {
          return Promise.resolve({ data: mockData, error: null })
        },
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
      signInWithOAuth: () => Promise.resolve({
        data: null,
        error: new Error('Autenticación cloud no disponible en modo local.'),
      }),
      signOut: noop,
      getUser: noopUser,
      refreshSession: noopSession,
      setSession: noopSession,
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
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
    rpc: () => ({
      data: null,
      error: null,
      single: () => {
        const res = { data: null, error: null }
        return {
          ...res,
          then: (resolve) => resolve(res),
          catch: (reject) => Promise.resolve().catch(reject),
        }
      },
      maybeSingle: () => {
        const res = { data: null, error: null }
        return {
          ...res,
          then: (resolve) => resolve(res),
          catch: (reject) => Promise.resolve().catch(reject),
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

export function createSupabaseClient(
  config = supabaseConfig,
  {
    allowMockCatalog = (import.meta.env.DEV || import.meta.env.MODE === 'test')
      && config.enabled
      && !config.configured,
  } = {},
) {
  if (config.mode !== 'cloud') {
    return createStubClient({ includeMockCatalog: allowMockCatalog })
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
    return createStubClient({ includeMockCatalog: allowMockCatalog })
  }
}

/** @type {import('@supabase/supabase-js').SupabaseClient} */
export const supabase = createSupabaseClient()

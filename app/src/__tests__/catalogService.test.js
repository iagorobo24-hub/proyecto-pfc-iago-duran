import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()
const mockAuth = {
  getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
}

vi.mock('../supabase/supabaseClient', () => ({
  supabase: { from: mockFrom, channel: vi.fn(), auth: mockAuth },
}))

beforeEach(() => {
  vi.resetModules()
  mockFrom.mockReset()
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

// Universal chain builder: any method returns the chain itself, then() calls resolve with data
function makeChain(resolveData) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    not: () => chain,
    in: () => chain,
    or: () => chain,
    limit: () => chain,
    order: () => chain,
    range: () => chain,
    maybeSingle: () => ({
      then: (r) => r({ data: resolveData?.[0] ?? null, error: null }),
    }),
    then: (r) => r({ data: resolveData, error: null, count: Array.isArray(resolveData) ? resolveData.length : null }),
  }
  return chain
}

describe('getCategorias', () => {
  it('returns categories from unique familias', async () => {
    const data = [{ familia: 'CABLES' }, { familia: 'DISTRIBUCION DE POTENCIA' }, { familia: 'CABLES' }]
    mockFrom.mockReturnValue(makeChain(data))

    const { getCategorias } = await import('../services/catalogService')
    const cats = await getCategorias()

    expect(cats).toHaveLength(2)
    expect(cats.find(c => c.id === 'CABLES')).toBeTruthy()
    expect(cats.find(c => c.id === 'DISTRIBUCION DE POTENCIA')).toBeTruthy()
  })

  it('returns empty array on error', async () => {
    mockFrom.mockReturnValue(makeChain(null))

    const { getCategorias } = await import('../services/catalogService')
    const cats = await getCategorias()
    expect(cats).toEqual([])
  })
})

describe('getMarcasPorCategoria', () => {
  it('returns brands for a given familia', async () => {
    const brandsData = [{ id: 1, name: 'Schneider Electric' }, { id: 2, name: 'Legrand' }]
    const productsData = [{ brand_id: 1 }, { brand_id: 2 }, { brand_id: 1 }]
    let callIdx = 0
    mockFrom.mockImplementation(() => {
      callIdx++
      // call 1: products query (brand_ids), call 2: brands by ids
      return makeChain(callIdx === 1 ? productsData : brandsData)
    })

    const { getMarcasPorCategoria } = await import('../services/catalogService')
    const marcas = await getMarcasPorCategoria('CABLES')

    expect(marcas).toHaveLength(2)
    expect(marcas[0].nombre).toBe('Legrand')
    expect(marcas[1].nombre).toBe('Schneider Electric')
  })

  it('returns empty array on error', async () => {
    mockFrom.mockReturnValue(makeChain(null))

    const { getMarcasPorCategoria } = await import('../services/catalogService')
    const marcas = await getMarcasPorCategoria('UNKNOWN')
    expect(marcas).toEqual([])
  })
})

describe('getGamasPorMarcaYCategoria', () => {
  it('returns gamas for a marca/categoria pair', async () => {
    const brandsData = [{ id: 1, name: 'Schneider Electric' }]
    const productsData = [{ subfamilia: 'Acti 9 iC60' }, { subfamilia: 'Acti 9 iID' }, { subfamilia: 'Acti 9 iC60' }]
    let callIdx = 0
    mockFrom.mockImplementation(() => {
      callIdx++
      return makeChain(callIdx === 1 ? brandsData : productsData)
    })

    const { getGamasPorMarcaYCategoria } = await import('../services/catalogService')
    const gamas = await getGamasPorMarcaYCategoria('Schneider Electric', 'DISTRIBUCION DE POTENCIA')

    expect(gamas).toHaveLength(2)
    expect(gamas.find(g => g.nombre === 'Acti 9 iC60')).toBeTruthy()
    expect(gamas.find(g => g.nombre === 'Acti 9 iID')).toBeTruthy()
  })

  it('returns empty array for unknown brand', async () => {
    mockFrom.mockReturnValue(makeChain(null))
    const { getGamasPorMarcaYCategoria } = await import('../services/catalogService')
    const gamas = await getGamasPorMarcaYCategoria('Unknown', 'CABLES')
    expect(gamas).toEqual([])
  })
})

describe('getTiposPorGamaMarcaYFamilia', () => {
  it('returns tipos', async () => {
    const brandsData = [{ id: 1, name: 'Schneider Electric' }]
    const productsData = [{ tipo: 'Magnetotérmico modular' }, { tipo: 'Diferencial' }]
    let callIdx = 0
    mockFrom.mockImplementation(() => {
      callIdx++
      return makeChain(callIdx === 1 ? brandsData : productsData)
    })

    const { getTiposPorGamaMarcaYFamilia } = await import('../services/catalogService')
    const tipos = await getTiposPorGamaMarcaYFamilia('Acti 9 iC60', 'Schneider Electric', 'DISTRIBUCION DE POTENCIA')
    expect(tipos).toEqual(['Diferencial', 'Magnetotérmico modular'])
  })
})

describe('getProductoPorRef', () => {
  it('returns product for existing ref', async () => {
    const producto = { id: 1, ref_fabricante: 'A9F54110', name: 'iC60N', marca: 'Schneider', familia: 'DISTRIBUCION DE POTENCIA', precio: 25.50 }
    mockFrom.mockReturnValue(makeChain([producto]))

    const { getProductoPorRef } = await import('../services/catalogService')
    const result = await getProductoPorRef('A9F54110')
    expect(result).toBeTruthy()
    expect(result.ref_fabricante).toBe('A9F54110')
  })

  it('returns null for missing ref', async () => {
    mockFrom.mockReturnValue(makeChain([]))
    const { getProductoPorRef } = await import('../services/catalogService')
    expect(await getProductoPorRef('NONEXISTENT')).toBeNull()
  })

  it('returns null on error', async () => {
    mockFrom.mockReturnValue(makeChain(null))
    const { getProductoPorRef } = await import('../services/catalogService')
    expect(await getProductoPorRef('ERROR')).toBeNull()
  })
})

describe('buscarProductos', () => {
  it('returns matching products', async () => {
    const data = [
      { id: 1, ref_fabricante: 'A9F54110', name: 'iC60N', marca: 'Schneider' },
      { id: 2, ref_fabricante: 'A9F54116', name: 'iC60N 16A', marca: 'Schneider' },
    ]
    mockFrom.mockReturnValue(makeChain(data))

    const { buscarProductos } = await import('../services/catalogService')
    expect(await buscarProductos('iC60')).toHaveLength(2)
  })

  it('handles SQL injection attempts safely via ILIKE', async () => {
    let orArgs = null
    const chain = makeChain([])
    chain.select = () => ({
      or: (args) => {
        orArgs = args
        return { limit: () => Promise.resolve({ data: [], error: null }) }
      },
    })
    mockFrom.mockReturnValue(chain)

    const { buscarProductos } = await import('../services/catalogService')
    await buscarProductos("' OR '1'='1")
    expect(orArgs).toContain("%' OR '1'='1%")
  })
})

describe('buscarProductosConLimite', () => {
  it('uses provided limit', async () => {
    let cap = null
    const chain = makeChain([])
    chain.select = () => ({
      or: () => ({ limit: (n) => { cap = n; return Promise.resolve({ data: [], error: null }) } }),
    })
    mockFrom.mockReturnValue(chain)

    const { buscarProductosConLimite } = await import('../services/catalogService')
    await buscarProductosConLimite('test', 3)
    expect(cap).toBe(3)
  })

  it('defaults to limit 5', async () => {
    let cap = null
    const chain = makeChain([])
    chain.select = () => ({
      or: () => ({ limit: (n) => { cap = n; return Promise.resolve({ data: [], error: null }) } }),
    })
    mockFrom.mockReturnValue(chain)

    const { buscarProductosConLimite } = await import('../services/catalogService')
    await buscarProductosConLimite('test')
    expect(cap).toBe(5)
  })
})

describe('getProductosPorFiltro', () => {
  it('builds full filter query', async () => {
    const brands = [{ id: 1, name: 'Schneider Electric' }]
    const products = [{ id: 1, ref_fabricante: 'A9F54110', name: 'iC60N', subfamilia: 'Acti 9 iC60', tipo: 'Magnetotérmico modular' }]
    let idx = 0
    mockFrom.mockImplementation(() => {
      idx++
      return makeChain(idx === 1 ? brands : products)
    })

    const { getProductosPorFiltro } = await import('../services/catalogService')
    const result = await getProductosPorFiltro('DISTRIBUCION DE POTENCIA', 'Schneider Electric', 'Acti 9 iC60', 'Magnetotérmico modular')
    expect(result).toHaveLength(1)
    expect(result[0].ref_fabricante).toBe('A9F54110')
  })
})

describe('getSubfamiliasConTipos', () => {
  it('returns unique pairs', async () => {
    const brands = [{ id: 1, name: 'Schneider Electric' }]
    const products = [
      { subfamilia: 'Acti 9 iC60', tipo: 'Magnetotérmico modular' },
      { subfamilia: 'Acti 9 iID', tipo: 'Diferencial' },
    ]
    let idx = 0
    mockFrom.mockImplementation(() => {
      idx++
      return makeChain(idx === 1 ? brands : products)
    })

    const { getSubfamiliasConTipos } = await import('../services/catalogService')
    expect(await getSubfamiliasConTipos('Schneider Electric', 'DISTRIBUCION DE POTENCIA')).toHaveLength(2)
  })
})

describe('getProductosPorSubcategoria', () => {
  it('builds or conditions query', async () => {
    const brands = [{ id: 1, name: 'Schneider Electric' }]
    const products = [{ id: 1, ref_fabricante: 'A9F54110', subfamilia: 'Acti 9 iC60', tipo: 'Magnetotérmico modular' }]
    let idx = 0
    mockFrom.mockImplementation(() => {
      idx++
      return makeChain(idx === 1 ? brands : products)
    })

    const { getProductosPorSubcategoria } = await import('../services/catalogService')
    const result = await getProductosPorSubcategoria('DISTRIBUCION DE POTENCIA', 'Schneider Electric', [
      { subfamilia: 'Acti 9 iC60', tipo: 'Magnetotérmico modular' },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].ref_fabricante).toBe('A9F54110')
  })
})

describe('getCatalogStats', () => {
  it('returns count', async () => {
    const chain = makeChain([])
    chain.select = (cols, opts) => Promise.resolve({ data: [], error: null, count: 42 })
    mockFrom.mockReturnValue(chain)

    const { getCatalogStats } = await import('../services/catalogService')
    expect((await getCatalogStats()).totalProducts).toBe(42)
  })

  it('returns 0 on error', async () => {
    mockFrom.mockReturnValue(makeChain(null))
    const { getCatalogStats } = await import('../services/catalogService')
    expect((await getCatalogStats()).totalProducts).toBe(0)
  })
})

describe('initCatalog', () => {
  it('loads brands', async () => {
    mockFrom.mockReturnValue(makeChain([{ id: 1, name: 'Schneider' }, { id: 2, name: 'Legrand' }]))
    const { initCatalog } = await import('../services/catalogService')
    expect(await initCatalog()).toEqual({})
  })
})

describe('getGamasPorFiltro', () => {
  it('returns sorted gamas', async () => {
    const brands = [{ id: 1, name: 'Schneider' }]
    const products = [{ Gama: 'Acti 9 iC60' }, { Gama: 'Resi9' }, { Gama: 'Acti 9 iC60' }]
    let idx = 0
    mockFrom.mockImplementation(() => { idx++; return makeChain(idx === 1 ? brands : products) })

    const { getGamasPorFiltro } = await import('../services/catalogService')
    expect(await getGamasPorFiltro('DISTRIBUCION DE POTENCIA', 'Schneider', 'Acti 9 iC60', 'Magnetotérmico modular'))
      .toEqual(['Acti 9 iC60', 'Resi9'])
  })
})

describe('getSubgamasPorFiltro', () => {
  it('returns sorted subgamas', async () => {
    const brands = [{ id: 1, name: 'Schneider' }]
    const products = [{ Subgama: 'Curva C' }, { Subgama: 'Curva D' }]
    let idx = 0
    mockFrom.mockImplementation(() => { idx++; return makeChain(idx === 1 ? brands : products) })

    const { getSubgamasPorFiltro } = await import('../services/catalogService')
    expect(await getSubgamasPorFiltro('DISTRIBUCION DE POTENCIA', 'Schneider', 'Acti 9 iC60', 'Magnetotérmico modular'))
      .toEqual(['Curva C', 'Curva D'])
  })
})

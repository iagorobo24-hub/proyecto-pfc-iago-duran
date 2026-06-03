import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetProductoPorRef = vi.fn()
const mockBuscarProductos = vi.fn()
const mockGetMarcasPorCategoria = vi.fn()
const mockGetCatalogStats = vi.fn()

vi.mock('../services/catalogService', () => ({
  default: {
    getProductoPorRef: (...args) => mockGetProductoPorRef(...args),
    buscarProductos: (...args) => mockBuscarProductos(...args),
    getMarcasPorCategoria: (...args) => mockGetMarcasPorCategoria(...args),
    getCatalogStats: (...args) => mockGetCatalogStats(...args),
  }
}))

beforeEach(() => {
  vi.resetModules()
  mockGetProductoPorRef.mockReset()
  mockBuscarProductos.mockReset()
  mockGetMarcasPorCategoria.mockReset()
  mockGetCatalogStats.mockReset()
})

const PRODUCTO_SAMPLE = {
  id: 1,
  ref_fabricante: 'A9F54110',
  name: 'Magnetotérmico Acti9 iC60N 1P 10A C',
  marca: 'Schneider Electric',
  familia: 'DISTRIBUCION DE POTENCIA',
  subfamilia: 'Interruptor Magnetotérmico',
  tipo: 'CARRIL DIN',
  Gama: 'Acti 9 iC60',
  Subgama: 'iC60N',
  precio: 14.50,
  descripcion: 'Interruptor automático magnetotérmico',
  imagen: 'https://example.com/img.jpg',
  pdf_url: 'https://example.com/pdf.pdf',
}

describe('buildCatalogContext', () => {
  it('returns stats + category context for a generic message', async () => {
    mockGetCatalogStats.mockResolvedValue({ totalProducts: 4689 })
    mockGetMarcasPorCategoria.mockResolvedValue([
      { nombre: 'Schneider Electric' },
      { nombre: 'Legrand' },
    ])
    mockBuscarProductos.mockResolvedValue([])

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('dame información sobre protección eléctrica', 'DISTRIBUCION DE POTENCIA')

    expect(result).toContain('4689')
    expect(result).toContain('CATEGORÍA ACTIVA')
    expect(result).toContain('DISTRIBUCION DE POTENCIA')
    expect(result).toContain('Schneider Electric')
    expect(mockGetCatalogStats).toHaveBeenCalledTimes(1)
  })

  it('detects a product reference and returns full detail', async () => {
    mockGetCatalogStats.mockResolvedValue({ totalProducts: 4689 })
    mockGetProductoPorRef.mockResolvedValue(PRODUCTO_SAMPLE)

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('necesito la ficha del A9F54110')

    expect(result).toContain('A9F54110')
    expect(result).toContain('Magnetotérmico Acti9 iC60N 1P 10A C')
    expect(result).toContain('Schneider Electric')
    expect(result).toContain('14.5')
    expect(mockGetProductoPorRef).toHaveBeenCalledWith('A9F54110')
    expect(mockBuscarProductos).not.toHaveBeenCalled()
  })

  it('falls back to keyword search when no reference is detected', async () => {
    mockGetCatalogStats.mockResolvedValue({ totalProducts: 4689 })
    mockBuscarProductos.mockResolvedValue([
      PRODUCTO_SAMPLE,
      { ...PRODUCTO_SAMPLE, ref_fabricante: 'A9F54116', name: 'Magnetotérmico Acti9 iC60N 1P 16A C' },
    ])

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('buscando magnetotérmicos schneider 10A')

    expect(result).toContain('PRODUCTOS RELACIONADOS')
    expect(result).toContain('A9F54110')
    expect(result).toContain('A9F54116')
    expect(mockBuscarProductos).toHaveBeenCalled()
    expect(mockGetProductoPorRef).not.toHaveBeenCalled()
  })

  it('returns only stats when no keywords or refs match', async () => {
    mockGetCatalogStats.mockResolvedValue({ totalProducts: 4689 })
    mockBuscarProductos.mockResolvedValue([])

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('hola')

    expect(result).toContain('4689')
    expect(result).not.toContain('PRODUCTOS RELACIONADOS')
    expect(result).not.toContain('PRODUCTO')
    expect(result).not.toContain('CATEGORÍA')
  })

  it('handles empty message gracefully', async () => {
    mockGetCatalogStats.mockResolvedValue({ totalProducts: 4689 })
    mockBuscarProductos.mockResolvedValue([])

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('')

    expect(result).toContain('4689')
  })

  it('handles message with only stop words', async () => {
    mockGetCatalogStats.mockResolvedValue({ totalProducts: 4689 })
    mockBuscarProductos.mockResolvedValue([])

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('el producto de la marca para buscar')

    expect(result).toContain('4689')
    expect(result).not.toContain('PRODUCTOS RELACIONADOS')
  })

  it('returns empty string when catalogService errors', async () => {
    mockGetCatalogStats.mockRejectedValue(new Error('DB error'))

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('test query')

    expect(result).toBe('')
  })

  it('includes category brands when activeCategory is provided', async () => {
    mockGetCatalogStats.mockResolvedValue({ totalProducts: 4689 })
    mockGetMarcasPorCategoria.mockResolvedValue([
      { nombre: 'Schneider Electric' },
      { nombre: 'Legrand' },
      { nombre: 'ABB' },
    ])
    mockBuscarProductos.mockResolvedValue([])

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('contactor trifásico', 'AUTOMATIZACION')

    expect(result).toContain('CATEGORÍA ACTIVA: AUTOMATIZACION')
    expect(result).toContain('Schneider Electric')
    expect(result).toContain('Legrand')
    expect(result).toContain('ABB')
    expect(mockGetMarcasPorCategoria).toHaveBeenCalledWith('AUTOMATIZACION')
  })

  it('reference lookup takes priority over keyword search', async () => {
    mockGetCatalogStats.mockResolvedValue({ totalProducts: 4689 })
    mockGetProductoPorRef.mockResolvedValue(PRODUCTO_SAMPLE)

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('busco variador pero la ref es A9F54110')

    expect(result).toContain('A9F54110')
    expect(result).toContain('PRODUCTO')
    expect(mockGetProductoPorRef).toHaveBeenCalled()
    expect(mockBuscarProductos).not.toHaveBeenCalled()
  })

  it('truncates brand list to 8 entries with ellipsis', async () => {
    mockGetCatalogStats.mockResolvedValue({ totalProducts: 4689 })
    const manyBrands = Array.from({ length: 12 }, (_, i) => ({ nombre: `Marca ${i + 1}` }))
    mockGetMarcasPorCategoria.mockResolvedValue(manyBrands)
    mockBuscarProductos.mockResolvedValue([])

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('test', 'CABLES')

    expect(result).toContain('Marca 1')
    expect(result).toContain('Marca 8')
    expect(result).toContain('...')
  })

  it('handles reference that does not exist in DB', async () => {
    mockGetCatalogStats.mockResolvedValue({ totalProducts: 4689 })
    mockGetProductoPorRef.mockResolvedValue(null)
    mockBuscarProductos.mockResolvedValue([PRODUCTO_SAMPLE])

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('referencia ZZ999 no existe')

    expect(result).toContain('4689')
    expect(result).toContain('PRODUCTOS RELACIONADOS')
    expect(mockGetProductoPorRef).toHaveBeenCalled()
    expect(mockBuscarProductos).toHaveBeenCalled()
  })

  it('limits search results to 10 products', async () => {
    mockGetCatalogStats.mockResolvedValue({ totalProducts: 4689 })
    const manyProducts = Array.from({ length: 15 }, (_, i) => ({
      ...PRODUCTO_SAMPLE,
      ref_fabricante: `REF${i}`,
      name: `Producto ${i}`,
    }))
    mockBuscarProductos.mockResolvedValue(manyProducts)

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('buscar muchos productos')

    const matches = result.match(/\d+\. \[REF\d+\]/g)
    expect(matches).toHaveLength(10)
    expect(result).toContain('y 5 más')
  })

  it('handles category context error gracefully', async () => {
    mockGetCatalogStats.mockResolvedValue({ totalProducts: 4689 })
    mockGetMarcasPorCategoria.mockRejectedValue(new Error('fail'))
    mockBuscarProductos.mockResolvedValue([])

    const { buildCatalogContext } = await import('../services/sonexCatalogContext')
    const result = await buildCatalogContext('test', 'ALGO')

    expect(result).toContain('4689')
    expect(result).toContain('CATEGORÍA ACTIVA: ALGO')
  })
})

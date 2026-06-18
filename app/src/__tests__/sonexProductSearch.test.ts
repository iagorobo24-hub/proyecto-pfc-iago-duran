import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockBuscarProductosCatalogo } = vi.hoisted(() => ({
  mockBuscarProductosCatalogo: vi.fn(),
}));

vi.mock('../services/catalogService', () => ({
  default: {
    buscarProductosCatalogo: mockBuscarProductosCatalogo,
  },
}));

const exactProduct = {
  id: 1,
  ref_fabricante: 'REF-216C',
  name: 'Magnetotérmico modular 2P 16A C curva',
  marca: 'Marca Norte',
  familia: 'Protecciones y Cuadros',
  subfamilia: 'Interruptor Magnetotérmico',
  tipo: 'CARRIL DIN',
  imagen: 'https://example.test/product.png',
  pdf_url: 'https://example.test/product.pdf',
}

const partialProduct = {
  ...exactProduct,
  id: 2,
  ref_fabricante: 'REF-110C',
  name: 'Magnetotérmico modular 1P 10A C curva',
}

const ic60nProduct = {
  ...exactProduct,
  id: 3,
  ref_fabricante: 'A9F04110',
  name: 'MagnetotÃ©rmico Acti9 iC60N 1P 10 A C curva',
  marca: 'Schneider Electric',
  subfamilia: 'Interruptor MagnetotÃ©rmico',
  Gama: 'Acti 9 iC60',
  Subgama: 'iC60N',
}

const ic60nProduct2 = {
  ...ic60nProduct,
  id: 4,
  ref_fabricante: 'A9F04116',
  name: 'MagnetotÃ©rmico Acti9 iC60N 1P 16 A C curva',
}

const schneiderContactor = {
  ...exactProduct,
  id: 5,
  ref_fabricante: 'LC1D323FE7',
  name: 'Contactor TeSys D 3P AC3 32 A',
  marca: 'Schneider Electric',
  familia: 'AutomatizaciÃ³n',
  subfamilia: 'Contactor',
  Gama: 'TeSys D',
  Subgama: 'TeSys Deca',
}

describe('searchProductsForCriteria', () => {
  beforeEach(() => {
    vi.resetModules();
    mockBuscarProductosCatalogo.mockReset();
  });

  it('queries catalog by structured criteria and ranks exact matches first', async () => {
    mockBuscarProductosCatalogo
      .mockResolvedValueOnce([exactProduct])
      .mockResolvedValueOnce([partialProduct, exactProduct])
      .mockResolvedValueOnce([partialProduct]);

    const { searchProductsForCriteria } = await import('../services/sonexProductSearch');
    const result = await searchProductsForCriteria({
      productType: 'magnetotermico',
      family: 'Protecciones y Cuadros',
      subfamily: 'Interruptor Magnetotérmico',
      poles: '2P',
      curve: 'C',
      amps: 16,
      rawTerms: ['magnetotermico'],
      confidence: 0.9,
    });

    expect(mockBuscarProductosCatalogo).toHaveBeenCalledTimes(3);
    expect(mockBuscarProductosCatalogo).toHaveBeenCalledWith(expect.objectContaining({
      familia: 'Protecciones y Cuadros',
      subfamilia: 'Interruptor Magnetotérmico',
    }));
    expect(result.needsClarification).toBe(false);
    expect(result.exactMatches[0].product.ref_fabricante).toBe('REF-216C');
    expect(result.partialMatches[0].product.ref_fabricante).toBe('REF-110C');
  });

  it('queries catalog with manufacturer and common spec variants', async () => {
    mockBuscarProductosCatalogo
      .mockResolvedValueOnce([exactProduct])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const { searchProductsForCriteria } = await import('../services/sonexProductSearch');
    await searchProductsForCriteria({
      productType: 'magnetotermico',
      family: 'Protecciones y Cuadros',
      subfamily: 'Interruptor Magnetotérmico',
      brand: 'Schneider Electric',
      poles: '2P',
      curve: 'C',
      amps: 16,
      rawTerms: ['dime', 'magnetotermico', 'schneider'],
      confidence: 0.9,
    });

    expect(mockBuscarProductosCatalogo).toHaveBeenCalledWith(expect.objectContaining({
      marca: 'Schneider Electric',
      terms: expect.arrayContaining(['C curva', 'curva C', '16 A', '16A', '2P']),
      requiredTermGroups: expect.arrayContaining([
        expect.arrayContaining(['2P']),
        expect.arrayContaining(['16A', '16 A']),
        expect.arrayContaining(['curva C', 'C curva']),
      ]),
    }));
  });

  it('asks for clarification before querying broad ambiguous criteria', async () => {
    const { searchProductsForCriteria } = await import('../services/sonexProductSearch');
    const result = await searchProductsForCriteria({
      productType: 'magnetotermico',
      family: 'Protecciones y Cuadros',
      subfamily: 'Interruptor Magnetotérmico',
      rawTerms: ['magnetotermico'],
      confidence: 0.45,
    });

    expect(result.needsClarification).toBe(true);
    expect(result.clarificationQuestion).toContain('calibre');
    expect(mockBuscarProductosCatalogo).not.toHaveBeenCalled();
  });

  it('keeps manufacturer range searches focused on the requested range term', async () => {
    mockBuscarProductosCatalogo
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([schneiderContactor, ic60nProduct, ic60nProduct2]);

    const { searchProductsForCriteria, getFlattenedCatalogResults } = await import('../services/sonexProductSearch');
    const result = await searchProductsForCriteria({
      brand: 'Schneider Electric',
      rawTerms: ['referencias', 'gama', 'ic60n', 'schneider'],
      quantity: 10,
      confidence: 0.46,
    });

    expect(mockBuscarProductosCatalogo).toHaveBeenCalledWith(expect.objectContaining({
      marca: 'Schneider Electric',
      requiredTermGroups: expect.arrayContaining([
        expect.arrayContaining(['ic60n']),
      ]),
    }));
    expect(getFlattenedCatalogResults(result).map(item => item.product.ref_fabricante)).toEqual([
      'A9F04110',
      'A9F04116',
    ]);
  });

  it('caches repeated normalized searches', async () => {
    mockBuscarProductosCatalogo
      .mockResolvedValueOnce([exactProduct])
      .mockResolvedValueOnce([exactProduct])
      .mockResolvedValueOnce([exactProduct]);

    const { searchProductsForCriteria } = await import('../services/sonexProductSearch');
    const criteria = {
      productType: 'magnetotermico',
      family: 'Protecciones y Cuadros',
      subfamily: 'Interruptor Magnetotérmico',
      poles: '2P',
      curve: 'C',
      amps: 16,
      rawTerms: ['magnetotermico'],
      confidence: 0.9,
    };

    await searchProductsForCriteria(criteria);
    await searchProductsForCriteria({ ...criteria, rawTerms: ['magnetotermico'] });

    expect(mockBuscarProductosCatalogo).toHaveBeenCalledTimes(3);
  });
});

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

describe('searchProductsForCriteria', () => {
  beforeEach(() => {
    vi.resetModules();
    mockBuscarProductosCatalogo.mockReset();
  });

  it('queries catalog by structured criteria and ranks exact matches first', async () => {
    mockBuscarProductosCatalogo
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

    expect(mockBuscarProductosCatalogo).toHaveBeenCalledTimes(2);
    expect(mockBuscarProductosCatalogo).toHaveBeenCalledWith(expect.objectContaining({
      familia: 'Protecciones y Cuadros',
      subfamilia: 'Interruptor Magnetotérmico',
    }));
    expect(result.needsClarification).toBe(false);
    expect(result.exactMatches[0].product.ref_fabricante).toBe('REF-216C');
    expect(result.partialMatches[0].product.ref_fabricante).toBe('REF-110C');
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

  it('caches repeated normalized searches', async () => {
    mockBuscarProductosCatalogo
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

    expect(mockBuscarProductosCatalogo).toHaveBeenCalledTimes(2);
  });
});

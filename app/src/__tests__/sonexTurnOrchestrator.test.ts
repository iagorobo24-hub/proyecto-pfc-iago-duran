import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockBuscarProductosCatalogo } = vi.hoisted(() => ({
  mockBuscarProductosCatalogo: vi.fn(),
}));

vi.mock('../services/catalogService', () => ({
  default: {
    buscarProductosCatalogo: mockBuscarProductosCatalogo,
  },
}));

const schneiderProduct = {
  id: 286796,
  ref_fabricante: 'A9F04110',
  name: 'Magnetotérmico, Acti9 iC60N, 1P, 10 A, C curva, 6000 A (IEC 60898-1), 10 kA (IEC 60947-2)',
  marca: 'Schneider Electric',
  familia: 'Protecciones y Cuadros',
  subfamilia: 'Interruptor Magnetotérmico',
  tipo: 'CARRIL DIN',
  Gama: 'Acti 9 iC60',
  Subgama: 'iC60N',
  imagen: 'https://example.test/a9f04110.png',
  pdf_url: 'https://example.test/a9f04110.pdf',
};

const schneiderRangeProducts = Array.from({ length: 12 }, (_, index) => ({
  ...schneiderProduct,
  id: 286900 + index,
  ref_fabricante: `A9F041${String(index + 1).padStart(2, '0')}`,
  name: `MagnetotÃ©rmico, Acti9 iC60N, 1P, ${index + 1} A, C curva, 6000 A (IEC 60898-1), 10 kA (IEC 60947-2)`,
}));

describe('prepareSonexTurn', () => {
  beforeEach(() => {
    vi.resetModules();
    mockBuscarProductosCatalogo.mockReset();
  });

  it('continues a catalog clarification with technical specs from the next user turn', async () => {
    mockBuscarProductosCatalogo
      .mockResolvedValueOnce([schneiderProduct])
      .mockResolvedValueOnce([schneiderProduct])
      .mockResolvedValueOnce([schneiderProduct]);

    const { prepareSonexTurn } = await import('../services/sonexTurnOrchestrator');

    const clarification = await prepareSonexTurn('Interruptor magnetotermico de schneider de la bd');
    expect(clarification.kind).toBe('clarification');

    const resolved = await prepareSonexTurn('10A curva c 10kA', {
      pendingCriteria: clarification.criteria,
    });

    expect(resolved.kind).toBe('catalog');
    expect(resolved.criteria.productType).toBe('magnetotermico');
    expect(resolved.criteria.brand).toBe('Schneider Electric');
    expect(resolved.criteria.amps).toBe(10);
    expect(resolved.criteria.curve).toBe('C');
    expect(resolved.criteria.breakingCapacity).toBe('10 kA');
    expect(mockBuscarProductosCatalogo).toHaveBeenCalledWith(expect.objectContaining({
      requiredTermGroups: expect.arrayContaining([
        expect.arrayContaining(['10 kA', '10kA', '10000 A']),
      ]),
    }));
    expect(resolved.catalogCards[0].matchedSpecs).toContain('10 kA');
    expect(resolved.catalogCards[0].product.ref_fabricante).toBe('A9F04110');
  });

  it('returns catalog cards for a manufacturer range reference request', async () => {
    mockBuscarProductosCatalogo.mockResolvedValue(schneiderRangeProducts);

    const { prepareSonexTurn } = await import('../services/sonexTurnOrchestrator');
    const result = await prepareSonexTurn('Dame 10 referencias de la gama ic60n de schneider');

    expect(result.kind).toBe('catalog');
    expect(result.criteria.brand).toBe('Schneider Electric');
    expect(result.criteria.quantity).toBe(10);
    expect(mockBuscarProductosCatalogo).toHaveBeenCalledWith(expect.objectContaining({
      marca: 'Schneider Electric',
      terms: expect.arrayContaining(['ic60n']),
    }));
    expect(result.catalogCards).toHaveLength(10);
    expect(result.catalogCards[0].product.ref_fabricante).toMatch(/^A9F041/);
  });
});

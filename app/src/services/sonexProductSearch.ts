import catalogService from './catalogService';
import type { Product } from '../types/catalog';
import type { SonexCatalogResult, SonexProductCriteria, SonexProductSearchResult } from '../types/sonex';
import { scoreProductMatch } from '../utils/productSpecs';

const MAX_EXACT = 5;
const MAX_PARTIAL = 5;
const MAX_RELATED = 5;
const searchCache = new Map<string, SonexProductSearchResult>();

function normalizeCacheValue(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function criteriaKey(criteria: SonexProductCriteria, activeCategory?: string): string {
  return JSON.stringify({
    activeCategory: normalizeCacheValue(activeCategory),
    productType: normalizeCacheValue(criteria.productType),
    family: normalizeCacheValue(criteria.family),
    subfamily: normalizeCacheValue(criteria.subfamily),
    brand: normalizeCacheValue(criteria.brand),
    poles: normalizeCacheValue(criteria.poles),
    curve: normalizeCacheValue(criteria.curve),
    breakingCapacity: normalizeCacheValue(criteria.breakingCapacity),
    amps: criteria.amps || 0,
    sensitivityMa: criteria.sensitivityMa || 0,
    rawTerms: (criteria.rawTerms || []).map(normalizeCacheValue).sort(),
  });
}

function productKey(product: Product): string {
  return String(product.ref_fabricante || product.id || product.name);
}

function uniqueProducts(products: Product[]): Product[] {
  const seen = new Set<string>();
  const unique: Product[] = [];
  for (const product of products) {
    const key = productKey(product);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(product);
  }
  return unique;
}

function classifyProducts(products: Product[], criteria: SonexProductCriteria): SonexCatalogResult[] {
  return products
    .map(product => {
      const score = scoreProductMatch(product, criteria);
      return {
        source: 'catalog' as const,
        matchType: score.matchType,
        score: score.score,
        matchedSpecs: score.matchedSpecs,
        missingSpecs: score.missingSpecs,
        product,
      };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

function splitResults(results: SonexCatalogResult[]) {
  return {
    exactMatches: results.filter(result => result.matchType === 'exact').slice(0, MAX_EXACT),
    partialMatches: results.filter(result => result.matchType === 'partial').slice(0, MAX_PARTIAL),
    relatedMatches: results.filter(result => result.matchType === 'related').slice(0, MAX_RELATED),
  };
}

function clarificationFor(criteria: SonexProductCriteria): string | undefined {
  if (!criteria.productType) return undefined;
  const hasTechnicalSpec = Boolean(criteria.amps || criteria.poles || criteria.curve || criteria.sensitivityMa || criteria.breakingCapacity);
  if (hasTechnicalSpec || criteria.rawTerms.length > 1) return undefined;
  return 'Necesito algún dato técnico más para buscar referencias reales: calibre, polos, curva, sensibilidad o uso previsto.';
}

function capacitySearchTerms(value: string): string[] {
  const match = value.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return [value];

  const numericValue = Number(match[1].replace(',', '.'));
  const terms = [value, value.replace(/\s+/g, '')];
  if (Number.isFinite(numericValue)) {
    terms.push(`${numericValue * 1000} A`);
  }
  return [...new Set(terms)];
}

function termsForSearch(criteria: SonexProductCriteria): string[] {
  const breakingCapacityTerms = criteria.breakingCapacity
    ? capacitySearchTerms(criteria.breakingCapacity)
    : [];
  const terms = [
    criteria.productType,
    criteria.productType === 'magnetotermico' ? 'magnetotérmico' : '',
    criteria.curve ? `curva ${criteria.curve}` : '',
    criteria.curve ? `${criteria.curve} curva` : '',
    criteria.poles,
    criteria.amps ? `${criteria.amps}A` : '',
    criteria.amps ? `${criteria.amps} A` : '',
    criteria.sensitivityMa ? `${criteria.sensitivityMa}mA` : '',
    criteria.sensitivityMa ? `${criteria.sensitivityMa} mA` : '',
    ...breakingCapacityTerms,
    ...criteria.rawTerms,
  ].filter(Boolean) as string[];

  return [...new Set(terms)];
}

function requiredTermGroupsForSearch(criteria: SonexProductCriteria): string[][] {
  const groups = [
    criteria.poles ? [criteria.poles] : [],
    criteria.amps ? [`${criteria.amps}A`, `${criteria.amps} A`] : [],
    criteria.curve ? [`curva ${criteria.curve}`, `${criteria.curve} curva`] : [],
    criteria.sensitivityMa ? [`${criteria.sensitivityMa}mA`, `${criteria.sensitivityMa} mA`] : [],
    criteria.breakingCapacity ? capacitySearchTerms(criteria.breakingCapacity) : [],
  ].filter(group => group.length > 0);

  return groups.length >= 2 ? groups : [];
}

export function getFlattenedCatalogResults(searchResult: SonexProductSearchResult): SonexCatalogResult[] {
  return [
    ...searchResult.exactMatches,
    ...searchResult.partialMatches,
    ...searchResult.relatedMatches,
  ];
}

export async function searchProductsForCriteria(
  criteria: SonexProductCriteria,
  options: { activeCategory?: string } = {},
): Promise<SonexProductSearchResult> {
  const enrichedCriteria: SonexProductCriteria = {
    ...criteria,
    family: criteria.family || options.activeCategory,
  };

  const clarificationQuestion = clarificationFor(enrichedCriteria);
  if (clarificationQuestion) {
    return {
      criteria: enrichedCriteria,
      exactMatches: [],
      partialMatches: [],
      relatedMatches: [],
      needsClarification: true,
      clarificationQuestion,
    };
  }

  const key = criteriaKey(enrichedCriteria, options.activeCategory);
  const cached = searchCache.get(key);
  if (cached) return cached;

  const terms = termsForSearch(enrichedCriteria);
  const requiredTermGroups = requiredTermGroupsForSearch(enrichedCriteria);
  const batches = await Promise.all([
    requiredTermGroups.length > 0
      ? catalogService.buscarProductosCatalogo({
          familia: enrichedCriteria.family,
          subfamilia: enrichedCriteria.subfamily,
          marca: enrichedCriteria.brand,
          terms,
          requiredTermGroups,
          limite: 60,
        })
      : Promise.resolve([]),
    enrichedCriteria.subfamily
      ? catalogService.buscarProductosCatalogo({
          familia: enrichedCriteria.family,
          subfamilia: enrichedCriteria.subfamily,
          marca: enrichedCriteria.brand,
          terms,
          limite: 120,
        })
      : Promise.resolve([]),
    catalogService.buscarProductosCatalogo({
      familia: enrichedCriteria.family,
      marca: enrichedCriteria.brand,
      terms,
      limite: 80,
    }),
  ]);

  const candidates = uniqueProducts(batches.flat());
  const scored = classifyProducts(candidates, enrichedCriteria);
  const split = splitResults(scored);

  const result: SonexProductSearchResult = {
    criteria: enrichedCriteria,
    ...split,
    needsClarification: false,
  };

  searchCache.set(key, result);
  return result;
}

export function formatCatalogResultsContext(searchResult: SonexProductSearchResult): string {
  const all = getFlattenedCatalogResults(searchResult).slice(0, 10);
  if (all.length === 0) {
    return 'No se han encontrado coincidencias verificadas en el catálogo para los criterios actuales.';
  }

  const lines = all.map((result, index) => {
    const product = result.product;
    const specs = result.matchedSpecs.length > 0
      ? ` | Coincide: ${result.matchedSpecs.slice(0, 5).join(', ')}`
      : '';
    const missing = result.missingSpecs.length > 0
      ? ` | Falta o no coincide: ${result.missingSpecs.slice(0, 4).join(', ')}`
      : '';
    const price = product.precio ? ` | Precio: ${product.precio}` : '';
    return `${index + 1}. [${product.ref_fabricante}] ${product.name} | Marca: ${product.marca || 'N/D'} | ${product.familia || ''} > ${product.subfamilia || ''}${price} | Ajuste: ${result.matchType} (${result.score})${specs}${missing}`;
  });

  return [
    '## PRODUCTOS VERIFICADOS EN CATALOGO',
    'Usa solo estas referencias como productos disponibles en catálogo. No inventes disponibilidad ni referencias adicionales.',
    ...lines,
  ].join('\n');
}

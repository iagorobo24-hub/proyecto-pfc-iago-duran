import type { SonexCatalogResult, SonexPreparedTurn, SonexProductCriteria, SonexProductSearchResult } from '../types/sonex';
import { detectSonexIntent, isCatalogIntent } from './sonexIntentService';
import {
  formatCatalogResultsContext,
  getFlattenedCatalogResults,
  searchProductsForCriteria,
} from './sonexProductSearch';

function countResults(searchResult: SonexProductSearchResult): number {
  return searchResult.exactMatches.length + searchResult.partialMatches.length + searchResult.relatedMatches.length;
}

export function buildCatalogAssistantFallback(searchResult: SonexProductSearchResult): string {
  const total = countResults(searchResult);
  if (total === 0) {
    return 'No he encontrado coincidencias verificadas en el catálogo con esos criterios. Puedes concretar marca, calibre, polos, curva o sensibilidad para afinar la búsqueda.'
  }

  const exact = searchResult.exactMatches.length;
  const partial = searchResult.partialMatches.length;
  const related = searchResult.relatedMatches.length;
  const top = getFlattenedCatalogResults(searchResult)[0];
  const topRef = top?.product?.ref_fabricante;

  return [
    `He encontrado ${total} resultado${total === 1 ? '' : 's'} verificado${total === 1 ? '' : 's'} en catálogo.`,
    exact > 0 ? `${exact} coincidencia${exact === 1 ? '' : 's'} exacta${exact === 1 ? '' : 's'}.` : '',
    partial > 0 ? `${partial} coincidencia${partial === 1 ? '' : 's'} parcial${partial === 1 ? '' : 'es'}.` : '',
    related > 0 ? `${related} alternativa${related === 1 ? '' : 's'} relacionada${related === 1 ? '' : 's'}.` : '',
    topRef ? `La primera opción para revisar es ${topRef}.` : '',
  ].filter(Boolean).join(' ');
}

function limitCatalogCards(searchResult: SonexProductSearchResult): SonexCatalogResult[] {
  const requestedLimit = Math.min(Math.max(Math.floor(searchResult.criteria.quantity || 10), 1), 10);
  return [
    ...searchResult.exactMatches,
    ...searchResult.partialMatches,
    ...searchResult.relatedMatches,
  ].slice(0, requestedLimit);
}

function hasContinuationSpecs(criteria: SonexProductCriteria): boolean {
  return Boolean(
    criteria.amps ||
    criteria.poles ||
    criteria.curve ||
    criteria.sensitivityMa ||
    criteria.breakingCapacity ||
    criteria.voltage
  );
}

function mergeCriteria(pending: SonexProductCriteria, current: SonexProductCriteria): SonexProductCriteria {
  return {
    ...pending,
    ...current,
    productType: current.productType || pending.productType,
    family: current.family || pending.family,
    subfamily: current.subfamily || pending.subfamily,
    brand: current.brand || pending.brand,
    rawTerms: [...new Set([...(pending.rawTerms || []), ...(current.rawTerms || [])])],
    confidence: Math.min(0.98, Math.max(pending.confidence || 0, current.confidence || 0) + 0.16),
  };
}

function shouldContinuePendingCriteria(pending: SonexProductCriteria | undefined, current: SonexProductCriteria): pending is SonexProductCriteria {
  if (!pending?.productType || !hasContinuationSpecs(current)) return false;
  return !current.productType || current.productType === pending.productType;
}

export async function prepareSonexTurn(
  userMessage: string,
  state: { activeCategory?: string; pendingCriteria?: SonexProductCriteria } = {},
): Promise<SonexPreparedTurn> {
  const detectedIntent = detectSonexIntent(userMessage);
  const intentResult = shouldContinuePendingCriteria(state.pendingCriteria, detectedIntent.criteria)
    ? {
        ...detectedIntent,
        intent: isCatalogIntent(detectedIntent.intent) ? detectedIntent.intent : 'catalog_lookup' as const,
        criteria: mergeCriteria(state.pendingCriteria, detectedIntent.criteria),
        needsClarification: false,
        clarificationQuestion: undefined,
      }
    : detectedIntent;

  if (intentResult.needsClarification) {
    return {
      kind: 'clarification',
      intent: intentResult.intent,
      criteria: intentResult.criteria,
      assistantMessage: intentResult.clarificationQuestion,
      catalogCards: [],
      externalCards: [],
    };
  }

  if (!isCatalogIntent(intentResult.intent)) {
    return {
      kind: 'general',
      intent: intentResult.intent,
      criteria: intentResult.criteria,
      catalogCards: [],
      externalCards: [],
    };
  }

  const searchResult = await searchProductsForCriteria(intentResult.criteria, {
    activeCategory: state.activeCategory,
  });

  if (searchResult.needsClarification) {
    return {
      kind: 'clarification',
      intent: intentResult.intent,
      criteria: searchResult.criteria,
      assistantMessage: searchResult.clarificationQuestion,
      catalogCards: [],
      externalCards: [],
      searchResult,
    };
  }

  return {
    kind: 'catalog',
    intent: intentResult.intent,
    criteria: searchResult.criteria,
    assistantMessage: buildCatalogAssistantFallback(searchResult),
    catalogContext: formatCatalogResultsContext(searchResult),
    catalogCards: limitCatalogCards(searchResult),
    externalCards: [],
    searchResult,
  };
}

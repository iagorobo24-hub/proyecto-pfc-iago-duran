import type { SonexCatalogResult, SonexPreparedTurn, SonexProductSearchResult } from '../types/sonex';
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
  return [
    ...searchResult.exactMatches,
    ...searchResult.partialMatches,
    ...searchResult.relatedMatches,
  ].slice(0, 10);
}

export async function prepareSonexTurn(
  userMessage: string,
  state: { activeCategory?: string } = {},
): Promise<SonexPreparedTurn> {
  const intentResult = detectSonexIntent(userMessage);

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

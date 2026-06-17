import type { Product } from './catalog';

export type SonexIntent =
  | 'technical_question'
  | 'catalog_lookup'
  | 'product_recommendation'
  | 'product_comparison'
  | 'budget_action'
  | 'clarification_needed';

export interface SonexProductCriteria {
  productType?: string;
  family?: string;
  subfamily?: string;
  brand?: string;
  poles?: string;
  curve?: string;
  amps?: number;
  sensitivityMa?: number;
  breakingCapacity?: string;
  voltage?: string;
  quantity?: number;
  rawTerms: string[];
  confidence: number;
}

export interface SonexIntentResult {
  intent: SonexIntent;
  criteria: SonexProductCriteria;
  needsClarification: boolean;
  clarificationQuestion?: string;
}

export type SonexCatalogMatchType = 'exact' | 'partial' | 'related';

export interface SonexCatalogResult {
  source: 'catalog';
  matchType: SonexCatalogMatchType;
  score: number;
  matchedSpecs: string[];
  missingSpecs: string[];
  product: Product;
}

export interface SonexExternalResult {
  source: 'external_ai';
  matchType: 'suggested';
  score: number;
  name: string;
  brand?: string;
  reference?: string;
  specs: string[];
  reason: string;
  evidenceUrl?: string;
}

export interface SonexProductSearchResult {
  criteria: SonexProductCriteria;
  exactMatches: SonexCatalogResult[];
  partialMatches: SonexCatalogResult[];
  relatedMatches: SonexCatalogResult[];
  needsClarification: boolean;
  clarificationQuestion?: string;
}

export interface SonexPreparedTurn {
  kind: 'general' | 'catalog' | 'clarification';
  intent: SonexIntent;
  criteria: SonexProductCriteria;
  assistantMessage?: string;
  catalogContext?: string;
  catalogCards: SonexCatalogResult[];
  externalCards: SonexExternalResult[];
  searchResult?: SonexProductSearchResult;
}

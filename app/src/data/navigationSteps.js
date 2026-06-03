/**
 * Navigation step constants for FichasTecnicas wizard.
 * Replace all string literals with these to avoid typos.
 */
export const STEPS = {
  CATEGORIAS: 'categorias',
  MARCAS: 'marcas',
  CATEGORIAS_GRUPO: 'categorias_grupo',
  SUBCATEGORIAS: 'subcategorias',
  GAMAS: 'gamas',
  TIPOS: 'tipos',
  GAMAS_COMERCIALES: 'gamas_comerciales',
  SUBGAMAS: 'subgamas',
  REFERENCIAS: 'referencias',
  FICHA: 'ficha',
} as const

export type Step = typeof STEPS[keyof typeof STEPS]

/**
 * Clear maps — which state to reset when navigating back to a given step.
 */
export const CLEAR_AFTER_STEP: Record<Step, string[]> = {
  [STEPS.CATEGORIAS]: ['marca', 'categoriaGrupo', 'subcategoria', 'gama', 'tipo', 'gamaComercial', 'subgama', 'referencia', 'gamasDisponibles', 'tiposDisponibles', 'gamasComerciales', 'subgamas', 'referencias', 'grupos'],
  [STEPS.MARCAS]: ['categoriaGrupo', 'subcategoria', 'gama', 'tipo', 'gamaComercial', 'subgama', 'gamasComerciales', 'subgamas', 'referencia', 'referencias', 'gamasDisponibles', 'tiposDisponibles'],
  [STEPS.CATEGORIAS_GRUPO]: ['subcategoria', 'gamaComercial', 'subgama', 'gamasComerciales', 'subgamas', 'referencia', 'referencias'],
  [STEPS.SUBCATEGORIAS]: ['gamaComercial', 'subgama', 'gamasComerciales', 'subgamas', 'referencia', 'referencias'],
  [STEPS.GAMAS]: ['tipo', 'gamaComercial', 'subgama', 'gamasComerciales', 'subgamas', 'referencia', 'referencias', 'tiposDisponibles'],
  [STEPS.TIPOS]: ['gamaComercial', 'subgama', 'gamasComerciales', 'subgamas', 'referencia', 'referencias'],
  [STEPS.GAMAS_COMERCIALES]: ['subgama', 'subgamas', 'referencia', 'referencias'],
  [STEPS.SUBGAMAS]: ['referencia', 'referencias'],
  [STEPS.FICHA]: [],
}

export const STEP_LABELS: Record<Step, string> = {
  [STEPS.CATEGORIAS]: 'Categorías',
  [STEPS.MARCAS]: 'Marcas',
  [STEPS.CATEGORIAS_GRUPO]: 'Categoría',
  [STEPS.SUBCATEGORIAS]: 'Subcategoría',
  [STEPS.GAMAS]: 'Gamas',
  [STEPS.TIPOS]: 'Tipos',
  [STEPS.GAMAS_COMERCIALES]: 'Gama comercial',
  [STEPS.SUBGAMAS]: 'Subgama',
  [STEPS.FICHA]: 'Ficha',
}

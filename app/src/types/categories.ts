export interface CategoryMapping {
  categoria: string
  subcategoria: string | Record<string, string>
}

export interface CategoryMeta {
  label: string
  icon: string
  desc: string
  tip: string
}

export interface SubcategoriaSubfamilia {
  subfamilia: string
  tipo: string
}

export interface GrupoCategoria {
  icon: string
  subcategorias: Record<string, SubcategoriaSubfamilia[]>
}

export interface Product extends Record<string, unknown> {
  id: number;
  ref_fabricante: string;
  name: string;
  marca: string;
  brand_id?: number;
  familia: string;
  subfamilia: string;
  tipo: string;
  Gama?: string;
  Subgama?: string;
  imagen?: string;
  pdf_url?: string;
  precio?: number;
  descripcion?: string;
  documentos?: Array<{ nombre: string; url: string }>;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface SubfamiliaTipo {
  subfamilia: string;
  tipo: string;
}

export interface FiltroSubcategoria {
  subfamilia: string;
  tipo?: string;
}

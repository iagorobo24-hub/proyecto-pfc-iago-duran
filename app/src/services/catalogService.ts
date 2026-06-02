import { supabase } from '../supabase/supabaseClient';
import { validateProduct, validateBrand } from '../utils/validate';
import { log, logWarn, logError } from '../utils/logger';
import type { Product, Brand, Category, SubfamiliaTipo, FiltroSubcategoria } from '../types/catalog';

let marcasCache: Map<number, string> | null = null;
let marcasReverseCache: Map<string, number> | null = null;

async function findBrandIdByName(marca: string): Promise<number | null> {
  const marcasMap = await cargarMarcas();
  if (!marcasReverseCache) {
    marcasReverseCache = new Map();
    for (const [id, name] of marcasMap.entries()) {
      marcasReverseCache.set(name.trim(), id);
    }
  }
  return marcasReverseCache.get(marca.trim()) ?? null;
}

/* Mapeo de variantes → nombre canónico (usado en DB desde migración 001) */
const etiquetasFamilias: Record<string, string> = {
  /* Cables */
  'CABLES': 'Cables',
  'CABLES DE BAJA TENSION': 'Cables',
  'CABLES DE MEDIA TENSION': 'Cables',
  'CABLES DE ALTA TENSION': 'Cables',
  
  /* Automatización industrial */
  'AUTOMATIZACION': 'Automatización',
  'AUTOMATIZACION INDUSTRIAL': 'Automatización',
  'CONTROL Y AUTOMATIZACION INDUSTRIAL': 'Automatización',
  'AUTOMACION INDUSTRIAL': 'Automatización',
  
  /* Automatización de edificios (domótica) */
  'AUTOMATIZACION DE EDIFICIOS': 'Automatización de edificios',
  'DOMOTICA': 'Automatización de edificios',
  'DOMOTICA Y CONTROL': 'Automatización de edificios',
  
  /* Distribución de potencia */
  'DISTRIBUCION DE POTENCIA': 'Distribución de potencia',
  'POTENCIA': 'Distribución de potencia',
  
  /* Fotovoltaica */
  'FOTOVOLTAICA': 'Fotovoltaica',
  
  /* Instalación */
  'INSTALACION': 'Instalación',
  'CANALIZACION': 'Instalación',
  'CANALIZACIONES': 'Instalación',
  'BANDEJAS': 'Instalación',
  
  /* Iluminación */
  'ILUMINACION': 'Iluminación',
  'LUMINARIAS': 'Iluminación',
  
  /* Fotovoltaica */
  'FOTOVOLTAICA': 'Fotovoltaica',
  'FOTOVOLTAICA SOLAR': 'Fotovoltaica',
  'SOLAR': 'Fotovoltaica',
  'PANELES SOLARES': 'Fotovoltaica',
  
  /* Vehículos eléctricos */
  'VEHICULOS ELECTRICOS': 'Vehículos eléctricos',
  'VEHICULOS_ELECTRICOS': 'Vehículos eléctricos',
  'VEHICULO ELECTRICO': 'Vehículos eléctricos',
  
  /* Climatización */
  'CLIMATIZACION': 'Climatización',
  'HVAC': 'Climatización',
  'CLIMA': 'Climatización',
  
  /* Comunicación */
  'COMUNICACION': 'Comunicación',
  'COMUNICACIONES': 'Comunicación',
  'REDES': 'Comunicación',
  
  /* Herramientas */
  'HERRAMIENTAS': 'Herramientas',
  'HERRAMIENTAS Y MANIPULACION': 'Herramientas',
  
  /* Protección */
  'PROTECCION': 'Protección',
  'PROTECCION ELECTRICA': 'Protección',
  
  /* Fontanería */
  'FONTANERIA': 'Fontanería',
  'FONTANERÍA': 'Fontanería',
  
  /* Energías renovables */
  'ENERGIAS RENOVABLES': 'Energías renovables',
  'ENERGIAS RENOVABLES Y VEHICULO ELECTRICO': 'Energías renovables',
  'PLACAS SOLARES': 'Energías renovables',
}

async function cargarMarcas(): Promise<Map<number, string>> {
  if (marcasCache) return marcasCache;

  const { data, error } = await supabase
    .from('brands')
    .select('id, name');

  if (error) {
    logError('❌ Error cargando marcas:', error);
    return new Map();
  }

  marcasCache = new Map();
  marcasReverseCache = null;
  data?.forEach(b => { const valid = validateBrand(b as Record<string, unknown>); if (valid && valid.id) marcasCache!.set(valid.id as number, valid.name as string); });
  log('✅ Marcas cargadas:', marcasCache.size);
  return marcasCache;
}

export async function getCategorias(): Promise<Category[]> {
  try {
    log('📂 Cargando familias desde products...');

    // NOTA: Usamos limit alto porque Supabase defaultea a 1000 rows
    // Con 4689 productos necesitamos al menos 5000 para cubrir todos
    const { data, error } = await supabase
      .from('products')
      .select('familia')
      .not('familia', 'is', null)
      .limit(10000);

    if (error) {
      logError('❌ Error:', error);
      return [];
    }

    const familiasUnicas = [...new Set((data as Array<{ familia: string }>)?.map(p => p.familia?.trim()).filter(Boolean))];

    const categorias: Category[] = familiasUnicas.map(familia => ({
      id: familia,
      label: etiquetasFamilias[familia] || familia,
      icon: '📁',
      color: '#3b82f6'
    }));

    categorias.sort((a, b) => a.label.localeCompare(b.label));

    log('✅ Categorías cargadas:', categorias.length);
    return categorias;
  } catch (error) {
    logError('❌ Error getCategorias:', error);
    return [];
  }
}

export async function getMarcasPorCategoria(familia: string): Promise<{ nombre: string }[]> {
  try {
    log(`🏷️ Cargando marcas para: ${familia}`);

    const { data, error } = await supabase
      .from('products')
      .select('brand_id')
      .eq('familia', familia)
      .not('brand_id', 'is', null)
      .limit(5000);

    if (error) {
      logError('❌ Error:', error);
      return [];
    }

    const brandIdsUnicos = [...new Set((data as Array<{ brand_id: number }>)?.map(p => p.brand_id).filter(Boolean))];

    if (brandIdsUnicos.length === 0) {
      return [];
    }

    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name')
      .in('id', brandIdsUnicos);

    if (brandsError) {
      logError('❌ Error cargando brands:', brandsError);
      return [];
    }

    const marcas = (brands as Array<{ name: string }>)?.map(b => ({ nombre: b.name })).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    ) || [];

    return marcas;
  } catch (error) {
    logError('❌ Error getMarcasPorCategoria:', error);
    return [];
  }
}

export async function getGamasPorMarcaYCategoria(marca: string, familia: string): Promise<{ nombre: string }[]> {
  try {
    const brandId = await findBrandIdByName(marca);

    if (!brandId) {
      logWarn('⚠️ Marca no encontrada:', marca);
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select('subfamilia')
      .eq('familia', familia)
      .eq('brand_id', brandId)
      .not('subfamilia', 'is', null)
      .limit(5000);

    if (error) {
      logError('❌ Error:', error);
      return [];
    }

    const gamasUnicas = [...new Set((data as Array<{ subfamilia: string }>)?.map(p => p.subfamilia?.trim()).filter(Boolean))];
    const gamas = gamasUnicas.sort().map(nombre => ({ nombre }));

    return gamas;
  } catch (error) {
    logError('❌ Error getGamasPorMarcaYCategoria:', error);
    return [];
  }
}

export async function getTiposPorGamaMarcaYFamilia(gama: string, marca: string, familia: string): Promise<string[]> {
  try {
    const brandId = await findBrandIdByName(marca);

    if (!brandId) return [];

    const { data, error } = await supabase
      .from('products')
      .select('tipo')
      .eq('familia', familia)
      .eq('brand_id', brandId)
      .eq('subfamilia', gama)
      .not('tipo', 'is', null)
      .limit(5000);

    if (error) {
      logError('❌ Error:', error);
      return [];
    }

    const tiposUnicos = [...new Set((data as Array<{ tipo: string }>)?.map(p => p.tipo?.trim()).filter(Boolean))];
    return tiposUnicos.sort() as string[];
  } catch (error) {
    logError('❌ Error getTiposPorGamaMarcaYFamilia:', error);
    return [];
  }
}

export async function getProductosPorFiltro(
  familia: string,
  marca: string,
  gama: string,
  tipo: string,
  gamaComercial?: string,
  subgama?: string
): Promise<Product[]> {
  try {
    const brandId = await findBrandIdByName(marca);

    let query = supabase
      .from('products')
      .select('id, ref_fabricante, name, imagen, marca, familia, subfamilia, tipo, precio, Gama, Subgama, pdf_url')
      .eq('familia', familia)
      .eq('subfamilia', gama)
      .eq('tipo', tipo);

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }
    if (gamaComercial) {
      query = query.eq('Gama', gamaComercial);
    }
    if (subgama) {
      query = query.eq('Subgama', subgama);
    }

    const { data, error } = await query;

    if (error) {
      logError('❌ Error:', error);
      return [];
    }

    return ((data || []) as Record<string, unknown>[]).map(p => validateProduct(p) as unknown as Product);
  } catch (error) {
    logError('❌ Error getProductosPorFiltro:', error);
    return [];
  }
}

export async function getGamasPorFiltro(
  familia: string,
  marca: string,
  gamaSubfamilia: string,
  tipo: string
): Promise<string[]> {
  try {
    const brandId = await findBrandIdByName(marca);
    if (!brandId) return [];

    const { data, error } = await supabase
      .from('products')
      .select('Gama')
      .eq('familia', familia)
      .eq('brand_id', brandId)
      .eq('subfamilia', gamaSubfamilia)
      .eq('tipo', tipo)
      .not('Gama', 'is', null)
      .limit(5000);

    if (error) {
      logError('❌ Error getGamasPorFiltro:', error);
      return [];
    }

    const unique = [...new Set((data as Array<{ Gama: string }>)?.map(p => p.Gama?.trim()).filter(Boolean))];
    return unique.sort() as string[];
  } catch (error) {
    logError('❌ Error getGamasPorFiltro:', error);
    return [];
  }
}

export async function getSubgamasPorFiltro(
  familia: string,
  marca: string,
  gamaSubfamilia: string,
  tipo: string,
  gamaComercial?: string
): Promise<string[]> {
  try {
    const brandId = await findBrandIdByName(marca);
    if (!brandId) return [];

    let query = supabase
      .from('products')
      .select('Subgama')
      .eq('familia', familia)
      .eq('subfamilia', gamaSubfamilia)
      .eq('tipo', tipo)
      .eq('brand_id', brandId)
      .not('Subgama', 'is', null)
      .limit(5000);

    if (gamaComercial) {
      query = query.eq('Gama', gamaComercial);
    }

    const { data, error } = await query;
    if (error) {
      logError('❌ Error getSubgamasPorFiltro:', error);
      return [];
    }

    const unique = [...new Set((data as Array<{ Subgama: string }>)?.map(p => p.Subgama?.trim()).filter(Boolean))];
    return unique.sort() as string[];
  } catch (error) {
    logError('❌ Error getSubgamasPorFiltro:', error);
    return [];
  }
}

export async function getSubfamiliasConTipos(marca: string, familia: string): Promise<SubfamiliaTipo[]> {
  try {
    const brandId = await findBrandIdByName(marca);
    if (!brandId) return [];

    const { data, error } = await supabase
      .from('products')
      .select('subfamilia, tipo')
      .eq('familia', familia)
      .eq('brand_id', brandId)
      .not('subfamilia', 'is', null)
      .limit(5000);

    if (error) {
      logError('❌ Error getSubfamiliasConTipos:', error);
      return [];
    }

    const pares = new Map<string, SubfamiliaTipo>();
    (data as Array<{ subfamilia: string; tipo: string }>)?.forEach(p => {
      if (p.subfamilia && p.tipo) {
        const key = `${p.subfamilia}|${p.tipo}`;
        if (!pares.has(key)) {
          pares.set(key, { subfamilia: p.subfamilia.trim(), tipo: p.tipo.trim() });
        }
      }
    });

    return [...pares.values()];
  } catch (error) {
    logError('❌ Error getSubfamiliasConTipos:', error);
    return [];
  }
}

export async function getProductosPorSubcategoria(
  familia: string,
  marca: string,
  filtros: FiltroSubcategoria[],
  gamaComercial?: string,
  subgama?: string
): Promise<Product[]> {
  try {
    const brandId = await findBrandIdByName(marca);
    if (!brandId) return [];

    const conditions = filtros.map(f => {
      const sub = sanitizeFilterValue(f.subfamilia);
      if (f.tipo) {
        const tipo = sanitizeFilterValue(f.tipo);
        return `and(subfamilia.eq.${sub},tipo.eq.${tipo})`;
      }
      return `subfamilia.eq.${sub}`;
    });

    let query = supabase
      .from('products')
      .select('id, ref_fabricante, name, imagen, marca, familia, subfamilia, tipo, precio, Gama, Subgama, pdf_url')
      .eq('familia', familia)
      .eq('brand_id', brandId)
      .or(conditions.join(','));

    if (gamaComercial) {
      query = query.eq('Gama', gamaComercial);
    }
    if (subgama) {
      query = query.eq('Subgama', subgama);
    }

    const { data, error } = await query;
    if (error) {
      logError('❌ Error getProductosPorSubcategoria:', error);
      return [];
    }
    return ((data || []) as Record<string, unknown>[]).map(p => validateProduct(p) as unknown as Product);
  } catch (error) {
    logError('❌ Error getProductosPorSubcategoria:', error);
    return [];
  }
}

export async function getSubgamasPorSubcategoria(
  familia: string,
  marca: string,
  filtros: FiltroSubcategoria[],
  gamaComercial?: string
): Promise<string[]> {
  try {
    const brandId = await findBrandIdByName(marca);
    if (!brandId) return [];

    const conditions = filtros.map(f => {
      const sub = sanitizeFilterValue(f.subfamilia);
      if (f.tipo) {
        const tipo = sanitizeFilterValue(f.tipo);
        return `and(subfamilia.eq.${sub},tipo.eq.${tipo})`;
      }
      return `subfamilia.eq.${sub}`;
    });

    let query = supabase
      .from('products')
      .select('Subgama')
      .eq('familia', familia)
      .eq('brand_id', brandId)
      .not('Subgama', 'is', null)
      .or(conditions.join(','))
      .limit(5000);

    if (gamaComercial) {
      query = query.eq('Gama', gamaComercial);
    }

    const { data, error } = await query;
    if (error) {
      logError('❌ Error getSubgamasPorSubcategoria:', error);
      return [];
    }

    const unique = [...new Set((data as Array<{ Subgama: string }>)?.map(p => p.Subgama?.trim()).filter(Boolean))];
    return unique.sort() as string[];
  } catch (error) {
    logError('❌ Error getSubgamasPorSubcategoria:', error);
    return [];
  }
}

export async function getGamasPorSubcategoria(
  familia: string,
  marca: string,
  filtros: FiltroSubcategoria[]
): Promise<string[]> {
  try {
    const brandId = await findBrandIdByName(marca);
    if (!brandId) return [];

    const conditions = filtros.map(f => {
      const sub = sanitizeFilterValue(f.subfamilia);
      if (f.tipo) {
        const tipo = sanitizeFilterValue(f.tipo);
        return `and(subfamilia.eq.${sub},tipo.eq.${tipo})`;
      }
      return `subfamilia.eq.${sub}`;
    });

    const { data, error } = await supabase
      .from('products')
      .select('Gama')
      .eq('familia', familia)
      .eq('brand_id', brandId)
      .not('Gama', 'is', null)
      .or(conditions.join(','))
      .limit(5000);

    if (error) {
      logError('❌ Error getGamasPorSubcategoria:', error);
      return [];
    }

    const unique = [...new Set((data as Array<{ Gama: string }>)?.map(p => p.Gama?.trim()).filter(Boolean))];
    return unique.sort() as string[];
  } catch (error) {
    logError('❌ Error getGamasPorSubcategoria:', error);
    return [];
  }
}

export async function getProductoPorRef(ref: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('ref_fabricante', ref)
      .maybeSingle();

    if (error) throw error;
    return data ? (validateProduct(data as Record<string, unknown>) as unknown as Product) : null;
  } catch (error) {
    logError('❌ Error getProductoPorRef:', error);
    return null;
  }
}

function sanitizeFilterValue(v: string): string {
  return v.replace(/[().,]/g, '')
}

function sanitizeSearchInput(t: string): string {
  return t.replace(/[(),]/g, '').replace(/[%_]/g, '\\$&')
}

export async function buscarProductos(termino: string): Promise<Product[]> {
  try {
    const t = sanitizeSearchInput(termino.trim());
    const { data, error } = await supabase
      .from('products')
      .select('id, ref_fabricante, name, imagen, marca, familia, subfamilia, tipo, precio')
      .or(`name.ilike.%${t}%,ref_fabricante.ilike.%${t}%`)
      .limit(20);

    if (error) throw error;
    return ((data || []) as Record<string, unknown>[]).map(p => validateProduct(p) as unknown as Product);
  } catch (error) {
    logError('❌ Error buscarProductos:', error);
    return [];
  }
}

export async function buscarProductosConLimite(termino: string, limite: number = 5): Promise<Product[]> {
  try {
    const t = sanitizeSearchInput(termino.trim());
    const { data, error } = await supabase
      .from('products')
      .select('id, ref_fabricante, name, imagen, marca, familia, subfamilia, tipo, precio')
      .or(`name.ilike.%${t}%,ref_fabricante.ilike.%${t}%`)
      .limit(limite);

    if (error) throw error;
    return ((data || []) as Record<string, unknown>[]).map(p => validateProduct(p) as unknown as Product);
  } catch (error) {
    logError('❌ Error buscarProductosConLimite:', error);
    return [];
  }
}

export async function getCatalogStats(): Promise<{ totalProducts: number }> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return { totalProducts: count || 0 };
  } catch (error) {
    logError('❌ Error getCatalogStats:', error);
    return { totalProducts: 0 };
  }
}

export async function initCatalog(): Promise<Record<string, never>> {
  await cargarMarcas();
  return {};
}

export default {
  initCatalog,
  getCategorias,
  getMarcasPorCategoria,
  getGamasPorMarcaYCategoria,
  getTiposPorGamaMarcaYFamilia,
  getSubfamiliasConTipos,
  getProductosPorSubcategoria,
  getGamasPorSubcategoria,
  getSubgamasPorSubcategoria,
  getProductosPorFiltro,
  getGamasPorFiltro,
  getSubgamasPorFiltro,
  getProductoPorRef,
  buscarProductos,
  buscarProductosConLimite,
  getCatalogStats
};

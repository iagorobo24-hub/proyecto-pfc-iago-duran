/**
 * @file catalogService.ts
 * @description Servicio cliente para la interacción con el catálogo de productos eléctricos en Supabase.
 * Permite buscar productos, consultar categorías (familias), marcas y gamas disponibles.
 * Emplea caché interno para marcas y mapeos de categorización optimizados para velocidad O(1).
 */

import { supabase } from '../supabase/supabaseClient';
import { validateProduct, validateBrand } from '../utils/validate';
import { log, logWarn, logError } from '../utils/logger';
import type { Product, Brand, Category, SubfamiliaTipo, FiltroSubcategoria } from '../types/catalog';

// Caché en memoria para evitar consultas redundantes a la tabla de marcas (brands)
let marcasCache: Map<number, string> | null = null;
let marcasReverseCache: Map<string, number> | null = null;

/**
 * Busca el ID de una marca a partir de su nombre (ignorando espacios en los extremos).
 * Utiliza el caché cargado para realizar una resolución O(1).
 * 
 * @param {string} marca - Nombre de la marca
 * @returns {Promise<number|null>} ID de la marca o null si no se encuentra
 */
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

/**
 * Mapeo de variantes o etiquetas de familias recuperadas de la base de datos
 * a nombres canónicos formateados para el usuario (Lookup O(1)).
 */
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
  'CONTROL Y AUTOMATIZACION': 'Automatización',
  'AUTOMACION INDUSTRIAL': 'Automatización',
  
  /* Automatización de edificios (domótica) */
  'AUTOMATIZACION DE EDIFICIOS': 'Automatización de edificios',
  'DOMOTICA': 'Automatización de edificios',
  'DOMOTICA Y CONTROL': 'Automatización de edificios',
  
  /* Distribución de potencia */
  'DISTRIBUCION DE POTENCIA': 'Protecciones y Cuadros',
  'POTENCIA': 'Protecciones y Cuadros',
  
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

/**
 * Carga las marcas desde la base de datos de Supabase y las almacena en caché local.
 * Valida la estructura de cada marca cargada.
 * 
 * @returns {Promise<Map<number, string>>} Mapa de ID a nombre de marca
 */
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
  data?.forEach(b => { 
    const valid = validateBrand(b as Record<string, unknown>); 
    if (valid && valid.id) {
      marcasCache!.set(valid.id as number, valid.name as string); 
    }
  });
  log('✅ Marcas cargadas:', marcasCache.size);
  return marcasCache;
}

/**
 * Obtiene todas las categorías principales (familias) de productos disponibles.
 * Utiliza una vista optimizada en base de datos (`vw_unique_families`) para alto rendimiento.
 * 
 * @export
 * @returns {Promise<Category[]>} Listado de categorías mapeadas
 */
export async function getCategorias(): Promise<Category[]> {
  try {
    log('📂 Cargando familias desde vw_unique_families...');

    // La vista vw_unique_families devuelve DISTINCT familias reduciendo
    // el volumen de transferencia de datos de miles a unas pocas decenas de filas.
    const { data, error } = await supabase
      .from('vw_unique_families')
      .select('familia');

    if (error) {
      logError('❌ Error cargando familias:', error);
      return [];
    }

    const familiasUnicas = (data as Array<{ familia: string }>)
      .map(p => p.familia?.trim())
      .filter(Boolean);

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

/**
 * Recupera el listado de marcas que poseen productos dentro de una familia/categoría específica.
 * 
 * @export
 * @param {string} familia - Nombre de la familia de productos
 * @returns {Promise<{ nombre: string }[]>} Listado de marcas ordenadas
 */
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

/**
 * Obtiene las subfamilias (gamas principales) de una marca específica dentro de una categoría.
 * 
 * @export
 * @param {string} marca - Nombre de la marca
 * @param {string} familia - Nombre de la categoría/familia
 * @returns {Promise<{ nombre: string }[]>} Subfamilias encontradas
 */
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

/**
 * Obtiene los tipos específicos de productos que pertenecen a una gama, marca y familia dadas.
 * 
 * @export
 * @param {string} gama - Subfamilia/gama
 * @param {string} marca - Nombre de la marca
 * @param {string} familia - Nombre de la familia
 * @returns {Promise<string[]>} Tipos únicos encontrados ordenados
 */
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

/**
 * Realiza una consulta filtrada de productos basada en todos los criterios del catálogo.
 * 
 * @export
 * @param {string} familia - Categoría principal
 * @param {string} marca - Marca del producto
 * @param {string} gama - Subfamilia principal
 * @param {string} tipo - Tipo de producto
 * @param {string} [gamaComercial] - Gama comercial del fabricante
 * @param {string} [subgama] - Subgama comercial
 * @returns {Promise<Product[]>} Listado de productos filtrados y validados
 */
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

/**
 * Consulta las gamas comerciales asociadas a un determinado filtro del catálogo.
 * 
 * @export
 */
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

/**
 * Consulta las subgamas comerciales asociadas a un filtro y gama comercial dados.
 * 
 * @export
 */
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

/**
 * Recupera todas las combinaciones únicas de subfamilia y tipo para una marca y categoría.
 * 
 * @export
 */
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

/**
 * Consulta productos usando múltiples filtros compuestos (filtros de subcategorías con tipo opcional).
 * 
 * @export
 */
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

/**
 * Obtiene las subgamas asociadas a una subcategoría con filtros dinámicos complejos.
 * 
 * @export
 */
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

/**
 * Obtiene las gamas asociadas a una subcategoría con filtros dinámicos complejos.
 * 
 * @export
 */
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

/**
 * Consulta un producto de forma unívoca a través de su referencia de fabricante.
 * 
 * @export
 * @param {string} ref - Referencia del fabricante
 * @returns {Promise<Product|null>} Datos del producto o null si no se encuentra
 */
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

/**
 * Limpia caracteres especiales reservados de SQL/URL de los filtros para evitar inyecciones.
 */
function sanitizeFilterValue(v: string): string {
  return v.replace(/[().,]/g, '')
}

/**
 * Escapa caracteres comodín de SQL (%, _) para búsquedas de texto seguras.
 */
function sanitizeSearchInput(t: string): string {
  return t.replace(/[(),]/g, '').replace(/[%_]/g, '\\$&')
}

/**
 * Realiza una búsqueda libre de productos por término de búsqueda (nombre o referencia).
 * 
 * @export
 * @param {string} termino - Texto a buscar
 * @param {number} [limite=20] - Número máximo de registros a recuperar
 * @returns {Promise<Product[]>} Productos encontrados validados
 */
export async function buscarProductos(termino: string, limite: number = 20): Promise<Product[]> {
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
    logError('❌ Error buscarProductos:', error);
    return [];
  }
}

export interface CatalogProductSearchParams {
  familia?: string;
  subfamilia?: string;
  marca?: string;
  terms?: string[];
  requiredTermGroups?: string[][];
  limite?: number;
}

const CATALOG_SEARCH_COLUMNS = ['name', 'ref_fabricante', 'marca', 'tipo', 'Gama', 'Subgama'];

function sanitizeSearchTerms(terms: string[] | undefined, limit: number): string[] {
  return [...new Set((terms || [])
    .map(term => sanitizeSearchInput(term.trim()))
    .filter(term => term.length > 1)
  )].slice(0, limit);
}

function buildCatalogTextFilters(terms: string[]): string[] {
  return terms.flatMap(term =>
    CATALOG_SEARCH_COLUMNS.map(column => `${column}.ilike.%${term}%`)
  );
}

/**
 * Busca productos para flujos asistidos por criterios técnicos.
 * Aplica filtros estructurados en Supabase y deja el ranking fino al cliente.
 */
export async function buscarProductosCatalogo(params: CatalogProductSearchParams): Promise<Product[]> {
  try {
    const limite = Math.min(Math.max(params.limite || 80, 1), 150);
    let query = supabase
      .from('products')
      .select('id, ref_fabricante, name, imagen, marca, familia, subfamilia, tipo, precio, Gama, Subgama, pdf_url')
      .limit(limite);

    if (params.familia) {
      query = query.eq('familia', params.familia);
    }
    if (params.subfamilia) {
      query = query.eq('subfamilia', params.subfamilia);
    }
    if (params.marca) {
      query = query.ilike('marca', `%${sanitizeSearchInput(params.marca.trim())}%`);
    }

    const terms = sanitizeSearchTerms(params.terms, 10);

    const requiredTermGroups = (params.requiredTermGroups || [])
      .map(group => sanitizeSearchTerms(group, 4))
      .filter(group => group.length > 0)

    for (const group of requiredTermGroups) {
      query = query.or(buildCatalogTextFilters(group).join(','));
    }

    if (terms.length > 0) {
      query = query.or(buildCatalogTextFilters(terms).join(','));
    }

    const { data, error } = await query;
    if (error) throw error;
    return ((data || []) as Record<string, unknown>[]).map(p => validateProduct(p) as unknown as Product);
  } catch (error) {
    logError('❌ Error buscarProductosCatalogo:', error);
    return [];
  }
}

/**
 * Consulta las estadísticas agregadas del catálogo (total de productos, marcas y familias).
 * 
 * @export
 * @returns {Promise<{ totalProducts: number; totalBrands: number; totalFamilies: number }>}
 */
export async function getCatalogStats(): Promise<{ totalProducts: number; totalBrands: number; totalFamilies: number }> {
  try {
    const [productsRes, brandsRes, familiesRes] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('brands').select('*', { count: 'exact', head: true }),
      supabase.from('vw_unique_families').select('familia')
    ]);

    if (productsRes.error) throw productsRes.error;

    return {
      totalProducts: productsRes.count || 0,
      totalBrands: brandsRes.count || brandsRes.data?.length || 0,
      totalFamilies: familiesRes.data?.length || 0
    };
  } catch (error) {
    logError('❌ Error getCatalogStats:', error);
    return { totalProducts: 0, totalBrands: 0, totalFamilies: 0 };
  }
}

/**
 * Inicializa el catálogo precargando datos estables (marcas) en caché.
 * 
 * @export
 * @returns {Promise<Record<string, never>>} Objeto vacío
 */
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
  buscarProductosCatalogo,
  getCatalogStats
};

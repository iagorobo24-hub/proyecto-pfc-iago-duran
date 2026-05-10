/**
 * SERVICIO DE CATÁLOGO (SUPABASE)
 * Flujo: Categoría → Marca → Gama (subfamilia) → Tipo → Referencia
 */
import { createClient } from '@supabase/supabase-js';
import { ServiceError } from './errorHandler';
import { normalizarFamilia, CATEGORIAS_VALIDAS } from '../data/familiaMapping';

// Cliente Supabase
const supabaseUrl = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2MDY5NSwiZXhwIjoyMDg4OTM2Njk1fQ.3DfYKquAUFFNx_c8NdMWmic7pVVckWsXEZWOJTuC5wg';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

let hierarchyCache = null;
let brandsCache = null;

/**
 * Obtiene todas las categorías desde Supabase
 */
export async function getCategorias() {
  try {
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    
    if (!categories) return [];
    
    return categories.map(cat => ({
      id: cat.name.toUpperCase().replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Á/g, 'A').replace(/É/g, 'E').replace(/-/g, ' ').trim(),
      label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
      icon: '📁',
      color: '#3b82f6'
    }));
  } catch (error) {
    console.error('Error en getCategorias:', error);
    return [];
  }
}

/**
 * Obtiene el árbol jerárquico completo
 * Estructura: { [categoria]: { [marca]: { [gama]: [tipos] } } }
 */
async function getHierarchy() {
  if (hierarchyCache) return hierarchyCache;

  try {
    // 1. Obtener todas las marcas
    const { data: allBrands } = await supabase
      .from('brands')
      .select('id, name');
    
    const brandMap = new Map(allBrands?.map(b => [b.id, b.name]) || []);
    brandsCache = brandMap;

    // 2. Leer productos en bloques
    const tree = {};
    let offset = 0;
    const batchSize = 10000;
    let totalLeidos = 0;

    while (true) {
      const { data: products, error } = await supabase
        .from('products')
        .select('familia, subfamilia, tipo, brand_id')
        .range(offset, offset + batchSize - 1);

      if (error || !products || products.length === 0) break;

      products.forEach(p => {
        // Normalizar familia a categoría
        const categoria = normalizarFamilia(p.familia);
        if (!categoria || !CATEGORIAS_VALIDAS.includes(categoria)) return;

        const marca = brandMap.get(p.brand_id)?.trim() || 'DESCONOCIDA';
        const gama = p.subfamilia?.toUpperCase().trim() || 'GENERAL';
        const tipo = p.tipo?.toUpperCase().trim() || 'GENERAL';

        // Construir árbol
        if (!tree[categoria]) tree[categoria] = {};
        if (!tree[categoria][marca]) tree[categoria][marca] = {};
        if (!tree[categoria][marca][gama]) tree[categoria][marca][gama] = new Set();
        
        tree[categoria][marca][gama].add(tipo);
      });

      totalLeidos += products.length;
      offset += batchSize;
      if (products.length < batchSize) break;
      if (totalLeidos >= 50000) break; // Límite de seguridad
    }

    // Convertir Sets a arrays
    Object.values(tree).forEach(marcas => {
      Object.values(marcas).forEach(gamas => {
        Object.keys(gamas).forEach(gama => {
          gamas[gama] = [...gamas[gama]];
        });
      });
    });

    hierarchyCache = tree;
    console.log('✅ hierarchyCache generado:', {
      categorias: Object.keys(tree).length,
      totalMarcas: Object.values(tree).reduce((acc, cat) => acc + Object.keys(cat).length, 0)
    });

    return tree;
  } catch (error) {
    console.error('❌ Error en getHierarchy:', error);
    hierarchyCache = {};
    return {};
  }
}

/**
 * Obtiene marcas por categoría
 */
export async function getMarcasPorCategoria(categoria) {
  try {
    const tree = await getHierarchy();
    const marcas = tree[categoria] || {};
    return Object.keys(marcas).sort().map(nombre => ({ nombre }));
  } catch (error) {
    console.error('Error en getMarcasPorCategoria:', error);
    return [];
  }
}

/**
 * Obtiene gamas por marca y categoría
 */
export async function getGamasPorMarcaYCategoria(marca, categoria) {
  try {
    const tree = await getHierarchy();
    const gamas = tree[categoria]?.[marca] || {};
    return Object.keys(gamas).sort().map(nombre => ({ nombre }));
  } catch (error) {
    console.error('Error en getGamasPorMarcaYCategoria:', error);
    return [];
  }
}

/**
 * Obtiene tipos por gama, marca y categoría
 */
export async function getTiposPorGamaMarcaYFamilia(gama, marca, categoria) {
  try {
    const tree = await getHierarchy();
    const tipos = tree[categoria]?.[marca]?.[gama] || [];
    return tipos;
  } catch (error) {
    console.error('Error en getTiposPorGamaMarcaYFamilia:', error);
    return [];
  }
}

/**
 * Obtiene productos filtrados
 */
export async function getProductosPorFiltro(categoria, marca, gama, tipo) {
  try {
    // Obtener brand_id
    const brandId = brandsCache?.get(marca) 
      ? [...brandsCache].find(([_, v]) => v === marca)?.[0]
      : null;

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('familia', categoria)
      .eq('brand_id', brandId || null)
      .eq('subfamilia', gama)
      .eq('tipo', tipo)
      .limit(100);

    return products?.map(p => ({
      ref: p.ref_fabricante,
      desc: p.name,
      marca,
      precio: p.precio || 0,
      ...p
    })) || [];
  } catch (error) {
    console.error('Error en getProductosPorFiltro:', error);
    return [];
  }
}

/**
 * Obtiene producto por referencia
 */
export async function getProductoPorRef(ref) {
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('ref_fabricante', ref)
      .single();

    return data || null;
  } catch (error) {
    return null;
  }
}

/**
 * Búsqueda de productos
 */
export async function buscarProductos(termino) {
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${termino}%`)
      .limit(10);

    return data || [];
  } catch (error) {
    return [];
  }
}

/**
 * Estadísticas del catálogo
 */
export async function getCatalogStats() {
  try {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    return { totalProducts: count || 0 };
  } catch (error) {
    return { totalProducts: 0 };
  }
}

// Export default para compatibilidad
export default {
  getCategorias,
  getHierarchy,
  getMarcasPorCategoria,
  getGamasPorMarcaYCategoria,
  getTiposPorGamaMarcaYFamilia,
  getProductosPorFiltro,
  getProductoPorRef,
  buscarProductos,
  getCatalogStats
};

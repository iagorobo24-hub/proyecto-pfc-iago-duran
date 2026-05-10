/**
 * SERVICIO DE CATÁLOGO (SUPABASE)
 * Reemplaza a Firestore para la gestión del catálogo
 * Mantiene la misma interfaz pública para compatibilidad con hooks existentes
 */
import { createClient } from '@supabase/supabase-js';
import { ServiceError } from './errorHandler';

// Inicializar cliente de Supabase - usando URL directa para evitar problemas de env
const supabaseUrl = 'https://fncmzrnmzmuhlullkrud.supabase.co';
// NOTA: Esta es la anon key, es segura para cliente
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2MDY5NSwiZXhwIjoyMDg4OTM2Njk1fQ.3DfYKquAUFFNx_c8NdMWmic7pVVckWsXEZWOJTuC5wg';

console.log('🔍 [catalogService] Inicializando Supabase client...');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

let hierarchyCache = null;
const productCache = new Map();

/**
 * Obtiene todas las categorías desde Supabase
 */
export async function getCategorias() {
  console.log('🔍 [catalogService] getCategorias() llamado');
  console.log('🔍 [catalogService] supabaseUrl:', import.meta.env.VITE_SUPABASE_URL || 'usando default');
  console.log('🔍 [catalogService] supabaseKey:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'KEY PRESENTE' : 'KEY AUSENTE');
  
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    
    console.log('🔍 [catalogService] Resultado Supabase:', { 
      count: categories?.length, 
      error: error?.message 
    });
    
    if (error) throw error;
    
    const result = categories.map(cat => ({
      id: cat.name.toUpperCase().replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Á/g, 'A').replace(/É/g, 'E').replace(/-/g, ' ').trim(),
      label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
      icon: '📁',
      color: '#3b82f6'
    }));
    
    console.log('✅ [catalogService] getCategorias() completado:', result.length, 'categorías');
    return result;
  } catch (error) {
    console.error('❌ [catalogService] Error en getCategorias:', error.message);
    return [];
  }
}

/**
 * Obtiene el árbol de jerarquía completo
 * Fuente primaria: Supabase (categorias y marcas reales)
 * Cachea en memoria para evitar múltiples llamadas
 */
async function getHierarchy() {
  if (hierarchyCache) return hierarchyCache;

  try {
    console.log('🔍 [getHierarchy] Iniciando carga desde Supabase...');
    
    // Obtener todas las categorías de Supabase
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (catError) throw catError;
    console.log('🔍 [getHierarchy] Categorías:', categories.map(c => c.name));

    // Obtener todos los productos para extraer marcas por categoría
    console.log('🔍 [getHierarchy] Leyendo productos...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('familia, brand_id')
      .limit(100000);

    if (prodError) {
      console.error('Error leyendo productos:', prodError);
    } else {
      console.log('🔍 [getHierarchy] Productos leídos:', products?.length || 0);
    }

    // Obtener todas las marcas
    const { data: brands } = await supabase
      .from('brands')
      .select('id, name');

    const brandMap = new Map(brands?.map(b => [b.id, b.name]) || []);
    console.log('🔍 [getHierarchy] Marcas mapeadas:', brandMap.size);

    // Construir árbol: Familia (de products) -> Marca
    const tree = {};
    
    // Inicializar categorías desde Supabase
    categories.forEach(cat => {
      const catName = cat.name.toUpperCase().replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Á/g, 'A').replace(/É/g, 'E').replace(/-/g, ' ').trim();
      tree[catName] = {};
      console.log('  - Categoría inicializada:', catName);
    });

    // Extraer marcas por familia desde products
    let productosProcesados = 0;
    if (products) {
      products.forEach(p => {
        if (!p.familia) return;
        const familia = p.familia.toUpperCase().trim();
        const marca = brandMap.get(p.brand_id)?.trim() || 'DESCONOCIDA';
        
        if (!tree[familia]) tree[familia] = {};
        if (!tree[familia][marca]) {
          tree[familia][marca] = [];
          productosProcesados++;
        }
      });
    }
    
    console.log('🔍 [getHierarchy] Total familias:', Object.keys(tree).length);
    console.log('🔍 [getHierarchy] Total marcas procesadas:', productosProcesados);
    console.log('🔍 [getHierarchy] Ejemplo árbol:', Object.keys(tree).slice(0, 3), '...');

    hierarchyCache = tree;
    return hierarchyCache;
  } catch (error) {
    console.error('❌ [getHierarchy] Error:', error.message);
    hierarchyCache = {};
    return hierarchyCache;
  }
}

/**
 * Obtiene marcas filtradas por categoría
 */
export async function getMarcasPorCategoria(categoria) {
  try {
    console.log('🔍 [getMarcasPorCategoria] Buscando categoría:', categoria);
    const tree = await getHierarchy();
    console.log('🔍 [getMarcasPorCategoria] Árbol cargado, keys:', Object.keys(tree));
    
    const fam = Object.keys(tree).find(k => 
      k.toUpperCase().includes(categoria.toUpperCase())
    );
    
    console.log('🔍 [getMarcasPorCategoria] Familia encontrada:', fam);
    
    if (!fam) return [];
    
    const marcas = Object.keys(tree[fam]).sort().map(m => ({ 
      nombre: m, 
      color: "#666" 
    }));
    
    console.log('🔍 [getMarcasPorCategoria] Marcas encontradas:', marcas.length);
    return marcas;
  } catch (error) {
    console.error('❌ Error al obtener marcas:', error);
    throw ServiceError.from(error, 'catalog.getMarcasPorCategoria');
  }
}

/**
 * Obtiene gamas por marca y categoría
 */
export async function getGamasPorMarcaYCategoria(marca, categoria) {
  try {
    const tree = await getHierarchy();
    const fam = Object.keys(tree).find(k => 
      k.toUpperCase().includes(categoria.toUpperCase())
    );
    
    if (!fam || !tree[fam][marca]) return [];
    
    return Object.keys(tree[fam][marca]).sort().map(g => ({ 
      nombre: g 
    }));
  } catch (error) {
    console.error('Error al obtener gamas:', error);
    throw ServiceError.from(error, 'catalog.getGamasPorMarcaYCategoria');
  }
}

/**
 * Obtiene tipos por gama, marca y categoría
 */
export async function getTiposPorGamaMarcaYFamilia(gama, marca, categoria) {
  try {
    const tree = await getHierarchy();
    const fam = Object.keys(tree).find(k => 
      k.toUpperCase().includes(categoria.toUpperCase())
    );
    
    if (!fam || !tree[fam][marca] || !tree[fam][marca][gama]) return [];
    
    return tree[fam][marca][gama].sort();
  } catch (error) {
    console.error('Error al obtener tipos:', error);
    throw ServiceError.from(error, 'catalog.getTiposPorGamaMarcaYFamilia');
  }
}

/**
 * Obtiene productos filtrados por categoría, marca, gama y tipo
 */
export async function getProductosPorFiltro(categoria, marca, gama, tipo) {
  try {
    console.log('🔍 Buscando en Supabase:', { categoria, marca, gama, tipo });
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('familia', categoria)
      .eq('brand_id', async () => {
        // Obtener brand_id desde la tabla brands
        const { data: brandData } = await supabase
          .from('brands')
          .select('id')
          .eq('name', marca)
          .single();
        return brandData?.id || null;
      })
      .eq('subfamilia', gama)
      .eq('tipo', tipo)
      .limit(100);

    const { data, error } = await query;

    if (error) throw error;
    
    // Mapear a formato esperado
    const result = (data || []).map(p => ({
      ref: p.ref_fabricante || p.ref_sonepar,
      desc: p.name,
      marca: p.marca || marca,
      precio: p.precio || 0,
      familia: p.familia,
      gama: p.subfamilia,
      tipo: p.tipo,
      ...p
    }));
    
    console.log(`✅ Supabase devolvió ${result.length} productos`);
    return result;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw ServiceError.from(error, 'catalog.getProductosPorFiltro');
  }
}

/**
 * Obtiene un producto por referencia
 */
export async function getProductoPorRef(ref) {
  if (!ref) return null;
  
  const cacheKey = ref.toUpperCase();
  
  // Usar caché si existe
  if (productCache.has(cacheKey)) {
    console.log(`📦 Usando caché para ref: ${cacheKey}`);
    return productCache.get(cacheKey);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('ref_fabricante', ref)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (data) {
      productCache.set(cacheKey, data);
    }
    
    return data;
  } catch (error) {
    console.error('Error al buscar producto:', error);
    return null;
  }
}

/**
 * Búsqueda por palabra clave
 */
export async function buscarProductos(termino) {
  if (!termino || termino.length < 3) return [];
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${termino}%`)
      .limit(10);
    
    if (error) throw error;
    
    return (data || []).map(p => ({
      ref: p.ref_fabricante,
      nombre: p.name,
      marca: p.marca,
      precio: p.precio,
      ...p
    }));
  } catch (error) {
    console.error('Error buscando productos:', error);
    return [];
  }
}

/**
 * Obtiene estadísticas del catálogo
 */
export async function getCatalogStats() {
  try {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    return {
      totalProducts: count || 0,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching catalog stats:', error);
    return { totalProducts: 0 };
  }
}

// Export por defecto para compatibilidad
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

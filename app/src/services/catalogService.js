/**
 * SERVICIO DE CATÁLOGO (SUPABASE)
 * Reemplaza a Firestore para la gestión del catálogo
 * Mantiene la misma interfaz pública para compatibilidad con hooks existentes
 */
import { createClient } from '@supabase/supabase-js';
import { ServiceError } from './errorHandler';

// Inicializar cliente de Supabase desde variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fncmzrnmzmuhlullkrud.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

let hierarchyCache = null;
const productCache = new Map();

/**
 * Obtiene todas las categorías desde Supabase
 */
export async function getCategorias() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    
    if (error) throw error;
    
    // Mapear a formato esperado por la UI
    return categories.map(cat => ({
      id: cat.name.toUpperCase().replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Á/g, 'A').replace(/É/g, 'E').replace(/-/g, ' ').trim(),
      label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
      icon: '📁',
      color: '#3b82f6'
    }));
  } catch (error) {
    console.error('Error al obtener categorías:', error);
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
    // Obtener todas las categorías de Supabase
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (catError) throw catError;

    // Obtener todos los productos para extraer marcas por categoría
    // Usamos un muestreo de 100K productos máximo para no saturar
    const { data: products } = await supabase
      .from('products')
      .select('familia, brand_id')
      .limit(100000);

    // Obtener todas las marcas
    const { data: brands } = await supabase
      .from('brands')
      .select('id, name');

    const brandMap = new Map(brands?.map(b => [b.id, b.name]) || []);

    // Construir árbol: Familia (de products) -> Marca
    const tree = {};
    
    // Inicializar categorías desde Supabase
    categories.forEach(cat => {
      const catName = cat.name.toUpperCase().replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Á/g, 'A').replace(/É/g, 'E').replace(/-/g, ' ').trim();
      tree[catName] = {};
    });

    // Extraer marcas por familia desde products
    if (products) {
      products.forEach(p => {
        if (!p.familia) return;
        const familia = p.familia.toUpperCase().trim();
        const marca = brandMap.get(p.brand_id)?.trim() || 'DESCONOCIDA';
        
        if (!tree[familia]) tree[familia] = {};
        if (!tree[familia][marca]) tree[familia][marca] = [];
      });
    }

    hierarchyCache = tree;
    return hierarchyCache;
  } catch (error) {
    console.error('Error al obtener jerarquía de Supabase:', error.message);
    hierarchyCache = {};
    return hierarchyCache;
  }
}

/**
 * Obtiene marcas filtradas por categoría
 */
export async function getMarcasPorCategoria(categoria) {
  try {
    const tree = await getHierarchy();
    const fam = Object.keys(tree).find(k => 
      k.toUpperCase().includes(categoria.toUpperCase())
    );
    
    if (!fam) return [];
    
    return Object.keys(tree[fam]).sort().map(m => ({ 
      nombre: m, 
      color: "#666" 
    }));
  } catch (error) {
    console.error('Error al obtener marcas:', error);
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

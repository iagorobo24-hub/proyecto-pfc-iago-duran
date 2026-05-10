/**
 * SERVICIO DE CATÁLOGO (SUPABASE)
 * Reemplaza a Firestore para la gestión del catálogo
 * Mantiene la misma interfaz pública para compatibilidad con hooks existentes
 */
import { createClient } from '@supabase/supabase-js';
import { ServiceError } from './errorHandler';
import localHierarchy from '../data/hierarchy.json';

// Inicializar cliente de Supabase
const supabaseUrl = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2MDY5NSwiZXhwIjoyMDg4OTM2Njk1fQ.3DfYKquAUFFNx_c8NdMWmic7pVVckWsXEZWOJTuC5wg';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

let hierarchyCache = null;
const productCache = new Map();

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
 * Obtiene subfamilias (N2) de una Marca en una Familia
 */
export async function getGamasPorMarcaYCategoria(marca, categoria) {
  try {
    const tree = await getHierarchy();
    const fam = Object.keys(tree).find(k => 
      k.toUpperCase().includes(categoria.toUpperCase())
    );
    
    if (!fam || !tree[fam][marca]) return [];
    
    return Object.keys(tree[fam][marca]).sort().map(g => ({ nombre: g }));
  } catch (error) {
    console.error('Error al obtener gamas:', error);
    throw ServiceError.from(error, 'catalog.getGamasPorMarcaYCategoria');
  }
}

/**
 * Obtiene tipos de una gama/marca/familía
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
    console.log('📡 Consultando Supabase:', { familia: categoria, marca, gama, tipo });
    
    // Primero buscar brand_id si se especifica marca
    let brandId = null;
    if (marca) {
      const { data: brandData } = await supabase
        .from('brands')
        .select('id, name')
        .ilike('name', `%${marca}%`)
        .single();
      
      if (brandData) {
        brandId = brandData.id;
      }
    }
    
    let query = supabase
      .from('products')
      .select('*, brands(name)')
      .eq('is_active', true)
      .limit(100);

    // Filtrar por familia
    if (categoria) {
      query = query.ilike('familia', `%${categoria}%`);
    }
    
    // Filtrar por subfamilia (=gama)
    if (gama) {
      query = query.ilike('subfamilia', `%${gama}%`);
    }
    
    // Filtrar por tipo
    if (tipo) {
      query = query.ilike('tipo', `%${tipo}%`);
    }
    
    // Filtrar por marca usando brand_id
    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Mapear campos al formato esperado por el frontend
    // RefCard espera: ref, desc, precio
    // FichaCard espera: ref, desc, specs con marca, familia, gama, tipo
    let result = (data || []).map(p => ({
      ref: p.ref_fabricante || p.ref_sonepar,
      desc: p.name || p.description,
      precio: null, // No existe campo precio en products
      marca: p.brands?.name || null,
      familia: p.familia,
      gama: p.subfamilia,
      tipo: p.tipo,
      // Incluir todos los campos originales para acceso completo
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
 * Usa caché para mejorar rendimiento
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
        // No se encontró el producto
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
    throw ServiceError.from(error, 'catalog.getProductoPorRef');
  }
}

/**
 * Búsqueda por palabra clave en el catálogo
 */
export async function buscarProductos(termino) {
  if (!termino || termino.length < 3) return [];
  
  try {
    const qStr = termino.toLowerCase().trim();
    
    // Búsqueda por nombre o referencia
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${qStr}%,ref_fabricante.ilike.%${qStr}%`)
      .limit(10);

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error en búsqueda de productos:', error);
    throw ServiceError.from(error, 'catalog.buscarProductos');
  }
}

/**
 * Obtiene estadísticas del catálogo
 */
export async function getCatalogStats() {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return {
      totalProducts: count || 0,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw ServiceError.from(error, 'catalog.getCatalogStats');
  }
}

export default {
  getHierarchy,
  getMarcasPorCategoria,
  getGamasPorMarcaYCategoria,
  getTiposPorGamaMarcaYFamilia,
  getProductosPorFiltro,
  getProductoPorRef,
  buscarProductos,
  getCatalogStats
};

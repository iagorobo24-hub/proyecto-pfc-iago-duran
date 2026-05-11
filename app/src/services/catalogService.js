/**
 * SERVICIO DE CATÁLOGO (SUPABASE) - VERSIÓN SIMPLIFICADA
 * Estrategia: precargar TODO el árbol al inicio y servir desde memoria
 */
import { createClient } from '@supabase/supabase-js';
import { ServiceError } from './errorHandler';
import { CATEGORIAS_VALIDAS } from '../data/familiaMapping';
import { normalizarCategoria, normalizarFamilia } from '../utils/normalizarCategoria';

const supabaseUrl = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2MDY5NSwiZXhwIjoyMDg4OTM2Njk1fQ.3DfYKquAUFFNx_c8NdMWmic7pVVckWsXEZWOJTuC5wg';

const supabase = createClient(supabaseUrl, supabaseKey);

let treeCache = null;
let brandsMap = null;

/**
 * Inicializa el árbol jerárquico
 * Se llama una sola vez al cargar la app
 */
export async function initCatalog() {
  if (treeCache) return treeCache;

  try {
    console.log('🌳 Iniciando catálogo...');
    
    // 1. Cargar todas las marcas
    const { data: brandsData, error: brandsError } = await supabase
      .from('brands')
      .select('id, name');
    
    if (brandsError) throw brandsError;
    
    brandsMap = new Map();
    brandsData?.forEach(b => {
      brandsMap.set(b.id, b.name);
    });
    
    console.log('  ✅ Marcas cargadas:', brandsMap.size);

    // 2. Cargar productos en bloques pequeños
    const tree = {};
    let offset = 0;
    const batchSize = 5000; // Reducido para evitar error 500
    let total = 0;
    let processed = 0;

    while (true) {
      const { data: products, error } = await supabase
        .from('products')
        .select('familia, subfamilia, tipo, brand_id')
        .range(offset, offset + batchSize - 1);

      if (error) {
        console.error('  ⚠️ Error en bloque:', error.message);
        break;
      }

      if (!products || products.length === 0) break;

      products.forEach(p => {
        // Usar normalizarFamilia del nuevo utils (consistente con getCategorias)
        const categoria = normalizarFamilia(p.familia);
        if (!categoria || !CATEGORIAS_VALIDAS.includes(categoria)) return;

        const marca = brandsMap.get(p.brand_id) || 'DESCONOCIDA';
        const gama = p.subfamilia?.toUpperCase().trim() || 'GENERAL';
        const tipo = p.tipo?.toUpperCase().trim() || 'GENERAL';

        if (!tree[categoria]) tree[categoria] = {};
        if (!tree[categoria][marca]) tree[categoria][marca] = {};
        if (!tree[categoria][marca][gama]) tree[categoria][marca][gama] = new Set();
        
        tree[categoria][marca][gama].add(tipo);
        processed++;
      });

      total += products.length;
      offset += batchSize;
      
      // Quitar límite para cargar todos los productos
      // if (offset >= 10000) break;
      if (products.length < batchSize) break;
    }

    // Convertir Sets a arrays
    Object.values(tree).forEach(marcas => {
      Object.values(marcas).forEach(gamas => {
        Object.keys(gamas).forEach(gama => {
          gamas[gama] = [...gamas[gama]];
        });
      });
    });

    treeCache = tree;
    console.log('✅ Catálogo inicializado:', {
      categorias: Object.keys(tree).length,
      productos_procesados: processed,
      total_leidos: total
    });

    return tree;
  } catch (error) {
    console.error('❌ Error inicializando catálogo:', error);
    treeCache = {};
    return {};
  }
}

/**
 * Obtiene categorías
 */
export async function getCategorias() {
  try {
    // Asegurar que el árbol est� cargado
    await initCatalog();
    
    // Obtener nombres de categorías del árbol REAL de productos
    const categoriasARetornar = Object.keys(treeCache || {});
    
    if (categoriasARetornar.length === 0) {
      console.warn('⚠️ treeCache vacío o no inicializado');
      return [];
    }
    
    console.log('📂 Categorías disponibles (desde treeCache):', categoriasARetornar);

    // Mapear a formato de UI con nombres legibles
    const categoriasConLabel = {
      'CABLES': 'Cables',
      'INTERRUPTORES Y MECANISMOS': 'Interruptores y Mecanismos',
      'AUTOMATISMOS': 'Automatismos',
      'ILUMINACION': 'Iluminación',
      'CLIMATIZACION': 'Climatización',
      'DOMOTICA': 'Domótica',
      'CANALIZACION': 'Canalización',
      'COMUNICACION': 'Comunicación',
      'HERRAMIENTAS': 'Herramientas',
      'PROTECCION': 'Protección',
      'FONTANERIA': 'Fontanería',
      'ENERGIAS RENOVABLES': 'Energías Renovables'
    };
    
    return categoriasARetornar.map(id => ({
      id,
      label: categoriasConLabel[id] || id.charAt(0) + id.slice(1).toLowerCase(),
      icon: '📁',
      color: '#3b82f6'
    }));
  } catch (error) {
    console.error('Error getCategorias:', error);
    return [];
  }
}

/**
 * Obtiene marcas por categoría
 */
export async function getMarcasPorCategoria(categoria) {
  await initCatalog();
  const marcas = treeCache?.[categoria] || {};
  return Object.keys(marcas).sort().map(nombre => ({ nombre }));
}

/**
 * Obtiene gamas por marca y categoría
 */
export async function getGamasPorMarcaYCategoria(marca, categoria) {
  await initCatalog();
  const gamas = treeCache?.[categoria]?.[marca] || {};
  return Object.keys(gamas).sort().map(nombre => ({ nombre }));
}

/**
 * Obtiene tipos por gama, marca y categoría
 */
export async function getTiposPorGamaMarcaYFamilia(gama, marca, categoria) {
  await initCatalog();
  return treeCache?.[categoria]?.[marca]?.[gama] || [];
}

/**
 * Obtiene productos filtrados
 */
export async function getProductosPorFiltro(categoria, marca, gama, tipo) {
  try {
    // Buscar brand_id
    let brandId = null;
    if (brandsMap) {
      for (const [id, name] of brandsMap.entries()) {
        if (name === marca) {
          brandId = id;
          break;
        }
      }
    }

    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('familia', categoria)
      .eq('subfamilia', gama)
      .eq('tipo', tipo)
      .limit(50);

    const products = data || [];
    return brandId 
      ? products.filter(p => p.brand_id === brandId)
      : products;
  } catch (error) {
    console.error('Error getProductosPorFiltro:', error);
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
  } catch {
    return null;
  }
}

export async function buscarProductos(termino) {
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${termino}%`)
      .limit(10);
    return data || [];
  } catch {
    return [];
  }
}

export async function getCatalogStats() {
  try {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    return { totalProducts: count || 0 };
  } catch {
    return { totalProducts: 0 };
  }
}

// Default export
export default {
  initCatalog,
  getCategorias,
  getMarcasPorCategoria,
  getGamasPorMarcaYCategoria,
  getTiposPorGamaMarcaYFamilia,
  getProductosPorFiltro,
  getProductoPorRef,
  buscarProductos,
  getCatalogStats
};

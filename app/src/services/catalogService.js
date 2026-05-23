/**
 * SERVICIO DE CATÁLOGO (SUPABASE) - CONSULTA DIRECTA A PRODUCTS
 * No usa tablas auxiliares (families, categories) - consulta directamente products
 * para obtener familias, marcas, gamas y tipos únicos.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2MDY5NSwiZXhwIjoyMDg4OTM2Njk1fQ.3DfYKquAUFFNx_c8NdMWmic7pVVckWsXEZWOJTuC5wg';

const supabase = createClient(supabaseUrl, supabaseKey);

// Cache simple
let marcasCache = null;

// Nombres legibles para familias
const etiquetasFamilias = {
  'CABLES': 'Cables',
  'CABLES DE BAJA TENSION': 'Cables',
  'CABLES DE MEDIA TENSION': 'Cables',
  'DISTRIBUCION DE POTENCIA': 'Distribución de Potencia',
  'INTERRUPTORES Y MECANISMOS': 'Distribución de Potencia',
  'APARAMENTA MODULAR': 'Distribución de Potencia',
  'ENVOLVENTES Y CUADROS ELECTRICOS': 'Distribución de Potencia',
  'AUTOMATISMOS': 'Automatismos',
  'CONTROL Y AUTOMATIZACION INDUSTRIAL': 'Automatismos',
  'AUTOMATIZACION INDUSTRIAL': 'Automatismos',
  'AUTOMATIZACION DE EDIFICIOS': 'Domótica',
  'ILUMINACION': 'Iluminación',
  'LUMINARIAS': 'Iluminación',
  'CLIMATIZACION': 'Climatización',
  'HVAC': 'Climatización',
  'HVAC: HVAC: CLIMATIZACION VENTILACION Y AIRE ACONDICIONADO': 'Climatización',
  'CLIMA': 'Climatización',
  'DOMOTICA': 'Domótica',
  'DOMOTICA Y CONTROL': 'Domótica',
  'CANALIZACION': 'Canalización',
  'CANALIZACIONES': 'Canalización',
  'BANDEJAS': 'Canalización',
  'COMUNICACION': 'Comunicación',
  'COMUNICACIONES': 'Comunicación',
  'REDES': 'Comunicación',
  'HERRAMIENTAS': 'Herramientas',
  'HERRAMIENTAS Y MANIPULACION': 'Herramientas',
  'SEGURIDAD Y HERRAMIENTAS': 'Herramientas',
  'PROTECCION': 'Protección',
  'PROTECCION ELECTRICA': 'Protección',
  'EPIs': 'Protección',
  'FONTANERIA': 'Fontanería',
  'FONTANERÍA': 'Fontanería',
  'AGUA Y SANEAMIENTO': 'Fontanería',
  'ENERGIAS RENOVABLES': 'Energías Renovables',
  'ENERGIAS RENOVABLES Y VEHICULO ELECTRICO': 'Energías Renovables',
  'PLACAS SOLARES': 'Energías Renovables'
};

/**
 * Carga el mapa de marcas (se hace una sola vez)
 */
async function cargarMarcas() {
  if (marcasCache) return marcasCache;
  
  const { data, error } = await supabase
    .from('brands')
    .select('id, name');
  
  if (error) {
    console.error('❌ Error cargando marcas:', error);
    return new Map();
  }
  
  marcasCache = new Map();
  data?.forEach(b => marcasCache.set(b.id, b.name));
  console.log('✅ Marcas cargadas:', marcasCache.size);
  return marcasCache;
}

/**
 * Obtiene las familias únicas que tienen productos
 * Consulta directamente la tabla products
 */
export async function getCategorias() {
  try {
    console.log('📂 Cargando familias desde products...');
    
    // Obtener familias únicas con count
    const { data, error } = await supabase
      .from('products')
      .select('familia')
      .not('familia', 'is', null)
      .order('id')
      .limit(5000);
    
    if (error) {
      console.error('❌ Error:', error);
      return [];
    }
    
    // Limpiar y obtener únicas
    const familiasRaw = data?.map(p => p.familia?.trim()).filter(Boolean) || [];
    const familiasUnicas = [...new Set(familiasRaw)];
    
    console.log('📂 Familias únicas encontradas:', familiasUnicas.length);
    console.log('📂 Sample:', familiasUnicas.slice(0, 5));
    
    // Mapear a formato de categoría
    const categorias = familiasUnicas.map(familia => ({
      id: familia,
      label: etiquetasFamilias[familia] || familia,
      icon: '📁',
      color: '#3b82f6'
    }));
    
    // Ordenar por label
    categorias.sort((a, b) => a.label.localeCompare(b.label));
    
    console.log('📂 Categorías procesadas:', categorias.length);
    return categorias;
  } catch (error) {
    console.error('❌ Error getCategorias:', error);
    return [];
  }
}

/**
 * Obtiene las marcas que tienen productos en una familia específica
 */
export async function getMarcasPorCategoria(familia) {
  try {
    console.log(`🏷️ Cargando marcas para: ${familia}`);
    
    const { data, error } = await supabase
      .from('products')
      .select('brand_id')
      .eq('familia', familia)
      .not('brand_id', 'is', null)
      .limit(5000);
    
    if (error) {
      console.error('❌ Error:', error);
      return [];
    }
    
    const brandIdsUnicos = [...new Set(data?.map(p => p.brand_id).filter(Boolean))];
    
    if (brandIdsUnicos.length === 0) {
      console.log('⚠️ No hay marcas para esta familia');
      return [];
    }
    
    // Cargar nombres de marcas
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name')
      .in('id', brandIdsUnicos);
    
    if (brandsError) {
      console.error('❌ Error cargando brands:', brandsError);
      return [];
    }
    
    const marcas = brands?.map(b => ({ nombre: b.name })).sort((a, b) => 
      a.nombre.localeCompare(b.nombre)
    ) || [];
    
    console.log(`✅ Marcas encontradas: ${marcas.length}`);
    return marcas;
  } catch (error) {
    console.error('❌ Error getMarcasPorCategoria:', error);
    return [];
  }
}

/**
 * Obtiene las gamas (subfamilias) para una familia + marca
 */
export async function getGamasPorMarcaYCategoria(marca, familia) {
  try {
    console.log(`📦 Cargando gamas para ${marca} en ${familia}`);
    
    // Obtener brand_id
    const marcasMap = await cargarMarcas();
    let brandId = null;
    for (const [id, name] of marcasMap.entries()) {
      if (name.trim() === marca.trim()) {
        brandId = id;
        break;
      }
    }
    
    if (!brandId) {
      console.warn('⚠️ Marca no encontrada:', marca);
      return [];
    }
    
    // Obtener subfamilias únicas
    const { data, error } = await supabase
      .from('products')
      .select('subfamilia')
      .eq('familia', familia)
      .eq('brand_id', brandId)
      .not('subfamilia', 'is', null)
      .limit(5000);
    
    if (error) {
      console.error('❌ Error:', error);
      return [];
    }
    
    const gamasUnicas = [...new Set(data?.map(p => p.subfamilia?.trim()).filter(Boolean))];
    const gamas = gamasUnicas.sort().map(nombre => ({ nombre }));
    
    console.log(`✅ Gamas encontradas: ${gamas.length}`);
    return gamas;
  } catch (error) {
    console.error('❌ Error getGamasPorMarcaYCategoria:', error);
    return [];
  }
}

/**
 * Obtiene los tipos para una familia + marca + gama
 */
export async function getTiposPorGamaMarcaYFamilia(gama, marca, familia) {
  try {
    console.log(`🏷️ Cargando tipos para ${marca} - ${gama} en ${familia}`);
    
    const marcasMap = await cargarMarcas();
    let brandId = null;
    for (const [id, name] of marcasMap.entries()) {
      if (name.trim() === marca.trim()) {
        brandId = id;
        break;
      }
    }
    
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
      console.error('❌ Error:', error);
      return [];
    }
    
    const tiposUnicos = [...new Set(data?.map(p => p.tipo?.trim()).filter(Boolean))];
    console.log(`✅ Tipos encontrados: ${tiposUnicos.length}`);
    return tiposUnicos.sort();
  } catch (error) {
    console.error('❌ Error getTiposPorGamaMarcaYFamilia:', error);
    return [];
  }
}

/**
 * Obtiene los productos filtrados
 */
export async function getProductosPorFiltro(familia, marca, gama, tipo) {
  try {
    console.log(`📋 Cargando productos: ${familia} > ${marca} > ${gama} > ${tipo}`);
    
    const marcasMap = await cargarMarcas();
    let brandId = null;
    for (const [id, name] of marcasMap.entries()) {
      if (name.trim() === marca.trim()) {
        brandId = id;
        break;
      }
    }
    
    let query = supabase
      .from('products')
      .select('id, ref_fabricante, name, imagen, marca, familia, subfamilia, tipo, precio')
      .eq('familia', familia)
      .eq('subfamilia', gama)
      .eq('tipo', tipo)
      .limit(50);
    
    if (brandId) {
      query = query.eq('brand_id', brandId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error:', error);
      return [];
    }
    
    console.log(`✅ Productos encontrados: ${data?.length || 0}`);
    return data || [];
  } catch (error) {
    console.error('❌ Error getProductosPorFiltro:', error);
    return [];
  }
}

export async function getProductoPorRef(ref) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('ref_fabricante', ref)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error getProductoPorRef:', error);
    return null;
  }
}

export async function buscarProductos(termino) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, ref_fabricante, name, imagen, marca')
      .ilike('name', `%${termino}%`)
      .limit(10);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error buscarProductos:', error);
    return [];
  }
}

export async function getCatalogStats() {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return { totalProducts: count || 0 };
  } catch (error) {
    console.error('❌ Error getCatalogStats:', error);
    return { totalProducts: 0 };
  }
}

export async function initCatalog() {
  await cargarMarcas();
  return {};
}

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

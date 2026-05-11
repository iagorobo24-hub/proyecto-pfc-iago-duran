/**
 * SERVICIO DE CATÁLOGO (SUPABASE) - CARGA INCREMENTAL
 * Estrategia: cargar datos bajo demanda según navegación del usuario
 * 1. Familias al entrar
 * 2. Marcas al seleccionar familia
 * 3. Gamas al seleccionar marca
 * 4. Tipos al seleccionar gama
 * 5. Productos al seleccionar tipo
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2MDY5NSwiZXhwIjoyMDg4OTM2Njk1fQ.3DfYKquAUFFNx_c8NdMWmic7pVVckWsXEZWOJTuC5wg';

const supabase = createClient(supabaseUrl, supabaseKey);

// Cache simple para evitar recargas innecesarias
let marcasCache = null;

/**
 * Normaliza un string para consultas - elimina acentos para evitar problemas de codificación
 */
function normalizarString(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .toUpperCase()
    .trim();
}

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
 * Normaliza familia a categoría válida
 */
function normalizarFamilia(familia) {
  if (!familia) return null;
  
  const mapeo = {
    'CABLES': 'CABLES',
    'CABLES DE BAJA TENSION': 'CABLES',
    'CABLES DE MEDIA TENSION': 'CABLES',
    'DISTRIBUCION DE POTENCIA': 'INTERRUPTORES Y MECANISMOS',
    'INTERRUPTORES Y MECANISMOS': 'INTERRUPTORES Y MECANISMOS',
    'APARAMENTA MODULAR': 'INTERRUPTORES Y MECANISMOS',
    'ENVOLVENTES Y CUADROS ELECTRICOS': 'INTERRUPTORES Y MECANISMOS',
    'AUTOMATISMOS': 'AUTOMATISMOS',
    'CONTROL Y AUTOMATIZACION INDUSTRIAL': 'AUTOMATISMOS',
    'AUTOMATIZACION INDUSTRIAL': 'AUTOMATISMOS',
    'ILUMINACION': 'ILUMINACION',
    'LUMINARIAS': 'ILUMINACION',
    'CLIMATIZACION': 'CLIMATIZACION',
    'HVAC': 'CLIMATIZACION',
    'HVAC: HVAC: CLIMATIZACION VENTILACION Y AIRE ACONDICIONADO': 'CLIMATIZACION',
    'CLIMA': 'CLIMATIZACION',
    'DOMOTICA': 'DOMOTICA',
    'AUTOMATIZACION DE EDIFICIOS': 'DOMOTICA',
    'DOMOTICA Y CONTROL': 'DOMOTICA',
    'CANALIZACION': 'CANALIZACION',
    'CANALIZACIONES': 'CANALIZACION',
    'BANDEJAS': 'CANALIZACION',
    'COMUNICACION': 'COMUNICACION',
    'COMUNICACIONES': 'COMUNICACION',
    'REDES': 'COMUNICACION',
    'HERRAMIENTAS': 'HERRAMIENTAS',
    'HERRAMIENTAS Y MANIPULACION': 'HERRAMIENTAS',
    'SEGURIDAD Y HERRAMIENTAS': 'HERRAMIENTAS',
    'PROTECCION': 'PROTECCION',
    'PROTECCION ELECTRICA': 'PROTECCION',
    'EPIs': 'PROTECCION',
    'FONTANERIA': 'FONTANERIA',
    'FONTANERÍA': 'FONTANERIA',
    'AGUA Y SANEAMIENTO': 'FONTANERIA',
    'ENERGIAS RENOVABLES': 'ENERGIAS RENOVABLES',
    'ENERGIAS RENOVABLES Y VEHICULO ELECTRICO': 'ENERGIAS RENOVABLES',
    'PLACAS SOLARES': 'ENERGIAS RENOVABLES'
  };
  
  const normalizada = familia.toUpperCase().trim();
  return mapeo[normalizada] || normalizada;
}

// Nombres legibles para categorías
const etiquetasCategorias = {
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

/**
 * Obtiene las familias únicas que tienen productos en Supabase
 * Se llama al entrar en fichas técnicas
 */
export async function getCategorias() {
  try {
    console.log('📂 Cargando familias...');
    
    // Estrategia: consultar directamente las familias conocidas del mapeo
    // Hacemos una consulta por cada familia posible y vemos cuáles tienen productos
    const familiasPosibles = [
      'CABLES',
      'DISTRIBUCION DE POTENCIA', 
      'INTERRUPTORES Y MECANISMOS',
      'AUTOMATIZACION DE EDIFICIOS',
      'CONTROL Y AUTOMATIZACION INDUSTRIAL',
      'ILUMINACION',
      'LUMINARIAS',
      'CLIMATIZACION',
      'HVAC',
      'DOMOTICA',
      'CANALIZACION',
      'COMUNICACION',
      'HERRAMIENTAS',
      'SEGURIDAD Y HERRAMIENTAS',
      'PROTECCION',
      'FONTANERIA',
      'ENERGIAS RENOVABLES'
    ];
    
    const familiasConProductos = new Set();
    
    // Probar cada familia para ver cuáles tienen productos
    for (const familia of familiasPosibles) {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('familia', familia)
        .limit(1);
      
      if (!error && data && data.length > 0) {
        console.log(`✅ Familia encontrada: ${familia}`);
        const cat = normalizarFamilia(familia);
        if (cat) familiasConProductos.add(cat);
      }
    }
    
    const categorias = Array.from(familiasConProductos).sort();
    console.log('📂 Familias normalizadas:', categorias);
    console.log('📂 Total familias con productos:', categorias.length);
    
    return categorias.map(id => ({
      id,
      label: etiquetasCategorias[id] || id,
      icon: '📁',
      color: '#3b82f6'
    }));
  } catch (error) {
    console.error('❌ Error getCategorias:', error);
    return [];
  }
}

/**
 * Obtiene las marcas que tienen productos en una familia específica
 * Se llama al seleccionar una familia
 */
export async function getMarcasPorCategoria(familia) {
  try {
    const familiaLimpia = familia?.trim(); // Limpiar valores
    console.log(`🏷️ Cargando marcas para familia: ${familiaLimpia}`);
    
    // Obtener brand_ids únicos que tienen productos en esta familia
    const { data, error } = await supabase
      .from('products')
      .select('brand_id')
      .eq('familia', familiaLimpia);
    
    if (error) throw error;
    
    // Obtener brand_ids únicos
    const brandIdsUnicos = [...new Set(data?.map(p => p.brand_id).filter(Boolean))];
    
    if (brandIdsUnicos.length === 0) {
      console.log('⚠️ No hay marcas para esta familia');
      return [];
    }
    
    // Cargar nombres de esas marcas
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name')
      .in('id', brandIdsUnicos);
    
    if (brandsError) throw brandsError;
    
    const marcas = brands?.map(b => ({ nombre: b.name })).sort((a, b) => 
      a.nombre.localeCompare(b.nombre)
    ) || [];
    
    console.log(`✅ Marcas encontradas: ${marcas.length}`, marcas.slice(0, 5));
    return marcas;
  } catch (error) {
    console.error('❌ Error getMarcasPorCategoria:', error);
    return [];
  }
}

/**
 * Obtiene las gamas (subfamilias) para una familia + marca
 * Se llama al seleccionar una marca
 */
export async function getGamasPorMarcaYCategoria(marca, familia) {
  try {
    const familiaLimpia = familia?.trim();
    const gamaLimpia = marca?.trim();
    console.log(`📦 Cargando gamas para ${gamaLimpia} en ${familiaLimpia}`);
    
    // Primero obtener el brand_id
    const marcasMap = await cargarMarcas();
    let brandId = null;
    for (const [id, name] of marcasMap.entries()) {
      if (name === marca) {
        brandId = id;
        break;
      }
    }
    
    if (!brandId) {
      console.warn('⚠️ Marca no encontrada:', marca);
      return [];
    }
    
    // Obtener subfamilias únicas para esta familia + marca
    const { data, error } = await supabase
      .from('products')
      .select('subfamilia')
      .eq('familia', familiaLimpia)
      .eq('brand_id', brandId)
      .not('subfamilia', 'is', null);
    
    if (error) throw error;
    
    // Obtener subfamilias únicas (limpiar newlines)
    const gamasUnicas = [...new Set(data?.map(p => p.subfamilia?.trim()).filter(Boolean))];
    
    const gamas = gamasUnicas.sort().map(nombre => ({ nombre }));
    
    console.log(`✅ Gamas encontradas: ${gamas.length}`, gamas.slice(0, 5));
    return gamas;
  } catch (error) {
    console.error('❌ Error getGamasPorMarcaYCategoria:', error);
    return [];
  }
}

/**
 * Obtiene los tipos para una familia + marca + gama
 * Se llama al seleccionar una gama
 */
export async function getTiposPorGamaMarcaYFamilia(gama, marca, familia) {
  try {
    const familiaLimpia = familia?.trim();
    const gamaLimpia = gama?.trim();
    const marcaLimpia = marca?.trim();
    console.log(`🏷️ Cargando tipos para ${marcaLimpia} - ${gamaLimpia} en ${familiaLimpia}`);
    
    // Obtener brand_id
    const marcasMap = await cargarMarcas();
    let brandId = null;
    for (const [id, name] of marcasMap.entries()) {
      if (name.trim() === marcaLimpia) {
        brandId = id;
        break;
      }
    }
    
    if (!brandId) return [];
    
    // Obtener tipos únicos para esta familia + marca + gama
    const { data, error } = await supabase
      .from('products')
      .select('tipo')
      .eq('familia', familiaLimpia)
      .eq('brand_id', brandId)
      .eq('subfamilia', gamaLimpia)
      .not('tipo', 'is', null);
    
    if (error) throw error;
    
    // Obtener tipos únicos (limpiar newlines)
    const tiposUnicos = [...new Set(data?.map(p => p.tipo?.trim()).filter(Boolean))];
    console.log(`✅ Tipos encontrados: ${tiposUnicos.length}`, tiposUnicos.slice(0, 5));
    return tiposUnicos.sort();
  } catch (error) {
    console.error('❌ Error getTiposPorGamaMarcaYFamilia:', error);
    return [];
  }
}

/**
 * Obtiene los productos filtrados por familia + marca + gama + tipo
 * Se llama al seleccionar un tipo
 */
export async function getProductosPorFiltro(familia, marca, gama, tipo) {
  try {
    const familiaLimpia = familia?.trim();
    const marcaLimpia = marca?.trim();
    const gamaLimpia = gama?.trim();
    const tipoLimpia = tipo?.trim();
    console.log(`📋 Cargando productos: ${familiaLimpia} > ${marcaLimpia} > ${gamaLimpia} > ${tipoLimpia}`);
    
    // Obtener brand_id
    const marcasMap = await cargarMarcas();
    let brandId = null;
    for (const [id, name] of marcasMap.entries()) {
      if (name.trim() === marcaLimpia) {
        brandId = id;
        break;
      }
    }
    
    // Normalizar tipo para evitar problemas con tildes
    const normalizar = (str) => str?.toUpperCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() || '';
    
    const familiaNormalizada = normalizar(familiaLimpia);
    const gamaNormalizada = normalizar(gamaLimpia);
    const tipoNormalizado = normalizar(tipoLimpia);
    
    let query = supabase
      .from('products')
      .select('id, ref_fabricante, name, precio, marca, familia, subfamilia, tipo')
      .eq('familia', familiaLimpia)
      .eq('subfamilia', gamaLimpia)
      .eq('tipo', tipoLimpia)
      .limit(50);
    
    if (brandId) {
      query = query.eq('brand_id', brandId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    console.log(`✅ Productos encontrados: ${data?.length || 0}`);
    return data || [];
  } catch (error) {
    console.error('❌ Error getProductosPorFiltro:', error);
    return [];
  }
}

/**
 * Obtiene un producto por su referencia
 */
export async function getProductoPorRef(ref) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, ref_fabricante, name, precio, familia, subfamilia, tipo, marca')
      .eq('ref_fabricante', ref)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error getProductoPorRef:', error);
    return null;
  }
}

/**
 * Busca productos por nombre
 */
export async function buscarProductos(termino) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, ref_fabricante, name, marca')
      .ilike('name', `%${termino}%`)
      .limit(10);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error buscarProductos:', error);
    return [];
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
    return { totalProducts: count || 0 };
  } catch (error) {
    console.error('❌ Error getCatalogStats:', error);
    return { totalProducts: 0 };
  }
}

// Función de inicialización mínima (solo carga marcas)
export async function initCatalog() {
  await cargarMarcas();
  return {};
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

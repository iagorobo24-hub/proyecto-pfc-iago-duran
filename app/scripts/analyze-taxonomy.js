/**
 * ANALIZADOR DE TAXONOMÍA - Detecta productos mal clasificados
 * Busca discordancias entre el nombre del producto y su familia/subfamilia/tipo
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://fncmzrnmzmuhlullkrud.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2MDY5NSwiZXhwIjoyMDg4OTM2Njk1fQ.3DfYKquAUFFNx_c8NdMWmic7pVVckWsXEZWOJTuC5wg');

// ─── Palabras clave por subfamilia esperada ───────────────────────────────────
const KEYWORDS = {
  // DISTRIBUCION DE POTENCIA - Protección
  'Interruptor Magnetotérmico': [
    'magnetotérmico', 'mcb', 'mccb', 'automatico', 'interruptor automatico',
    'curva b', 'curva c', 'curva d', 'curva z', 'ic60', 'c60', 'nsx', 'dpw',
    'compact', 'resi', 'ipcb', 'interuptor automatico', 'interrputor automatico'
  ],
  'Interruptor Diferencial': [
    'diferencial', 'rccb', 'iid', 'id k', 'vigi', 'si', 'vigi ic60',
    'disyuntor', 'interrputor diferencial', 'interuptor diferencial'
  ],
  'Proteccion Sobretension': [
    'sobretension', 'sobre tensión', 'spd', 'iprc', 'ipri', 'limitador',
    'descargador', 'cartucho de recambio', 'cartucho fusible de recambio'
  ],
  'Cortacircuito Fusible': [
    'fusible', 'cartucho fusible', 'base fusible', 'portafusible', 'gl',
    'gg', 'am', 'aM', 'torpedo fusible'
  ],
  'Interruptor Seccionador': [
    'seccionador', 'seccionador de', 'iws', 'vistop', 'interruptor seccionador'
  ],
  'Interruptor CC': [
    'corriente continua', 'interruptor de corriente continua', 'cc'
  ],

  // CONTROL MOTOR
  'Contactor': [
    'contactor', 'guardamotor', 'lc1', 'lc2', 'lc3', 'lp1', 'lp2',
    'lc7', 'lc8', 'lc9', 'lc10', 'lc11', 'lc12', 'ict', 'icv40', 'ic40',
    'arrancador', 'arrancador suave', 'altivar', 'tesys', 'tesy'
  ],
  'Elemento de Control': [
    'minuteria', 'temporizador', 'rele', 'relé', 'timer', 'itl', 'telerruptor',
    'reles', 'rels', 'modular rele'
  ],

  // ACCESORIOS
  'Accesorio': [
    'piloto', 'bloque adicional', 'soporte', 'etiqueta', 'tornillo',
    'caja', 'conector', 'borla', 'caperuza', 'adhesivo'
  ],
  'Bloque Mando Osmoz': ['osmoz'],
  'Pulsador Osmoz': ['osmoz pulsador', 'pulso osmoz'],

  // DISTRIBUCIÓN
  'Caja Distribucion': ['caja distribucion', 'caja distribución', 'nedbox', 'prisma'],
  'Caja Conexion': ['celda multifuncion', 'caja conexion'],
  'Conmutador': ['conmutador'],
  'Toma Corriente Industrial': ['toma de corriente', 'base industrial'],
  'Fuente Alimentacion': ['fuente alimentacion', 'fuente de alimentacion'],
  'Timbre': ['timbre'],
  'Zumbador': ['zumbador'],

  // MEDIDA
  'Contador eléctrico': ['power monitor', 'contador', 'm8650', 'medidor'],

  // ALMACENAMIENTO
  'Rearmador': ['rearmador', 'rearm', 'reconectad', 'ara aux'],

  // AISLAMIENTO
  'Control Aislamiento': ['controlador permanente', 'control aislamiento'],
  'Central Reporte': ['central reporte', 'central de reporte'],

  // INSTALACIÓN
  'Canal Instalacion': ['canal ', 'canalizacion', 'dwl', 'dlp'],
  'Canal Cuadros': ['canaleta', 'lina'],
  'Minicanal': ['moldura', 'dlplus', 'dl plus'],
  'Bandeja Portacables': ['bandeja'],
  'Canalizacion': ['canal de iluminacion', 'lbplus'],

  // ILUMINACIÓN
  'Luminaria Emergencia': ['emergencia', 'salida', 'lumen', 'block de emergencia'],
  'Accesorio Iluminacion': ['accesorio il', 'lampara'],

  // DOMÓTICA
  'Mando Smart': ['mando', 'comando', 'netatmo'],
  'Micromodulo Smart': ['micromódulo', 'micromodulo'],
  'Controlador KNX': ['knx'],
  'Base Conectada': ['base conectada', 'plexo modular'],
  'Sensor KNX': ['knx'],
  'Interface KNX': ['interface knx', 'interfaz knx'],
  'Pasarela KNX': ['pasarela'],

  // FOTOVOLTAICA
  'Seccionador CC': ['seccionador de corriente continua', 'fotovoltaica'],

  // VEHÍCULOS ELÉCTRICOS
  'Punto Recarga': ['recarga', 'green', 'vehículo', 'vehiculo']
};

// ─── Verificar si palabra clave está en nombre (case insensitive) ─────────────
function contieneKeyword(nombre, keywords) {
  if (!nombre) return false;
  const n = nombre.toLowerCase();
  return keywords.some(kw => n.includes(kw.toLowerCase()));
}

// ─── Detectar posibles errores de clasificación ───────────────────────────────
async function detectarErrores() {
  console.log('🔍 Analizando clasificación de productos...\n');

  // Obtener TODOS los productos (usando paginación)
  const allProducts = [];
  let offset = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id, ref_fabricante, name, familia, subfamilia, tipo, marca')
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('Error:', error);
      break;
    }

    if (!data || data.length === 0) break;
    allProducts.push(...data);

    if (data.length < batchSize) break;
    offset += batchSize;
  }

  console.log(`📦 Total productos analizados: ${allProducts.length}\n`);

  // Analizar cada producto
  const errores = [];

  for (const prod of allProducts) {
    const nombre = prod.name || '';
    const erroresProducto = [];

    // Verificar si las keywords de OTRA subfamilia aparecen en el nombre
    for (const [subfamiliaCorrecta, keywords] of Object.entries(KEYWORDS)) {
      if (subfamiliaCorrecta === prod.subfamilia) continue;

      if (contieneKeyword(nombre, keywords)) {
        erroresProducto.push({
          subfamiliaActual: prod.subfamilia,
          subfamiliaEsperada: subfamiliaCorrecta,
          keywords: keywords.filter(k => nombre.toLowerCase().includes(k.toLowerCase()))
        });
      }
    }

    if (erroresProducto.length > 0) {
      errores.push({
        id: prod.id,
        ref: prod.ref_fabricante,
        nombre: nombre,
        familia: prod.familia,
        subfamilia: prod.subfamilia,
        tipo: prod.tipo,
        marca: prod.marca,
        posiblesErrores: erroresProducto
      });
    }
  }

  return errores;
}

// ─── Mostrar resultados ──────────────────────────────────────────────────────
async function main() {
  const errores = await detectarErrores();

  console.log('\n' + '='.repeat(80));
  console.log(`⚠️  PRODUCTOS POSIBLEMENTE MAL CLASIFICADOS: ${errores.length}`);
  console.log('='.repeat(80));

  if (errores.length === 0) {
    console.log('\n✅ No se detectaron discordancias obvias');
    return;
  }

  // Agrupar por tipo de error
  const porSubfamilia = {};
  errores.forEach(e => {
    e.posiblesErrores.forEach(err => {
      const key = `${err.subfamiliaActual} → ${err.subfamiliaEsperada}`;
      if (!porSubfamilia[key]) porSubfamilia[key] = [];
      porSubfamilia[key].push(e);
    });
  });

  // Ordenar por cantidad de errores
  const sorted = Object.entries(porSubfamilia)
    .sort((a, b) => b[1].length - a[1].length);

  sorted.forEach(([tipoError, productos]) => {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`🔴 ${tipoError} (${productos.length} productos)`);
    console.log('─'.repeat(80));

    productos.slice(0, 10).forEach(p => {
      console.log(`  • ${p.ref}: "${p.nombre}"`);
      console.log(`    Actual: ${p.subfamilia} | Keywords detectadas: ${p.posiblesErrores.map(e => e.keywords.join(', ')).join('; ')}`);
    });

    if (productos.length > 10) {
      console.log(`  ... y ${productos.length - 10} más`);
    }
  });

  // Guardar reporte
  const fs = await import('fs');
  fs.writeFileSync('errores-clasificacion.json', JSON.stringify(errores, null, 2));
  console.log('\n📄 Reporte guardado en errores-clasificacion.json');
}

main().catch(console.error);
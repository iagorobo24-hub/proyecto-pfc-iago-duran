const SUPABASE_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const SONEX_KEY = process.env.SONEX_SUPABASE_KEY;

const headers = {
  'apikey': SONEX_KEY,
  'Authorization': `Bearer ${SONEX_KEY}`,
  'Content-Type': 'application/json'
};

async function main() {
  console.log('🔧 Intentando marcar productos Siemens nuevos como pending_verification...');

  // Paso 1: Obtener los IDs de los productos Siemens que tienen precio 0 (los recién generados)
  const productsResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,ref_fabricante,marca,precio&marca=eq.Siemens&precio=eq.0`, {
    headers
  });

  if (!productsResponse.ok) {
    const err = await productsResponse.text();
    console.error('❌ Error al obtener productos:', err);
    return;
  }

  const products = await productsResponse.json();
  console.log(`✅ Encontrados ${products.length} productos Siemens con precio 0.`);

  if (products.length === 0) {
    console.log('No hay productos pendientes de validación.');
    return;
  }

  const ids = products.map(p => p.id);
  
  // Intentar actualizar. Si la columna no existe, Supabase dará error y te avisará.
  // Supabase permite actualizar solo las columnas que existen. 
  // Si 'validado_manual' no existe, el UPDATE fallará.
  // Para evitar fallo total, primero intentamos "crearla" simulando un cambio de esquema? No, no se puede por API simple.
  
  // En su lugar, vamos a generar un resultado claro para que tú hagas el UPDATE en el panel SQL de Supabase.
  // O podemos intentar hacer un UPSERT si la tabla lo permite con columnas dinámicas (raro).
  
  // Mejor enfoque: Generar el comando SQL exacto que necesitas ejecutar en Supabase Dashboard.
  const idList = ids.join(',');
  const sqlCommand = `
UPDATE products 
SET validado_manual = false 
WHERE id IN (${idList});
  `;

  console.log('\n📋 COMANDO SQL PARA SUPERAR VALIDACIÓN:');
  console.log('Ejecuta esto en el SQL Editor de Supabase Dashboard:');
  console.log('==================================================');
  console.log(sqlCommand);
  console.log('==================================================');
  console.log('\n💡 Nota: Si obtienes error "column validado_manual does not exist", ejecuta primero:');
  console.log('ALTER TABLE products ADD COLUMN validado_manual BOOLEAN DEFAULT FALSE;');
  
  // Opcional: Intentar actualizado si la columna ya existe (aunque fallará si no)
  // Pero mejor dar el comando explícito.
}

main().catch(err => {
  console.error('💥 Error:', err.message);
});
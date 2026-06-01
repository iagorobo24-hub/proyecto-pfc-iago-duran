const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Buscar .env en diferentes ubicaciones
const envPaths = [
  '.env',
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env')
];

let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const urlMatch = content.match(/SUPABASE_URL=['"]?([^'"\n]+)/);
    const keyMatch = content.match(/SUPABASE_ANON_KEY=['"]?([^'"\n]+)/);
    if (urlMatch && keyMatch) {
      SUPABASE_URL = urlMatch[1];
      SUPABASE_ANON_KEY = keyMatch[1];
      console.log(`✅ Cargado desde: ${envPath}`);
      break;
    }
  }
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ No se encontraron credenciales de Supabase en ningún .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  try {
    console.log('🔍 consultando Supabase...');
    
    // Contar productos
    const { count: productCount, error: productError } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true });
    
    if (productError) {
      console.error('❌ Error en productos:', productError.message);
    } else {
      console.log(`\n📦 PRODUCTOS EXACTOS: ${productCount}`);
    }
    
    // Contar categorías (opcional, para contexto)
    const { count: catCount } = await supabase
      .from('categorias')
      .select('*', { count: 'exact', head: true });
    if (catCount !== null) {
      console.log(`📂 CATEGORÍAS: ${catCount}`);
    }
    
    // Contar marcas
    const { count: marcaCount } = await supabase
      .from('marcas')
      .select('*', { count: 'exact', head: true });
    if (marcaCount !== null) {
      console.log(`🏷️ MARCAS: ${marcaCount}`);
    }
    
    console.log('\n✅ Consulta completada');
  } catch (err) {
    console.error('❌ Error general:', err.message);
  }
}

main();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listarTodasLasFamilias() {
  console.log('🔍 Consultando todas las familias en la DB...\n');
  
  // Usamos RPC o query directa para contar por familia
  const { data, error } = await supabase
    .rpc('get_familias_count');
    
  if (error) {
    console.log('❌ Error con RPC, usando query alternativa...\n');
    
    // Fallback: query normal con limit alto
    const { data: products, error: qError } = await supabase
      .from('products')
      .select('familia')
      .not('familia', 'is', null)
      .limit(10000);
      
    if (qError) {
      console.log('❌ Error:', qError);
      return;
    }
    
    const familiaCount = {};
    products.forEach(p => {
      const f = p.familia?.trim();
      if (f) {
        familiaCount[f] = (familiaCount[f] || 0) + 1;
      }
    });
    
    const familias = Object.entries(familiaCount)
      .sort((a, b) => b[1] - a[1])
      .map(([familia, count]) => ({ familia, count }));
    
    console.log(`📊 Total productos consultados: ${products.length}`);
    console.log(`📁 Familias únicas encontradas: ${familias.length}\n`);
    console.log('=== FAMILIAS EN LA DB ===');
    familias.forEach(({ familia, count }) => {
      console.log(`  ${familia.padEnd(40)} ${count.toString().padStart(5)} productos`);
    });
    return;
  }
  
  console.log('Resultado RPC:', data);
}

listarTodasLasFamilias();
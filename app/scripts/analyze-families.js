/**
 * Lista todas las familias únicas que existen en la tabla products
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2MDY5NSwiZXhwIjoyMDg4OTM2Njk1fQ.3DfYKquAUFFNx_c8NdMWmic7pVVckWsXEZWOJTuC5wg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('📊 Analizando familias en products...\n');

  // Total productos
  const { count: total } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  console.log(`Total productos: ${total || 0}\n`);

  // Familias únicas
  const { data } = await supabase
    .from('products')
    .select('familia')
    .not('familia', 'is', null)
    .limit(10000);

  if (!data?.length) {
    console.log('No hay datos');
    return;
  }

  const familias = {};
  data.forEach(p => {
    const f = p.familia?.trim();
    if (f) familias[f] = (familias[f] || 0) + 1;
  });

  const sorted = Object.entries(familias).sort((a, b) => b[1] - a[1]);
  
  console.log(`Familias únicas: ${sorted.length}\n`);
  sorted.forEach(([familia, count]) => {
    console.log(`  ${familia}: ${count.toLocaleString()} productos`);
  });
}

main();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in env variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('📊 Querying database counts...');
  const states = ['verificada', 'rechazada_ia', 'pendiente_ia', 'no_carga', 'sin_imagen', 'posible_generico'];
  const counts = {};
  
  for (const status of states) {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('imagen_verificacion_estado', status);
      
    if (error) {
      console.error(`❌ Error fetching count for ${status}:`, error);
    } else {
      counts[status] = count;
    }
  }
  
  // Count null states
  const { count: nullCount, error: nullError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .is('imagen_verificacion_estado', null);
    
  if (nullError) {
    console.error('❌ Error fetching count for null:', nullError);
  } else {
    counts['null'] = nullCount;
  }

  // Count total products
  const { count: totalCount, error: totalError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  if (!totalError) {
    counts['total'] = totalCount;
  }
  
  console.log('\n📊 Exact Database Image Verification Status Counts:');
  console.log(JSON.stringify(counts, null, 2));
}

main().catch(console.error);

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
  console.log('🔍 Fetching rejected products from Supabase...');
  const { data, error } = await supabase
    .from('products')
    .select('id, name, ref_fabricante, marca, subfamilia, imagen, imagen_verificacion_nota')
    .eq('imagen_verificacion_estado', 'rechazada_ia')
    .order('id');
    
  if (error) {
    console.error('❌ Error fetching rejected products:', error);
    return;
  }
  
  console.log(`\n🚫 Found ${data.length} rejected products:\n`);
  for (const p of data) {
    console.log(`--------------------------------------------------`);
    console.log(`ID: ${p.id}`);
    console.log(`Nombre: ${p.name}`);
    console.log(`Referencia: ${p.ref_fabricante}`);
    console.log(`Marca: ${p.marca} | Subfamilia: ${p.subfamilia || 'N/A'}`);
    console.log(`Imagen URL: ${p.imagen}`);
    console.log(`Motivo de Rechazo: ${p.imagen_verificacion_nota}`);
  }
  console.log(`--------------------------------------------------`);
}

main().catch(console.error);

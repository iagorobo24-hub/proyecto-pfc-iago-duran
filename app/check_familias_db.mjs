import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env.local') });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data, error } = await sb.from('products').select('familia, marca');
if (error) { console.error(error); process.exit(1); }

const counts = {};
data.forEach(r => {
  const key = `${r.familia}`;
  counts[key] = (counts[key]||0)+1;
});

const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
console.log('FAMILIA VALUES IN DB:');
sorted.forEach(([k,v]) => console.log(`  ${v.toString().padStart(5)}  ${JSON.stringify(k)}`));
console.log('\nTotal unique familia values:', sorted.length);

import { getBrands } from './lib/supabase-sonex.js';

async function main() {
  try {
    const brands = await getBrands();
    console.log('=== MARCAS REGISTRADAS ===');
    brands.forEach(b => {
      console.log(`ID: ${b.id} | Name: ${b.name} | URL: ${b.website_url}`);
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
  }
}

main();

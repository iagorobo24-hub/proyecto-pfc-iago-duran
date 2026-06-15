/**
 * Configurar marca Schneider Electric en la base de datos
 * 1. Crear marca Schneider en tabla brands
 * 2. Actualizar todos los productos existentes con brand_id
 */

import { insertBrand, getBrands, updateProductsByMarca, getAllProductIds } from '../lib/supabase-sonex.js';

async function main() {
  console.log('\n=== CONFIGURAR MARCA SCHNEIDER ELECTRIC ===\n');

  // 1. Verificar si ya existe Schneider
  const brands = await getBrands();
  const schneider = brands?.find(b => b.name?.toLowerCase().includes('schneider'));
  
  if (schneider) {
    console.log('✅ Marca Schneider ya existe:', schneider);
  } else {
    console.log('📝 Creando marca Schneider Electric...');
    const newBrand = await insertBrand({
      name: 'Schneider Electric',
      website_url: 'https://www.se.com/es/es/'
    });
    console.log('✅ Marca creada:', newBrand);
  }

  // 2. Obtener brand_id de Schneider
  const updatedBrands = await getBrands();
  const schneiderBrand = updatedBrands?.find(b => b.name?.toLowerCase().includes('schneider'));
  
  if (!schneiderBrand) {
    console.error('❌ No se encontró la marca Schneider después de crearla');
    process.exit(1);
  }

  console.log('\n📋 Schneider brand_id:', schneiderBrand.id);

  // 3. Contar productos sin brand_id
  const products = await getAllProductIds();
  const sinBrand = products?.filter(p => !p.brand_id) || [];
  
  console.log(`📦 Total productos: ${products?.length || 0}`);
  console.log(`📦 Productos sin brand_id: ${sinBrand.length}`);

  if (sinBrand.length === 0) {
    console.log('\n✅ Todos los productos ya tienen brand_id');
    return;
  }

  // 4. Actualizar productos de Schneider Electric
  console.log('\n🔄 Actualizando productos de Schneider Electric...');
  const updated = await updateProductsByMarca('Schneider Electric', {
    brand_id: schneiderBrand.id
  });
  
  console.log(`✅ ${updated?.length || 0} productos actualizados con brand_id=${schneiderBrand.id}`);

  // 5. Verificación final
  const finalProducts = await getAllProductIds();
  const conBrand = finalProducts?.filter(p => p.brand_id === schneiderBrand.id) || [];
  const sinBrandFinal = finalProducts?.filter(p => !p.brand_id) || [];
  
  console.log('\n=== RESUMEN FINAL ===');
  console.log(`📦 Productos con brand_id Schneider: ${conBrand.length}`);
  console.log(`📦 Productos sin brand_id: ${sinBrandFinal.length}`);
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err);
  process.exit(1);
});

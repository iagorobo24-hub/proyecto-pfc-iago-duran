/**
 * MIGRACIÓN DE COLUMNAS - products table
 * 
 * 1. subfamilia → tipo (mover contenido)
 * 2. tipo → Gama (mover contenido)
 * 3. subfamilia = "Interruptor Magnetotérmico" para todos
 * 4. Subgama = extraer del nombre (iC60N, iC60H, C60SP, NSX100N, etc.)
 */

const SONEX_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const SONEX_KEY = process.env.SONEX_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2MDY5NSwiZXhwIjoyMDg4OTM2Njk1fQ.3DfYKquAUFFNx_c8NdMWmic7pVVckWsXEZWOJTuC5wg';

const HEADERS = {
  'apikey': SONEX_KEY,
  'Authorization': `Bearer ${SONEX_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function fetchAPI(path, options = {}) {
  const url = `${SONEX_URL}/rest/v1/${path}`;
  const res = await fetch(url, { ...options, headers: { ...HEADERS, ...options.headers } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase API error ${res.status}: ${err}`);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  return null;
}

// ─── Extraer subgama del nombre ────────────────────────────────────
function extractSubgama(name, gama) {
  if (!name) return null;
  const n = name.toUpperCase();
  
  // iC60 subgamas
  if (gama === 'Acti 9 iC60') {
    if (n.includes('IC60L') || n.includes('IC60 L')) return 'iC60L';
    if (n.includes('IC60H') || n.includes('IC60 H')) return 'iC60H';
    if (n.includes('IC60N') || n.includes('IC60 N')) return 'iC60N';
    return 'iC60';
  }
  
  // Vigi subgamas
  if (gama === 'Acti 9 Vigi para iC60') {
    if (n.includes('QUICK VIGI') || n.includes('QUICKVIGI')) return 'Quick Vigi';
    if (n.includes('VIGI')) return 'Vigi';
    return 'Vigi';
  }
  
  // C60 UL subgamas
  if (gama === 'C60 UL CSA IEC') {
    if (n.includes('C60BPR')) return 'C60BPR';
    if (n.includes('C60BP')) return 'C60BP';
    if (n.includes('C60SP')) return 'C60SP';
    if (n.includes('C60H-DC')) return 'C60H-DC';
    if (n.includes('C60L')) return 'C60L';
    if (n.includes('C60H')) return 'C60H';
    if (n.includes('C60N')) return 'C60N';
    if (n.includes('N40N')) return 'N40N';
    if (n.includes('N40VIGI')) return 'N40Vigi';
    return 'C60';
  }
  
  // iID subgamas
  if (gama === 'Interruptor diferencial Acti 9 iID') {
    if (n.includes('100A') || n.includes('80A')) return 'iID 80-100A';
    if (n.includes('63A') || n.includes('40A') || n.includes('25A')) return 'iID 25-63A';
    return 'iID';
  }
  
  // iSW subgamas
  if (gama === 'iSW') {
    if (n.includes('PILOTO')) return 'iSW con piloto';
    if (n.includes('100A') || n.includes('125A')) return 'iSW 100-125A';
    if (n.includes('40A')) return 'iSW 40A';
    if (n.includes('20A') || n.includes('32A')) return 'iSW 20-32A';
    return 'iSW';
  }
  
  // iCT subgamas
  if (gama === 'Acti 9 iCT') {
    if (n.includes('CT IC40') || n.includes('CTI C40')) return 'CT iC40';
    if (n.includes('63 A')) return 'iCT 63A';
    if (n.includes('40 A')) return 'iCT 40A';
    if (n.includes('25 A')) return 'iCT 25A';
    return 'iCT';
  }
  
  // iCV40 subgamas
  if (gama === 'Acti9 iCV40') {
    if (n.includes('ICV40N') || n.includes('ICV40 N')) return 'iCV40N';
    return 'iCV40';
  }
  
  // NSX subgamas
  if (gama === 'ComPacT NSX') {
    // Extract NSX model from name
    const nsxMatch = n.match(/NSX(\d+[A-Z]?)/);
    if (nsxMatch) return 'NSX' + nsxMatch[1];
    return 'NSX';
  }
  
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('\n=== MIGRACIÓN DE COLUMNAS PRODUCTS ===\n');

  // 1. Get all products - paginate to get everything
  console.log('📥 Cargando todos los productos...');
  let allProducts = [];
  let offset = 0;
  const batchSize = 1000;
  
  while (true) {
    const batch = await fetchAPI(`products?select=id,name,tipo,subfamilia&limit=${batchSize}&offset=${offset}`);
    if (!batch || batch.length === 0) break;
    allProducts.push(...batch);
    offset += batchSize;
    if (batch.length < batchSize) break;
  }
  console.log(`📦 ${allProducts.length} productos cargados\n`);

  // 2. Migrate each product
  let migrated = 0;
  let errors = 0;
  
  for (const p of allProducts) {
    const newTipo = p.subfamilia; // subfamilia → tipo
    const newGama = p.tipo;       // tipo → Gama
    const newSubfamilia = 'Interruptor Magnetotérmico';
    const newSubgama = extractSubgama(p.name, p.tipo);
    
    try {
      await fetchAPI(`products?id=eq.${p.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          subfamilia: newSubfamilia,
          tipo: newTipo,
          Gama: newGama,
          Subgama: newSubgama
        })
      });
      migrated++;
    } catch (err) {
      console.error(`❌ Error migrating ${p.id}: ${err.message}`);
      errors++;
    }
    
    if (migrated % 100 === 0) {
      console.log(`  Progreso: ${migrated}/${allProducts.length}`);
    }
  }

  // 3. Summary
  console.log('\n=== RESUMEN ===');
  console.log(`✅ Migrados: ${migrated}`);
  console.log(`❌ Errores: ${errors}`);
  
  // 4. Verify
  console.log('\n🔍 Verificando...');
  const sample = await fetchAPI('products?select=id,name,subfamilia,tipo,"Gama","Subgama"&limit=5');
  console.log('Sample:');
  sample?.forEach(p => {
    console.log(`  ${p.id}: subfamilia=${p.subfamilia}, tipo=${p.tipo}, Gama=${p.Gama}, Subgama=${p.Subgama}`);
  });
  
  // Count by Gama
  const verifyProducts = await fetchAPI('products?select="Gama","Subgama"&limit=10000');
  const gamaCount = {};
  verifyProducts?.forEach(p => {
    const key = `${p.Gama} > ${p.Subgama || '(sin subgama)'}`;
    gamaCount[key] = (gamaCount[key] || 0) + 1;
  });
  console.log('\n📊 Distribución por Gama > Subgama:');
  for (const [key, count] of Object.entries(gamaCount).sort()) {
    console.log(`  ${key}: ${count}`);
  }
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err);
  process.exit(1);
});

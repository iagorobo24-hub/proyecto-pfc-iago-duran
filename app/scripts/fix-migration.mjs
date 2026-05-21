/**
 * CORREGIR MIGRACIÓN - products table
 * 
 * Usa el campo `name` para reconstruir Gama y Subgama correctamente.
 * Restaura tipo a su valor original (subfamilia antigua: CARRIL DIN, CAJA MOLDEADA).
 * subfamilia ya está bien: "Interruptor Magnetotérmico".
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

// ─── Extraer Gama y Subgama del nombre ────────────────────────────
function extractGamaSubgama(name) {
  if (!name) return { gama: null, subgama: null };
  const n = name.toUpperCase();
  
  // ComPacT NSX
  if (n.includes('COMPACT NSX') || n.includes('COMPACTNSX') || n.includes('NSX')) {
    const nsxMatch = n.match(/NSX(\d+[A-Z]?)/);
    return {
      gama: 'ComPacT NSX',
      subgama: nsxMatch ? 'NSX' + nsxMatch[1] : 'NSX'
    };
  }
  
  // Acti 9 iC60
  if (n.includes('IC60') || n.includes('IC 60')) {
    if (n.includes('IC60L') || n.includes('IC60 L')) return { gama: 'Acti 9 iC60', subgama: 'iC60L' };
    if (n.includes('IC60H') || n.includes('IC60 H')) return { gama: 'Acti 9 iC60', subgama: 'iC60H' };
    if (n.includes('IC60N') || n.includes('IC60 N')) return { gama: 'Acti 9 iC60', subgama: 'iC60N' };
    return { gama: 'Acti 9 iC60', subgama: 'iC60' };
  }
  
  // Acti 9 Vigi para iC60
  if (n.includes('VIGI') && (n.includes('IC60') || n.includes('BLOQUE DIFERENCIAL') || n.includes('EARTH LEAKAGE'))) {
    if (n.includes('QUICK VIGI') || n.includes('QUICKVIGI')) return { gama: 'Acti 9 Vigi para iC60', subgama: 'Quick Vigi' };
    return { gama: 'Acti 9 Vigi para iC60', subgama: 'Vigi' };
  }
  
  // Interruptor diferencial Acti 9 iID
  if (n.includes('IID') || n.includes('RCCB') || n.includes('INTERRUPTOR DIFERENCIAL') || n.includes('DISYUNTOR')) {
    if (n.includes('100A') || n.includes('80A')) return { gama: 'Interruptor diferencial Acti 9 iID', subgama: 'iID 80-100A' };
    if (n.includes('63A') || n.includes('40A') || n.includes('25A')) return { gama: 'Interruptor diferencial Acti 9 iID', subgama: 'iID 25-63A' };
    return { gama: 'Interruptor diferencial Acti 9 iID', subgama: 'iID' };
  }
  
  // iSW
  if (n.includes('ISW') || n.includes('INTERRUPTOR EN CARGA') || n.includes('INTERRUPTOR ')) {
    if (n.includes('PILOTO')) return { gama: 'iSW', subgama: 'iSW con piloto' };
    if (n.includes('100A') || n.includes('125A')) return { gama: 'iSW', subgama: 'iSW 100-125A' };
    if (n.includes('40A')) return { gama: 'iSW', subgama: 'iSW 40A' };
    if (n.includes('20A') || n.includes('32A')) return { gama: 'iSW', subgama: 'iSW 20-32A' };
    return { gama: 'iSW', subgama: 'iSW' };
  }
  
  // iCT
  if (n.includes('CONTACTOR') || n.includes('ICT') || n.includes('I CT')) {
    if (n.includes('CT IC40') || n.includes('CTI C40')) return { gama: 'Acti 9 iCT', subgama: 'CT iC40' };
    if (n.includes('63 A') || n.includes('63A')) return { gama: 'Acti 9 iCT', subgama: 'iCT 63A' };
    if (n.includes('40 A') || n.includes('40A')) return { gama: 'Acti 9 iCT', subgama: 'iCT 40A' };
    if (n.includes('25 A') || n.includes('25A')) return { gama: 'Acti 9 iCT', subgama: 'iCT 25A' };
    return { gama: 'Acti 9 iCT', subgama: 'iCT' };
  }
  
  // iCV40
  if (n.includes('ICV40')) {
    if (n.includes('ICV40N') || n.includes('ICV40 N')) return { gama: 'Acti9 iCV40', subgama: 'iCV40N' };
    return { gama: 'Acti9 iCV40', subgama: 'iCV40' };
  }
  
  // C60 UL CSA IEC (Multi 9)
  if (n.includes('MULTI 9') || n.includes('MULTI9') || n.includes('C60')) {
    if (n.includes('C60BPR')) return { gama: 'C60 UL CSA IEC', subgama: 'C60BPR' };
    if (n.includes('C60BP')) return { gama: 'C60 UL CSA IEC', subgama: 'C60BP' };
    if (n.includes('C60SP')) return { gama: 'C60 UL CSA IEC', subgama: 'C60SP' };
    if (n.includes('C60H-DC')) return { gama: 'C60 UL CSA IEC', subgama: 'C60H-DC' };
    if (n.includes('C60L')) return { gama: 'C60 UL CSA IEC', subgama: 'C60L' };
    if (n.includes('C60H')) return { gama: 'C60 UL CSA IEC', subgama: 'C60H' };
    if (n.includes('C60N')) return { gama: 'C60 UL CSA IEC', subgama: 'C60N' };
    if (n.includes('N40N')) return { gama: 'C60 UL CSA IEC', subgama: 'N40N' };
    if (n.includes('N40VIGI')) return { gama: 'C60 UL CSA IEC', subgama: 'N40Vigi' };
    return { gama: 'C60 UL CSA IEC', subgama: 'C60' };
  }
  
  return { gama: null, subgama: null };
}

// ─── Determinar tipo (subfamilia antigua) ─────────────────────────
function extractTipo(name, gama) {
  if (!name) return 'Interruptor Magnetotérmico';
  const n = name.toUpperCase();
  
  // NSX → CAJA MOLDEADA
  if (n.includes('COMPACT NSX') || n.includes('COMPACTNSX') || n.includes('NSX')) {
    return 'CAJA MOLDEADA';
  }
  
  // Resto → CARRIL DIN
  return 'CARRIL DIN';
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('\n=== CORREGIR MIGRACIÓN PRODUCTS ===\n');

  // 1. Get all products
  console.log('📥 Cargando todos los productos...');
  let allProducts = [];
  let offset = 0;
  const batchSize = 1000;
  
  while (true) {
    const batch = await fetchAPI(`products?select=id,name&limit=${batchSize}&offset=${offset}`);
    if (!batch || batch.length === 0) break;
    allProducts.push(...batch);
    offset += batchSize;
    if (batch.length < batchSize) break;
  }
  console.log(`📦 ${allProducts.length} productos cargados\n`);

  // 2. Fix each product
  let fixed = 0;
  let errors = 0;
  
  for (const p of allProducts) {
    const { gama, subgama } = extractGamaSubgama(p.name);
    const tipo = extractTipo(p.name, gama);
    
    try {
      await fetchAPI(`products?id=eq.${p.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          subfamilia: 'Interruptor Magnetotérmico',
          tipo: tipo,
          Gama: gama,
          Subgama: subgama
        })
      });
      fixed++;
    } catch (err) {
      console.error(`❌ Error fixing ${p.id}: ${err.message}`);
      errors++;
    }
    
    if (fixed % 200 === 0) {
      console.log(`  Progreso: ${fixed}/${allProducts.length}`);
    }
  }

  // 3. Summary
  console.log('\n=== RESUMEN ===');
  console.log(`✅ Corregidos: ${fixed}`);
  console.log(`❌ Errores: ${errors}`);
  
  // 4. Verify
  console.log('\n🔍 Verificando...');
  const sample = await fetchAPI('products?select=id,name,subfamilia,tipo,"Gama","Subgama"&limit=10');
  console.log('Sample:');
  sample?.forEach(p => {
    console.log(`  ${p.id}: subfamilia=${p.subfamilia}, tipo=${p.tipo}, Gama=${p.Gama}, Subgama=${p.Subgama}`);
    console.log(`    name: ${p.name?.substring(0, 80)}`);
  });
  
  // Count by Gama > Subgama
  const verifyProducts = await fetchAPI('products?select="Gama","Subgama"&limit=10000');
  const gamaCount = {};
  verifyProducts?.forEach(p => {
    const key = `${p.Gama || '(sin Gama)'} > ${p.Subgama || '(sin subgama)'}`;
    gamaCount[key] = (gamaCount[key] || 0) + 1;
  });
  console.log('\n📊 Distribución por Gama > Subgama:');
  for (const [key, count] of Object.entries(gamaCount).sort()) {
    console.log(`  ${key}: ${count}`);
  }
  
  // Count by tipo
  const tipoCount = {};
  verifyProducts?.forEach(p => {
    // Need to fetch tipo separately
  });
  const tipoRes = await fetchAPI('products?select=tipo&limit=10000');
  tipoRes?.forEach(p => {
    tipoCount[p.tipo] = (tipoCount[p.tipo] || 0) + 1;
  });
  console.log('\n📊 Distribución por tipo:');
  for (const [key, count] of Object.entries(tipoCount).sort()) {
    console.log(`  ${key}: ${count}`);
  }
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err);
  process.exit(1);
});

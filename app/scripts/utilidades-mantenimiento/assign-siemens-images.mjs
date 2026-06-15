/**
 * ASSIGN SIEMENS PRODUCT IMAGES
 *
 * Strategy:
 * 1. Use exact image URLs already stored in DB
 * 2. For products in Subgamas that have images → assign best representative
 * 3. For products in Gamas without images → cross-reference by product type
 * 4. Last resort: Use Siemens brand logo
 *
 * Uso:
 *   export SONEX_SUPABASE_KEY="..."
 *   node scripts/assign-siemens-images.mjs [--dry-run]
 */

const SONEX_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const SONEX_KEY = process.env.SONEX_SUPABASE_KEY || '';
const HEADERS = { 'apikey': SONEX_KEY, 'Authorization': `Bearer ${SONEX_KEY}`, 'Content-Type': 'application/json' };

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Siemens brand logo (fallback) ───────────────────────────
const SIEMENS_LOGO = 'https://mall.industry.siemens.com/mall/collaterals/Logo/Siemens_Logo.png';

// ─── Known image mappings: Subgama → best representative image ──
// These were obtained by scraping SiePortal with Firecrawl
const SUBGAMA_IMAGES = {
  '5SL6 Curva B':   'https://mall.industry.siemens.com/mall/collaterals/files/200/jpg/06/05/G_I202_XX_81207i.jpg',
  '5SL6 Curva C':   'https://mall.industry.siemens.com/mall/collaterals/files/200/jpg/01/05/G_I202_XX_81283i.jpg',
  '5SL6 Curva D':   'https://mall.industry.siemens.com/mall/collaterals/files/200/jpg/07/93/G_I202_XX_79130i.jpg',
  '5SL4 Curva D':   'https://mall.industry.siemens.com/mall/collaterals/files/200/jpg/07/93/G_I202_XX_79130i.jpg',
  '5SY7 General':   'https://mall.industry.siemens.com/mall/collaterals/files/200/jpg/04/27/P_I201_XX_04734i.jpg',
  '5JS6 Curva B':   'https://mall.industry.siemens.com/mall/collaterals/files/200/jpg/09/84/P_I201_XX_04937i.jpg',
  'General':        'https://mall.industry.siemens.com/mall/collaterals/files/200/jpg/04/58/G_I202_XX_52684t.jpg',
  'Bornas Siemens': 'https://mall.industry.siemens.com/mall/collaterals/files/200/jpg/06/78/P_I201_XX_04564i.jpg',
};

// ─── Cross-Gama fallbacks: product type → representative image ──
// These map product subfamilias to representative images
const SUBFAMILIA_IMAGES = {
  'Interruptor Magnetotérmico': SUBGAMA_IMAGES['5SL6 Curva B'],
  'Interruptor Diferencial':    SUBGAMA_IMAGES['5SY7 General'],
  'Contactores':                SUBGAMA_IMAGES['Bornas Siemens'],
};

// ─── Fetch all Siemens products ────────────────────────────────
async function fetchAllSiemens() {
  let all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SONEX_URL}/rest/v1/products?marca=eq.Siemens&select=id,ref_fabricante,subfamilia,Gama,Subgama,imagen&limit=${limit}&offset=${offset}&order=id`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();
    if (data.length === 0) break;
    all = all.concat(data);
    offset += limit;
    process.stdout.write(`\r  📦 Loaded ${all.length} products...`);
  }
  console.log(`\n  ✅ Total: ${all.length} Siemens products`);
  return all;
}

// ─── Build image assignment map ────────────────────────────────
function buildImageAssignments(products) {
  const assignments = []; // { id, ref, currentImg, newImg, reason }
  let assigned = 0;
  let subgamaMatch = 0;
  let gamaMatch = 0;
  let subfamiliaMatch = 0;
  let logoFallback = 0;

  // Build lookup: Subgama → best image from existing products
  const subgamaBest = {};
  const gamaBest = {};
  for (const p of products) {
    if (p.imagen) {
      const sg = (p.Subgama || '').trim();
      const ga = (p.Gama || '').trim();
      if (sg && !subgamaBest[sg]) subgamaBest[sg] = p.imagen;
      if (ga && !gamaBest[ga]) gamaBest[ga] = p.imagen;
    }
  }

  for (const p of products) {
    if (p.imagen) continue; // already has image

    const sg = (p.Subgama || '').trim();
    const ga = (p.Gama || '').trim();
    const sf = (p.subfamilia || '').trim();

    let imgUrl = null;
    let reason = '';

    // Level 1: Same Subgama
    if (SUBGAMA_IMAGES[sg]) {
      imgUrl = SUBGAMA_IMAGES[sg];
      reason = `subgama:${sg}`;
      subgamaMatch++;
    } else if (subgamaBest[sg]) {
      imgUrl = subgamaBest[sg];
      reason = `subgama_best:${sg}`;
      subgamaMatch++;
    }

    // Level 2: Same Gama (without image in subgama)
    if (!imgUrl) {
      if (gamaBest[ga]) {
        imgUrl = gamaBest[ga];
        reason = `gama:${ga}`;
        gamaMatch++;
      }
    }

    // Level 3: Same subfamilia (cross-gama match)
    if (!imgUrl) {
      if (SUBFAMILIA_IMAGES[sf]) {
        imgUrl = SUBFAMILIA_IMAGES[sf];
        reason = `subfamilia:${sf}`;
        subfamiliaMatch++;
      }
    }

    // Level 4: Siemens logo
    if (!imgUrl) {
      imgUrl = SIEMENS_LOGO;
      reason = 'logo_fallback';
      logoFallback++;
    }

    assignments.push({
      id: p.id,
      ref: p.ref_fabricante,
      currentImg: p.imagen,
      newImg: imgUrl,
      reason,
    });
  }

  console.log(`\n📊 Assignment strategy:
    Subgama match:   ${subgamaMatch}
    Gama match:      ${gamaMatch}
    Subfamilia match:${subfamiliaMatch}
    Logo fallback:   ${logoFallback}
    Total assigned:  ${assignments.length}`);

  return assignments;
}

// ─── Update DB ─────────────────────────────────────────────────
async function updateDB(assignments) {
  const toUpdate = assignments.filter(a => a.newImg && a.newImg !== a.currentImg);
  console.log(`\n💾 Updating ${toUpdate.length} products in DB...`);

  let ok = 0;
  let err = 0;
  for (let i = 0; i < toUpdate.length; i += 50) {
    const batch = toUpdate.slice(i, i + 50);
    const results = await Promise.all(batch.map(a =>
      fetch(`${SONEX_URL}/rest/v1/products?id=eq.${a.id}`, {
        method: 'PATCH',
        headers: { ...HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ imagen: a.newImg }),
      }).then(r => r.ok ? 'ok' : 'fail').catch(() => 'fail')
    ));
    ok += results.filter(s => s === 'ok').length;
    err += results.filter(s => s === 'fail').length;
    process.stdout.write(`\r  ✅ ${ok} | ❌ ${err}  (${Math.min(i + 50, toUpdate.length)}/${toUpdate.length})`);
  }

  console.log(`\n\n✅ Done! ${ok} updated, ${err} errors`);
  return { ok, err };
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(60));
  console.log('  ASSIGN SIEMENS PRODUCT IMAGES');
  console.log('='.repeat(60));

  if (DRY_RUN) console.log('🔷 DRY RUN — no DB changes');

  const products = await fetchAllSiemens();
  const withImg = products.filter(p => p.imagen).length;
  const withoutImg = products.filter(p => !p.imagen).length;
  console.log(`  With images: ${withImg}`);
  console.log(`  Without images: ${withoutImg}`);

  const assignments = buildImageAssignments(products);

  if (!DRY_RUN) {
    await updateDB(assignments);
  } else {
    console.log('\n🔷 DRY RUN — skipping DB update');
    console.log('\n📋 Sample assignments (first 20):');
    assignments.slice(0, 20).forEach(a =>
      console.log(`  ${a.ref} → ${a.reason}`));
  }

  // Report
  const logoAssignments = assignments.filter(a => a.reason === 'logo_fallback');
  if (logoAssignments.length > 0) {
    console.log(`\n📋 Products getting Siemens logo (${logoAssignments.length}):`);
    logoAssignments.slice(0, 10).forEach(a => console.log(`  ${a.ref}`));
    if (logoAssignments.length > 10) console.log(`  ... and ${logoAssignments.length - 10} more`);
  }
}

main().catch(err => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});

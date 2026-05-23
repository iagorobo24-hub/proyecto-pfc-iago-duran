/**
 * MIGRACIÓN: Normalizar taxonomía de DISTRIBUCION DE POTENCIA
 * 
 * Aplica las reglas de DB_TAXONOMY.md para normalizar subfamilia y tipo.
 * Usa fetch nativo para evitar dependencia de WebSocket.
 * 
 * Uso: node scripts/normalize-taxonomy.mjs
 *       node scripts/normalize-taxonomy.mjs --dry-run
 */

const SONEX_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co'
const SONEX_KEY = process.env.SONEX_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2MDY5NSwiZXhwIjoyMDg4OTM2Njk1fQ.3DfYKquAUFFNx_c8NdMWmic7pVVckWsXEZWOJTuC5wg'

const HEADERS = {
  'apikey': SONEX_KEY,
  'Authorization': `Bearer ${SONEX_KEY}`,
  'Content-Type': 'application/json',
}

const DRY_RUN = process.argv.includes('--dry-run')

async function fetchAPI(path, options = {}) {
  const url = `${SONEX_URL}/rest/v1/${path}`
  const res = await fetch(url, { ...options, headers: { ...HEADERS, ...options.headers } })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase API error ${res.status}: ${err}`)
  }
  const ct = res.headers.get('content-type')
  if (ct && ct.includes('application/json')) return res.json()
  return null
}

// ─── Reglas de mapeo ─────────────────────────────
const RULES = [
  { gama: 'Acti 9 iC60',                subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN' },
  { gama: 'C60 UL CSA IEC',              subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN' },
  { gama: 'Resi9',                       subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN' },
  { gama: 'Protección modular magnetotérmica y diferencial', subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN' },
  { gama: 'Protección residencial magnetotérmica y diferencial', subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN' },
  { gama: 'Protección e Industria',     subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN' },
  { gama: 'Protección y distribución industrial', subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN' },
  { gama: 'Protección y distribución terciario', subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN' },
  { gama: 'Interruptores automáticos',  subfamilia: 'Interruptor Magnetotérmico', tipo: 'CARRIL DIN' },

  { gama: 'ComPacT NSX',                subfamilia: 'Interruptor Magnetotérmico', tipo: 'CAJA MOLDEADA' },
  { gama: 'Interruptores de caja moldeada DPX³', subfamilia: 'Interruptor Magnetotérmico', tipo: 'CAJA MOLDEADA' },
  { gama: 'Interruptores de caja moldeada DPX³ HP (alta potencia)', subfamilia: 'Interruptor Magnetotérmico', tipo: 'CAJA MOLDEADA' },
  { gama: 'Interruptores de caja moldeada DPX³ (todos)', subfamilia: 'Interruptor Magnetotérmico', tipo: 'CAJA MOLDEADA' },

  { gama: 'Interruptor diferencial Acti 9 iID', subfamilia: 'Interruptor Diferencial', tipo: 'CARRIL DIN' },
  { gama: 'iD',                          subfamilia: 'Interruptor Diferencial', tipo: 'CARRIL DIN' },
  { gama: 'Acti 9 Vigi para iC60',       subfamilia: 'Interruptor Diferencial', tipo: 'CARRIL DIN' },

  { gama: 'Acti 9 iCT',                 subfamilia: 'Contactor', tipo: 'CARRIL DIN' },
  { gama: 'Acti9 iCV40',                subfamilia: 'Contactor', tipo: 'CARRIL DIN' },
  { gama: 'Guardamotores, contactores y fusibles', subfamilia: 'Contactor', tipo: 'CARRIL DIN' },

  { gama: 'iTL', subfamilia: 'Elemento de Control', tipo: 'CARRIL DIN' },

  { gama: 'iPRC - iPRI',                subfamilia: 'Proteccion Sobretension', tipo: 'CARRIL DIN' },
  { gama: 'Limitadores de sobretensión', subfamilia: 'Proteccion Sobretension', tipo: 'CARRIL DIN' },

  { gama: 'iSW',                         subfamilia: 'Interruptor Seccionador', tipo: 'CARRIL DIN' },
  { gama: 'Interruptores seccionadores', subfamilia: 'Interruptor Seccionador', tipo: 'CARRIL DIN' },

  { gama: 'Rearmador diferencial',       subfamilia: 'Rearmador', tipo: 'CARRIL DIN' },
]

const FALLBACK_RULES = [
  { pattern: /^A9E183/, subfamilia: 'Accesorio', tipo: 'Piloto luminoso' },
  { pattern: /^A9XPK/,   subfamilia: 'Accesorio', tipo: 'CARRIL DIN' },
  { pattern: /^LVS/,     subfamilia: 'Accesorio', tipo: 'CARRIL DIN' },
  { pattern: /^M8650/,   subfamilia: 'Accesorio', tipo: 'Contador eléctrico' },
  { pattern: /^A9X/,     subfamilia: 'Accesorio', tipo: 'CARRIL DIN' },
]

async function main() {
  console.log('📦 Cargando productos de DISTRIBUCION DE POTENCIA...')

  const allProducts = []
  for (let offset = 0; ; offset += 1000) {
    const data = await fetchAPI(`products?select=id,ref_fabricante,Gama,subfamilia,tipo&familia=eq.DISTRIBUCION%20DE%20POTENCIA&limit=1000&offset=${offset}`)
    allProducts.push(...data)
    if (!data || data.length < 1000) break
  }

  console.log(`📋 ${allProducts.length} productos cargados\n`)

  let changes = []
  let unchanged = 0

  for (const p of allProducts) {
    let rule = null

    if (p.Gama) {
      rule = RULES.find(r => r.gama === p.Gama) || null
    }

    if (!rule && !p.Gama) {
      for (const fr of FALLBACK_RULES) {
        if (fr.pattern.test(p.ref_fabricante || '')) {
          rule = fr
          break
        }
      }
    }

    if (!rule) {
      if (!p.Gama) {
        rule = { subfamilia: 'Accesorio', tipo: 'CARRIL DIN' }
      } else {
        console.log(`⚠️  Sin regla para: ${p.Gama} | ${p.ref_fabricante}`)
        continue
      }
    }

    if (p.subfamilia === rule.subfamilia && p.tipo === rule.tipo) {
      unchanged++
      continue
    }

    changes.push({
      id: p.id,
      ref: p.ref_fabricante,
      gama: p.Gama || '(sin gama)',
      antes: { subfamilia: p.subfamilia, tipo: p.tipo },
      despues: { subfamilia: rule.subfamilia, tipo: rule.tipo },
    })
  }

  console.log(`✅ Sin cambios: ${unchanged}`)
  console.log(`🔄 Cambios: ${changes.length}\n`)

  const byGama = {}
  changes.forEach(c => {
    if (!byGama[c.gama]) byGama[c.gama] = []
    byGama[c.gama].push(c)
  })

  Object.entries(byGama).forEach(([g, cs]) => {
    const s = cs[0]
    console.log(`${g.padEnd(45)} ${cs.length}x   ${s.antes.subfamilia}/${s.antes.tipo} → ${s.despues.subfamilia}/${s.despues.tipo}`)
  })

  if (changes.length === 0) {
    console.log('\n✨ Todo normalizado.')
    return
  }

  if (DRY_RUN) {
    console.log('\n🔷 DRY RUN — no se aplicaron cambios.')
    return
  }

  console.log('\n💾 Aplicando cambios...')

  for (const c of changes) {
    const body = JSON.stringify({ subfamilia: c.despues.subfamilia, tipo: c.despues.tipo })
    const { status } = await fetch(`${SONEX_URL}/rest/v1/products?id=eq.${c.id}`, {
      method: 'PATCH',
      headers: { ...HEADERS, 'Prefer': 'return=minimal' },
      body,
    })
    if (status >= 400) console.error(`❌ Error actualizando ${c.ref} (id=${c.id}): status ${status}`)
  }

  console.log(`✅ ${changes.length} productos actualizados.`)
}

main().catch(console.error)
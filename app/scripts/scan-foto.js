import { readFileSync } from 'fs'
const env = readFileSync('.env', 'utf-8').split('\n').reduce((a,l) => { 
  const [k,v]=l.split('='); return k&&v?{...a,[k.trim()]:v.trim()}:a 
}, {})

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Escaneando primeros 3000 productos buscando FOTOVOLTAICA...\n')

let encontrados = []
let offset = 0
let totalLeidos = 0

while (offset < 3000 && encontrados.length < 50) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/products?select=familia,subfamilia,tipo,marca&range=${offset}-${offset+999}`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
  })
  
  const batch = await resp.json()
  if (!Array.isArray(batch) || batch.length === 0) break
  
  totalLeidos += batch.length
  
  // Buscar variantes de fotovoltaica
  const foto = batch.filter(p => 
    p.familia?.toLowerCase().includes('fotovoltaica') ||
    p.familia?.includes('FOTOVOLTAICA') ||
    p.familia?.includes('SOLAR')
  )
  
  if (foto.length > 0) {
    console.log(`✅ Batch ${offset/1000}: ${foto.length} encontrados (en ${batch.length})`)
    encontrados.push(...foto)
  } else {
    console.log(`   Batch ${offset/1000}: 0 encontrados (en ${batch.length})`)
  }
  
  offset += 1000
}

console.log(`\n📦 Total leídos: ${totalLeidos}`)
console.log(`📦 Fotovoltaica encontrados: ${encontrados.length}\n`)

if (encontrados.length > 0) {
  console.log('📊 FAMILIAS ENCONTRADAS:')
  const familias = {}
  encontrados.forEach(p => {
    familias[p.familia] = (familias[p.familia] || 0) + 1
  })
  Object.entries(familias).forEach(([f,c]) => {
    console.log(`  ${f.padEnd(30)} → ${c}`)
  })
  
  console.log('\n📊 SUBFAMILIAS:')
  const subs = {}
  encontrados.forEach(p => {
    subs[p.subfamilia] = (subs[p.subfamilia] || 0) + 1
  })
  Object.entries(subs).sort((a,b) => b[1] - a[1]).forEach(([s,c]) => {
    console.log(`  ${s.padEnd(30)} → ${c}`)
  })
  
  console.log('\n📊 TIPOS:')
  const tipos = {}
  encontrados.forEach(p => {
    tipos[p.tipo] = (tipos[p.tipo] || 0) + 1
  })
  Object.entries(tipos).sort((a,b) => b[1] - a[1]).forEach(([t,c]) => {
    console.log(`  ${t.padEnd(30)} → ${c}`)
  })
}
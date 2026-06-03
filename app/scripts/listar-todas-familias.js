import { readFileSync } from 'fs'
const env = readFileSync('.env', 'utf-8').split('\n').reduce((a,l) => { 
  const [k,v]=l.split('='); return k&&v?{...a,[k.trim()]:v.trim()}:a 
}, {})

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Escaneando TODAS las familias únicas en los primeros 5000 productos...\n')

const todasFamilias = new Set()
let offset = 0

while (offset < 5000) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/products?select=familia&range=${offset}-${offset+999}`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
  })
  
  const batch = await resp.json()
  if (!Array.isArray(batch) || batch.length === 0) break
  
  batch.forEach(p => {
    if (p.familia) todasFamilias.add(p.familia.trim())
  })
  
  offset += batch.length
  if (batch.length < 1000) break
}

console.log(`Familias únicas encontradas (${todasFamilias.size}):\n`)

const arrayFamilias = Array.from(todasFamilias).sort()

// Buscar cualquier cosa relacionada con vehículos
console.log('🔍 BUSCANDO "VEHICUL" (case insensitive):')
const vehiculos = arrayFamilias.filter(f => f.toLowerCase().includes('vehicul'))
if (vehiculos.length > 0) {
  vehiculos.forEach(f => console.log(`  ✅ "${f}"`))
} else {
  console.log('  ❌ No se encontró ninguna familia con "vehicul"')
}

console.log('\n📋 TODAS LAS FAMILIAS:')
arrayFamilias.forEach(f => {
  const icon = f.toLowerCase().includes('vehicul') ? '🚗' : '  '
  console.log(`${icon} ${f}`)
})
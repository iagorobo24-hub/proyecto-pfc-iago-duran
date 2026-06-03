import { readFileSync } from 'fs'
const env = readFileSync('.env', 'utf-8').split('\n').reduce((a,l) => { 
  const [k,v]=l.split('='); return k&&v?{...a,[k.trim()]:v.trim()}:a 
}, {})

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY

// Query directa con conteo por familia
console.log('📊 FAMILIAS EN LA BASE DE DATOS (COUNT directo)\n')

const resp = await fetch(
  `${SUPABASE_URL}/rest/v1/products?select=familia&count=exact`,
  {
    headers: { 
      'apikey': SUPABASE_ANON_KEY, 
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer': 'count=exact'
    }
  }
)

console.log('Status:', resp.status)
const countHeader = resp.headers.get('content-range')
console.log('Content-Range:', countHeader)

if (countHeader) {
  const total = countHeader.split('/')[1]
  console.log(`\n📦 TOTAL PRODUCTOS EN DB: ${total}`)
}

// Ahora probar query simple de muestra
const resp2 = await fetch(
  `${SUPABASE_URL}/rest/v1/products?select=familia&limit=100`,
  { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY } }
)

const muestra = await resp2.json()
console.log(`\n📋 Muestra de 100 productos:`)

const conteo = {}
muestra.forEach(p => {
  conteo[p.familia] = (conteo[p.familia] || 0) + 1
})

Object.entries(conteo).sort((a,b) => b[1] - a[1]).forEach(([f,c]) => {
  console.log(`  ${f.padEnd(35)} → ${c}`)
})
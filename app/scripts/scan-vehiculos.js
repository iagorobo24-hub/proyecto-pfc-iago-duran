import { readFileSync } from 'fs'
const env = readFileSync('.env', 'utf-8').split('\n').reduce((a,l) => { 
  const [k,v]=l.split('='); return k&&v?{...a,[k.trim()]:v.trim()}:a 
}, {})

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Escaneando busescando "Vehículos"...\n')

let encontrados = []
let offset = 0

// Escanear de 1000 en 1000 hasta encontrar
while (encontrados.length === 0 && offset < 5000) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/products?select=familia,id&range=${offset}-${offset+999}`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
  })
  
  const batch = await resp.json()
  if (!Array.isArray(batch)) break
  
  const vehiculos = batch.filter(p => p.familia?.toLowerCase().includes('vehicul'))
  if (vehiculos.length > 0) {
    console.log(`✅ Batch ${offset/1000}: ${vehiculos.length} productos encontrados`)
    console.log('   Familias encontradas:')
    const conteo = {}
    vehiculos.forEach(p => conteo[p.familia] = (conteo[p.familia] || 0) + 1)
    Object.entries(conteo).forEach(([f,c]) => {
      console.log(`     - ${f}: ${c} productos`)
      if (encontrados.length < 50) encontrados.push(...vehiculos.slice(0, 50 - encontrados.length))
    })
  } else {
    console.log(`   Batch ${offset/1000}: 0 vehículos (en ${batch.length})`)
  }
  
  offset += 1000
}

console.log(`\n📦 Total encontrados: ${encontrados.length}\n`)

if (encontrados.length > 0) {
  console.log('📊 Análisis completo de los encontrados:\n')
  
  // Subfamilias
  const subFamilias = {}
  encontrados.forEach(p => {
    const sub = (p.subfamilia || 'NULL').trim()
    subFamilias[sub] = (subFamilias[sub] || 0) + 1
  })
  console.log('SUBFAMILIAS:')
  Object.entries(subFamilias).sort((a,b) => b[1] - a[1]).forEach(([s,c]) => {
    console.log(`  ${s.padEnd(30)} → ${c}`)
  })
  
  // Tipos
  const tipos = {}
  encontrados.forEach(p => {
    const t = (p.tipo || 'NULL').trim()
    tipos[t] = (tipos[t] || 0) + 1
  })
  console.log('\nTIPOS:')
  Object.entries(tipos).sort((a,b) => b[1] - a[1]).forEach(([t,c]) => {
    console.log(`  ${t.padEnd(30)} → ${c}`)
  })
  
  // Marcas
  const marcas = {}
  encontrados.forEach(p => {
    const m = (p.marca || 'NULL').trim()
    marcas[m] = (marcas[m] || 0) + 1
  })
  console.log('\nMARCAS:')
  Object.entries(marcas).sort((a,b) => b[1] - a[1]).forEach(([m,c]) => {
    console.log(`  ${m.padEnd(30)} → ${c}`)
  })
  
  // Ejemplos
  console.log('\n📋 EJEMPLOS:')
  encontrados.slice(0, 3).forEach((p,i) => {
    console.log(`\n[${i+1}] ${p.name}`)
    console.log(`    Ref: ${p.ref_fabricante}`)
    console.log(`    Familia: ${p.familia}`)
    console.log(`    Subfamilia: ${p.subfamilia}`)
    console.log(`    Tipo: ${p.tipo}`)
    console.log(`    Marca: ${p.marca}`)
    console.log(`    Gama: ${p.Gama}`)
    console.log(`    Subgama: ${p.Subgama}`)
  })
}
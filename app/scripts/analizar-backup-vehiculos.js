import { readFileSync } from 'fs'

console.log('🔍 Analizando backup local de productos...\n')

const backup = JSON.parse(readFileSync('app/scripts/backups/products-backup-2026-06-01T00-43-26.json', 'utf-8'))
console.log(`📦 Total productos en backup: ${backup.length}\n`)

// Filtrar Vehículos eléctricos
const vehiculos = backup.filter(p => 
  p.familia?.toLowerCase().includes('vehicul') || 
  p.familia?.includes('VEHICULOS')
)

console.log(`🚗 Vehículos eléctricos encontrados: ${vehiculos.length}\n`)

if (vehiculos.length > 0) {
  console.log('📊 POR SUBFAMILIA:')
  const porSub = {}
  vehiculos.forEach(p => {
    const s = p.subfamilia || 'NULL'
    porSub[s] = (porSub[s] || 0) + 1
  })
  Object.entries(porSub).sort((a,b) => b[1] - a[1]).forEach(([s,c]) => {
    console.log(`  ${s.padEnd(30)} → ${c}`)
  })
  
  console.log('\n📊 POR TIPO:')
  const porTipo = {}
  vehiculos.forEach(p => {
    const t = p.tipo || 'NULL'
    porTipo[t] = (porTipo[t] || 0) + 1
  })
  Object.entries(porTipo).sort((a,b) => b[1] - a[1]).forEach(([t,c]) => {
    console.log(`  ${t.padEnd(30)} → ${c}`)
  })
  
  console.log('\n📊 POR MARCA:')
  const porMarca = {}
  vehiculos.forEach(p => {
    const m = p.marca || 'NULL'
    porMarca[m] = (porMarca[m] || 0) + 1
  })
  Object.entries(porMarca).sort((a,b) => b[1] - a[1]).slice(0,10).forEach(([m,c]) => {
    console.log(`  ${m.padEnd(30)} → ${c}`)
  })
  
  console.log('\n📋 EJEMPLOS (primeros 5):')
  vehiculos.slice(0, 5).forEach((p, i) => {
    console.log(`\n[${i+1}] ${p.name}`)
    console.log(`    Familia: ${p.familia}`)
    console.log(`    Subfamilia: ${p.subfamilia}`)
    console.log(`    Tipo: ${p.tipo}`)
    console.log(`    Marca: ${p.marca}`)
    console.log(`    Gama: ${p.Gama}`)
    console.log(`    Subgama: ${p.Subgama}`)
  })
}
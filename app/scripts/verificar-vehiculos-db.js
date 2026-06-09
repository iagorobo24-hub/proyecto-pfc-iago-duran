/**
 * @file verificar-vehiculos-db.js
 * @description Script utilitario local que se ejecuta en Node.js.
 * Carga manualmente las variables de entorno, consume la API REST de Supabase directamente
 * mediante peticiones fetch en batches (paginadas) y analiza el mapeo de familias y subfamilias
 * de los productos de la categoría "Vehículos Eléctricos" para detectar posibles inconsistencias de datos.
 */

import { readFileSync } from 'fs'

// Cargar y procesar sincrónicamente el archivo .env local para obtener las credenciales de Supabase
const env = readFileSync('.env', 'utf-8').split('\n').reduce((a,l) => { 
  const [k,v]=l.split('='); return k&&v?{...a,[k.trim()]:v.trim()}:a 
}, {})

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Verificando estado actual en Supabase...\n')

// Leer secuencialmente hasta 5000 productos del catálogo
let todos = []
let offset = 0

while (offset < 5000) {
  // Consumir el endpoint REST de Supabase de forma directa y paginada (de 1000 en 1000)
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/products?select=familia,subfamilia,tipo,marca,ref_fabricante,name&range=${offset}-${offset+999}`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
  })
  
  const batch = await resp.json()
  if (!Array.isArray(batch) || batch.length === 0) break
  
  todos.push(...batch)
  offset += batch.length
  if (batch.length < 1000) break
}

console.log(`📦 Productos leídos: ${todos.length}\n`)

// Filtrar los productos que pertenecen al ámbito de "Vehículos Eléctricos"
const vehiculos = todos.filter(p => 
  p.familia?.toLowerCase().includes('vehicul') ||
  p.familia?.includes('VEHICULOS')
)

console.log(`🚗 Productos de automóviles encontrados: ${vehiculos.length}\n`)

if (vehiculos.length > 0) {
  // Agrupar e imprimir la cantidad por cada Familia exacta encontrada
  console.log('📊 POR FAMILIA:')
  const porFamilia = {}
  vehiculos.forEach(p => {
    porFamilia[p.familia] = (porFamilia[p.familia] || 0) + 1
  })
  Object.entries(porFamilia).forEach(([f,c]) => {
    console.log(`  ${f.padEnd(35)} → ${c}`)
  })
  
  // Agrupar e imprimir la cantidad por cada Subfamilia exacta encontrada
  console.log('\n📊 POR SUBFAMILIA:')
  const porSub = {}
  vehiculos.forEach(p => {
    porSub[p.subfamilia] = (porSub[p.subfamilia] || 0) + 1
  })
  Object.entries(porSub).forEach(([s,c]) => {
    console.log(`  ${s.padEnd(35)} → ${c}`)
  })
  
  // Detectar productos con errores de asignación (donde la subfamilia se duplicó o es errónea)
  const problemáticos = vehiculos.filter(p => 
    p.subfamilia?.includes('VEHICULOS') || 
    p.subfamilia === p.familia
  )
  
  if (problemáticos.length > 0) {
    console.log(`\n⚠️  PRODUCTOS CON SUBFAMILIA MAL PUESTA: ${problemáticos.length}`)
    problemáticos.forEach(p => {
      console.log(`  • ${p.ref_fabricante} | ${p.marca} | subfamilia: "${p.subfamilia}"`)
    })
  } else {
    console.log('\n✅ No hay productos con subfamilia mal puesta')
  }
  
  // Verificar específicamente la distribución de productos de la marca Schneider Electric
  const schneider = vehiculos.filter(p => p.marca?.toLowerCase().includes('schneider'))
  if (schneider.length > 0) {
    console.log(`\n🔧 SCHNEIDER ELECTRIC: ${schneider.length} productos`)
    console.log('Subfamilias:')
    const subs = {}
    schneider.forEach(p => subs[p.subfamilia] = (subs[p.subfamilia] || 0) + 1)
    Object.entries(subs).forEach(([s,c]) => {
      console.log(`  ${s.padEnd(35)} → ${c}`)
    })
  }
} else {
  console.log('❌ No se encontraron productos de vehículos en los primeros', offset, 'productos')
  console.log('\n💡 Posible causa: Los productos están al final de la tabla (>5000)')
}
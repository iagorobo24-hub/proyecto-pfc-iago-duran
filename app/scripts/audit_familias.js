/**
 * Script para auditar productos por familia en Supabase
 * Ejecutar: node --experimental-fetch app/scripts/audit_familias.js
 */

const SUPABASE_URL = 'https://bmiyzgqsqhovfkgqnrtv.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtaXl6Z3FzcWhvdmZrZ3FucnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzU1NzYsImV4cCI6MjA3MDYxMTU3Nn0.hK6hKqj0zKqxLKqj0zKqxLKqj0zKqxLKqj0zKqx'

async function auditFamilias() {
  console.log('🔍 Auditando productos por familia en Supabase...\n')
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=familia`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  })
  
  if (!response.ok) {
    console.error('❌ Error HTTP:', response.status)
    return
  }
  
  const productos = await response.json()
  console.log(`📦 Total de productos: ${productos.length}\n`)
  
  const conteo = {}
  productos.forEach(p => {
    const familia = p.familia || 'SIN_FAMILIA'
    conteo[familia] = (conteo[familia] || 0) + 1
  })
  
  console.log('📊 Productos por familia:\n')
  Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .forEach(([familia, count]) => {
      const icon = familia.includes('DOMOTICA') || familia.includes('AUTOMATIZACION') ? '🏘️' : '📦'
      console.log(`${icon} ${familia.padEnd(45)} → ${count} productos`)
    })
  
  const domoticaCount = conteo['DOMOTICA'] || conteo['AUTOMATIZACION DE EDIFICIOS'] || conteo['DOMOTICA Y CONTROL'] || 0
  console.log(`\n${domoticaCount === 0 ? '❌' : '✅'} DOMOTICA / AUTOMATIZACION DE EDIFICIOS: ${domoticaCount} productos`)
  
  if (domoticaCount === 0) {
    console.log('\n⚠️  NO HAY PRODUCTOS DE DOMÓTICA/AUTOMATIZACIÓN EN LA DB')
    console.log('   Solución: Necesitas cargar productos en Supabase con familia="DOMOTICA" o "AUTOMATIZACION DE EDIFICIOS"')
  }
}

auditFamilias().catch(console.error)
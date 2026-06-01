#!/usr/bin/env node
/**
 * Script para actualizar VEHICULOS_ELECTRICOS → VEHICULOS ELECTRICOS en Supabase
 * Ejecutar: cd app && node scripts/update-vehiculos-electricos.js
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envPath = join(__dirname, '..', '.env')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) env[key.trim()] = value.trim()
})

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Faltan credenciales en .env')
  process.exit(1)
}

async function updateVehiculos() {
  console.log('🔧 Actualizando VEHICULOS_ELECTRICOS → VEHICULOS ELECTRICOS...\n')
  
  // Paso 1: Contar productos antiguos
  const countResp = await fetch(
    `${SUPABASE_URL}/rest/v1/products?familia=eq.VEHICULOS_ELECTRICOS&select=id&count=exact`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'count=exact'
      }
    }
  )
  
  const totalAntiguos = countResp.headers.get('content-range')?.split('/')?.[1] || '0'
  console.log(`📦 Productos con "VEHICULOS_ELECTRICOS": ${totalAntiguos}\n`)
  
  if (totalAntiguos === '0') {
    console.log('✅ No hay productos con la nomenclatura antigua')
    return
  }
  
  // Paso 2: Obtener IDs de productos a actualizar
  const productosResp = await fetch(
    `${SUPABASE_URL}/rest/v1/products?familia=eq.VEHICULOS_ELECTRICOS&select=id,ref_fabricante`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    }
  )
  
  const productos = await productosResp.json()
  console.log(`📝 Actualizando ${productos.length} productos...\n`)
  
  // Paso 3: Actualizar cada producto (patch)
  let actualizados = 0
  let errores = 0
  
  for (const prod of productos) {
    const updateResp = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${prod.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ familia: 'VEHICULOS ELECTRICOS' })
      }
    )
    
    if (updateResp.ok) {
      actualizados++
      console.log(`  ✓ ${prod.ref_fabricante}`)
    } else {
      errores++
      console.log(`  ✗ Error: ${prod.ref_fabricante}`)
    }
  }
  
  console.log(`\n${'='.repeat(60)}`)
  console.log(`✅ ACTUALIZACIÓN COMPLETADA`)
  console.log(`   Actualizados: ${actualizados}`)
  console.log(`   Errores: ${errores}`)
  console.log(`${'='.repeat(60)}\n`)
  
  // Verificación final
  const verifyResp = await fetch(
    `${SUPABASE_URL}/rest/v1/products?family=eq.VEHICULOS%20ELECTRICOS&select=id&count=exact`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'count=exact'
      }
    }
  )
  
  const totalNuevos = verifyResp.headers.get('content-range')?.split('/')?.[1] || '0'
  console.log(`📊 Total productos con "VEHICULOS ELECTRICOS": ${totalNuevos}`)
}

updateVehiculos().catch(err => {
  console.error('❌ Error:', err.message)
  console.error(err.stack)
  process.exit(1)
})
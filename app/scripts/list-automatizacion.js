#!/usr/bin/env node
/**
 * Script para listar productos de automatización
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

async function listProductos() {
  console.log('🔍 Listando productos de AUTOMATIZACION DE EDIFICIOS...\n')
  
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=nombre,ref_fabricante,marca,subfamilia&familia=eq.AUTOMATIZACION%20DE%20EDIFICIOS`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    }
  )
  
  if (!response.ok) {
    console.error(`HTTP Error: ${response.status}`)
    return
  }
  
  let productos = await response.json()
  if (!Array.isArray(productos)) {
    console.error('Respuesta no es array:', productos)
    productos = []
  }
  
  console.log(`📦 Productos en "AUTOMATIZACION DE EDIFICIOS": ${productos.length}\n`)
  
  if (productos.length === 0) {
    console.log('⚠️  No hay productos con familia exacta "AUTOMATIZACION DE EDIFICIOS"\n')
    console.log('🔧 Probablemente los productos usan "AUTOMATIZACION" a secas')
    console.log('   o tienen la familia con otro formato.')
  } else {
    productos.forEach((p, i) => {
      console.log(`${i+1}. ${p.nombre}`)
      console.log(`   Ref: ${p.ref_fabricante} | Marca: ${p.marca}`)
      console.log(`   Subfamilia: ${p.subfamilia || 'N/A'}\n`)
    })
  }
  
  // Now check AUTOMATIZACION (industrial)
  console.log('\n' + '='.repeat(60))
  console.log('🔍 Productos en "AUTOMATIZACION" (industrial):\n')
  
  const response2 = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=nombre,ref_fabricante,marca,subfamilia&familia=eq.AUTOMATIZACION&limit=10`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    }
  )
  
  const productos2 = await response2.json()
  console.log(`📦 Mostrando primeros ${Math.min(10, productos2.length)} de ${productos2.length} productos:\n`)
  
  productos2.slice(0, 10).forEach((p, i) => {
    console.log(`${i+1}. ${p.nombre}`)
    console.log(`   Ref: ${p.ref_fabricante} | Marca: ${p.marca}`)
    console.log(`   Subfamilia: ${p.subfamilia || 'N/A'}\n`)
  })
}

listProductos().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
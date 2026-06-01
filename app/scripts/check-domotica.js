#!/usr/bin/env node
/**
 * Script para contar productos por familia en Supabase
 * Lee las credenciales desde .env
 * Ejecutar: cd app && node scripts/check-domotica.js
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Leer .env
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
  console.error('❌ Faltan credenciales en .env:')
  console.error('   VITE_SUPABASE_URL=...')
  console.error('   VITE_SUPABASE_ANON_KEY=...')
  process.exit(1)
}

async function checkDomotica() {
  console.log('🔍 Verificando productos de Domótica/Automatización en Supabase...\n')
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=familia`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    console.error(`❌ Error HTTP ${response.status}: ${response.statusText}`)
    console.error('   Verifica que las credenciales en .env sean correctas')
    process.exit(1)
  }
  
  const productos = await response.json()
  console.log(`📦 Total de productos en DB: ${productos.length}\n`)
  
  // Agrupar por familia
  const conteo = {}
  productos.forEach(p => {
    const familia = (p.familia || 'SIN_FAMILIA').trim()
    conteo[familia] = (conteo[familia] || 0) + 1
  })
  
  console.log('📊 TOP 20 familias con más productos:\n')
  Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([familia, count]) => {
      const domotica = familia.includes('DOMOTICA') || familia.includes('AUTOMATIZACION')
      const icon = domotica ? '🏘️' : '📦'
      const highlight = domotica ? ' ← ¡IMPORTANTE!' : ''
      console.log(`${icon} ${familia.padEnd(45)} → ${count}${highlight}`)
    })
  
  // Contar domótica específicamente
  const domoticaCount = 
    (conteo['DOMOTICA'] || 0) + 
    (conteo['AUTOMATIZACION DE EDIFICIOS'] || 0) + 
    (conteo['DOMOTICA Y CONTROL'] || 0)
  
  console.log(`\n${'='.repeat(60)}`)
  console.log(`${domoticaCount === 0 ? '❌' : '✅'} DOMÓTICA / AUTOMATIZACIÓN:`)
  console.log(`   Total productos: ${domoticaCount}`)
  console.log(`${'='.repeat(60)}\n`)
  
  if (domoticaCount === 0) {
    console.log('⚠️  NO HAY PRODUCTOS DE DOMÓTICA EN LA BASE DE DATOS\n')
    console.log('🔧 SOLUCIÓN:')
    console.log('   1. Ejecuta este SQL en Supabase SQL Editor:')
    console.log('      SELECT COUNT(*) FROM products WHERE familia ILIKE \'%DOMOTICA%\';')
    console.log('')
    console.log('   2. Si hay productos antiguos con \'DOMOTICA\', actualiza:')
    console.log('      UPDATE products SET familia = \'AUTOMATIZACION DE EDIFICIOS\'')
    console.log('      WHERE familia ILIKE \'%DOMOTICA%\';')
    console.log('')
    console.log('   3. O inserta nuevos productos de automatización')
    console.log('')
    console.log('✅ El código YA ESTÁ LISTO (catalogService.ts y categoryMapping.js)')
    console.log('   Sólo faltan los datos en la base de datos.')
  } else {
    console.log('✅ Hay productos de automatización en la DB')
    console.log('   Si no se ven en la UI, limpia caché y recarga la página')
  }
}

checkDomotica().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
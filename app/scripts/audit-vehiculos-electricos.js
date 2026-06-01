#!/usr/bin/env node
/**
 * Script para auditar categorías de Vehículos Eléctricos en Supabase
 */

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
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

async function auditVehiculosElectricos() {
  console.log('🔍 Auditando categorías de VEHÍCULOS ELÉCTRICOS en Supabase...\n')
  
  // NOTA: Usamos VEHICULOS_ELECTRICOS por si aún hay productos con el nombre antiguo
  // También probamos sin filtro y filtramos manualmente
  
  console.log('📥 Descargando TODOS los productos de Supabase...')
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=familia,subfamilia,tipo,Gama,Subgama,marca,ref_fabricante,name`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    }
  )
  
  if (!resp.ok) {
    console.error(`❌ Error HTTP ${resp.status}`)
    console.error(await resp.text())
    return
  }
  
  const todos = await resp.json()
  const productos = todos.filter(p => 
    p.familia === 'VEHICULOS ELECTRICOS' || 
    p.familia === 'VEHICULOS_ELECTRICOS'
  )
  
  console.log(`📦 Total productos en "VEHICULOS ELECTRICOS": ${productos.length}\n`)
  
  if (productos.length === 0) {
    console.log('⚠️  No hay productos en esta familia')
    return
  }
  
  // Agrupar por Subfamilia
  const porSubfamilia = {}
  productos.forEach(p => {
    const subf = p.Subfamilia || 'SIN_SUBFAMILIA'
    if (!porSubfamilia[subf]) {
      porSubfamilia[subf] = []
    }
    porSubfamilia[subf].push(p)
  })
  
  console.log('📊 CATEGORÍAS (subfamilias) disponibles:\n')
  Object.entries(porSubfamilia)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([subf, prods]) => {
      console.log(`📁 ${subf}`)
      console.log(`   Productos: ${prods.length}`)
      
      // Ver tipos dentro de cada subfamilia
      const porTipo = {}
      prods.forEach(p => {
        const tipo = p.Tipo || 'SIN_TIPO'
        if (!porTipo[tipo]) porTipo[tipo] = []
        porTipo[tipo].push(p)
      })
      
      if (Object.keys(porTipo).length > 0) {
        console.log(`   Tipos:`)
        Object.entries(porTipo).forEach(([tipo, tProds]) => {
          console.log(`     • ${tipo}: ${tProds.length} productos`)
        })
      }
      
      // Mostrar primeras referencias
      console.log(`   Ejemplos:`)
      prods.slice(0, 3).forEach(p => {
        console.log(`     - ${p.ref_fabricante} | ${p.marca || 'N/A'} | ${p.name?.slice(0, 50) || 'N/A'}`)
      })
      console.log('')
    })
  
  // Resumen final
  console.log('='.repeat(70))
  console.log(`RESUMEN:`)
  console.log(`  Total productos: ${productos.length}`)
  console.log(`  Subfamilias: ${Object.keys(porSubfamilia).length}`)
  console.log(`  Subfamilias encontradas: ${Object.keys(porSubfamilia).join(', ')}`)
  console.log('='.repeat(70))
  
  // Verificar si hay datos inconsistentes
  const sinSubfamilia = productos.filter(p => !p.Subfamilia).length
  const sinTipo = productos.filter(p => !p.Tipo).length
  
  if (sinSubfamilia > 0) {
    console.log(`\n⚠️  ${sinSubfamilia} productos SIN subfamilia (datos incompletos)`)
  }
  if (sinTipo > 0) {
    console.log(`⚠️  ${sinTipo} productos SIN tipo (datos incompletos)`)
  }
}

auditVehiculosElectricos().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
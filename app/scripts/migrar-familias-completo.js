#!/usr/bin/env node
/**
 * MIGRACIÓN COMPLETA: Nombres de familias en Supabase
 * 
 * De: VEHICULOS_ELECTRICOS, AUTOMATIZACION, etc. (MAYÚSCULAS)
 * A: Vehículos eléctricos, Automatización, etc. (Case normal, con tildes)
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

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Faltan credenciales en .env')
  process.exit(1)
}

// Mapeo de nombres antiguos → nuevos
const MIGRACIONES = {
  'VEHICULOS_ELECTRICOS': 'Vehículos eléctricos',
  'VEHICULO ELECTRICO': 'Vehículos eléctricos',
  
  'AUTOMATIZACION': 'Automatización',
  'AUTOMATIZACION INDUSTRIAL': 'Automatización',
  'CONTROL Y AUTOMATIZACION INDUSTRIAL': 'Automatización',
  'AUTOMACION INDUSTRIAL': 'Automatización',
  
  'AUTOMATIZACION DE EDIFICIOS': 'Automatización de edificios',
  'DOMOTICA': 'Automatización de edificios',
  'DOMOTICA Y CONTROL': 'Automatización de edificios',
  
  'DISTRIBUCION DE POTENCIA': 'Distribución de potencia',
  'POTENCIA': 'Distribución de potencia',
  
  'FOTOVOLTAICA': 'Fotovoltaica',
  
  'ILUMINACION': 'Iluminación',
  'LUMINARIAS': 'Iluminación',
  
  'INSTALACION': 'Instalación',
  'CANALIZACION': 'Instalación',
  'CANALIZACIONES': 'Instalación',
  'BANDEJAS': 'Instalación',
  
  'CABLES': 'Cables',
  'CABLES DE BAJA TENSION': 'Cables',
  'CABLES DE MEDIA TENSION': 'Cables',
  'CABLES DE ALTA TENSION': 'Cables',
  
  'CLIMATIZACION': 'Climatización',
  'HVAC': 'Climatización',
  'CLIMA': 'Climatización',
  
  'COMUNICACION': 'Comunicación',
  'HERRAMIENTAS': 'Herramientas',
  'PROTECCION': 'Protección',
  'FONTANERIA': 'Fontanería',
  'ENERGIAS RENOVABLES': 'Energías renovables',
}

async function migrarFamilias() {
  console.log('🔄 INICIANDO MIGRACIÓN DE FAMILIAS\n')
  console.log('Leyendo todos los productos de Supabase...')
  
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,familia`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  })
  
  if (!resp.ok) {
    console.error(`❌ Error HTTP ${resp.status}`)
    return
  }
  
  const todos = await resp.json()
  console.log(`📦 Total productos: ${todos.length}\n`)
  
  // Agrupar por familia actual
  const porFamilia = {}
  todos.forEach(p => {
    const f = p.familia || 'NULL'
    if (!porFamilia[f]) porFamilia[f] = []
    porFamilia[f].push(p.id)
  })
  
  console.log('📊 Familias actuales en DB:')
  Object.entries(porFamilia)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([f, ids]) => {
      const nuevo = MIGRACIONES[f]
      const cambiar = nuevo ? `→ ${nuevo}` : '(sin cambio)'
      console.log(`  ${f.padEnd(40)} → ${ids.length} productos ${cambiar}`)
    })
  
  console.log('\n' + '='.repeat(70) + '\n')
  
  // Ejecutar migraciones
  let totalActualizados = 0
  let errores = 0
  
  for (const [familiaVieja, familiaNueva] of Object.entries(MIGRACIONES)) {
    const ids = porFamilia[familiaVieja] || []
    if (ids.length === 0) continue
    
    console.log(`🔄 ${familiaVieja} → ${familiaNueva} (${ids.length} productos)`)
    
    for (const id of ids) {
      const updateResp = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ familia: familiaNueva })
        }
      )
      
      if (updateResp.ok) {
        totalActualizados++
      } else {
        errores++
        console.log(`   ✗ Error en producto ${id}`)
      }
    }
    
    console.log(`   ✓ ${ids.length} productos actualizados\n`)
  }
  
  console.log('='.repeat(70))
  console.log('✅ MIGRACIÓN COMPLETADA')
  console.log(`   Total actualizados: ${totalActualizados}`)
  console.log(`   Errores: ${errores}`)
  console.log('='.repeat(70))
  
  // Verificación final
  console.log('\n🔍 Verificando resultados...')
  const resp2 = await fetch(`${SUPABASE_URL}/rest/v1/products?select=familia`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }
  })
  
  const final = await resp2.json()
  const conteoFinal = {}
  final.forEach(p => {
    const f = p.familia || 'NULL'
    conteoFinal[f] = (conteoFinal[f] || 0) + 1
  })
  
  console.log('\n📊 NUEVA distribución de familias:')
  Object.entries(conteoFinal)
    .sort((a, b) => b[1] - a[1])
    .forEach(([f, c]) => {
      console.log(`  ${f.padEnd(40)} → ${c} productos`)
    })
}

migrarFamilias().catch(err => {
  console.error('❌ Error crítico:', err.message)
  console.error(err.stack)
  process.exit(1)
})
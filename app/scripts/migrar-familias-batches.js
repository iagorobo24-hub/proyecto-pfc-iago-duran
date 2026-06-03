#!/usr/bin/env node
/**
 * MIGRACIÓN DE FAMILIAS - CON BATCHES Y TIMEOUT
 * 
 * Actualiza TODOS los productos en Supabase (más de 1000)
 * usando requests separadas con delay para evitar rate limits.
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

// Mapeo completo de migraciones
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
  'COMUNICACIONES': 'Comunicación',
  'HERRAMIENTAS': 'Herramientas',
  'HERRAMIENTAS Y MANIPULACION': 'Herramientas',
  'PROTECCION': 'Protección',
  'PROTECCION ELECTRICA': 'Protección',
  'FONTANERIA': 'Fontanería',
  'FONTANERÍA': 'Fontanería',
  'ENERGIAS RENOVABLES': 'Energías renovables',
  'ENERGIAS RENOVABLES Y VEHICULO ELECTRICO': 'Energías renovables',
}

// Delay entre requests (ms)
const DELAY_MS = 100

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function migrarFamilias() {
  console.log('🔄 INICIANDO MIGRACIÓN DE FAMILIAS (con batches)\n')
  console.log(`🌐 Supabase URL: ${SUPABASE_URL.split('.')[0].replace('https://', '')}`)
  console.log(`⏱️  Delay entre requests: ${DELAY_MS}ms\n`)
  
  // Paso 1: Obtener primeros 1000 productos para contar y muestrear
  console.log('📥 Obteniendo muestra de productos...')
  const sampleResp = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=familia&id&limit=1000`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    }
  )
  
  if (!sampleResp.ok) {
    console.error(`❌ Error HTTP ${sampleResp.status}: ${sampleResp.statusText}`)
    console.error(await sampleResp.text())
    return
  }
  
  const sample = await sampleResp.json()
  console.log(`📦 Muestra: ${sample.length} productos obtenidos\n`)
  
  if (!Array.isArray(sample) || sample.length === 0) {
    console.log('❌ No hay productos en la base de datos')
    return
  }
  
  // Estimamos el total basándonos en si llegamos al límite
  const estimatedTotal = sample.length === 1000 ? '≥1000' : sample.length
  console.log(`📊 Total estimado: ${estimatedTotal} productos\n`)
  
  // Familias en la muestra
  const familiasMuestra = {}
  sample.forEach(p => {
    const fam = p.familia || 'NULL'
    familiasMuestra[fam] = (familiasMuestra[fam] || 0) + 1
  })
  
  console.log('📊 Familias en la muestra actual:')
  Object.entries(familiasMuestra)
    .sort((a, b) => b[1] - a[1])
    .forEach(([fam, count]) => {
      console.log(`  ${fam.padEnd(40)} → ${count}`)
    })
  console.log('')
  
  // Paso 2: Filtrar productos de la muestra que necesitan migración
  const productosAMigrar = sample.filter(p => 
    MIGRACIONES[p.familia] !== undefined && p.familia !== MIGRACIONES[p.familia]
  )
  
  console.log('📊 Productos por migrar (en la muestra):')
  const conteoPorFamilia = {}
  productosAMigrar.forEach(p => {
    const fam = p.familia || 'NULL'
    conteoPorFamilia[fam] = (conteoPorFamilia[fam] || 0) + 1
  })
  
  Object.entries(conteoPorFamilia)
    .sort((a, b) => b[1] - a[1])
    .forEach(([fam, count]) => {
      const nuevo = MIGRACIONES[fam]
      console.log(`  ${fam.padEnd(40)} → ${nuevo?.padEnd(35) || 'N/A'} (${count} productos)`)
    })
  
  console.log(`\n🔄 Total a actualizar: ${productosAMigrar.length} productos\n`)
  console.log('='.repeat(70) + '\n')
  
  if (productosAMigrar.length === 0) {
    console.log('✅ Todos los productos ya tienen el nombre correcto')
    return
  }
  
  // Paso 3: Actualizar en batches
  let actualizados = 0
  let errores = 0
  const updateBatchSize = 100  // Actualizar de 100 en 100 para no saturar
  
  console.log(`🔄 Actualizando en batches de ${updateBatchSize}...\n`)
  
  for (let i = 0; i < productosAMigrar.length; i += updateBatchSize) {
    const batch = productosAMigrar.slice(i, i + updateBatchSize)
    const batchNum = Math.ceil((i + 1) / updateBatchSize)
    const totalBatches = Math.ceil(productosAMigrar.length / updateBatchSize)
    
    let batchSuccess = 0
    let batchErrors = 0
    
    // Promises para este batch
    const promises = batch.map(async (p) => {
      const nuevoNombre = MIGRACIONES[p.familia]
      if (!nuevoNombre) return false
      
      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${p.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ familia: nuevoNombre })
        }
      )
      
      return resp.ok
    })
    
    const results = await Promise.allSettled(promises)
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value) {
        batchSuccess++
      } else {
        batchErrors++
      }
    })
    
    actualizados += batchSuccess
    errores += batchErrors
    
    console.log(
      `Batch ${batchNum.toString().padStart(2)}/${totalBatches}: ` +
      `✓ ${batchSuccess} actualizados, ` +
      `✗ ${batchErrors} errores`
    )
    
    // Delay entre batches
    if (i + updateBatchSize < productosAMigrar.length) {
      await sleep(DELAY_MS)
    }
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('✅ MIGRACIÓN COMPLETADA')
  console.log(`   Actualizados: ${actualizados}`)
  console.log(`   Errores: ${errores}`)
  console.log(`   Porcentaje: ${((actualizados / productosAMigrar.length) * 100).toFixed(1)}%`)
  console.log('='.repeat(70))
  
  // Paso 5: Verificación final
  console.log('\n🔍 Verificando resultados...')
  const verificaResp = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=familia&range=0-999`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    }
  )
  
  const primeros1000 = await verificaResp.json()
  const conteoFinal = {}
  primeros1000.forEach(p => {
    const f = p.familia || 'NULL'
    conteoFinal[f] = (conteoFinal[f] || 0) + 1
  })
  
  console.log('\n📊 Distribución FINAL (primeros 1000 productos):')
  Object.entries(conteoFinal)
    .sort((a, b) => b[1] - a[1])
    .forEach(([f, c]) => {
      const esCanónico = Object.values(MIGRACIONES).includes(f)
      const icon = esCanónico ? '✅' : '⚠️'
      console.log(`  ${icon} ${f.padEnd(35)} → ${c}`)
    })
}

migrarFamilias().catch(err => {
  console.error('❌ Error crítico:', err.message)
  console.error(err.stack)
  process.exit(1)
})
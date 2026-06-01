#!/usr/bin/env node
/**
 * Auditar familias desde backup local
 */

import { readFileSync } from 'fs'

const backupPath = 'scripts/backups/products-backup-2026-06-01T00-43-26.json'
const content = readFileSync(backupPath, 'utf-8')
const productos = JSON.parse(content)

console.log(`📦 Total productos en backup: ${productos.length}\n`)

const conteo = {}
productos.forEach(p => {
  const familia = (p.familia || 'SIN_FAMILIA').trim()
  conteo[familia] = (conteo[familia] || 0) + 1
})

console.log('📊 Todas las familias:\n')
Object.entries(conteo)
  .sort((a, b) => b[1] - a[1])
  .forEach(([familia, count]) => {
    const domotica = familia.includes('DOMOTICA') || familia.includes('AUTOMATIZACION')
    const icon = domotica ? '🏘️' : '📦'
    console.log(`${icon} ${familia.padEnd(45)} → ${count}`)
  })

const domoticaCount = conteo['AUTOMATIZACION DE EDIFICIOS'] || conteo['DOMOTICA'] || conteo['DOMOTICA Y CONTROL'] || 0
console.log(`\n${'='.repeat(60)}`)
console.log(`🏘️ AUTOMATIZACION DE EDIFICIOS: ${domoticaCount} productos`)
console.log(`${'='.repeat(60)}`)

if (domoticaCount > 0) {
  console.log('\n✅ HAY PRODUCTOS - El problema NO es la DB\n')
  console.log('🔧 POSIBLE CAUSA: El nombre en el sidebar no coincide con "AUTOMATIZACION DE EDIFICIOS"')
  console.log('   Revisa que en la UI aparezca tal cual "Automatización de Edificios"')
  
  // Mostrar primeros 5 productos
  const domeProds = productos.filter(p => 
    p.familia === 'AUTOMATIZACION DE EDIFICIOS' || 
    p.familia === 'DOMOTICA' || 
    p.familia === 'DOMOTICA Y CONTROL'
  ).slice(0, 5)
  
  console.log('\n📋 Primeros productos de automatización de edificios:\n')
  domeProds.forEach((p, i) => {
    console.log(`${i+1}. ${p.nombre} (Ref: ${p.ref_fabricante}, Familia: ${p.familia})`)
  })
}
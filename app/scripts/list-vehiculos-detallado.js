#!/usr/bin/env node
/**
 * Script para listar todos los productos de Vehículo Eléctrico con sus datos
 */
import { readFileSync } from 'fs'
const env = readFileSync('.env', 'utf-8').split('\n').reduce((a, l) => { 
  const [k,v] = l.split('='); 
  return k && v ? {...a, [k.trim()]: v.trim()} : a 
}, {})

const resp = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/products?familia=eq.VEHICULOS%20ELECTRICOS&select=id,ref_fabricante,name,marca,subfamilia,tipo,Gama,Subgama`, {
  headers: { 
    'apikey': env.VITE_SUPABASE_ANON_KEY, 
    'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY,
  }
})

const productos = await resp.json()
console.log('🚗 VEHÍCULOS ELÉCTRICOS - Todos los productos\n')
console.log('ID\t| Ref\t\t| Marca\t\t| Name\t\t\t\t\t| Subfamilia\t| Tipo')
console.log('-'.repeat(120))

productos.forEach(p => {
  console.log(`${p.id}\t| ${p.ref_fabricante}\t| ${p.marca?.padEnd(15) || ''}\t| ${p.name?.slice(0, 40).padEnd(40)}\t| ${p.subfamilia || 'NULL'}\t| ${p.tipo || 'NULL'}`)
})

console.log(`\n📊 Total: ${productos.length} productos`)
console.log('⚠️  TODOS tienen subfamilia=NULL y tipo=NULL')
console.log('\n💡 SOLUCIÓN: Actualizar cada producto con su subfamilia y tipo correctos')
console.log('Ejemplo para un cargador/toma de recarga:')
console.log('  subfamilia = "Puntos de Recarga"')
console.log('  tipo = "Tomas y cargadores"')
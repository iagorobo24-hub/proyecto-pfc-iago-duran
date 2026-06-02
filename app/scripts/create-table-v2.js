/**
 * Crea la tabla products_v2 en Supabase
 * Uso: node create-table-v2.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2MDY5NSwiZXhwIjoyMDg4OTM2Njk1fQ.3DfYKquAUFFNx_c8NdMWmic7pVVckWsXEZWOJTuC5wg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('📋 Creando tabla products_v2...');

  // Crear tabla
  const { error: createError } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS products_v2 (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        ref_fabricante TEXT,
        name TEXT NOT NULL,
        brand_name TEXT,
        categoria TEXT NOT NULL,
        subcategoria TEXT,
        gama TEXT,
        descripcion TEXT,
        caracteristicas JSONB,
        aplicaciones JSONB,
        normas JSONB,
        image_url TEXT,
        manual_url TEXT,
        fabricante_url TEXT,
        verified BOOLEAN DEFAULT FALSE,
        source TEXT,
        original_id BIGINT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (createError) {
    // Fallback: intentar con raw SQL via REST
    console.log('⚠️ RPC no disponible, probando con REST...');
    
    // Insertar un producto dummy para crear la tabla implícitamente no funciona
    // Necesitamos usar el SQL editor de Supabase Dashboard
    console.log('❌ No se puede ejecutar SQL directo via API.');
    console.log('');
    console.log('📌 INSTRUCCIONES:');
    console.log('1. Ve a https://supabase.com/dashboard/project/fncmzrnmzmuhlullkrud/sql');
    console.log('2. Copia el contenido de app/scripts/create-products-v2.sql');
    console.log('3. Ejecuta el SQL');
    console.log('4. Luego ejecuta: node scripts/reclasificar.js AUTOMATISMOS 50');
    return;
  }

  console.log('✅ Tabla products_v2 creada');

  // Crear índices
  console.log('📊 Creando índices...');
  
  const indices = [
    'CREATE INDEX IF NOT EXISTS idx_products_v2_categoria ON products_v2(categoria)',
    'CREATE INDEX IF NOT EXISTS idx_products_v2_ref ON products_v2(ref_fabricante)',
    'CREATE INDEX IF NOT EXISTS idx_products_v2_brand ON products_v2(brand_name)',
  ];

  for (const idx of indices) {
    await supabase.rpc('exec_sql', { sql_query: idx });
  }

  console.log('✅ Índices creados');
  console.log('🎉 Tabla lista para reclasificación');
}

main();

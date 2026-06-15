#!/usr/bin/env node
/**
 * Duplicates Resolver for Eaton — cleanup_eaton_duplicates.mjs
 * Resolves the 80 duplicate references under Eaton by keeping the highest quality record
 * and deleting the other from Supabase.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read environment variables
let SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
let SUPABASE_KEY = process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  try {
    const envPath = path.join(__dirname, '../..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      SUPABASE_URL = envContent.match(/SUPABASE_URL=(.+)/)?.[1]?.trim() ||
                     envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1]?.trim() || '';
      SUPABASE_KEY = envContent.match(/SONEX_SUPABASE_KEY=(.+)/)?.[1]?.trim() ||
                     envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim() || '';
    }
  } catch (err) {
    // ignore
  }
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase credentials not found.');
  process.exit(1);
}

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

// Cargar el reporte de integridad generado
const reportPath = path.join(__dirname, 'db_integrity_report.json');
if (!fs.existsSync(reportPath)) {
  console.error(`❌ Error: El archivo de reporte ${reportPath} no existe. Ejecuta check_duplicates.mjs primero.`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const duplicates = report.duplicates.details.filter(d => d.items[0].marca === 'Eaton');

function calculateScore(item) {
  let score = 0;
  const name = item.name || '';
  
  // 1. Preferir nombres descriptivos con minúsculas (Title Case / Sentence Case) en lugar de MAYÚSCULAS
  const hasLowercase = /[a-z]/.test(name);
  if (hasLowercase) {
    score += 30;
  }
  
  // 2. Preferir nombres más detallados/largos
  score += name.length * 0.5;

  // 3. Preferir que tenga imagen o pdf
  if (item.imagen && item.imagen.trim() !== '') score += 50;
  if (item.pdf_url && item.pdf_url.trim() !== '') score += 50;
  
  // 4. Si el nombre tiene abreviaturas toscas en mayúsculas, restar puntos
  if (name.includes('CONTACTOR DE POTENCIA;') || name.includes('INTERRUPTOR MAGNETOTÉRMICO')) {
    score -= 10;
  }

  return score;
}

async function main() {
  console.log(`🧹 Iniciando limpieza de ${duplicates.length} duplicados de Eaton en la base de datos...\n`);
  
  const idsToDelete = [];
  const keptSummary = [];

  duplicates.forEach(d => {
    // Calcular score para cada ocurrencia
    const itemsWithScore = d.items.map(item => ({
      ...item,
      score: calculateScore(item)
    }));

    // Ordenar descendente por score
    itemsWithScore.sort((a, b) => b.score - a.score);

    const best = itemsWithScore[0];
    const losers = itemsWithScore.slice(1);

    losers.forEach(loser => {
      idsToDelete.push(loser.id);
      keptSummary.push({
        ref: d.ref,
        keptName: best.name,
        keptId: best.id,
        deletedName: loser.name,
        deletedId: loser.id
      });
    });
  });

  console.log(`Identificados ${idsToDelete.length} registros duplicados de menor calidad para eliminar.`);

  if (idsToDelete.length === 0) {
    console.log('✅ No hay duplicados que eliminar.');
    return;
  }

  // Confirmar eliminación en Supabase
  let successCount = 0;
  for (const id of idsToDelete) {
    const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`;
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: HEADERS
      });
      if (res.ok) {
        successCount++;
      } else {
        console.error(`❌ Error eliminando ID ${id}: ${res.status} - ${await res.text()}`);
      }
    } catch (err) {
      console.error(`❌ Error de red eliminando ID ${id}:`, err.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(`✅ LIMPIEZA FINALIZADA: ${successCount}/${idsToDelete.length} registros eliminados.`);
  console.log(`======================================================\n`);

  console.log(`Muestra de resoluciones de duplicados:`);
  keptSummary.slice(0, 10).forEach((s, idx) => {
    console.log(`  [${idx+1}] Ref: "${s.ref}":`);
    console.log(`    Keep   -> ID: ${s.keptId} | "${s.keptName}"`);
    console.log(`    Delete -> ID: ${s.deletedId} | "${s.deletedName}"`);
  });
}

main().catch(err => console.error(err));

#!/usr/bin/env node
/**
 * Ejecutar todos los scripts de limpieza y normalización en orden
 * Ejecutar: node scripts/run-all.mjs [--dry-run]
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');
const FLAG = DRY_RUN ? ' --dry-run' : '';

const scripts = [
  { name: '00-backup-db', desc: 'Backup de la base de datos', critical: true },
  { name: '02-verify-taxonomy', desc: 'Verificación inicial', critical: false },
  { name: '01-clean-placeholders', desc: 'Eliminar productos placeholder', critical: true },
  { name: '03-fix-contactores', desc: 'Corregir "Contactores" → "Contactor"', critical: true },
  { name: '04-fix-siemens-families', desc: 'Corregir familias Siemens', critical: true },
  { name: '05-normalize-automatizacion', desc: 'Normalizar subfamilias AUTOMATIZACION', critical: true },
  { name: '06-normalize-instalacion', desc: 'Normalizar subfamilias INSTALACION', critical: true },
  { name: '07-normalize-ve-fv', desc: 'Normalizar VE y FOTOVOLTAICA', critical: true },
  { name: '08-normalize-tipos', desc: 'Normalizar tipos de DP', critical: true },
  { name: '02-verify-taxonomy', desc: 'Verificación final', critical: false },
];

async function main() {
  console.log('🚀 EJECUTANDO TODOS LOS SCRIPTS DE LIMPIEZA Y NORMALIZACIÓN\n');
  console.log(`   Modo: ${DRY_RUN ? '🔍 DRY RUN (sin cambios)' : '⚡ EJECUCIÓN REAL'}`);
  console.log(`   Scripts: ${scripts.length}\n`);
  console.log('='.repeat(60));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    const scriptPath = join(__dirname, `${script.name}.mjs`);

    console.log(`\n[${i + 1}/${scripts.length}] ${script.desc}`);
    console.log(`   Script: ${script.name}.mjs`);
    console.log('-'.repeat(60));

    try {
      const output = execSync(`node "${scriptPath}"${FLAG}`, {
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 120000 // 2 minutos máximo por script
      });
      console.log(output);
      successCount++;
    } catch (err) {
      console.error('❌ Error ejecutando script:');
      if (err.stdout) console.log(err.stdout.toString());
      if (err.stderr) console.error(err.stderr.toString());
      errorCount++;

      if (script.critical) {
        console.error(`\n⚠️  Script crítico falló. ¿Continuar? (Se saltará el resto)`);
        // En modo no interactivo, continuar
        console.error('   Continuando con el siguiente script...');
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMEN FINAL:');
  console.log(`   ✅ Scripts exitosos: ${successCount}`);
  console.log(`   ❌ Scripts con error: ${errorCount}`);
  console.log(`   📁 Total: ${scripts.length}`);

  if (errorCount > 0) {
    console.log('\n⚠️  Algunos scripts fallaron. Revisar los errores arriba.');
    process.exit(1);
  } else {
    console.log('\n✅ Todos los scripts ejecutados correctamente');
  }
}

main().catch(err => {
  console.error('❌ Error general:', err.message);
  process.exit(1);
});

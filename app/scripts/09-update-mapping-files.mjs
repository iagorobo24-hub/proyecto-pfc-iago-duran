#!/usr/bin/env node
/**
 * FASE 4: Actualizar archivos de mapeo (categoriaMapping.js, etiquetasSubcategoria.js, categoryMapping.js)
 * Ejecutar: node scripts/09-update-mapping-files.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes('--dry-run');

const APP_DIR = join(__dirname, '..');
const CATEGORIA_MAPPING_PATH = join(APP_DIR, 'src', 'data', 'categoriaMapping.js');
const ETIQUETAS_PATH = join(APP_DIR, 'src', 'data', 'etiquetasSubcategoria.js');
const CATEGORY_MAPPING_PATH = join(APP_DIR, 'src', 'data', 'categoryMapping.js');

function readJsFile(path) {
  return readFileSync(path, 'utf-8');
}

function main() {
  console.log(`🔧 FASE 4: Actualizar archivos de mapeo${DRY_RUN ? ' (DRY RUN)' : ''}\n`);

  // 1. Actualizar categoriaMapping.js
  console.log('📦 Actualizando categoriaMapping.js...');
  let catMapping = readJsFile(CATEGORIA_MAPPING_PATH);

  // Verificar si ya existen los nuevos mapeos
  const newMappings = [
    { subfamilia: 'Relé de Seguridad', categoria: 'Accesorios', subcategoria: 'Relés y seguridad' },
    { subfamilia: 'Bornas', categoria: 'Accesorios', subcategoria: 'Bornas y terminales' },
    { subfamilia: 'Arrancador Suave', categoria: 'Control Motor', subcategoria: 'Arrancadores suaves' },
  ];

  let catModified = false;
  for (const mapping of newMappings) {
    if (!catMapping.includes(`'${mapping.subfamilia}'`)) {
      console.log(`   + Añadiendo mapeo para "${mapping.subfamilia}"`);
      // Buscar el último mapeo de la categoría y añadir antes del cierre
      const searchPattern = `'${mapping.categoria}':`;
      const catIndex = catMapping.indexOf(searchPattern);
      if (catIndex !== -1) {
        // Encontrar el cierre del objeto de esa categoría
        let braceCount = 0;
        let insertPos = -1;
        for (let i = catIndex; i < catMapping.length; i++) {
          if (catMapping[i] === '{') braceCount++;
          if (catMapping[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              insertPos = i;
              break;
            }
          }
        }
        if (insertPos !== -1) {
          const insertText = `    '${mapping.subfamilia}': '${mapping.subcategoria}',\n`;
          catMapping = catMapping.slice(0, insertPos) + insertText + catMapping.slice(insertPos);
          catModified = true;
        }
      }
    } else {
      console.log(`   ✓ Mapeo para "${mapping.subfamilia}" ya existe`);
    }
  }

  if (catModified && !DRY_RUN) {
    writeFileSync(CATEGORIA_MAPPING_PATH, catMapping);
    console.log('   ✅ categoriaMapping.js actualizado');
  } else if (catModified) {
    console.log('   🔍 DRY RUN: Se actualizaría categoriaMapping.js');
  }

  // 2. Actualizar etiquetasSubcategoria.js
  console.log('\n📦 Actualizando etiquetasSubcategoria.js...');
  let etiquetas = readJsFile(ETIQUETAS_PATH);

  const newEtiquetas = [
    { key: 'Relés y seguridad', label: 'Relés y seguridad' },
    { key: 'Bornas y terminales', label: 'Bornas y terminales' },
    { key: 'Arrancadores suaves', label: 'Arrancadores suaves' },
    { key: 'Contactor Industrial', label: 'Contactor Industrial' },
    { key: 'Interruptor Motor', label: 'Interruptor Motor' },
    { key: 'Relé Térmico', label: 'Relé Térmico' },
    { key: 'Arrancador Suave', label: 'Arrancador Suave' },
    { key: 'Sistema de Control', label: 'Sistema de Control' },
    { key: 'Actuador de Válvula', label: 'Actuador de Válvula' },
    { key: 'Borniera', label: 'Borniera' },
    { key: 'Canal de Instalación', label: 'Canal de Instalación' },
    { key: 'Mini Canal', label: 'Mini Canal' },
    { key: 'Bandeja Portacables', label: 'Bandeja Portacables' },
    { key: 'Canalización', label: 'Canalización' },
    { key: 'Módulo de E/S', label: 'Módulo de E/S' },
    { key: 'Módulo de Comunicación', label: 'Módulo de Comunicación' },
    { key: 'Contador Eléctrico', label: 'Contador Eléctrico' },
  ];

  let etiquetasModified = false;
  for (const { key, label } of newEtiquetas) {
    if (!etiquetas.includes(`'${key}'`)) {
      console.log(`   + Añadiendo etiqueta para "${key}"`);
      // Buscar el último entry antes del cierre del objeto
      const lastEntry = etiquetas.lastIndexOf(',');
      if (lastEntry !== -1) {
        const insertText = `\n  '${key}': '${label}',`;
        etiquetas = etiquetas.slice(0, lastEntry + 1) + insertText + etiquetas.slice(lastEntry + 1);
        etiquetasModified = true;
      }
    } else {
      console.log(`   ✓ Etiqueta para "${key}" ya existe`);
    }
  }

  if (etiquetasModified && !DRY_RUN) {
    writeFileSync(ETIQUETAS_PATH, etiquetas);
    console.log('   ✅ etiquetasSubcategoria.js actualizado');
  } else if (etiquetasModified) {
    console.log('   🔍 DRY RUN: Se actualizaría etiquetasSubcategoria.js');
  }

  // 3. Verificar categoryMapping.js
  console.log('\n📦 Verificando categoryMapping.js...');
  const catInfo = readJsFile(CATEGORY_MAPPING_PATH);
  const families = ['INSTALACION', 'VEHICULOS_ELECTRICOS', 'FOTOVOLTAICA'];
  for (const fam of families) {
    if (catInfo.includes(`'${fam}'`)) {
      console.log(`   ✓ ${fam} ya tiene entrada en FULL_CATEGORY_INFO`);
    } else {
      console.log(`   ⚠️  ${fam} NO tiene entrada en FULL_CATEGORY_INFO (añadir manualmente)`);
    }
  }

  console.log('\n✅ FASE 4 completada');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

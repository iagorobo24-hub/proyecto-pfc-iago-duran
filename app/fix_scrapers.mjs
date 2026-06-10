import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPTS_DIR = path.join(__dirname, 'scripts');

const SCRAPERS = [
  'scrape-finder-official.mjs',
  'scrape-eaton-official.mjs',
  'scrape-circutor-official.mjs',
  'scrape-phoenix-official.mjs'
];

const REPLACEMENTS = [
  { from: /['"]AUTOMATIZACION['"]/g, to: "'Automatización'" },
  { from: /['"]AUTOMATIZACION DE EDIFICIOS['"]/g, to: "'Automatización de edificios'" },
  { from: /['"]CLIMATIZACION['"]/g, to: "'Climatización'" },
  { from: /['"]DISTRIBUCION DE POTENCIA['"]/g, to: "'Distribución de potencia'" },
  { from: /['"]VEHICULOS_ELECTRICOS['"]/g, to: "'Vehículos eléctricos'" },
  { from: /['"]INSTALACION['"]/g, to: "'Instalación'" },
  { from: /['"]PROTECCION['"]/g, to: "'Protección'" },
  { from: /['"]COMUNICACION['"]/g, to: "'Comunicación'" }
];

function run() {
  console.log('=== NORMALIZING SCRAPERS TAXONOMY ===');
  
  SCRAPERS.forEach(filename => {
    const filePath = path.join(SCRIPTS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    REPLACEMENTS.forEach(rep => {
      content = content.replace(rep.from, rep.to);
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Normalized families in: ${filename}`);
    } else {
      console.log(`ℹ️ No changes needed for: ${filename}`);
    }
  });
}

run();

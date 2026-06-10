import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { updateProduct } from './lib/supabase-sonex.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../..', '.env');

// Load env variables
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SONEX_SUPABASE_KEY;

const HEADERS = {
  'apikey': supabaseServiceKey,
  'Authorization': `Bearer ${supabaseServiceKey}`,
  'Content-Type': 'application/json'
};

// Function to classify a product based on its columns
function getProposedClassification(p) {
  const ref = p.ref_fabricante || '';
  const name = (p.name || '').toLowerCase();
  const gama = p.Gama || '';
  
  let proposed = {
    familia: p.familia,
    subfamilia: p.subfamilia,
    Gama: p.Gama,
    Subgama: p.Subgama,
    tipo: p.tipo
  };
  
  // Rule mapping based on Gama
  if (gama === 'TeSys D/Deca') {
    proposed.familia = 'Automatización';
    proposed.tipo = 'CARRIL DIN';
    
    if (ref.startsWith('LC1D') || ref.startsWith('LC2D')) {
      proposed.subfamilia = 'Contactor';
      proposed.Subgama = ref.startsWith('LC1D') ? 'Contactor TeSys Deca' : 'Contactor Inversor TeSys Deca';
    } else if (ref.startsWith('CAD')) {
      proposed.subfamilia = 'Elemento de Control';
      proposed.Subgama = 'Relé Auxiliar TeSys Deca';
    } else if (ref.startsWith('LRD') || ref.startsWith('LR2D') || ref.startsWith('LR3D') || ref.startsWith('LR9D')) {
      proposed.subfamilia = 'Relé Térmico';
      proposed.Subgama = 'Relé Térmico TeSys Deca';
    } else if (ref.startsWith('LAD') || ref.startsWith('LA9D') || ref.startsWith('LA9G')) {
      proposed.subfamilia = 'Accesorio';
      proposed.Subgama = 'Accesorios TeSys Deca';
      proposed.tipo = 'Accesorio';
    } else {
      proposed.Subgama = 'TeSys Deca';
    }
  } 
  else if (gama === 'Canalis KR') {
    proposed.familia = 'Instalación';
    proposed.subfamilia = 'Canalización prefabricada';
    proposed.tipo = 'Canalización';
    
    if (ref.startsWith('KRA')) {
      proposed.Subgama = 'Canalización Aluminio (KR)';
    } else if (ref.startsWith('KRC')) {
      proposed.Subgama = 'Canalización Cobre (KR)';
    } else {
      proposed.Subgama = 'Canalización KR';
    }
  }
  else if (gama === 'Canalis KS') {
    proposed.familia = 'Instalación';
    proposed.subfamilia = 'Canalización prefabricada';
    proposed.tipo = 'Canalización';
    
    if (ref.startsWith('KSA')) {
      proposed.Subgama = 'Canalización Aluminio (KS)';
    } else if (ref.startsWith('KSC')) {
      proposed.Subgama = 'Canalización Cobre (KS)';
    } else {
      proposed.Subgama = 'Canalización KS';
    }
  }
  else if (gama === 'Canalis KBB') {
    proposed.familia = 'Instalación';
    proposed.subfamilia = 'Canalización prefabricada';
    proposed.tipo = 'Canalización';
    proposed.Subgama = 'Canalización KBB';
  }
  else if (gama === 'Harmony XB4') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'Pulsador';
    proposed.tipo = 'Montaje 22mm';
    
    if (ref.startsWith('ZB4')) {
      proposed.subfamilia = 'Accesorio';
      proposed.Subgama = 'Cabezales y Bloques XB4';
      proposed.tipo = 'Accesorio';
    } else if (name.includes('luminoso') || name.includes('led') || name.includes('ilum')) {
      proposed.Subgama = 'Pulsador Luminoso Metálico';
    } else if (name.includes('selector') || name.includes('llave')) {
      proposed.Subgama = 'Selector Metálico';
    } else if (name.includes('piloto') || name.includes('luz') || name.includes('indicador')) {
      proposed.Subgama = 'Piloto luminoso Metálico';
      proposed.subfamilia = 'Accesorio';
      proposed.tipo = 'Piloto luminoso';
    } else {
      proposed.Subgama = 'Pulsador Metálico';
    }
  }
  else if (gama === 'Harmony XB5') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'Pulsador';
    proposed.tipo = 'Montaje 22mm';
    
    if (ref.startsWith('ZB5') || ref.startsWith('ZB6')) {
      proposed.subfamilia = 'Accesorio';
      proposed.Subgama = 'Cabezales y Bloques XB5';
      proposed.tipo = 'Accesorio';
    } else if (name.includes('luminoso') || name.includes('led') || name.includes('ilum')) {
      proposed.Subgama = 'Pulsador Luminoso Plástico';
    } else if (name.includes('selector') || name.includes('llave')) {
      proposed.Subgama = 'Selector Plástico';
    } else if (name.includes('piloto') || name.includes('luz') || name.includes('indicador')) {
      proposed.Subgama = 'Piloto luminoso Plástico';
      proposed.subfamilia = 'Accesorio';
      proposed.tipo = 'Piloto luminoso';
    } else {
      proposed.Subgama = 'Pulsador Plástico';
    }
  }
  else if (gama === 'Harmony Relay') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'Elemento de Control';
    proposed.tipo = 'CARRIL DIN';
    
    if (ref.startsWith('RXM')) {
      proposed.Subgama = 'Relé Miniatura (RXM)';
      proposed.tipo = 'Relé Enchufable';
    } else if (ref.startsWith('RUM')) {
      proposed.Subgama = 'Relé Universal (RUM)';
      proposed.tipo = 'Relé Enchufable';
    } else if (ref.startsWith('RSB')) {
      proposed.Subgama = 'Relé de Interfaz (RSB)';
      proposed.tipo = 'Relé Enchufable';
    } else if (ref.startsWith('RPM')) {
      proposed.Subgama = 'Relé de Potencia (RPM)';
      proposed.tipo = 'Relé Enchufable';
    } else if (ref.startsWith('RXG')) {
      proposed.Subgama = 'Relé de Interfaz Slim (RXG)';
      proposed.tipo = 'Relé Enchufable';
    } else if (ref.startsWith('RXZ') || ref.startsWith('RUZ') || ref.startsWith('RSZ') || ref.startsWith('RUW') || ref.startsWith('RGX')) {
      proposed.subfamilia = 'Accesorio';
      proposed.Subgama = 'Zócalos y Accesorios';
      proposed.tipo = 'CARRIL DIN';
    } else {
      proposed.Subgama = 'Relé Harmony';
    }
  }
  else if (gama === 'Relevadores Temporizadores') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'Elemento de Control';
    proposed.tipo = 'CARRIL DIN';
    proposed.Subgama = 'Relé Temporizador Modular';
  }
  else if (gama === 'Zelio Logic') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'PLC';
    proposed.tipo = 'CARRIL DIN';
    
    if (ref.startsWith('SR2')) {
      proposed.Subgama = 'Relé Inteligente Compacto (SR2)';
    } else if (ref.startsWith('SR3')) {
      proposed.Subgama = 'Relé Inteligente Modular (SR3)';
    } else {
      proposed.Subgama = 'Relé Inteligente Zelio';
    }
  }
  else if (gama === 'Modicon M221') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'PLC';
    proposed.tipo = 'CARRIL DIN';
    proposed.Subgama = 'PLC Modicon M221';
  }
  else if (gama === 'Modicon M241') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'PLC';
    proposed.tipo = 'CARRIL DIN';
    proposed.Subgama = 'PLC Modicon M241';
  }
  else if (gama === 'Altivar 12') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'Variador velocidad';
    proposed.tipo = 'Variador';
    proposed.Subgama = 'Variador Altivar 12';
  }
  else if (gama === 'Altivar ATV600') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'Variador velocidad';
    proposed.tipo = 'Variador';
    
    if (ref.startsWith('ATV630')) {
      proposed.Subgama = 'Variador Altivar ATV630';
    } else if (ref.startsWith('ATV650')) {
      proposed.Subgama = 'Variador Altivar ATV650';
    } else {
      proposed.Subgama = 'Variador Altivar ATV600';
    }
  }
  else if (gama === 'PowerLogic iEM3000') {
    proposed.familia = 'Distribución de potencia';
    proposed.subfamilia = 'Contador energía';
    proposed.tipo = 'CARRIL DIN';
    proposed.Subgama = 'Contador de Energía iEM3000';
  }
  else if (gama === 'PowerLogic PM5000') {
    proposed.familia = 'Distribución de potencia';
    proposed.subfamilia = 'Analizador redes';
    proposed.tipo = 'CARRIL DIN';
    proposed.Subgama = 'Analizador de Redes PM5000';
  }
  else if (gama === 'PowerTag') {
    proposed.familia = 'Distribución de potencia';
    proposed.subfamilia = 'Sensor energía';
    proposed.tipo = 'CARRIL DIN';
    proposed.Subgama = 'Sensor de Energía PowerTag';
  }
  else if (gama === 'PowerLogic ION7400') {
    proposed.familia = 'Distribución de potencia';
    proposed.subfamilia = 'Analizador redes';
    proposed.tipo = 'CARRIL DIN';
    proposed.Subgama = 'Analizador de Redes ION7400';
  }
  else if (gama === 'PowerLogic T300') {
    proposed.familia = 'Distribución de potencia';
    proposed.subfamilia = 'Gateway comunicación';
    proposed.tipo = 'CARRIL DIN';
    proposed.Subgama = 'RTU de Distribución T300';
  }
  else if (gama === 'EVlink Pro DC') {
    proposed.familia = 'Vehículos eléctricos';
    proposed.subfamilia = 'Carga rápida VE';
    proposed.tipo = 'Cargador VE';
    proposed.Subgama = 'Cargador Rápido EVlink Pro DC';
  }
  else if (gama === 'EVlink Field Services') {
    proposed.familia = 'Vehículos eléctricos';
    proposed.subfamilia = 'Carga VE';
    proposed.tipo = 'Accesorio VE';
    proposed.Subgama = 'Servicios de Campo EVlink';
  }
  else if (gama === 'TeSys F') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'Contactor';
    proposed.tipo = 'Montaje en Placa';
    proposed.Subgama = 'Contactor TeSys F';
  }
  else if (gama === 'TeSys island') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'Arrancador';
    proposed.tipo = 'CARRIL DIN';
    proposed.Subgama = 'Arrancador Conectado TeSys island';
  }
  else if (gama === 'Phaseo') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'Fuente alimentación';
    proposed.tipo = 'CARRIL DIN';
    proposed.Subgama = 'Fuente de Alimentación Phaseo';
  }
  else if (gama === 'TeSys GV') {
    proposed.familia = 'Automatización';
    proposed.subfamilia = 'Guardamotor';
    proposed.tipo = 'CARRIL DIN';
    
    if (ref.startsWith('GV2ME')) {
      proposed.Subgama = 'Guardamotor Termomagnético (GV2ME)';
    } else if (ref.startsWith('GV2P')) {
      proposed.Subgama = 'Guardamotor Termomagnético (GV2P)';
    } else if (ref.startsWith('GV2L')) {
      proposed.Subgama = 'Guardamotor Magnético (GV2L)';
    } else if (ref.startsWith('GV3P')) {
      proposed.Subgama = 'Guardamotor Termomagnético (GV3P)';
    } else if (ref.startsWith('GV3L')) {
      proposed.Subgama = 'Guardamotor Magnético (GV3L)';
    } else if (ref.startsWith('GV4P')) {
      proposed.Subgama = 'Guardamotor Termomagnético (GV4P)';
    } else if (ref.startsWith('GV4L')) {
      proposed.Subgama = 'Guardamotor Magnético (GV4L)';
    } else {
      proposed.Subgama = 'Accesorios TeSys GV';
      proposed.subfamilia = 'Accesorio';
      proposed.tipo = 'Accesorio';
    }
  }
  
  return proposed;
}

async function run() {
  const isDryRun = process.argv.includes('--dry-run');
  
  console.log(`==================================================`);
  console.log(`   NORMALIZADOR DE SUBGAMAS/TAXONOMÍA SCHNEIDER`);
  console.log(`   Modo: ${isDryRun ? 'DRY-RUN (Simulación)' : 'PRODUCCIÓN (Escritura DB)'}`);
  console.log(`==================================================\n`);
  
  console.log("Consultando base de datos...");
  let allProducts = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const url = `${supabaseUrl}/rest/v1/products?select=id,ref_fabricante,name,familia,subfamilia,tipo,Gama,Subgama&marca=eq.${encodeURIComponent('Schneider Electric')}&limit=${pageSize}&offset=${from}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      console.error(await res.text());
      return;
    }
    const data = await res.json();
    allProducts = allProducts.concat(data);
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }
  
  console.log(`Cargados ${allProducts.length} productos de Schneider Electric.\n`);
  
  let changeCount = 0;
  let updateCount = 0;
  
  for (const p of allProducts) {
    const prop = getProposedClassification(p);
    
    // Check if there are changes
    const changes = {};
    if (prop.familia !== p.familia) changes.familia = prop.familia;
    if (prop.subfamilia !== p.subfamilia) changes.subfamilia = prop.subfamilia;
    if (prop.Gama !== p.Gama) changes.Gama = prop.Gama;
    if (prop.Subgama !== p.Subgama) changes.Subgama = prop.Subgama;
    if (prop.tipo !== p.tipo) changes.tipo = prop.tipo;
    
    if (Object.keys(changes).length > 0) {
      changeCount++;
      console.log(`[Ref: ${p.ref_fabricante}] [Gama actual: ${p.Gama}]`);
      Object.entries(changes).forEach(([k, v]) => {
        console.log(`  - ${k}: "${p[k]}" -> "${v}"`);
      });
      
      if (!isDryRun) {
        try {
          await updateProduct(p.id, changes);
          updateCount++;
          if (updateCount % 50 === 0) {
            console.log(`  ... Actualizados ${updateCount} productos ...`);
          }
        } catch (err) {
          console.error(`  ❌ Error actualizando producto ID ${p.id}:`, err.message);
        }
      }
    }
  }
  
  console.log(`\n============================`);
  console.log(`Resumen de normalización:`);
  console.log(`  - Productos con cambios detectados: ${changeCount}`);
  if (!isDryRun) {
    console.log(`  - Productos actualizados en DB: ${updateCount}`);
  }
  console.log(`============================`);
}

run();

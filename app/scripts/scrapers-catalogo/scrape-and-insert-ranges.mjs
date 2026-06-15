/**
 * SCRAPE AND INSERT NEW GAMAS SCHNEIDER ELECTRIC
 * 
 * Este script se encarga de importar productos para las 11 gamas faltantes de Schneider Electric.
 * 
 * Catálogo ampliado a 113 productos de automatización, sensórica y distribución.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { insertProduct, checkRefExists } from '../lib/supabase-sonex.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const GAMA_FILTER = args.find(a => a.startsWith('--gama='))?.split('=')[1];

const MARCA = 'Schneider Electric';
const BRAND_ID = 456;

// Catálogo de Gamas y Referencias objetivo con sus metadatos de taxonomía y datos fallback
const PRODUCT_CATALOG = [
  // ======== 1. Harmony ST6 HMI ========
  {
    ref: 'HMIST6200',
    gamaName: 'harmony-st6',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony ST6',
    tipo: 'PANTALLA',
    fallbackName: 'HMIST6200 - Pantalla táctil de 4"W, COM, Ethernet, USB, 24VCC, Harmony ST6',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIST6200'
  },
  {
    ref: 'HMIST6400',
    gamaName: 'harmony-st6',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony ST6',
    tipo: 'PANTALLA',
    fallbackName: 'HMIST6400 - Pantalla táctil de 7"W, COM, Ethernet, USB, 24VCC, Harmony ST6',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIST6400'
  },
  {
    ref: 'HMIST6500',
    gamaName: 'harmony-st6',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony ST6',
    tipo: 'PANTALLA',
    fallbackName: 'HMIST6500 - Pantalla táctil de 10"W, COM, Ethernet, USB, 24VCC, Harmony ST6',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIST6500'
  },
  {
    ref: 'HMIST6600',
    gamaName: 'harmony-st6',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony ST6',
    tipo: 'PANTALLA',
    fallbackName: 'HMIST6600 - Pantalla táctil de 12"W, COM, Ethernet, USB, 24VCC, Harmony ST6',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIST6600'
  },
  {
    ref: 'HMIST6700',
    gamaName: 'harmony-st6',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony ST6',
    tipo: 'PANTALLA',
    fallbackName: 'HMIST6700 - Pantalla táctil de 15"W, COM, Ethernet, USB, 24VCC, Harmony ST6',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIST6700'
  },
  {
    ref: 'HMIST6200D',
    gamaName: 'harmony-st6',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony ST6',
    tipo: 'PANTALLA',
    fallbackName: 'HMIST6200D - Pantalla táctil básica de 4"W, COM, USB, 24VCC, Harmony ST6',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIST6200D'
  },
  {
    ref: 'HMIST6400D',
    gamaName: 'harmony-st6',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony ST6',
    tipo: 'PANTALLA',
    fallbackName: 'HMIST6400D - Pantalla táctil básica de 7"W, COM, USB, 24VCC, Harmony ST6',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIST6400D'
  },
  {
    ref: 'HMISTW6200',
    gamaName: 'harmony-st6',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony ST6',
    tipo: 'PANTALLA',
    fallbackName: 'HMISTW6200 - Terminal táctil Web de 4"W, 2 puertos Ethernet, 24VCC, Harmony ST6',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMISTW6200'
  },
  {
    ref: 'HMISTW6400',
    gamaName: 'harmony-st6',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony ST6',
    tipo: 'PANTALLA',
    fallbackName: 'HMISTW6400 - Terminal táctil Web de 7"W, 2 puertos Ethernet, 24VCC, Harmony ST6',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMISTW6400'
  },
  {
    ref: 'HMISTW6600',
    gamaName: 'harmony-st6',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony ST6',
    tipo: 'PANTALLA',
    fallbackName: 'HMISTW6600 - Terminal táctil Web de 12"W, 2 puertos Ethernet, 24VCC, Harmony ST6',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMISTW6600'
  },

  // ======== 2. Harmony GTO HMI ========
  {
    ref: 'HMIGTO1300',
    gamaName: 'harmony-gto',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony GTO',
    tipo: 'PANTALLA',
    fallbackName: 'HMIGTO1300 - Pantalla táctil de 3.5" Harmony GTO, color TFT, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIGTO1300'
  },
  {
    ref: 'HMIGTO1310',
    gamaName: 'harmony-gto',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony GTO',
    tipo: 'PANTALLA',
    fallbackName: 'HMIGTO1310 - Pantalla táctil de 3.5" Harmony GTO, color TFT con puerto Ethernet, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIGTO1310'
  },
  {
    ref: 'HMIGTO2300',
    gamaName: 'harmony-gto',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony GTO',
    tipo: 'PANTALLA',
    fallbackName: 'HMIGTO2300 - Pantalla táctil de 5.7" Harmony GTO, color TFT, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIGTO2300'
  },
  {
    ref: 'HMIGTO2310',
    gamaName: 'harmony-gto',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony GTO',
    tipo: 'PANTALLA',
    fallbackName: 'HMIGTO2310 - Pantalla táctil de 5.7"W Harmony GTO, color QVGA, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIGTO2310'
  },
  {
    ref: 'HMIGTO2315',
    gamaName: 'harmony-gto',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony GTO',
    tipo: 'PANTALLA',
    fallbackName: 'HMIGTO2315 - Pantalla táctil de 5.7" Harmony GTO, acero inoxidable, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIGTO2315'
  },
  {
    ref: 'HMIGTO3510',
    gamaName: 'harmony-gto',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony GTO',
    tipo: 'PANTALLA',
    fallbackName: 'HMIGTO3510 - Pantalla táctil de 7" Harmony GTO, color TFT con Ethernet, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIGTO3510'
  },
  {
    ref: 'HMIGTO4310',
    gamaName: 'harmony-gto',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony GTO',
    tipo: 'PANTALLA',
    fallbackName: 'HMIGTO4310 - Pantalla táctil de 7.5" Harmony GTO, color TFT con Ethernet, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIGTO4310'
  },
  {
    ref: 'HMIGTO5310',
    gamaName: 'harmony-gto',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony GTO',
    tipo: 'PANTALLA',
    fallbackName: 'HMIGTO5310 - Pantalla táctil de 10.4"W Harmony GTO, color VGA, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIGTO5310'
  },
  {
    ref: 'HMIGTO6310',
    gamaName: 'harmony-gto',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony GTO',
    tipo: 'PANTALLA',
    fallbackName: 'HMIGTO6310 - Pantalla táctil de 12.1" Harmony GTO, color TFT con Ethernet, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMIGTO6310'
  },

  // ======== 3. Harmony STO/STU HMI ========
  {
    ref: 'HMISTU655',
    gamaName: 'harmony-sto-stu',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony STO/STU',
    tipo: 'PANTALLA',
    fallbackName: 'HMISTU655 - Pantalla táctil de 3.5"W Harmony STU, color QVGA, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMISTU655'
  },
  {
    ref: 'HMISTU855',
    gamaName: 'harmony-sto-stu',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony STO/STU',
    tipo: 'PANTALLA',
    fallbackName: 'HMISTU855 - Pantalla táctil de 5.7" Harmony STU, color TFT con Ethernet, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMISTU855'
  },
  {
    ref: 'HMISTO501',
    gamaName: 'harmony-sto-stu',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony STO/STU',
    tipo: 'PANTALLA',
    fallbackName: 'HMISTO501 - Pantalla táctil de 3.4"W Harmony STO, monocroma, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMISTO501'
  },
  {
    ref: 'HMISTO511',
    gamaName: 'harmony-sto-stu',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony STO/STU',
    tipo: 'PANTALLA',
    fallbackName: 'HMISTO511 - Pantalla táctil de 3.4" Harmony STO, puerto RJ45, RS232, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMISTO511'
  },
  {
    ref: 'HMISTO512',
    gamaName: 'harmony-sto-stu',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony STO/STU',
    tipo: 'PANTALLA',
    fallbackName: 'HMISTO512 - Pantalla táctil de 3.4" Harmony STO, puerto RS485, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMISTO512'
  },
  {
    ref: 'HMISTO531',
    gamaName: 'harmony-sto-stu',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony STO/STU',
    tipo: 'PANTALLA',
    fallbackName: 'HMISTO531 - Pantalla táctil de 3.4" Harmony STO, puerto Ethernet, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMISTO531'
  },
  {
    ref: 'HMISTO705',
    gamaName: 'harmony-sto-stu',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony STO/STU',
    tipo: 'PANTALLA',
    fallbackName: 'HMISTO705 - Pantalla táctil de 4.3" Harmony STO, color TFT, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMISTO705'
  },
  {
    ref: 'HMISTO715',
    gamaName: 'harmony-sto-stu',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony STO/STU',
    tipo: 'PANTALLA',
    fallbackName: 'HMISTO715 - Pantalla táctil de 4.3" Harmony STO, color TFT con puerto RS232, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMISTO715'
  },
  {
    ref: 'HMISTO735',
    gamaName: 'harmony-sto-stu',
    familia: 'Automatización',
    subfamilia: 'HMI',
    gama: 'Harmony',
    subgama: 'Harmony STO/STU',
    tipo: 'PANTALLA',
    fallbackName: 'HMISTO735 - Pantalla táctil de 4.3" Harmony STO, color TFT con puerto Ethernet, 24VCC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/HMISTO735'
  },

  // ======== 4. Harmony XPS (Preventa) ========
  {
    ref: 'XPSAC5121',
    gamaName: 'harmony-xps',
    familia: 'Automatización',
    subfamilia: 'Relé de Seguridad',
    gama: 'Harmony XPS',
    subgama: 'Preventa XPS',
    tipo: 'CARRIL DIN',
    fallbackName: 'XPSAC5121 - Módulo de seguridad Preventa XPSAC para parada de emergencia, 24V CA/CC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XPSAC5121'
  },
  {
    ref: 'XPSAC3421',
    gamaName: 'harmony-xps',
    familia: 'Automatización',
    subfamilia: 'Relé de Seguridad',
    gama: 'Harmony XPS',
    subgama: 'Preventa XPS',
    tipo: 'CARRIL DIN',
    fallbackName: 'XPSAC3421 - Módulo de seguridad Preventa XPSAC para parada de emergencia, 115V CA',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XPSAC3421'
  },
  {
    ref: 'XPSAC3721',
    gamaName: 'harmony-xps',
    familia: 'Automatización',
    subfamilia: 'Relé de Seguridad',
    gama: 'Harmony XPS',
    subgama: 'Preventa XPS',
    tipo: 'CARRIL DIN',
    fallbackName: 'XPSAC3721 - Módulo de seguridad Preventa XPSAC para parada de emergencia, 230V CA',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XPSAC3721'
  },
  {
    ref: 'XPSAF5130',
    gamaName: 'harmony-xps',
    familia: 'Automatización',
    subfamilia: 'Relé de Seguridad',
    gama: 'Harmony XPS',
    subgama: 'Preventa XPS',
    tipo: 'CARRIL DIN',
    fallbackName: 'XPSAF5130 - Módulo de seguridad Preventa XPSAF para parada de emergencia, 24V CA/CC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XPSAF5130'
  },
  {
    ref: 'XPSAF3430',
    gamaName: 'harmony-xps',
    familia: 'Automatización',
    subfamilia: 'Relé de Seguridad',
    gama: 'Harmony XPS',
    subgama: 'Preventa XPS',
    tipo: 'CARRIL DIN',
    fallbackName: 'XPSAF3430 - Módulo de seguridad Preventa XPSAF para parada de emergencia, 115V CA',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XPSAF3430'
  },
  {
    ref: 'XPSAF3730',
    gamaName: 'harmony-xps',
    familia: 'Automatización',
    subfamilia: 'Relé de Seguridad',
    gama: 'Harmony XPS',
    subgama: 'Preventa XPS',
    tipo: 'CARRIL DIN',
    fallbackName: 'XPSAF3730 - Módulo de seguridad Preventa XPSAF para parada de emergencia, 230V CA',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XPSAF3730'
  },
  {
    ref: 'XPSBND1010',
    gamaName: 'harmony-xps',
    familia: 'Automatización',
    subfamilia: 'Relé de Seguridad',
    gama: 'Harmony XPS',
    subgama: 'Preventa XPS',
    tipo: 'CARRIL DIN',
    fallbackName: 'XPSBND1010 - Módulo de seguridad Preventa XPSBND para control bimanual, 24V CA/CC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XPSBND1010'
  },
  {
    ref: 'XPSBND3410',
    gamaName: 'harmony-xps',
    familia: 'Automatización',
    subfamilia: 'Relé de Seguridad',
    gama: 'Harmony XPS',
    subgama: 'Preventa XPS',
    tipo: 'CARRIL DIN',
    fallbackName: 'XPSBND3410 - Módulo de seguridad Preventa XPSBND para control bimanual, 115V CA',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XPSBND3410'
  },
  {
    ref: 'XPSBND3710',
    gamaName: 'harmony-xps',
    familia: 'Automatización',
    subfamilia: 'Relé de Seguridad',
    gama: 'Harmony XPS',
    subgama: 'Preventa XPS',
    tipo: 'CARRIL DIN',
    fallbackName: 'XPSBND3710 - Módulo de seguridad Preventa XPSBND para control bimanual, 230V CA',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XPSBND3710'
  },
  {
    ref: 'XPSDMB1132',
    gamaName: 'harmony-xps',
    familia: 'Automatización',
    subfamilia: 'Relé de Seguridad',
    gama: 'Harmony XPS',
    subgama: 'Preventa XPS',
    tipo: 'CARRIL DIN',
    fallbackName: 'XPSDMB1132 - Módulo de seguridad Preventa XPSDMB para interruptores magnéticos, 24V CA/CC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XPSDMB1132'
  },

  // ======== 5. Telemecanique XS (Inductivos) ========
  {
    ref: 'XS1N12PA349',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS1N12PA349 - Detector inductivo cilíndrico M12, latón, Sn 4mm, 12-24VCC, conector M12',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS1N12PA349'
  },
  {
    ref: 'XS1N12PB349',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS1N12PB349 - Detector inductivo cilíndrico M12, latón, Sn 4mm, NC, 12-24VCC, M12',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS1N12PB349'
  },
  {
    ref: 'XS1N18PA349D',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS1N18PA349D - Detector inductivo cilíndrico M18, latón, Sn 10mm, 12-24VCC, M12',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS1N18PA349D'
  },
  {
    ref: 'XS1N18PB349D',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS1N18PB349D - Detector inductivo cilíndrico M18, latón, Sn 10mm, NC, 12-24VCC, M12',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS1N18PB349D'
  },
  {
    ref: 'XS2N12PA349',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS2N12PA349 - Detector inductivo plano de plástico, Sn 4mm, 12-24VCC, conector M12',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS2N12PA349'
  },
  {
    ref: 'XS2N18PA349D',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS2N18PA349D - Detector inductivo plano de plástico, Sn 8mm, 12-24VCC, M12',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS2N18PA349D'
  },
  {
    ref: 'XS512B1PAL2',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS512B1PAL2 - Detector inductivo cilíndrico M12, latón, Sn 2mm, 12-24VCC, cable 2m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS512B1PAL2'
  },
  {
    ref: 'XS512B1PBL2',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS512B1PBL2 - Detector inductivo cilíndrico M12, latón, Sn 2mm, NC, 12-24VCC, cable 2m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS512B1PBL2'
  },
  {
    ref: 'XS518B1PAL2',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS518B1PAL2 - Detector inductivo cilíndrico M18, latón, Sn 5mm, 12-24VCC, cable 2m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS518B1PAL2'
  },
  {
    ref: 'XS518B1PBL2',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS518B1PBL2 - Detector inductivo cilíndrico M18, latón, Sn 5mm, NC, 12-24VCC, cable 2m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS518B1PBL2'
  },
  {
    ref: 'XS530B1PAL2',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS530B1PAL2 - Detector inductivo cilíndrico M30, latón, Sn 10mm, 12-24VCC, cable 2m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS530B1PAL2'
  },
  {
    ref: 'XS530B1PBL2',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS530B1PBL2 - Detector inductivo cilíndrico M30, latón, Sn 10mm, NC, 12-24VCC, cable 2m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS530B1PBL2'
  },
  {
    ref: 'XS612B1PAL2',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS612B1PAL2 - Detector inductivo cilíndrico M12, latón, Sn 4mm, 12-24VCC, cable 2m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS612B1PAL2'
  },
  {
    ref: 'XS618B1PAL2',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS618B1PAL2 - Detector inductivo cilíndrico M18, latón, Sn 8mm, 12-24VCC, cable 2m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS618B1PAL2'
  },
  {
    ref: 'XS630B1PAL2',
    gamaName: 'xs-sensors',
    familia: 'Automatización',
    subfamilia: 'Detector Inductivo',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XS',
    tipo: 'SENSOR',
    fallbackName: 'XS630B1PAL2 - Detector inductivo cilíndrico M30, latón, Sn 15mm, 12-24VCC, cable 2m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XS630B1PAL2'
  },

  // ======== 6. Telemecanique XC (Final de Carrera) ========
  {
    ref: 'XCMD2102L1',
    gamaName: 'xc-sensors',
    familia: 'Automatización',
    subfamilia: 'Final de Carrera',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XC',
    tipo: 'SENSOR',
    fallbackName: 'XCMD2102L1 - Final de carrera miniatura metálico XCMD con roldana de acero, cable 1m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XCMD2102L1'
  },
  {
    ref: 'XCMD2110L1',
    gamaName: 'xc-sensors',
    familia: 'Automatización',
    subfamilia: 'Final de Carrera',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XC',
    tipo: 'SENSOR',
    fallbackName: 'XCMD2110L1 - Final de carrera miniatura metálico XCMD con vástago metálico, cable 1m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XCMD2110L1'
  },
  {
    ref: 'XCMD2115L1',
    gamaName: 'xc-sensors',
    familia: 'Automatización',
    subfamilia: 'Final de Carrera',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XC',
    tipo: 'SENSOR',
    fallbackName: 'XCMD2115L1 - Final de carrera miniatura metálico XCMD con palanca de rodillo, cable 1m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XCMD2115L1'
  },
  {
    ref: 'XCMD2124L1',
    gamaName: 'xc-sensors',
    familia: 'Automatización',
    subfamilia: 'Final de Carrera',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XC',
    tipo: 'SENSOR',
    fallbackName: 'XCMD2124L1 - Final de carrera miniatura metálico XCMD con resorte largo flexible, cable 1m',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XCMD2124L1'
  },
  {
    ref: 'XCKD2102G11',
    gamaName: 'xc-sensors',
    familia: 'Automatización',
    subfamilia: 'Final de Carrera',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XC',
    tipo: 'SENSOR',
    fallbackName: 'XCKD2102G11 - Final de carrera compacto metálico XCKD con roldana de acero, Pg11',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XCKD2102G11'
  },
  {
    ref: 'XCKD2110G11',
    gamaName: 'xc-sensors',
    familia: 'Automatización',
    subfamilia: 'Final de Carrera',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XC',
    tipo: 'SENSOR',
    fallbackName: 'XCKD2110G11 - Final de carrera compacto metálico XCKD con vástago metálico, Pg11',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XCKD2110G11'
  },
  {
    ref: 'XCKD2118G11',
    gamaName: 'xc-sensors',
    familia: 'Automatización',
    subfamilia: 'Final de Carrera',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XC',
    tipo: 'SENSOR',
    fallbackName: 'XCKD2118G11 - Final de carrera compacto metálico XCKD con palanca termoplástica regulable, Pg11',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XCKD2118G11'
  },
  {
    ref: 'XCKD2121G11',
    gamaName: 'xc-sensors',
    familia: 'Automatización',
    subfamilia: 'Final de Carrera',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XC',
    tipo: 'SENSOR',
    fallbackName: 'XCKD2121G11 - Final de carrera compacto metálico XCKD con palanca de rodillo, Pg11',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XCKD2121G11'
  },
  {
    ref: 'XCKJ10511',
    gamaName: 'xc-sensors',
    familia: 'Automatización',
    subfamilia: 'Final de Carrera',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XC',
    tipo: 'SENSOR',
    fallbackName: 'XCKJ10511 - Final de carrera industrial metálico XCKJ con palanca de roldana, Pg13.5',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XCKJ10511'
  },
  {
    ref: 'XCKJ10513',
    gamaName: 'xc-sensors',
    familia: 'Automatización',
    subfamilia: 'Final de Carrera',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XC',
    tipo: 'SENSOR',
    fallbackName: 'XCKJ10513 - Final de carrera industrial metálico XCKJ con palanca de rodillo de acero, Pg13.5',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XCKJ10513'
  },
  {
    ref: 'XCKJ161',
    gamaName: 'xc-sensors',
    familia: 'Automatización',
    subfamilia: 'Final de Carrera',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XC',
    tipo: 'SENSOR',
    fallbackName: 'XCKJ161 - Final de carrera industrial metálico XCKJ con pulsador de vástago metálico, Pg13.5',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XCKJ161'
  },
  {
    ref: 'XCKJ167',
    gamaName: 'xc-sensors',
    familia: 'Automatización',
    subfamilia: 'Final de Carrera',
    gama: 'Telemecanique Sensors',
    subgama: 'OsiSense XC',
    tipo: 'SENSOR',
    fallbackName: 'XCKJ167 - Final de carrera industrial metálico XCKJ con palanca de rodillo de acero regulable, Pg13.5',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/XCKJ167'
  },

  // ======== 7. Zelio/Harmony Control Relays ========
  {
    ref: 'RM17JC00MW',
    gamaName: 'harmony-control-relays',
    familia: 'Automatización',
    subfamilia: 'Relé de Control',
    gama: 'Harmony Relay',
    subgama: 'Zelio Control',
    tipo: 'CARRIL DIN',
    fallbackName: 'RM17JC00MW - Rele de control de sobrecorriente monofasica RM17-J, 2-20A, 24-240V CA/CC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/RM17JC00MW'
  },
  {
    ref: 'RM17TG00',
    gamaName: 'harmony-control-relays',
    familia: 'Automatización',
    subfamilia: 'Relé de Control',
    gama: 'Harmony Relay',
    subgama: 'Zelio Control',
    tipo: 'CARRIL DIN',
    fallbackName: 'RM17TG00 - Relé de control de secuencia y fallo de fase trifásico RM17-T, 208-440VCA',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/RM17TG00'
  },
  {
    ref: 'RM17TG20',
    gamaName: 'harmony-control-relays',
    familia: 'Automatización',
    subfamilia: 'Relé de Control',
    gama: 'Harmony Relay',
    subgama: 'Zelio Control',
    tipo: 'CARRIL DIN',
    fallbackName: 'RM17TG20 - HARMONY Control - Relé de control de fase trifásica RM17-TG, secuencia y fallo de fase, 208...440VCA',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/RM17TG20'
  },
  {
    ref: 'RM17TU00',
    gamaName: 'harmony-control-relays',
    familia: 'Automatización',
    subfamilia: 'Relé de Control',
    gama: 'Harmony Relay',
    subgama: 'Zelio Control',
    tipo: 'CARRIL DIN',
    fallbackName: 'RM17TU00 - Relé de control de subtensión trifásico RM17-T, 208-440VCA',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/RM17TU00'
  },
  {
    ref: 'RM17TA00',
    gamaName: 'harmony-control-relays',
    familia: 'Automatización',
    subfamilia: 'Relé de Control',
    gama: 'Harmony Relay',
    subgama: 'Zelio Control',
    tipo: 'CARRIL DIN',
    fallbackName: 'RM17TA00 - Relé de control de asimetría y secuencia de fase trifásico RM17-T, 208-440VCA',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/RM17TA00'
  },
  {
    ref: 'RM22TR33',
    gamaName: 'harmony-control-relays',
    familia: 'Automatización',
    subfamilia: 'Relé de Control',
    gama: 'Harmony Relay',
    subgama: 'Zelio Control',
    tipo: 'CARRIL DIN',
    fallbackName: 'RM22TR33 - HARMONY Control - Relé de control de fase modular RM22-TR, sobre/subtensión y secuencia, 380...480VCA',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/RM22TR33'
  },
  {
    ref: 'RM22TA31',
    gamaName: 'harmony-control-relays',
    familia: 'Automatización',
    subfamilia: 'Relé de Control',
    gama: 'Harmony Relay',
    subgama: 'Zelio Control',
    tipo: 'CARRIL DIN',
    fallbackName: 'RM22TA31 - Relé de control de asimetría trifásico RM22-T, 200-240VCA',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/RM22TA31'
  },
  {
    ref: 'RM22UA31MR',
    gamaName: 'harmony-control-relays',
    familia: 'Automatización',
    subfamilia: 'Relé de Control',
    gama: 'Harmony Relay',
    subgama: 'Zelio Control',
    tipo: 'CARRIL DIN',
    fallbackName: 'RM22UA31MR - Relé de control de tensión monofásico RM22-U, 15-260V CA/CC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/RM22UA31MR'
  },
  {
    ref: 'RM22UA33MT',
    gamaName: 'harmony-control-relays',
    familia: 'Automatización',
    subfamilia: 'Relé de Control',
    gama: 'Harmony Relay',
    subgama: 'Zelio Control',
    tipo: 'CARRIL DIN',
    fallbackName: 'RM22UA33MT - Relé de control de sobre/subtensión monofásico RM22-U, 15-480V CA/CC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/RM22UA33MT'
  },
  {
    ref: 'RM22LA32MR',
    gamaName: 'harmony-control-relays',
    familia: 'Automatización',
    subfamilia: 'Relé de Control',
    gama: 'Harmony Relay',
    subgama: 'Zelio Control',
    tipo: 'CARRIL DIN',
    fallbackName: 'RM22LA32MR - Relé de control de nivel de líquidos RM22-L, 24-240V CA/CC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/RM22LA32MR'
  },
  {
    ref: 'RM22LG11MR',
    gamaName: 'harmony-control-relays',
    familia: 'Automatización',
    subfamilia: 'Relé de Control',
    gama: 'Harmony Relay',
    subgama: 'Zelio Control',
    tipo: 'CARRIL DIN',
    fallbackName: 'RM22LG11MR - Relé de control de nivel de líquidos RM22-L, sensibilidad fija, 24-240V CA/CC',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/RM22LG11MR'
  },

  // ======== 8. TeSys LE (DOL starters) ========
  {
    ref: 'LE1D09B7',
    gamaName: 'tesys-le',
    familia: 'Automatización',
    subfamilia: 'Arrancador',
    gama: 'TeSys',
    subgama: 'TeSys LE',
    tipo: 'COFRE',
    fallbackName: 'LE1D09B7 - Arrancador DOL encerrado, TeSys LE, 9 A, bobina 24 V CA, marcha/paro',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/LE1D09B7'
  },
  {
    ref: 'LE1D09P7',
    gamaName: 'tesys-le',
    familia: 'Automatización',
    subfamilia: 'Arrancador',
    gama: 'TeSys',
    subgama: 'TeSys LE',
    tipo: 'COFRE',
    fallbackName: 'LE1D09P7 - Arrancador DOL encerrado, TeSys LE, 9 A, bobina 230 V CA, incluyendo 1 LC1D, 2 pulsadores',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/LE1D09P7'
  },
  {
    ref: 'LE1D12B7',
    gamaName: 'tesys-le',
    familia: 'Automatización',
    subfamilia: 'Arrancador',
    gama: 'TeSys',
    subgama: 'TeSys LE',
    tipo: 'COFRE',
    fallbackName: 'LE1D12B7 - Arrancador DOL encerrado, TeSys LE, 12 A, bobina 24 V CA, marcha/paro',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/LE1D12B7'
  },
  {
    ref: 'LE1D12P7',
    gamaName: 'tesys-le',
    familia: 'Automatización',
    subfamilia: 'Arrancador',
    gama: 'TeSys',
    subgama: 'TeSys LE',
    tipo: 'COFRE',
    fallbackName: 'LE1D12P7 - Arrancador DOL encerrado, TeSys LE, 12 A, bobina 230 V CA, incluyendo 1 LC1D, 2 pulsadores',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/LE1D12P7'
  },
  {
    ref: 'LE1D18B7',
    gamaName: 'tesys-le',
    familia: 'Automatización',
    subfamilia: 'Arrancador',
    gama: 'TeSys',
    subgama: 'TeSys LE',
    tipo: 'COFRE',
    fallbackName: 'LE1D18B7 - Arrancador DOL encerrado, TeSys LE, 18 A, bobina 24 V CA, marcha/paro',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/LE1D18B7'
  },
  {
    ref: 'LE1D18P7',
    gamaName: 'tesys-le',
    familia: 'Automatización',
    subfamilia: 'Arrancador',
    gama: 'TeSys',
    subgama: 'TeSys LE',
    tipo: 'COFRE',
    fallbackName: 'LE1D18P7 - Arrancador DOL encerrado, TeSys LE, 18 A, bobina 230 V CA, marcha/paro',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/LE1D18P7'
  },
  {
    ref: 'LE1D25B7',
    gamaName: 'tesys-le',
    familia: 'Automatización',
    subfamilia: 'Arrancador',
    gama: 'TeSys',
    subgama: 'TeSys LE',
    tipo: 'COFRE',
    fallbackName: 'LE1D25B7 - Arrancador DOL encerrado, TeSys LE, 25 A, bobina 24 V CA, marcha/paro',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/LE1D25B7'
  },
  {
    ref: 'LE1D25P7',
    gamaName: 'tesys-le',
    familia: 'Automatización',
    subfamilia: 'Arrancador',
    gama: 'TeSys',
    subgama: 'TeSys LE',
    tipo: 'COFRE',
    fallbackName: 'LE1D25P7 - Arrancador DOL encerrado, TeSys LE, 25 A, bobina 230 V CA, marcha/paro',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/LE1D25P7'
  },
  {
    ref: 'LE1D35B7',
    gamaName: 'tesys-le',
    familia: 'Automatización',
    subfamilia: 'Arrancador',
    gama: 'TeSys',
    subgama: 'TeSys LE',
    tipo: 'COFRE',
    fallbackName: 'LE1D35B7 - Arrancador DOL encerrado, TeSys LE, 35 A, bobina 24 V CA, marcha/paro',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/LE1D35B7'
  },
  {
    ref: 'LE1D35P7',
    gamaName: 'tesys-le',
    familia: 'Automatización',
    subfamilia: 'Arrancador',
    gama: 'TeSys',
    subgama: 'TeSys LE',
    tipo: 'COFRE',
    fallbackName: 'LE1D35P7 - Arrancador DOL encerrado, TeSys LE, 35 A, bobina 230 V CA, marcha/paro',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/LE1D35P7'
  },

  // ======== 9. TeSys DF (Fuse carriers) ========
  {
    ref: 'DF81',
    gamaName: 'tesys-df',
    familia: 'Distribución de potencia',
    subfamilia: 'Cortacircuito Fusible',
    gama: 'TeSys',
    subgama: 'TeSys DF',
    tipo: 'CARRIL DIN',
    fallbackName: 'DF81 - Portafusibles seccionador modular TeSys DF, 1 Polo, 25A, tamaño fusible 8.5x31.5mm',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/DF81'
  },
  {
    ref: 'DF82',
    gamaName: 'tesys-df',
    familia: 'Distribución de potencia',
    subfamilia: 'Cortacircuito Fusible',
    gama: 'TeSys',
    subgama: 'TeSys DF',
    tipo: 'CARRIL DIN',
    fallbackName: 'DF82 - Portafusibles seccionador modular TeSys DF, 2 Polos, 25A, tamaño fusible 8.5x31.5mm',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/DF82'
  },
  {
    ref: 'DF83',
    gamaName: 'tesys-df',
    familia: 'Distribución de potencia',
    subfamilia: 'Cortacircuito Fusible',
    gama: 'TeSys',
    subgama: 'TeSys DF',
    tipo: 'CARRIL DIN',
    fallbackName: 'DF83 - Portafusibles seccionador modular TeSys DF, 3 Polos, 25A, tamaño fusible 8.5x31.5mm',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/DF83'
  },
  {
    ref: 'DF101',
    gamaName: 'tesys-df',
    familia: 'Distribución de potencia',
    subfamilia: 'Cortacircuito Fusible',
    gama: 'TeSys',
    subgama: 'TeSys DF',
    tipo: 'CARRIL DIN',
    fallbackName: 'DF101 - Portafusibles seccionador modular TeSys DF, 1 Polo, 32A, tamaño fusible 10x38mm',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/DF101'
  },
  {
    ref: 'DF102',
    gamaName: 'tesys-df',
    familia: 'Distribución de potencia',
    subfamilia: 'Cortacircuito Fusible',
    gama: 'TeSys',
    subgama: 'TeSys DF',
    tipo: 'CARRIL DIN',
    fallbackName: 'DF102 - Portafusibles seccionador modular TeSys DF, 2 Polos, 32A, tamaño fusible 10x38mm',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/DF102'
  },
  {
    ref: 'DF103',
    gamaName: 'tesys-df',
    familia: 'Distribución de potencia',
    subfamilia: 'Cortacircuito Fusible',
    gama: 'TeSys',
    subgama: 'TeSys DF',
    tipo: 'CARRIL DIN',
    fallbackName: 'DF103 - Portafusibles seccionador modular TeSys DF, 3P, 32A, tamaño fusible 10x38mm',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/DF103'
  },
  {
    ref: 'DF141',
    gamaName: 'tesys-df',
    familia: 'Distribución de potencia',
    subfamilia: 'Cortacircuito Fusible',
    gama: 'TeSys',
    subgama: 'TeSys DF',
    tipo: 'CARRIL DIN',
    fallbackName: 'DF141 - Portafusibles seccionador modular TeSys DF, 1 Polo, 50A, tamaño fusible 14x51mm',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/DF141'
  },
  {
    ref: 'DF142',
    gamaName: 'tesys-df',
    familia: 'Distribución de potencia',
    subfamilia: 'Cortacircuito Fusible',
    gama: 'TeSys',
    subgama: 'TeSys DF',
    tipo: 'CARRIL DIN',
    fallbackName: 'DF142 - Portafusibles seccionador modular TeSys DF, 2 Polos, 50A, tamaño fusible 14x51mm',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/DF142'
  },
  {
    ref: 'DF143',
    gamaName: 'tesys-df',
    familia: 'Distribución de potencia',
    subfamilia: 'Cortacircuito Fusible',
    gama: 'TeSys',
    subgama: 'TeSys DF',
    tipo: 'CARRIL DIN',
    fallbackName: 'DF143 - Portafusibles seccionador modular TeSys DF, 3P, 50A, tamaño fusible 14x51mm',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/DF143'
  },
  {
    ref: 'DF221',
    gamaName: 'tesys-df',
    familia: 'Distribución de potencia',
    subfamilia: 'Cortacircuito Fusible',
    gama: 'TeSys',
    subgama: 'TeSys DF',
    tipo: 'CARRIL DIN',
    fallbackName: 'DF221 - Portafusibles seccionador modular TeSys DF, 1 Polo, 125A, tamaño fusible 22x58mm',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/DF221'
  },
  {
    ref: 'DF222',
    gamaName: 'tesys-df',
    familia: 'Distribución de potencia',
    subfamilia: 'Cortacircuito Fusible',
    gama: 'TeSys',
    subgama: 'TeSys DF',
    tipo: 'CARRIL DIN',
    fallbackName: 'DF222 - Portafusibles seccionador modular TeSys DF, 2 Polos, 125A, tamaño fusible 22x58mm',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/DF222'
  },
  {
    ref: 'DF223',
    gamaName: 'tesys-df',
    familia: 'Distribución de potencia',
    subfamilia: 'Cortacircuito Fusible',
    gama: 'TeSys',
    subgama: 'TeSys DF',
    tipo: 'CARRIL DIN',
    fallbackName: 'DF223 - Portafusibles seccionador modular TeSys DF, 3 Polos, 125A, tamaño fusible 22x58mm',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/DF223'
  },

  // ======== 10. Acti9 iC40 (Compact MCB) ========
  {
    ref: 'A9P22602',
    gamaName: 'acti9-ic40',
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptor Magnetotérmico',
    gama: 'Acti 9',
    subgama: 'Acti 9 iC40',
    tipo: 'CARRIL DIN',
    fallbackName: 'A9P22602 - Interruptor automático magnetotérmico Acti9 iC40N, 1P+N, 2A, curva C, 6000A',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/A9P22602'
  },
  {
    ref: 'A9P22604',
    gamaName: 'acti9-ic40',
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptor Magnetotérmico',
    gama: 'Acti 9',
    subgama: 'Acti 9 iC40',
    tipo: 'CARRIL DIN',
    fallbackName: 'A9P22604 - Interruptor automático magnetotérmico Acti9 iC40N, 1P+N, 4A, curva C, 6000A',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/A9P22604'
  },
  {
    ref: 'A9P22606',
    gamaName: 'acti9-ic40',
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptor Magnetotérmico',
    gama: 'Acti 9',
    subgama: 'Acti 9 iC40',
    tipo: 'CARRIL DIN',
    fallbackName: 'A9P22606 - Interruptor automático magnetotérmico Acti9 iC40N, 1P+N, 6A, curva C, 6000A',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/A9P22606'
  },
  {
    ref: 'A9P22610',
    gamaName: 'acti9-ic40',
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptor Magnetotérmico',
    gama: 'Acti 9',
    subgama: 'Acti 9 iC40',
    tipo: 'CARRIL DIN',
    fallbackName: 'A9P22610 - Interruptor automático magnetotérmico Acti9 iC40N, 1P+N, 10A, curva C, 6000A',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/A9P22610'
  },
  {
    ref: 'A9P22616',
    gamaName: 'acti9-ic40',
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptor Magnetotérmico',
    gama: 'Acti 9',
    subgama: 'Acti 9 iC40',
    tipo: 'CARRIL DIN',
    fallbackName: 'A9P22616 - Interruptor automático magnetotérmico Acti9 iC40N, 1P+N, 16A, curva C, 6000A',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/A9P22616'
  },
  {
    ref: 'A9P22620',
    gamaName: 'acti9-ic40',
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptor Magnetotérmico',
    gama: 'Acti 9',
    subgama: 'Acti 9 iC40',
    tipo: 'CARRIL DIN',
    fallbackName: 'A9P22620 - Interruptor automático magnetotérmico Acti9 iC40N, 1P+N, 20A, curva C, 6000A',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/A9P22620'
  },
  {
    ref: 'A9P22625',
    gamaName: 'acti9-ic40',
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptor Magnetotérmico',
    gama: 'Acti 9',
    subgama: 'Acti 9 iC40',
    tipo: 'CARRIL DIN',
    fallbackName: 'A9P22625 - Interruptor automático magnetotérmico Acti9 iC40N, 1P+N, 25A, curva C, 6000A',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/A9P22625'
  },
  {
    ref: 'A9P22632',
    gamaName: 'acti9-ic40',
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptor Magnetotérmico',
    gama: 'Acti 9',
    subgama: 'Acti 9 iC40',
    tipo: 'CARRIL DIN',
    fallbackName: 'A9P22632 - Interruptor automático magnetotérmico Acti9 iC40N, 1P+N, 32A, curva C, 6000A',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/A9P22632'
  },
  {
    ref: 'A9P22640',
    gamaName: 'acti9-ic40',
    familia: 'Distribución de potencia',
    subfamilia: 'Interruptor Magnetotérmico',
    gama: 'Acti 9',
    subgama: 'Acti 9 iC40',
    tipo: 'CARRIL DIN',
    fallbackName: 'A9P22640 - Interruptor automático magnetotérmico Acti9 iC40N, 1P+N, 40A, curva C, 6000A',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/A9P22640'
  },

  // ======== 11. Acti9 IH/IHP (Time switches) ========
  {
    ref: 'CCT15440',
    gamaName: 'ih-ihp-ita',
    familia: 'Automatización',
    subfamilia: 'Interruptor Horario',
    gama: 'Acti 9',
    subgama: 'Acti 9 IH/IHP',
    tipo: 'CARRIL DIN',
    fallbackName: 'CCT15440 - Interruptor horario digital programable Acti9 IHP, 1 canal, ciclo semanal',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/CCT15440'
  },
  {
    ref: 'CCT15442',
    gamaName: 'ih-ihp-ita',
    familia: 'Automatización',
    subfamilia: 'Interruptor Horario',
    gama: 'Acti 9',
    subgama: 'Acti 9 IH/IHP',
    tipo: 'CARRIL DIN',
    fallbackName: 'CCT15442 - Interruptor horario digital programable Acti9 IHP, 2 canales, ciclo semanal, reserva 6 años',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/CCT15442'
  },
  {
    ref: 'CCT15365',
    gamaName: 'ih-ihp-ita',
    familia: 'Automatización',
    subfamilia: 'Interruptor Horario',
    gama: 'Acti 9',
    subgama: 'Acti 9 IH/IHP',
    tipo: 'CARRIL DIN',
    fallbackName: 'CCT15365 - Interruptor horario digital programable Acti9 IHP, 1 canal, versión compacta (18mm)',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/CCT15365'
  },
  {
    ref: 'CCT16364',
    gamaName: 'ih-ihp-ita',
    familia: 'Automatización',
    subfamilia: 'Interruptor Horario',
    gama: 'Acti 9',
    subgama: 'Acti 9 IH/IHP',
    tipo: 'CARRIL DIN',
    fallbackName: 'CCT16364 - Interruptor horario analógico programable Acti9 IH, ciclo diario 24h, reserva 150h',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/CCT16364'
  },
  {
    ref: 'CCT15232',
    gamaName: 'ih-ihp-ita',
    familia: 'Automatización',
    subfamilia: 'Interruptor Horario',
    gama: 'Acti 9',
    subgama: 'Acti 9 IH/IHP',
    tipo: 'CARRIL DIN',
    fallbackName: 'CCT15232 - Interruptor horario analógico programable Acti9 IH, ciclo semanal 7 días, reserva 150h',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/CCT15232'
  },
  {
    ref: 'CCT15223',
    gamaName: 'ih-ihp-ita',
    familia: 'Automatización',
    subfamilia: 'Interruptor Horario',
    gama: 'Acti 9',
    subgama: 'Acti 9 IH/IHP',
    tipo: 'CARRIL DIN',
    fallbackName: 'CCT15223 - Interruptor horario analógico programable Acti9 IH, ciclo diario 24h, sin reserva de marcha',
    fallbackPdf: 'https://www.se.com/es/es/product/download-pdf/CCT15223'
  }
];

function cleanSlug(slug) {
  let decoded = decodeURIComponent(slug);
  decoded = decoded.split('#')[0].split('?')[0];
  decoded = decoded.replace(/\/+$/, '');
  let parts = decoded.split('-');
  let name = parts.join(' ');
  name = name.charAt(0).toUpperCase() + name.slice(1);
  name = name.replace(/\bca\b/gi, 'CA');
  name = name.replace(/\bcc\b/gi, 'CC');
  name = name.replace(/\bac\b/gi, 'AC');
  name = name.replace(/\bdc\b/gi, 'DC');
  name = name.replace(/\bip(\d+)\b/gi, 'IP$1');
  name = name.replace(/\b(\d+)v\b/gi, '$1V');
  name = name.replace(/\b(\d+)a\b/gi, '$1A');
  name = name.replace(/\b(\d+)kv\b/gi, '$1kV');
  name = name.replace(/\b(\d+)ka\b/gi, '$1kA');
  name = name.replace(/\b(\d+)es\b/gi, '$1 E/S');
  name = name.replace(/\s+/g, ' ').trim();
  return name;
}

async function main() {
  console.log('='.repeat(70));
  console.log('  SCRAPER & IMPORTER DE NUEVAS GAMAS SCHNEIDER ELECTRIC');
  console.log(`  Gama Filtrada: ${GAMA_FILTER || 'TODAS'}`);
  console.log('='.repeat(70));

  // Filtrar catálogo según argumentos
  let productsToProcess = PRODUCT_CATALOG;
  if (GAMA_FILTER) {
    productsToProcess = PRODUCT_CATALOG.filter(p => p.gamaName === GAMA_FILTER);
    if (productsToProcess.length === 0) {
      console.error(`Error: gama "${GAMA_FILTER}" no configurada en el catálogo`);
      process.exit(1);
    }
  }

  // Lanzar navegador Playwright para resolver metadatos reales vía WAF-bypass
  console.log('\n🌐 Inicializando navegador Playwright para bypass WAF...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-ES'
  });
  const page = await context.newPage();

  console.log('Establishing session on se.com/ww/en/...');
  await page.goto('https://www.se.com/ww/en/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(2000);

  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < productsToProcess.length; i++) {
    const item = productsToProcess[i];
    console.log(`\n[${i+1}/${productsToProcess.length}] Procesando ${item.ref} [${item.gamaName}]...`);

    // 1. Verificar si ya existe en Supabase
    try {
      const exists = await checkRefExists(item.ref);
      if (exists) {
        console.log(`  Skip: El producto ya existe en la base de datos.`);
        skippedCount++;
        continue;
      }
    } catch (dbErr) {
      console.log(`  ⚠️ Error al comprobar existencia: ${dbErr.message}. Continuando...`);
    }

    // 2. Intentar raspar los detalles de la API secundaria
    let resolvedName = '';
    let resolvedPdf = '';

    console.log(`  🔍 Consultando API de se.com para ${item.ref}...`);
    const apiResult = await page.evaluate(async (r) => {
      const url = `https://www.se.com/products-card/secondary?brand=se&country-code=es&language-code=es&ids=${r}`;
      try {
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return { error: `HTTP ${res.status}` };
        const data = await res.json();
        const info = data.productAdditionalInfos?.[0];
        if (!info) return { error: 'No info returned' };

        let title = '';
        if (info.viewAllDocumentsUrl) {
          const match = info.viewAllDocumentsUrl.match(/\/product\/([^\/]+)\/([^\/]+)/i);
          if (match && match[2]) {
            title = match[2];
          }
        }

        let pdfUrl = '';
        if (info.documents && info.documents.length > 0) {
          const sheet = info.documents.find(d => d.documentType === 'Product Data Sheet' || d.title?.includes('Hoja de datos'));
          const doc = sheet || info.documents[0];
          if (doc && doc.url) {
            pdfUrl = doc.url.startsWith('http') ? doc.url : `https://www.se.com${doc.url}`;
          }
        }

        return { titleSlug: title, pdfUrl };
      } catch (err) {
        return { error: err.message };
      }
    }, item.ref).catch(err => ({ error: err.message }));

    if (apiResult.error || (!apiResult.titleSlug && !apiResult.pdfUrl)) {
      console.log(`  ⚠️ WAF Bloqueó o no devolvió datos (${apiResult.error || 'datos vacíos'}). Aplicando datos precompilados.`);
      resolvedName = item.fallbackName;
      resolvedPdf = item.fallbackPdf;
    } else {
      console.log(`  ✨ Éxito en la consulta API!`);
      resolvedName = apiResult.titleSlug ? cleanSlug(apiResult.titleSlug) : item.fallbackName;
      resolvedPdf = apiResult.pdfUrl || item.fallbackPdf;
    }

    // Asegurar formato de nombre descriptivo
    if (!resolvedName || resolvedName === item.ref) {
      resolvedName = item.fallbackName;
    }

    // 3. Construir e insertar producto
    const newProduct = {
      ref_fabricante: item.ref,
      marca: MARCA,
      name: resolvedName,
      imagen: '',
      pdf_url: resolvedPdf || '',
      familia: item.familia,
      subfamilia: item.subfamilia,
      Gama: item.gama,
      Subgama: item.subgama,
      tipo: item.tipo,
      precio: 0,
      brand_id: BRAND_ID
    };

    console.log(`  💾 Insertando producto:`);
    console.log(`     - Nombre: "${newProduct.name}"`);
    console.log(`     - PDF: "${newProduct.pdf_url}"`);
    console.log(`     - Familia: "${newProduct.familia}"`);
    console.log(`     - Subfamilia: "${newProduct.subfamilia}"`);
    console.log(`     - Tipo: "${newProduct.tipo}"`);

    try {
      await insertProduct(newProduct);
      console.log(`  ✅ Producto insertado con éxito.`);
      insertedCount++;
    } catch (insertErr) {
      console.error(`  ❌ Error insertando producto:`, insertErr.message);
      errorCount++;
    }

    // Pequeño delay de cortesía
    await new Promise(r => setTimeout(r, 400));
  }

  await browser.close();

  console.log('\n' + '='.repeat(70));
  console.log('  RESUMEN DE IMPORTACIÓN:');
  console.log(`  - Nuevos insertados: ${insertedCount}`);
  console.log(`  - Omitidos (ya existían): ${skippedCount}`);
  console.log(`  - Errores de base de datos: ${errorCount}`);
  console.log('='.repeat(70) + '\n');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});

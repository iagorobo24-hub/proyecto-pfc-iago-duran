/**
 * Análisis completo: qué campos tienen datos y cuáles están vacíos
 */
import { createClient } from '@supabase/supabase-js';

const s = createClient(
  'https://fncmzrnmzmuhlullkrud.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM2MDY5NSwiZXhwIjoyMDg4OTM2Njk1fQ.3DfYKquAUFFNx_c8NdMWmic7pVVckWsXEZWOJTuC5wg'
);

async function main() {
  console.log('=== ANÁLISIS DE CAMPOS ===\n');

  // Muestra aleatoria de 200 productos
  const { data } = await s
    .from('products')
    .select('id, ref_fabricante, name, marca, familia, subfamilia, tipo, ean, imagen, pdf_url')
    .limit(500);

  let stats = {
    total: data?.length || 0,
    conRef: 0, sinRef: 0,
    conNombre: 0, sinNombre: 0,
    conMarca: 0, sinMarca: 0,
    conFamilia: 0, sinFamilia: 0,
    conSubfamilia: 0, sinSubfamilia: 0,
    conTipo: 0, sinTipo: 0,
    conEan: 0, sinEan: 0,
    conImagen: 0, sinImagen: 0,
    conPdf: 0, sinPdf: 0,
  };

  data.forEach(p => {
    p.ref_fabricante ? stats.conRef++ : stats.sinRef++;
    p.name ? stats.conNombre++ : stats.sinNombre++;
    p.marca ? stats.conMarca++ : stats.sinMarca++;
    p.familia ? stats.conFamilia++ : stats.sinFamilia++;
    p.subfamilia ? stats.conSubfamilia++ : stats.sinSubfamilia++;
    p.tipo ? stats.conTipo++ : stats.sinTipo++;
    p.ean ? stats.conEan++ : stats.sinEan++;
    p.imagen ? stats.conImagen++ : stats.sinImagen++;
    p.pdf_url ? stats.conPdf++ : stats.sinPdf++;
  });

  console.log(`Muestra: ${stats.total} productos\n`);
  console.log('Campo              | Con datos | Sin datos | % Con datos');
  console.log('-------------------|-----------|-----------|------------');
  const fields = [
    ['ref_fabricante', stats.conRef, stats.sinRef],
    ['name', stats.conNombre, stats.sinNombre],
    ['marca', stats.conMarca, stats.sinMarca],
    ['familia', stats.conFamilia, stats.sinFamilia],
    ['subfamilia', stats.conSubfamilia, stats.sinSubfamilia],
    ['tipo', stats.conTipo, stats.sinTipo],
    ['ean', stats.conEan, stats.sinEan],
    ['imagen', stats.conImagen, stats.sinImagen],
    ['pdf_url', stats.conPdf, stats.sinPdf],
  ];

  fields.forEach(([name, con, sin]) => {
    const pct = ((con / stats.total) * 100).toFixed(1);
    console.log(`${name.padEnd(18)} | ${String(con).padStart(9)} | ${String(sin).padStart(9)} | ${pct.padStart(10)}%`);
  });

  // Familias únicas en la muestra
  console.log('\n=== FAMILIAS ÚNICAS EN MUESTRA ===');
  const familias = {};
  data.forEach(p => {
    const f = p.familia || '(sin familia)';
    familias[f] = (familias[f] || 0) + 1;
  });
  Object.entries(familias).sort((a, b) => b[1] - a[1]).forEach(([f, c]) => {
    console.log(`  ${f}: ${c}`);
  });

  // Subfamilias únicas (top 20)
  console.log('\n=== SUBFAMILIAS TOP 20 ===');
  const subfamilias = {};
  data.forEach(p => {
    const sf = p.subfamilia || '(sin subfamilia)';
    subfamilias[sf] = (subfamilias[sf] || 0) + 1;
  });
  Object.entries(subfamilias).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([sf, c]) => {
    console.log(`  ${sf}: ${c}`);
  });
}

main();

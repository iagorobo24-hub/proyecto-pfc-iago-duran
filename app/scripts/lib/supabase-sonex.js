/**
 * Cliente API REST para Supabase SONEX — tabla products
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SONEX_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co';
let SONEX_KEY = process.env.SONEX_SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SONEX_KEY) {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const envPath = path.join(__dirname, '../..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    SONEX_KEY = envContent.match(/SONEX_SUPABASE_KEY=(.+)/)?.[1]?.trim() ||
                envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim() || '';
  } catch (err) {
    // Fallback silencioso
  }
}

const HEADERS = {
  'apikey': SONEX_KEY,
  'Authorization': `Bearer ${SONEX_KEY}`,
  'Content-Type': 'application/json'
};

async function fetchAPI(path, options = {}) {
  const url = `${SONEX_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...HEADERS, ...options.headers }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase API error ${res.status}: ${err}`);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  return null;
}

export async function insertProduct(product) {
  return fetchAPI('products', {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(product)
  });
}

export async function checkRefExists(ref) {
  const data = await fetchAPI(`products?select=id&ref_fabricante=eq.${encodeURIComponent(ref)}&limit=1`);
  return data?.length > 0;
}

export async function getProductsCount() {
  const path = 'products?select=count&limit=0';
  const res = await fetch(`${SONEX_URL}/rest/v1/${path}`, { 
    headers: { ...HEADERS, 'Prefer': 'count=exact' }
  });
  const range = res.headers.get('content-range');
  if (range) {
    const match = range.match(/\/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

export async function getBrands() {
  return fetchAPI('brands?select=id,name,website_url&order=name.asc');
}

export async function insertBrand(brand) {
  return fetchAPI('brands', {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(brand)
  });
}

export async function updateProductsByMarca(marca, updates) {
  return fetchAPI(`products?marca=eq.${encodeURIComponent(marca)}`, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(updates)
  });
}

export async function getAllProductIds() {
  return fetchAPI('products?select=id,ref_fabricante,brand_id&limit=10000');
}

export async function updateProduct(id, updates) {
  return fetchAPI(`products?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(updates)
  });
}

export default {
  insertProduct,
  checkRefExists,
  getProductsCount,
  getBrands,
  insertBrand,
  updateProductsByMarca,
  getAllProductIds,
  updateProduct
};

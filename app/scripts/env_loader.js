/**
 * env_loader.js
 * Carga variables de entorno desde .env.local sin procesado externo.
 * Exporta { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY }.
 * No envía nada por red.
 */
const fs = require('node:fs');
const path = require('node:path');

const ENV_PATH = path.join(__dirname, '..', '.env.local');

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const idx = trimmed.indexOf('=');
  if (idx < 0) return null;
  const key = trimmed.slice(0, idx).trim();
  const value = trimmed.slice(idx + 1).trim();
  return value ? { key, value } : null;
}

let raw = '';
try {
  raw = fs.readFileSync(ENV_PATH, 'utf8');
} catch {
  process.stdout.write(JSON.stringify({ SUPABASE_URL: '', SUPABASE_ANON_KEY: '', SUPABASE_SERVICE_ROLE_KEY: '' }));
  process.exit(0);
}

const entries = raw.split(/\r?\n/).map(parseLine).filter(Boolean);
const map = Object.fromEntries(entries.map(({ key, value }) => [key, value]));

const SUPABASE_URL = map.VITE_SUPABASE_URL || map.SUPABASE_URL || '';
const SUPABASE_ANON_KEY =
  map.VITE_SUPABASE_ANON_KEY || map.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = map.SUPABASE_SERVICE_ROLE_KEY || '';

module.exports = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
};

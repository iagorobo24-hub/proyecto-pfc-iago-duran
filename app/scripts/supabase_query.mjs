#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const PROJECT_DIR = '/home/abu/github_repos/proyecto-pfc-iago-duran/app';
const ENV_FILE = path.join(PROJECT_DIR, '.env.local');

function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return {};
  const txt = fs.readFileSync(ENV_FILE, 'utf8');
  const out = {};
  for (const line of txt.split(/\r?\n/)) {
    const trim = line.trim();
    if (!trim || trim.startsWith('#')) continue;
    const eq = trim.indexOf('=');
    if (eq < 0) continue;
    out[trim.slice(0, eq).trim()] = trim.slice(eq + 1).trim();
  }
  return out;
}

function http(pathname, body) {
  const env = loadEnv();
  const URL = (process.env.SUPABASE_URL || env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').replace(/\/$/, '');
  const proxyURL = URL || 'https://fncmzrnmzmuhlullkrud.supabase.co';
  const KEY = process.env.SUPABASE_KEY || env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_KEY || '';
  if (!URL || !KEY) throw new Error('Missing SUPABASE_URL/SUPABASE_KEY env');
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const target = proxyURL + (pathname.startsWith('/') ? pathname : '/' + pathname);
    const req = https.request(
      new URL(target),
      {
        method: data ? 'POST' : 'GET',
        headers: {
          apikey: KEY,
          Authorization: 'Bearer ' + KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString();
          try {
            const json = JSON.parse(text);
            resolve({ status: res.statusCode, data: json });
          } catch {
            resolve({ status: res.statusCode, data: text });
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const PAGE_SIZE = 1000;

(async () => {
  const table = process.argv[2];
  const mode = process.argv[3] || 'select';
  if (!table) {
    console.error(JSON.stringify({ ok: false, usage: 'node supabase_query.mjs <products|brands|mapeo_productos|...> [select|sql <query>]' }));
    process.exit(2);
  }
  try {
    if (mode === 'sql') {
      const q = process.argv.slice(4).join(' ');
      const { status, data } = await http('/rest/v1/rpc/exec_sql', { query: q });
      console.log(JSON.stringify({ ok: status === 200, status, data }, null, 2));
      return;
    }

    const filters = {};
    for (const a of process.argv.slice(4)) {
      const idx = a.indexOf('=');
      if (idx >= 0) filters[a.slice(0, idx)] = a.slice(idx + 1);
    }

    let all = [];
    let offset = 0;
    while (true) {
      const params = new URLSearchParams({ select: '*', limit: String(PAGE_SIZE), offset: String(offset) });
      for (const [k, v] of Object.entries(filters)) params.set(k, v);
      const { status, data } = await http('/rest/v1/' + table + '?' + params.toString());
      if (status !== 200) {
        console.error(JSON.stringify({ ok: false, status, error: data }, null, 2));
        process.exit(1);
      }
      const rows = Array.isArray(data) ? data : [];
      all = all.concat(rows);
      if (rows.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    console.log(JSON.stringify({ ok: true, table, filters, count: all.length, rows: all }, null, 2));
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: String(e) }, null, 2));
    process.exit(1);
  }
});

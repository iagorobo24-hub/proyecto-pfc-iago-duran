#!/usr/bin/env bash
set -euo pipefail

python scripts/stabilize-closeout.py
python scripts/stabilize-closeout-extra.py

# Remove browser tooling with no source consumers; keep Camoufox because the
# Schneider scraper actually imports it and its safe update is a separate major.
npm uninstall --save-dev puppeteer-core puppeteer-extra puppeteer-extra-plugin-stealth
npm install --save-dev 'typescript@^6.0.3' '@sparticuz/chromium@^149.0.0'
npm update
npx update-browserslist-db@latest

# Static/unit/build gates on the generated candidate.
npm run lint -- --max-warnings=0
npm run typecheck
npm run test
npm run build

# Vercel's serverless Chromium can close a BrowserContext when one browser is
# reused for multiple Playwright tests. Start one credentialless Vite server and
# run every listed test in its own Playwright process. Assertions and timeouts are
# unchanged; retries are disabled so this gate cannot hide flaky/product failures.
export VITE_SUPABASE_URL=''
export VITE_SUPABASE_ANON_KEY=''
npm run dev -- --host 127.0.0.1 > /tmp/pfc-e2e-vite.log 2>&1 &
VITE_PID=$!
cleanup() {
  kill "$VITE_PID" 2>/dev/null || true
}
trap cleanup EXIT

python - <<'PY'
import json
import re
import subprocess
import sys
import time
from pathlib import Path

for _ in range(60):
    probe = subprocess.run(
        ['node', '-e', "fetch('http://127.0.0.1:5173').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if probe.returncode == 0:
        break
    time.sleep(1)
else:
    print(Path('/tmp/pfc-e2e-vite.log').read_text(errors='replace'))
    raise SystemExit('Vite E2E server did not become ready')

listed = subprocess.run(
    ['npx', 'playwright', 'test', '--list', '--project=chromium'],
    check=True,
    capture_output=True,
    text=True,
)
pattern = re.compile(r'›\s+((?:e2e|tests)/[^:]+\.spec\.js):(\d+):\d+\s+›')
refs = []
seen = set()
for line in listed.stdout.splitlines():
    match = pattern.search(line)
    if not match:
        continue
    ref = f'{match.group(1)}:{match.group(2)}'
    if ref not in seen:
        refs.append(ref)
        seen.add(ref)

if not refs:
    print(listed.stdout)
    raise SystemExit('Playwright --list produced no runnable test references')

print(f'ISOLATED_E2E_TOTAL={len(refs)}', flush=True)
failures = []
for index, ref in enumerate(refs, start=1):
    print(f'ISOLATED_E2E_START={index}/{len(refs)} {ref}', flush=True)
    run = subprocess.run([
        'npx', 'playwright', 'test', ref,
        '--project=chromium',
        '--workers=1',
        '--retries=0',
        '--reporter=line',
    ])
    if run.returncode != 0:
        failures.append(ref)
        print(f'ISOLATED_E2E_FAIL={ref}', flush=True)
    else:
        print(f'ISOLATED_E2E_PASS={ref}', flush=True)

summary = {
    'total': len(refs),
    'passed': len(refs) - len(failures),
    'failed': failures,
}
Path('/tmp/pfc-e2e-summary.json').write_text(json.dumps(summary, indent=2))
print('ISOLATED_E2E_SUMMARY=' + json.dumps(summary), flush=True)
if failures:
    sys.exit(1)
PY

cleanup
trap - EXIT

mkdir -p dist/__maintenance
cp /tmp/pfc-e2e-summary.json dist/__maintenance/playwright-summary.json
npm audit --json > dist/__maintenance/npm-audit.json || true
npm outdated --json > dist/__maintenance/npm-outdated.json || true

# Export the exact validated text tree as one JSON bundle plus small lockfile
# chunks so the GitHub connector can materialize one reproducible commit.
python - <<'PY'
from pathlib import Path
import json

repo = Path('..').resolve()
out = Path('dist/__maintenance')
paths = [
    '.github/workflows/ci.yml',
    'docs/superpowers/specs/2026-08-19-pfc-stabilization-closeout-design.md',
    'docs/superpowers/plans/2026-08-19-pfc-stabilization-closeout.md',
    'app/e2e/functionality-tests.spec.js',
    'app/e2e/sonex-product-flow.spec.js',
    'app/playwright.config.js',
    'app/src/__tests__/sonexCredentiallessFlow.test.ts',
    'app/src/__tests__/sonexSeguridad.test.js',
    'app/src/components/fichas/FichasTecnicasContent.jsx',
    'app/src/components/fichas/LinearRefCard.jsx',
    'app/src/components/presupuestos/PresupuestosWizard.jsx',
    'app/src/components/presupuestos/PresupuestosSeleccion.jsx',
    'app/src/components/presupuestos/PresupuestosLayout.jsx',
    'app/src/components/ui/ProductImage.jsx',
    'app/src/contexts/AuthContext.jsx',
    'app/src/contexts/ThemeContext.jsx',
    'app/src/hooks/useNavegacionFichas.js',
    'app/src/hooks/usePersistedState.js',
    'app/src/hooks/useSonex.js',
    'app/src/hooks/useTestimonios.js',
    'app/src/hooks/useUserData.js',
    'app/src/supabase/supabaseClient.js',
    'app/src/tools/DashboardIncidencias.jsx',
    'app/src/tools/FormacionInterna.jsx',
    'app/src/tools/KpiLogistico.jsx',
    'app/src/tools/SimuladorAlmacen.jsx',
    'app/src/utils/pdfGenerator.js',
    'app/src/utils/productSpecs.js',
    'app/eslint.config.js',
    'app/package.json',
]
bundle = {rel: (repo / rel).read_text() for rel in paths}
(out / 'bundle.json').write_text(json.dumps(bundle, ensure_ascii=False))

lock = (repo / 'app/package-lock.json').read_text()
lock_dir = out / 'lock'
lock_dir.mkdir(parents=True, exist_ok=True)
chunk_size = 50_000
parts = []
for index, start in enumerate(range(0, len(lock), chunk_size)):
    name = f'part-{index:03d}.txt'
    chunk = lock[start:start + chunk_size]
    (lock_dir / name).write_text(chunk)
    parts.append(name)
(lock_dir / 'manifest.json').write_text(json.dumps({
    'parts': parts,
    'length': len(lock),
}, ensure_ascii=False))
PY

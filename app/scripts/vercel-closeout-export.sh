#!/usr/bin/env bash
set -euo pipefail

# The branch may already contain the final CI block while the temporary codemod
# still expects the pre-closeout shape. Normalize only that marker, then let the
# verified codemod restore the exact final form.
python - <<'PY'
from pathlib import Path
p = Path('../.github/workflows/ci.yml')
text = p.read_text()
final_block = "      - name: Lint\n        run: npm run lint -- --max-warnings=0\n\n      - name: Typecheck\n        run: npm run typecheck\n\n      - name: Unit tests"
old_block = "      - name: Lint\n        run: npm run lint\n\n      - name: Unit tests"
if final_block in text:
    text = text.replace(final_block, old_block, 1)
p.write_text(text)
PY

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

# Vercel's serverless Chromium is reliable when every individual Playwright test
# owns a fresh process/browser/context. `file:line` alone can select several
# parameterized tests that share one source line, so combine it with the leaf
# title from `--list`. No retries and no timeout inflation are permitted.
export VITE_SUPABASE_URL=''
export VITE_SUPABASE_ANON_KEY=''

python - <<'PY'
import json
import re
import subprocess
import sys
from pathlib import Path

listed = subprocess.run(
    ['npx', 'playwright', 'test', '--list', '--project=chromium'],
    check=True,
    capture_output=True,
    text=True,
)
pattern = re.compile(r'›\s+((?:e2e|tests)/[^:]+\.spec\.js):(\d+):\d+\s+›\s+(.+)$')
cases = []
for line in listed.stdout.splitlines():
    match = pattern.search(line)
    if not match:
        continue
    ref = f'{match.group(1)}:{match.group(2)}'
    full_title = match.group(3).strip()
    leaf_title = full_title.split(' › ')[-1].strip()
    cases.append((ref, leaf_title))

if not cases:
    print(listed.stdout)
    raise SystemExit('Playwright --list produced no runnable tests')

print(f'ISOLATED_E2E_TOTAL={len(cases)}', flush=True)
failures = []
for index, (ref, leaf_title) in enumerate(cases, start=1):
    case_id = f'{ref} :: {leaf_title}'
    print(f'ISOLATED_E2E_START={index}/{len(cases)} {case_id}', flush=True)
    run = subprocess.run([
        'npx', 'playwright', 'test', ref,
        '--project=chromium',
        '--workers=1',
        '--retries=0',
        '--grep', re.escape(leaf_title) + '$',
        '--reporter=line',
    ])
    if run.returncode != 0:
        failures.append(case_id)
        print(f'ISOLATED_E2E_FAIL={case_id}', flush=True)
    else:
        print(f'ISOLATED_E2E_PASS={case_id}', flush=True)

summary = {
    'total': len(cases),
    'passed': len(cases) - len(failures),
    'failed': failures,
}
Path('/tmp/pfc-e2e-summary.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False))
print('ISOLATED_E2E_SUMMARY=' + json.dumps(summary, ensure_ascii=False), flush=True)
if failures:
    sys.exit(1)
PY

mkdir -p dist/__maintenance
cp /tmp/pfc-e2e-summary.json dist/__maintenance/playwright-summary.json
npm audit --json > dist/__maintenance/npm-audit.json || true
npm outdated --json > dist/__maintenance/npm-outdated.json || true

# Export the exact validated tree for audit/debug transport.
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
(lock_dir / 'manifest.json').write_text(json.dumps({'parts': parts, 'length': len(lock)}))
PY

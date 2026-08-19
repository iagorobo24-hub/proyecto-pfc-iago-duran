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

# First browser gate: reproduce the four formerly failing SONEX flows using the
# serverless Chromium executable only on Vercel.
CI=1 npx playwright test e2e/sonex-product-flow.spec.js --project=chromium --reporter=line

mkdir -p dist/__maintenance
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
    'app/playwright.config.js',
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

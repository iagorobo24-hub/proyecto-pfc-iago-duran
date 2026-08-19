#!/usr/bin/env bash
set -euo pipefail

python scripts/stabilize-closeout.py
python scripts/stabilize-closeout-extra.py
npm install --save-dev 'typescript@^6.0.3'
npm update
npx update-browserslist-db@latest
npm run lint -- --max-warnings=0
npm run typecheck
npm run test
npm run build

mkdir -p dist/__maintenance/files
python - <<'PY'
from pathlib import Path
import shutil

repo = Path('..').resolve()
out = Path('dist/__maintenance/files')
paths = [
    '.github/workflows/ci.yml',
    'docs/superpowers/specs/2026-08-19-pfc-stabilization-closeout-design.md',
    'docs/superpowers/plans/2026-08-19-pfc-stabilization-closeout.md',
    'app/e2e/functionality-tests.spec.js',
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
    'app/src/tools/DashboardIncidencias.jsx',
    'app/src/tools/FormacionInterna.jsx',
    'app/src/tools/KpiLogistico.jsx',
    'app/src/tools/SimuladorAlmacen.jsx',
    'app/src/utils/pdfGenerator.js',
    'app/eslint.config.js',
    'app/package.json',
    'app/package-lock.json',
]
for rel in paths:
    src = repo / rel
    dst = out / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
PY

npm audit --json > dist/__maintenance/npm-audit.json || true
npm outdated --json > dist/__maintenance/npm-outdated.json || true

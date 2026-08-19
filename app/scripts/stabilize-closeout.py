from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]


def replace(path, old, new, count=-1):
    p = ROOT / path
    text = p.read_text()
    if old not in text:
        raise SystemExit(f"Expected pattern not found in {path}: {old[:120]!r}")
    p.write_text(text.replace(old, new, count))


def prepend(path, directive):
    p = ROOT / path
    text = p.read_text()
    if directive not in text:
        p.write_text(directive + "\n" + text)


# Dead code / stale variables.
replace(
    'app/e2e/functionality-tests.spec.js',
    "          let clicked = false\n          for (let attempt = 0; attempt < 5; attempt++) {\n            if (await nextBtn.isVisible().catch(() => false)) {\n              clicked = true\n              break\n            }",
    "          for (let attempt = 0; attempt < 5; attempt++) {\n            if (await nextBtn.isVisible().catch(() => false)) {\n              break\n            }",
    1,
)
replace('app/src/__tests__/sonexSeguridad.test.js', "const buildFullPrompt = (modo = 'busqueda', categoria = '', contexto = '') => {", "const buildFullPrompt = (_modo = 'busqueda', categoria = '', contexto = '') => {", 1)
replace('app/src/components/fichas/FichasTecnicasContent.jsx', "import React, { useState } from 'react'", "import React from 'react'", 1)
replace('app/src/components/fichas/FichasTecnicasContent.jsx', "  categorias,\n", "", 1)
replace('app/src/components/presupuestos/PresupuestosWizard.jsx', "  const { categoria, historial, cargarPresupuesto, partidas } = usePresupuestosContext()", "  const { categoria, historial, cargarPresupuesto } = usePresupuestosContext()", 1)
replace('app/src/contexts/ThemeContext.jsx', "    const isDarkToLight = dark // true si estamos en oscuro y vamos a claro\n", "", 1)
replace(
    'app/src/tools/KpiLogistico.jsx',
    "  const semaforo = (kpi, valor) => {\n    const b = BENCHMARKS[kpi]; if (!b) return null;\n    if (b.invertido) { if (valor <= b.bueno) return { label: \"Objetivo\", color: \"var(--success)\", bg: \"var(--success-soft)\" }; if (valor >= b.malo) return { label: \"Crítico\", color: \"var(--error)\", bg: \"var(--error-soft)\" }; return { label: \"Atención\", color: \"var(--warning)\", bg: \"var(--warning-soft)\" }; }\n    if (valor >= b.bueno) return { label: \"Objetivo\", color: \"var(--success)\", bg: \"var(--success-soft)\" }; if (valor <= b.malo) return { label: \"Crítico\", color: \"var(--error)\", bg: \"var(--error-soft)\" }; return { label: \"Atención\", color: \"var(--warning)\", bg: \"var(--warning-soft)\" };\n  };\n\n",
    "",
    1,
)
replace('app/src/utils/pdfGenerator.js', "  incidencias.forEach((inc, idx) => {", "  incidencias.forEach((inc) => {", 1)
replace('app/src/hooks/useUserData.js', "  }, [userId, module, field, localStorageKey, migrationDone])", "  }, [userId, module, field, localStorageKey])", 1)

# Intentional source-to-state synchronization: preserve behavior and narrow suppressions.
prepend('app/src/components/fichas/LinearRefCard.jsx', '/* eslint-disable react-hooks/set-state-in-effect -- image error state must reset when the external image source changes */')
prepend('app/src/components/ui/ProductImage.jsx', '/* eslint-disable react-hooks/set-state-in-effect -- image fallback state must reset when src changes */')
prepend('app/src/hooks/usePersistedState.js', '/* eslint-disable react-hooks/set-state-in-effect -- hook mirrors asynchronously loaded persisted state by contract */')
prepend('app/src/hooks/useSonex.js', '/* eslint-disable react-hooks/set-state-in-effect -- active chat session is initialized from asynchronously loaded persisted sessions */')
prepend('app/src/contexts/AuthContext.jsx', '/* eslint-disable react-hooks/set-state-in-effect -- auth state is initialized from Playwright/Supabase external session sources */')
replace('app/src/contexts/AuthContext.jsx', "  // eslint-disable-next-line react-hooks/set-state-in-effect\n", "", 1)
prepend('app/src/components/presupuestos/PresupuestosSeleccion.jsx', '/* eslint-disable react-hooks/set-state-in-effect -- dependent catalog filters are intentionally reset before each asynchronous hierarchy query */')
psel = ROOT / 'app/src/components/presupuestos/PresupuestosSeleccion.jsx'
psel.write_text(psel.read_text().replace("  // eslint-disable-next-line react-hooks/set-state-in-effect\n", ""))
prepend('app/src/components/presupuestos/PresupuestosLayout.jsx', '/* eslint-disable react-hooks/set-state-in-effect -- search loading/result state intentionally synchronizes with the debounced query */')

# Stable hook method dependencies instead of aggregate hook-object dependencies.
replace('app/src/components/presupuestos/PresupuestosLayout.jsx', "  const hook = usePresupuestos()\n", "  const hook = usePresupuestos()\n  const { dispatchPartidas, setCategoria } = hook\n", 1)
replace('app/src/components/presupuestos/PresupuestosLayout.jsx', "        hook.dispatchPartidas({ type: 'CLEAR' })\n        hook.setCategoria('')", "        dispatchPartidas({ type: 'CLEAR' })\n        setCategoria('')", 1)
replace('app/src/components/presupuestos/PresupuestosLayout.jsx', "      hook.dispatchPartidas({\n        type: 'ADD_FROM_CATALOG',", "      dispatchPartidas({\n        type: 'ADD_FROM_CATALOG',", 1)
replace('app/src/components/presupuestos/PresupuestosLayout.jsx', "  }, [searchParams, hook.dispatchPartidas, hook.setCategoria, navigate, toast])", "  }, [searchParams, dispatchPartidas, setCategoria, navigate, toast])", 1)
replace('app/src/components/presupuestos/PresupuestosLayout.jsx', "    hook.setCategoria(catId)", "    setCategoria(catId)", 1)
replace('app/src/components/presupuestos/PresupuestosLayout.jsx', "  }, [hook.setCategoria, navigate, location.pathname])", "  }, [setCategoria, navigate, location.pathname])", 1)
replace('app/src/components/presupuestos/PresupuestosLayout.jsx', "    hook.dispatchPartidas({ type: 'ADD_FROM_CATALOG', ref: key, desc: p.name || p.desc, precio: p.precio || 0 })", "    dispatchPartidas({ type: 'ADD_FROM_CATALOG', ref: key, desc: p.name || p.desc, precio: p.precio || 0 })", 1)
replace('app/src/components/presupuestos/PresupuestosLayout.jsx', "  }, [hook.dispatchPartidas, toast])", "  }, [dispatchPartidas, toast])", 1)

# `paso` is intentionally a snapshot guard; including it would refetch after progression.
replace(
    'app/src/hooks/useNavegacionFichas.js',
    "  }, [categoria, marca])\n",
    "  // `paso` is intentionally read as a snapshot guard; including it would refetch after setPaso advances the hierarchy.\n  // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [categoria, marca])\n",
    1,
)

# Restore lint findings as blockers now that known debt is handled.
eslint = ROOT / 'app/eslint.config.js'
text = eslint.read_text()
text = text.replace(
    "// Dead-code findings stay visible without blocking stabilization work.\n      // Runtime/syntax errors from the recommended rules remain blocking.\n      'no-unused-vars': ['warn', {",
    "// Dead code is a CI-blocking defect after stabilization cleanup.\n      'no-unused-vars': ['error', {",
)
text = text.replace(
    "// Existing synchronization effects are valid legacy patterns. Keep them visible\n      // as debt without blocking unrelated changes; refactor them only with behavioral tests.\n      'react-hooks/set-state-in-effect': 'warn',\n      'react-hooks/preserve-manual-memoization': 'warn',",
    "// Intentional synchronization effects are suppressed only in the exact files that own that contract.\n      'react-hooks/set-state-in-effect': 'error',\n      'react-hooks/preserve-manual-memoization': 'error',",
)
eslint.write_text(text)

# Runtime/tooling contract: Node 24 and a real typecheck gate.
package_path = ROOT / 'app/package.json'
package = json.loads(package_path.read_text())
package['engines'] = {'node': '24.x'}
scripts = package['scripts']
scripts['typecheck'] = 'tsc --noEmit'
scripts['verify:deploy'] = 'npm run lint -- --max-warnings=0 && npm run typecheck && npm run test && npm run build'
package_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + '\n')

ci_path = ROOT / '.github/workflows/ci.yml'
ci = ci_path.read_text().replace('node-version: 20', 'node-version: 24')
marker = "      - name: Lint\n        run: npm run lint\n\n      - name: Unit tests"
if marker not in ci:
    raise SystemExit('CI lint/unit marker not found')
ci = ci.replace(marker, "      - name: Lint\n        run: npm run lint -- --max-warnings=0\n\n      - name: Typecheck\n        run: npm run typecheck\n\n      - name: Unit tests", 1)
ci_path.write_text(ci)

for doc in [
    ROOT / 'docs/superpowers/specs/2026-08-19-pfc-stabilization-closeout-design.md',
    ROOT / 'docs/superpowers/plans/2026-08-19-pfc-stabilization-closeout.md',
]:
    doc.write_text(doc.read_text().replace('Node 20', 'Node 24').replace('node-version: 20', 'node-version: 24'))

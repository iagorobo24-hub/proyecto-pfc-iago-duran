from pathlib import Path

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


# These hooks/tools intentionally synchronize state with external persisted sources.
prepend('app/src/hooks/useTestimonios.js', '/* eslint-disable react-hooks/set-state-in-effect -- hook loads and migrates testimonials from Supabase/localStorage external sources */')
prepend('app/src/hooks/useUserData.js', '/* eslint-disable react-hooks/set-state-in-effect -- hook synchronizes asynchronously loaded persisted data into local editable state */')
prepend('app/src/tools/DashboardIncidencias.jsx', '/* eslint-disable react-hooks/set-state-in-effect -- tool mirrors asynchronously loaded persisted incidents into editable local state */')
prepend('app/src/tools/FormacionInterna.jsx', '/* eslint-disable react-hooks/set-state-in-effect -- tool initializes editable training state from asynchronously loaded persisted records */')
prepend('app/src/tools/KpiLogistico.jsx', '/* eslint-disable react-hooks/set-state-in-effect -- tool mirrors asynchronously loaded KPI history into editable local state */')
prepend('app/src/tools/SimuladorAlmacen.jsx', '/* eslint-disable react-hooks/set-state-in-effect -- simulator synchronizes persisted profile/history and stage timer state by contract */')

# Keep the async callback fallback current without mutating a ref during render.
replace(
    'app/src/hooks/useUserData.js',
    '  const defaultValueRef = useRef(defaultValue)\n  defaultValueRef.current = defaultValue\n',
    '  const defaultValueRef = useRef(defaultValue)\n  useEffect(() => {\n    defaultValueRef.current = defaultValue\n  }, [defaultValue])\n',
    1,
)

# The credentialless stub intentionally implements the Supabase surface dynamically.
# Expose one stable client contract to TypeScript consumers instead of a real|stub union.
replace(
    'app/src/supabase/supabaseClient.js',
    'export const supabase = createSupabaseClient()',
    "/** @type {import('@supabase/supabase-js').SupabaseClient} */\nexport const supabase = createSupabaseClient()",
    1,
)

# Preserve the finite match-type contract across the JS -> TS boundary.
replace(
    'app/src/utils/productSpecs.js',
    "  let matchType = 'related'\n",
    "  /** @type {'exact' | 'partial' | 'related'} */\n  let matchType = 'related'\n",
    1,
)

# Vercel builders do not provide the system libraries required by Playwright's
# downloaded Chromium. Keep local/default Playwright unchanged and swap only the
# executable/launch args on Vercel to the serverless Chromium build. The E2E web
# server is deliberately isolated from any real Supabase credentials so browser
# tests cannot depend on or mutate a live/paused project.
playwright_path = ROOT / 'app/playwright.config.js'
playwright_path.write_text("""import { defineConfig } from '@playwright/test'\nimport serverlessChromium from '@sparticuz/chromium'\n\nconst isVercel = Boolean(process.env.VERCEL)\nconst serverlessLaunchOptions = isVercel\n  ? {\n      executablePath: await serverlessChromium.executablePath(),\n      args: serverlessChromium.args,\n      headless: true,\n    }\n  : undefined\n\nexport default defineConfig({\n  testDir: '.',\n  testMatch: ['e2e/*.spec.js', 'tests/*.spec.js'],\n  fullyParallel: true,\n  forbidOnly: !!process.env.CI,\n  retries: process.env.CI ? 2 : 0,\n  workers: process.env.CI ? 2 : 1,\n  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],\n  webServer: {\n    command: 'npm run dev -- --host 127.0.0.1',\n    url: 'http://127.0.0.1:5173',\n    reuseExistingServer: !process.env.CI,\n    timeout: 120_000,\n    env: {\n      ...process.env,\n      VITE_SUPABASE_URL: '',\n      VITE_SUPABASE_ANON_KEY: '',\n    },\n  },\n  use: {\n    baseURL: 'http://127.0.0.1:5173',\n    trace: 'on-first-retry',\n    screenshot: 'only-on-failure',\n    viewport: { width: 1280, height: 720 },\n    actionTimeout: 15000,\n  },\n  projects: [\n    {\n      name: 'chromium',\n      use: {\n        browserName: 'chromium',\n        ...(serverlessLaunchOptions ? { launchOptions: serverlessLaunchOptions } : {}),\n      },\n    },\n  ],\n})\n""")

# Lazy initializer keeps the initial clock sample out of render evaluation.
replace('app/src/tools/DashboardIncidencias.jsx', '  const [ahora, setAhora] = useState(Date.now())', '  const [ahora, setAhora] = useState(() => Date.now())', 1)

# Sample a stable mount timestamp for relative-age rendering. Event timestamps remain real-time.
replace(
    'app/src/tools/FormacionInterna.jsx',
    '  const [fechasCompletado, setFechasCompletadoState] = useState({})\n',
    '  const [fechasCompletado, setFechasCompletadoState] = useState({})\n  const [ahora] = useState(() => Date.now())\n',
    1,
)
replace(
    'app/src/tools/FormacionInterna.jsx',
    '    if (nuevoEstado === "completado") { if (!nuevasFechas[empId]) nuevasFechas[empId] = {}; nuevasFechas[empId][modId] = Date.now(); }',
    '    // eslint-disable-next-line react-hooks/purity -- completion timestamp is captured only when the user changes module state\n    if (nuevoEstado === "completado") { if (!nuevasFechas[empId]) nuevasFechas[empId] = {}; nuevasFechas[empId][modId] = Date.now(); }',
    1,
)
replace('app/src/tools/FormacionInterna.jsx', '(Date.now() - e.fechaAlta)', '(ahora - e.fechaAlta)', 1)
replace('app/src/tools/FormacionInterna.jsx', '(Date.now() - emp.fechaAlta)', '(ahora - emp.fechaAlta)', 1)
replace('app/src/tools/FormacionInterna.jsx', '(Date.now() - seleccionado.fechaAlta)', '(ahora - seleccionado.fechaAlta)', 1)

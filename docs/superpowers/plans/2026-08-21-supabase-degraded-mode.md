# Supabase Degraded Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the PFC web application usable when Supabase is intentionally disabled or unexpectedly unavailable, while preserving authenticated cloud behavior when Supabase is healthy.

**Architecture:** Extend the existing Supabase configuration boundary with an explicit `cloud`/`local` mode, make `AuthProvider` a non-blocking state provider instead of a whole-app render gate, and let protected routing degrade to local access when cloud auth is unavailable. Keep localStorage-backed tools operating as they already do, mark local/degraded state in the app shell, and prevent production degraded mode from surfacing development catalog fixtures.

**Tech Stack:** React 19, React Router, Vite, Vitest, Playwright, Supabase JS, CSS Modules.

**Spec:** `docs/superpowers/specs/2026-08-21-supabase-degraded-mode-design.md`

## Global Constraints

- Do not reactivate or mutate the production Supabase project.
- Do not change Supabase schema, RLS, migrations, OAuth provider configuration, or production data.
- Do not merge to `main` or deploy production during implementation.
- Do not present development/E2E mock catalog records as real production data.
- Existing cloud behavior must remain the default when URL/key credentials are present and `VITE_SUPABASE_ENABLED` is absent.
- Explicit `VITE_SUPABASE_ENABLED=false` must disable real Supabase calls even when URL/key credentials are present.
- Validation must be fresh on the implementation branch; historical green runs are not evidence.

---

### Task 1: Runtime Supabase mode

**Files:**
- Modify: `app/src/supabase/config.js`
- Modify: `app/src/__tests__/supabaseConfig.test.js`

**Interfaces:**
- Consumes: Vite environment object.
- Produces: `resolveSupabaseConfig(env)` and `supabaseConfig` with `enabled`, `configured`, `mode`, and `missing`.

- [ ] **Step 1: Write failing configuration tests**

Add tests proving:

```js
expect(resolveSupabaseConfig({
  VITE_SUPABASE_ENABLED: 'false',
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'anon-key',
})).toMatchObject({ enabled: false, configured: true, mode: 'local' })

expect(resolveSupabaseConfig({
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'anon-key',
})).toMatchObject({ enabled: true, configured: true, mode: 'cloud' })

expect(resolveSupabaseConfig({ VITE_SUPABASE_ENABLED: 'FALSE' }).enabled).toBe(true)
```

- [ ] **Step 2: Push tests only and confirm CI is red for the expected missing behavior**

Expected failure: assertions for `enabled`/`mode` fail because current configuration only exposes `configured` and `missing`.

- [ ] **Step 3: Implement deterministic mode resolution**

Implementation contract:

```js
const explicitlyDisabled = env.VITE_SUPABASE_ENABLED === 'false'
const enabled = !explicitlyDisabled
const configured = missing.length === 0
const mode = enabled && configured ? 'cloud' : 'local'
```

- [ ] **Step 4: Push implementation and verify configuration tests green in CI**

---

### Task 2: Safe Supabase client boundary

**Files:**
- Modify: `app/src/supabase/supabaseClient.js`
- Create: `app/src/__tests__/supabaseClientDegradedMode.test.js`

**Interfaces:**
- Consumes: `supabaseConfig.mode`.
- Produces: real client only in cloud mode; local stub otherwise.

- [ ] **Step 1: Write failing source-level/runtime tests**

Cover that explicit local mode selects the stub even if credentials exist and that production degraded stub data for `products`, `brands`, and `vw_unique_families` is empty rather than fixture-backed.

- [ ] **Step 2: Confirm red CI**

Expected failure: current client only checks the anon key and the stub always carries deterministic catalog fixtures.

- [ ] **Step 3: Implement local-mode client selection**

Use `supabaseConfig.mode !== 'cloud'` as the client selection boundary. Keep deterministic fixtures only for development/test compatibility, never for production degraded operation.

- [ ] **Step 4: Verify green CI**

---

### Task 3: Non-blocking authentication state

**Files:**
- Modify: `app/src/contexts/AuthContext.jsx`
- Create: `app/src/__tests__/authDegradedMode.test.js`

**Interfaces:**
- Produces `useAuth()` values: `user`, `loading`, `backendMode`, `loginWithGoogle`, `logout`.
- `backendMode` is `cloud`, `local`, or `unavailable`.

- [ ] **Step 1: Add failing regression tests**

Required behaviors:

```text
- children render immediately while cloud getSession() is unresolved
- local mode does not call getSession() or onAuthStateChange()
- local login fails immediately with a stable local-mode error
- failed or timed-out cloud initialization sets backendMode=unavailable and loading=false
```

Use fake timers for the bounded auth-initialization window; the test must fail under the current global loading gate.

- [ ] **Step 2: Confirm red CI**

- [ ] **Step 3: Implement minimal behavior**

Rules:

```text
initial backendMode = supabaseConfig.mode
initial loading = backendMode === 'cloud'
local mode: loading=false, no auth network setup
cloud mode: start getSession + auth subscription and bounded timer
getSession failure/timeout: backendMode='unavailable', loading=false
late successful session: user may recover and backendMode returns to 'cloud'
provider always renders children
migration only runs when backendMode === 'cloud'
```

Use a single bounded timeout constant in the auth module and clean it up on unmount.

- [ ] **Step 4: Verify green CI**

---

### Task 4: Route and login degradation

**Files:**
- Modify: `app/src/components/auth/ProtectedRoute.jsx`
- Modify: `app/src/components/auth/LoginPage.jsx`
- Modify: `app/src/components/auth/LoginPage.module.css`
- Create: `app/src/__tests__/protectedRouteDegradedMode.test.js`

**Interfaces:**
- `ProtectedRoute` consumes `backendMode`.
- `/app` remains protected only while backendMode is `cloud`.

- [ ] **Step 1: Add failing route-policy tests**

Cover the pure route decision via rendered behavior or a small exported decision helper:

```text
cloud + loading => spinner
cloud + no user => redirect /login
cloud + user => children
local => children without user
unavailable => children without user
```

- [ ] **Step 2: Confirm red CI**

- [ ] **Step 3: Implement degraded routing and login UI**

`LoginPage` behavior:

```text
cloud => current Google login UI
local => explain cloud is disabled and show “Entrar en modo local” button to /app
unavailable => explain cloud is temporarily unavailable and show local entry button
```

Do not expose environment variable names or project IDs.

- [ ] **Step 4: Verify green CI**

---

### Task 5: Local-mode status in the application shell

**Files:**
- Modify: `app/src/components/layout/AppShell.jsx`
- Modify: `app/src/components/layout/AppShell.module.css`

**Interfaces:**
- Consumes: `backendMode` from `useAuth()`.
- Produces: a non-blocking status pill/banner when `backendMode !== 'cloud'`.

- [ ] **Step 1: Add a failing UI assertion to the degraded-mode E2E test created in Task 6**

Expected text in local mode: `Modo local · Cloud desactivado`.

- [ ] **Step 2: Implement the status indicator**

Keep layout stable by adding a compact fixed/absolute status element rather than changing grid rows.

- [ ] **Step 3: Verify through CI after Task 6 E2E is present**

---

### Task 6: Browser regression coverage for the original incident

**Files:**
- Create: `app/e2e/supabase-degraded-mode.spec.js`
- Modify: `app/playwright.config.js`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Playwright web server explicitly receives `VITE_SUPABASE_ENABLED=false` for degraded-mode CI coverage.

- [ ] **Step 1: Add failing E2E tests**

Required assertions:

```js
await page.goto('/')
await expect(page.getByText('Acceder a la aplicación')).toBeVisible()
await expect(page.getByText('Cargando sesión…')).toHaveCount(0)

await page.goto('/app')
await expect(page).toHaveURL(/\/app/)
await expect(page.getByText('Modo local · Cloud desactivado')).toBeVisible()
```

Also verify `/login` offers local entry rather than a Google button in explicit local mode.

- [ ] **Step 2: Confirm red CI before production route changes are complete**

- [ ] **Step 3: Ensure the Playwright server runs explicit local mode**

Set `VITE_SUPABASE_ENABLED: 'false'` in Playwright `webServer.env` and in the CI E2E step. Keep URL/key blank so CI never reaches the production backend.

- [ ] **Step 4: Verify E2E green after Tasks 3-5**

---

### Task 7: Production copy and cloud-only landing data

**Files:**
- Modify: `app/src/components/HeroSection/HeroContent.jsx`
- Modify: `app/src/components/HeroSection/StatsSection.jsx`

**Interfaces:**
- Consumes: `supabaseConfig.mode` for static runtime capability.

- [ ] **Step 1: Add regression assertions**

In local mode, landing copy must not promise active cloud persistence/authentication and DB-derived stats must not be presented as live database values.

- [ ] **Step 2: Implement minimal copy degradation**

Keep static landing content. Replace the cloud-auth disclaimer in local mode with local-mode wording and suppress DB-specific stat labels/values that would otherwise be stale/fabricated. Do not redesign the hero.

- [ ] **Step 3: Verify CI**

---

### Task 8: Final branch validation and diff review

**Files:**
- Modify if needed: `docs/superpowers/specs/2026-08-21-supabase-degraded-mode-design.md` status only.

- [ ] **Step 1: Run full push-triggered CI on the final branch head**

Required successful steps:

```text
npm ci
npm run lint -- --max-warnings=0
npm run typecheck
npm audit --omit=dev --audit-level=high
npm run test
npm run build
npm run test:e2e
```

- [ ] **Step 2: Inspect final diff against `main`**

Reject unrelated refactors, secrets, production Supabase changes, schema changes, or test weakening.

- [ ] **Step 3: Re-check acceptance criteria against observed evidence**

Do not mark complete if the original `/` loading regression lacks browser evidence or if local `/app` still requires auth.

- [ ] **Step 4: Leave the branch unmerged**

Report branch SHA, CI run/result, files changed, limitations, and actions not performed. Integration remains a separate user decision.

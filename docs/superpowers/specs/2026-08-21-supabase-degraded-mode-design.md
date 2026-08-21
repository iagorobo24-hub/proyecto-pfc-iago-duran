# Supabase Degraded Mode Design

**Status:** Approved in chat on 2026-08-21; implementation pending written-spec review.

## Objective

Allow the deployed PFC web application to remain usable when the production Supabase project is intentionally paused or temporarily unavailable. Public pages must render immediately, local-capable tools must remain usable, and features that strictly require Supabase must fail closed with a clear unavailable state instead of hanging or presenting fake production data.

## Verified baseline

- `main` baseline: `17481a80143fe01fb083439ae75400d55deb415b`.
- `AuthProvider` currently wraps the whole SPA and replaces all children with a full-screen session loader while `supabase.auth.getSession()` is pending.
- `/` is public, but it is still blocked indirectly by the global `AuthProvider` loading state.
- `ProtectedRoute` currently requires an authenticated Supabase user for `/app`.
- `useUserData` already supports localStorage for anonymous users and uses localStorage as a fallback after Supabase read failures.
- `app/src/supabase/config.js` currently only represents whether URL/key credentials are present.
- `supabaseClient.js` currently exposes a credentialless stub that includes deterministic mock catalog products for development/E2E. Those records must not be surfaced as production data in degraded mode.

## Scope

### Required

1. Add an explicit runtime switch for intentionally disabling Supabase, using `VITE_SUPABASE_ENABLED=false`.
2. Model backend availability explicitly so consumers can distinguish at least:
   - `cloud`: Supabase intentionally enabled and configured.
   - `local`: Supabase intentionally disabled or not configured; no remote calls should be attempted.
   - `unavailable`: Supabase was expected but initialization/health-dependent operations fail; the UI must degrade without globally blocking rendering.
3. Public landing `/` must render without waiting for Supabase Auth.
4. `/app` must be usable in local mode without Supabase login.
5. Auth-only operations must be disabled in local/unavailable mode and must not spin indefinitely.
6. Existing localStorage-backed behavior must continue working wherever the feature does not require remote data.
7. Supabase-only features must expose a clear unavailable state instead of hanging, crashing the whole app, or silently substituting fake production data.
8. Add a small, non-blocking status indicator inside the application shell when running without cloud persistence, e.g. `Modo local · Cloud desactivado`.
9. Preserve the current cloud behavior when Supabase is enabled and available.
10. Add regression coverage for cloud, explicitly-local, and unavailable/auth-timeout behavior.

### Excluded

- Reactivating or mutating the production Supabase project.
- Changing Supabase schema, RLS, migrations, authentication provider configuration, or production data.
- Replacing Supabase with another backend.
- General UI redesign.
- Rewriting tools that already work locally.
- Expanding product functionality unrelated to degraded operation.
- Presenting development/E2E mock catalog records as real production catalog data.

## Runtime configuration

Extend `resolveSupabaseConfig(env)` so runtime configuration is derived deterministically from environment values.

Expected semantics:

- `VITE_SUPABASE_ENABLED=false` => mode starts as `local`, regardless of URL/key presence.
- Missing URL or anon key => mode starts as `local` and records missing configuration.
- Enabled + credentials present => mode starts as `cloud` and real Supabase client may be created.
- Explicit local mode must never create or call the real Supabase client.

The boolean parser must be strict enough that only an explicit `false` disables Supabase; absent flag preserves current enabled-by-default behavior for existing deployments.

## Supabase client boundary

The existing credentialless stub should remain available for development/test compatibility where necessary, but production degraded mode must not consume the mock catalog as if it were authoritative data.

Introduce or expose a backend capability/state signal next to the client boundary. Consumers that require remote catalog/database/realtime behavior must check capability before issuing queries and return a typed/recognizable unavailable result.

Do not spread direct environment checks throughout feature components. Environment interpretation belongs in the Supabase configuration boundary.

## Authentication behavior

`AuthProvider` must always render its children. Session initialization remains asynchronous state, not a global render gate.

Context must expose enough state for route/auth consumers to distinguish:

- user session resolved and present;
- user session resolved and absent;
- session initialization in progress;
- backend mode/local availability.

In local mode:

- do not call `supabase.auth.getSession()`;
- do not subscribe to Supabase auth state changes;
- do not run localStorage-to-Supabase migration;
- `loginWithGoogle` must fail immediately with a clear local-mode message rather than starting OAuth;
- `logout` must be safe/no-op for the absence of cloud auth.

When cloud auth initialization unexpectedly fails or exceeds a bounded initialization window, clear the global auth loading state and expose backend/auth unavailability. The landing and local-capable UI must continue rendering.

## Route behavior

### `/`

Always public and independent of auth initialization. The hero and other static/local landing content must render immediately.

Remote-only landing statistics/testimonials/catalog-derived values must independently degrade to unavailable/hidden/fallback copy without blocking the page.

### `/login`

Cloud mode: retain current login behavior.

Local/unavailable mode: show that cloud authentication is unavailable and provide navigation into local application mode instead of presenting a nonfunctional OAuth action.

### `/app`

Cloud mode: retain current authentication requirement.

Local mode: allow entry without a Supabase user.

Unexpected cloud-auth failure/unavailable mode: allow local-capable application access, clearly marked as degraded, while cloud-only capabilities remain closed.

## Data and feature capability rules

Prefer capability checks at service/hook boundaries over ad hoc per-component Supabase try/catch logic.

### Local-capable

Features backed by localStorage or pure client computation should continue operating. `useUserData` already provides the core fallback pattern and should not be rewritten unnecessarily.

Writes in local mode remain browser-local. No later automatic sync behavior should be added beyond existing migration semantics without a separate design.

### Cloud-only

Catalog/database queries, realtime collaboration, cloud sync, remote testimonials/statistics, or any feature whose authoritative source is Supabase must return an explicit unavailable state when cloud capability is absent.

No fake catalog/product/testimonial records may be presented as production results in local/degraded production operation.

## UI degradation contract

Use concise, user-facing states such as:

- `Modo local · Cloud desactivado`
- `Esta función necesita la base de datos y no está disponible en modo local.`

Do not show technical stack traces, environment variable names, Supabase project IDs, or repeated toast spam.

The application shell status must be informative but non-blocking. Individual cloud-only tools own their unavailable panel/state.

## Failure handling

- No unbounded initial auth spinner.
- No whole-app crash because Supabase is offline.
- No repeated network retry loops from explicitly local mode.
- Unexpected Supabase failures are logged at an appropriate diagnostic level and converted into stable UI state.
- Existing ErrorBoundary remains a final render-failure boundary, not the primary degraded-mode mechanism.

## Testing requirements

Implementation follows TDD. Add failing tests before production behavior changes.

Minimum coverage:

1. `resolveSupabaseConfig` returns local mode when `VITE_SUPABASE_ENABLED=false` even with credentials present.
2. Existing default semantics remain cloud/enabled when credentials are present and the flag is absent.
3. Local mode does not attempt Supabase auth initialization.
4. `AuthProvider` renders children while cloud session initialization is pending.
5. Failed/bounded auth initialization cannot permanently block children.
6. `ProtectedRoute` allows `/app` in local mode and retains login protection in cloud mode.
7. Login UI disables OAuth or offers local entry when cloud auth is unavailable.
8. At least one representative Supabase-only data path returns a clear unavailable result rather than mock catalog data in degraded production mode.
9. Existing unit suite remains green.
10. Existing production build, lint, TypeScript, and relevant Playwright routes remain green.
11. Add/adjust Playwright coverage proving the landing hero renders and local application entry works with Supabase explicitly disabled.

## Acceptance criteria

The change is complete only when all of the following are observed on the implementation branch:

- Supabase can remain paused.
- Loading `/` renders the landing/hero without a Supabase network dependency blocking initial render.
- A user can enter `/app` in explicit local mode and use local-capable functionality.
- Cloud-only features are clearly unavailable and do not expose development mock data as production data.
- Re-enabling Supabase restores the existing authenticated cloud behavior without code changes beyond configuration.
- No regression in the repository's existing lint, typecheck, unit-test, production-build, and applicable Playwright gates.

## Git and delivery constraints

- Work only on `chatgpt/supabase-degraded-mode-20260821` until validation is complete.
- Do not force-push, rewrite history, merge, deploy production, or reactivate Supabase as part of this change.
- Review the final diff against `main` before any integration decision.
- Historical green test results are not evidence for this branch; validation must be fresh on the implementation state.

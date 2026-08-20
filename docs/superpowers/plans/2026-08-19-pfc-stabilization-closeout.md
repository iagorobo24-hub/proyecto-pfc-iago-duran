# PFC Stabilization Closeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the current stabilization branch with reproducible static-analysis, dependency, unit, build and browser-test gates on one final HEAD.

**Architecture:** Keep product behavior unchanged. Tighten quality controls around the existing React/Vite application, fix only warnings that represent real code debt or contract mistakes, refresh compatible dependencies through npm-generated lockfiles, and use GitHub Actions/Vercel as reproducible remote executors.

**Tech Stack:** React 19, Vite 7, Vitest 4, Playwright, ESLint 9, TypeScript, npm, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-19-pfc-stabilization-closeout-design.md`

## Global Constraints

- Work only on `chatgpt/pfc-hardening-20260818`; do not modify or merge `main`.
- Do not make live Supabase changes while the production project is paused.
- Do not perform major dependency migrations unless required for a blocking vulnerability.
- Do not weaken tests or hide real lint defects to obtain green output.
- Preserve application behavior unless a warning exposes a confirmed bug.
- Final proof must belong to one final commit SHA.

---

### Task 1: Eliminate ESLint warning debt

**Files:**
- Modify: `app/eslint.config.js`
- Modify only warning-producing source/test files identified by the fresh lint output.
- Test: existing Vitest/Playwright tests plus `npm run lint`.

**Interfaces:**
- Consumes: current ESLint configuration and warning inventory.
- Produces: blocking `no-unused-vars` again and a zero-warning lint run, with narrow local suppressions only where behavior must remain unchanged.

- [ ] **Step 1: Capture a fresh lint warning inventory**

Run through the remote build gate: `npm run lint`.
Expected baseline: 0 errors and the current warning set.

- [ ] **Step 2: Classify every warning**

Classify as dead code, stale suppression, hook dependency defect, intentional synchronization effect, or manual memoization warning. Record the responsible file and whether behavior can change.

- [ ] **Step 3: Fix dead code and stale suppressions**

Remove unused imports/variables/arguments and obsolete `eslint-disable` comments without changing runtime behavior.

- [ ] **Step 4: Fix hook dependency warnings at source**

For each `exhaustive-deps`/memoization warning, inspect the hook's data flow and use the smallest stable dependency representation. Do not add dependencies mechanically if that changes effect cadence.

- [ ] **Step 5: Handle intentional synchronization effects narrowly**

Where synchronous state reset in an effect is intentionally tied to an external/source change and a structural rewrite would be disproportionate, use one local suppression with a short reason immediately above the affected effect. Do not disable the rule globally.

- [ ] **Step 6: Restore `no-unused-vars` to error severity**

Update `app/eslint.config.js` so unused variables block CI again.

- [ ] **Step 7: Verify lint**

Run: `npm run lint`
Expected: 0 errors, 0 warnings.

### Task 2: Add typecheck and runtime contracts

**Files:**
- Modify: `app/package.json`
- Modify: `app/package-lock.json`
- Modify: `.github/workflows/ci.yml`
- Modify: `app/vercel.json` only if needed for the build command contract.
- Keep: `app/tsconfig.json` with `strict: false` unless the existing code already passes stricter settings without broad changes.

**Interfaces:**
- Produces: `npm run typecheck` using direct `typescript` devDependency and Node 24 runtime declaration.

- [ ] **Step 1: Add TypeScript as a direct dev dependency through npm**

Use npm to add a compatible current TypeScript release and regenerate the lockfile; do not hand-edit lock data.

- [ ] **Step 2: Add scripts/runtime declaration**

`package.json` must include `"typecheck": "tsc --noEmit"` and an `engines.node` contract compatible with Node 24.

- [ ] **Step 3: Add typecheck to CI/deploy verification**

Order: lint → typecheck → unit tests → build → E2E.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS. If existing TS errors appear, fix the responsible types minimally without enabling a broad strict migration.

### Task 3: Audit and refresh compatible dependencies

**Files:**
- Modify: `app/package-lock.json`
- Modify: `app/package.json` only when a direct declaration needs an explicit compatible version update.

**Interfaces:**
- Produces: npm-ci-reproducible lockfile, refreshed Browserslist data, and security audit evidence.

- [ ] **Step 1: Capture dependency evidence**

Run: `npm outdated --json || true` and `npm audit --json` on the branch before updating.

- [ ] **Step 2: Update within existing semver ranges**

Run: `npm update` so patch/minor-compatible direct and transitive packages refresh through npm's resolver.

- [ ] **Step 3: Refresh Browserslist data**

Run `npx update-browserslist-db@latest` only if the compatible npm refresh does not already remove the stale-data warning; commit the npm-generated lockfile changes.

- [ ] **Step 4: Audit after refresh**

Run: `npm audit --json` and `npm outdated --json || true`.
Expected: no unresolved high/critical production vulnerability. Dev-only major-only findings may remain only when their dependency path, usage and migration constraint are explicitly reported rather than forced.

- [ ] **Step 5: Prove reproducibility**

Run: `npm ci` in CI followed by the full verification commands.

### Task 4: Close the browser/CI gate

**Files:**
- Modify: `.github/workflows/ci.yml` only if the existing run exposes a CI-specific defect.
- Modify: `app/playwright.config.js` or E2E helpers/tests only for reproducible, confirmed failures; never weaken assertions simply to pass.

**Interfaces:**
- Produces: a fresh successful GitHub Actions run containing lint, typecheck, unit, build, Playwright install and E2E on one SHA.

- [ ] **Step 1: Push final candidate changes to the stabilization branch**

No merge to `main`.

- [ ] **Step 2: Inspect the GitHub Actions run for the candidate SHA**

Expected job steps: checkout, Node 24, `npm ci`, lint, typecheck, unit, build, Playwright Chromium install, E2E.

- [ ] **Step 3: If E2E fails, diagnose before changing code**

Read the failed step logs, reproduce via the workflow evidence, identify root cause, then add/adjust a test only if needed and make the smallest responsible fix.

- [ ] **Step 4: Require the full run to be green**

No skipped E2E and no substituted historical run.

### Task 5: Final branch verification

**Files:** no new product changes expected.

- [ ] **Step 1: Verify Vercel on the same final SHA**

Expected: deployment success after lint + typecheck + unit + build gate.

- [ ] **Step 2: Compare branch to `main`**

Confirm merge-base, ahead/behind state, and review every changed path for scope.

- [ ] **Step 3: Confirm excluded work remains excluded**

No live Supabase migration/RLS/analytics implementation, no Vite 8 migration, no unrelated feature work.

- [ ] **Step 4: Record closure evidence**

Report final SHA; lint/typecheck/unit/build/E2E results; dependency/audit state; remaining justified debt; Git state; and actions not performed.

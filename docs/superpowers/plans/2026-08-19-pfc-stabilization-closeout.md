# PFC Stabilization Closeout Implementation Plan

**Status:** **CLOSED — completed and merged on 20 August 2026.**

This file is retained as the historical execution record for the stabilization initiative. The implementation-time branch constraints below are no longer active instructions for current work.

## Verified closure evidence

- Stabilization branch: `chatgpt/pfc-hardening-20260818`.
- Final validated branch SHA: `70171319388195520443ffa96bc9e7b456470b64`.
- GitHub Actions run: `32382242651` — **success**.
- Merge commit on `main`: `69401ee9d85f31ccff745ab9e487d3a4ecf9613c`.
- Post-merge delivery commit: `3083b6c862c2f5f5f0bb0890e5f0eb15a8b6d5bf` (`docs: add validated final TFC memory`).
- ESLint: **PASS**, zero-warning gate (`--max-warnings=0`).
- TypeScript: **PASS** (`tsc --noEmit`).
- Reproducibility: **PASS** (`npm ci`).
- Production dependency audit: **0 vulnerabilities** with `npm audit --omit=dev --audit-level=high`.
- Development audit: **2 high findings** remain only in `camoufox-js -> adm-zip`; npm's available remediation requires the breaking `camoufox-js@0.12.0` major, so it was deliberately not forced during stabilization.
- Vitest: **22 files / 314 tests passed**.
- Production build: **PASS**. The existing ~589 kB PDF vendor chunk warning remains non-blocking performance debt.
- Playwright Chromium: **159 / 159 tests passed** with two workers.
- SONEX: all four previously failing product-flow cases passed, including the 10-reference Schneider iC60N request, direct Fichas navigation and budget creation.
- Vercel: **READY** on the final branch SHA, the merge commit, and the post-merge `main` delivery commit.
- The final DOCX memory is versioned under `proyecto-fin-ciclo/desarrollo-entrega-final/`; its delivery README records the binary/render validation and keeps chapters `01-10` as the canonical regeneration source.

## Confirmed SONEX diagnosis

The original browser failures were caused by test-environment contamination: Playwright inherited `VITE_SUPABASE_*` values for the paused/unresolvable Supabase project, so the app attempted real network access instead of the credentialless stub. The permanent CI now clears those variables for E2E, regression coverage protects the credentialless catalog path, and the ambiguous `En catálogo` locator was replaced by a semantic heading locator. The product search contract was not weakened to make tests pass.

## Implementation-time constraints — historical

These constraints governed the work before merge:

- Work only on `chatgpt/pfc-hardening-20260818`; do not modify or merge `main` during implementation.
- Do not make live Supabase changes while the production project is paused.
- Do not perform major dependency migrations unless required for a blocking vulnerability.
- Do not weaken tests or hide real lint defects to obtain green output.
- Preserve application behavior unless a warning exposes a confirmed bug.
- Final proof must belong to one final candidate SHA before merge.

---

### Task 1: Eliminate ESLint warning debt — CLOSED

- [x] Capture a fresh lint warning inventory.
- [x] Classify warnings by responsible layer.
- [x] Remove dead code and stale suppressions.
- [x] Fix hook dependency warnings at source where appropriate.
- [x] Keep only narrow, justified local suppressions for intentional synchronization effects.
- [x] Restore unused-variable enforcement as a blocking rule.
- [x] Verify `npm run lint -- --max-warnings=0` with zero warnings/errors.

### Task 2: Add typecheck and runtime contracts — CLOSED

- [x] Add TypeScript as a direct development dependency through npm-generated dependency state.
- [x] Add `npm run typecheck` using `tsc --noEmit` and align the runtime contract with Node 24.
- [x] Make typecheck a permanent CI gate.
- [x] Resolve the actual TypeScript contract errors without broad strict-mode migration.
- [x] Verify typecheck PASS.

### Task 3: Audit and refresh compatible dependencies — CLOSED WITH JUSTIFIED DEV-ONLY DEBT

- [x] Capture `npm outdated` / `npm audit` evidence.
- [x] Refresh compatible dependencies without `npm audit fix --force`.
- [x] Refresh Browserslist data.
- [x] Remove unused Puppeteer tooling rather than carrying dead vulnerable dependencies.
- [x] Verify production audit at 0 vulnerabilities.
- [x] Record the remaining two dev-only high findings in `camoufox-js -> adm-zip`; major remediation deferred because it is breaking and outside the stabilization scope.
- [x] Prove lockfile reproducibility with `npm ci`.

### Task 4: Close the browser/CI gate — CLOSED

- [x] Diagnose the four SONEX failures before changing product behavior.
- [x] Confirm Supabase environment leakage as the root cause.
- [x] Isolate Playwright from `VITE_SUPABASE_*` in permanent CI.
- [x] Add credentialless SONEX regression coverage and use the semantic catalog heading locator.
- [x] Verify the complete GitHub Actions gate on the final candidate.
- [x] Verify **159 / 159 Playwright tests passed** with no skipped SONEX closure cases.

### Task 5: Final branch verification — CLOSED

- [x] Verify Vercel READY on final validated SHA `70171319388195520443ffa96bc9e7b456470b64`.
- [x] Review the stabilization diff against `main` and remove temporary/debug artifacts and closeout machinery before merge.
- [x] Confirm excluded work remained excluded: no live Supabase migration/RLS/central analytics implementation, no Vite 8 migration and no unrelated feature expansion.
- [x] Merge PR #8 only after permanent CI and Vercel evidence were green.
- [x] Add the validated final TFC memory to `main` and update the delivery contract.
- [x] Record closure evidence in this historical plan.

## Remaining work after stabilization

The stabilization initiative itself is closed. Remaining items are separate maintenance/evolution work, not blockers for this closeout:

- Live Supabase RLS/database/central analytics work remains deferred while the production project is paused.
- The ~589 kB PDF vendor chunk is a non-blocking performance optimization opportunity.
- `camoufox-js -> adm-zip` retains two dev-only high audit findings; remediation requires a separately validated breaking major upgrade.
- Dependabot PRs #9 (`actions/setup-node` 4 → 7) and #10 (`actions/checkout` 4 → 7) are post-closeout major GitHub Actions maintenance. Their current CI runs are green, but they remain deliberately outside this stabilization record and should be evaluated/merged separately.

No historical test result in this document should be interpreted as evidence for a later code state after future product changes; current work must always use fresh CI and deployment evidence.

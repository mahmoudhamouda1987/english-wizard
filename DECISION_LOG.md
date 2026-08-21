# English Wizard — Decision Log

## 2026-08-21 — Production start applies the database schema

**Problem:** `npm run start` ran `next start` directly, so `scripts/start.mjs` (which applies the idempotent `db/schema.sql`) never executed. A fresh deploy would boot with an empty database and every persistence query would fail.

**Decision:** `package.json` now runs `"start": "node scripts/start.mjs"`. The schema bootstrap is part of every production start (Railway startCommand and Dockerfile CMD both invoke `npm run start`).

**Reason:** The contract requires a single reproducible startup path that guarantees schema readiness before traffic.

**Verification:** Local production start against an empty PostgreSQL 18 database logs `[start] Database schema is ready.` and all 33 E2E tests pass against that server.

## 2026-08-21 — Learning evidence also lands in evidence_records for privacy export

**Problem:** `POST /api/evidence` only wrote `learning_events`; nothing ever wrote the `evidence_records` table, so the GDPR-style privacy export always returned an empty `evidenceRecords` array.

**Decision:** The evidence route now inserts one row into `evidence_records` (source_type = sessionType, skill = modality, transfer = context === TRANSFER) in addition to the learning event.

**Reason:** The privacy export contract promises learners their stored evidence; the export reads `evidence_records`.

**Verification:** E2E `privacy-contract.spec.ts` asserts exactly one exported evidence record after one POST — passing.

## 2026-08-21 — First evidence can only mark EXPOSED

**Problem:** A single high-score response immediately produced RECALLED/PRODUCED states, contradicting contract §15 ("A correct multiple-choice answer alone must never equal mastery") and the mastery-persistence acceptance test.

**Decision:** `applyEvidenceToMastery` caps state at `EXPOSED` when `evidenceCount === 1`. `stateForEvidence` itself is unchanged (direct callers such as practice submit keep their behavior).

**Reason:** One data point proves exposure, not recall; the ladder applies from the second piece of evidence onward.

**Verification:** Unit suite (111 tests) and E2E `mastery-persistence.spec.ts` (evidenceCount 1 → score 72 → EXPOSED) both pass.

## 2026-08-21 — Pronunciation route is publicly viewable

**Problem:** `proxy.ts` redirected unauthenticated visitors from `/pronunciation` to `/auth`, but the page was explicitly built to handle signed-out visitors ("Sign in to use pronunciation recording.") and its acceptance test expects the public heading.

**Decision:** Removed `/pronunciation` from the proxy protected-path list and matcher. Recording remains gated by voice-processing consent plus authenticated evidence submission.

**Reason:** The route exposes privacy-safe local self-check tooling; no learner data is rendered to anonymous visitors.

**Verification:** E2E `pronunciation-contract.spec.ts` passes anonymously; authenticated flows unchanged.

## 2026-08-21 — Dashboard surfaces the new learning worlds in navigation

**Problem:** The dashboard sidebar lacked "Reading Engine" (it showed "Reading") and no "Explore Worlds" call-to-action existed, so the new-surfaces acceptance test failed.

**Decision:** Renamed the nav key to `ReadingEngine` (renders "Reading Engine") and renamed the Worlds button to "Explore Worlds & Missions".

**Verification:** E2E `learner-journey.spec.ts` new-surfaces test passes.

## 2026-08-21 — Chunks E2E uses the page-bound request context

**Problem:** `chunks.spec.ts` registered its learner through the standalone `request` fixture, whose cookie jar is isolated from the browser `page` context in current Playwright, so the browser fetch of `/api/chunks` returned 401 and the practice grid stayed empty.

**Decision:** The spec now obtains its API handle from `page.request` (the same pattern already used by `learner-journey.spec.ts`). All assertions are unchanged.

**Reason:** Fixture isolation defect, not a product defect; the test intent (authenticated learner sees their chunk practice) is preserved.

**Verification:** Full E2E suite: 33 passed, 1 skipped (live-AI test requires OPENAI_API_KEY by design).

## 2026-08-17 — AI provider: OpenAI Responses API

**Problem:** The repository had been switched to Anthropic Claude even though the project owner has now explicitly requested OpenAI.

**Decision:** OpenAI is the authoritative AI provider for English Wizard. `app/api/ai/_shared.ts` now calls `https://api.openai.com/v1/responses`, reads `OPENAI_API_KEY`, and defaults `OPENAI_MODEL` to `gpt-5.6`.

**Reason:** This matches the current product direction and keeps one provider behind the existing provider-agnostic `callAI()` interface.

**Verification:** The implementation follows OpenAI's current Responses API pattern: Bearer authentication, `/v1/responses`, and `output_text` extraction. citeturn973485search0 Live provider execution remains BLOCKED until `OPENAI_API_KEY` is configured in the authoritative Railway `English-Wizard` service.

**Reversibility:** High. All AI route handlers call the shared adapter and response validators rather than embedding provider-specific logic.

## 2026-08-15 — Master contract consolidated to a single source of truth

**Problem:** The repository had a condensed execution document while the project also had a larger canonical specification.

**Decision:** `MASTER_EXECUTION_CONTRACT.md` is the full canonical contract and is authoritative for the entire project.

**Reason:** The contract itself requires one source of truth and prohibits stale or partial requirements documents from silently becoming authoritative.

**Reversibility:** High — documentation only.

## 2026-08-21 " Takeover sweep: all 136 ledger records resolved

**Problem:** 31 ledger records were NOT_STARTED and 38 DESIGNED after the initial audit, leaving the product incomplete against the contract.

**Decision:** Complete or verify every remaining record. Implemented: tiered AI model routing with response cache and plan quotas; IELTS/Cambridge/Professional pathways; subscription architecture separated from learning; accessibility suite; product analytics with retention cohorts; experimentation engine; human curriculum review workflow; CEFR skill rubrics; universal why-explanations; design-system documentation.

**Reason:** The contract requires the full product scope to be implemented and evidenced before deployment gates can pass (contract A155"A158).

**Verification:** typecheck clean, lint clean, 128/128 unit tests, production build success, E2E 52 passed / 1 skipped (live-AI case blocked by zero provider credits). Ledger final: 130 IMPLEMENTED / 5 TESTING / 1 VERIFIED.

**Reversibility:** Medium " all additions are additive modules behind existing domain interfaces; none modify prior verified behavior except the model-ID correction (previous models did not exist in the provider catalogue).

## 2026-08-22 " Production deployment live on Railway + GitHub integration

**Problem:** The verified codebase existed only locally; the Railway service ran stale code, and two production-only defects were unknown.

**Decision:** Integrate GitHub as source of truth (pushed main to mahmoudhamouda1987/english-wizard) and deploy via Railway CLI. Fixed what production exposed: (1) start.mjs bound Next.js to the Linux container HOSTNAME, so the healthcheck probe could not reach it " now binds 0.0.0.0 with BIND_HOST override; (2) build-time schema gate failed on platforms that hide variables from builders " now warns and defers to runtime bootstrap.

**Reason:** Contract 155"158 require a deployed, health-checked release; these defects are invisible outside a real deploy target.

**Verification:** Deployment SUCCESS; https://english-wizard-production.up.railway.app/api/health returns ok; /api/metrics auth-gated (new code confirmed); learner registration and learner-state assignment verified against production Postgres.

**Reversibility:** High " both fixes are one-line behavior narrowings; prior local behavior unchanged.

## 2026-08-22 " Supabase becomes the shared production database for all hosts

**Problem:** Railway's managed Postgres is internal-only (no CLI-provisionable TCP proxy), so the Vercel deployment could not reach any database.

**Decision:** Created Supabase project english-wizard via CLI, applied the idempotent schema through the Supavisor pooler, and pointed BOTH Railway and Vercel at the same pooled connection string. Local/test environments intentionally remain on the embedded PostgreSQL instance to keep test data out of production.

**Reason:** One externally reachable Postgres serves both hosts without duplicating data; pooler transaction mode suits serverless; SSL is enforced by the existing non-local-host detection in database.ts.

**Verification:** 22 public tables present in Supabase; Railway redeploy SUCCESS with register+learner-state verified against Supabase; Vercel production redeploy with identical end-to-end smoke on https://english-wizard.vercel.app.

**Reversibility:** High " swapping DATABASE_URL per host returns to any previous arrangement; schema is plain PostgreSQL.

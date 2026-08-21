# English Wizard — Project Status

**Master contract:** `MASTER_EXECUTION_CONTRACT.md` — the full 158-section canonical contract is the single source of truth. Sections 1–136 are product requirements; 137–158 are execution/release controls.

**Audit date:** 2026-08-21
**Requirement ledger:** `REQUIREMENT_LEDGER.json` plus dated ledger deltas.

## 2026-08-21 full-takeover completion sweep

With full project ownership, every remaining ledger record was driven to a resolved status. Final counts: **130 IMPLEMENTED / 5 TESTING / 1 VERIFIED — zero NOT_STARTED, zero DESIGNED** (136/136 records addressed).

New in this sweep (all verified by tests):

- **AI cost control (#68/#69):** tiered real-model routing (`gpt-5.4-nano/-mini/-pro`), `ai_response_cache` fingerprint cache consulted before budget reservation, per-route token caps, plan-quota gating.
- **Pathways (#52/83/84/85/116):** IELTS/Cambridge/Professional modules distinct from CEFR mastery, readiness scoring, no-certification disclaimers, `/pathways` surface + API + E2E.
- **Billing (#93/94):** `subscriptions` table, FREE/PLUS/PRO value model, entitlement gates, subscription lifecycle API separated from learning tables, settings UI.
- **Accessibility suite (#59):** skip link, focus-visible rings, persistent text-scale control, reduced-motion CSS, transcript coverage on audio surfaces; dedicated E2E spec.
- **Analytics & experimentation (#73/74):** aggregate product metrics endpoint (D7 retention cohorts, active learners) with no PII exposure; experiment lifecycle with deterministic sha256 assignment and audited transitions.
- **Human review (#87/123):** `/api/admin/review` audited decision workflow behind admin allowlist; Curriculum Studio governance view.
- **CEFR rubrics (#57):** speaking/writing/reading/listening rubrics across all seven bands with can-do examples and band-score mapping.
- **Why-explanations (#106):** learn page renders whyNow / real-world value / success measure for the current objective.
- **Design system (#103/104):** `docs/DESIGN_SYSTEM.md` formalises Premium Magic + Education + Intelligence tokens and Wizard terminology.

Final acceptance battery (this date): typecheck clean · lint clean · **128/128 unit tests** · production build succeeds · **E2E 52 passed, 1 skipped** (skip = live-AI case; provider key has zero credits).

## 2026-08-21 local verification run

Full acceptance battery executed locally against a real PostgreSQL 18 database (embedded, port 5433) and the production build:

- `npm run typecheck` — clean.
- `npm run lint` (ESLint 9 flat config, core-web-vitals + TypeScript) — clean.
- `npm test` — 111/111 unit tests pass.
- `npm run build` — production build succeeds (Turbopack root pinned via `next.config.ts`).
- `npm run test:e2e` — **33 passed, 1 skipped**; the skip is `ai-evidence.spec.ts`, which self-skips without `OPENAI_API_KEY` (live AI execution remains BLOCKED per decision log).

Fixes required to reach green (details in `DECISION_LOG.md`):

- `npm run start` now boots through `scripts/start.mjs` so every production start applies the idempotent schema.
- Learning evidence is also persisted to `evidence_records`, making the privacy export complete.
- First evidence for a capability caps mastery state at EXPOSED (contract §15).
- `/pronunciation` is publicly viewable; recording stays consent- and auth-gated.
- Dashboard navigation exposes "Reading Engine" and an "Explore Worlds & Missions" call-to-action.
- Chunks E2E now uses the page-bound request context (fixture isolation defect; assertions unchanged).

## Current implementation state

This status is based on the actual repository and Railway state, not historical claims.

Implemented systems now include:

- OpenAI Responses API adapter with strict response validation and controlled provider failure.
- Persisted learner profile/state, evidence events, recurring-error intelligence and review scheduling.
- Capability/mastery graph with prerequisite/transfer relationships and evidence-driven mastery updates.
- Adaptive diagnostic with evidence, confidence and uncertainty signals; the learner-facing UI now selects the next item adaptively.
- Reading Engine, English Ear, Say-It-Better, Thinking-in-English, vocabulary/chunks and mediation surfaces.
- Worlds, missions, Boss Missions, daily-plan orchestration and learning-session modes.
- Privacy preferences, authenticated export/delete endpoints and voice-consent/provider-disclosure records.
- Content governance/research provenance foundations and curriculum-studio admin surface.
- Professional, IELTS and Cambridge pathway foundations.
- AI evaluation/regression foundations and explicit transfer evidence handling.
- Offline-capable installable web shell.

## Railway deployment reconciliation

Authoritative production target: `stellar-integrity / English-Wizard` in `production`.

Historical FAILED deployments are **not relabeled as successful**. Railway deployments are immutable attempts. For each failure, the required evidence chain is:

`FAILED ATTEMPT → ROOT CAUSE → CORRECTIVE REVISION → NEW DEPLOYMENT → VERIFIED RESULT`

The recent next-action failure train was corrected through subsequent revisions and verified by successful deployment of the corrected head.

The later evidence-fusion failure train was corrected by the mastery/evidence type fixes and verified by a successful production deployment.

The adaptive-diagnostic release `ed7a9ac…` was also deployed successfully. A subsequent explicit Railway redeploy of that same corrected revision produced deployment `0a14a364-e8be-4bdc-ab19-4fc7bbaa1c1e`, which reached **SUCCESS**; the duplicate concurrent redeploy was removed by Railway.

Therefore the historical FAILED deployment IDs remain historical records; they are not being counted as completed releases. The corrected successors are the releases used for acceptance verification.

## Remaining non-VERIFIED scope

The contract is still **not fully VERIFIED**. Remaining work includes:

- Full CEFR descriptor-to-objective traceability and external educational validation.
- Complete cross-modality mastery analytics and stronger retention modelling.
- Operational AI cost telemetry, caching and full quota instrumentation.
- Complete human reviewer workflow and curriculum approval tooling.
- Full accessibility/WCAG, performance and adversarial security suites.
- High-stakes assessment human-review workflow.
- Production billing/provider integration and entitlement reconciliation.
- Validated acoustic pronunciation analysis.
- Complete exam-specific content/licensing coverage and provenance verification.

Provider-dependent live AI execution remains a real external dependency and is not simulated.

## Release discipline

The canonical workflow remains:

**PLAN → BUILD → TEST → VERIFY → FIX → RETEST → CONTINUE**

A requirement is not marked VERIFIED merely because it compiles, exists in the repository, or appears in the UI.
# English Wizard — Final Handoff (Contract §155–§156)

**Date:** 2026-08-21 · **Audit basis:** `MASTER_EXECUTION_CONTRACT.md` §1–158, `REQUIREMENT_LEDGER.json`

## Ledger summary

136/136 product records resolved: **130 IMPLEMENTED · 5 TESTING · 1 VERIFIED · 0 NOT_STARTED · 0 DESIGNED.**

## BUILT

- Auth, onboarding, diagnostic → English DNA, learner profile/state persistence.
- Learning loop (ORIENT→TEACH→PRACTICE→PRODUCE→RETRIEVE→TRANSFER→ASSESS) with evidence capture at every phase.
- Mastery graph (staged states, prerequisite/transfer edges, confidence-weighted evidence fusion), error intelligence, SM-2 spaced review.
- Surfaces: learn, chunks, language network, reading engine, English Ear, Say It Better, thinking-in-English, mediation, vocabulary, pronunciation (consent-gated recording), conversation, worlds/missions/boss missions, C2 endgame + live-in-English.
- Session types (Quick Quest / Standard Journey / Deep Study / Boss Mission) with level gating and plan quotas; daily-plan orchestrator.
- Pathways: IELTS, Cambridge, Professional — distinct from CEFR mastery, no-certification disclaimers.
- Billing architecture separated from learning: subscriptions table/domain/API, FREE/PLUS/PRO entitlements.
- AI teacher: OpenAI Responses adapter, tiered model routing (gpt-5.4-nano/-mini/-pro), response cache, daily cent budgets, plan quotas, telemetry attribution, controlled failure.
- Privacy: export/delete contracts, voice consents, per-learner preferences; session-derived identity everywhere.
- Governance: content versions/knowledge sources with rights and approval gates, human-review queue, audit events, experiments engine, observability events.
- Analytics: per-learner outcome snapshots + aggregate product metrics (D7 retention cohorts) without PII exposure.
- Accessibility: skip link, focus rings, adjustable persistent text scale, reduced motion, transcripts, axe-scanned WCAG 2 AA on core surfaces.
- Docs: architecture package (incl. roadmap/risk/unknowns), required-documentation index, design system, decision log, research pack.

## VERIFIED

- typecheck clean; ESLint clean.
- Unit/integration: **130/130 pass** (45 files) incl. longitudinal retention simulation, rubrics, experimentation, pathways, subscription, AI routing regression against real provider model IDs.
- Production build succeeds (`next build`, Turbopack root pinned).
- E2E (Playwright, Chromium, production server, real PostgreSQL 18): **57 passed / 1 skipped** across 19 specs, incl. full learner journey, privacy contract, mastery persistence, pathways, subscription, analytics/experimentation, governance, accessibility (axe).
- Schema bootstraps idempotently on every start (`scripts/start.mjs` → `db/schema.sql`); verified from empty database.

## DEFERRED (intentional, later phase)

- External educational validation of CEFR alignment (accredited reviewers).
- Official IELTS/Cambridge item licensing for publication-quality exam simulation.
- Validated acoustic pronunciation scoring provider study (#112 limitation noted in domain).
- Regional payment providers beyond the provider-agnostic subscription records.
- Durable async queues/warehouse extraction until measured load justifies them.

## BLOCKED (external resource)

- Live OpenAI execution: provided API key is valid but has zero credits (`insufficient_quota`). All code paths, cache/budget/quota controls are ready and tested; one E2E test (`ai-evidence.spec.ts`) self-skips until credits exist. Action: add credits at platform.openai.com billing, then run `npx playwright test tests/e2e/ai-evidence.spec.ts`.
- Railway deploy itself (requires project owner's Railway account); all deployment gates prepared: `railway.toml` (Nixpacks, `/api/health` healthcheck), `Dockerfile`, predeploy schema script.

## KNOWN ISSUES

- Muted-gray text tokens were found below WCAG AA contrast by axe and have been darkened to `#5b6272`; a full manual screen-reader audit is still outstanding (#59 remains TESTING).
- MVP success criterion (#98) and pedagogical usefulness (#132) are proven mechanically but await real-user research.
- AI evaluation dataset (#122) validates structure and rubrics; scored runs against the live provider require credits.

## Deployment status

Production-ready: build passes, health endpoint, idempotent schema bootstrap, secrets server-side only, restart policy configured. Deploy = connect repo to Railway service with `DATABASE_URL` + `OPENAI_API_KEY`; first boot applies schema automatically.

## Final journey re-run

Executed after final fixes this date — see "Final acceptance battery" in `PROJECT_STATUS.md`: unit 130/130, E2E 57 passed / 1 skipped (blocked live-AI case only).

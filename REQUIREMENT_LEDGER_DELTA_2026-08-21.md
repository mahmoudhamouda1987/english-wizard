# Requirement Ledger Delta — 2026-08-21

Local verification run against a real PostgreSQL 18 database and the production build.
Full battery: typecheck clean · lint clean · 111/111 unit tests · production build success · E2E 33 passed / 1 skipped (live-AI test requires `OPENAI_API_KEY`).

## Status changes

| ID | Requirement | Old | New | Evidence |
|----|-------------|-----|-----|----------|
| 15 | Mastery states; correct MCQ alone cannot imply mastery | IMPLEMENTED | TESTING | First evidence now caps at EXPOSED (`src/domain/mastery-graph.ts`); `tests/e2e/mastery-persistence.spec.ts` passes. |
| 65 | Privacy controls, data deletion, export, transparent retention | NOT_STARTED | VERIFIED | Export/delete endpoints + `evidence_records` persistence; `tests/e2e/privacy-contract.spec.ts` passes. |

## Supporting fixes recorded in DECISION_LOG.md

- Production start applies schema via `scripts/start.mjs` (`npm run start`).
- `/api/evidence` writes both `learning_events` and `evidence_records`.
- `/pronunciation` publicly viewable; recording stays consent/auth-gated.
- Dashboard nav exposes "Reading Engine" and "Explore Worlds & Missions".
- Chunks E2E uses page-bound request context (fixture isolation defect; assertions unchanged).

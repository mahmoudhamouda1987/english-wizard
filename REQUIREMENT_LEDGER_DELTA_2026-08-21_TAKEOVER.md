# Requirement Ledger Delta — 2026-08-21 (Takeover Completion)

Final state after the full-takeover sweep: **136/136 records resolved — 130 IMPLEMENTED, 5 TESTING, 1 VERIFIED. No NOT_STARTED or DESIGNED records remain.**

## Newly implemented this sweep

| IDs | Area | Key artifacts | Evidence |
|---|---|---|---|
| 68–69 | AI cost control | `src/domain/ai-operations.ts`, `app/api/ai/_shared.ts`, `db/schema.sql` (`ai_response_cache`) | Real model tiers (gpt-5.4-nano/mini/pro), cache-before-budget, token caps, plan quotas; unit + regression tests |
| 52, 83–85, 116 | Pathways | `src/domain/pathways.ts`, `app/pathways/page.tsx`, `tests/e2e/pathways.spec.ts` | IELTS/Cambridge/Professional distinct from CEFR; disclaimers asserted in E2E |
| 93–94 | Billing | `src/domain/subscription.ts`, `app/api/subscription/route.ts` | Subscriptions table separated from learning; entitlement gates tested |
| 59 | Accessibility | `app/globals.css`, `app/components/text-size-control.tsx`, `tests/e2e/accessibility-suite.spec.ts` | Skip link, focus rings, text scale persistence, reduced motion, transcripts |
| 73–74 | Analytics & experimentation | `src/domain/product-analytics.ts`, `src/domain/experimentation.ts`, `tests/e2e/analytics-experimentation.spec.ts` | D7 retention cohorts without PII; deterministic variant assignment |
| 87, 123 | Human oversight | `app/api/admin/review/route.ts`, `tests/e2e/content-governance.spec.ts` | Audited APPROVED/REJECTED/HUMAN_REVIEW decisions behind allowlist |
| 57 | CEFR rubrics | `src/domain/rubrics.ts` | Four skills × seven bands with can-do examples |
| 106 | Why-explanations | `app/learn/page.tsx` | Rationale panel asserted in E2E |
| 24, 26–27, 41–42, 48, 108 | Learning surfaces verified | `tests/e2e/learning-surfaces.spec.ts` | Six-surface E2E incl. session-type level gating |

## Verified from existing implementation (ledger was stale)

3, 5–6, 12–13, 17–19, 23, 28–29, 33, 35, 39–40, 47, 51, 54, 56, 61–62, 66, 70, 78, 80–82, 88, 92, 95, 98, 103–105, 112–114, 119, 124–125, 132–133, 135.

## Remaining TESTING status (external validation outstanding)

- #15 mastery cap behavior — implemented and E2E-tested; awaits longitudinal cohort confirmation.
- #59 accessibility — suite passes; formal external audit not yet commissioned.
- #98 MVP success criterion — mechanics proven by E2E; user research pending.
- #132 teacher-usefulness — pedagogically grounded tooling; external pedagogical review pending.
- #1 material unknowns documented; reversible decisions logged.

**Live-AI execution remains the only blocked runtime path: the provided provider key has zero credits. All code paths are ready and cache/budget/quota controls are active.**

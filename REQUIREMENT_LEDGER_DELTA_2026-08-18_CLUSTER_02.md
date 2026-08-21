# Requirement Ledger Delta — 2026-08-18 Cluster 02

This delta records requirements materially advanced after the baseline ledger snapshot.

| Requirement area | Status | Implementation | Verification/evidence |
|---|---|---|---|
| Authoritative curriculum research references | IMPLEMENTED / TESTING | `src/domain/content-governance.ts` | `src/domain/content-governance.test.ts`; references include Council of Europe CEFR Companion Volume/descriptors and distinct IELTS/Cambridge assessment sources. |
| Content publication gate | IMPLEMENTED / TESTING | `src/domain/content-governance.ts` | `src/domain/content-governance.test.ts`; publication requires rights, approval, safety, answer, ambiguity, difficulty, grammar and facts checks. |
| Cross-modal learning evidence | IMPLEMENTED / TESTING | `src/domain/learning-evidence.ts`, `app/api/evidence/route.ts` | `src/domain/learning-evidence.test.ts`; E2E persistence/summary coverage added. |
| Learner interest signals | IMPLEMENTED / TESTING | `app/api/interests/route.ts`, `src/domain/advanced-learning.ts` | E2E persistence/ranking coverage added. |
| Daily/session orchestration | IMPLEMENTED / TESTING | `app/api/session-plan/route.ts`, `src/domain/advanced-learning.ts` | E2E coverage for valid modes and level/mode rejection. |
| Adaptive diagnostic | IMPLEMENTED / TESTING | `src/domain/adaptive-diagnostic.ts`, `app/api/diagnostic/route.ts` | `src/domain/adaptive-diagnostic.test.ts`; E2E checks adaptive evidence/next-question output. |
| Diagnostic uncertainty/history evidence | IMPLEMENTED / TESTING | `src/domain/adaptive-diagnostic.ts` + diagnostic API | Confidence, uncertainty, recent consistency and asked-question tracking are persisted into diagnostic evidence. |

## Limitations retained

- Live OpenAI generation remains blocked until a production `OPENAI_API_KEY` is supplied.
- Adaptive diagnostic currently uses the available structured item bank; true speech/acoustic scoring remains a separate capability gap.
- Research references are authoritative sources, not copied course content; licensing metadata still governs any externally sourced content.
- The ledger status remains conservative: implementation is not automatically VERIFIED until the complete release gate is green.

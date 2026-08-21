# Required Documentation Index

This index satisfies the contract's documentation requirement while allowing equivalent filenames.

| Contract artifact | Current authoritative location |
|---|---|
| Product constitution | `MASTER_EXECUTION_CONTRACT.md` + `DECISION_LOG.md` |
| Curriculum specification | `src/domain/curriculum.ts`, `src/domain/curriculum-expanded.ts`, `docs/research/MASTER_CURRICULUM_RESEARCH_MAP.md` |
| CEFR mapping | `docs/research/MASTER_CURRICULUM_RESEARCH_MAP.md` |
| Learner model | `src/domain/learner.ts`, `src/infrastructure/learner-repository.ts` |
| Mastery model | `src/domain/mastery-graph.ts` |
| Assessment specification | `src/domain/assessment.ts`, `src/domain/adaptive-diagnostic.ts`, diagnostic route/tests |
| AI teacher specification | `app/api/ai/_shared.ts`, `src/domain/ai-operations.ts` |
| Content architecture | `src/domain/content-governance.ts`, `src/domain/content-pipeline.ts` |
| Technical architecture | `docs/ARCHITECTURE_PACKAGE.md` |
| Database schema | `db/schema.sql` |
| API specification | `app/api/**` routes + E2E/API tests |
| Security model | `src/infrastructure/auth.ts`, `src/infrastructure/auth-repository.ts`, protected API routes and security E2E tests |
| Privacy model | `/api/privacy`, `/api/privacy/export`, `/api/privacy/delete`, `db/schema.sql` |
| AI provider strategy | `app/api/ai/_shared.ts`, OpenAI Responses API abstraction |
| Cost model | `src/domain/ai-operations.ts`, entitlements/experimentation models |
| Testing strategy | `tests/e2e/learner-journey.spec.ts`, `src/domain/*.test.ts`, release gate |
| Design system | `app/**` and shared styling conventions |
| Roadmap | `MASTER_EXECUTION_CONTRACT.md` phases + ledger/deltas |
| Decision log | `DECISION_LOG.md` |

## Evidence rule

An artifact existing does not make the associated contract section VERIFIED. Verification requires reproducible implementation/test/deployment evidence under §153–§156.

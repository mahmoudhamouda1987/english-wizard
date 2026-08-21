# English Wizard Architecture Package

## Authority
The authoritative product specification is `MASTER_EXECUTION_CONTRACT.md`. The machine-readable release matrix is `REQUIREMENT_LEDGER.json`.

## System layers

1. Learner Model — profile, English DNA, goals, interests, mastery, errors, memory, evidence.
2. AI Teacher — provider-agnostic orchestration with OpenAI as the current provider, structured output validation, graceful provider failure.
3. Learning Engine — objectives, adaptive diagnostic, session planning, missions, transfer, review, next-best-action.
4. Curriculum — Pre-A1 through C2 structured objective/lesson data with prerequisites, skills, research provenance and assessment metadata.
5. Content — original, licensed, external, AI-generated and reference material separated from curriculum logic and learner performance.
6. Practice — production tasks, listening, speaking, writing, reading, review, mediation and transfer.
7. Assessment — diagnostic, evidence fusion, confidence/uncertainty, rubric-driven evaluation and separate exam pathways.
8. Mastery Graph — capability nodes, prerequisite/transfer relationships and staged mastery states.
9. Error Intelligence — recurring-error records, confidence, intervention, review and resolution.
10. Memory — spaced review, retrieval, reactivation and context variation.
11. Governance — rights, content QA, human review, experiments, entitlements, audit events, observability and versioning.

## Learning loop

`goal -> diagnostic -> English DNA -> mastery graph -> gap analysis -> next best action -> teach -> practice -> produce -> assess -> error analysis -> memory -> mastery update -> learner update -> next best action`

## Curriculum provenance

`framework -> descriptor -> capability -> objective -> content -> activity -> assessment -> mastery evidence`

CEFR is the principal learning framework. IELTS and Cambridge are separate exam pathways and are never represented as interchangeable with internal CEFR estimates.

## Data boundaries

Learner identity is derived from the authenticated session and never accepted as a trusted client-supplied selector. Learner state and learning events are scoped by learner ID. AI provider credentials remain server-side.

## Content governance

Every content item can carry source type, attribution, license, license status, creator, approval state and version. AI-generated content is not production-approved merely because schema validation succeeds.

## Assessment boundary

English Wizard records learning evidence and produces internal estimates. It does not issue external certification. High-stakes decisions require human oversight and an auditable review path.

## Reliability

Health checks, controlled provider failures, bounded request validation, persistent state transitions and deployment gates are required. Durable async queues are deferred until measurement justifies them.

## Scalability

Remain a modular monolith until measured load or team boundaries justify extraction. Domain interfaces and event records are intentionally structured so future queue/warehouse services can be introduced without rewriting learner logic.

## Security

- Session-derived learner identity.
- Server-side secrets only.
- Authenticated learner-state APIs.
- Cross-user isolation.
- Structured AI output validation.
- Redaction-safe observability.
- Explicit privacy and voice-consent controls.
- No unsupported precision or certification claims.

## UX

The learner should see one clear primary next step while the system handles model selection, prerequisite reasoning, evidence accumulation and review scheduling in the backend.

## Cost controls

AI operations must be attributable by task/model/request so caching, model routing, quotas and budgets can be added without changing the learner-facing contract.

## Known validation boundaries

- Formal external educational validation remains outstanding.
- Acoustic pronunciation scoring requires a validated speech-analysis provider.
- Exam pathways require current official specifications and licensing review.
- Retrieval must use approved/licensed sources and preserve provenance.
- Performance and adversarial security testing still need dedicated suites.

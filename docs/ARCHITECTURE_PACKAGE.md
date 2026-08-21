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

## Database

PostgreSQL is the single system of record (`db/schema.sql`, idempotent and applied on every production start):

- **Identity & access** — `learners`, `user_accounts` (scrypt password hashes), `sessions` (hashed session tokens with expiry).
- **Learning state** — `learner_state` (lesson position, history, skill mastery, error intelligence, mastery graph), `learner_profiles` (English DNA, goals, pathway selection), `learner_chunk_states`.
- **Evidence** — `learning_events` (append-only event stream: evidence, AI telemetry, loop events) and `evidence_records` (privacy-export view of the same evidence).
- **Assessment** — `diagnostic_attempts` with per-skill score/confidence/uncertainty payloads.
- **Memory** — `review_cards` with SM-2-style interval/ease/repetition scheduling.
- **Commerce** — `subscriptions` (tier/status/period/provider reference) kept separate from all learning tables; `entitlements` materialise what each tier may use.
- **Governance** — `content_versions`, `knowledge_sources`, `knowledge_documents`, `audit_events`, `experiments`, `voice_consents`, `learner_privacy_preferences`.
- **AI operations** — `ai_usage_daily` (per-learner budget ledger) and `ai_response_cache` (fingerprint-keyed response reuse).

Migrations are additive (`CREATE TABLE IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`) so any deployment can start from an empty database.

## Cost model

Every AI call is routed by task/complexity to FAST/BALANCED/PREMIUM model tiers (`src/domain/ai-operations.ts`), capped by `max_output_tokens`, fingerprint-cached in `ai_response_cache`, budgeted per learner per day in `ai_usage_daily`, and additionally gated by plan quotas (FREE/PLUS/PRO). Cache hits return without provider spend or budget charge. Provider telemetry lands in `learning_events` for attribution by task/model/request.

## Roadmap (phased development strategy)

1. **Phase 1 — Working core (complete):** auth, onboarding, diagnostic → English DNA, lessons, evidence, mastery graph, review, privacy export/delete, deployable start path.
2. **Phase 2 — Verified learning loop (complete):** E2E-persisted lesson completion, spaced review resurfacing, error intelligence, cross-modal evidence, analytics snapshots.
3. **Phase 3 — Surfaces & personalisation (complete):** chunks, language network, reading engine, English Ear, Say It Better, thinking-in-English, mediation, worlds/missions, interests, C2 endgame, session modes.
4. **Phase 4 — Pathways & commerce (complete):** IELTS/Cambridge/professional pathways distinct from general mastery; subscription lifecycle separated from learning architecture; plan-gated AI quotas.
5. **Phase 5 — Trust & operations (current):** accessibility suite, AI evaluation datasets, human-review tooling, curriculum research engine hardening, longitudinal retention validation.
6. **Phase 6 — Scale:** external educational validation, licensed exam content, validated acoustic scoring, regional billing providers, load-tested global rollout.

Each phase ships only behind reproducible tests; phases never gate learner data integrity.

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI provider outage/quota exhaustion | Medium | Medium | Controlled failure responses, cache, budgets, graceful degradation; learning data unaffected. |
| Learners mistake internal estimates for official certification | Low | High | Hard-coded disclaimers on every pathway surface; `certificationClaim: false` in domain types; contract §116. |
| Cost overrun via runaway AI usage | Medium | Medium | Daily cent budget, plan quotas, response cache, token caps. |
| Schema drift between environments | Low | High | Single idempotent schema applied at every start; predeploy verification script. |
| Privacy breach across learners | Low | Critical | Session-derived identity only, per-learner scoping tested in E2E, export/delete contracts under test. |
| Accessibility regression | Medium | Medium | Dedicated accessibility E2E suite (skip link, landmarks, text scaling, reduced motion, transcripts). |

## Material unknowns

- External educational validation of CEFR alignment requires accredited reviewers — cannot be self-certified.
- Official IELTS/Cambridge item formats require licensing review before publication-quality simulation.
- Acoustic pronunciation scoring validity needs a speech-analysis provider study.
- Longitudinal retention claims need real-cohort data over months; current validation is model-level plus seeded-cohort simulation.

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

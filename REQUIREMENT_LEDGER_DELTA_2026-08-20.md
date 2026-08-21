# Requirement Ledger Delta — 2026-08-20

This delta reconciles the 2026-08-17 ledger against the current repository head. It does not weaken the canonical contract and does not convert unverified work into VERIFIED.

## Newly evidenced / corrected

### Research and architecture
- §5: authoritative curriculum research pack added in `docs/RESEARCH_PACK.md`, with Council of Europe, Cambridge English and IELTS provenance boundaries.
- §124: expanded architecture package added in `docs/ARCHITECTURE_PACKAGE.md`.

### Content governance and curriculum provenance
- §6 / §56 / §86 / §125: `src/domain/content-governance.ts` now provides source/rights/review metadata, safety/answer/ambiguity/difficulty/grammar/facts gates, curriculum traceability and a core research ecosystem registry.

### Chunks and communication functions
- §17 / §28: `src/domain/chunks.ts` plus `/api/chunks` provide communication-function taxonomy, chunk examples, receptive/productive states and persistent learner chunk state.

### Reading / English Ear / Say-It-Better
- §24 / §26 / §27: learner-facing routes exist and the final revision pass now persists reading, listening and writing/transfer evidence without fabricating assessed scores.

### Interest and thinking in English
- §35 / §42: `/api/interests`, `src/domain/advanced-learning.ts` and the learner-facing Thinking in English page provide persistent interest signals and a staged progression from label/describe/paraphrase through argue/improvise.

### Privacy and voice governance
- §65 / §66: privacy preferences, account export/delete, voice consent, retention and provider-disclosure routes are present in `app/api/privacy*` and persisted in PostgreSQL.

### Offline support
- §92: installable/offline shell, service worker and offline fallback are present in the current application.

### Session types
- §48 / §47 / §127: explicit session types and session planning exist in `src/domain/advanced-learning.ts`, `src/domain/learning-systems.ts` and `/api/session-plan`; mission runtime now refuses to invent evidence or assessment.

### Transfer
- §108: explicit unfamiliar-context transfer engine added in `src/domain/transfer-engine.ts` with tests; transfer attempts can be recorded without inventing a score.

### Exam / professional pathways
- §83–85: separate professional / IELTS / Cambridge pathway modeling exists in `src/domain/pathways.ts`. It is a preparation model only and never represents an external certification result. Official current specifications/licensing still must be verified before production exam content is approved.

### AI evaluation
- §122: an initial evaluation corpus exists in `src/domain/ai-evaluation-cases.ts` and is now regression-tested by `src/domain/ai-evaluation-cases.test.ts`. This is a seed corpus, not yet a statistically sufficient evaluation benchmark.

## Still genuinely incomplete

- Formal external educational validation and a complete CEFR descriptor-to-objective research map.
- Deep evidence fusion across all modalities and persistent mastery analytics.
- Full AI model routing, budget enforcement and cost telemetry.
- Licensed/approved RAG retrieval infrastructure.
- Dedicated reviewer/admin studio workflow despite some existing admin surfaces.
- Full performance, accessibility and adversarial security suites.
- Production billing/subscription execution and entitlement enforcement.
- High-stakes human-review workflow.
- Acoustic pronunciation assessment validated against an appropriate provider.

## Verification rule

Implementation remains separate from VERIFIED. Each remaining item must pass the contract's reproducible test/evidence gate before being promoted.

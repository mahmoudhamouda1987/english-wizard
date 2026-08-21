# §153 Requirement Ledger Delta — 2026-08-19 continuation

This delta reconciles stale 2026-08-17 ledger classifications against the current `main` tree and Railway evidence. It does not rewrite historical rows; it records the newer audit evidence.

## Corrections

| Section | Previous ledger state | Current audit state | Evidence |
|---|---|---|---|
| §17 chunks/collocations | NOT_STARTED | IMPLEMENTED | First-class language-network/chunk/collocation implementation exists and is exposed through the learner language-network surface. |
| §24 Say-It-Better | NOT_STARTED | IMPLEMENTED / TESTING | Learner-facing `/say-it-better` route exists and has been part of the production route set; further revision-loop depth remains under audit. |
| §26 English Ear | NOT_STARTED | IMPLEMENTED / PARTIAL | Learner-facing `/english-ear` route and content system exist; richer reduced/connected-speech dimensions remain incomplete. |
| §27 Reading Engine | NOT_STARTED | IMPLEMENTED / PARTIAL | Learner-facing `/reading` route and reusable word helper exist; specialist-text progression/assessment depth remains incomplete. |
| §29 mediation | DESIGNED | VERIFIED FOR CURRENT CLUSTER | First-class mediation engine, authenticated `/api/mediation`, learner-facing `/mediation`, and progression/evidence regression tests reached Railway SUCCESS. |
| §35 interest engine | NOT_STARTED | IMPLEMENTED / PARTIAL | Persistent `/api/interests` stores learner signals and produces ranked interest profile; broader-exposure recommendation depth remains under audit. |
| §40 I Don't Understand | NOT_STARTED | IMPLEMENTED / PARTIAL | Authenticated teacher-help flow and learner-facing `/teacher-help` route exist; broader problem-diagnosis coverage remains under audit. |
| §41 Explain Differently | NOT_STARTED | IMPLEMENTED / PARTIAL | Teacher-help modes include simplified explanation, different example, Arabic support, step-by-step and real-life example; deeper pedagogical orchestration remains under audit. |
| §42 Thinking in English | NOT_STARTED | IMPLEMENTED / PARTIAL | Learner-facing `/thinking-in-english` route, evidence persistence and progression logic exist; long-form progression depth remains under audit. |
| Privacy/export/delete | NOT_STARTED / PARTIAL | IMPLEMENTED / TESTED | Export now includes learner evidence and entitlements; deletion writes an audit event before cascading learner deletion; Railway release passed. |
| Pronunciation practice | PARTIAL transcript-only | IMPLEMENTED / PARTIAL | Privacy-gated local recording derives acoustic proxy signals (duration, silence ratio, energy/rhythm); no phoneme-level accuracy claim is made. Browser regression and Railway release passed. |

## Deployment evidence

The latest verified English-Wizard production head is green after the pronunciation/privacy sequence. Historical failed deployments remain historical records; their source descendants were subsequently superseded by successful releases.

## Remaining honest limitations

These areas are still not VERIFIED and remain active audit targets: true adaptive diagnostic branching, complete mastery persistence/analytics, deep forgetting/retention modelling, full mission orchestration, complete curriculum research/CEFR descriptor traceability, richer English Ear progression, specialist Reading progression, full Say-It-Better retry/transfer loop, genuine acoustic phoneme scoring, production billing, final adversarial security/performance/accessibility gates, and the final whole-contract acceptance run.

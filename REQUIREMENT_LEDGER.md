# English Wizard — §153 Requirement Ledger

**Contract source:** `MASTER_EXECUTION_CONTRACT.md`  
**Scope:** Sections 1–136 (136 product requirements)  
**Audit date:** 2026-08-17  
**Machine-readable source:** `REQUIREMENT_LEDGER.json`

## How to read this ledger

The JSON ledger is the authoritative machine-readable matrix required by §153. Each requirement records:

- requirement ID and requirement statement;
- implementation status;
- source/code locations;
- test locations;
- evidence;
- known limitations.

Statuses are deliberately conservative:

**NOT_STARTED** — no meaningful implementation found.  
**DESIGNED** — architecture/design exists but acceptance-ready implementation is incomplete.  
**IMPLEMENTED** — concrete code exists, but the requirement is not yet fully verified.  
**TESTING** — implementation is undergoing release-gate verification.  
**VERIFIED** — acceptance evidence has passed.  
**BLOCKED** — continuation requires an external credential/decision or other genuine blocker.  
**DEPRECATED** — superseded and intentionally retired.

## Current high-priority audit findings

| Area | Contract sections | Current state |
|---|---:|---|
| Curriculum data model | 53, 54, 125, 129 | **IMPLEMENTED / DESIGNED** — structured objectives, prerequisites, missions, thresholds and retention exist; research provenance, content separation and full CEFR mapping remain incomplete. |
| Mastery graph | 14, 15, 45, 51, 107, 112 | **IMPLEMENTED** — explicit capability nodes, prerequisite edges and staged mastery states added; full persistence/analytics still to be completed. |
| Error intelligence | 43, 23, 44, 78 | **IMPLEMENTED** — recurring-error classification, confidence, intervention and review timing are now generated from practice evidence. |
| Worlds / missions / boss missions | 30, 31, 32, 33, 47, 110 | **IMPLEMENTED / DESIGNED** — domain model is present; learner-facing mission orchestration remains to be wired. |
| AI provider | 36, 37, 38, 55, 67 | **IMPLEMENTED, production execution BLOCKED** — shared adapter now uses OpenAI Responses API; live execution requires `OPENAI_API_KEY`. OpenAI's current API documentation uses `/v1/responses`, Bearer authentication and `output_text`. citeturn973485search0 |
| Diagnostic | 11, 12, 13, 126 | **IMPLEMENTED / DESIGNED** — multi-skill evidence and English DNA persistence exist; true adaptive branching and acoustic speaking analysis remain incomplete. |
| Listening | 25, 26 | **IMPLEMENTED / NOT_STARTED** — Listening Lab is live across seven levels; dedicated reduced/connected-speech Ear system remains outstanding. |
| Writing | 22, 23, 24 | **IMPLEMENTED / DESIGNED** — AI writing feedback exists; revision/transfer/Say-It-Better UX is incomplete. |
| Reading | 27 | **NOT_STARTED** — no dedicated reading engine is present yet. |
| Mediation | 29 | **DESIGNED** — represented in capability/missions metadata; standalone activity engine not yet implemented. |
| Memory | 44, 109 | **IMPLEMENTED** — spaced-review persistence exists; deeper retention/forgetting modelling is simplified. |
| Recommendation | 46, 79, 105, 111 | **IMPLEMENTED** — next-best-action and reason strings exist; full evidence fusion remains incomplete. |
| Security / auth | 63, 64, 117 | **IMPLEMENTED** — persistent accounts, sessions, route protection, isolation and validated AI boundaries are present; dedicated adversarial/security suite remains to be built. |
| Privacy / voice governance | 65, 66 | **NOT_STARTED** — deletion/export/consent/retention workflows require implementation. |
| Content quality / research | 5, 55, 56, 57, 70, 86, 87, 88, 122, 125 | **DESIGNED / NOT_STARTED** — current validators are schema-level; formal research, content QA, reviewer tooling and AI evaluation corpus remain outstanding. |

## Verification rule

A row is **not VERIFIED** merely because code exists or CI builds. The contract requires browser, API, persistence, state-transition and regression evidence where applicable.

## Execution-control audit

Sections **137–158** are execution-discipline requirements. They are enforced by the repository workflow, CI, decision log, and this ledger process. The final release audit will re-run sections 140, 141, 143, 144, 145, 146, 150, 151, 153, 154 and 155 against the final release head.

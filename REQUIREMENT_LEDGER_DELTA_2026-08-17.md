# §153 Requirement Ledger — Audit Delta — 2026-08-17

This file supplements `REQUIREMENT_LEDGER.json` with changes implemented after the baseline ledger was created. The main ledger remains the full 1–136 matrix; this delta records newly verified implementation locations and evidence targets.

| Requirement ID | Change | Code location | Test location | Current status | Evidence / limitation |
|---|---|---|---|---|---|
| 14 | Explicit mastery graph with capability nodes and prerequisite edges | `src/domain/mastery-graph.ts` | `src/domain/mastery-graph.test.ts` | IMPLEMENTED | State machine now requires repeated evidence and spontaneous use for MASTERED. |
| 15 | Evidence-based mastery state machine | `src/domain/mastery-graph.ts` | `src/domain/mastery-graph.test.ts` | IMPLEMENTED | Single successful response cannot produce MASTERED. |
| 30 | Seven learning worlds | `src/domain/missions.ts`, `app/worlds/page.tsx` | `src/domain/missions.test.ts`, E2E surface coverage | IMPLEMENTED | Learner-facing world overview is now present; dynamic mission orchestration remains incomplete. |
| 31 | Meaningful mission model | `src/domain/missions.ts`, `app/worlds/page.tsx` | `src/domain/missions.test.ts`, E2E surface coverage | IMPLEMENTED | Missions include objectives, skill mix, evidence and success criteria. |
| 32 | Boss mission model | `src/domain/missions.ts` | `src/domain/missions.test.ts` | IMPLEMENTED | Integrated multi-skill tasks represented; full boss execution still pending. |
| 35 | Interest signals and broadening policy | `src/domain/teacher-adaptation.ts` | `src/domain/teacher-adaptation.test.ts` | IMPLEMENTED | Interest scoring/broadening policy exists; persistent interest table is not yet complete. |
| 39 | Adaptive teaching moves | `src/domain/teacher-adaptation.ts`, `app/api/teacher-help/route.ts` | `src/domain/teacher-adaptation.test.ts` | IMPLEMENTED | Evidence/confusion/repeated-failure decisions are executable. |
| 40–41 | “I don’t understand” / Explain Differently modes | `src/domain/teacher-adaptation.ts`, `app/api/teacher-help/route.ts` | `src/domain/teacher-adaptation.test.ts` | IMPLEMENTED | Authenticated teacher-help endpoint supports multiple explanation modes. |
| 42 | Thinking-in-English progression | `src/domain/teacher-adaptation.ts`, `app/api/teacher-help/route.ts` | `src/domain/teacher-adaptation.test.ts` | IMPLEMENTED | Level-sensitive progression prompts exist; long-term measurement remains incomplete. |
| 43 | Error intelligence | `src/domain/error-intelligence.ts`, `app/api/practice/submit/route.ts` | `src/domain/error-intelligence.test.ts`, E2E review flow | IMPLEMENTED | Classification, confidence, intervention, review timing and persistence added. |
| 48 | Learning session modes | `src/domain/learning-systems.ts`, `app/worlds/page.tsx` | `src/domain/learning-systems.test.ts` | IMPLEMENTED | Quick Quest, Standard Journey, Deep Study, Boss Mission defined. |
| 53–56 | Content provenance / QA / rubric foundations | `src/domain/learning-systems.ts`, `src/domain/research-and-governance.ts` | `src/domain/learning-systems.test.ts`, `src/domain/research-and-governance.test.ts` | IMPLEMENTED | Content source/license/approval metadata and review gates now modeled. Full reviewer tooling remains pending. |
| 59 | Accessibility foundation | `app`, `app/globals.css` | Browser suite | DESIGNED | Formal WCAG audit still required. |
| 65–66 | Privacy / voice governance | `db/schema.sql`, `app/api/privacy/route.ts`, `app/settings/page.tsx` | E2E privacy test added | IMPLEMENTED | Preferences and voice consent are persisted and authenticated; deletion/export workflows remain pending. |
| 72 | Event-based state | `db/schema.sql`, learner APIs | E2E learner state tests | IMPLEMENTED | Core event table exists; event coverage is not yet universal. |
| 86 | AI content validation | `app/api/ai/_shared.ts` | CI type/build + AI unit coverage | IMPLEMENTED | Structured JSON and field validators exist; live provider execution awaits OpenAI key. |
| 90–91 | Runtime reliability | `app/api/health`, `scripts/start.mjs`, Railway config | Railway deployment gate | IMPLEMENTED | Healthy Railway deployment and controlled provider timeouts/errors. |
| 97 | MVP learner journey | `app/auth`, `app/onboarding`, `app/diagnostic`, `app/dashboard`, `app/practice`, `app/speaking`, `app/review` | `tests/e2e/learner-journey.spec.ts` | VERIFIED on prior gate; current head re-running | Prior complete gate was green; latest browser-enhanced head is re-running. |
| 126 | English DNA Diagnostic MVP | `app/diagnostic`, `src/domain/diagnostic.ts` | E2E diagnostic test | VERIFIED on prior gate; current head re-running | Multi-skill evidence persists; true adaptive branching/acoustic speech remain limitations. |
| 153 | Required ledger | `REQUIREMENT_LEDGER.json`, `REQUIREMENT_LEDGER.md`, this delta | CI/repo audit | IMPLEMENTED | Full 1–136 baseline exists; delta records post-baseline changes. |

## Provider gate

OpenAI is the authoritative AI provider in `app/api/ai/_shared.ts`. Live production AI is currently **BLOCKED** only because `OPENAI_API_KEY` is absent from the authoritative Railway `English-Wizard` service. The provider adapter uses OpenAI’s current Responses API pattern. citeturn484702search0

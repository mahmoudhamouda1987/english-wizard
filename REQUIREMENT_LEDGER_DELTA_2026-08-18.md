# Requirement Ledger Delta — 2026-08-18

This delta reconciles the §153 ledger against the current `main` implementation and production verification state. Historical entries are preserved; statuses are not upgraded without evidence.

## Production / infrastructure evidence

- GitHub authoritative repository: `mahmoudhamouda1987/English-Wizard-2.0-`, branch `main`.
- `English-Wizard` has a verified successful Railway deployment from the adaptive-diagnostic fix; its build completed TypeScript, static generation, image export, container start and `/api/health` healthcheck.
- PostgreSQL is `SUCCESS` with persistent storage and schema bootstrap enabled.
- `English_Wizard old version` remains untouched.

## Newly implemented / materially upgraded contract areas

| Sections | Current status | Evidence | Remaining limitation |
|---|---|---|---|
| 12–13 | IMPLEMENTED / TESTING | `adaptive-diagnostic.ts` + tests; diagnostic integration | Needs complete browser-level adaptive assessment evidence and richer history fusion |
| 14–15 | IMPLEMENTED | `mastery-graph.ts`, learner-state integration | Cross-modal persistence/analytics still being expanded |
| 17 | IMPLEMENTED | language-network/chunk model and learning surfaces | Rich lexical network and broad corpus coverage remain limited |
| 19 | IMPLEMENTED / TESTING | `evidence` model/API and E2E evidence flow | Full end-to-end integration across every learning surface still being expanded |
| 23–24 | IMPLEMENTED | Say-It-Better stages and transfer structures | Dedicated persisted revision session still needs full acceptance coverage |
| 26 | IMPLEMENTED | English Ear CEFR activities and route | Acoustic/native-corpus depth remains limited |
| 27 | IMPLEMENTED | Reading activity engine and route | Specialist/content depth and long-term assessment history remain incomplete |
| 28 | IMPLEMENTED | communication-function capability model | Broad curriculum mapping still being completed |
| 30–32 | IMPLEMENTED / TESTING | Worlds, Missions and Boss Mission domain + learner surfaces | Full mission result/mastery orchestration still being completed |
| 35 | IMPLEMENTED | persisted interest signals and scoring | Broad signal collection from every learner action remains incomplete |
| 39–42 | IMPLEMENTED | teaching adaptation/help/Explain Differently/Thinking-in-English domain + API | Dedicated UI coverage and longitudinal mastery tracking remain incomplete |
| 43 | IMPLEMENTED | recurring error intelligence tied to evidence | Dedicated mistakes analytics UX remains incomplete |
| 44 | IMPLEMENTED | spaced review queue and rescheduling | deeper forgetting/interleaving model remains simplified |
| 48 | IMPLEMENTED | session planner + Quick/Standard/Deep/Boss defaults | complete planner acceptance coverage still pending |
| 53–58 | IMPLEMENTED / TESTING | curriculum model, content governance, rubrics/AI evaluation structures | complete CEFR research-to-objective traceability still being expanded |
| 65–66 | IMPLEMENTED | privacy preferences, voice consent, export/delete | provider-specific voice retention terms must be configured before live voice claims |
| 68–70 | IMPLEMENTED / TESTING | OpenAI abstraction, routing/budgets, approved knowledge-source policy | live provider credential and full retrieval execution remain external/config dependent |
| 72–74 | IMPLEMENTED | event, learning analytics, experiment and entitlement models | production population/causal validation not yet available |
| 86–90 | IMPLEMENTED / TESTING | content pipeline, review gates, admin overview, version/audit/observability domain | full admin CRUD and production observability dashboards remain incomplete |
| 91 | IMPLEMENTED | retry/fallback/graceful-failure policies | queue/background-job infrastructure remains partial |
| 93–94 | IMPLEMENTED / TESTING | entitlement/quota model and persistence | payment provider integration is intentionally deferred |
| 119 | IMPLEMENTED | `docs/ARCHITECTURE_PACKAGE.md`, research map, documentation index | individual specialist documents are mapped rather than duplicated unnecessarily |
| 121–123 | IMPLEMENTED / TESTING | unit/E2E/security evidence, AI evaluation dataset, human-review gates | full performance/adversarial dataset execution remains outstanding |
| 124–125 | IMPLEMENTED | architecture package + research map | curriculum research mapping still requires wider descriptor coverage |
| 126–131 | IMPLEMENTED / TESTING | diagnostic, personalised session, AI context, adaptive recommendation, mission/session planner | complete end-to-end evidence still required for some advanced flows |
| 137–158 | IMPLEMENTED as execution process | master contract, ledger/deltas, CI/Railway gate | final release audit remains outstanding until all critical gates pass |

## Remaining genuine blockers / gaps

1. Live OpenAI generation requires `OPENAI_API_KEY` in the production Railway environment; code is provider-ready but live AI generation cannot be honestly marked VERIFIED without the credential.
2. Acoustic pronunciation scoring remains transcript/proxy based unless a real speech-analysis provider is configured.
3. Full C2 `LIVE IN ENGLISH` endgame is not yet a complete multi-stage simulated day.
4. Offline sync/native mobile clients are not implemented; the architecture remains web-first.
5. Global payment-provider integration and production billing are not enabled; the entitlement layer exists separately from learning logic.
6. Full adversarial prompt-injection testing, large-scale performance testing, and production AI evaluation execution remain final-gate work.

## Release rule

The last successful production deployment remains the fallback while the latest `main` head is being verified. A queued/building deployment is not counted as a release until build, schema, health, browser/E2E, persistence and regression evidence all pass.

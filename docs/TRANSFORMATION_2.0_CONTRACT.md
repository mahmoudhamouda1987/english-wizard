# English Wizard 2.0 — Transformation Contract

Working contract distilled from the 159-part "ENGLISH WIZARD 2.0 — MEGA PRODUCT TRANSFORMATION" specification.
Rule: fatal to leave anything unexecuted. No partial delivery.

## Principle
ONE LEARNER → ONE LEARNER INTELLIGENCE PROFILE → MULTIPLE PRODUCTS → ONE CONNECTED JOURNEY.
One platform, five distinct products, shared infrastructure. No gamified illusion of progress.

## A. Already satisfied by the 1.0 renovation (verified in audit)
- Semantic token system, light + dark themes (Parts 7–11)
- Persistent header, 8 collapsible sidebar groups, mobile tab bar + drawer (Parts 12–14, 112)
- Removals as redirect stubs: Quick Practice, Leaderboard, Mistakes, Achievements (Part 15)
- Dashboard command centre, no XP (Parts 28–32)
- Worlds & Missions: 42 worlds / 7 CEFR levels / mission exercise plans (Parts 17–27)
- Practise studios: Conversation, Role-play, Speaking Coach, Say It Better, Voice Time Machine, Reality Checkpoints (Parts 37–45)
- Skills studios: English Ear, Scenes, Reading Engine, Writing, Vocabulary, Grammar, Thinking in English (Parts 46–53)
- Review & Progress trio (Parts 33–36)
- Professional report engine + PDF, verification (Parts 89–93)
- Subscription / trial / entitlement engines (Parts 128–130)
- Analytics, privacy, recordings consent (Parts 121–122, 131)
- IELTS domain: variants, band targets 4.0–9.0, stage model teach/guided/timed/module-test/mock, item banks, grading (Parts 58–67 data layer)
- Cambridge domain: A2 Key → C2 Proficiency specs, item pool, grading, scale estimate (Parts 72–76 data layer)

## B. Gaps to close in 2.0 (execution order)
1. **SPINE**
   - "Check My English" → "Check My Level" everywhere (hero nav, hero CTA, LevelCheck section, dashboard, onboarding). Part 5/158.
   - Public header: Learn / Levels / Skills / For Organizations / Pricing / Sign In + single CTA CHECK MY LEVEL. Part 5.
   - Diagnostic journey header branded LEVELCHECK: logo · LEVELCHECK … Theme · Exit. Part 6.
   - Sidebar gains PRODUCTS group: General English, Business English, IELTS, Cambridge, Fluency Track. Parts 3/14/16.
2. **INTELLIGENCE (one source of truth)**
   - Level-consistency: every product page reads the same learner CEFR state; no page-local level decisions. Part 105/104/106.
   - Weak-spot loop: recurring errors drive recommendations across Grammar, Vocabulary, Say It Better, Role-play, Review, IELTS, Business. Part 85.
3. **PRODUCTS — each with own route, landing page, curriculum, progress, entitlement**
   - /general-english — product overview wired to existing worlds/lessons/skills. Parts 17/107/108.
   - /business-english — renamed from "Professional English"; outcome model (write the email, run the meeting…); modules; Practise Your Actual Thing. Parts 54–57/86.
   - /ielts — product hub: Academic/GT, target band, four skills, plan, mocks, reports, readiness, target gap, OSR-aware targeted skill plan. Parts 58–71.
   - /cambridge — product hub: qualification selection, papers, benchmarks, readiness, scale estimate. Parts 72–76.
   - /fluency-track — NEW: B1→C2 entry gate, 16 signature modules, Business/Life fluency, module runner, Conversation Gym ties. Parts 77–84.
   - Shared exam engine abstraction: scoring_type (ielts_band / cambridge_scale / cefr_estimate). Parts 75/76/155.
4. **TESTS & EXAMS reposition** — /pathways becomes pure assessment infrastructure (LevelCheck, module tests, full mocks); products leave it. Part 16.
5. **PRACTISE YOUR ACTUAL THING** — paste job description / email → bespoke practice. Premium differentiator. Parts 56/86.
6. **EVIDENCE** — Fluency Passport shareable credential page; report type registry. Parts 87/88/89.
7. **COMPONENTS** — single translation component (WordPopover platform-wide, verified), audio component, recording component reuse audit. Parts 124–126.
8. **SEARCH** — extend index: products, IELTS/Cambridge modules, worlds, vocabulary, grammar, reports. Part 136.
9. **PRICING** — product-led presentation (Core, Business, IELTS, Cambridge, Fluency, All Access, Organisation), configurable numbers. Part 109.
10. **B2B FOUNDATIONS** — assessment API architecture: org, candidate link, cohort dashboard, verification, metering stubs. Parts 94–96.
11. **ROUTE-BY-ROUTE CLOSURE** — every existing page on the new system; rebuild, merge, redirect or deliberately retire. Final command.
12. **QA GATE** — Part 158 Definition of Done checklist; both themes; all bands; desktop/tablet/mobile; no console errors; no dead links; no fake functionality; no contradictory levels.

## C. Out of scope for this phase (architecture only)
- Industry English content (Part 57 — architecture only), Human expert layer (98), Peer pods (99), TOEFL/PTE (155 — via scoring_type), Outcomes report publication (100 — data only).

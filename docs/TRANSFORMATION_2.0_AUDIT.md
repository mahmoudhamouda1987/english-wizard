# English Wizard 2.0 — Route-by-Route Audit

Audit date: 2026-08-30. Base: e917bda (deployed production). 52 pages inventoried.

## Page inventory + disposition

| Route | Status after 1.0 | 2.0 disposition |
|---|---|---|
| / (public homepage) | Renovated | CTA rename → CHECK MY LEVEL; header per Part 5 |
| /auth, /onboarding, /welcome | Renovated | CTA rename in onboarding; goal → product selection (Part 157) |
| /diagnostic | LevelQuest flow | Branded LEVELCHECK journey header (Part 6) |
| /report, /certificate/[id], /plan, /pricing | Live | Pricing → product-led; report engine verified |
| /dashboard | Command centre | Level source of truth wired to intelligence (Part 105) |
| /learning-path (My Journey) | Rebuilt 1.0 | Keep; link products |
| /learn, /learn/[lessonId] | Rebuilt 1.0 | Keep (General English surface) |
| /worlds, /worlds/live-in-english, /mission | Rebuilt 1.0 | Keep; feed /general-english |
| /conversation | Rebuilt 1.0 | Keep; doubles as Conversation Gym anchor (Part 81) |
| /roleplay | Rebuilt 1.0, all bands | Keep; personas + guided/pressure verified (Parts 82–83) |
| /pronunciation (Speaking Coach) | Rebuilt 1.0 | Keep |
| /say-it-better, /time-machine, /checkpoints | Rebuilt 1.0 | Keep |
| /review, /progress, /portfolio | Rebuilt 1.0 trio | Keep; portfolio gains Fluency Passport link |
| /english-ear, /scenes, /reading, /writing | Rebuilt 1.0 | Keep |
| /vocabulary, /grammar, /thinking-in-english | Rebuilt 1.0 | Keep; weak-spot loop wiring (Part 85) |
| /chunks, /mediation | Live | Keep (Skills/Tools adjacency unchanged) |
| /teacher-help, /community, /referral | Live | Keep |
| /settings, /search | Live | Search index extension (Part 136) |
| /pathways (Tests & Exams) | Mixed products+assessment | SPLIT: pure assessment infra; products leave (Part 16) |
| /pathways/ielts | Module surface inside pathways | MIGRATE → /ielts product + redirect |
| /pathways/cambridge | Module surface inside pathways | MIGRATE → /cambridge product + redirect |
| /pathways/professional | "Professional English" | RENAME → /business-english + redirect (Part 54) |
| /pathways/mock | Mock runner | Keep under Tests & Exams; linked from /ielts + /cambridge |
| /achievements, /leaderboard, /mistakes, /practice | Redirect stubs | Keep stubs (retired deliberately) |
| /admin/content, /admin/funnel | Admin | Keep; cohort dashboard added (Part 96) |
| /offline | PWA | Keep |
| NEW /general-english | — | Build (Part 107) |
| NEW /business-english | — | Build (Parts 54–57) |
| NEW /ielts | — | Build product hub on existing domain (Parts 58–71) |
| NEW /cambridge | — | Build product hub on existing domain (Parts 72–76) |
| NEW /fluency-track | — | Build domain + product (Parts 77–84) |
| NEW /fluency-passport | — | Build (Part 88) |
| NEW /business-english/actual-thing | — | Build Practise Your Actual Thing (Parts 56/86) |
| NEW /api/b2b/* | — | Architecture (Parts 94–96) |

## Intelligence audit (Part 105)
- Single source: /api/dashboard learner state (CEFR + percent) is the only level authority; sidebar widget already consumes it.
- Product pages must fetch the same state — no page-local level inference. Enforced via shared helper.
- Weak-spot engine exists (error-intelligence, spaced-repetition, mastery-graph); cross-product recommendation surface to be added.

## Component audit (Parts 124–126)
- Translation: WordPopover is the single platform component (EN↔AR + audio). Verified reused; no per-page popups found.
- Audio: tts.ts + listening-lab shared. Assessment replay rules respected in exam mock (single-play enforced in runner).
- Recording: shared recorder across speaking surfaces; reuse extended to Fluency Track.

## Verdict
All 52 existing routes either keep (38), migrate/rename (3), redirect (4 already stubs), remain admin/PWA (3), or are being deliberately split (/pathways family). New builds: 7 pages + 1 domain module + B2B API architecture.

## Closure status (2026-08-31 — all gates green)
- CTA rename verified: zero "Check My English" references; "Check My Level" on public header, hero, LevelCheck section, dashboard, onboarding.
- Public header: Learn / Levels / Skills / Check My Level / For Organizations / Pricing + Sign in + single primary CTA.
- Journey header on /diagnostic: English Wizard · LEVELCHECK pill · progress · timer · Navigator · Theme · Exit.
- Sidebar: nine groups incl. PRODUCTS (General English, Business English, IELTS, Cambridge, Fluency Track); Quick Practice, Leaderboard, LevelQuest nav, Mistakes/Achievements absent by design.
- Product surfaces live: /general-english, /business-english (+ /actual-thing), /ielts (+ /course), /cambridge (+ /course), /fluency-track (B1 entry gate), /fluency-passport, /verification, /assessment/[link] (candidate B2B page).
- Redirects enforced: /pathways/ielts → /ielts/course, /pathways/cambridge → /cambridge/course, /pathways/professional → /business-english.
- Fixes this pass: IELTS + Cambridge hubs gained the missing `<main id="main-content">` landmark; WordPopover + Conversation TooltipWord now fetch dictionary data lazily on first hover (removes per-view request flood); unused lint variables eliminated.
- Gates: typecheck clean · ESLint 0 problems · 302/302 unit · production build OK · E2E 87 passed / 1 skipped (deliberate live-AI case) · visual QA on home, dashboard, all five product pages, Fluency Passport, dark + mobile.

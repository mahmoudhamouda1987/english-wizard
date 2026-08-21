# Requirement Ledger Delta — 2026-08-19

## Purpose

This delta reconciles the §153 audit record with the verified `main` production head and the latest Railway deployment history. It does not erase prior historical evidence.

## Verified production baseline

- Railway service: `English-Wizard`
- Verified successful commit: `7e262aa55f300eba085fbebc3fb8e1abd6a70c14`
- Commit: `feat: link C2 Live in English boss mission`
- Build: successful
- TypeScript: successful
- Static pages: `40/40`
- Docker image: successfully exported and pushed
- Runtime: Next.js started successfully
- Healthcheck: `/api/health` succeeded
- PostgreSQL: healthy
- `English_Wizard old version`: untouched and healthy

## Historical failed deployments reconciled

The following deployments were inspected and are classified as historical Railway deployment failures whose builds completed successfully and whose behavior was superseded by later successful descendants:

1. `6c364bc8-ceab-4575-9de2-d1aa6d8c636e` — `feat: add learner-facing I Dont Understand teacher help flow`
2. `8f9c9b36-2ce6-4a62-a6fa-990ca6507e54` — `feat: add learner-facing Thinking in English practice`
3. `af37805f-f5fb-48a7-b3a4-32b8a91d656d` — `feat: persist Thinking in English learner evidence`
4. `6aa6a084-6ef1-46c7-8d6b-c7122a38ac47` — `feat: implement C2 Live in English multi-stage endgame engine`
5. `b702f8b5-16d6-40c5-bbce-2717a69cb33d` — `test: verify C2 Live in English stage progression`
6. `b3abcacc-060b-4179-99b3-8d3152812a4a` — `feat: add learner-facing C2 Live in English endgame`

For these six failures, Railway build logs showed successful compilation, TypeScript completion, static page generation, Docker image export and image push. The failures therefore do not remain as unresolved source/build defects. They remain historical deployment records and must not be relabeled as successful.

## Ledger reconciliation corrections

The original 2026-08-17 ledger is stale in several areas. Current repository evidence now shows concrete implementations for areas that were previously listed as NOT_STARTED, including:

- chunk/collocation and communication-function network;
- learner-facing teacher-help flow;
- Thinking in English learner surface;
- C2 Live in English endgame and Boss Mission linkage;
- privacy preferences and voice-consent APIs;
- IELTS/Cambridge/professional pathway model;
- AI evaluation cases;
- content governance/review/release structures;
- provider-agnostic billing and locale helpers;
- explainable next-action primitives;
- evidence-backed dashboard;
- integrated learning-loop state model.

These are not automatically VERIFIED merely because code exists; implementation evidence must still be matched with acceptance, persistence and regression evidence where required.

## Current genuine gaps to keep open

The audit continues to treat these as incomplete until evidence is stronger:

- formal CEFR research/provenance mapping with descriptor-level traceability;
- true adaptive diagnostic branching backed by production acceptance evidence;
- acoustic pronunciation/speech-quality analysis rather than transcript-only proxy scoring;
- deep forgetting/retention modelling and varied-context interleaving;
- complete mediation activity engine and assessment;
- full learner-facing mission orchestration and integrated lesson-loop UX across all modes;
- comprehensive content/activity/assessment repositories and licensing metadata;
- rigorous AI evaluation execution against the evaluation corpus, not only case definitions;
- production billing integration rather than provider-agnostic architecture alone;
- offline/native clients;
- final adversarial security, accessibility, performance and release-gate evidence;
- full final §153 verification across all 136 product requirements.

## OpenAI provider state

`OPENAI_API_KEY` has been configured on the authoritative Railway `English-Wizard` service. The key is kept server-side and is not committed to the repository. Live provider execution must still be acceptance-tested in production without exposing the secret.

## Release rule

Use `7e262aa...` as the current verified baseline. New work must follow:

`PLAN → BUILD → TEST → VERIFY → FIX → RETEST → CONTINUE`

Do not stack deployment commits while Railway is still processing the prior release candidate.

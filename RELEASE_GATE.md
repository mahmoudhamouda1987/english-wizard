# Release Gate

This file identifies the canonical production target used by the contract release process.

**Authoritative Railway project:** `stellar-integrity`  
**Authoritative Railway service:** `English-Wizard`  
**Environment:** `production`  
**Source:** `mahmoudhamouda1987/English-Wizard-2.0-` @ `main`  
**Public domain:** `english-wizard-production.up.railway.app`

`English_Wizard old version` is not an active release target and must remain untouched during normal release work.

## Gate sequence

PLAN → BUILD → TEST → VERIFY → FIX → RETEST → CONTINUE

## Required evidence

1. Source revision is on `main`.
2. Railway build succeeds.
3. Application typecheck/build succeeds.
4. Database pre-deploy/schema step succeeds.
5. `/api/health` succeeds.
6. Browser/API regression evidence exists for changed learner flows.
7. No requirement is marked VERIFIED merely from source existence or compilation.

## External credential gate

Live OpenAI execution requires `OPENAI_API_KEY` on the authoritative service. Absence of that credential is a real production dependency and must remain visible rather than being simulated.

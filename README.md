# English Wizard 2.0

English Wizard is an adaptive AI English-learning platform built around evidence-driven personalization rather than a static course sequence.

## Authoritative specification

`MASTER_EXECUTION_CONTRACT.md` is the single execution contract for the repository. Requirements must be implemented and then verified; source existence or compilation alone is never treated as completion.

## Current state

The repository now contains a working learner architecture covering onboarding, adaptive diagnostic, English DNA, learner state, mastery/evidence, lessons, missions, review, reading, listening/English Ear, speaking, writing/Say-It-Better, teacher adaptation, privacy workflows, content governance and production deployment infrastructure.

The current release process is continuous:

**PLAN → BUILD → TEST → VERIFY → FIX → RETEST → CONTINUE**

Historical failed Railway deployments remain immutable records. They are not relabeled as successful. A failed attempt is considered resolved only when its defect is corrected in a later revision and that corrected revision receives a new successful deployment and the appropriate regression evidence.

## Current production target

- Railway project: `stellar-integrity`
- Railway service: `English-Wizard`
- Environment: `production`
- Source: `main`

The older `English_Wizard old version` service is not part of the active release target.

## Development commands

```bash
npm install
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run dev
```

Final release acceptance additionally requires the browser/API, persistence, AI, curriculum, security, accessibility, performance, deployment and regression gates in the master contract.
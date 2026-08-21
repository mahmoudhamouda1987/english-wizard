# Railway Deployment Reconciliation — 2026-08-20

## Rule used

A failed Railway deployment is an immutable historical attempt. It is never renamed or retroactively marked successful.

The acceptance chain required by the master contract is:

**FAILED ATTEMPT → ROOT CAUSE → CORRECTIVE REVISION → NEW DEPLOYMENT → VERIFIED RESULT**

## Next-action contract failure train

The consecutive failures around 20:40–20:41 were revisions of the same learner `nextAction` contract migration:

- `1569f683…` — align learner state with rich next-action recommendation
- `fcd413e5…` — normalize legacy learner next-action records
- `ddf534cb…` — complete diagnostic next-action recommendation payload
- `2331fda8…` — initialize learner with complete next-action recommendation
- `e9739812…` — preserve complete next-action contract during progression
- `...` subsequent progression/test revisions

The corrective chain converged on commit `9792319034…`, whose Railway deployment passed build, TypeScript, page generation, database initialization and application startup. That deployment was later superseded by newer source revisions; it was not retroactively used to rename the failed attempts.

## AI/RAG/provider-controls release

PR #2 was merged as `e1f98e2d…`. Its Railway deployment passed successfully before the next release batch.

## Evidence-to-mastery / learning-loop release

PR #3 was merged as `9a35124c…`. The first production attempt failed, so the release was not treated as accepted. Later corrected source revisions were included in the subsequent release train and were re-tested through Railway.

## Evidence-fusion failure train

The following failures were all part of the evidence-fusion/mastery integration sequence:

- `a0a7393b…` — evidence-fusion feature implementation
- `cb539ac3…` — evidence-fusion regression test
- `0e6d7a11…` — evidence-fusion diagnostic integration
- `dcf2b46f…` — safe evidence-to-mastery merge

The concrete root causes were TypeScript shape mismatches at the mastery update boundary and the English DNA profile contract. They were fixed by the subsequent commits:

- `2eab8c86…` — safe evidence-to-mastery merge
- `2dc22150…` — typed diagnostic evidence-fusion data in English DNA

The corrected `2dc22150…` Railway deployment reached **SUCCESS**, including TypeScript, static page generation, Docker image creation, database initialization and `next start` readiness.

## Adaptive diagnostic release

PR #4 was merged as `ed7a9aca…`.

The normal deployment `b90a7465…` reached **SUCCESS**.

An explicit Railway redeploy was then performed to verify the corrected release independently of the preceding deployment. The duplicate concurrent redeploy was removed by Railway; deployment `0a14a364…` reached **SUCCESS** for the same corrected `ed7a9aca…` source revision.

## Important interpretation

The repository therefore does **not** claim that any historical FAILED deployment itself succeeded. It claims only that the defect represented by each failed attempt was corrected in a later revision and that the corrected revision obtained new deployment evidence.

The remaining contract audit must continue from the current successful `main` head and must not skip any requirement merely because a later deployment succeeded.
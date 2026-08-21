# AI Cost, Routing and Retrieval Policy

## Provider routing

AI work is routed through `src/domain/ai-operations.ts` by task and complexity. The live provider boundary uses that routing rather than directly hard-coding one model for every task.

## Usage budget

Each authenticated learner has a daily usage ledger in `ai_usage_daily`.

Default safeguards:

- `OPENAI_DAILY_HARD_LIMIT_CENTS=500` (5.00 USD of conservative estimated usage)
- `OPENAI_ESTIMATED_COST_CENTS_PER_1K_TOKENS=1`

These are protective defaults, not provider billing claims. They can be changed through Railway environment configuration after a pricing/cost decision is made.

Requests reserve an estimate before calling the provider, fail closed when the daily hard limit is exhausted, and record provider outcome/latency/usage telemetry without storing prompts or raw learner content in observability metadata.

## Governed retrieval

Only knowledge documents whose document and source are both approved for RAG and whose rights are not pending/rejected can enter AI context.

The current retrieval implementation is deterministic lexical ranking. Embeddings can be introduced later through the explicit provider contract without changing the governance gate.

## Reliability rule

A missing provider, exhausted budget, malformed AI response, timeout, or provider failure must return a controlled learner-safe error. No UI state may claim a successful learning result when provider processing failed.

import { describe, expect, it } from 'vitest';
import { budgetState, canSpend, passesQualityGate, routeAITask } from './ai-operations';
import { assignVariant, hasEntitlement, summarizeOutcomes } from './product-operations';

describe('advanced systems', () => {
  it('routes AI tasks by complexity and applies budgets', () => {
    expect(routeAITask('DIAGNOSTIC', 'HIGH').tier).toBe('PREMIUM');
    expect(canSpend({ learnerId: '1', dailyCents: 100, usedCents: 90, hardLimitCents: 100, softLimitCents: 80 }, 10)).toBe(true);
    expect(budgetState({ learnerId: '1', dailyCents: 100, usedCents: 100, hardLimitCents: 100, softLimitCents: 80 })).toBe('HARD_LIMIT');
  });

  it('rejects weak AI quality results', () => {
    expect(passesQualityGate({ validSchema: true, alignedLevel: true, safe: true, grounded: true, useful: true, hallucinationRisk: 0.1 })).toBe(true);
    expect(passesQualityGate({ validSchema: true, alignedLevel: true, safe: true, grounded: true, useful: true, hallucinationRisk: 0.8 })).toBe(false);
  });

  it('summarizes learning outcomes and deterministically assigns experiments', () => {
    const summary = summarizeOutcomes([
      { learnerId: '1', eventType: 'capability_improved', outcome: 'LEARNING', value: 0.7, metadata: {}, occurredAt: new Date().toISOString() },
      { learnerId: '1', eventType: 'transfer_success', outcome: 'LEARNING', value: 1, metadata: {}, occurredAt: new Date().toISOString() }
    ]);
    expect(summary.capabilityImprovement).toBe(0.7);
    expect(summary.transferRate).toBe(1);
    const experiment = { id: 'x', name: 'x', hypothesis: 'x', variants: ['A', 'B'], primaryMetric: 'retention', guardrails: [], status: 'RUNNING' as const };
    expect(assignVariant(experiment, 'learner-1')).toBe(assignVariant(experiment, 'learner-1'));
  });

  it('enforces entitlement windows', () => {
    const entitlement = { learnerId: '1', plan: 'PREMIUM' as const, features: ['deep-study'], effectiveAt: new Date(Date.now() - 1000).toISOString() };
    expect(hasEntitlement(entitlement, 'deep-study')).toBe(true);
    expect(hasEntitlement(entitlement, 'ielts')).toBe(false);
  });
});

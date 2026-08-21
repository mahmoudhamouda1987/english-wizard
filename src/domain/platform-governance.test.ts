import { describe, expect, it } from 'vitest';
import { canRetrieve, canUseFeature, redactSensitiveMetadata, shouldContinueExperiment, type Entitlement, type Experiment, type KnowledgeSource, type RetrievalPolicy } from './platform-governance';

describe('platform governance', () => {
  it('blocks unapproved knowledge sources', () => {
    const source: KnowledgeSource = { id: 'x', title: 'Example', sourceType: 'REFERENCE', rights: 'PENDING_REVIEW', approvedForRag: false };
    const policy: RetrievalPolicy = { sourceIds: ['x'], allowExternalUrls: false, requireApprovedSources: true, requireCitationForFactualClaims: true, maxResults: 5 };
    expect(canRetrieve(source, policy)).toBe(false);
  });

  it('enforces feature quotas', () => {
    const entitlement: Entitlement = { learnerId: 'l1', tier: 'FREE', feature: 'speaking', quota: 5, used: 4 };
    expect(canUseFeature(entitlement, 1)).toBe(true);
    expect(canUseFeature(entitlement, 2)).toBe(false);
  });

  it('requires learning outcomes and guardrails for running experiments', () => {
    const experiment: Experiment = { id: 'e1', name: 'explanation', hypothesis: 'brief explanations improve mastery', status: 'RUNNING', control: 'brief', variants: ['example-first'], primaryLearningMetric: 'MASTERY', guardrailMetrics: ['retention'] };
    expect(shouldContinueExperiment(experiment)).toBe(true);
  });

  it('redacts sensitive observability metadata', () => {
    expect(redactSensitiveMetadata({ route: '/api/x', learnerId: 'l1', apiKey: 'secret', token: 'secret', ok: true })).toEqual({ route: '/api/x', learnerId: 'l1', ok: true });
  });
});

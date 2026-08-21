export type EventOutcome = 'LEARNING' | 'RETENTION' | 'PERSONALIZATION' | 'UX' | 'BUSINESS';

export interface LearningOutcomeEvent {
  learnerId: string;
  eventType: string;
  capabilityId?: string;
  outcome: EventOutcome;
  value?: number;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

export interface OutcomeSnapshot {
  capabilityImprovement: number;
  retentionRate: number;
  transferRate: number;
  productionRate: number;
  errorRecoveryRate: number;
}

export interface ExperimentDefinition {
  id: string;
  name: string;
  hypothesis: string;
  variants: string[];
  primaryMetric: string;
  guardrails: string[];
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
}

export interface ExperimentAssignment {
  experimentId: string;
  learnerId: string;
  variant: string;
  assignedAt: string;
}

export interface LocaleContext {
  locale: string;
  timezone: string;
  currency: string;
  englishVariety: 'BRITISH_REFERENCE' | 'AMERICAN' | 'INTERNATIONAL';
}

export interface Entitlement {
  learnerId: string;
  plan: 'FREE' | 'PREMIUM' | 'INSTITUTIONAL';
  features: string[];
  effectiveAt: string;
  expiresAt?: string;
}

export function summarizeOutcomes(events: LearningOutcomeEvent[]): OutcomeSnapshot {
  const learning = events.filter((e) => e.outcome === 'LEARNING');
  const value = (name: string) => {
    const values = learning.filter((e) => e.eventType === name).map((e) => e.value ?? 0);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };
  return {
    capabilityImprovement: value('capability_improved'),
    retentionRate: value('retention_success'),
    transferRate: value('transfer_success'),
    productionRate: value('production_success'),
    errorRecoveryRate: value('error_recovered')
  };
}

export function assignVariant(experiment: ExperimentDefinition, learnerId: string): string {
  if (!experiment.variants.length) throw new Error('Experiment has no variants');
  let hash = 0;
  for (const char of `${experiment.id}:${learnerId}`) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return experiment.variants[Math.abs(hash) % experiment.variants.length];
}

export function hasEntitlement(entitlement: Entitlement | undefined, feature: string, now = Date.now()): boolean {
  if (!entitlement || !entitlement.features.includes(feature)) return false;
  if (Date.parse(entitlement.effectiveAt) > now) return false;
  return !entitlement.expiresAt || Date.parse(entitlement.expiresAt) > now;
}

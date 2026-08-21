export type VersionKind = 'CURRICULUM' | 'CONTENT' | 'ASSESSMENT' | 'PROMPT' | 'MODEL' | 'API';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'APPROVE' | 'REJECT' | 'EXPORT' | 'CONSENT' | 'LOGIN' | 'LOGOUT';
export type ExperimentStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'CONCLUDED';
export type EntitlementTier = 'FREE' | 'PREMIUM' | 'FAMILY' | 'INSTITUTION';

export interface VersionRecord { id: string; kind: VersionKind; entityId: string; version: string; parentVersion?: string; createdAt: string; createdBy: string; changeSummary: string; }
export interface AuditEvent { id: string; learnerId?: string; actorId: string; action: AuditAction; entityType: string; entityId: string; metadata: Record<string, unknown>; occurredAt: string; }
export interface ObservabilityEvent { id: string; name: string; severity: 'INFO' | 'WARN' | 'ERROR' | 'FATAL'; traceId: string; durationMs?: number; route?: string; safeMetadata: Record<string, string | number | boolean>; occurredAt: string; }
export interface KnowledgeSource { id: string; title: string; sourceType: 'ORIGINAL' | 'LICENSED' | 'CEFR' | 'ASSESSMENT' | 'DICTIONARY' | 'CORPUS' | 'REFERENCE'; rights: 'OWNED' | 'LICENSED' | 'PUBLIC_DOMAIN' | 'ATTRIBUTED' | 'PENDING_REVIEW' | 'REJECTED'; approvedForRag: boolean; url?: string; consultedAt?: string; }
export interface RetrievalPolicy { sourceIds: string[]; allowExternalUrls: false; requireApprovedSources: true; requireCitationForFactualClaims: true; maxResults: number; }
export interface Experiment { id: string; name: string; hypothesis: string; status: ExperimentStatus; control: string; variants: string[]; primaryLearningMetric: 'MASTERY' | 'RETENTION' | 'ERROR_REDUCTION' | 'TRANSFER'; guardrailMetrics: string[]; }
export interface Entitlement { learnerId: string; tier: EntitlementTier; feature: string; quota?: number; used: number; resetAt?: string; }

export function canUseFeature(entitlement: Entitlement, requested = 1): boolean {
  if (entitlement.quota === undefined) return true;
  return entitlement.used + requested <= entitlement.quota;
}

export function canRetrieve(source: KnowledgeSource, policy: RetrievalPolicy): boolean {
  return policy.requireApprovedSources && source.approvedForRag && source.rights !== 'PENDING_REVIEW' && source.rights !== 'REJECTED';
}

export function shouldContinueExperiment(experiment: Experiment): boolean {
  return experiment.status === 'RUNNING' && Boolean(experiment.primaryLearningMetric) && experiment.guardrailMetrics.length > 0;
}

export function redactSensitiveMetadata(value: Record<string, unknown>): Record<string, string | number | boolean> {
  const blocked = new Set(['password', 'token', 'apiKey', 'audio', 'transcript', 'prompt']);
  return Object.fromEntries(Object.entries(value).filter(([key, item]) => !blocked.has(key) && ['string','number','boolean'].includes(typeof item))) as Record<string, string | number | boolean>;
}

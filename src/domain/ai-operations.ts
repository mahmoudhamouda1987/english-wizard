export type AITask = 'LESSON' | 'WRITING' | 'SPEAKING' | 'DIAGNOSTIC' | 'EXPLANATION' | 'CONTENT_QA' | 'EMBEDDING' | 'TRANSCRIPTION' | 'TTS';
export type ModelTier = 'FAST' | 'BALANCED' | 'PREMIUM';

export interface ModelRoute {
  task: AITask;
  tier: ModelTier;
  model: string;
  maxTokens: number;
  temperature: number;
  rationale: string;
}

export interface UsageBudget {
  learnerId: string;
  dailyCents: number;
  usedCents: number;
  hardLimitCents: number;
  softLimitCents: number;
}

export interface AIRequestFingerprint {
  task: AITask;
  normalizedInput: string;
  contextVersion: string;
}

export interface AIQualityGate {
  validSchema: boolean;
  alignedLevel: boolean;
  safe: boolean;
  grounded: boolean;
  useful: boolean;
  hallucinationRisk: number;
}

const DEFAULT_MODELS: Record<ModelTier, string> = {
  FAST: process.env.OPENAI_FAST_MODEL ?? process.env.OPENAI_MODEL ?? 'gpt-5.4-nano',
  BALANCED: process.env.OPENAI_MODEL ?? 'gpt-5.4-mini',
  PREMIUM: process.env.OPENAI_PREMIUM_MODEL ?? process.env.OPENAI_MODEL ?? 'gpt-5.4'
};

export function routeAITask(task: AITask, complexity: 'LOW' | 'MEDIUM' | 'HIGH'): ModelRoute {
  const tier: ModelTier = task === 'DIAGNOSTIC' || task === 'CONTENT_QA' || complexity === 'HIGH' ? 'PREMIUM' : complexity === 'LOW' ? 'FAST' : 'BALANCED';
  return {
    task,
    tier,
    model: DEFAULT_MODELS[tier],
    maxTokens: tier === 'FAST' ? 700 : tier === 'BALANCED' ? 1400 : 2200,
    temperature: tier === 'PREMIUM' ? 0.2 : 0.4,
    rationale: `Selected ${tier} for ${task} at ${complexity} complexity.`
  };
}

export function canSpend(budget: UsageBudget, estimatedCents: number): boolean {
  return budget.usedCents + estimatedCents <= budget.hardLimitCents;
}

export function budgetState(budget: UsageBudget): 'OK' | 'SOFT_LIMIT' | 'HARD_LIMIT' {
  if (budget.usedCents >= budget.hardLimitCents) return 'HARD_LIMIT';
  if (budget.usedCents >= budget.softLimitCents) return 'SOFT_LIMIT';
  return 'OK';
}

export function fingerprintRequest(request: AIRequestFingerprint): string {
  return `${request.task}:${request.contextVersion}:${request.normalizedInput.trim().replace(/\s+/g, ' ').toLowerCase()}`;
}

export function passesQualityGate(gate: AIQualityGate): boolean {
  return gate.validSchema && gate.alignedLevel && gate.safe && gate.grounded && gate.useful && gate.hallucinationRisk < 0.25;
}

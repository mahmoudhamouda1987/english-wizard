export type GenerationStage = 'OBJECTIVE' | 'SPECIFICATION' | 'GENERATED' | 'AUTOMATED_VALIDATION' | 'DIFFICULTY_VALIDATION' | 'ANSWER_VALIDATION' | 'CEFR_ALIGNMENT' | 'SAFETY_CHECK' | 'QUALITY_REVIEW' | 'DEPLOYED' | 'REJECTED';

export interface ActivitySpecification {
  contentId: string;
  objectiveId: string;
  level: string;
  skill: string;
  difficulty: number;
  expectedAnswer?: string;
  acceptableAnswers?: string[];
  source: string;
  rightsStatus: string;
}

export interface ValidationResult { passed: boolean; issues: string[]; }
export interface GeneratedActivityState { contentId: string; stage: GenerationStage; validations: Record<string, ValidationResult>; version: string; updatedAt: string; }

export function validateActivity(spec: ActivitySpecification): ValidationResult {
  const issues: string[] = [];
  if (!spec.objectiveId) issues.push('missing learning objective');
  if (!spec.level) issues.push('missing target level');
  if (!spec.skill) issues.push('missing target skill');
  if (spec.difficulty < 0 || spec.difficulty > 100) issues.push('difficulty outside 0-100');
  if (!spec.source) issues.push('missing source');
  if (['PENDING_REVIEW', 'REJECTED'].includes(spec.rightsStatus)) issues.push('content rights not publishable');
  return { passed: issues.length === 0, issues };
}

export function nextGenerationStage(current: GenerationStage, validationPassed: boolean): GenerationStage {
  if (!validationPassed) return 'REJECTED';
  const order: GenerationStage[] = ['OBJECTIVE','SPECIFICATION','GENERATED','AUTOMATED_VALIDATION','DIFFICULTY_VALIDATION','ANSWER_VALIDATION','CEFR_ALIGNMENT','SAFETY_CHECK','QUALITY_REVIEW','DEPLOYED'];
  const index = order.indexOf(current);
  return order[Math.min(index + 1, order.length - 1)] ?? 'OBJECTIVE';
}

export function canPublishActivity(state: GeneratedActivityState): boolean {
  return state.stage === 'QUALITY_REVIEW' && Object.values(state.validations).every((validation) => validation.passed);
}

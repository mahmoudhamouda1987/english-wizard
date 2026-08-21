import type { LearnerState } from './learner';

export interface RecommendationEvidence {
  type: 'ERROR' | 'MASTERY_GAP' | 'RETENTION' | 'GOAL' | 'DIAGNOSTIC' | 'TRANSFER';
  message: string;
  weight: number;
}

export interface ExplainableRecommendation {
  activityId: string;
  actionType: NonNullable<LearnerState['nextAction']>['type'];
  reason: string;
  evidence: RecommendationEvidence[];
}

export function explainRecommendation(activityId: string, actionType: ExplainableRecommendation['actionType'], evidence: RecommendationEvidence[]): ExplainableRecommendation {
  const ordered = [...evidence].sort((a, b) => b.weight - a.weight);
  const top = ordered.slice(0, 3);
  const reason = top.length ? `Recommended because ${top.map((item) => demoteSentenceStart(item.message)).join('; ')}.` : 'Recommended as the next evidence-based learning step.';
  return { activityId, actionType, reason, evidence: top };
}

function demoteSentenceStart(message: string): string {
  const trimmed = message.trim();
  const firstWord = trimmed.split(/\s+/)[0] ?? '';
  if (firstWord.length > 1 && firstWord === firstWord.toUpperCase()) return trimmed;
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

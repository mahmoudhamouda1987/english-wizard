import type { Skill } from "./learner";

export interface AssessmentObservation {
  skill: Skill;
  score: number;
  difficulty: number;
  correct: number;
  total: number;
  historyScores?: number[];
}

export interface AssessmentEvidenceSummary {
  skill: Skill;
  estimatedScore: number;
  evidenceCount: number;
  consistency: number;
  difficultyCoverage: number;
  confidence: number;
  uncertainty: number;
}

function clamp(value: number): number { return Math.max(0, Math.min(1, value)); }

export function summarizeAssessmentEvidence(observations: AssessmentObservation[]): AssessmentEvidenceSummary[] {
  const grouped = new Map<Skill, AssessmentObservation[]>();
  for (const item of observations) grouped.set(item.skill, [...(grouped.get(item.skill) ?? []), item]);

  return [...grouped.entries()].map(([skill, items]) => {
    const evidenceCount = items.reduce((sum, item) => sum + item.total, 0);
    const weightedScore = items.reduce((sum, item) => sum + item.score * Math.max(1, item.total), 0) / Math.max(1, evidenceCount);
    const history = items.flatMap((item) => item.historyScores ?? [item.score]);
    const mean = history.reduce((sum, score) => sum + score, 0) / Math.max(1, history.length);
    const variance = history.reduce((sum, score) => sum + (score - mean) ** 2, 0) / Math.max(1, history.length);
    const consistency = clamp(1 - Math.sqrt(variance) / 50);
    const difficultyValues = items.map((item) => item.difficulty);
    const difficultyRange = Math.max(...difficultyValues) - Math.min(...difficultyValues);
    const difficultyCoverage = clamp(difficultyRange / 3);
    const evidenceFactor = clamp(evidenceCount / 4);
    const confidence = clamp(0.35 * evidenceFactor + 0.35 * consistency + 0.30 * difficultyCoverage);
    return { skill, estimatedScore: Math.round(weightedScore), evidenceCount, consistency: Math.round(consistency * 100) / 100, difficultyCoverage: Math.round(difficultyCoverage * 100) / 100, confidence: Math.round(confidence * 100) / 100, uncertainty: Math.round((1 - confidence) * 100) / 100 };
  });
}

export function assessmentIsUncertain(summary: AssessmentEvidenceSummary, threshold = 0.6): boolean {
  return summary.confidence < threshold || summary.evidenceCount < 2 || summary.difficultyCoverage === 0;
}

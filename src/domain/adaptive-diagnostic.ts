import type { Skill, CEFRLevel } from "./learner";
import type { DiagnosticAnswer } from "./diagnostic";

export interface DiagnosticItem {
  id: string;
  skill: Skill;
  difficulty: number;
  objectiveId: string;
  correct: string;
}

export interface DiagnosticEvidence {
  skill: Skill;
  score: number;
  confidence: number;
  uncertainty: number;
  answered: number;
  correct: number;
  recentConsistency: number;
}

export interface AdaptiveDiagnosticState {
  targetLevel?: CEFRLevel;
  evidence: DiagnosticEvidence[];
  askedIds: string[];
  maxQuestions: number;
  minEvidencePerSkill: number;
}

export const DEFAULT_ADAPTIVE_ITEMS: DiagnosticItem[] = [
  { id: "q1", skill: "grammar", difficulty: 1, objectiveId: "a1-present-simple-routines", correct: "am" },
  { id: "q2", skill: "vocabulary", difficulty: 1, objectiveId: "a1-self-introduction-speaking", correct: "appointment" },
  { id: "q3", skill: "reading", difficulty: 1, objectiveId: "a1-self-introduction-speaking", correct: "meet him" },
  { id: "q4", skill: "listening", difficulty: 1.5, objectiveId: "a1-basic-listening-intent", correct: "station" },
  { id: "q5", skill: "speaking", difficulty: 1, objectiveId: "a1-self-introduction-speaking", correct: "my name is" },
  { id: "q6", skill: "writing", difficulty: 1, objectiveId: "a1-present-simple-routines", correct: "work" },
  { id: "q7", skill: "grammar", difficulty: 2, objectiveId: "a2-past-events", correct: "went" },
  { id: "q8", skill: "vocabulary", difficulty: 2, objectiveId: "a2-daily-interactions", correct: "schedule" },
  { id: "q9", skill: "reading", difficulty: 2, objectiveId: "a2-main-idea", correct: "because" },
  { id: "q10", skill: "listening", difficulty: 2, objectiveId: "a2-main-idea", correct: "tomorrow" },
  { id: "q11", skill: "grammar", difficulty: 3.5, objectiveId: "b1-authentic-listening", correct: "have been" },
  { id: "q12", skill: "vocabulary", difficulty: 3.5, objectiveId: "b1-opinion-writing", correct: "although" },
];

export function updateDiagnosticEvidence(state: AdaptiveDiagnosticState, item: DiagnosticItem, answer: DiagnosticAnswer): AdaptiveDiagnosticState {
  const correct = answer.answer.trim().toLowerCase() === item.correct.toLowerCase() ? 1 : 0;
  const existing = state.evidence.find((entry) => entry.skill === item.skill);
  const answered = (existing?.answered ?? 0) + 1;
  const totalCorrect = (existing?.correct ?? 0) + correct;
  const score = Math.round((totalCorrect / answered) * 100);
  const confidence = Math.min(1, 0.35 + answered * 0.2 + (existing?.recentConsistency ?? correct) * 0.15);
  const uncertainty = Math.max(0, 1 - confidence);
  const recentConsistency = existing ? (existing.recentConsistency + correct) / 2 : correct;
  const nextEvidence: DiagnosticEvidence = { skill: item.skill, score, confidence, uncertainty, answered, correct: totalCorrect, recentConsistency };
  return {
    ...state,
    evidence: [...state.evidence.filter((entry) => entry.skill !== item.skill), nextEvidence],
    askedIds: [...state.askedIds, item.id],
  };
}

export function chooseNextDiagnosticItem(items: DiagnosticItem[], state: AdaptiveDiagnosticState): DiagnosticItem | null {
  if (state.askedIds.length >= state.maxQuestions) return null;
  const unasked = items.filter((item) => !state.askedIds.includes(item.id));
  if (!unasked.length) return null;

  const scored = unasked.map((item) => {
    const evidence = state.evidence.find((entry) => entry.skill === item.skill);
    const coverageBonus = evidence ? Math.max(0, state.minEvidencePerSkill - evidence.answered) * 20 : 40;
    const uncertaintyBonus = evidence ? evidence.uncertainty * 40 : 35;
    const difficultyGap = evidence ? Math.abs(item.difficulty - (evidence.score / 100) * 5) : 1;
    return { item, score: coverageBonus + uncertaintyBonus - difficultyGap };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.item ?? null;
}

export function shouldStopAdaptiveDiagnostic(state: AdaptiveDiagnosticState, skills: Skill[]): boolean {
  if (state.askedIds.length >= state.maxQuestions) return true;
  if (skills.length === 0) return true;
  return skills.every((skill) => {
    const evidence = state.evidence.find((entry) => entry.skill === skill);
    return Boolean(evidence && evidence.answered >= state.minEvidencePerSkill && evidence.confidence >= 0.7);
  });
}

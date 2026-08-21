import type { CEFRLevel, Skill, LearnerError } from "./learner";

export type ErrorCategory =
  | "grammar"
  | "lexical"
  | "collocation"
  | "pronunciation"
  | "spelling"
  | "fluency"
  | "coherence"
  | "comprehension"
  | "register"
  | "interaction"
  | "strategy";

export type ErrorStatus = "new" | "recurring" | "improving" | "resolved";

export interface ErrorIntelligenceRecord {
  id: string;
  learnerErrorId: string;
  skill: Skill;
  category: ErrorCategory;
  objectiveId: string;
  level: CEFRLevel;
  pattern: string;
  explanation: string;
  occurrences: number;
  confidence: number;
  severity: "low" | "medium" | "high";
  status: ErrorStatus;
  intervention: string;
  nextPractice: string;
  reviewAt: string;
  lastSeenAt: string;
  resolvedAt?: string;
}

const CATEGORY_BY_SKILL: Partial<Record<Skill, ErrorCategory>> = {
  grammar: "grammar",
  vocabulary: "lexical",
  pronunciation: "pronunciation",
  writing: "coherence",
  speaking: "fluency",
  listening: "comprehension",
  reading: "comprehension",
};

export function classifyError(skill: Skill, description: string): ErrorCategory {
  const text = description.toLowerCase();
  if (/article|tense|verb|subject|agreement|preposition|modal/.test(text)) return "grammar";
  if (/collocat|phrase|word choice/.test(text)) return "collocation";
  if (/spell/.test(text)) return "spelling";
  if (/pronun|sound|stress/.test(text)) return "pronunciation";
  if (/coher|connect|link/.test(text)) return "coherence";
  if (/register|formal|informal/.test(text)) return "register";
  return CATEGORY_BY_SKILL[skill] ?? "strategy";
}

export function errorStatus(occurrences: number, recentScore?: number): ErrorStatus {
  if (recentScore !== undefined && recentScore >= 85 && occurrences >= 2) return "improving";
  if (occurrences >= 3) return "recurring";
  return "new";
}

export function buildErrorIntelligence(error: LearnerError, level: CEFRLevel, now = new Date().toISOString(), recentScore?: number): ErrorIntelligenceRecord {
  const category = classifyError(error.skill, error.description);
  const status = errorStatus(error.occurrences, recentScore);
  const intervention = category === "grammar"
    ? `Contrast the incorrect pattern with the target form, then require controlled and spontaneous production.`
    : category === "pronunciation"
      ? `Model the sound or stress pattern, then require immediate and delayed oral retrieval.`
      : category === "lexical" || category === "collocation"
        ? `Teach the word or chunk in context, then retrieve it in a new situation.`
        : `Use a focused explanation followed by a short transfer task in a different context.`;
  const nextPractice = error.skill === "speaking" ? "guided speaking retrieval" : error.skill === "writing" ? "rewrite and transfer" : "targeted retrieval practice";
  const reviewHours = error.severity === "high" ? 24 : error.severity === "medium" ? 48 : 72;
  const reviewAt = new Date(new Date(now).getTime() + reviewHours * 60 * 60 * 1000).toISOString();
  return {
    id: `ei-${error.id}`,
    learnerErrorId: error.id,
    skill: error.skill,
    category,
    objectiveId: error.objectiveId,
    level,
    pattern: error.description,
    explanation: `Recurring ${category} issue detected from learner evidence.`,
    occurrences: error.occurrences,
    confidence: Math.min(0.99, 0.55 + error.occurrences * 0.06),
    severity: error.severity,
    status,
    intervention,
    nextPractice,
    reviewAt,
    lastSeenAt: error.lastSeenAt,
  };
}

export function mergeErrorIntelligence(current: ErrorIntelligenceRecord[], incoming: ErrorIntelligenceRecord[]): ErrorIntelligenceRecord[] {
  const byId = new Map(current.map((item) => [item.learnerErrorId, item]));
  for (const item of incoming) {
    const existing = byId.get(item.learnerErrorId);
    byId.set(item.learnerErrorId, existing ? {
      ...existing,
      ...item,
      occurrences: Math.max(existing.occurrences, item.occurrences),
      confidence: Math.max(existing.confidence, item.confidence),
    } : item);
  }
  return [...byId.values()].sort((a, b) => (b.severity === "high" ? 3 : b.severity === "medium" ? 2 : 1) - (a.severity === "high" ? 3 : a.severity === "medium" ? 2 : 1) || b.occurrences - a.occurrences);
}

import type { LearningLevel, SessionType } from "./advanced-learning";

export type EvidenceModality = "READING" | "LISTENING" | "SPEAKING" | "WRITING" | "GRAMMAR" | "VOCABULARY" | "PRONUNCIATION" | "MEDIATION" | "TRANSFER";
export type EvidenceOutcome = "CORRECT" | "PARTIAL" | "INCORRECT" | "SKIPPED";

export interface LearningEvidence {
  id: string;
  learnerId: string;
  sessionType: SessionType;
  missionId: string;
  objectiveId: string;
  capabilityIds: string[];
  modality: EvidenceModality;
  outcome: EvidenceOutcome;
  score: number;
  confidence: number;
  level: LearningLevel;
  context: "FAMILIAR" | "UNFAMILIAR" | "TRANSFER";
  errorTags: string[];
  createdAt: string;
}

export interface EvidenceSummary {
  total: number;
  byModality: Record<EvidenceModality, number>;
  correctRate: number;
  transferCount: number;
  recent: LearningEvidence[];
}

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function buildEvidence(input: Omit<LearningEvidence, "score"> & { score: number }): LearningEvidence {
  return {
    ...input,
    score: clampScore(input.score),
    confidence: Math.max(0, Math.min(1, input.confidence)),
    errorTags: [...new Set(input.errorTags.map((tag) => tag.trim()).filter(Boolean))],
  };
}

export function summarizeEvidence(evidence: LearningEvidence[]): EvidenceSummary {
  const byModality = {} as Record<EvidenceModality, number>;
  for (const item of evidence) byModality[item.modality] = (byModality[item.modality] ?? 0) + 1;
  const correct = evidence.filter((item) => item.outcome === "CORRECT").length;
  return {
    total: evidence.length,
    byModality,
    correctRate: evidence.length ? correct / evidence.length : 0,
    transferCount: evidence.filter((item) => item.context === "TRANSFER").length,
    recent: [...evidence].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10),
  };
}

export function shouldCountAsMasteryEvidence(item: LearningEvidence): boolean {
  return item.outcome !== "SKIPPED" && item.confidence >= 0.6 && item.context !== "FAMILIAR";
}

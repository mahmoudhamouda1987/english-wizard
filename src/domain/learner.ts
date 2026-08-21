import type { CapabilityMastery } from "./mastery-graph";
import type { ErrorIntelligenceRecord } from "./error-intelligence";
import type { NextActionRecommendation } from "./next-action";

export type CEFRLevel = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Skill = "reading" | "listening" | "writing" | "speaking" | "grammar" | "vocabulary" | "pronunciation" | "mediation";

export interface SkillMastery {
  skill: Skill;
  level: CEFRLevel;
  score: number;
  confidence: number;
  uncertainty?: number;
  evidenceCount?: number;
  updatedAt: string;
}

export interface LearnerError {
  id: string;
  skill: Skill;
  objectiveId: string;
  description: string;
  occurrences: number;
  severity: "low" | "medium" | "high";
  lastSeenAt: string;
  category?: string;
  confidence?: number;
  status?: "new" | "recurring" | "improving" | "resolved";
  intervention?: string;
  reviewAt?: string;
}

export interface LessonRecord {
  lessonId: string;
  objectiveId: string;
  status: "not_started" | "in_progress" | "completed";
  startedAt?: string;
  completedAt?: string;
  attemptCount: number;
  evidenceIds: string[];
}

export interface LearnerState {
  learnerId: string;
  currentLessonId: string | null;
  completedLessonIds: string[];
  lessonHistory: LessonRecord[];
  mastery: SkillMastery[];
  masteryGraph?: CapabilityMastery[];
  errorIntelligence?: ErrorIntelligenceRecord[];
  errors: LearnerError[];
  nextAction: NextActionRecommendation | null;
  version: number;
  updatedAt: string;
}

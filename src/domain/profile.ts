import type { CEFRLevel } from "./learner";
import type { PathwaySelectionRecord } from "./pathways";

export type AvatarKind = "initials" | "photo" | "avatar";

export interface LearnerProfile {
  learnerId: string;
  displayName: string;
  nativeLanguage: string;
  targetLevel: CEFRLevel;
  dailyMinutes: number;
  goals: string[];
  /** Profile picture data URL (uploaded photo or preset avatar); null/undefined = initials monogram. */
  avatarUrl?: string | null;
  avatarKind?: AvatarKind;
  pathwaySelection?: PathwaySelectionRecord | null;
  englishDna: {
    overallLevel: string;
    strengths: string[];
    focusAreas: string[];
    preferredSkills: string[];
    confidence: number;
    productionEvidence?: {
      writingScore: number;
      speakingScore: number;
    };
    diagnosticEvidence?: Array<{
      skill: string;
      score: number;
      confidence: number;
      uncertainty: number;
      answered: number;
      correct: number;
      recentConsistency: number;
    }>;
    assessmentEvidence?: Array<{
      skill: string;
      estimatedScore: number;
      evidenceCount: number;
      consistency: number;
      difficultyCoverage: number;
      confidence: number;
      uncertainty: number;
    }>;
    generatedAt?: string;
  };
  updatedAt: string;
}

export const DEFAULT_PROFILE = {
  displayName: "Learner",
  nativeLanguage: "Arabic",
  targetLevel: "B1" as const,
  dailyMinutes: 20,
  goals: ["Speak confidently", "Build everyday vocabulary"],
  avatarUrl: null,
  avatarKind: "initials" as const,
};

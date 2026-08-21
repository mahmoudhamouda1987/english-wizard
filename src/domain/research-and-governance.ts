import type { CEFRLevel, Skill } from "./learner";

export type ReferenceAuthority = "CouncilOfEurope" | "BritishCouncil" | "CambridgeEnglish" | "OxfordLearnersDictionaries" | "BBCLearningEnglish" | "IELTS" | "originalResearch";

export interface ResearchReference {
  id: string;
  authority: ReferenceAuthority;
  title: string;
  url: string;
  consultedAt: string;
  claimsSupported: string[];
  usage: "reference_only" | "curriculum_mapping" | "licensed_content";
  rightsStatus: "reference_only" | "licensed" | "pending";
}

export interface CurriculumMappingRecord {
  id: string;
  capabilityId: string;
  level: CEFRLevel;
  skill: Skill;
  descriptors: string[];
  researchReferenceIds: string[];
  assessmentCriteria: string[];
  masterySignals: string[];
  lastReviewedAt: string;
  reviewer: "human" | "ai_assisted";
}

export interface ContentReviewRecord {
  contentId: string;
  levelCheck: "pending" | "pass" | "fail";
  grammarCheck: "pending" | "pass" | "fail";
  answerKeyCheck: "pending" | "pass" | "fail";
  ambiguityCheck: "pending" | "pass" | "fail";
  factualCheck: "pending" | "pass" | "fail";
  safetyCheck: "pending" | "pass" | "fail";
  alignmentCheck: "pending" | "pass" | "fail";
  approval: "draft" | "review_required" | "approved" | "rejected";
  reviewer?: string;
  reviewedAt?: string;
}

export interface PrivacyPreference {
  learnerId: string;
  analytics: boolean;
  personalizedAi: boolean;
  voiceProcessing: boolean;
  voiceRetentionDays: number;
  shareForHumanReview: boolean;
  lastUpdatedAt: string;
}

export interface VoiceConsentRecord {
  id: string;
  learnerId: string;
  purpose: "diagnostic" | "speaking_feedback" | "pronunciation" | "mission";
  providerDisclosure: string;
  consented: boolean;
  consentedAt?: string;
  revokedAt?: string;
  deletionRequestedAt?: string;
}

export interface AIEvaluationCase {
  id: string;
  task: "lesson" | "writing" | "speaking" | "explanation" | "assessment";
  input: string;
  expectedSchema: string;
  rubric: string[];
  severity: "critical" | "high" | "medium" | "low";
  tags: Array<"hallucination" | "cefr" | "grammar" | "tone" | "safety" | "appropriateness" | "scoring" | "schema">;
}

export const CORE_RESEARCH_REFERENCES: ResearchReference[] = [
  { id: "coe-cefr", authority: "CouncilOfEurope", title: "CEFR and Companion Volume", url: "https://www.coe.int/en/web/common-european-framework-reference-languages", consultedAt: "2026-08-17", claimsSupported: ["CEFR descriptors", "mediation", "interaction", "phonological competence"], usage: "curriculum_mapping", rightsStatus: "reference_only" },
  { id: "cambridge-assessment", authority: "CambridgeEnglish", title: "Cambridge English assessment frameworks", url: "https://www.cambridgeenglish.org/", consultedAt: "2026-08-17", claimsSupported: ["skill assessment", "speaking criteria", "writing criteria"], usage: "reference_only", rightsStatus: "reference_only" },
  { id: "ielts-framework", authority: "IELTS", title: "IELTS public assessment framework", url: "https://ielts.org/", consultedAt: "2026-08-17", claimsSupported: ["four-skills assessment", "band descriptor principles"], usage: "reference_only", rightsStatus: "reference_only" },
  { id: "british-council-learnenglish", authority: "BritishCouncil", title: "LearnEnglish pedagogical reference", url: "https://learnenglish.britishcouncil.org/", consultedAt: "2026-08-17", claimsSupported: ["learner-facing activity design", "British English reference"], usage: "reference_only", rightsStatus: "reference_only" },
];

export function contentReviewReady(review: ContentReviewRecord): boolean {
  return [review.levelCheck, review.grammarCheck, review.answerKeyCheck, review.ambiguityCheck, review.factualCheck, review.safetyCheck, review.alignmentCheck].every((value) => value === "pass");
}

export function privacyDefaults(learnerId: string, now = new Date().toISOString()): PrivacyPreference {
  return { learnerId, analytics: true, personalizedAi: true, voiceProcessing: false, voiceRetentionDays: 7, shareForHumanReview: false, lastUpdatedAt: now };
}

export function createEvaluationCase(task: AIEvaluationCase["task"], input: string, expectedSchema: string, rubric: string[], severity: AIEvaluationCase["severity"], tags: AIEvaluationCase["tags"]): AIEvaluationCase {
  return { id: `eval-${task}-${Date.now()}`, task, input, expectedSchema, rubric, severity, tags };
}

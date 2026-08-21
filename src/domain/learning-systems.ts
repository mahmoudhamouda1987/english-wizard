import type { CEFRLevel, Skill } from "./learner";

export type ContentSourceType = "original" | "licensed" | "external" | "ai_generated" | "reference";
export type ContentApproval = "draft" | "review_required" | "approved" | "retired";

export interface ContentMetadata {
  id: string;
  sourceType: ContentSourceType;
  attribution?: string;
  license?: string;
  licenseStatus: "verified" | "pending" | "not_applicable";
  createdBy: "EnglishWizard" | "human_reviewer" | "ai" | "external";
  approval: ContentApproval;
  version: number;
  reviewedAt?: string;
}

export interface LearningContentItem {
  id: string;
  level: CEFRLevel;
  skill: Skill;
  objectiveId: string;
  contentType: "text" | "audio_transcript" | "dialogue" | "prompt" | "image_prompt" | "example" | "explanation" | "task";
  body: string;
  metadata: ContentMetadata;
  answerKey?: string[];
  distractors?: string[];
  difficulty: number;
  safetyStatus: "safe" | "review_required";
}

export interface AssessmentRubricCriterion {
  id: string;
  skill: Skill;
  criterion: string;
  descriptorBands: Partial<Record<CEFRLevel, string>>;
  weight: number;
}

export interface LearningSession {
  id: string;
  type: "quick_quest" | "standard_journey" | "deep_study" | "boss_mission";
  missionId?: string;
  targetMinutes: 5 | 15 | 30 | 45 | 60;
  activityIds: string[];
  objectiveIds: string[];
  rationale: string;
}

export interface ReadingActivity {
  id: string;
  level: CEFRLevel;
  title: string;
  passage: string;
  wordRecognitionTargets: string[];
  comprehensionQuestions: Array<{ id: string; question: string; answer: string; skill: "main_idea" | "detail" | "inference" | "tone" | "argument" }>;
  transferPrompt?: string;
  contentId: string;
}

export interface EarActivity {
  id: string;
  level: CEFRLevel;
  patternType: "connected_speech" | "reduction" | "linking" | "weak_forms" | "contractions" | "fast_speech";
  spokenForm: string;
  writtenForm: string;
  explanation: string;
  replayCountTarget: number;
  discriminationQuestion: string;
}

export interface SayItBetterExercise {
  id: string;
  level: CEFRLevel;
  learnerVersion: string;
  correctedVersion: string;
  naturalVersion: string;
  advancedVersion: string;
  professionalVersion: string;
  changeNotes: string[];
  retryPrompt: string;
  transferPrompt: string;
}

export interface RevisionLoopState {
  attemptId: string;
  stage: "identify" | "explain" | "correct" | "retry" | "transfer" | "review";
  original: string;
  feedback: string[];
  corrections: string[];
  retryPrompt?: string;
  transferPrompt?: string;
  storedErrorIds: string[];
}

export const SESSION_MODES: Array<Pick<LearningSession, "type" | "targetMinutes"> & { description: string }> = [
  { type: "quick_quest", targetMinutes: 5, description: "One focused intervention for a small measurable gain." },
  { type: "standard_journey", targetMinutes: 15, description: "One mission with teach, practice, production and feedback." },
  { type: "deep_study", targetMinutes: 30, description: "Integrated multi-skill work with review and transfer." },
  { type: "boss_mission", targetMinutes: 60, description: "High-integration mission requiring evidence across several skills." },
];

export const SAMPLE_RUBRICS: AssessmentRubricCriterion[] = [
  { id: "speaking-intelligibility", skill: "speaking", criterion: "Intelligibility", descriptorBands: { "A1": "Usually understandable with supportive repetition.", "B1": "Generally clear in familiar connected speech.", "C1": "Consistently clear with flexible control of complex speech." }, weight: 1 },
  { id: "writing-coherence", skill: "writing", criterion: "Coherence and cohesion", descriptorBands: { "A2": "Short connected text with basic linking.", "B2": "Clear structure with controlled linking and progression.", "C1": "Well-structured argument with flexible discourse control." }, weight: 1 },
  { id: "reading-inference", skill: "reading", criterion: "Inference", descriptorBands: { "A2": "Can infer simple unstated information.", "B2": "Can infer attitude and implied meaning in longer texts.", "C2": "Can interpret subtle implications, rhetoric and assumptions." }, weight: 1 },
  { id: "listening-connected-speech", skill: "listening", criterion: "Connected speech", descriptorBands: { "A1": "Understands carefully articulated familiar phrases.", "B1": "Handles standard connected speech on familiar topics.", "C1": "Follows complex fast speech including reductions and implied meaning." }, weight: 1 },
];

export function createSession(type: LearningSession["type"], rationale: string, activityIds: string[], objectiveIds: string[], missionId?: string): LearningSession {
  const mode = SESSION_MODES.find((item) => item.type === type)!;
  return { id: `session-${Date.now()}`, type, missionId, targetMinutes: mode.targetMinutes, activityIds, objectiveIds, rationale };
}

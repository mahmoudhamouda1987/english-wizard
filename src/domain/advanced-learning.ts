export type LearningLevel = 'PRE_A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type SessionType = 'QUICK_QUEST' | 'STANDARD_JOURNEY' | 'DEEP_STUDY' | 'BOSS_MISSION';
export type EarPattern = 'LINKING' | 'REDUCTION' | 'WEAK_FORM' | 'ASSIMILATION' | 'ELISION' | 'STRESS_SHIFT' | 'FAST_SPEECH';
export type ReadingTask = 'WORD_MEANING' | 'MAIN_IDEA' | 'DETAIL' | 'INFERENCE' | 'TONE' | 'ARGUMENT' | 'SPECIALIST_TRANSFER';
export type SayItBetterStage = 'LEARNER' | 'CORRECTED' | 'NATURAL' | 'ADVANCED' | 'PROFESSIONAL';

export interface ChunkRecord {
  id: string;
  text: string;
  meaning: string;
  level: LearningLevel;
  function: string;
  collocations: string[];
  examples: string[];
  receptive: boolean;
  productive: boolean;
}

export interface ReadingExperience {
  id: string;
  level: LearningLevel;
  title: string;
  text: string;
  tasks: Array<{ id: string; type: ReadingTask; prompt: string; answer: string }>;
  transferPrompt: string;
}

export interface EarExperience {
  id: string;
  level: LearningLevel;
  pattern: EarPattern;
  spokenForm: string;
  formalForm: string;
  explanation: string;
  examples: string[];
}

export interface SayItBetterResult {
  original: string;
  stages: Record<SayItBetterStage, string>;
  explanation: string;
  retryPrompt: string;
  transferPrompt: string;
  errorTags: string[];
}

export interface SessionPlan {
  type: SessionType;
  minutes: number;
  missionId: string;
  activities: string[];
  successMeasure: string;
}

export interface ThinkingInEnglishStep {
  id: string;
  level: LearningLevel;
  stage: 'LABEL' | 'DESCRIBE' | 'PARAPHRASE' | 'REACT' | 'REASON' | 'ARGUE' | 'IMPROVISE';
  prompt: string;
  forbiddenTranslation: boolean;
  successSignal: string;
}

export interface TransferTask {
  id: string;
  level: LearningLevel;
  capabilityId: string;
  familiarContext: string;
  unfamiliarContext: string;
  successCriteria: string[];
}

export interface InterestSignal {
  topic: string;
  weight: number;
  source: 'GOAL' | 'CHOICE' | 'TIME_SPENT' | 'SUCCESS' | 'EXPLICIT_PREFERENCE';
  lastObservedAt: string;
}

export interface InterestProfile {
  preferred: InterestSignal[];
  broaden: string[];
  avoided: string[];
}

export interface HelpRequest {
  capabilityId: string;
  learnerMessage: string;
  observedError?: string;
  requestedMode?: 'SIMPLER' | 'EXAMPLE' | 'VISUAL' | 'RULE' | 'CONTRAST' | 'PRACTICE';
}

export interface HelpResponse {
  diagnosis: string;
  mode: NonNullable<HelpRequest['requestedMode']>;
  explanation: string;
  microExample: string;
  checkQuestion: string;
  nextAction: string;
}

export const SESSION_DEFAULTS: Record<SessionType, Omit<SessionPlan, 'missionId' | 'activities'>> = {
  QUICK_QUEST: { type: 'QUICK_QUEST', minutes: 10, successMeasure: 'One measurable capability signal improves.' },
  STANDARD_JOURNEY: { type: 'STANDARD_JOURNEY', minutes: 25, successMeasure: 'Teach, practise, produce and retrieve one mission capability.' },
  DEEP_STUDY: { type: 'DEEP_STUDY', minutes: 50, successMeasure: 'Evidence accumulates across at least two modalities.' },
  BOSS_MISSION: { type: 'BOSS_MISSION', minutes: 35, successMeasure: 'Integrated mission completed with transfer evidence.' }
};

export function buildSession(type: SessionType, missionId: string, activities: string[]): SessionPlan {
  return { ...SESSION_DEFAULTS[type], missionId, activities };
}

export function buildSayItBetter(original: string, correction: string, natural: string, advanced: string, professional: string, explanation: string, errorTags: string[]): SayItBetterResult {
  return {
    original,
    stages: { LEARNER: original, CORRECTED: correction, NATURAL: natural, ADVANCED: advanced, PROFESSIONAL: professional },
    explanation,
    retryPrompt: `Rewrite this using the natural version as a model: ${natural}`,
    transferPrompt: 'Use the same language pattern in a completely different real-life situation.',
    errorTags
  };
}

export function buildHelpResponse(request: HelpRequest): HelpResponse {
  const mode = request.requestedMode ?? 'SIMPLER';
  const explanationByMode: Record<NonNullable<HelpRequest['requestedMode']>, string> = {
    SIMPLER: 'Reduce the idea to one rule and one example before adding detail.',
    EXAMPLE: 'Show the target capability in a concrete everyday context.',
    VISUAL: 'Represent the relationship as a short sequence or contrast.',
    RULE: 'State the smallest useful rule, then immediately test it.',
    CONTRAST: 'Contrast the target with the learner’s observed error.',
    PRACTICE: 'Move directly to a tiny production task with immediate feedback.'
  };
  return {
    diagnosis: request.observedError ? `Likely issue in ${request.capabilityId}: ${request.observedError}` : `Need more evidence for ${request.capabilityId}.`,
    mode,
    explanation: explanationByMode[mode],
    microExample: 'Model → notice → try → feedback.',
    checkQuestion: 'Can you produce one new example without copying the model?',
    nextAction: 'Complete the micro-practice and store the result as evidence.'
  };
}

export function scoreInterestSignal(signal: InterestSignal, now = Date.now()): number {
  const ageDays = Math.max(0, (now - Date.parse(signal.lastObservedAt)) / 86_400_000);
  return signal.weight * Math.exp(-ageDays / 30);
}

export function buildInterestProfile(signals: InterestSignal[], explicitAvoided: string[] = []): InterestProfile {
  const ranked = [...signals].sort((a, b) => scoreInterestSignal(b) - scoreInterestSignal(a));
  const preferred = ranked.slice(0, 8);
  const preferredTopics = new Set(preferred.map((s) => s.topic));
  const broaden = ranked.filter((s) => !preferredTopics.has(s.topic)).slice(0, 3).map((s) => s.topic);
  return { preferred, broaden, avoided: explicitAvoided };
}

export function buildThinkingStep(level: LearningLevel): ThinkingInEnglishStep {
  const stages: Record<LearningLevel, ThinkingInEnglishStep['stage']> = {
    PRE_A1: 'LABEL', A1: 'DESCRIBE', A2: 'PARAPHRASE', B1: 'REACT', B2: 'REASON', C1: 'ARGUE', C2: 'IMPROVISE'
  };
  const stage = stages[level];
  return {
    id: `thinking-${level.toLowerCase()}`,
    level,
    stage,
    prompt: `Respond directly in English using the ${stage.toLowerCase()} skill appropriate to ${level}.`,
    forbiddenTranslation: level !== 'PRE_A1',
    successSignal: 'Meaning is communicated without relying on word-for-word translation.'
  };
}

export function buildTransferTask(level: LearningLevel, capabilityId: string, familiarContext: string, unfamiliarContext: string): TransferTask {
  return {
    id: `transfer-${level.toLowerCase()}-${capabilityId}`,
    level,
    capabilityId,
    familiarContext,
    unfamiliarContext,
    successCriteria: ['Capability remains accurate.', 'Language is adapted to the new context.', 'Learner produces independently.']
  };
}

export const CEFR_SESSION_TYPES: Record<LearningLevel, SessionType[]> = {
  PRE_A1: ['QUICK_QUEST', 'STANDARD_JOURNEY'],
  A1: ['QUICK_QUEST', 'STANDARD_JOURNEY'],
  A2: ['QUICK_QUEST', 'STANDARD_JOURNEY', 'DEEP_STUDY'],
  B1: ['QUICK_QUEST', 'STANDARD_JOURNEY', 'DEEP_STUDY'],
  B2: ['STANDARD_JOURNEY', 'DEEP_STUDY', 'BOSS_MISSION'],
  C1: ['STANDARD_JOURNEY', 'DEEP_STUDY', 'BOSS_MISSION'],
  C2: ['STANDARD_JOURNEY', 'DEEP_STUDY', 'BOSS_MISSION']
};

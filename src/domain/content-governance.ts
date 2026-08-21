export type ContentOrigin = 'ORIGINAL' | 'LICENSED' | 'EXTERNAL_REFERENCE' | 'AI_GENERATED' | 'AI_ASSISTED';
export type RightsStatus = 'OWNED' | 'LICENSED' | 'PUBLIC_DOMAIN' | 'ATTRIBUTED' | 'PENDING_REVIEW' | 'REJECTED';
export type ReviewStatus = 'DRAFT' | 'AI_VALIDATED' | 'HUMAN_REVIEW' | 'APPROVED' | 'RETIRED';

export interface ResearchReference {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  referenceType: 'CEFR' | 'ASSESSMENT' | 'LINGUISTICS' | 'LEARNING_SCIENCE' | 'DICTIONARY' | 'CORPUS' | 'OTHER';
  consultedAt: string;
  notes: string;
}

export interface ContentGovernanceRecord {
  contentId: string;
  origin: ContentOrigin;
  rights: RightsStatus;
  review: ReviewStatus;
  level: string;
  objectiveId: string;
  sourceReferences: string[];
  safetyChecked: boolean;
  answerChecked: boolean;
  ambiguityChecked: boolean;
  difficultyChecked: boolean;
  grammarChecked: boolean;
  factsChecked: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CurriculumTrace {
  capabilityId: string;
  cefrLevel: string;
  skill: 'READING' | 'LISTENING' | 'SPEAKING' | 'WRITING' | 'MEDIATION' | 'INTERACTION';
  resources: string[];
  assessmentIds: string[];
  masteryEvidence: string[];
  researchReferences: string[];
}

export interface EvaluationCase {
  id: string;
  task: 'EXPLANATION' | 'CORRECTION' | 'CEFR' | 'SCORING' | 'HALLUCINATION' | 'APPROPRIATENESS' | 'SAFETY';
  input: string;
  expectedProperties: string[];
  rubric: Record<string, number>;
}

export interface HumanReviewGate {
  contentId: string;
  highStakes: boolean;
  required: boolean;
  reviewerRole: 'CURRICULUM_REVIEWER' | 'ASSESSOR' | 'SAFETY_REVIEWER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export function canPublish(record: ContentGovernanceRecord): boolean {
  return record.rights !== 'PENDING_REVIEW' &&
    record.rights !== 'REJECTED' &&
    record.review === 'APPROVED' &&
    record.safetyChecked &&
    record.answerChecked &&
    record.ambiguityChecked &&
    record.difficultyChecked &&
    record.grammarChecked &&
    record.factsChecked;
}

export function needsHumanReview(record: ContentGovernanceRecord): boolean {
  return record.origin === 'EXTERNAL_REFERENCE' || record.review === 'HUMAN_REVIEW' || record.rights === 'PENDING_REVIEW';
}

export function buildCurriculumTrace(capabilityId: string, cefrLevel: string, skill: CurriculumTrace['skill'], resources: string[], assessmentIds: string[], masteryEvidence: string[], researchReferences: string[]): CurriculumTrace {
  return { capabilityId, cefrLevel, skill, resources, assessmentIds, masteryEvidence, researchReferences };
}

export const CORE_RESEARCH_ECOSYSTEMS: ResearchReference[] = [
  {
    id: 'coe-cefr-companion-2020',
    title: 'CEFR Companion Volume (2020)',
    publisher: 'Council of Europe',
    url: 'https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions',
    referenceType: 'CEFR',
    consultedAt: '2026-08-18',
    notes: 'Primary framework reference for updated CEFR descriptors, mediation, online interaction, phonology and related competences.'
  },
  {
    id: 'coe-cefr-descriptors',
    title: 'CEFR Descriptors',
    publisher: 'Council of Europe',
    url: 'https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors',
    referenceType: 'CEFR',
    consultedAt: '2026-08-18',
    notes: 'Official searchable descriptor source used for capability and curriculum traceability.'
  },
  {
    id: 'cambridge-cefr',
    title: 'Cambridge English: International language standards / CEFR',
    publisher: 'Cambridge English',
    url: 'https://www.cambridgeenglish.org/exams-and-tests/cefr/',
    referenceType: 'ASSESSMENT',
    consultedAt: '2026-08-18',
    notes: 'Distinct examination/qualification alignment reference; must remain separate from the CEFR capability model.'
  },
  {
    id: 'ielts-scoring',
    title: 'IELTS resources for setting scores and productive-skill marking',
    publisher: 'IELTS',
    url: 'https://ielts.org/organisations/ielts-for-organisations/understanding-ielts-scoring/resources-for-setting-your-ielts-scores',
    referenceType: 'ASSESSMENT',
    consultedAt: '2026-08-18',
    notes: 'Separate exam framework for writing and speaking scoring; never substitute IELTS bands for CEFR capability states.'
  },
  {
    id: 'ielts-writing-descriptors',
    title: 'IELTS Writing Band Descriptors',
    publisher: 'IELTS',
    url: 'https://ielts.org/cdn/Guides/ielts-writing-band-descriptors.pdf',
    referenceType: 'ASSESSMENT',
    consultedAt: '2026-08-18',
    notes: 'Official productive writing rubric reference for future exam pathway implementation.'
  },
];

export function createEvaluationCase(id: string, task: EvaluationCase['task'], input: string, expectedProperties: string[]): EvaluationCase {
  return { id, task, input, expectedProperties, rubric: { accuracy: 0, alignment: 0, safety: 0, usefulness: 0 } };
}

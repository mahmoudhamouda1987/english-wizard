export type PathwayKind = 'GENERAL_ENGLISH' | 'PROFESSIONAL' | 'IELTS' | 'CAMBRIDGE';
export type ProfessionalDomain = 'BUSINESS' | 'ACADEMIC' | 'TECHNOLOGY' | 'HEALTHCARE' | 'HOSPITALITY' | 'CUSTOMER_SERVICE' | 'LEADERSHIP';
export type ProfessionalTrack = 'WORKPLACE_COMMUNICATION' | 'MEETINGS' | 'PRESENTATIONS' | 'MANAGEMENT' | 'ACADEMIC' | 'INTERVIEW';
export type CambridgeQualification = 'A2_KEY' | 'B1_PRELIMINARY' | 'B2_FIRST' | 'C1_ADVANCED' | 'C2_PROFICIENCY';

export interface PathwayModule {
  id: string;
  pathway: PathwayKind;
  level: string;
  title: string;
  objectives: string[];
  skills: string[];
  assessmentMode: string;
  certificationClaim: false;
}

export interface ProfessionalPathway {
  domain: ProfessionalDomain;
  modules: PathwayModule[];
  authenticTasks: string[];
  track: ProfessionalTrack;
  targetRole?: string;
  capabilityRequirements: string[];
}

export interface ExamPathway {
  exam: 'IELTS' | 'CAMBRIDGE';
  target: string;
  skills: string[];
  practiceTypes: string[];
  scoreModel: string;
  certificationClaim: false;
  disclaimer: string;
  readinessCriteria: string[];
}

export interface PathwaySelectionRecord {
  pathway: PathwayKind;
  domain?: ProfessionalDomain;
  track?: ProfessionalTrack;
  target?: string;
  selectedAt: string;
}

export interface PathwayEvidence {
  capabilityId: string;
  skill: string;
  score: number;
  transfer: boolean;
}

export const IELTS_PATHWAY: ExamPathway = {
  exam: 'IELTS',
  target: 'Learner-selected band target',
  skills: ['listening', 'reading', 'writing', 'speaking'],
  practiceTypes: ['timed practice', 'task response', 'feedback', 'full simulation'],
  scoreModel: 'Internal estimate only; not official IELTS scoring or certification.',
  certificationClaim: false,
  disclaimer: 'English Wizard provides preparation and internal estimates, not IELTS certification.',
  readinessCriteria: ['task response', 'coherence and cohesion', 'lexical resource', 'grammar', 'fluency and pronunciation'],
};

export const CAMBRIDGE_PATHWAY: ExamPathway = {
  exam: 'CAMBRIDGE',
  target: 'Learner-selected Cambridge English target',
  skills: ['reading', 'listening', 'writing', 'speaking', 'use-of-English'],
  practiceTypes: ['task practice', 'timed practice', 'feedback', 'simulation'],
  scoreModel: 'Internal preparation estimate only; not official Cambridge assessment.',
  certificationClaim: false,
  disclaimer: 'English Wizard provides preparation and internal estimates, not Cambridge certification.',
  readinessCriteria: ['reading and use of English', 'writing', 'listening', 'speaking'],
};

export function buildProfessionalPathway(domain: ProfessionalDomain, level: string, objectives: string[], track: ProfessionalTrack = 'WORKPLACE_COMMUNICATION', targetRole?: string): ProfessionalPathway {
  return {
    domain,
    track,
    targetRole,
    capabilityRequirements: objectives,
    modules: [{ id: `${domain.toLowerCase()}-${level.toLowerCase()}-${track.toLowerCase()}`, pathway: 'PROFESSIONAL', level, title: `${domain} English`, objectives, skills: ['speaking', 'listening', 'reading', 'writing'], assessmentMode: 'authentic task evidence', certificationClaim: false }],
    authenticTasks: ['role-play', 'email', 'meeting', 'problem-solving', 'presentation'],
  };
}

export function pathwayReadiness(pathway: ProfessionalPathway | ExamPathway, evidence: PathwayEvidence[]): { ready: boolean; missing: string[] } {
  if ('capabilityRequirements' in pathway) {
    const missing = pathway.capabilityRequirements.filter((id) => !evidence.some((item) => item.capabilityId === id && item.score >= 75 && item.transfer));
    return { ready: missing.length === 0, missing };
  }
  const criteria = pathway.readinessCriteria;
  const skillScores = new Map<string, number>();
  for (const item of evidence) skillScores.set(item.skill.toLowerCase(), Math.max(skillScores.get(item.skill.toLowerCase()) ?? 0, item.score));
  const missing = criteria.filter((criterion: string) => {
    const key = criterion.toLowerCase();
    return ![...skillScores.entries()].some(([skill, score]) => (key.includes(skill) || skill.includes(key.split(' ')[0])) && score >= 70);
  });
  return { ready: missing.length === 0, missing };
}

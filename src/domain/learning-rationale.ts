export type CommunicationFunction = 'INTRODUCE' | 'REQUEST' | 'CLARIFY' | 'DESCRIBE' | 'COMPARE' | 'PERSUADE' | 'NEGOTIATE' | 'MEDIATE' | 'ARGUE' | 'PRESENT' | 'HANDLE_CONFLICT';

export interface CommunicationCapability {
  id: string;
  level: string;
  function: CommunicationFunction;
  complexity: number;
  contexts: string[];
  evidenceTypes: string[];
}

export interface MediationActivity {
  id: string;
  level: string;
  source: string;
  targetAudience: string;
  task: 'SUMMARIZE' | 'EXPLAIN' | 'CONVEY' | 'FACILITATE' | 'TRANSLATE_MEANING';
  successCriteria: string[];
}

export interface LearningRationale {
  objectiveId: string;
  whyNow: string;
  evidenceTrigger: string;
  realWorldValue: string;
  successMeasure: string;
  nextStep: string;
}

export function buildLearningRationale(objectiveId: string, evidenceTrigger: string, realWorldValue: string, successMeasure: string, nextStep: string): LearningRationale {
  return {
    objectiveId,
    whyNow: `This objective is selected because ${evidenceTrigger}.`,
    evidenceTrigger,
    realWorldValue,
    successMeasure,
    nextStep
  };
}

export function buildMediationActivity(level: string, task: MediationActivity['task'], source: string, audience: string): MediationActivity {
  return {
    id: `mediation-${level.toLowerCase()}-${task.toLowerCase()}`,
    level,
    source,
    targetAudience: audience,
    task,
    successCriteria: ['Meaning is preserved.', 'Information is adapted to the audience.', 'Important nuance is not lost.']
  };
}

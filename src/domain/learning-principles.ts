import type { CEFRLevel } from "./learner";

export interface LearningActivityReason {
  objectiveId: string;
  learnerNeed: string;
  evidence: string[];
  whyNow: string;
  successMetric: string;
  failureResponse: string;
  masteryResponse: string;
}

export interface UseEvidence {
  spontaneous: boolean;
  contextual: boolean;
  score: number;
}

export interface TransferEvidence {
  familiarContextScore: number;
  unfamiliarContextScore: number;
  unfamiliarContext: boolean;
}

export interface RetentionEvidence {
  priorScore: number;
  delayedScore: number;
  delayedDays: number;
}

export interface RealWorldTask {
  level: CEFRLevel;
  capabilityId: string;
  realWorldAction: string;
  modalities: string[];
  successCriteria: string[];
}

export function explainWhy(activity: LearningActivityReason): string {
  if (!activity.evidence.length) return `You are practising ${activity.objectiveId} because it is part of your current learning path.`;
  return `You are practising ${activity.objectiveId} because ${activity.learnerNeed}. ${activity.whyNow}`;
}

export function canBeMastered(evidence: UseEvidence): boolean {
  return evidence.spontaneous && evidence.contextual && evidence.score >= 75;
}

export function transferStatus(evidence: TransferEvidence): "NOT_TESTED" | "TRANSFERED" | "REQUIRES_TRANSFER" {
  if (!evidence.unfamiliarContext) return "NOT_TESTED";
  return evidence.unfamiliarContextScore >= 70 && evidence.unfamiliarContextScore >= evidence.familiarContextScore - 15 ? "TRANSFERED" : "REQUIRES_TRANSFER";
}

export function retentionStatus(evidence: RetentionEvidence): "RETAINED" | "REACTIVATE" {
  const threshold = Math.max(60, evidence.priorScore - 15);
  return evidence.delayedDays >= 1 && evidence.delayedScore >= threshold ? "RETAINED" : "REACTIVATE";
}

export function buildRealWorldTask(level: CEFRLevel, capabilityId: string, action: string, modalities: string[], successCriteria: string[]): RealWorldTask {
  return { level, capabilityId, realWorldAction: action, modalities, successCriteria };
}

export function activityReleaseDecision(activity: LearningActivityReason): { shippable: boolean; missing: string[] } {
  const required: Array<[keyof LearningActivityReason, string]> = [
    ["objectiveId", "learning objective"],
    ["learnerNeed", "learner need"],
    ["whyNow", "why-now explanation"],
    ["successMetric", "success metric"],
    ["failureResponse", "failure response"],
    ["masteryResponse", "mastery response"],
  ];
  const missing = required.filter(([key]) => !String(activity[key] ?? "").trim()).map(([, label]) => label);
  return { shippable: missing.length === 0, missing };
}

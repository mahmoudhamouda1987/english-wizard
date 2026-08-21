import type { Mission, BossMission } from "./missions";

export type MissionStage = "ORIENT" | "TEACH" | "PRACTICE" | "PRODUCE" | "RETRIEVE" | "TRANSFER" | "ASSESS" | "COMPLETE";

export interface MissionRuntime {
  id: string;
  missionId: string;
  learnerId: string;
  stage: MissionStage;
  completedStages: MissionStage[];
  evidenceIds: string[];
  missingEvidence: string[];
  transferComplete: boolean;
  assessmentScore?: number;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

const STAGES: MissionStage[] = ["ORIENT", "TEACH", "PRACTICE", "PRODUCE", "RETRIEVE", "TRANSFER", "ASSESS", "COMPLETE"];

export function buildMissionRuntime(mission: Mission | BossMission, learnerId: string, now = new Date().toISOString()): MissionRuntime {
  return {
    id: `runtime-${mission.id}-${learnerId}`,
    missionId: mission.id,
    learnerId,
    stage: "ORIENT",
    completedStages: [],
    evidenceIds: [],
    missingEvidence: [...mission.requiredEvidence],
    transferComplete: false,
    startedAt: now,
    updatedAt: now,
  };
}

export function advanceMissionRuntime(
  runtime: MissionRuntime,
  mission: Mission | BossMission,
  input: { evidenceIds?: string[]; transferComplete?: boolean; assessmentScore?: number },
  now = new Date().toISOString(),
): MissionRuntime {
  const evidenceIds = [...new Set([...runtime.evidenceIds, ...(input.evidenceIds ?? [])])];
  const missingEvidence = mission.requiredEvidence.filter((id) => !evidenceIds.includes(id));
  const transferComplete = runtime.transferComplete || Boolean(input.transferComplete);
  const assessmentScore = typeof input.assessmentScore === "number" ? Math.max(0, Math.min(100, Math.round(input.assessmentScore))) : runtime.assessmentScore;
  let nextStage = runtime.stage;
  if (runtime.stage === "ORIENT") nextStage = "TEACH";
  else if (runtime.stage === "TEACH") nextStage = "PRACTICE";
  else if (runtime.stage === "PRACTICE") nextStage = "PRODUCE";
  else if (runtime.stage === "PRODUCE") nextStage = evidenceIds.length > 0 ? "RETRIEVE" : "PRODUCE";
  else if (runtime.stage === "RETRIEVE") nextStage = "TRANSFER";
  else if (runtime.stage === "TRANSFER") nextStage = transferComplete ? "ASSESS" : "TRANSFER";
  else if (runtime.stage === "ASSESS") nextStage = missingEvidence.length === 0 && (assessmentScore ?? 0) >= 70 ? "COMPLETE" : "RETRIEVE";
  const completedStages = [...new Set([...runtime.completedStages, ...(nextStage !== runtime.stage ? [runtime.stage] : [])])];
  return {
    ...runtime,
    stage: nextStage,
    completedStages,
    evidenceIds,
    missingEvidence,
    transferComplete,
    assessmentScore,
    updatedAt: now,
    ...(nextStage === "COMPLETE" ? { completedAt: now } : {}),
  };
}

export function isMissionComplete(runtime: MissionRuntime): boolean {
  return runtime.stage === "COMPLETE" && runtime.missingEvidence.length === 0 && runtime.transferComplete && (runtime.assessmentScore ?? 0) >= 70;
}

export function missionStageOrder(): MissionStage[] {
  return [...STAGES];
}

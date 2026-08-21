import type { CEFRLevel } from "./learner";

export interface TransferTask {
  id: string;
  level: CEFRLevel;
  capabilityId: string;
  familiarContext: string;
  unfamiliarContext: string;
  successCriteria: string[];
}

export interface TransferAttempt {
  taskId: string;
  learnerId: string;
  context: "FAMILIAR" | "UNFAMILIAR" | "TRANSFER";
  response: string;
  assessed: boolean;
  score?: number;
  notes?: string[];
  createdAt: string;
}

export function buildTransferTask(level: CEFRLevel, capabilityId: string, familiarContext: string, unfamiliarContext: string): TransferTask {
  return {
    id: `transfer-${level.toLowerCase()}-${capabilityId}`,
    level,
    capabilityId,
    familiarContext,
    unfamiliarContext,
    successCriteria: [
      "Capability is preserved rather than copied from the model.",
      "Language is adapted to the new context.",
      "Learner produces an independent response."
    ],
  };
}

export function recordTransferAttempt(input: Omit<TransferAttempt, "createdAt"> & { createdAt?: string }): TransferAttempt {
  return {
    ...input,
    response: input.response.trim(),
    assessed: input.assessed,
    ...(input.score === undefined ? {} : { score: Math.max(0, Math.min(100, Math.round(input.score))) }),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function qualifiesAsTransferEvidence(attempt: TransferAttempt): boolean {
  return attempt.context === "TRANSFER" && attempt.response.length > 0;
}

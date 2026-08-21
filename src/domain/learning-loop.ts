export type LearningLoopPhase = "TEACH" | "NOTICE" | "LISTEN" | "PRACTICE" | "PRODUCE" | "FEEDBACK" | "RETRY" | "TRANSFER" | "ASSESS" | "REVIEW" | "NEXT_ACTION";

export interface LearningLoopState {
  phase: LearningLoopPhase;
  evidenceIds: string[];
  failedAttempts: number;
  successfulAttempts: number;
  transferPassed: boolean;
  assessedScore: number | null;
}

const order: LearningLoopPhase[] = ["TEACH", "NOTICE", "LISTEN", "PRACTICE", "PRODUCE", "FEEDBACK", "RETRY", "TRANSFER", "ASSESS", "REVIEW", "NEXT_ACTION"];

export function initialLearningLoop(): LearningLoopState {
  return { phase: "TEACH", evidenceIds: [], failedAttempts: 0, successfulAttempts: 0, transferPassed: false, assessedScore: null };
}

export function recordPhaseEvidence(state: LearningLoopState, evidenceId: string, passed: boolean, score?: number): LearningLoopState {
  return {
    ...state,
    evidenceIds: [...new Set([...state.evidenceIds, evidenceId])],
    failedAttempts: state.failedAttempts + (passed ? 0 : 1),
    successfulAttempts: state.successfulAttempts + (passed ? 1 : 0),
    assessedScore: typeof score === "number" ? score : state.assessedScore,
  };
}

export function advanceLoop(state: LearningLoopState): LearningLoopState {
  if (state.phase === "FEEDBACK" && state.failedAttempts > 0) return { ...state, phase: "RETRY" };
  const index = order.indexOf(state.phase);
  if (index < 0 || index >= order.length - 1) return state;
  return { ...state, phase: order[index + 1] };
}

export function requiresRetry(state: LearningLoopState): boolean {
  return state.failedAttempts > 0 && state.phase === "FEEDBACK";
}

export function canCompleteLoop(state: LearningLoopState): boolean {
  return state.phase === "NEXT_ACTION" && state.evidenceIds.length > 0 && state.assessedScore !== null;
}

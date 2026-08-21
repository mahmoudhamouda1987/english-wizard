import { describe, expect, it } from "vitest";
import { advanceLoop, canCompleteLoop, initialLearningLoop, recordPhaseEvidence, requiresRetry } from "./learning-loop";

type LearningLoopState = ReturnType<typeof initialLearningLoop>;

describe("integrated learning loop", () => {
  it("moves through the teaching and production sequence", () => {
    let state: LearningLoopState = initialLearningLoop();
    for (const expected of ["NOTICE", "LISTEN", "PRACTICE", "PRODUCE", "FEEDBACK"] as const) {
      const next: LearningLoopState = advanceLoop(state);
      expect(next.phase).toBe(expected);
      state = next;
    }
  });

  it("forces retry after a failed production attempt", () => {
    let state: LearningLoopState = { ...initialLearningLoop(), phase: "FEEDBACK" };
    state = recordPhaseEvidence(state, "e1", false, 45);
    expect(requiresRetry(state)).toBe(true);
    expect(advanceLoop(state).phase).toBe("RETRY");
  });

  it("cannot complete until assessment and evidence exist", () => {
    let state: LearningLoopState = { ...initialLearningLoop(), phase: "NEXT_ACTION" };
    expect(canCompleteLoop(state)).toBe(false);
    state = recordPhaseEvidence(state, "e1", true, 82);
    expect(canCompleteLoop(state)).toBe(true);
  });
});

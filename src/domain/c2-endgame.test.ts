import { describe, expect, it } from "vitest";
import {
  C2_ENDGAME_STAGES,
  completeC2EndgameStage,
  currentC2EndgameStage,
  initialC2EndgameState,
  isC2EndgameComplete,
} from "./c2-endgame";

describe("C2 Live in English endgame", () => {
  it("progresses through all six stages and records evidence", () => {
    let state = initialC2EndgameState("2026-08-19T00:00:00.000Z");
    expect(currentC2EndgameStage(state)?.id).toBe("morning_briefing");

    for (const stage of C2_ENDGAME_STAGES) {
      const evidence = Object.fromEntries(stage.successCriteria.map((criterion) => [criterion, 1]));
      state = completeC2EndgameStage(state, stage.id, evidence, "2026-08-19T01:00:00.000Z");
    }

    expect(isC2EndgameComplete(state)).toBe(true);
    expect(state.completedStageIds).toHaveLength(6);
    expect(state.completedAt).toBe("2026-08-19T01:00:00.000Z");
    expect(state.evidence["register-shift"]).toBe(2);
  });

  it("rejects completion without all success evidence", () => {
    const state = initialC2EndgameState();
    expect(() => completeC2EndgameStage(state, "morning_briefing", { "source-synthesis": 1 })).toThrow(
      "requires evidence",
    );
  });

  it("rejects completing a stage out of order", () => {
    const state = initialC2EndgameState();
    expect(() => completeC2EndgameStage(state, "rapid_analysis", { "decision-under-uncertainty": 1, "nuanced-explanation": 1 })).toThrow(
      "current stage",
    );
  });
});

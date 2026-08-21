import { describe, expect, it } from "vitest";
import { advanceMissionRuntime, buildMissionRuntime, isMissionComplete } from "./mission-runtime";
import { missionForId } from "./missions";

describe("mission runtime", () => {
  it("requires evidence and transfer before completion", () => {
    const mission = missionForId("mission-a1-meet")!;
    let runtime = buildMissionRuntime(mission, "learner-1");
    for (let i = 0; i < 5; i += 1) runtime = advanceMissionRuntime(runtime, mission, { evidenceIds: ["self-introduction", "follow-up-question"] });
    runtime = advanceMissionRuntime(runtime, mission, { transferComplete: true });
    runtime = advanceMissionRuntime(runtime, mission, { assessmentScore: 80 });
    expect(isMissionComplete(runtime)).toBe(true);
    expect(runtime.stage).toBe("COMPLETE");
  });
});

import { describe, expect, it } from "vitest";
import { chooseDailyMission } from "./daily-orchestrator";

describe("daily mission orchestrator", () => {
  it("prioritizes recurring-error repair when practice is the next action", () => {
    const plan = chooseDailyMission({ level: "B1", nextAction: { type: "practice", title: "Repair", reason: "recurring error" } as never, dueReviews: 0, recurringErrors: 2, recentMissionIds: [] });
    expect(plan.focus).toBe("ERROR_REPAIR");
    expect(plan.sessionType).toBe("QUICK_QUEST");
  });

  it("avoids the most recently completed mission when another exists", () => {
    const first = chooseDailyMission({ level: "B2", dueReviews: 0, recurringErrors: 0, recentMissionIds: [] });
    const second = chooseDailyMission({ level: "B2", dueReviews: 0, recurringErrors: 0, recentMissionIds: [first.mission.id] });
    expect(second.mission.id).not.toBe(first.mission.id);
  });
});

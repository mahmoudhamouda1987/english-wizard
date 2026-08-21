import { describe, expect, it } from "vitest";
import { BOSS_MISSIONS, MISSIONS, WORLDS, missionForId } from "./missions";

describe("worlds and missions", () => {
  it("covers all seven CEFR worlds", () => {
    expect(WORLDS.map((world) => world.level)).toEqual(["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]);
    expect(MISSIONS.length).toBeGreaterThanOrEqual(7);
  });

  it("exposes integrated boss missions with multiple task types", () => {
    expect(BOSS_MISSIONS.length).toBeGreaterThan(0);
    expect(BOSS_MISSIONS.every((mission) => mission.boss)).toBe(true);
    expect(BOSS_MISSIONS.every((mission) => mission.integratedTasks.length >= 4)).toBe(true);
  });

  it("resolves missions by id", () => {
    expect(missionForId("mission-b2-professional")?.level).toBe("B2");
    expect(missionForId("boss-c2-live-in-english")?.level).toBe("C2");
  });
});

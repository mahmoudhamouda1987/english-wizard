import { describe, expect, it } from "vitest";
import { SAMPLE_RUBRICS, SESSION_MODES, createSession } from "./learning-systems";

describe("learning systems", () => {
  it("defines all contract session modes", () => {
    expect(SESSION_MODES.map((item) => item.type)).toEqual(["quick_quest", "standard_journey", "deep_study", "boss_mission"]);
    expect(createSession("standard_journey", "Continue today's mission", ["activity-1"], ["objective-1"]).targetMinutes).toBe(15);
  });

  it("has CEFR-linked assessment rubric criteria", () => {
    expect(SAMPLE_RUBRICS.length).toBeGreaterThan(2);
    expect(SAMPLE_RUBRICS.some((item) => item.skill === "speaking" && item.descriptorBands.B1)).toBe(true);
  });
});

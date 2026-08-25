import { describe, expect, it } from "vitest";
import { validateScenes, hasCriticalSceneIssues } from "./scene-qa";

describe("Scene QA validator", () => {
  const report = validateScenes();

  it("validates the entire scene registry without crashing", () => {
    expect(report.totalScenes).toBeGreaterThan(0);
    expect(report.passedScenes + report.failedScenes).toBe(report.totalScenes);
  });

  it("has no critical scene issues (release bar)", () => {
    expect(hasCriticalSceneIssues(report)).toBe(false);
  });

  it("every scene has at least 4 dialogue lines", () => {
    const shortScenes = report.issues.filter((i) => i.check === "line-integrity" && i.severity === "high");
    expect(shortScenes).toHaveLength(0);
  });

  it("no duplicate scene IDs", () => {
    const dupes = report.issues.filter((i) => i.check === "duplicate-id");
    expect(dupes).toHaveLength(0);
  });
});

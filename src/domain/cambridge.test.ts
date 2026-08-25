import { describe, expect, it } from "vitest";
import { listQualifications, buildCambridgeAssessment, gradeBankItems, cambridgeScaleEstimate, cambridgeReadiness, ITEM_POOL } from "./cambridge";

describe("Cambridge engine", () => {
  it("lists all five Cambridge qualifications", () => {
    expect(listQualifications()).toHaveLength(5);
  });

  it("buildCambridgeAssessment returns items for valid inputs", () => {
    const assessment = buildCambridgeAssessment("B2_FIRST", "readiness-assessment");
    expect(assessment).not.toBeNull();
    expect(assessment!.objectiveItems.length).toBeGreaterThan(0);
    expect(assessment!.qualification.name).toBe("B2 First");
  });

  it("buildCambridgeAssessment returns null for unknown qualification", () => {
    expect(buildCambridgeAssessment("Z9_FAKE" as never, "readiness-assessment")).toBeNull();
  });

  it("gradeBankItems scores correctly", () => {
    const items = ITEM_POOL.filter((item) => item.levels.includes("A2")).slice(0, 3);
    const answers: Record<string, string> = {};
    for (const item of items) answers[item.id] = item.answer;
    const result = gradeBankItems(items, answers);
    expect(result.raw).toBe(items.length);
    expect(result.percent).toBe(100);
  });

  it("cambridgeScaleEstimate falls within qualification range", () => {
    const qual = listQualifications().find((q) => q.id === "C1_ADVANCED")!;
    expect(cambridgeScaleEstimate(100, qual)).toBe(qual.scaleRange[1]);
    expect(cambridgeScaleEstimate(0, qual)).toBe(qual.scaleRange[0]);
  });

  it("cambridgeReadiness distinguishes pass from fail", () => {
    const qual = listQualifications().find((q) => q.id === "B1_PRELIMINARY")!;
    expect(cambridgeReadiness(100, qual).verdict).toContain("On track");
    expect(cambridgeReadiness(10, qual).verdict).toContain("Not yet");
  });
});

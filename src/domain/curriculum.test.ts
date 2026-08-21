import { describe, expect, it } from "vitest";
import { MVP_LESSONS, MVP_OBJECTIVES, lessonIdsInOrder } from "./curriculum";

describe("full curriculum coverage", () => {
  it("contains every CEFR level from Pre-A1 through C2", () => {
    const levels = new Set(MVP_OBJECTIVES.map((objective) => objective.level));
    expect([...levels]).toEqual(expect.arrayContaining(["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]));
    expect(levels.size).toBe(7);
  });

  it("provides objectives and lessons for every level", () => {
    const levels = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"] as const;
    for (const level of levels) {
      expect(MVP_OBJECTIVES.filter((objective) => objective.level === level).length).toBeGreaterThanOrEqual(4);
      expect(MVP_LESSONS.filter((lesson) => lesson.level === level).length).toBeGreaterThanOrEqual(4);
    }
  });

  it("keeps lesson IDs unique and globally ordered", () => {
    const ids = lessonIdsInOrder();
    expect(new Set(ids).size).toBe(ids.length);
    const sequences = MVP_LESSONS.slice().sort((a, b) => a.sequence - b.sequence).map((lesson) => lesson.sequence);
    expect(sequences).toEqual([...sequences].sort((a, b) => a - b));
  });
});

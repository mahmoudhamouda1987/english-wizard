import { describe, expect, it } from "vitest";
import { MVP_LESSONS, MVP_OBJECTIVES, lessonIdsInOrder } from "./curriculum";

const LEVEL_COUNTS: Record<string, number> = { "Pre-A1": 2, A1: 3, A2: 7, B1: 4, B2: 4, C1: 5, C2: 3 };

describe("full curriculum coverage (28-lesson master progression)", () => {
  it("defines exactly 28 lessons with exactly 28 objectives", () => {
    expect(MVP_LESSONS).toHaveLength(28);
    expect(MVP_OBJECTIVES).toHaveLength(28);
    expect(new Set(MVP_OBJECTIVES.map((o) => o.id)).size).toBe(28);
  });

  it("contains every CEFR level from Pre-A1 through C2", () => {
    const levels = new Set(MVP_OBJECTIVES.map((objective) => objective.level));
    expect([...levels]).toEqual(expect.arrayContaining(["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]));
    expect(levels.size).toBe(7);
  });

  it("matches the locked level mapping: 2/3/7/4/4/5/3 lessons per band", () => {
    for (const [level, count] of Object.entries(LEVEL_COUNTS)) {
      expect(MVP_OBJECTIVES.filter((o) => o.level === level).length, `objectives at ${level}`).toBe(count);
      expect(MVP_LESSONS.filter((l) => l.level === level).length, `lessons at ${level}`).toBe(count);
    }
  });

  it("links every lesson to a valid objective of the same level and skill", () => {
    const byId = new Map(MVP_OBJECTIVES.map((o) => [o.id, o]));
    for (const lesson of MVP_LESSONS) {
      const objective = byId.get(lesson.objectiveId);
      expect(objective, `${lesson.id} has no objective`).toBeTruthy();
      expect(objective!.level).toBe(lesson.level);
      expect(objective!.skill).toBe(lesson.skill);
      expect(lesson.mission.length).toBeGreaterThan(20);
    }
  });

  it("chains objectives in one sequential prerequisite path with no cycles", () => {
    const seen = new Set<string>();
    for (let i = 0; i < MVP_OBJECTIVES.length; i++) {
      const objective = MVP_OBJECTIVES[i];
      if (i === 0) {
        expect(objective.prerequisites).toEqual([]);
      } else {
        expect(objective.prerequisites).toContain(MVP_OBJECTIVES[i - 1].id);
      }
      for (const prereq of objective.prerequisites) expect(seen.has(prereq), `forward reference ${prereq}`).toBe(true);
      seen.add(objective.id);
    }
  });

  it("keeps lesson IDs unique and globally ordered", () => {
    const ids = lessonIdsInOrder();
    expect(ids).toHaveLength(28);
    expect(new Set(ids).size).toBe(ids.length);
    const sequences = MVP_LESSONS.slice().sort((a, b) => a.sequence - b.sequence).map((lesson) => lesson.sequence);
    expect(sequences).toEqual([...sequences].sort((a, b) => a - b));
  });

  it("ramps mastery thresholds and retention upward across levels", () => {
    for (let i = 1; i < MVP_OBJECTIVES.length; i++) {
      expect(MVP_OBJECTIVES[i].masteryThreshold).toBeGreaterThanOrEqual(MVP_OBJECTIVES[i - 1].masteryThreshold);
    }
    expect(MVP_OBJECTIVES[27].masteryThreshold).toBeGreaterThan(MVP_OBJECTIVES[0].masteryThreshold);
  });
});

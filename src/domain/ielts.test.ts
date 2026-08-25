import { describe, expect, it } from "vitest";
import { buildIeltsPlan, bandFromPercent, roundHalf, gradeObjectiveItems, scoreIeltsWriting, gapToTarget, READING_SETS, LISTENING_SETS, WRITING_TASKS, SPEAKING_CARDS, BAND_TARGETS } from "./ielts";

describe("IELTS engine", () => {
  it("buildIeltsPlan produces modules for every skill × stage", () => {
    const plan = buildIeltsPlan("ACADEMIC", 7);
    expect(plan.variant).toBe("ACADEMIC");
    expect(plan.band).toBe(7);
    const skills = new Set(plan.modules.map((m) => m.skill));
    expect(skills).toContain("reading");
    expect(skills).toContain("listening");
    expect(skills).toContain("writing");
    expect(skills).toContain("speaking");
    expect(plan.modules.some((m) => m.stage === "mock")).toBe(true);
  });

  it("GENERAL and ACADEMIC produce different module IDs", () => {
    const academic = buildIeltsPlan("ACADEMIC", 6.5);
    const general = buildIeltsPlan("GENERAL", 6.5);
    const academicIds = new Set(academic.modules.map((m) => m.id));
    const generalIds = new Set(general.modules.map((m) => m.id));
    expect([...academicIds].some((id) => !generalIds.has(id))).toBe(true);
  });

  it("bandFromPercent returns valid band numbers", () => {
    const bands = BAND_TARGETS as readonly number[];
    expect(bands).toContain(bandFromPercent(99));
    expect(bands).toContain(bandFromPercent(50));
    expect(bandFromPercent(10)).toBe(3.5);
  });

  it("gradeObjectiveItems grades correctly", () => {
    const items = [
      { id: "q1", kind: "mcq" as const, prompt: "Test?", options: ["A", "B"], answer: "A", explain: "" },
      { id: "q2", kind: "gap" as const, prompt: "___", answer: "hello", explain: "" },
    ];
    const result = gradeObjectiveItems(items, { q1: "A", q2: "hello" });
    expect(result.raw).toBe(2);
    expect(result.percent).toBe(100);
  });

  it("scoreIeltsWriting returns feedback for under-length writing", () => {
    const task = WRITING_TASKS[0];
    const result = scoreIeltsWriting(task, "Short.");
    expect(result.percent).toBeLessThan(50);
    expect(result.feedback.some((f) => f.includes("Under length"))).toBe(true);
  });

  it("gapToTarget reports when target is met", () => {
    const gap = gapToTarget({ reading: 85, writing: 82 }, 7);
    expect(gap.meetsTarget).toBe(true);
    expect(gap.gap).toBe(0);
  });

  it("gapToTarget reports gap when target is missed", () => {
    const gap = gapToTarget({ reading: 45 }, 7);
    expect(gap.meetsTarget).toBe(false);
    expect(gap.gap).toBeGreaterThan(0);
  });

  it("content banks are non-empty", () => {
    expect(READING_SETS.length).toBeGreaterThanOrEqual(5);
    expect(LISTENING_SETS.length).toBeGreaterThanOrEqual(3);
    expect(WRITING_TASKS.length).toBeGreaterThanOrEqual(5);
    expect(SPEAKING_CARDS.length).toBeGreaterThanOrEqual(6);
  });
});

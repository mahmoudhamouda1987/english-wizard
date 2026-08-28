import { describe, expect, it } from "vitest";
import {
  adaptiveOrderForStart,
  levelToEstimate,
  paperForVariant,
  g,
  CEFR_ORDER,
} from "./levelquest";

describe("LevelQuest adaptivity", () => {
  it("does not start an A1 learner on the same questions as a C2 learner", () => {
    const variant = 1;
    const a1Paper = adaptiveOrderForStart(variant, levelToEstimate("A1"));
    const c2Paper = adaptiveOrderForStart(variant, levelToEstimate("C2"));
    const a1Start = g(a1Paper[0]);
    const c2Start = g(c2Paper[0]);
    expect(c2Start - a1Start).toBeGreaterThan(1.5);
  });

  it("ramps difficulty upward from a learner's starting level", () => {
    const paper = adaptiveOrderForStart(1, levelToEstimate("A2"));
    const objective = paper.filter((i) => i.type !== "speaking").slice(0, 20);
    const start = g(objective[0]);
    let climbed = 0;
    for (const item of objective.slice(1)) {
      if (g(item) > start + 0.8) climbed++;
    }
    expect(climbed).toBeGreaterThan(0);
  });

  it("produces a deterministic order for the same start level", () => {
    const a = adaptiveOrderForStart(1, levelToEstimate("B1")).map((i) => i.id);
    const b = adaptiveOrderForStart(1, levelToEstimate("B1")).map((i) => i.id);
    expect(a).toEqual(b);
  });

  it("includes every objective item once, then speaking last", () => {
    const paper = adaptiveOrderForStart(1, levelToEstimate("B1"));
    const ids = paper.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    const lastIdx = paper.findIndex((i) => i.type === "speaking");
    const laterNonSpeaking = paper.slice(lastIdx).some((i) => i.type !== "speaking");
    expect(laterNonSpeaking).toBe(false);
  });

  it("paperForVariant partitions objective before speaking, with no gaps", () => {
    const paper = paperForVariant(1);
    const firstSpeaking = paper.findIndex((i) => i.type === "speaking");
    const laterObjective = paper.slice(firstSpeaking).some((i) => i.type !== "speaking");
    expect(firstSpeaking).toBeGreaterThan(0);
    expect(laterObjective).toBe(false);
    expect(paper.length).toBe(adaptiveOrderForStart(1, 3).length);
  });

  it("maps known levels and defaults unknown learners to the midpoint", () => {
    expect(levelToEstimate("Pre-A1")).toBe(0);
    expect(levelToEstimate("C2")).toBe(6);
    expect(levelToEstimate(null)).toBe(CEFR_ORDER.indexOf("B1"));
    expect(levelToEstimate("NOT-A-LEVEL")).toBe(CEFR_ORDER.indexOf("B1"));
  });
});

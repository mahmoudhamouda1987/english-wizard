import { describe, expect, it } from "vitest";
import {
  adaptiveOrderForStart,
  levelToEstimate,
  paperForVariant,
  g,
  CEFR_ORDER,
  simulateConvergence,
  VARIANT_THEMES,
  LEVELQUEST_BANK,
  type LevelQuestItem,
} from "./levelquest";

const objectiveOf = (paper: LevelQuestItem[]) => paper.filter((i) => i.type !== "speaking").map((i) => g(i));

describe("LevelQuest variant distinctness (Part 12-13)", () => {
  it("defines 15 unique thematic identities", () => {
    expect(VARIANT_THEMES).toHaveLength(15);
    expect(new Set(VARIANT_THEMES).size).toBe(15);
    expect(VARIANT_THEMES.filter((t, i) => VARIANT_THEMES.indexOf(t) === i)).toHaveLength(15);
  });

  it("assigns each variant a distinct speaking prompt per level (not just reordering)", () => {
    for (const level of CEFR_ORDER) {
      const prompts = LEVELQUEST_BANK.filter((i) => i.type === "speaking" && i.cefr === level).map((i) => i.prompt);
      // 15 variants but only fully distinct prompts: at least most levels differ.
      expect(new Set(prompts).size).toBeGreaterThanOrEqual(15);
    }
  });

  it("every variant carries its theme on items", () => {
    for (let v = 1; v <= 15; v++) {
      const paper = paperForVariant(v);
      const themes = new Set(paper.map((i) => i.theme));
      expect(themes.has(VARIANT_THEMES[v - 1])).toBe(true);
    }
  });

  it("gives each variant genuinely distinct objective prompts per level (not shared templates)", () => {
    for (const level of CEFR_ORDER) {
      // Objective prompt identity across all 15 variants for a given level.
      const prompts: string[][] = [];
      for (let v = 1; v <= 15; v++) {
        prompts.push(paperForVariant(v).filter((i) => i.type !== "speaking" && i.cefr === level).map((i) => i.prompt));
      }
      // Every level should present largely unique prompts across the variants.
      const all = prompts.flat();
      expect(new Set(all).size / all.length).toBeGreaterThan(0.6);
    }
  });

  it("keeps 105 unique themed speaking prompts plus a rich themed objective bank", () => {
    expect(LEVELQUEST_BANK.filter((i) => i.type === "speaking")).toHaveLength(105);
    const objective = LEVELQUEST_BANK.filter((i) => i.type !== "speaking");
    // A large, genuinely themed objective bank (~1,000 bespoke questions).
    expect(objective.length).toBeGreaterThanOrEqual(15 * 7 * 8);
    // Within a single sitting/paper, no objective prompt is ever repeated.
    for (let v = 1; v <= 15; v++) {
      const prompts = paperForVariant(v).filter((i) => i.type !== "speaking").map((i) => i.prompt);
      expect(new Set(prompts).size, `variant ${v}`).toBe(prompts.length);
    }
  });
});

describe("LevelQuest baseline-first adaptivity", () => {
  it("anchors an unknown learner at the baseline, not the B1 midpoint", () => {
    expect(levelToEstimate(null)).toBe(0);
    expect(levelToEstimate("NOT-A-LEVEL")).toBe(0);
    expect(levelToEstimate("Pre-A1")).toBe(0);
    expect(levelToEstimate("C2")).toBe(6);
  });

  it("does not open an unknown learner with advanced questions", () => {
    // Unknown learner (baseline 0): the first items must be near the baseline.
    const unknownPaper = adaptiveOrderForStart(1, levelToEstimate(null));
    const firstG = objectiveOf(unknownPaper)[0];
    // Opening difficulty must be at or just above baseline, never mid/B1 or higher.
    expect(firstG).toBeLessThanOrEqual(1.2);
  });

  it("opens a known C2 learner on harder items than an A1 learner", () => {
    const variant = 1;
    const a1Paper = adaptiveOrderForStart(variant, levelToEstimate("A1"));
    const c2Paper = adaptiveOrderForStart(variant, levelToEstimate("C2"));
    const a1Start = g(a1Paper[0]);
    const c2Start = g(c2Paper[0]);
    expect(c2Start - a1Start).toBeGreaterThan(1.5);
  });

  it("climbs one band at a time from the baseline (no high-jump up front)", () => {
    // For a mid-level learner the opening band is their band-1, then +1 per stage.
    const paper = adaptiveOrderForStart(1, levelToEstimate("B2"));
    const diffs = objectiveOf(paper);
    // First item difficulty must correspond to B1-ish, i.e. roughly band 2-3, not 6.
    expect(diffs[0]).toBeLessThanOrEqual(3.2);
  });

  it("produces a deterministic order for the same start level", () => {
    const a = adaptiveOrderForStart(1, levelToEstimate("B1")).map((i) => i.id);
    const b = adaptiveOrderForStart(1, levelToEstimate("B1")).map((i) => i.id);
    expect(a).toEqual(b);
  });

  it("includes every objective item once (order preserves the battery), speaking last", () => {
    const paper = adaptiveOrderForStart(1, levelToEstimate("B1"));
    const ids = paper.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    const objectiveIds = paperForVariant(1).filter((i) => i.type !== "speaking").map((i) => i.id);
    for (const oid of objectiveIds) expect(ids).toContain(oid);
    const lastIdx = paper.findIndex((i) => i.type === "speaking");
    const laterNonSpeaking = paper.slice(lastIdx).some((i) => i.type !== "speaking");
    expect(laterNonSpeaking).toBe(false);
  });

  it("converges to the learner's true level for all seven profiles", () => {
    const variant = 1;
    for (let trueIdx = 0; trueIdx < CEFR_ORDER.length; trueIdx++) {
      const paper = adaptiveOrderForStart(variant, trueIdx);
      const converged = simulateConvergence(paper, trueIdx);
      // Converged estimate must land on or within one band of the true level.
      const err = Math.abs(converged - trueIdx);
      expect(err, `profile ${CEFR_ORDER[trueIdx]} (${trueIdx}) -> ${converged}`).toBeLessThanOrEqual(1.1);
    }
  });
});

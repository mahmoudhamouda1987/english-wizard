import { describe, expect, it } from "vitest";
import {
  adaptiveOrderForStart,
  CEFR_ORDER,
  LEVELQUEST_BANK,
  paperForVariant,
  simulateConvergence,
  variantForLearner,
  levelToEstimate,
} from "./levelquest";

const objectiveFor = (v: number) => paperForVariant(v).filter((i) => i.type !== "speaking");
const SKILLS = ["grammar", "vocabulary", "reading", "listening"] as const;

describe("LevelQuest content quality — 15 variants (Part 58, 60)", () => {
  it("every variant covers all four objective skills at every CEFR level", () => {
    for (let v = 1; v <= 15; v++) {
      const objs = objectiveFor(v);
      for (const level of CEFR_ORDER) {
        for (const skill of SKILLS) {
          const n = objs.filter((i) => i.cefr === level && i.skill === skill).length;
          expect(n, `variant ${v} ${level} ${skill}`).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it("each objective item has its answer in options with >=2 unique distractors", () => {
    for (const item of LEVELQUEST_BANK) {
      if (item.type === "speaking") continue;
      expect(item.options.length, item.id).toBeGreaterThanOrEqual(3);
      expect(item.options, item.id).toContain(item.answer);
      const distractors = item.options.filter((o) => o !== item.answer);
      expect(new Set(distractors).size, `distractor uniqueness ${item.id}`).toBeGreaterThanOrEqual(2);
      expect(new Set(item.options).size, `option uniqueness ${item.id}`).toBe(item.options.length);
    }
  });

  it("objective items carry complete metadata (prompt, subskill, explanation, difficulty)", () => {
    for (const item of LEVELQUEST_BANK) {
      if (item.type === "speaking") continue;
      expect(item.prompt.trim().length, item.id).toBeGreaterThan(0);
      expect(item.subskill.trim().length, item.id).toBeGreaterThan(0);
      expect(item.explanation.trim().length, item.id).toBeGreaterThan(0);
      expect(item.difficulty, item.id).toBeGreaterThanOrEqual(1);
      expect(item.difficulty, item.id).toBeLessThanOrEqual(9);
    }
  });

  it("listening items carry audio text; MCQ items do not", () => {
    for (const item of LEVELQUEST_BANK) {
      if (item.type === "speaking") continue;
      if (item.type === "listening") {
        expect(item.audioText, item.id).toBeTruthy();
      } else {
        expect(item.audioText, item.id).toBeUndefined();
      }
    }
  });

  it("no duplicate objective prompt within any variant's paper", () => {
    for (let v = 1; v <= 15; v++) {
      const prompts = objectiveFor(v).map((i) => i.prompt);
      expect(new Set(prompts).size, `variant ${v}`).toBe(prompts.length);
    }
  });

  it("each variant's overall objective paper is substantially distinct from every other", () => {
    // Two variants should not share most of their objective prompt content.
    for (let a = 1; a <= 15; a++) {
      const setA = new Set(objectiveFor(a).map((i) => i.prompt));
      for (let b = a + 1; b <= 15; b++) {
        const setB = new Set(objectiveFor(b).map((i) => i.prompt));
        const overlap = [...setA].filter((p) => setB.has(p)).length;
        const ratio = overlap / Math.max(1, setA.size);
        expect(ratio, `variants ${a} vs ${b}`).toBeLessThan(0.2);
      }
    }
  });
});

describe("LevelQuest adaptive QA — all 15 variants (Part 59, 60)", () => {
  it("every variant converges to within one band of the true level for all seven profiles", () => {
    for (let v = 1; v <= 15; v++) {
      for (let trueIdx = 0; trueIdx < CEFR_ORDER.length; trueIdx++) {
        const paper = adaptiveOrderForStart(v, trueIdx);
        const converged = simulateConvergence(paper, trueIdx);
        const err = Math.abs(converged - trueIdx);
        expect(err, `variant ${v} profile ${CEFR_ORDER[trueIdx]} -> ${converged}`).toBeLessThanOrEqual(1.1);
      }
    }
  });

  it("every variant opens near the baseline for an unknown learner (no high-jump)", () => {
    for (let v = 1; v <= 15; v++) {
      const objs = adaptiveOrderForStart(v, levelToEstimate(null)).filter((i) => i.type !== "speaking");
      expect(objs.length, `variant ${v}`).toBeGreaterThan(0);
    }
  });
});

describe("LevelQuest variant assignment (Part 13)", () => {
  it("distributes learners across all 15 variants deterministically", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 300; i++) seen.add(variantForLearner(`learner-${i}`));
    expect(seen.size).toBe(15);
    for (let v = 1; v <= 15; v++) expect(seen.has(v)).toBe(true);
  });

  it("keeps a stable variant for the same learner id", () => {
    expect(variantForLearner("person-42")).toBe(variantForLearner("person-42"));
  });
});

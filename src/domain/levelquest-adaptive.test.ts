import { describe, expect, it } from "vitest";
import {
  CEFR_ORDER,
  LEVELQUEST_BANK,
  SESSION_BUDGET,
  estimateStandardError,
  firstLessonIdForLevel,
  paperForVariant,
  placementVerdict,
  probabilityCorrect,
  recomputeEstimate,
  selectNextAdaptiveItem,
  selectNextSpeakingItem,
  updateEstimate,
  variantForLearner,
} from "./levelquest";

const variantItems = (v: number) => LEVELQUEST_BANK.filter((i) => i.variant === v);

describe("Adaptive engine v2 — runtime item selection (Part 6)", () => {
  it("selects items within ±1 band of the estimate when the pool allows", () => {
    const asked: string[] = [];
    const item = selectNextAdaptiveItem(1, { askedIds: asked, estimate: 3.2, skillTotal: {} });
    expect(item).not.toBeNull();
    const gOf = (i: { cefr: string; difficulty: number }) => CEFR_ORDER.indexOf(i.cefr as never) + i.difficulty / 10;
    expect(Math.abs(gOf(item!) - 3.2)).toBeLessThanOrEqual(1.0 + 1e-9);
  });

  it("never presents the same item twice within a sitting", () => {
    const asked: string[] = [];
    const skillTotal: Record<string, number> = {};
    for (let n = 0; n < 40; n++) {
      const item = selectNextAdaptiveItem(2, { askedIds: asked, estimate: 2.5, skillTotal });
      if (!item) break;
      expect(asked).not.toContain(item.id);
      asked.push(item.id);
      skillTotal[item.skill] = (skillTotal[item.skill] ?? 0) + 1;
    }
    expect(new Set(asked).size).toBe(asked.length);
  });

  it("balances skills: over a long sitting no objective skill is starved", () => {
    const asked: string[] = [];
    const skillTotal: Record<string, number> = {};
    for (let n = 0; n < 30; n++) {
      const item = selectNextAdaptiveItem(3, { askedIds: asked, estimate: 3.0, skillTotal });
      if (!item) break;
      asked.push(item.id);
      skillTotal[item.skill] = (skillTotal[item.skill] ?? 0) + 1;
    }
    const counts = ["grammar", "vocabulary", "reading", "listening"].map((s) => skillTotal[s] ?? 0);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(3);
  });

  it("does not jump several levels after one correct answer (estimate moves gradually)", () => {
    let est = 2;
    const easy = variantItems(1).find((i) => i.type !== "speaking" && CEFR_ORDER.indexOf(i.cefr) === 2)!;
    est = updateEstimate(est, true, CEFR_ORDER.indexOf(easy.cefr) + easy.difficulty / 10, 1);
    expect(est).toBeLessThan(3); // one answer cannot catapult a full band
  });

  it("returns null when the variant pool is exhausted", () => {
    const all = variantItems(4).filter((i) => i.type !== "speaking").map((i) => i.id);
    expect(selectNextAdaptiveItem(4, { askedIds: all, estimate: 3, skillTotal: {} })).toBeNull();
  });

  it("keeps difficulty near the estimate across a full simulated sitting (no wild oscillation)", () => {
    const asked: string[] = [];
    const skillTotal: Record<string, number> = {};
    let est = 2;
    const diffs: number[] = [];
    for (let n = 0; n < 30; n++) {
      const item = selectNextAdaptiveItem(5, { askedIds: asked, estimate: est, skillTotal });
      if (!item) break;
      const gOf = CEFR_ORDER.indexOf(item.cefr) + item.difficulty / 10;
      diffs.push(Math.abs(gOf - est));
      asked.push(item.id);
      skillTotal[item.skill] = (skillTotal[item.skill] ?? 0) + 1;
      est = updateEstimate(est, gOf <= est + 0.35, gOf, asked.length);
    }
    const meanGap = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    expect(meanGap).toBeLessThan(1.2);
  });
});

describe("Speaking task selection (Part 8)", () => {
  it("introduces the first speaking task near the estimated level", () => {
    const item = selectNextSpeakingItem(6, [], 4, null);
    expect(item).not.toBeNull();
    expect(Math.abs(CEFR_ORDER.indexOf(item!.cefr) - 4)).toBeLessThanOrEqual(1);
  });

  it("walks upward from the last speaking level for subsequent tasks", () => {
    const first = selectNextSpeakingItem(7, [], 3, null)!;
    const second = selectNextSpeakingItem(7, [first.id], 3, CEFR_ORDER.indexOf(first.cefr))!;
    expect(CEFR_ORDER.indexOf(second.cefr)).toBeGreaterThan(CEFR_ORDER.indexOf(first.cefr));
  });
});

describe("Placement verdict, SE and boundary (Part 14)", () => {
  it("gives High confidence with a large, consistent, informative set", () => {
    // 20 informative items near ability 3.0 (two variants' B1 pools).
    const items = [...variantItems(1), ...variantItems(2)]
      .filter((i) => i.type !== "speaking" && CEFR_ORDER.indexOf(i.cefr) === 3).slice(0, 20);
    const verdict = placementVerdict(3.0, items);
    expect(verdict.level).toBe("B1");
    expect(verdict.confidence).toBe("High");
  });

  it("gives Moderate confidence when evidence is thin", () => {
    const items = variantItems(1).filter((i) => i.type !== "speaking").slice(0, 4);
    const verdict = placementVerdict(2.0, items);
    expect(verdict.confidence).toBe("Moderate");
    expect(verdict.boundary).toBeNull();
  });

  it("reports an emerging boundary when the estimate rounds up into the band", () => {
    const items = [...variantItems(1), ...variantItems(2)]
      .filter((i) => i.type !== "speaking" && CEFR_ORDER.indexOf(i.cefr) === 2).slice(0, 18);
    // 2.62 rounds up into B1 → verdict B1 with an "A2 / Emerging B1" boundary.
    const verdict = placementVerdict(2.62, items);
    expect(verdict.level).toBe("B1");
    expect(verdict.boundary).toBe("A2 / Emerging B1");
  });

  it("claims no boundary when the estimate sits at/above the band centre", () => {
    const items = [...variantItems(1), ...variantItems(2)]
      .filter((i) => i.type !== "speaking" && CEFR_ORDER.indexOf(i.cefr) === 3).slice(0, 18);
    const verdict = placementVerdict(3.35, items);
    expect(verdict.level).toBe("B1");
    expect(verdict.boundary).toBeNull();
  });

  it("SE decreases as information accumulates", () => {
    const one = estimateStandardError(variantItems(1).slice(0, 1), 3);
    const many = estimateStandardError(variantItems(1).filter((i) => i.type !== "speaking").slice(0, 25), 3);
    expect(many).toBeLessThan(one);
  });

  it("probabilityCorrect is logistic and monotone in ability", () => {
    expect(probabilityCorrect(3, 3)).toBeCloseTo(0.5);
    expect(probabilityCorrect(4, 3)).toBeGreaterThan(0.5);
    expect(probabilityCorrect(2, 3)).toBeLessThan(0.5);
  });
});

describe("Estimate recalculation on answer changes (Part 10)", () => {
  it("recomputeEstimate reproduces the incremental estimate over the same evidence", () => {
    const paper = paperForVariant(1).filter((i) => i.type !== "speaking").slice(0, 12);
    const answers: Record<string, { correct: boolean }> = {};
    let incremental = 0;
    let n = 0;
    for (const item of paper) {
      const correct = (CEFR_ORDER.indexOf(item.cefr) + item.difficulty) % 2 === 0;
      answers[item.id] = { correct };
      n += 1;
      incremental = updateEstimate(incremental, correct, CEFR_ORDER.indexOf(item.cefr) + item.difficulty / 10, n);
    }
    const recomputed = recomputeEstimate(paper, answers, 0);
    expect(recomputed).toBeCloseTo(incremental, 10);
  });

  it("changing an answer changes the recalculated estimate accordingly", () => {
    const paper = paperForVariant(2).filter((i) => i.type !== "speaking").slice(0, 10);
    const answersWrongAll: Record<string, { correct: boolean }> = {};
    const answersImproved: Record<string, { correct: boolean }> = {};
    for (const item of paper) {
      answersWrongAll[item.id] = { correct: false };
      answersImproved[item.id] = { correct: true };
    }
    const low = recomputeEstimate(paper, answersWrongAll, 0);
    const high = recomputeEstimate(paper, answersImproved, 0);
    expect(high).toBeGreaterThan(low);
  });
});

describe("Placement → curriculum anchor (Part 24)", () => {
  it("maps every CEFR level to a real curriculum lesson at that level", async () => {
    const { MVP_LESSONS } = await import("./curriculum");
    for (const level of CEFR_ORDER) {
      const lessonId = firstLessonIdForLevel(level);
      const lesson = MVP_LESSONS.find((l) => l.id === lessonId);
      expect(lesson, `${level} → ${lessonId}`).toBeTruthy();
      expect(lesson!.level).toBe(level);
    }
    expect(firstLessonIdForLevel("unknown")).toBe("lesson-01-me-my-world");
  });
});

describe("Session budget (Part 9 — 30-minute fit)", () => {
  it("fits the nominal completion time inside 30 minutes", () => {
    const totalNominal =
      SESSION_BUDGET.objective * 33 + // mixed mcq/listening average seconds
      SESSION_BUDGET.speaking * 70;  // speaking average seconds
    expect(totalNominal).toBeLessThan(30 * 60 - 120); // 2 min headroom for transitions
  });

  it("variant assignment stays stable per learner and within 1..15", () => {
    for (const seed of ["learner-a", "learner-b", 12345, "x"]) {
      const v = variantForLearner(seed);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(15);
      expect(variantForLearner(seed)).toBe(v);
    }
  });
});

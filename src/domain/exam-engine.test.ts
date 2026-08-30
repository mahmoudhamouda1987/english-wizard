import { describe, it, expect } from "vitest";
import { scoreExam, validateAttempt, targetedSkillPlan } from "./exam-engine";

describe("Shared exam scoring contract (Parts 75/76/155)", () => {
  it("scores IELTS-style performance into honest bands with ranges", () => {
    const s = scoreExam({ scoringType: "ielts_band", percent: 84 });
    expect(s.scoringType).toBe("ielts_band");
    expect(s.headline).toMatch(/^[3-9](\.\d)?$/);
    expect(s.range.length).toBe(2);
    expect(s.interpretation).toBeTruthy();
  });

  it("monotonically maps higher percent to higher IELTS bands", () => {
    const low = scoreExam({ scoringType: "ielts_band", percent: 30 }).headline;
    const mid = scoreExam({ scoringType: "ielts_band", percent: 55 }).headline;
    const high = scoreExam({ scoringType: "ielts_band", percent: 85 }).headline;
    expect(Number(low)).toBeLessThan(Number(mid));
    expect(Number(mid)).toBeLessThan(Number(high));
  });

  it("scores Cambridge on a scale anchored to the qualification", () => {
    const b2 = scoreExam({ scoringType: "cambridge_scale", percent: 80, qualificationId: "B2_FIRST" });
    const c2 = scoreExam({ scoringType: "cambridge_scale", percent: 80, qualificationId: "C2_PROFICIENCY" });
    expect(Number(b2.headline)).toBeLessThan(Number(c2.headline));
    expect(b2.scoringType).toBe("cambridge_scale");
  });

  it("estimates CEFR honestly from percent", () => {
    expect(scoreExam({ scoringType: "cefr_estimate", percent: 96 }).headline).toBe("C2");
    expect(scoreExam({ scoringType: "cefr_estimate", percent: 10 }).headline).toBe("Pre-A1");
    expect(scoreExam({ scoringType: "cefr_estimate", percent: 58 }).headline).toBe("B1");
  });

  it("clamps absurd inputs instead of producing nonsense", () => {
    const s = scoreExam({ scoringType: "ielts_band", percent: 250 });
    expect(s.normalised).toBeLessThanOrEqual(100);
  });
});

describe("Attempt validation (Part 91 — never fabricate a report)", () => {
  it("rejects attempts with no responses", () => {
    expect(validateAttempt({ answered: 0, required: 20, percent: null }).valid).toBe(false);
  });

  it("rejects incomplete attempts", () => {
    const v = validateAttempt({ answered: 12, required: 20, percent: 60 });
    expect(v.valid).toBe(false);
    expect(v.reason).toContain("incomplete");
  });

  it("accepts complete attempts with real scores", () => {
    expect(validateAttempt({ answered: 20, required: 20, percent: 72 }).valid).toBe(true);
  });
});

describe("Targeted skill plan (Part 70 — OSR-aware, no eligibility claims)", () => {
  it("identifies the single below-target skill for a focused plan", () => {
    const plan = targetedSkillPlan({ listening: 7, reading: 7, speaking: 7, writing: 6 }, 7);
    expect(plan.below).toEqual(["writing"]);
    expect(plan.message).toContain("writing");
    expect(plan.message.toLowerCase()).toContain("two-week");
  });

  it("confirms readiness when every skill meets target", () => {
    const plan = targetedSkillPlan({ listening: 7, reading: 7.5, speaking: 7, writing: 7 }, 7);
    expect(plan.below).toHaveLength(0);
    expect(plan.message).toContain("mock");
  });

  it("never claims official OSR eligibility", () => {
    const plan = targetedSkillPlan({ listening: 6, reading: 6, speaking: 6, writing: 5 }, 6.5);
    expect(plan.message.toLowerCase()).not.toContain("osr eligible");
    expect(plan.message.toLowerCase()).not.toContain("official");
  });
});

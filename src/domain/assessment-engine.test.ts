import { describe, expect, it } from "vitest";
import { assessmentIsUncertain, summarizeAssessmentEvidence } from "./assessment-engine";

describe("assessment evidence fusion", () => {
  it("reports uncertainty when evidence is sparse", () => {
    const [summary] = summarizeAssessmentEvidence([{ skill: "reading", score: 70, difficulty: 1, correct: 1, total: 1 }]);
    expect(summary.evidenceCount).toBe(1);
    expect(assessmentIsUncertain(summary)).toBe(true);
  });

  it("uses consistency and difficulty coverage as confidence signals", () => {
    const [summary] = summarizeAssessmentEvidence([
      { skill: "reading", score: 70, difficulty: 1, correct: 7, total: 10, historyScores: [68, 70, 72] },
      { skill: "reading", score: 74, difficulty: 4, correct: 7, total: 10, historyScores: [68, 70, 72] },
    ]);
    expect(summary.estimatedScore).toBe(72);
    expect(summary.difficultyCoverage).toBe(1);
    expect(summary.consistency).toBeGreaterThan(0.9);
    expect(summary.confidence).toBeGreaterThan(0.6);
    expect(summary.uncertainty).toBeLessThan(0.4);
  });
});

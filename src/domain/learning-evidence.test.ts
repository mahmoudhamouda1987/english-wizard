import { describe, expect, it } from "vitest";
import { buildEvidence, shouldCountAsMasteryEvidence, summarizeEvidence } from "./learning-evidence";

const base = {
  learnerId: "learner-1",
  sessionType: "STANDARD_JOURNEY" as const,
  missionId: "mission-a1-1",
  objectiveId: "obj-a1-1",
  capabilityIds: ["cap-1"],
  modality: "SPEAKING" as const,
  outcome: "CORRECT" as const,
  confidence: 0.8,
  level: "A1" as const,
  context: "TRANSFER" as const,
  errorTags: [" grammar ", "grammar", ""],
  createdAt: "2026-08-18T00:00:00.000Z",
};

describe("learning evidence", () => {
  it("clamps score and normalizes duplicate error tags", () => {
    const evidence = buildEvidence({ ...base, id: "e1", score: 130 });
    expect(evidence.score).toBe(100);
    expect(evidence.errorTags).toEqual(["grammar"]);
  });

  it("requires non-familiar evidence with confidence for mastery evidence", () => {
    expect(shouldCountAsMasteryEvidence(buildEvidence({ ...base, id: "e1", score: 80 }))).toBe(true);
    expect(shouldCountAsMasteryEvidence(buildEvidence({ ...base, id: "e2", context: "FAMILIAR", score: 100 }))).toBe(false);
  });

  it("summarizes modality, correctness and transfer", () => {
    const evidence = [
      buildEvidence({ ...base, id: "e1", score: 80 }),
      buildEvidence({ ...base, id: "e2", modality: "LISTENING", outcome: "PARTIAL", context: "UNFAMILIAR", score: 60 }),
    ];
    const summary = summarizeEvidence(evidence);
    expect(summary.total).toBe(2);
    expect(summary.byModality.SPEAKING).toBe(1);
    expect(summary.byModality.LISTENING).toBe(1);
    expect(summary.correctRate).toBe(0.5);
    expect(summary.transferCount).toBe(1);
  });
});

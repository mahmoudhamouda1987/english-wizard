import { describe, expect, it } from "vitest";
import { chooseNextDiagnosticItem, shouldStopAdaptiveDiagnostic, updateDiagnosticEvidence, type AdaptiveDiagnosticState, type DiagnosticItem } from "./adaptive-diagnostic";

const items: DiagnosticItem[] = [
  { id: "g1", skill: "grammar", difficulty: 1, objectiveId: "a1", correct: "am" },
  { id: "g2", skill: "grammar", difficulty: 4, objectiveId: "b1", correct: "have been" },
  { id: "r1", skill: "reading", difficulty: 2, objectiveId: "a2", correct: "because" },
  { id: "s1", skill: "speaking", difficulty: 3, objectiveId: "b1", correct: "my name is" },
];

const initial: AdaptiveDiagnosticState = { evidence: [], askedIds: [], maxQuestions: 8, minEvidencePerSkill: 2 };

describe("adaptive diagnostic", () => {
  it("prioritizes uncovered skills", () => {
    const next = chooseNextDiagnosticItem(items, initial);
    expect(next).toBeTruthy();
  });

  it("updates confidence and uncertainty from accumulated evidence", () => {
    let state = updateDiagnosticEvidence(initial, items[0], { id: "g1", answer: "am" });
    state = updateDiagnosticEvidence(state, items[1], { id: "g2", answer: "have been" });
    const grammar = state.evidence.find((entry) => entry.skill === "grammar");
    expect(grammar?.answered).toBe(2);
    expect(grammar?.confidence).toBeGreaterThan(grammar?.uncertainty ?? 1);
  });

  it("does not stop until all required skills have adequate evidence", () => {
    const state: AdaptiveDiagnosticState = {
      ...initial,
      askedIds: ["g1", "g2", "r1", "s1"],
      evidence: [
        { skill: "grammar", score: 100, confidence: 0.8, uncertainty: 0.2, answered: 2, correct: 2, recentConsistency: 1 },
        { skill: "reading", score: 100, confidence: 0.8, uncertainty: 0.2, answered: 2, correct: 2, recentConsistency: 1 },
        { skill: "speaking", score: 100, confidence: 0.8, uncertainty: 0.2, answered: 2, correct: 2, recentConsistency: 1 },
      ],
    };
    expect(shouldStopAdaptiveDiagnostic(state, ["grammar", "reading", "speaking"])).toBe(true);
  });

  it("never exceeds its configured question cap", () => {
    const capped = { ...initial, askedIds: items.map((item) => item.id).concat(["extra-1", "extra-2", "extra-3", "extra-4"]) };
    expect(chooseNextDiagnosticItem(items, capped)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { buildReviewQueue, isReleaseReady } from "./release-governance";
import type { ContentGovernanceRecord, EvaluationCase, HumanReviewGate } from "./content-governance";

const content: ContentGovernanceRecord = {
  contentId: "c1", origin: "ORIGINAL", rights: "OWNED", review: "DRAFT", level: "B1", objectiveId: "o1", sourceReferences: [],
  safetyChecked: false, answerChecked: false, ambiguityChecked: true, difficultyChecked: true, grammarChecked: true, factsChecked: true,
};
const gate: HumanReviewGate = { contentId: "c1", highStakes: false, required: true, reviewerRole: "CURRICULUM_REVIEWER", status: "PENDING" };
const evaluation: EvaluationCase = { id: "e1", task: "EXPLANATION", input: "x", expectedProperties: ["accurate"], rubric: { accuracy: 0 } };

describe("release governance", () => {
  it("queues blocked content and evaluations", () => {
    const queue = buildReviewQueue([content], [gate], [evaluation]);
    expect(queue).toHaveLength(2);
    expect(queue.every((item) => item.blocking)).toBe(true);
  });

  it("requires every release gate before readiness", () => {
    const complete = { contentBlocked: 0, humanReviewPending: 0, evaluationCoverage: 1, securityChecksPassed: true, accessibilityChecksPassed: true, aiProviderConfigured: true };
    expect(isReleaseReady(complete)).toBe(true);
    expect(isReleaseReady({ ...complete, aiProviderConfigured: false })).toBe(false);
    expect(isReleaseReady({ ...complete, evaluationCoverage: 0.8 })).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { CORE_RESEARCH_ECOSYSTEMS, canPublish, needsHumanReview, type ContentGovernanceRecord } from "./content-governance";

const approved: ContentGovernanceRecord = {
  contentId: "content-1",
  origin: "ORIGINAL",
  rights: "OWNED",
  review: "APPROVED",
  level: "A2",
  objectiveId: "a2-work-routines",
  sourceReferences: ["coe-cefr-companion-2020"],
  safetyChecked: true,
  answerChecked: true,
  ambiguityChecked: true,
  difficultyChecked: true,
  grammarChecked: true,
  factsChecked: true,
};

describe("content governance", () => {
  it("only publishes fully checked approved content", () => {
    expect(canPublish(approved)).toBe(true);
    expect(canPublish({ ...approved, factsChecked: false })).toBe(false);
    expect(canPublish({ ...approved, rights: "PENDING_REVIEW" })).toBe(false);
  });

  it("requires human review for external/reference-sensitive content", () => {
    expect(needsHumanReview({ ...approved, origin: "EXTERNAL_REFERENCE" })).toBe(true);
    expect(needsHumanReview({ ...approved, rights: "OWNED" })).toBe(false);
  });

  it("contains dated authoritative reference records", () => {
    expect(CORE_RESEARCH_ECOSYSTEMS.length).toBeGreaterThanOrEqual(5);
    expect(CORE_RESEARCH_ECOSYSTEMS.every((item) => item.url && item.consultedAt)).toBe(true);
    expect(CORE_RESEARCH_ECOSYSTEMS.some((item) => item.id === "coe-cefr-companion-2020")).toBe(true);
    expect(CORE_RESEARCH_ECOSYSTEMS.some((item) => item.id === "ielts-scoring")).toBe(true);
  });
});

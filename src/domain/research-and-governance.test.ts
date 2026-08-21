import { describe, expect, it } from "vitest";
import { CORE_RESEARCH_REFERENCES, contentReviewReady, privacyDefaults, createEvaluationCase } from "./research-and-governance";

describe("research and governance", () => {
  it("keeps authoritative curriculum references reference-only by default", () => {
    expect(CORE_RESEARCH_REFERENCES.length).toBeGreaterThanOrEqual(4);
    expect(CORE_RESEARCH_REFERENCES.every((item) => item.rightsStatus === "reference_only")).toBe(true);
  });

  it("does not approve content until all review gates pass", () => {
    const base = {
      contentId: "content-1",
      levelCheck: "pass" as const,
      grammarCheck: "pass" as const,
      answerKeyCheck: "pass" as const,
      ambiguityCheck: "pass" as const,
      factualCheck: "pass" as const,
      safetyCheck: "pass" as const,
      alignmentCheck: "pass" as const,
      approval: "review_required" as const,
    };
    expect(contentReviewReady(base)).toBe(true);
    expect(contentReviewReady({ ...base, safetyCheck: "fail" })).toBe(false);
  });

  it("defaults voice processing to opt-out", () => {
    const prefs = privacyDefaults("learner-1", "2026-08-17T00:00:00.000Z");
    expect(prefs.voiceProcessing).toBe(false);
    expect(prefs.voiceRetentionDays).toBe(7);
    expect(createEvaluationCase("lesson", "Teach present perfect", "lesson-schema", ["CEFR alignment"], "high", ["cefr", "schema"]).task).toBe("lesson");
  });
});

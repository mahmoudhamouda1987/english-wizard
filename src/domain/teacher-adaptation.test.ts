import { describe, expect, it } from "vitest";
import { chooseTeachingMove, explainDifferently, thinkingInEnglishPrompt, updateInterest } from "./teacher-adaptation";

describe("teacher adaptation", () => {
  it("prioritizes explicit learner confusion", () => {
    const decision = chooseTeachingMove({ level:"A1", skill:"grammar", score:30, confidence:0.3, errorCount:2, learnerAskedForHelp:true, repeatedFailure:true, strongPerformance:false, dailyMinutes:20 });
    expect(decision.move).toBe("simplify");
    expect(decision.helpMode).toBe("different_example");
  });

  it("broadens strong interests instead of repeating one topic forever", () => {
    const interests = updateInterest([
      { topic:"travel", score:30, source:"onboarding", observedAt:"2026-08-17T00:00:00.000Z" },
      { topic:"travel", score:45, source:"choice", observedAt:"2026-08-17T00:05:00.000Z" },
      { topic:"work", score:10, source:"onboarding", observedAt:"2026-08-17T00:00:00.000Z" },
    ]);
    expect(interests[0].topic).toBe("travel");
    expect(interests[0].breadthSuggestion).toContain("related");
  });

  it("supports differently explained concepts and thinking-in-English progression", () => {
    expect(explainDifferently("arabic_support", "present perfect")).toContain("Arabic");
    expect(thinkingInEnglishPrompt("C1").stage).toBe("argue");
  });
});

import { describe, expect, it } from "vitest";
import { activityReleaseDecision, canBeMastered, explainWhy, retentionStatus, transferStatus } from "./learning-principles";

describe("learning principles", () => {
  it("explains why an evidence-backed activity exists", () => {
    const text = explainWhy({ objectiveId: "b1-past", learnerNeed: "your spontaneous speaking still shows past-tense errors", evidence: ["speaking-12"], whyNow: "Your latest mission exposed the same error again.", successMetric: "75% contextual accuracy", failureResponse: "targeted retry", masteryResponse: "transfer task" });
    expect(text).toContain("spontaneous speaking");
    expect(text).toContain("latest mission");
  });

  it("does not treat passive accuracy alone as mastery", () => {
    expect(canBeMastered({ spontaneous: false, contextual: true, score: 95 })).toBe(false);
    expect(canBeMastered({ spontaneous: true, contextual: true, score: 80 })).toBe(true);
  });

  it("requires unfamiliar-context evidence for transfer", () => {
    expect(transferStatus({ familiarContextScore: 90, unfamiliarContextScore: 90, unfamiliarContext: false })).toBe("NOT_TESTED");
    expect(transferStatus({ familiarContextScore: 90, unfamiliarContextScore: 82, unfamiliarContext: true })).toBe("TRANSFERED");
    expect(transferStatus({ familiarContextScore: 90, unfamiliarContextScore: 45, unfamiliarContext: true })).toBe("REQUIRES_TRANSFER");
  });

  it("reactivates material when delayed performance drops too far", () => {
    expect(retentionStatus({ priorScore: 88, delayedScore: 80, delayedDays: 7 })).toBe("RETAINED");
    expect(retentionStatus({ priorScore: 88, delayedScore: 40, delayedDays: 7 })).toBe("REACTIVATE");
  });

  it("blocks activity release when its educational rationale is incomplete", () => {
    const result = activityReleaseDecision({ objectiveId: "", learnerNeed: "", evidence: [], whyNow: "", successMetric: "", failureResponse: "", masteryResponse: "" });
    expect(result.shippable).toBe(false);
    expect(result.missing.length).toBe(6);
  });
});

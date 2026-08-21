import { describe, expect, it } from "vitest";
import { MEDIATION_ACTIVITIES, assessMediation, getMediationActivitiesForLevel } from "./mediation";

describe("mediation engine", () => {
  it("progresses activities by CEFR level", () => {
    expect(getMediationActivitiesForLevel("A2").map((item) => item.id)).toContain("med-a2-relay-notice");
    expect(getMediationActivitiesForLevel("A2").map((item) => item.id)).not.toContain("med-c2-policy-synthesis");
    expect(getMediationActivitiesForLevel("C2")).toHaveLength(MEDIATION_ACTIVITIES.length);
  });

  it("requires a meaningful response before treating mediation as demonstrated", () => {
    const activity = MEDIATION_ACTIVITIES.find((item) => item.id === "med-b2-article-explain")!;
    const weak = assessMediation(activity, "Okay.");
    const stronger = assessMediation(activity, "The report shows the company reduced first-month questions by 18%, but the evidence also reports weaker informal connections. This suggests a useful efficiency gain with a trade-off that the manager should consider before extending the approach.");
    expect(weak.nextStep).toBe("RETRY");
    expect(stronger.score).toBeGreaterThan(weak.score);
  });
});

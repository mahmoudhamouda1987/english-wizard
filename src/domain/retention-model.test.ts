import { describe, expect, it } from "vitest";
import { estimateRetention, estimateHalfLife, forgettingProbability } from "./retention-model";

describe("retention model", () => {
  it("keeps the forgetting curve monotonic", () => {
    expect(forgettingProbability(0, 4)).toBe(1);
    expect(forgettingProbability(4, 4)).toBeCloseTo(0.5);
    expect(forgettingProbability(8, 4)).toBeCloseTo(0.25);
  });

  it("increases stability with repeated successful reviews", () => {
    expect(estimateHalfLife(3, 2.5, 5)).toBeGreaterThan(estimateHalfLife(3, 2.5, 0));
  });

  it("classifies retention risk", () => {
    const secure = estimateRetention({ lastReviewedAt: new Date(), intervalDays: 7, ease: 2.5, repetitions: 4 });
    const atRisk = estimateRetention({ lastReviewedAt: new Date(Date.now() - 30 * 86_400_000), intervalDays: 2, ease: 1.4, repetitions: 1 });
    expect(secure.status).toBe("SECURE");
    expect(atRisk.status).toBe("AT_RISK");
  });
});

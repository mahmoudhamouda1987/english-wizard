import { describe, expect, it } from "vitest";
import { checkFeature, effectiveTier, planValueModel, type SubscriptionRecord } from "./subscription";

function subscription(overrides: Partial<SubscriptionRecord> = {}): SubscriptionRecord {
  return {
    learnerId: "learner-1",
    tier: "PLUS",
    status: "ACTIVE",
    provider: "NONE",
    periodStart: "2026-08-01T00:00:00.000Z",
    cancelAtPeriodEnd: false,
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("subscription architecture", () => {
  it("keeps billing state separate from learning state and defaults to FREE", () => {
    expect(effectiveTier(null)).toBe("FREE");
    expect(effectiveTier(subscription({ tier: "PRO" }))).toBe("PRO");
  });

  it("downgrades cancelled and past-due subscriptions immediately for new access", () => {
    expect(effectiveTier(subscription({ status: "CANCELLED" }))).toBe("FREE");
    expect(effectiveTier(subscription({ status: "PAST_DUE" }))).toBe("FREE");
  });

  it("expires subscriptions whose period has ended", () => {
    const expired = subscription({ periodEnd: "2026-08-10T00:00:00.000Z" });
    expect(effectiveTier(expired, new Date("2026-08-21T00:00:00.000Z"))).toBe("FREE");
    expect(effectiveTier(expired, new Date("2026-08-05T00:00:00.000Z"))).toBe("PLUS");
  });

  it("enforces daily quotas per plan without touching learning progress", () => {
    const freeGate = checkFeature(null, "AI_TEACHER", 5);
    expect(freeGate.allowed).toBe(false);
    expect(freeGate.quota).toBe(5);
    const plusGate = checkFeature(subscription(), "AI_TEACHER", 29);
    expect(plusGate.allowed).toBe(true);
    expect(checkFeature(null, "EXAM_PATHWAY").allowed).toBe(false);
    expect(checkFeature(subscription(), "EXAM_PATHWAY").allowed).toBe(true);
  });

  it("communicates the free/premium value model honestly", () => {
    const free = planValueModel("FREE");
    expect(free.free).toContain("CORE_CURRICULUM");
    expect(free.lockedUntilUpgrade).toContain("EXAM_PATHWAY");
    const pro = planValueModel("PRO");
    expect(pro.lockedUntilUpgrade).toHaveLength(0);
  });
});

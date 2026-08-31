import { describe, expect, it } from "vitest";
import { checkFeature, effectiveTier, gatingTier, planValueModel, SUBSCRIPTION_PLANS, type SubscriptionRecord } from "./subscription";

function subscription(overrides: Partial<SubscriptionRecord> = {}): SubscriptionRecord {
  return {
    learnerId: "learner-1",
    tier: "all-access",
    status: "ACTIVE",
    provider: "NONE",
    periodStart: "2026-08-01T00:00:00.000Z",
    cancelAtPeriodEnd: false,
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("subscription architecture — plan is the subscribed product", () => {
  it("keeps billing state separate from learning state and defaults to FREE", () => {
    expect(effectiveTier(null)).toBe("FREE");
    expect(effectiveTier(subscription({ tier: "ielts" }))).toBe("ielts");
    expect(effectiveTier(subscription({ tier: "all-access" }))).toBe("all-access");
  });

  it("downgrades cancelled and past-due subscriptions immediately for new access", () => {
    expect(effectiveTier(subscription({ status: "CANCELLED" }))).toBe("FREE");
    expect(effectiveTier(subscription({ status: "PAST_DUE" }))).toBe("FREE");
  });

  it("expires subscriptions whose period has ended", () => {
    const expired = subscription({ periodEnd: "2026-08-10T00:00:00.000Z" });
    expect(effectiveTier(expired, new Date("2026-08-21T00:00:00.000Z"))).toBe("FREE");
    expect(effectiveTier(expired, new Date("2026-08-05T00:00:00.000Z"))).toBe("all-access");
  });

  it("resolves an active 7-day trial as All Access for gating", () => {
    expect(gatingTier({ subscription: null, trialActive: true })).toBe("all-access");
    expect(gatingTier({ subscription: subscription({ tier: "general-english" }), trialActive: true })).toBe("all-access");
    expect(gatingTier({ subscription: null, trialActive: false })).toBe("FREE");
    expect(gatingTier({ subscription: subscription({ tier: "general-english" }), trialActive: false })).toBe("general-english");
  });

  it("enforces daily quotas per plan without touching learning progress", () => {
    const freeGate = checkFeature(null, "AI_TEACHER", 5);
    expect(freeGate.allowed).toBe(false);
    expect(freeGate.quota).toBe(5);
    const productGate = checkFeature(subscription({ tier: "general-english" }), "AI_TEACHER", 29);
    expect(productGate.allowed).toBe(true);
    expect(checkFeature(null, "EXAM_PATHWAY").allowed).toBe(false);
    expect(checkFeature(subscription({ tier: "ielts" }), "EXAM_PATHWAY").allowed).toBe(true);
    expect(checkFeature(subscription({ tier: "general-english" }), "EXAM_PATHWAY").allowed).toBe(false);
  });

  it("derives the subscribable plan cards from the price catalogue", () => {
    expect(SUBSCRIPTION_PLANS.map((p) => p.tier)).toEqual([
      "general-english",
      "business-english",
      "fluency-track",
      "ielts",
      "cambridge",
      "all-access",
    ]);
    for (const plan of SUBSCRIPTION_PLANS) {
      expect(plan.priceLabel).toMatch(/\/month$/);
      expect(plan.highlights.length).toBeGreaterThan(0);
    }
  });

  it("communicates the free/premium value model honestly", () => {
    const free = planValueModel("FREE");
    expect(free.free).toContain("CORE_CURRICULUM");
    expect(free.lockedUntilUpgrade).toContain("EXAM_PATHWAY");
    const allAccess = planValueModel("all-access");
    expect(allAccess.lockedUntilUpgrade).toHaveLength(0);
    const single = planValueModel("business-english");
    expect(single.lockedUntilUpgrade).toEqual(["EXAM_PATHWAY"]);
  });
});

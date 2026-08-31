import { describe, expect, it } from "vitest";
import { effectiveTierWithGrace, graceDeadline, mapLemonEventName, tierFromVariant } from "./billing-webhooks";

describe("lemonsqueezy webhook mapping", () => {
  it("maps provider events to internal subscription states", () => {
    expect(mapLemonEventName("subscription_created")).toBe("ACTIVE");
    expect(mapLemonEventName("subscription_payment_success")).toBe("ACTIVE");
    expect(mapLemonEventName("subscription_payment_failed")).toBe("PAST_DUE");
    expect(mapLemonEventName("subscription_paused")).toBe("PAUSED");
    expect(mapLemonEventName("subscription_expired")).toBe("CANCELLED");
    expect(mapLemonEventName("order_created")).toBe("IGNORED");
    expect(mapLemonEventName(undefined)).toBe("IGNORED");
  });

  it("derives catalogue products from variant names", () => {
    expect(tierFromVariant("IELTS Monthly")).toBe("ielts");
    expect(tierFromVariant("cambridge-annual")).toBe("cambridge");
    expect(tierFromVariant("General English Plan")).toBe("general-english");
    expect(tierFromVariant("Business English Pro")).toBe("business-english");
    expect(tierFromVariant("Fluency Track")).toBe("fluency-track");
    expect(tierFromVariant("All Access")).toBe("all-access");
  });

  it("treats legacy and unknown paid variants as the complete catalogue", () => {
    expect(tierFromVariant("Pro Monthly")).toBe("all-access");
    expect(tierFromVariant("plus-annual")).toBe("all-access");
    expect(tierFromVariant("Premium Plan")).toBe("all-access");
    expect(tierFromVariant(undefined)).toBe("all-access");
    expect(tierFromVariant("Mystery Bundle")).toBe("all-access");
  });

  it("computes a seven-day grace deadline", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const deadline = new Date(graceDeadline("2026-01-10T00:00:00Z", now)!);
    expect(deadline.toISOString()).toBe("2026-01-17T00:00:00.000Z");
  });

  it("keeps premium access during dunning grace, then downgrades", () => {
    const record = { status: "PAST_DUE" as const, tier: "all-access" as const, periodEnd: "2026-01-10T00:00:00Z" };
    const during = effectiveTierWithGrace(record, new Date("2026-01-12T00:00:00Z"));
    expect(during.tier).toBe("all-access");
    expect(during.inGrace).toBe(true);

    const after = effectiveTierWithGrace(record, new Date("2026-01-20T00:00:00Z"));
    expect(after.tier).toBe("FREE");
    expect(after.inGrace).toBe(false);
  });

  it("never grants access for cancelled or paused records even with a fresh period end", () => {
    const cancelled = { status: "CANCELLED" as const, tier: "ielts" as const, periodEnd: "2999-01-01T00:00:00Z" };
    expect(effectiveTierWithGrace(cancelled).tier).toBe("FREE");
    const paused = { status: "PAUSED" as const, tier: "cambridge" as const, periodEnd: "2999-01-01T00:00:00Z" };
    expect(effectiveTierWithGrace(paused).tier).toBe("FREE");
  });
});

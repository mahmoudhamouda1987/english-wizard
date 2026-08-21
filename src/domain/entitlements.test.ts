import { describe, expect, it } from "vitest";
import { canUseFeature, entitlementFor } from "./entitlements";

describe("entitlements", () => {
  it("keeps core learning free while gating deeper sessions", () => {
    expect(canUseFeature("FREE", "CORE_CURRICULUM")).toBe(true);
    expect(canUseFeature("FREE", "DEEP_STUDY")).toBe(false);
    expect(entitlementFor("PLUS", "EXAM_PATHWAY").enabled).toBe(true);
  });

  it("enforces daily AI quotas", () => {
    expect(canUseFeature("FREE", "AI_TEACHER", 4)).toBe(true);
    expect(canUseFeature("FREE", "AI_TEACHER", 5)).toBe(false);
  });
});

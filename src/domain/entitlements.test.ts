import { describe, expect, it } from "vitest";
import { canUseFeature, entitlementFor, PLAN_ENTITLEMENTS, SUBSCRIBABLE_PRODUCTS } from "./entitlements";

describe("entitlements — one commercial model (2.0 catalogue)", () => {
  it("keeps core learning free while gating deeper sessions", () => {
    expect(canUseFeature("FREE", "CORE_CURRICULUM")).toBe(true);
    expect(canUseFeature("FREE", "DEEP_STUDY")).toBe(false);
    expect(canUseFeature("FREE", "BOSS_MISSION")).toBe(false);
  });

  it("enforces daily AI quotas on the free base state", () => {
    expect(canUseFeature("FREE", "AI_TEACHER", 4)).toBe(true);
    expect(canUseFeature("FREE", "AI_TEACHER", 5)).toBe(false);
    expect(entitlementFor("FREE", "AI_TEACHER").dailyQuota).toBe(5);
    expect(entitlementFor("FREE", "SPEAKING_COACH").dailyQuota).toBe(2);
  });

  it("gives every single-product subscription the same daily allowances", () => {
    for (const product of ["general-english", "business-english", "fluency-track", "ielts", "cambridge"] as const) {
      expect(entitlementFor(product, "AI_TEACHER").dailyQuota).toBe(30);
      expect(entitlementFor(product, "SPEAKING_COACH").dailyQuota).toBe(10);
      expect(entitlementFor(product, "DEEP_STUDY").dailyQuota).toBe(3);
      expect(entitlementFor(product, "BOSS_MISSION").dailyQuota).toBe(1);
      expect(canUseFeature(product, "AI_TEACHER", 29)).toBe(true);
      expect(canUseFeature(product, "AI_TEACHER", 30)).toBe(false);
    }
  });

  it("unlocks exam surfaces only for IELTS, Cambridge and All Access", () => {
    expect(entitlementFor("ielts", "EXAM_PATHWAY").enabled).toBe(true);
    expect(entitlementFor("cambridge", "EXAM_PATHWAY").enabled).toBe(true);
    expect(entitlementFor("all-access", "EXAM_PATHWAY").enabled).toBe(true);
    expect(entitlementFor("general-english", "EXAM_PATHWAY").enabled).toBe(false);
    expect(entitlementFor("business-english", "EXAM_PATHWAY").enabled).toBe(false);
    expect(entitlementFor("fluency-track", "EXAM_PATHWAY").enabled).toBe(false);
    expect(entitlementFor("FREE", "EXAM_PATHWAY").enabled).toBe(false);
  });

  it("makes All Access unlimited across every gated feature", () => {
    expect(entitlementFor("all-access", "AI_TEACHER").dailyQuota).toBeUndefined();
    expect(entitlementFor("all-access", "SPEAKING_COACH").dailyQuota).toBeUndefined();
    expect(entitlementFor("all-access", "DEEP_STUDY").dailyQuota).toBeUndefined();
    expect(entitlementFor("all-access", "BOSS_MISSION").dailyQuota).toBeUndefined();
    expect(canUseFeature("all-access", "AI_TEACHER", 500)).toBe(true);
    expect(canUseFeature("all-access", "DEEP_STUDY", 999)).toBe(true);
  });

  it("builds a complete entitlement row set for every subscribable catalogue line", () => {
    expect(SUBSCRIBABLE_PRODUCTS).toHaveLength(6);
    for (const tier of ["FREE", ...SUBSCRIBABLE_PRODUCTS] as const) {
      expect(PLAN_ENTITLEMENTS[tier]).toHaveLength(6);
      expect(PLAN_ENTITLEMENTS[tier].find((item) => item.feature === "CORE_CURRICULUM")?.enabled).toBe(true);
    }
  });
});

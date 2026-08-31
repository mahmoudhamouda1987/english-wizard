import type { ProductId } from "./pricing";

/* ═══════════════════════════════════════════════════════════════════════════
 * ENTITLEMENTS — one commercial model (spec Parts 77–91).
 *
 * The plan IS the subscribed product from the 2.0 catalogue: five products
 * plus All Access, or FREE (no subscription — the core curriculum stays
 * included with every account). There are no abstract Plus/Pro tiers.
 *
 *   FREE                core learning included, 5 AI / 2 speaking checks daily
 *   any single product  30 AI / 10 speaking checks daily, deep study, boss
 *                       missions; exam surfaces only with IELTS / Cambridge
 *   all-access          everything unlimited
 *
 * An ACTIVE 7-day trial is resolved to "all-access" by the caller (see
 * gatingTier in ./subscription) — meaningful trial access, still protected
 * by the daily AI cost hard cap.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type PlanTier = "FREE" | ProductId;
export type Feature = "CORE_CURRICULUM" | "AI_TEACHER" | "SPEAKING_COACH" | "EXAM_PATHWAY" | "DEEP_STUDY" | "BOSS_MISSION";

/** The catalogue lines a learner can subscribe to (everything except FREE). */
export const SUBSCRIBABLE_PRODUCTS: ProductId[] = [
  "general-english",
  "business-english",
  "fluency-track",
  "ielts",
  "cambridge",
  "all-access",
];

/** Products that unlock the exam pathway surfaces. */
export const EXAM_PRODUCTS: ProductId[] = ["ielts", "cambridge", "all-access"];

export function isPlanTier(value: unknown): value is PlanTier {
  return value === "FREE" || (typeof value === "string" && (SUBSCRIBABLE_PRODUCTS as string[]).includes(value));
}

export const PRODUCT_NAMES: Record<PlanTier, string> = {
  "FREE": "Free",
  "general-english": "General English",
  "business-english": "Business English",
  "fluency-track": "Fluency Track",
  "ielts": "IELTS",
  "cambridge": "Cambridge",
  "all-access": "All Access",
};

export interface FeatureEntitlement {
  tier: PlanTier;
  feature: Feature;
  enabled: boolean;
  dailyQuota?: number;
}

function productEntitlements(tier: PlanTier): FeatureEntitlement[] {
  if (tier === "FREE") {
    return [
      { tier, feature: "CORE_CURRICULUM", enabled: true },
      { tier, feature: "AI_TEACHER", enabled: true, dailyQuota: 5 },
      { tier, feature: "SPEAKING_COACH", enabled: true, dailyQuota: 2 },
      { tier, feature: "EXAM_PATHWAY", enabled: false },
      { tier, feature: "DEEP_STUDY", enabled: false },
      { tier, feature: "BOSS_MISSION", enabled: false },
    ];
  }
  const unlimited = tier === "all-access";
  const exam = (EXAM_PRODUCTS as string[]).includes(tier);
  return [
    { tier, feature: "CORE_CURRICULUM", enabled: true },
    { tier, feature: "AI_TEACHER", enabled: true, ...(unlimited ? {} : { dailyQuota: 30 }) },
    { tier, feature: "SPEAKING_COACH", enabled: true, ...(unlimited ? {} : { dailyQuota: 10 }) },
    { tier, feature: "EXAM_PATHWAY", enabled: exam },
    { tier, feature: "DEEP_STUDY", enabled: true, ...(unlimited ? {} : { dailyQuota: 3 }) },
    { tier, feature: "BOSS_MISSION", enabled: true, ...(unlimited ? {} : { dailyQuota: 1 }) },
  ];
}

function buildPlanEntitlements(): Record<PlanTier, FeatureEntitlement[]> {
  const map = { FREE: productEntitlements("FREE") } as Record<PlanTier, FeatureEntitlement[]>;
  for (const product of SUBSCRIBABLE_PRODUCTS) map[product] = productEntitlements(product);
  return map;
}

export const PLAN_ENTITLEMENTS: Record<PlanTier, FeatureEntitlement[]> = buildPlanEntitlements();

export function entitlementFor(tier: PlanTier, feature: Feature): FeatureEntitlement {
  return PLAN_ENTITLEMENTS[tier].find((item) => item.feature === feature)!;
}

export function canUseFeature(tier: PlanTier, feature: Feature, usedToday = 0): boolean {
  const entitlement = entitlementFor(tier, feature);
  return entitlement.enabled && (entitlement.dailyQuota === undefined || usedToday < entitlement.dailyQuota);
}

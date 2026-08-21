export type PlanTier = "FREE" | "PLUS" | "PRO";
export type Feature = "CORE_CURRICULUM" | "AI_TEACHER" | "SPEAKING_COACH" | "EXAM_PATHWAY" | "DEEP_STUDY" | "BOSS_MISSION";

export interface FeatureEntitlement {
  tier: PlanTier;
  feature: Feature;
  enabled: boolean;
  dailyQuota?: number;
}

export const PLAN_ENTITLEMENTS: Record<PlanTier, FeatureEntitlement[]> = {
  FREE: [
    { tier: "FREE", feature: "CORE_CURRICULUM", enabled: true },
    { tier: "FREE", feature: "AI_TEACHER", enabled: true, dailyQuota: 5 },
    { tier: "FREE", feature: "SPEAKING_COACH", enabled: true, dailyQuota: 2 },
    { tier: "FREE", feature: "EXAM_PATHWAY", enabled: false },
    { tier: "FREE", feature: "DEEP_STUDY", enabled: false },
    { tier: "FREE", feature: "BOSS_MISSION", enabled: false },
  ],
  PLUS: [
    { tier: "PLUS", feature: "CORE_CURRICULUM", enabled: true },
    { tier: "PLUS", feature: "AI_TEACHER", enabled: true, dailyQuota: 30 },
    { tier: "PLUS", feature: "SPEAKING_COACH", enabled: true, dailyQuota: 10 },
    { tier: "PLUS", feature: "EXAM_PATHWAY", enabled: true },
    { tier: "PLUS", feature: "DEEP_STUDY", enabled: true, dailyQuota: 3 },
    { tier: "PLUS", feature: "BOSS_MISSION", enabled: true, dailyQuota: 1 },
  ],
  PRO: [
    { tier: "PRO", feature: "CORE_CURRICULUM", enabled: true },
    { tier: "PRO", feature: "AI_TEACHER", enabled: true },
    { tier: "PRO", feature: "SPEAKING_COACH", enabled: true },
    { tier: "PRO", feature: "EXAM_PATHWAY", enabled: true },
    { tier: "PRO", feature: "DEEP_STUDY", enabled: true },
    { tier: "PRO", feature: "BOSS_MISSION", enabled: true },
  ],
};

export function entitlementFor(tier: PlanTier, feature: Feature): FeatureEntitlement {
  return PLAN_ENTITLEMENTS[tier].find((item) => item.feature === feature)!;
}

export function canUseFeature(tier: PlanTier, feature: Feature, usedToday = 0): boolean {
  const entitlement = entitlementFor(tier, feature);
  return entitlement.enabled && (entitlement.dailyQuota === undefined || usedToday < entitlement.dailyQuota);
}

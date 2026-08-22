import { PLAN_ENTITLEMENTS, canUseFeature, entitlementFor, type Feature, type PlanTier } from "./entitlements";

export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "PAUSED" | "PAST_DUE" | "TRIALING";

export interface SubscriptionRecord {
  learnerId: string;
  tier: PlanTier;
  status: SubscriptionStatus;
  provider: string;
  externalReference?: string;
  periodStart: string;
  periodEnd?: string;
  cancelAtPeriodEnd: boolean;
  updatedAt: string;
}

export const SUBSCRIPTION_PLANS: Array<{ tier: PlanTier; name: string; priceLabel: string; highlights: string[] }> = [
  { tier: "FREE", name: "Free", priceLabel: "0", highlights: ["Daily mission + core lessons", "5 AI teacher messages/day", "2 speaking self-checks/day"] },
  { tier: "PLUS", name: "Plus", priceLabel: "Plus plan", highlights: ["Exam pathways (IELTS & Cambridge)", "30 AI teacher messages/day", "Deep Study and Boss Missions"] },
  { tier: "PRO", name: "Pro", priceLabel: "Pro plan", highlights: ["Unlimited AI teacher and speaking coach", "Full professional pathways", "Priority new surfaces"] },
];

export function effectiveTier(subscription: SubscriptionRecord | null, now = new Date()): PlanTier {
  if (!subscription) return "FREE";
  if (subscription.status === "PAST_DUE" || subscription.status === "CANCELLED") return "FREE";
  if (subscription.periodEnd && new Date(subscription.periodEnd) <= now) return subscription.cancelAtPeriodEnd ? "FREE" : "FREE";
  return subscription.tier;
}

export function checkFeature(subscription: SubscriptionRecord | null, feature: Feature, usedToday = 0): { allowed: boolean; tier: PlanTier; quota?: number } {
  const tier = effectiveTier(subscription);
  return { allowed: canUseFeature(tier, feature, usedToday), tier, quota: entitlementFor(tier, feature).dailyQuota };
}

export function planValueModel(tier: PlanTier): { free: string[]; lockedUntilUpgrade: string[] } {
  const all: Feature[] = ["CORE_CURRICULUM", "AI_TEACHER", "SPEAKING_COACH", "EXAM_PATHWAY", "DEEP_STUDY", "BOSS_MISSION"];
  const enabled = PLAN_ENTITLEMENTS[tier].filter((item) => item.enabled).map((item) => item.feature);
  return { free: enabled, lockedUntilUpgrade: all.filter((feature) => !enabled.includes(feature)) };
}

import { PLAN_ENTITLEMENTS, canUseFeature, entitlementFor, type Feature, type PlanTier } from "./entitlements";
import { PRICE_CATALOGUE, formatPrice } from "./pricing";

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

/**
 * The subscribable catalogue as plan cards (Parts 77-79): five products plus
 * All Access, derived from the authoritative price configuration — never
 * hardcoded in components. FREE is not a card here; it is the base state
 * every account starts on.
 */
export const SUBSCRIPTION_PLANS: Array<{ tier: PlanTier; name: string; priceLabel: string; highlights: string[] }> =
  PRICE_CATALOGUE.filter((entry) => entry.region === "WW").map((entry) => ({
    tier: entry.product,
    name: entry.name,
    priceLabel: `${formatPrice(entry.monthly, entry.currency)}/month`,
    highlights: entry.entitlements.features,
  }));

export function effectiveTier(subscription: SubscriptionRecord | null, now = new Date()): PlanTier {
  if (!subscription) return "FREE";
  if (subscription.status === "PAST_DUE" || subscription.status === "CANCELLED") return "FREE";
  if (subscription.periodEnd && new Date(subscription.periodEnd) <= now) return "FREE";
  return subscription.tier;
}

/**
 * Resolve the plan used for feature gating: an ACTIVE 7-day trial counts as
 * All Access (meaningful trial access, Parts 18/22), otherwise the effective
 * subscribed product applies. Daily AI cost hard caps still protect spend.
 */
export function gatingTier(input: { subscription: SubscriptionRecord | null; trialActive: boolean }): PlanTier {
  if (input.trialActive) return "all-access";
  return effectiveTier(input.subscription);
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

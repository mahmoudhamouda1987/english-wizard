import { query } from "./database";
import { canUseFeature, entitlementFor, type Feature, type PlanTier } from "@/src/domain/entitlements";
import { gatingTier } from "@/src/domain/subscription";
import { effectiveTrialStatus } from "@/src/domain/trial";
import { getSubscription } from "./subscription-repository";
import { getTrial } from "./trial-repository";

export interface FeatureGuard { allowed: boolean; usedToday: number; quota: number | null; remaining: number | null }

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Resolve the plan used for feature gates: an ACTIVE 7-day trial counts as
 * All Access (meaningful trial access), otherwise the subscribed product
 * applies. Fail-open on entitlement-read errors so an infrastructure hiccup
 * never locks learners out of a paid surface.
 */
export async function resolveGatingTier(learnerId: string): Promise<PlanTier> {
  try {
    const [subscription, trial] = await Promise.all([getSubscription(learnerId), getTrial(learnerId)]);
    return gatingTier({ subscription, trialActive: effectiveTrialStatus(trial) === "ACTIVE" });
  } catch {
    return "all-access";
  }
}

export async function checkFeature(learnerId: string, tier: PlanTier, feature: Feature): Promise<FeatureGuard> {
  const result = await query<{ used: string }>(
    `SELECT used::text AS used FROM usage_counters WHERE learner_id = $1 AND feature = $2 AND day = $3`,
    [learnerId, feature, today()],
  );
  const usedToday = Number(result.rows[0]?.used ?? 0);
  const entitlement = entitlementFor(tier, feature);
  const quota = entitlement.dailyQuota ?? null;
  const remaining = quota !== null ? Math.max(0, quota - usedToday) : null;
  return { allowed: canUseFeature(tier, feature, usedToday), usedToday, quota, remaining };
}

export async function recordUsage(learnerId: string, feature: Feature): Promise<void> {
  await query(
    `INSERT INTO usage_counters (learner_id, feature, day, used) VALUES ($1, $2, $3, 1)
     ON CONFLICT (learner_id, feature, day) DO UPDATE SET used = usage_counters.used + 1`,
    [learnerId, feature, today()],
  );
}

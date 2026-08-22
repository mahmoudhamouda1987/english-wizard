import type { PlanTier } from "./entitlements";
import type { SubscriptionStatus } from "./subscription";

/** Days a subscriber keeps premium access after a failed payment before downgrade. */
export const GRACE_DAYS = 7;

export interface LemonWebhookPayload {
  meta?: { event_name?: string; custom_data?: { learnerId?: string } | null };
  data?: { attributes?: { status?: string; variant_name?: string; product_name?: string; renews_at?: string; ends_at?: string } };
}

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  subscription_created: "ACTIVE",
  subscription_updated: "ACTIVE",
  subscription_payment_success: "ACTIVE",
  subscription_resumed: "ACTIVE",
  subscription_payment_failed: "PAST_DUE",
  subscription_payment_refunded: "PAST_DUE",
  subscription_paused: "PAUSED",
  subscription_expired: "CANCELLED",
  subscription_cancelled: "CANCELLED",
};

export function mapLemonEventName(eventName: string | undefined): SubscriptionStatus | "IGNORED" {
  if (!eventName) return "IGNORED";
  return STATUS_MAP[eventName] ?? "IGNORED";
}

export function tierFromVariant(variantName: string | undefined): PlanTier {
  if (!variantName) return "PLUS";
  const name = variantName.toLowerCase();
  if (name.includes("pro")) return "PRO";
  if (name.includes("plus") || name.includes("premium")) return "PLUS";
  return "FREE";
}

export function graceDeadline(periodEnd: string | Date | null | undefined, now = new Date()): string | null {
  const base = periodEnd ? new Date(periodEnd) : now;
  if (Number.isNaN(base.getTime())) return null;
  const deadline = new Date(base.getTime() + GRACE_DAYS * 86400000);
  return deadline.toISOString();
}

/**
 * Effective access tier including the dunning grace window: a PAST_DUE
 * subscriber keeps their paid tier until the grace deadline passes.
 */
export function effectiveTierWithGrace(
  record: { status: SubscriptionStatus; tier: PlanTier; periodEnd?: string } | null,
  now = new Date(),
): { tier: PlanTier; inGrace: boolean } {
  if (!record) return { tier: "FREE", inGrace: false };
  if (record.status === "PAST_DUE") {
    const deadline = graceDeadline(record.periodEnd ?? null, now);
    if (deadline && new Date(deadline) > now) return { tier: record.tier, inGrace: true };
    return { tier: "FREE", inGrace: false };
  }
  if (record.status === "CANCELLED" || record.status === "PAUSED") return { tier: "FREE", inGrace: false };
  return { tier: record.tier, inGrace: false };
}

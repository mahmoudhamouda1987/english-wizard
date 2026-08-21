import type { SubscriptionRecord, SubscriptionStatus } from "@/src/domain/subscription";
import type { PlanTier } from "@/src/domain/entitlements";
import { query } from "./database";

interface SubscriptionRow {
  learner_id: string;
  tier: PlanTier;
  status: SubscriptionStatus;
  provider: string;
  external_reference: string | null;
  period_start: Date | string;
  period_end: Date | string | null;
  cancel_at_period_end: boolean;
  updated_at: Date | string;
}

function mapSubscription(row: SubscriptionRow): SubscriptionRecord {
  return {
    learnerId: row.learner_id,
    tier: row.tier,
    status: row.status,
    provider: row.provider,
    ...(row.external_reference ? { externalReference: row.external_reference } : {}),
    periodStart: new Date(row.period_start).toISOString(),
    ...(row.period_end ? { periodEnd: new Date(row.period_end).toISOString() } : {}),
    cancelAtPeriodEnd: row.cancel_at_period_end,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function getSubscription(learnerId: string): Promise<SubscriptionRecord | null> {
  const result = await query<SubscriptionRow>(`SELECT * FROM subscriptions WHERE learner_id = $1`, [learnerId]);
  return result.rows.length ? mapSubscription(result.rows[0]) : null;
}

export async function upsertSubscription(input: { learnerId: string; tier: PlanTier; status?: SubscriptionStatus; provider?: string; externalReference?: string; periodEnd?: string; cancelAtPeriodEnd?: boolean }): Promise<SubscriptionRecord> {
  const result = await query<SubscriptionRow>(
    `INSERT INTO subscriptions (learner_id, tier, status, provider, external_reference, period_end, cancel_at_period_end, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (learner_id) DO UPDATE SET
       tier = EXCLUDED.tier,
       status = EXCLUDED.status,
       provider = EXCLUDED.provider,
       external_reference = EXCLUDED.external_reference,
       period_end = EXCLUDED.period_end,
       cancel_at_period_end = EXCLUDED.cancel_at_period_end,
       updated_at = NOW()
     RETURNING *`,
    [input.learnerId, input.tier, input.status ?? "ACTIVE", input.provider ?? "NONE", input.externalReference ?? null, input.periodEnd ?? null, input.cancelAtPeriodEnd ?? false],
  );
  return mapSubscription(result.rows[0]);
}

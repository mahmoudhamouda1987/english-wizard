import { query } from "./database";
import { trialEndsAt, type TrialRecord, type TrialStatus } from "@/src/domain/trial";

interface TrialRow {
  learner_id: string;
  started_at: Date | string;
  ends_at: Date | string;
  status: TrialStatus;
}

function mapTrial(row: TrialRow): TrialRecord {
  return {
    learnerId: row.learner_id,
    startedAt: new Date(row.started_at).toISOString(),
    endsAt: new Date(row.ends_at).toISOString(),
    status: row.status,
  };
}

export async function getTrial(learnerId: string): Promise<TrialRecord | null> {
  const result = await query<TrialRow>(`SELECT learner_id, started_at, ends_at, status FROM trial_subscriptions WHERE learner_id = $1`, [learnerId]);
  return result.rows.length ? mapTrial(result.rows[0]) : null;
}

/** Start a 7-day trial. Idempotent: if an ACTIVE trial already exists it is returned unchanged. */
export async function startTrial(learnerId: string, now = new Date()): Promise<TrialRecord> {
  const existing = await getTrial(learnerId);
  const existingStatus: TrialStatus = existing?.status ?? "EXPIRED";
  if (existing && existingStatus !== "EXPIRED" && existingStatus !== "CONVERTED") {
    return existing;
  }
  const endsAt = trialEndsAt(now);
  const result = await query<TrialRow>(
    `INSERT INTO trial_subscriptions (learner_id, started_at, ends_at, status)
     VALUES ($1, $2, $3, 'ACTIVE')
     ON CONFLICT (learner_id) DO UPDATE SET
       started_at = EXCLUDED.started_at,
       ends_at = EXCLUDED.ends_at,
       status = 'ACTIVE'
     RETURNING *`,
    [learnerId, now.toISOString(), endsAt.toISOString()],
  );
  return mapTrial(result.rows[0]);
}

export async function markTrialConverted(learnerId: string): Promise<void> {
  await query(`UPDATE trial_subscriptions SET status = 'CONVERTED' WHERE learner_id = $1`, [learnerId]);
}

export async function markTrialExpired(learnerId: string): Promise<void> {
  await query(`UPDATE trial_subscriptions SET status = 'EXPIRED' WHERE learner_id = $1 AND status = 'ACTIVE'`, [learnerId]);
}

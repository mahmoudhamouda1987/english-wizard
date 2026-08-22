import { randomUUID, randomBytes } from "crypto";
import { query } from "./database";

export interface ReferralRow { id: string; code: string; referrer_id: string; invited_id: string | null; created_at: Date; completed_at: Date | null }

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  const bytes = randomBytes(8);
  return Array.from(bytes).map((b) => ALPHABET[b % ALPHABET.length]).join("");
}

export async function getOrCreateReferralCode(learnerId: string): Promise<ReferralRow> {
  const existing = await query<ReferralRow>(`SELECT * FROM referrals WHERE referrer_id = $1 AND invited_id IS NULL LIMIT 1`, [learnerId]);
  if (existing.rows[0]) return existing.rows[0];
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    try {
      const inserted = await query<ReferralRow>(
        `INSERT INTO referrals (id, code, referrer_id) VALUES ($1, $2, $3) RETURNING *`,
        [randomUUID(), code, learnerId],
      );
      return inserted.rows[0];
    } catch {
      // code collision — regenerate
    }
  }
  throw new Error("Unable to allocate a referral code.");
}

export async function referralStats(learnerId: string): Promise<{ invited: number; completed: number }> {
  const result = await query<{ invited: string; completed: string }>(
    `SELECT COUNT(*)::text AS invited, COUNT(completed_at)::text AS completed FROM referrals WHERE referrer_id = $1`,
    [learnerId],
  );
  const row = result.rows[0];
  return { invited: Number(row?.invited ?? 0), completed: Number(row?.completed ?? 0) };
}

/** Marks the newest open referral with this code as completed by `invitedLearnerId`. Returns referrer id when it matched. */
export async function completeReferral(code: string, invitedLearnerId: string): Promise<string | null> {
  const open = await query<ReferralRow>(`SELECT * FROM referrals WHERE upper(code) = upper($1) AND invited_id IS NULL AND referrer_id <> $2 ORDER BY created_at LIMIT 1`, [code, invitedLearnerId]);
  const row = open.rows[0];
  if (!row) return null;
  await query(`UPDATE referrals SET invited_id = $1, completed_at = NOW() WHERE id = $2`, [invitedLearnerId, row.id]);
  return row.referrer_id;
}

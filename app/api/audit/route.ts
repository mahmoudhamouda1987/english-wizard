import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { isAuditMode, isAuditLevel, AUDIT_PERSONAS, AUDIT_PERSONA_PASSWORD } from "@/src/infrastructure/audit-mode";
import { hashPassword } from "@/src/infrastructure/auth-repository";
import { VARIANT_THEMES } from "@/src/domain/levelquest";

export const dynamic = "force-dynamic";

/**
 * Audit controls (spec Parts 94–99). Every request is checked against the
 * environment gate BEFORE anything else — in production this file is inert.
 * Actions operate on the authenticated session's learner only; seeding is the
 * sole multi-account action and only creates the fixed audit personas.
 */

function gate() {
  if (!isAuditMode()) {
    return NextResponse.json({ error: "Audit mode is not enabled on this deployment." }, { status: 404 });
  }
  return null;
}

export async function GET() {
  const blocked = gate();
  if (blocked) return blocked;
  const user = await currentUser();
  return NextResponse.json({ auditMode: true, authenticated: Boolean(user), personas: AUDIT_PERSONAS.length });
}

export async function POST(request: Request) {
  const blocked = gate();
  if (blocked) return blocked;

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  let body: { action?: string; level?: string; day?: number; variant?: number };
  try { body = await request.json(); } catch { body = {}; }

  switch (body.action) {
    /* ── Part 95: select learner level — merge override into the unified profile ── */
    case "set-level": {
      if (!isAuditLevel(body.level)) return NextResponse.json({ error: "Unknown level." }, { status: 400 });
      const merged = await query(
        `UPDATE learner_profiles
         SET english_dna = jsonb_set(COALESCE(english_dna,'{}'::jsonb), '{overallLevel}', to_jsonb($2::text), true), updated_at = NOW()
         WHERE learner_id = $1::uuid
         RETURNING english_dna->>'overallLevel' AS level`,
        [user.learnerId, body.level],
      );
      if (merged.rowCount === 0) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
      return NextResponse.json({ ok: true, level: merged.rows[0].level });
    }

    /* ── Part 95: simulate trial day N (shift the window so "now" is day N of 7) ── */
    case "simulate-trial-day": {
      const day = Number(body.day);
      if (!Number.isInteger(day) || day < 1 || day > 7) return NextResponse.json({ error: "Day must be 1–7." }, { status: 400 });
      const startedAt = new Date(Date.now() - (day - 1) * 86400000);
      const endsAt = new Date(startedAt.getTime() + 7 * 86400000);
      await query(
        `INSERT INTO trial_subscriptions (learner_id, started_at, ends_at, status)
         VALUES ($1::uuid, $2, $3, 'ACTIVE')
         ON CONFLICT (learner_id) DO UPDATE SET started_at = $2, ends_at = $3, status = 'ACTIVE'`,
        [user.learnerId, startedAt.toISOString(), endsAt.toISOString()],
      );
      return NextResponse.json({ ok: true, day, endsAt: endsAt.toISOString() });
    }

    /* ── Part 95: expire trial (locked-state audit) ── */
    case "expire-trial": {
      await query(
        `INSERT INTO trial_subscriptions (learner_id, started_at, ends_at, status)
         VALUES ($1::uuid, NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day', 'EXPIRED')
         ON CONFLICT (learner_id) DO UPDATE SET ends_at = NOW() - INTERVAL '1 day', status = 'EXPIRED'`,
        [user.learnerId],
      );
      return NextResponse.json({ ok: true, trial: "EXPIRED" });
    }

    /* ── Part 99: reset assessment — repeat LevelCheck without changing email ── */
    case "reset-assessment": {
      await query(`DELETE FROM levelquest_sessions WHERE learner_id = $1::uuid AND status = 'IN_PROGRESS'`, [user.learnerId]);
      return NextResponse.json({ ok: true, reset: true });
    }

    /* ── Part 95: select assessment variant for the next sitting ── */
    case "set-variant": {
      const variant = Number(body.variant);
      if (!Number.isInteger(variant) || variant < 1 || variant > VARIANT_THEMES.length) {
        return NextResponse.json({ error: `Variant must be 1–${VARIANT_THEMES.length}.` }, { status: 400 });
      }
      await query(`DELETE FROM levelquest_sessions WHERE learner_id = $1::uuid AND status = 'IN_PROGRESS'`, [user.learnerId]);
      const res = NextResponse.json({ ok: true, variant, note: "Next LevelCheck sitting will start with this variant." });
      res.cookies.set("ew-audit-variant", String(variant), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
      return res;
    }

    /* ── Part 98: seed the fixed test personas (idempotent) ── */
    case "seed-personas": {
      let created = 0;
      let existing = 0;
      for (const p of AUDIT_PERSONAS) {
        const account = await query<{ learner_id: string }>(`SELECT learner_id FROM user_accounts WHERE email = $1`, [p.email]);
        if (account.rowCount && account.rows[0]) {
          existing += 1;
          continue;
        }
        const learnerId = randomUUID();
        const userId = randomUUID();
        await query("BEGIN");
        try {
          await query(`INSERT INTO learners(id) VALUES($1)`, [learnerId]);
          await query(
            `INSERT INTO learner_profiles(learner_id, display_name, english_dna)
             VALUES($1, $2, $3::jsonb)`,
            [learnerId, p.displayName, JSON.stringify({
              overallLevel: p.level, auditNote: p.note, auditSeeded: true, generatedAt: new Date().toISOString(),
            })],
          );
          await query(
            `INSERT INTO user_accounts(id, learner_id, email, display_name, password_hash) VALUES($1,$2,$3,$4,$5)`,
            [userId, learnerId, p.email, p.displayName, hashPassword(AUDIT_PERSONA_PASSWORD)],
          );
          await query("COMMIT");
          created += 1;
        } catch (e) {
          await query("ROLLBACK");
          return NextResponse.json({ error: "Seeding failed.", detail: String(e) }, { status: 500 });
        }
      }
      return NextResponse.json({
        ok: true, created, existing, password: AUDIT_PERSONA_PASSWORD,
        personas: AUDIT_PERSONAS.map((p) => ({ email: p.email, level: p.level, note: p.note })),
      });
    }

    default:
      return NextResponse.json({ error: "Unknown audit action." }, { status: 400 });
  }
}

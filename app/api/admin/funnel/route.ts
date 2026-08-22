import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/infrastructure/admin-guard";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.denied) return guard.denied;

  const [signups, diagnostics, firstLessons, activeWeek1, checkpoints, referrals, paid] = await Promise.all([
    query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM learners`),
    query<{ c: string }>(`SELECT COUNT(DISTINCT learner_id)::text AS c FROM diagnostic_attempts`),
    query<{ c: string }>(`SELECT COUNT(DISTINCT learner_id)::text AS c FROM learning_events WHERE event_type = 'lesson.completed'`),
    query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM (
         SELECT learner_id FROM learning_events
         GROUP BY learner_id
         HAVING MAX(occurred_at) - MIN(occurred_at) >= INTERVAL '7 days'
       ) t`,
    ),
    query<{ c: string }>(`SELECT COUNT(DISTINCT learner_id)::text AS c FROM evidence_records WHERE source_type = 'REALITY_CHECKPOINT'`),
    query<{ c: string }>(`SELECT COUNT(completed_at)::text AS c FROM referrals WHERE completed_at IS NOT NULL`),
    query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM subscriptions WHERE tier <> 'FREE' AND status IN ('ACTIVE','TRIALING','PAST_DUE')`),
  ]);

  const daily = await query<{ day: string; signups: string; actives: string }>(
    `WITH days AS (
       SELECT generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day')::date AS d
     )
     SELECT
       to_char(days.d, 'YYYY-MM-DD') AS day,
       (SELECT COUNT(*)::text FROM learners l JOIN user_accounts a ON a.learner_id = l.id WHERE a.created_at::date = days.d) AS signups,
       (SELECT COUNT(DISTINCT e.learner_id)::text FROM learning_events e WHERE e.occurred_at::date = days.d) AS actives
     FROM days ORDER BY days.d`,
  );

  const num = (rows: { c: string }[]) => Number(rows[0]?.c ?? 0);
  const funnel = [
    { stage: "Signed up", count: num(signups.rows) },
    { stage: "Completed diagnostic", count: num(diagnostics.rows) },
    { stage: "Completed first lesson", count: num(firstLessons.rows) },
    { stage: "Active across 7+ days", count: num(activeWeek1.rows) },
    { stage: "Reality checkpoint done", count: num(checkpoints.rows) },
    { stage: "Invited a friend who joined", count: num(referrals.rows) },
    { stage: "Upgraded to paid", count: num(paid.rows) },
  ];
  const top = funnel[0].count || 1;
  return NextResponse.json({
    funnel,
    conversion: {
      signupToDiagnostic: pct(funnel[1].count, funnel[0].count),
      diagnosticToFirstLesson: pct(num(firstLessons.rows), num(diagnostics.rows)),
      signupToPaid: pct(num(paid.rows), funnel[0].count),
    },
    daily: daily.rows.map((row) => ({ day: row.day, signups: Number(row.signups), actives: Number(row.actives) })),
    peakActive: Math.max(1, ...daily.rows.map((r) => Number(r.actives))),
    denominatorNote: `Stage percentages use ${top} total signups as the base.`,
  });
}

function pct(part: number, whole: number): number | null {
  if (!whole) return null;
  return Math.round((part / whole) * 1000) / 10;
}

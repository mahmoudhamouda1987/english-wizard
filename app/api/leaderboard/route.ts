import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

interface Row { learner_id: string; display_name: string; evidence_count: string; review_count: string }

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const result = await query<Row>(
    `WITH ev AS (
       SELECT learner_id, COUNT(*)::text AS c FROM learning_events
       WHERE event_type = 'LEARNING_EVIDENCE' AND occurred_at > NOW() - INTERVAL '7 days'
       GROUP BY learner_id
     ), rc AS (
       SELECT learner_id, COUNT(*)::text AS c FROM review_cards
       WHERE repetitions > 0 AND updated_at > NOW() - INTERVAL '7 days'
       GROUP BY learner_id
     )
     SELECT ua.learner_id, COALESCE(ua.display_name, 'Learner') AS display_name,
            COALESCE(ev.c, '0') AS evidence_count, COALESCE(rc.c, '0') AS review_count
     FROM user_accounts ua
     LEFT JOIN ev ON ev.learner_id = ua.learner_id
     LEFT JOIN rc ON rc.learner_id = ua.learner_id`,
  );

  const rows = result.rows
    .map((r) => ({ learnerId: r.learner_id, name: r.display_name, xp: Number(r.evidence_count) * 25 + Number(r.review_count) * 10 }))
    .sort((a, b) => b.xp - a.xp);

  const top = rows.slice(0, 20).map((r, i) => ({ rank: i + 1, name: r.name, xp: r.xp, isMe: r.learnerId === session.learnerId }));
  const myIndex = rows.findIndex((r) => r.learnerId === session.learnerId);
  const me = myIndex >= 0 ? { rank: myIndex + 1, name: rows[myIndex].name, xp: rows[myIndex].xp } : null;

  return NextResponse.json({ top, me });
}

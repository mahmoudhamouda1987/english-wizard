import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { countActive, day7Retention, medianSessionsPerLearner, type ProductActivityRow } from "@/src/domain/product-analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const activity = await query<ProductActivityRow>(
      `SELECT learner_id, occurred_at FROM learning_events WHERE occurred_at > NOW() - INTERVAL '45 days'`,
    );
    const learners = await query<{ id: string; created_at: Date }>(`SELECT id, created_at FROM learners`);
    const ai = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM learning_events WHERE event_type = 'AI_TELEMETRY' AND occurred_at > NOW() - INTERVAL '30 days'`,
    );
    const evidence = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM learning_events WHERE event_type = 'LEARNING_EVIDENCE' AND occurred_at > NOW() - INTERVAL '30 days'`,
    );

    const rows = activity.rows;
    const registrations = new Map(learners.rows.map((row) => [row.id, new Date(row.created_at).getTime()]));

    return NextResponse.json({
      totalLearners: learners.rows.length,
      activeLearners7d: countActive(rows, 7),
      activeLearners30d: countActive(rows, 30),
      evidenceEvents30d: Number(evidence.rows[0]?.count ?? 0),
      aiRequests30d: Number(ai.rows[0]?.count ?? 0),
      medianSessionsPerActiveLearner: medianSessionsPerLearner(rows, 30),
      day7RetentionRate: day7Retention(rows, registrations),
      note: "Aggregate product analytics only. No individual learner data is exposed through this endpoint.",
    });
  } catch {
    return NextResponse.json({ error: "Analytics are temporarily unavailable." }, { status: 503 });
  }
}

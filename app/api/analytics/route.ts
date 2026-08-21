import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { outcomeSnapshots, retentionRate, DEFAULT_ENTITLEMENTS } from "@/src/domain/outcome-analytics";
import type { LearningEvidence } from "@/src/domain/learning-evidence";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const result = await query<{ payload: LearningEvidence }>(
    `SELECT payload FROM learning_events WHERE learner_id = $1 AND event_type = 'LEARNING_EVIDENCE' ORDER BY occurred_at ASC LIMIT 500`,
    [session.learnerId],
  );
  const evidence = result.rows.map((row) => row.payload);
  return NextResponse.json({ learnerId: session.learnerId, snapshots: outcomeSnapshots(session.learnerId, evidence), retention14d: retentionRate(evidence, 14), entitlements: DEFAULT_ENTITLEMENTS });
}

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  // Anonymised peer queue: other learners' checkpoint submissions awaiting feedback.
  const queue = await query<{ id: string; display_name: string; level: string; title: string; response_text: string; self_check: number }>(
    `SELECT e.id,
            COALESCE(split_part(p.display_name, ' ', 1), 'A learner') AS display_name,
            COALESCE(e.evidence->>'level', 'B1') AS level,
            COALESCE(e.evidence->>'prompt', 'Reality checkpoint') AS title,
            LEFT(e.evidence->>'answer', 400) AS response_text,
            COALESCE(jsonb_array_length(e.evidence->'selfCheck'), 0) AS self_check
     FROM evidence_records e
     JOIN learner_profiles p ON p.learner_id = e.learner_id
     WHERE e.source_type = 'REALITY_CHECKPOINT'
       AND e.learner_id <> $1
       AND NOT EXISTS (SELECT 1 FROM corrections c WHERE c.submission_id = e.id AND c.reviewer_id = $1)
     ORDER BY e.occurred_at DESC
     LIMIT 12`,
    [user.learnerId],
  );

  const stats = await query<{ given: string; received: string }>(
    `SELECT
       (SELECT COUNT(*)::text FROM corrections WHERE reviewer_id = $1) AS given,
       (SELECT COUNT(*)::text FROM corrections c JOIN evidence_records e ON e.id = c.submission_id WHERE e.learner_id = $1) AS received`,
    [user.learnerId],
  );

  const feedbackReceived = await query<{ comment: string; created_at: Date }>(
    `SELECT c.comment, c.created_at FROM corrections c JOIN evidence_records e ON e.id = c.submission_id
     WHERE e.learner_id = $1 ORDER BY c.created_at DESC LIMIT 8`,
    [user.learnerId],
  );

  return NextResponse.json({
    queue: queue.rows.map((row) => ({
      id: row.id,
      learnerFirstName: row.display_name,
      level: row.level,
      taskTitle: row.title.split(" — ")[0] ?? row.title,
      responseText: row.response_text,
      selfCheckCount: Number(row.self_check),
    })),
    given: Number(stats.rows[0]?.given ?? 0),
    received: Number(stats.rows[0]?.received ?? 0),
    feedbackReceived: feedbackReceived.rows.map((r) => ({ comment: r.comment, createdAt: new Date(r.created_at).toISOString() })),
  });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { submissionId?: string; comment?: string } | null;
  const submissionId = typeof body?.submissionId === "string" ? body.submissionId : "";
  const comment = typeof body?.comment === "string" ? body.comment.trim().slice(0, 600) : "";
  if (!/^[0-9a-f-]{36}$/i.test(submissionId) || comment.length < 15) {
    return NextResponse.json({ error: "submissionId and a comment of at least 15 characters are required." }, { status: 400 });
  }

  const owner = await query<{ learner_id: string }>(`SELECT learner_id, evidence FROM evidence_records WHERE id = $1 AND source_type = 'REALITY_CHECKPOINT'`, [submissionId]);
  const row = owner.rows[0];
  if (!row) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  if (row.learner_id === user.learnerId) return NextResponse.json({ error: "You cannot review your own submission." }, { status: 400 });

  await query(`INSERT INTO corrections (id, submission_id, reviewer_id, comment) VALUES ($1, $2, $3, $4)`, [randomUUID(), submissionId, user.learnerId, comment]);
  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload) VALUES ($1, $2, 'peer.feedback_given', $3::jsonb)`,
    [randomUUID(), user.learnerId, JSON.stringify({ submissionId })],
  ).catch(() => undefined);

  return NextResponse.json({ ok: true, note: "Feedback delivered — thank you for helping another learner." }, { status: 201 });
}

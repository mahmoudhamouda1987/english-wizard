import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { getProfile } from "@/src/infrastructure/profile-repository";
import { query } from "@/src/infrastructure/database";
import { REALITY_CHECKPOINTS, nextCheckpoint } from "@/src/domain/reality-checkpoints";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const profile = await getProfile(user.learnerId);
  const level = profile?.targetLevel ?? "A1";
  const completed = await query<{ objective_id: string | null }>(
    `SELECT DISTINCT objective_id FROM evidence_records WHERE learner_id = $1 AND source_type = 'REALITY_CHECKPOINT' AND objective_id IS NOT NULL`,
    [user.learnerId],
  );
  const completedIds = completed.rows.map((r) => r.objective_id as string);
  const checkpoint = nextCheckpoint(level, completedIds);
  const history = await query<{ id: string; objective_id: string | null; evidence: Record<string, unknown>; occurred_at: Date }>(
    `SELECT id, objective_id, evidence, occurred_at FROM evidence_records WHERE learner_id = $1 AND source_type = 'REALITY_CHECKPOINT' ORDER BY occurred_at DESC LIMIT 20`,
    [user.learnerId],
  );
  return NextResponse.json({
    level,
    completedCount: completedIds.length,
    checkpoint,
    selfCheckRubric: checkpoint?.rubric ?? [],
    history: history.rows.map((row) => ({
      id: row.id,
      checkpointId: row.objective_id,
      response: typeof row.evidence?.answer === "string" ? (row.evidence.answer as string).slice(0, 400) : null,
      selfCheck: Array.isArray(row.evidence?.selfCheck) ? row.evidence.selfCheck : [],
      occurredAt: new Date(row.occurred_at).toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { checkpointId?: string; response?: string; selfCheck?: string[] } | null;
  if (!body?.checkpointId || typeof body.response !== "string" || body.response.trim().length < 10) {
    return NextResponse.json({ error: "checkpointId and a response of at least 10 characters are required." }, { status: 400 });
  }
  const checkpoint = REALITY_CHECKPOINTS.find((c) => c.id === body.checkpointId);
  if (!checkpoint) return NextResponse.json({ error: "Unknown checkpoint." }, { status: 404 });

  const selfCheck = Array.isArray(body.selfCheck) ? body.selfCheck.filter((x) => typeof x === "string").slice(0, 10) : [];
  const evidenceId = randomUUID();
  await query(
    `INSERT INTO evidence_records (id, learner_id, source_type, skill, objective_id, evidence, score, transfer, occurred_at)
     VALUES ($1, $2, 'REALITY_CHECKPOINT', $3, $4, $5::jsonb, NULL, TRUE, NOW())`,
    [evidenceId, user.learnerId, checkpoint.skill, checkpoint.id, JSON.stringify({
      prompt: `${checkpoint.title} — ${checkpoint.task}`,
      answer: body.response.trim().slice(0, 4000),
      rubric: checkpoint.rubric,
      selfCheck,
    })],
  );
  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload) VALUES ($1, $2, 'reality_checkpoint.completed', $3::jsonb)`,
    [randomUUID(), user.learnerId, JSON.stringify({ checkpointId: checkpoint.id, level: checkpoint.level })],
  );
  return NextResponse.json({
    ok: true,
    note: "Checkpoint stored in your portfolio as real-world transfer evidence.",
    nextAt: "Your next reality checkpoint unlocks in a few days — spaced so each one lands fresh.",
  }, { status: 201 });
}

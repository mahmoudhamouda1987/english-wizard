import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { advanceLoop, initialLearningLoop, recordPhaseEvidence, type LearningLoopState, type LearningLoopPhase } from "@/src/domain/learning-loop";

export const dynamic = "force-dynamic";

function validPhase(value: unknown): value is LearningLoopPhase {
  return ["TEACH", "NOTICE", "LISTEN", "PRACTICE", "PRODUCE", "FEEDBACK", "RETRY", "TRANSFER", "ASSESS", "REVIEW", "NEXT_ACTION"].includes(String(value));
}

async function latestState(learnerId: string): Promise<LearningLoopState> {
  const result = await query<{ payload: LearningLoopState }>(
    `SELECT payload FROM learning_events WHERE learner_id=$1 AND event_type='LEARNING_LOOP' ORDER BY occurred_at DESC LIMIT 1`,
    [learnerId],
  );
  return result.rows[0]?.payload ?? initialLearningLoop();
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return NextResponse.json({ loop: await latestState(user.learnerId) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { phase?: unknown; evidenceId?: unknown; passed?: unknown; score?: unknown } | null;
  const current = await latestState(user.learnerId);
  if (body?.phase !== undefined && !validPhase(body.phase)) return NextResponse.json({ error: "Invalid learning-loop phase." }, { status: 400 });
  if (body?.phase !== undefined && body.phase !== current.phase) return NextResponse.json({ error: `Current learning-loop phase is ${current.phase}.` }, { status: 409 });

  let next = current;
  if (typeof body?.evidenceId === "string" && body.evidenceId.trim()) {
    next = recordPhaseEvidence(next, body.evidenceId, body.passed === true, typeof body.score === "number" ? body.score : undefined);
  }
  next = advanceLoop(next);

  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1,$2,'LEARNING_LOOP',$3::jsonb,NOW())`,
    [randomUUID(), user.learnerId, JSON.stringify(next)],
  );
  return NextResponse.json({ loop: next });
}

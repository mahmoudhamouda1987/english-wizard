import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { buildInterestProfile, type InterestSignal } from "@/src/domain/advanced-learning";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const result = await query<{ payload: InterestSignal }>(
    `SELECT payload FROM learning_events WHERE learner_id = $1 AND event_type = 'INTEREST_SIGNAL' ORDER BY occurred_at DESC LIMIT 200`,
    [session.learnerId],
  );
  const signals = result.rows.map((row) => row.payload);
  return NextResponse.json({ signals, profile: buildInterestProfile(signals) });
}

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as Partial<InterestSignal> | null;
  if (!body?.topic || !body?.source || typeof body.weight !== "number") {
    return NextResponse.json({ error: "topic, source and numeric weight are required." }, { status: 400 });
  }
  const signal: InterestSignal = {
    topic: body.topic.trim().slice(0, 120),
    weight: Math.max(0, Math.min(10, body.weight)),
    source: body.source,
    lastObservedAt: new Date().toISOString(),
  };
  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1, $2, 'INTEREST_SIGNAL', $3::jsonb, $4)`,
    [randomUUID(), session.learnerId, JSON.stringify(signal), signal.lastObservedAt],
  );
  return NextResponse.json({ signal }, { status: 201 });
}

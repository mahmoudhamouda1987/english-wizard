import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { buildSession, CEFR_SESSION_TYPES, type SessionType } from "@/src/domain/advanced-learning";
import type { CEFRLevel } from "@/src/domain/learner";

export const dynamic = "force-dynamic";

function isSessionType(value: unknown): value is SessionType {
  return value === "QUICK_QUEST" || value === "STANDARD_JOURNEY" || value === "DEEP_STUDY" || value === "BOSS_MISSION";
}

function isLevel(value: unknown): value is CEFRLevel {
  return ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].includes(String(value));
}

function sessionLevelKey(level: CEFRLevel): keyof typeof CEFR_SESSION_TYPES {
  return level === "Pre-A1" ? "PRE_A1" : level;
}

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { type?: unknown; level?: unknown; missionId?: unknown; activities?: unknown } | null;
  const type = body?.type;
  const level = body?.level;
  if (!isSessionType(type) || !isLevel(level)) {
    return NextResponse.json({ error: "Valid type and CEFR level are required." }, { status: 400 });
  }
  if (!CEFR_SESSION_TYPES[sessionLevelKey(level)].includes(type)) {
    return NextResponse.json({ error: `${type} is not available at ${level}.` }, { status: 400 });
  }
  const missionId = String(body?.missionId ?? `daily-${level.toLowerCase()}-${Date.now()}`);
  const activities = Array.isArray(body?.activities) ? body!.activities.map(String).slice(0, 12) : ["teach", "practice", "produce", "retrieve"];
  const plan = buildSession(type, missionId, activities);
  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1, $2, 'SESSION_PLAN', $3::jsonb, NOW())`,
    [randomUUID(), session.learnerId, JSON.stringify({ ...plan, level })],
  );
  return NextResponse.json({ plan, level }, { status: 201 });
}

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const result = await query<{ payload: Record<string, unknown> }>(
    `SELECT payload FROM learning_events WHERE learner_id = $1 AND event_type = 'SESSION_PLAN' ORDER BY occurred_at DESC LIMIT 20`,
    [session.learnerId],
  );
  return NextResponse.json({ plans: result.rows.map((row) => row.payload) });
}

import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { missionForId } from "@/src/domain/missions";
import { advanceMissionRuntime, buildMissionRuntime, isMissionComplete, type MissionRuntime } from "@/src/domain/mission-runtime";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const missionId = new URL(request.url).searchParams.get("missionId");
  if (!missionId) return NextResponse.json({ error: "missionId is required." }, { status: 400 });
  const mission = missionForId(missionId);
  if (!mission) return NextResponse.json({ error: "Mission not found." }, { status: 404 });
  const result = await query<{ payload: MissionRuntime }>(
    `SELECT payload FROM learning_events WHERE learner_id=$1 AND event_type='MISSION_RUNTIME' AND payload->>'missionId'=$2 ORDER BY occurred_at DESC LIMIT 1`,
    [user.learnerId, missionId],
  );
  const runtime = result.rows[0]?.payload ?? buildMissionRuntime(mission, user.learnerId);
  return NextResponse.json({ mission, runtime, complete: isMissionComplete(runtime) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { missionId?: unknown; evidenceIds?: unknown; transferComplete?: unknown; assessmentScore?: unknown } | null;
  const missionId = typeof body?.missionId === "string" ? body.missionId : "";
  const mission = missionForId(missionId);
  if (!mission) return NextResponse.json({ error: "Valid missionId is required." }, { status: 400 });
  const previous = await query<{ payload: MissionRuntime }>(
    `SELECT payload FROM learning_events WHERE learner_id=$1 AND event_type='MISSION_RUNTIME' AND payload->>'missionId'=$2 ORDER BY occurred_at DESC LIMIT 1`,
    [user.learnerId, missionId],
  );
  const runtime = previous.rows[0]?.payload ?? buildMissionRuntime(mission, user.learnerId);
  const next = advanceMissionRuntime(runtime, mission, {
    evidenceIds: Array.isArray(body?.evidenceIds) ? body!.evidenceIds.map(String) : [],
    transferComplete: body?.transferComplete === true,
    assessmentScore: typeof body?.assessmentScore === "number" ? body.assessmentScore : undefined,
  });
  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1,$2,'MISSION_RUNTIME',$3::jsonb,NOW())`,
    [randomUUID(), user.learnerId, JSON.stringify(next)],
  );
  return NextResponse.json({ mission, runtime: next, complete: isMissionComplete(next) });
}

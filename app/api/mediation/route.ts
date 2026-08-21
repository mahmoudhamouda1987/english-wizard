import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { getMediationActivitiesForLevel, assessMediation, MEDIATION_ACTIVITIES } from "@/src/domain/mediation";
import type { CEFRLevel } from "@/src/domain/learner";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const level = new URL(request.url).searchParams.get("level") as CEFRLevel | null;
  const activities = level ? getMediationActivitiesForLevel(level) : MEDIATION_ACTIVITIES;
  return NextResponse.json({ activities });
}

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { activityId?: string; response?: string } | null;
  if (!body?.activityId || typeof body.response !== "string") {
    return NextResponse.json({ error: "activityId and response are required." }, { status: 400 });
  }
  const activity = MEDIATION_ACTIVITIES.find((item) => item.id === body.activityId);
  if (!activity) return NextResponse.json({ error: "Mediation activity not found." }, { status: 404 });
  const assessment = assessMediation(activity, body.response);
  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES (gen_random_uuid(), $1, 'MEDIATION_ATTEMPT', $2::jsonb, NOW())`,
    [session.learnerId, JSON.stringify({ activityId: activity.id, level: activity.level, mode: activity.mode, score: assessment.score, nextStep: assessment.nextStep })],
  );
  return NextResponse.json({ activity, assessment });
}

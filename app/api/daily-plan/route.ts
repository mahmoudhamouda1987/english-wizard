import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { getProfile } from "@/src/infrastructure/profile-repository";
import { getLearnerState } from "@/src/infrastructure/learner-repository";
import { query } from "@/src/infrastructure/database";
import { chooseDailyMission } from "@/src/domain/daily-orchestrator";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const [profile, state, reviews, errors, recent] = await Promise.all([
    getProfile(user.learnerId),
    getLearnerState(user.learnerId),
    query<{ count: string }>("SELECT COUNT(*)::text AS count FROM review_cards WHERE learner_id=$1 AND due_at <= NOW()", [user.learnerId]),
    query<{ payload: { errorTags?: string[] } }>("SELECT payload FROM learning_events WHERE learner_id=$1 AND event_type='LEARNING_EVIDENCE' ORDER BY occurred_at DESC LIMIT 100", [user.learnerId]),
    query<{ payload: { missionId?: string } }>("SELECT payload FROM learning_events WHERE learner_id=$1 AND event_type='MISSION_RUNTIME' ORDER BY occurred_at DESC LIMIT 5", [user.learnerId]),
  ]);

  const recurringErrors = errors.rows.filter((row) => Array.isArray(row.payload?.errorTags) && row.payload.errorTags.length > 0).length;
  const plan = chooseDailyMission({
    level: profile?.targetLevel ?? "A1",
    nextAction: state?.nextAction ?? null,
    dueReviews: Number(reviews.rows[0]?.count ?? 0),
    recurringErrors,
    recentMissionIds: recent.rows.map((row) => row.payload.missionId).filter((id): id is string => Boolean(id)),
  });
  return NextResponse.json({ plan });
}

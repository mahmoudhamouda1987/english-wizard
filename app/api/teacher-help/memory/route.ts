import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { getLearnerState } from "@/src/infrastructure/learner-repository";
import { getProfile } from "@/src/infrastructure/profile-repository";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

/**
 * The persistent-memory card: what the tutor "knows" about this learner across
 * every session and month. Surfacing it visibly is the product differentiator —
 * competitors reset context every chat; we never forget the learner's journey.
 */
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const profile = await getProfile(user.learnerId);
  const state = await getLearnerState(user.learnerId);

  const firstEvidence = await query<{ first: Date | null }>(
    `SELECT MIN(occurred_at) AS first FROM evidence_records WHERE learner_id = $1`,
    [user.learnerId],
  );
  const firstAt = firstEvidence.rows[0]?.first ? new Date(firstEvidence.rows[0].first) : null;
  const journeyDays = firstAt ? Math.max(1, Math.round((Date.now() - firstAt.getTime()) / 86400000)) : 0;

  const ranked = [...(state?.errors ?? [])].sort((a, b) => b.occurrences - a.occurrences).slice(0, 5);
  const masterySorted = [...(state?.mastery ?? [])].sort((a, b) => a.score - b.score);
  const weakest = masterySorted[0];
  const strongest = masterySorted[masterySorted.length - 1];

  return NextResponse.json({
    memory: {
      level: profile?.targetLevel ?? null,
      dailyMinutes: profile?.dailyMinutes ?? 20,
      nativeLanguage: profile?.nativeLanguage ?? null,
      goals: profile?.goals ?? [],
      journeyDays,
      completedLessons: state?.completedLessonIds.length ?? 0,
      recurringErrors: ranked.map((e) => ({ skill: e.skill, objective: e.objectiveId, occurrences: e.occurrences, severity: e.severity, status: e.status })),
      focusSkill: weakest ? { skill: weakest.skill, score: weakest.score } : null,
      strongSkill: strongest ? { skill: strongest.skill, score: strongest.score } : null,
    },
    summaryLines: [
      journeyDays > 0 ? `I've been following your journey for ${journeyDays} day${journeyDays === 1 ? "" : "s"} and I remember everything we work on.` : "We're just getting started — I'll begin remembering your patterns from today.",
      profile?.targetLevel ? `You're targeting level ${profile.targetLevel}; I calibrate every explanation to that.` : null,
      weakest ? `${weakest.skill[0].toUpperCase()}${weakest.skill.slice(1)} is your current growth edge (strength ${weakest.score}%), so I'll weave it into examples.` : null,
      ranked.length ? `I'm tracking ${ranked.length} recurring pattern${ranked.length === 1 ? "" : "s"} you should beat — they'll resurface in review until mastered.` : null,
    ].filter(Boolean),
  });
}

import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { getProfile } from "@/src/infrastructure/profile-repository";
import { getLearnerState, saveLearnerState } from "@/src/infrastructure/learner-repository";
import { healLearnerStateForCurriculum, type CurriculumRef } from "@/src/domain/curriculum-heal";
import { MVP_LESSONS } from "@/src/domain/curriculum";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

const CURRICULUM: CurriculumRef[] = MVP_LESSONS.map(({ id, objectiveId }) => ({ id, objectiveId }));

interface EventRow { occurred_at: Date | string; payload: Record<string, unknown>; event_type: string }

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const [profile, loadedState, eventsRes, reviewsRes] = await Promise.all([
    getProfile(session.learnerId),
    getLearnerState(session.learnerId),
    query<EventRow>(
      `SELECT occurred_at, payload, event_type FROM learning_events
       WHERE learner_id=$1 AND occurred_at > NOW() - INTERVAL '30 days'
       ORDER BY occurred_at ASC LIMIT 1000`,
      [session.learnerId],
    ),
    query<{ count: string }>("SELECT COUNT(*)::text AS count FROM review_cards WHERE learner_id=$1 AND due_at <= NOW()", [session.learnerId]),
  ]);
  const healed = loadedState ? healLearnerStateForCurriculum(loadedState, CURRICULUM) : null;
  const state = healed ? await saveLearnerState(healed) : loadedState;

  const rows = eventsRes.rows;
  const dayKey = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

  // Streak state with freeze bridging.
  const streakRes = await query<{ freezes: number; bridged_on: string | null }>(
    `SELECT freezes, bridged_on::text FROM streak_state WHERE learner_id=$1`,
    [session.learnerId],
  );
  let freezes = streakRes.rows[0]?.freezes ?? 2;
  if (!streakRes.rows[0]) {
    await query(`INSERT INTO streak_state (learner_id, freezes) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [session.learnerId, 2]);
  }
  const bridgeAlreadyToday = streakRes.rows[0]?.bridged_on === dayKey(new Date());

  // Streak: consecutive active days ending today or yesterday; one gap may be bridged per day using a freeze.
  const activeDays = new Set(rows.map((r) => dayKey(r.occurred_at)));
  let streak = 0;
  const cursor = new Date();
  if (!activeDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let bridgesLeft = bridgeAlreadyToday ? 0 : freezes;
  let bridgedNow = false;
  while (activeDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
    if (!activeDays.has(dayKey(cursor)) && bridgesLeft > 0) {
      bridgesLeft -= 1;
      freezes -= 1;
      bridgedNow = true;
      cursor.setDate(cursor.getDate() - 1);
    }
  }
  if (bridgedNow || !streakRes.rows[0]) {
    await query(
      `INSERT INTO streak_state (learner_id, freezes, bridged_on, updated_at) VALUES ($1,$2,$3,NOW())
       ON CONFLICT (learner_id) DO UPDATE SET freezes=EXCLUDED.freezes, bridged_on=EXCLUDED.bridged_on, updated_at=NOW()`,
      [session.learnerId, Math.max(0, freezes), bridgedNow ? dayKey(new Date()) : null],
    );
    freezes = Math.max(0, freezes);
  }

  // Daily quests from today's activity.
  const today = dayKey(new Date());
  const evidenceToday = rows.filter((r) => r.event_type === "LEARNING_EVIDENCE" && dayKey(r.occurred_at) === today).length;
  const reviewsToday = Number(reviewsRes.rows[0]?.count ?? 0);
  const quests = [
    { id: "xp-50", label: "Earn 50 XP", target: 50, current: Math.min(50, evidenceToday * 25), xp: 10 },
    { id: "answer-5", label: "Answer 5 questions", target: 5, current: Math.min(5, evidenceToday), xp: 15 },
    { id: "review-2", label: "Complete 2 review cards", target: 2, current: Math.min(2, reviewsToday), xp: 10 },
  ];

  const evidenceCount = rows.filter((r) => r.event_type === "LEARNING_EVIDENCE").length;
  const xp = evidenceCount * 25 + (state?.completedLessonIds.length ?? 0) * 100;

  // Weekly activity: events per day over last 7 days.
  const week: Array<{ label: string; value: number }> = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    week.push({ label: d.toLocaleDateString("en", { weekday: "narrow" }), value: [...activeDays].includes(key) ? Math.min(100, (rows.filter((r) => dayKey(r.occurred_at) === key).length / 6) * 100) : 0 });
  }

  // Skill scores for radar (0-100).
  const skillMap: Record<string, number> = {};
  for (const m of state?.mastery ?? []) skillMap[m.skill.toLowerCase()] = Math.round(m.score);
  const skills = [
    { label: "Listening", value: skillMap.listening ?? 0 },
    { label: "Speaking", value: skillMap.speaking ?? 0 },
    { label: "Reading", value: skillMap.reading ?? 0 },
    { label: "Writing", value: skillMap.writing ?? 0 },
    { label: "Grammar", value: skillMap.grammar ?? 0 },
    { label: "Vocabulary", value: skillMap.vocabulary ?? 0 },
  ];

  // Progress series from evidence payloads (cumulative average of performanceScore/score).
  const scores = rows
    .filter((r) => r.event_type === "LEARNING_EVIDENCE")
    .map((r) => Number(r.payload?.performanceScore ?? r.payload?.score))
    .filter((n) => Number.isFinite(n));
  const series: number[] = [];
  let acc = 0;
  scores.slice(-12).forEach((s, i) => {
    acc += s;
    series.push(Math.round(acc / (i + 1)));
  });

  // Mastery topics: top capabilities by evidence.
  const byCapability = new Map<string, { total: number; n: number }>();
  for (const r of rows.filter((r) => r.event_type === "LEARNING_EVIDENCE")) {
    const caps = Array.isArray(r.payload?.capabilityIds) ? (r.payload.capabilityIds as string[]) : [];
    const score = Number(r.payload?.performanceScore ?? r.payload?.score);
    if (!Number.isFinite(score)) continue;
    const list = caps.length ? caps : ["general"];
    for (const c of list) {
      const cur = byCapability.get(c) ?? { total: 0, n: 0 };
      cur.total += score;
      cur.n += 1;
      byCapability.set(c, cur);
    }
  }
  const masteryTopics = [...byCapability.entries()]
    .map(([topic, v]) => ({ topic: topic.replaceAll(/[-_]/g, " "), percent: Math.round(v.total / v.n) }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);

  const overallLevel = profile?.englishDna?.overallLevel ?? "A1";
  const levelOrder = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
  const overallPercent = skills.length ? Math.round(skills.reduce((s, k) => s + k.value, 0) / skills.length) : 0;

  return NextResponse.json({
    firstName: profile?.displayName?.split(" ")[0] ?? session.email.split("@")[0],
    level: overallLevel,
    levelIndex: Math.max(0, levelOrder.indexOf(overallLevel)),
    nextLevel: levelOrder[Math.min(levelOrder.length - 1, Math.max(0, levelOrder.indexOf(overallLevel)) + 1)] ?? "C2",
    overallPercent,
    xp,
    nextXp: Math.max(500, Math.ceil(xp / 500) * 500),
    streak,
    freezes,
    quests,
    week,
    skills,
    series,
    masteryTopics,
    reviewDue: Number(reviewsRes.rows[0]?.count ?? 0),
    dailyMinutes: profile?.dailyMinutes ?? 20,
    currentLessonId: state?.currentLessonId,
    completedLessons: state?.completedLessonIds.length ?? 0,
    totalLessons: state?.lessonHistory.length ?? 0,
    vocabularyWords: rows.filter((r) => String(r.payload?.skill).toLowerCase() === "vocabulary").length * 3,
    notifications: Number(reviewsRes.rows[0]?.count ?? 0),
  });
}

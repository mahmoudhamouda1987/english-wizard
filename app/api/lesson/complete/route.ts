import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ALL_LESSONS } from "@/src/domain/all-lessons";
import { completeLesson, recordLessonRetry } from "@/src/domain/progression";
import { MVP_OBJECTIVES } from "@/src/domain/curriculum";
import { getLearnerState, saveLearnerState } from "@/src/infrastructure/learner-repository";
import { query } from "@/src/infrastructure/database";
import { currentUser } from "@/src/infrastructure/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { lessonId?: string; evidenceIds?: unknown; performanceScore?: unknown } | null;
  const lessonId = body?.lessonId ?? null;
  if (typeof lessonId !== "string" || lessonId.length === 0) return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
  const state = await getLearnerState(session.learnerId);
  if (!state) return NextResponse.json({ error: "Learner state not found." }, { status: 404 });
  const lesson = ALL_LESSONS.find((item) => item.id === lessonId);
  if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  if (state.completedLessonIds.includes(lesson.id)) return NextResponse.json({ error: "Lesson is already completed.", state }, { status: 409 });
  const evidenceIds = Array.isArray(body?.evidenceIds) ? body.evidenceIds.filter((id): id is string => typeof id === "string" && id.length > 0).slice(0, 50) : [];
  if (evidenceIds.length === 0) return NextResponse.json({ error: "At least one real evidenceId is required." }, { status: 400 });
  const suppliedScore = typeof body?.performanceScore === "number" && Number.isFinite(body.performanceScore) ? Math.max(0, Math.min(100, Math.round(body.performanceScore))) : null;
  const previous = state.mastery.find((item) => item.skill === lesson.skill);
  const skill = lesson.skill === "mediation" ? "speaking" as const : lesson.skill;
  const score = suppliedScore ?? Math.min(100, (previous?.score ?? 0) + 5);
  const confidence = Math.min(1, (previous?.confidence ?? 0.4) + 0.05);
  const now = new Date().toISOString();
  const masteryUpdate = { skill, level: previous?.level ?? ("A1" as const), score, confidence, updatedAt: now };
  const orderedIds = [...ALL_LESSONS].sort((a, b) => a.sequence - b.sequence).map((item) => item.id);
  const threshold = MVP_OBJECTIVES.find((o) => o.id === lesson.objectiveId)?.masteryThreshold ?? 0.75;
  const requiredScore = Math.round(threshold * 100);
  if (score < requiredScore) {
    const gated = await saveLearnerState(recordLessonRetry(state, { lessonId: lesson.id, evidenceIds, completedAt: now }, requiredScore));
    await query("INSERT INTO learning_events (id, learner_id, event_type, payload) VALUES ($1, $2, $3, $4::jsonb)", [randomUUID(), session.learnerId, "lesson.retry", JSON.stringify({ lessonId, objectiveId: lesson.objectiveId, performanceScore: score, requiredScore })]);
    return NextResponse.json({ state: gated, gated: true, performance: { skill: masteryUpdate.skill, score, confidence }, requiredScore, nextAction: gated.nextAction }, { headers: { "Cache-Control": "no-store" } });
  }
  const updated = completeLesson(state, { lessonId: lesson.id, objectiveId: lesson.objectiveId, evidenceIds, masteryUpdates: [masteryUpdate], errors: [], completedAt: now }, orderedIds);
  const saved = await saveLearnerState(updated);
  await query("INSERT INTO learning_events (id, learner_id, event_type, payload) VALUES ($1, $2, $3, $4::jsonb)", [randomUUID(), session.learnerId, "lesson.completed", JSON.stringify({ lessonId, objectiveId: lesson.objectiveId, evidenceIds, performanceScore: score, nextAction: saved.nextAction })]);
  return NextResponse.json({ state: saved, performance: { skill: masteryUpdate.skill, score, confidence }, nextAction: saved.nextAction }, { headers: { "Cache-Control": "no-store" } });
}

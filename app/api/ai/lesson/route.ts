import { NextResponse } from "next/server";
import { callAI, requireLearnerContext, validateLessonResponse } from "../_shared";

export const dynamic = "force-dynamic";
import { getSubscription } from "@/src/infrastructure/subscription-repository";
import { effectiveTier } from "@/src/domain/subscription";
import { checkFeature, recordUsage } from "@/src/infrastructure/usage-guard";


export async function POST(request: Request) {
  const context = await requireLearnerContext();
  if ("error" in context) return NextResponse.json({ error: context.error }, { status: context.status });
  const tier = effectiveTier(await getSubscription(context.session.learnerId));
  const guard = await checkFeature(context.session.learnerId, tier, "AI_TEACHER");
  if (!guard.allowed) {
    return NextResponse.json({
      error: `You've used today's free AI sessions (${guard.quota}/day). Upgrade your plan for 30 a day — your learning data and progress are never limited.`,
      upgrade: { feature: "AI_TEACHER", neededTier: "SUBSCRIBED", usedToday: guard.usedToday, quota: guard.quota },
    }, { status: 402 });
  }

  const body = await request.json().catch(() => null) as { goal?: string; skill?: string; lessonId?: string } | null;
  const goal = typeof body?.goal === "string" ? body.goal.trim() : "";
  const skill = typeof body?.skill === "string" ? body.skill.trim() : "grammar";
  if (goal.length < 3) return NextResponse.json({ error: "goal is required." }, { status: 400 });
  const level = context.profile?.englishDna.overallLevel ?? context.profile?.targetLevel ?? "B1";
  const mastery = context.state?.mastery ?? [];
  const errors = context.state?.errors ?? [];
  const system = `You are the adaptive English Wizard teacher. Build one self-contained micro-lesson for a ${level} learner. Return JSON only with keys: title, objective, explanation, examples (array), guidedPractice (array of objects with prompt and answer), productionTask, successCriteria (array), reviewTip. Keep it practical, learner-friendly, and directly connected to the learner's weakest evidence. Do not claim external facts you do not know.`;
  await recordUsage(context.session.learnerId, "AI_TEACHER");
  const result = await callAI(system, JSON.stringify({ level, skill, goal, lessonId: body?.lessonId ?? null, mastery, errors: errors.slice(0, 8) }), {
    learnerId: context.session.learnerId,
    task: "LESSON",
    complexity: "MEDIUM",
    retrievalQuery: `${level} ${skill} ${goal}`,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  const lesson = validateLessonResponse(result.value);
  if (!lesson) return NextResponse.json({ error: "AI provider returned an invalid lesson payload. Please retry." }, { status: 502 });
  return NextResponse.json({ lesson, model: result.model, usageTokens: result.usageTokens ?? null });
}

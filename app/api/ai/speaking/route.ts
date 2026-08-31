import { NextResponse } from "next/server";
import { callAI, recordLearnerFeedbackEvidence, requireLearnerContext, validateSpeakingResponse } from "../_shared";

export const dynamic = "force-dynamic";
import { resolveGatingTier } from "@/src/infrastructure/usage-guard";
import { checkFeature, recordUsage } from "@/src/infrastructure/usage-guard";


export async function POST(request: Request) {
  const context = await requireLearnerContext();
  if ("error" in context) return NextResponse.json({ error: context.error }, { status: context.status });
  const tier = await resolveGatingTier(context.session.learnerId);
  const guard = await checkFeature(context.session.learnerId, tier, "AI_TEACHER");
  if (!guard.allowed) {
    return NextResponse.json({
      error: `You've used today's free AI sessions (${guard.quota}/day). Upgrade to PLUS for 30 a day — your learning data and progress are never limited.`,
      upgrade: { feature: "AI_TEACHER", neededTier: "SUBSCRIBED", usedToday: guard.usedToday, quota: guard.quota },
    }, { status: 402 });
  }

  const body = await request.json().catch(() => null) as { prompt?: string; transcript?: string } | null;
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const transcript = typeof body?.transcript === "string" ? body.transcript.trim() : "";
  if (prompt.length < 5 || transcript.length < 2) return NextResponse.json({ error: "prompt and transcript are required." }, { status: 400 });
  const level = context.profile?.englishDna.overallLevel ?? context.profile?.targetLevel ?? "B1";
  const system = `You are English Wizard's speaking coach. The transcript is a speech-to-text transcript, not raw audio. Assess communication, grammar, vocabulary, fluency signals and likely pronunciation risks without pretending you measured acoustic pronunciation. Return JSON only with keys: score (0-100), strengths (array), corrections (array of objects with original, improved, explanation), pronunciationRisks (array of strings), nextPractice (string), disclaimer (string). CEFR-appropriate and constructive.`;
  await recordUsage(context.session.learnerId, "AI_TEACHER");
  const result = await callAI(system, JSON.stringify({ level, prompt, transcript }), {
    learnerId: context.session.learnerId,
    task: "SPEAKING",
    complexity: "HIGH",
    retrievalQuery: `${level} speaking ${prompt}`,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  const feedback = validateSpeakingResponse(result.value);
  if (!feedback) return NextResponse.json({ error: "AI provider returned an invalid speaking-feedback payload. Please retry." }, { status: 502 });

  const evidence = await recordLearnerFeedbackEvidence({
    learnerId: context.session.learnerId,
    operation: "speaking",
    modality: "SPEAKING",
    level,
    score: feedback.score as number,
    capabilityId: "speaking.communication",
    errorTags: [
      ...((feedback.corrections as Array<{ explanation: string }>).map(() => "ai-speaking-correction")),
      ...((feedback.pronunciationRisks as string[]).map(() => "pronunciation-risk")),
    ],
    requestId: result.requestId,
  });
  return NextResponse.json({ feedback, evidence, model: result.model, usageTokens: result.usageTokens ?? null });
}

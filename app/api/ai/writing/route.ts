import { NextResponse } from "next/server";
import { callAI, recordLearnerFeedbackEvidence, requireLearnerContext, validateWritingResponse } from "../_shared";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const context = await requireLearnerContext();
  if ("error" in context) return NextResponse.json({ error: context.error }, { status: context.status });
  const body = await request.json().catch(() => null) as { prompt?: string; answer?: string } | null;
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const answer = typeof body?.answer === "string" ? body.answer.trim() : "";
  if (prompt.length < 5 || answer.length < 5) return NextResponse.json({ error: "prompt and answer are required." }, { status: 400 });
  const level = context.profile?.englishDna.overallLevel ?? context.profile?.targetLevel ?? "B1";
  const system = `You are English Wizard's writing coach. Assess the learner at ${level}. Return JSON only with keys: score (0-100), correctedAnswer, strengths (array of strings), errors (array of objects with text, explanation, correction, type), nextPractice (string). Be encouraging, accurate, CEFR-appropriate, and never invent an error just to fill space.`;
  const result = await callAI(system, JSON.stringify({ level, prompt, answer }), {
    learnerId: context.session.learnerId,
    task: "WRITING",
    complexity: "MEDIUM",
    retrievalQuery: `${level} writing ${prompt}`,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  const feedback = validateWritingResponse(result.value);
  if (!feedback) return NextResponse.json({ error: "AI provider returned an invalid writing-feedback payload. Please retry." }, { status: 502 });

  const evidence = await recordLearnerFeedbackEvidence({
    learnerId: context.session.learnerId,
    operation: "writing",
    modality: "WRITING",
    level,
    score: feedback.score as number,
    capabilityId: "writing.communication",
    errorTags: (feedback.errors as Array<{ type: string }>).map((error) => error.type),
    requestId: result.requestId,
  });
  return NextResponse.json({ feedback, evidence, model: result.model, usageTokens: result.usageTokens ?? null });
}

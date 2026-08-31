import { NextResponse } from "next/server";
import { callAI, requireLearnerContext } from "../../ai/_shared";
import { resolveGatingTier } from "@/src/infrastructure/usage-guard";
import { checkFeature, recordUsage } from "@/src/infrastructure/usage-guard";
import { hitRateLimit } from "@/src/infrastructure/rate-limit";

export const dynamic = "force-dynamic";

const MIN_TEXT = 40;
const MAX_TEXT = 6000;
const RATE_LIMIT = 8;
const RATE_WINDOW_MINUTES = 10;

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function asStringArray(value: unknown, min: number): string[] | null {
  if (!Array.isArray(value)) return null;
  const arr = value.filter((item): item is string => isString(item) && item.trim().length > 0);
  return arr.length >= min ? arr : null;
}

interface JobResult {
  languageDemands: string[];
  keyVocabulary: Array<{ term: string; meaning: string }>;
  likelyQuestions: string[];
  interviewTask: string;
  practicePlan: string[];
}

interface EmailResult {
  issues: Array<{ type: string; before: string; after: string; why: string }>;
  improvedEmail: string;
  toneNotes: string[];
  practiceTask: string;
}

/** Shape-enforcing validators — a malformed AI payload never reaches the learner (Part 117). */
function validateJobResult(value: Record<string, unknown>): JobResult | null {
  const languageDemands = asStringArray(value.languageDemands, 3);
  if (!languageDemands) return null;
  if (!Array.isArray(value.keyVocabulary)) return null;
  const keyVocabulary = value.keyVocabulary
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({ term: isString(item.term) ? item.term.trim() : "", meaning: isString(item.meaning) ? item.meaning.trim() : "" }))
    .filter((item) => item.term.length > 0 && item.meaning.length > 0);
  if (keyVocabulary.length < 4) return null;
  const likelyQuestions = asStringArray(value.likelyQuestions, 3);
  if (!likelyQuestions) return null;
  if (!isString(value.interviewTask) || !value.interviewTask.trim()) return null;
  const practicePlan = asStringArray(value.practicePlan, 2);
  if (!practicePlan) return null;
  return { languageDemands, keyVocabulary, likelyQuestions, interviewTask: value.interviewTask, practicePlan };
}

function validateEmailResult(value: Record<string, unknown>): EmailResult | null {
  if (!isString(value.improvedEmail) || !value.improvedEmail.trim()) return null;
  if (!Array.isArray(value.issues)) return null;
  const issues = value.issues
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      type: isString(item.type) ? item.type.trim() : "",
      before: isString(item.before) ? item.before.trim() : "",
      after: isString(item.after) ? item.after.trim() : "",
      why: isString(item.why) ? item.why.trim() : "",
    }))
    .filter((item) => item.before.length > 0 && item.after.length > 0 && item.why.length > 0)
    .slice(0, 6);
  if (!issues.length) return null;
  const toneNotes = asStringArray(value.toneNotes, 1);
  if (!toneNotes) return null;
  if (!isString(value.practiceTask) || !value.practiceTask.trim()) return null;
  return { issues, improvedEmail: value.improvedEmail, toneNotes, practiceTask: value.practiceTask };
}

export async function POST(request: Request) {
  const context = await requireLearnerContext();
  if ("error" in context) return NextResponse.json({ error: context.error }, { status: context.status });
  const learnerId = context.session.learnerId;

  const body = await request.json().catch(() => null) as { mode?: unknown; text?: unknown; roleTitle?: unknown } | null;
  const mode = body?.mode === "email" ? "email" : body?.mode === "job" ? "job" : null;
  const text = isString(body?.text) ? body.text.trim() : "";
  const roleTitle = isString(body?.roleTitle) ? body.roleTitle.trim().slice(0, 120) : "";

  if (!mode) return NextResponse.json({ error: "Choose a mode: job or email." }, { status: 400 });
  if (text.length < MIN_TEXT || text.length > MAX_TEXT) {
    return NextResponse.json(
      { error: `Paste between ${MIN_TEXT} and ${MAX_TEXT} characters of real material — the coach works from your actual thing.` },
      { status: 400 },
    );
  }

  // Per-learner rate limit: 8 requests per 10 minutes for this premium feature.
  const limit = await hitRateLimit(`actual-thing:${learnerId}`, "business.actual", RATE_LIMIT, RATE_WINDOW_MINUTES);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "That is the limit for now — eight sessions per ten minutes. Your material is safe; come back shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 600) } },
    );
  }

  // FREE-tier daily quota, same pattern as the AI lesson route (Parts 128–130).
  const tier = await resolveGatingTier(learnerId);
  const guard = await checkFeature(learnerId, tier, "AI_TEACHER");
  if (!guard.allowed) {
    return NextResponse.json({
      error: `You've used today's free AI sessions (${guard.quota}/day). Upgrade to PLUS for 30 a day — your learning data and progress are never limited.`,
      upgrade: { feature: "AI_TEACHER", neededTier: "SUBSCRIBED", usedToday: guard.usedToday, quota: guard.quota },
    }, { status: 402 });
  }

  let system: string;
  let user: string;
  let task: "LESSON" | "WRITING";

  if (mode === "job") {
    system = "You are an English Wizard interview coach for Arabic-L1 and international professionals. Return JSON only: {languageDemands: string[5], keyVocabulary: [{term, meaning}...8], likelyQuestions: string[6], interviewTask: string, practicePlan: string[4]}. Every item must be grounded strictly in the job description provided — never invent requirements it does not contain. interviewTask is one concrete rehearsal task the learner can perform in a role-play studio. practicePlan steps are specific and checkable. Use British English conventions throughout.";
    user = `JOB DESCRIPTION:\n${text}${roleTitle ? `\n\nTARGET ROLE: ${roleTitle}` : ""}`;
    task = "LESSON";
  } else {
    system = "You are an English Wizard business writing coach. Return JSON only: {issues: [{type, before, after, why}...up to 6], improvedEmail: string, toneNotes: string[3], practiceTask: string}. Each issue's 'before' must quote the learner's actual text exactly as written — feedback always references real learner output, never a generic example. 'after' is the corrected version and 'why' explains the change in one clear sentence. improvedEmail is the complete rewritten email, ready to send. practiceTask is one concrete follow-up exercise. Use British English conventions throughout, and never invent problems that are not present in the text.";
    user = `EMAIL TO IMPROVE:\n${text}`;
    task = "WRITING";
  }

  await recordUsage(learnerId, "AI_TEACHER");

  let result: Awaited<ReturnType<typeof callAI>>;
  try {
    result = await callAI(system, user, { learnerId, task, complexity: "HIGH" });
  } catch {
    return NextResponse.json({ error: "The coaching engine is temporarily unavailable. Please try again." }, { status: 502 });
  }
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const validated = mode === "job" ? validateJobResult(result.value) : validateEmailResult(result.value);
  if (!validated) {
    return NextResponse.json({ error: "The coach returned an unreadable response. Please try once more." }, { status: 502 });
  }

  return NextResponse.json({ mode, result: validated, model: result.model, usageTokens: result.usageTokens ?? null });
}

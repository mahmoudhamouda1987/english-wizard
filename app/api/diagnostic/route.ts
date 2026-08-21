import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { diagnosticQuestions, scoreDiagnostic, applyDiagnosticToState, type DiagnosticAnswer, type DiagnosticProduction } from "@/src/domain/diagnostic";
import { chooseNextDiagnosticItem, DEFAULT_ADAPTIVE_ITEMS, shouldStopAdaptiveDiagnostic, updateDiagnosticEvidence } from "@/src/domain/adaptive-diagnostic";
import { summarizeAssessmentEvidence } from "@/src/domain/assessment-engine";
import { getLearnerState, saveLearnerState } from "@/src/infrastructure/learner-repository";
import { upsertProfile, getProfile } from "@/src/infrastructure/profile-repository";
import { query } from "@/src/infrastructure/database";
import { currentUser } from "@/src/infrastructure/auth";

export const dynamic = "force-dynamic";

const DIAGNOSTIC_SKILLS = ["grammar", "vocabulary", "reading", "listening", "speaking", "writing"] as const;

function adaptiveSnapshot(answers: DiagnosticAnswer[]) {
  let state = { evidence: [], askedIds: [], maxQuestions: 18, minEvidencePerSkill: 2 } as Parameters<typeof chooseNextDiagnosticItem>[1];
  for (const answer of answers) {
    const item = DEFAULT_ADAPTIVE_ITEMS.find((candidate) => candidate.id === answer.id);
    if (item) state = updateDiagnosticEvidence(state, item, answer);
  }
  const stopped = shouldStopAdaptiveDiagnostic(state, [...DIAGNOSTIC_SKILLS]);
  const next = stopped ? null : chooseNextDiagnosticItem(DEFAULT_ADAPTIVE_ITEMS, state);
  return { evidence: state.evidence, askedIds: state.askedIds, nextQuestionId: next?.id ?? null, questionsRemaining: Math.max(0, state.maxQuestions - state.askedIds.length), stopped };
}

function assessmentObservations(answers: DiagnosticAnswer[]) {
  return DIAGNOSTIC_SKILLS.map((skill) => {
    const items = DEFAULT_ADAPTIVE_ITEMS.filter((item) => item.skill === skill && answers.some((answer) => answer.id === item.id));
    const answered = answers.filter((answer) => items.some((item) => item.id === answer.id));
    const correct = answered.filter((answer) => items.find((item) => item.id === answer.id)?.correct.toLowerCase() === answer.answer.trim().toLowerCase()).length;
    const difficulty = items.map((item) => item.difficulty);
    const score = Math.round((correct / Math.max(1, answered.length)) * 100);
    return { skill, score, difficulty: difficulty.length ? Math.max(...difficulty) : 1, correct, total: answered.length, historyScores: answered.length ? [score] : [] };
  });
}

export async function GET(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const url = new URL(request.url);
  const rawAnswers = url.searchParams.get("answers");
  let answers: DiagnosticAnswer[] = [];
  if (rawAnswers) {
    try {
      const parsed = JSON.parse(rawAnswers) as unknown;
      if (Array.isArray(parsed)) answers = parsed.filter((item): item is DiagnosticAnswer => Boolean(item) && typeof item === "object" && typeof (item as Record<string, unknown>).id === "string" && typeof (item as Record<string, unknown>).answer === "string");
    } catch {
      return NextResponse.json({ error: "Invalid adaptive diagnostic state." }, { status: 400 });
    }
  }
  return NextResponse.json({ questions: diagnosticQuestions, adaptive: adaptiveSnapshot(answers), profile: await getProfile(session.learnerId) });
}

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { answers?: DiagnosticAnswer[]; production?: DiagnosticProduction } | null;
  if (!Array.isArray(body?.answers)) return NextResponse.json({ error: "answers are required." }, { status: 400 });
  const state = await getLearnerState(session.learnerId);
  if (!state) return NextResponse.json({ error: "Learner state not found." }, { status: 404 });
  const now = new Date().toISOString();
  const production = { writingSample: typeof body.production?.writingSample === "string" ? body.production.writingSample.slice(0, 4000) : "", speakingTranscript: typeof body.production?.speakingTranscript === "string" ? body.production.speakingTranscript.slice(0, 3000) : "" };
  const result = scoreDiagnostic(body.answers, now, production);
  const adaptive = adaptiveSnapshot(body.answers);
  const assessment = summarizeAssessmentEvidence(assessmentObservations(body.answers));
  const updatedState = await saveLearnerState(applyDiagnosticToState(state, result.mastery, now, result.level));
  const existingProfile = await getProfile(session.learnerId);
  await upsertProfile({
    learnerId: session.learnerId,
    displayName: existingProfile?.displayName ?? session.displayName,
    nativeLanguage: existingProfile?.nativeLanguage ?? "Arabic",
    targetLevel: result.level,
    dailyMinutes: existingProfile?.dailyMinutes ?? 20,
    goals: existingProfile?.goals ?? [],
    englishDna: { overallLevel: result.level, strengths: result.strengths, focusAreas: result.focusAreas, preferredSkills: result.strengths, confidence: Math.round(result.overallScore) / 100, productionEvidence: result.production, diagnosticEvidence: adaptive.evidence, assessmentEvidence: assessment, generatedAt: now },
    updatedAt: now,
  });
  await query("INSERT INTO diagnostic_attempts (id, learner_id, answers, scores, cefr_level, english_dna) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6::jsonb)", [randomUUID(), session.learnerId, JSON.stringify({ answers: body.answers, production }), JSON.stringify(result.skillScores), result.level, JSON.stringify({ strengths: result.strengths, focusAreas: result.focusAreas, overallScore: result.overallScore, production: result.production, adaptive, assessment })]);
  await query("INSERT INTO learning_events (id, learner_id, event_type, payload) VALUES ($1, $2, $3, $4::jsonb)", [randomUUID(), session.learnerId, "diagnostic.completed", JSON.stringify({ ...result, production, adaptive, assessment, nextLessonId: updatedState.currentLessonId })]);
  return NextResponse.json({ result, adaptive, assessment, state: updatedState });
}

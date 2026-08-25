import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import {
  listQualifications,
  buildCambridgeAssessment,
  gradeBankItems,
  cambridgeScaleEstimate,
  cambridgeReadiness,
  type CambridgeQualificationId,
  type AssessmentKind,
} from "@/src/domain/cambridge";

export const dynamic = "force-dynamic";

const VALID_KINDS: AssessmentKind[] = ["vocabulary-benchmark", "grammar-benchmark", "reading-benchmark", "listening-benchmark", "writing-task", "speaking-card", "readiness-assessment"];

function safeQualification(value: string | null): CambridgeQualificationId | null {
  if (!value) return null;
  const upper = value.toUpperCase().trim().replace(/-/g, "_");
  return (["A2_KEY", "B1_PRELIMINARY", "B2_FIRST", "C1_ADVANCED", "C2_PROFICIENCY"] as string[]).includes(upper) ? upper as CambridgeQualificationId : null;
}

function safeKind(value: string | null): AssessmentKind | null {
  if (!value) return null;
  const lower = value.trim().toLowerCase();
  return (VALID_KINDS as string[]).includes(lower) ? lower as AssessmentKind : null;
}

/** GET /api/exams/cambridge — catalog or specific assessment set. */
export async function GET(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const url = new URL(request.url);
  const qualificationId = safeQualification(url.searchParams.get("qualification"));
  const kind = safeKind(url.searchParams.get("kind"));

  if (!qualificationId || !kind) {
    return NextResponse.json({
      qualifications: listQualifications().map((q) => ({ id: q.id, name: q.name, cefr: q.cefr, passNote: q.passNote })),
      kinds: VALID_KINDS,
      message: "Supply qualification and kind to receive an assessment.",
    });
  }
  const assessment = buildCambridgeAssessment(qualificationId, kind);
  if (!assessment) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  return NextResponse.json({ assessment });
}

/** POST /api/exams/cambridge — submit answers, receive internal scale estimate. */
export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as {
    qualification?: string; kind?: string; answers?: Record<string, string>; writingText?: string;
  } | null;
  const qualificationId = safeQualification(body?.qualification ?? null);
  const kind = safeKind(body?.kind ?? null);
  if (!qualificationId || !kind) return NextResponse.json({ error: "qualification and kind are required." }, { status: 400 });
  const assessment = buildCambridgeAssessment(qualificationId, kind);
  if (!assessment) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });

  let percent = 0;
  const feedback: string[] = [];
  if (assessment.objectiveItems.length) {
    const result = gradeBankItems(assessment.objectiveItems, body?.answers ?? {});
    percent = result.percent;
    feedback.push(...result.perItem.filter((r) => !r.correct).map((r) => `${r.expected} — ${r.explain}`));
  } else if (kind === "writing-task" || kind === "speaking-card") {
    // Subjective: score on completion signal for objective benchmarks
    percent = Math.min(100, Math.round(((body?.writingText?.trim().split(/\s+/).filter(Boolean).length ?? 0) / (120)) * 70 + 30));
  }
  const scaleEstimate = cambridgeScaleEstimate(percent, assessment.qualification);
  const readiness = cambridgeReadiness(percent, assessment.qualification);

  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1, $2::uuid, 'CAMBRIDGE_ASSESSMENT_COMPLETE', $3, now())`,
    [crypto.randomUUID(), session.learnerId, JSON.stringify({ qualificationId, kind, percent, scaleEstimate })],
  );

  return NextResponse.json({ qualificationId, kind, title: assessment.title, percent, scaleEstimate, readiness, feedback, disclaimer: "Internal preparation estimate — not an official Cambridge result." }, { status: 200, headers: { "Cache-Control": "no-store" } });
}

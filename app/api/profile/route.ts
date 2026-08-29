import { NextResponse } from "next/server";
import type { LearnerProfile } from "@/src/domain/profile";
import { getProfile, upsertProfile } from "@/src/infrastructure/profile-repository";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { generateStudentId } from "@/src/domain/trial";

function validTargetLevel(value: unknown): value is LearnerProfile["targetLevel"] {
  return typeof value === "string" && ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].includes(value);
}

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return NextResponse.json({ profile: await getProfile(session.learnerId) });
}

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: "JSON body required." }, { status: 400 });
  const dailyMinutes = Number(body.dailyMinutes ?? 20);
  if (!Number.isInteger(dailyMinutes) || dailyMinutes < 5 || dailyMinutes > 180) {
    return NextResponse.json({ error: "dailyMinutes must be between 5 and 180." }, { status: 400 });
  }
  const targetLevel = validTargetLevel(body.targetLevel) ? body.targetLevel : "B1";
  const existing = await getProfile(session.learnerId);
  const profile = await upsertProfile({
    learnerId: session.learnerId,
    displayName: typeof body.displayName === "string" && body.displayName.trim() ? body.displayName.trim() : session.displayName,
    nativeLanguage: typeof body.nativeLanguage === "string" && body.nativeLanguage.trim() ? body.nativeLanguage.trim() : "Arabic",
    targetLevel,
    dailyMinutes,
    goals: Array.isArray(body.goals) ? body.goals.filter((item): item is string => typeof item === "string").slice(0, 8) : (existing?.goals ?? []),
    englishDna: existing?.englishDna ?? { overallLevel: "Not assessed", strengths: [], focusAreas: [], preferredSkills: [], confidence: 0 },
    updatedAt: new Date().toISOString(),
  });

  // Assign an idempotent Student ID (EW-YYYY-NNNNNN) on first profile setup.
  // Sequence is derived from the highest existing suffix for the current year so
  // every learner receives a UNIQUE id (never a repeated 000000).
  let studentId: string | null = null;
  const idRow = await query<{ student_id: string | null }>(`SELECT student_id FROM learners WHERE id = $1::uuid`, [session.learnerId]);
  if (idRow.rows.length) {
    if (!idRow.rows[0].student_id) {
      const year = new Date().getFullYear();
      const seqRow = await query<{ max_seq: number | null }>(
        `SELECT COALESCE(MAX(NULLIF(SUBSTRING(student_id FROM '^EW-[0-9]{4}-([0-9]{6})$'), '')::int), -1) AS max_seq
         FROM learners WHERE student_id LIKE $1`,
        [`EW-${year}-%`],
      );
      const nextSeq = Math.max(0, (seqRow.rows[0]?.max_seq ?? -1) + 1);
      studentId = generateStudentId(year, nextSeq);
      await query(`UPDATE learners SET student_id = $2, updated_at = NOW() WHERE id = $1::uuid AND student_id IS NULL`, [session.learnerId, studentId]);
    } else {
      studentId = idRow.rows[0].student_id;
    }
  }

  return NextResponse.json({ profile, studentId });
}

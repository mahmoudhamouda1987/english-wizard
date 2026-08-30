import { NextResponse } from "next/server";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

/**
 * Candidate side of the B2B flow (2.0 Part 95), addressed by opaque link token.
 * GET /api/b2b/assessments/[link] — status, and the result once completed.
 * The token grants access to exactly one assessment — nothing else is exposed.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ link: string }> }) {
  try {
    const { link } = await params;
    if (!link || link.length < 10) return NextResponse.json({ error: "Invalid assessment link." }, { status: 400 });

    const assessment = await query<{ id: string; label: string; system: string; status: string; completed_at: string | null }>(
      "SELECT id, label, system, status, completed_at FROM b2b_assessments WHERE link_token=$1 LIMIT 1",
      [link],
    );
    if (!assessment.rows.length) return NextResponse.json({ error: "Assessment link not recognised." }, { status: 404 });
    const a = assessment.rows[0];

    if (a.status !== "COMPLETED") {
      return NextResponse.json({ assessment: { label: a.label, system: a.system, status: a.status }, result: null });
    }

    const result = await query<{ candidate_ref: string; cefr_level: string; skill_profile: Record<string, { level: string; percent: number }>; percent: number; report_id: string; created_at: string }>(
      "SELECT candidate_ref, cefr_level, skill_profile, percent, report_id, created_at FROM b2b_results WHERE assessment_id=$1 ORDER BY created_at DESC LIMIT 1",
      [a.id],
    );
    return NextResponse.json({
      assessment: { label: a.label, system: a.system, status: a.status, completedAt: a.completed_at },
      result: result.rows[0] ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Unable to load the assessment right now." }, { status: 500 });
  }
}

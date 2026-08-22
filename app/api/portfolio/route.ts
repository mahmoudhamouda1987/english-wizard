import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

interface EvidenceRow { id: string; source_type: string; skill: string; objective_id: string | null; evidence: Record<string, unknown>; score: string | null; transfer: boolean; occurred_at: Date }

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const evidence = await query<EvidenceRow>(
    `SELECT id, source_type, skill, objective_id, evidence, score, transfer, occurred_at
     FROM evidence_records WHERE learner_id = $1 ORDER BY occurred_at DESC LIMIT 200`,
    [user.learnerId],
  );

  const certificates = await query<{ id: string; level: string; overall_percent: number; issued_at: Date }>(
    `SELECT id, level, overall_percent, issued_at FROM certificates WHERE learner_id = $1 AND revoked = FALSE ORDER BY issued_at DESC`,
    [user.learnerId],
  );

  const profile = await query<{ display_name: string }>(`SELECT display_name FROM learner_profiles WHERE learner_id = $1`, [user.learnerId]);

  const artifacts = evidence.rows.map((row) => ({
    id: row.id,
    kind: row.source_type,
    skill: row.skill,
    objective: row.objective_id,
    prompt: typeof row.evidence?.prompt === "string" ? (row.evidence.prompt as string).slice(0, 220) : null,
    excerpt: typeof row.evidence?.answer === "string" ? (row.evidence.answer as string).slice(0, 280) : null,
    score: row.score !== null ? Math.round(Number(row.score)) : null,
    transfer: row.transfer,
    occurredAt: new Date(row.occurred_at).toISOString(),
  }));

  return NextResponse.json({
    displayName: profile.rows[0]?.display_name ?? "Learner",
    totals: {
      artifacts: artifacts.length,
      transfers: artifacts.filter((a) => a.transfer).length,
      scored: artifacts.filter((a) => a.score !== null).length,
      certificates: certificates.rows.length,
    },
    artifacts,
    certificates: certificates.rows.map((c) => ({ id: c.id, level: c.level, overallPercent: c.overall_percent, issuedAt: new Date(c.issued_at).toISOString() })),
  });
}

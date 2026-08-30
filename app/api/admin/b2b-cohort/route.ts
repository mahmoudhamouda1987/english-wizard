import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/infrastructure/admin-guard";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

/**
 * Cohort data for the admin dashboard (2.0 Part 96).
 * Aggregate rows only: organisation name, label, system, status, date.
 * Candidate emails and result payloads are deliberately NOT exposed here.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (guard.denied) return guard.denied;
  try {
    const res = await query(
      `SELECT o.name AS organisation, a.label, a.system, a.status, a.created_at
       FROM b2b_assessments a
       JOIN b2b_organisations o ON o.id = a.organisation_id
       ORDER BY a.created_at DESC
       LIMIT 500`,
    );
    return NextResponse.json({ assessments: res.rows });
  } catch {
    return NextResponse.json({ error: "Unable to load the cohort view right now." }, { status: 500 });
  }
}

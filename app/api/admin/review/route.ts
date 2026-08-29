import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/infrastructure/admin-guard";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

const ALLOWED_DECISIONS = new Set(["APPROVED", "REJECTED", "HUMAN_REVIEW"]);

export async function GET() {
  const guard = await requireAdmin();
  if (guard.denied) return guard.denied;
  const pending = await query(
    `SELECT entity_id, kind, version, change_summary, created_at FROM content_versions ORDER BY created_at DESC LIMIT 100`,
  ).catch(() => ({ rows: [] as unknown[] }));
  return NextResponse.json({ queue: pending.rows });
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.denied) return guard.denied;
  const session = guard.session;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const entityId = typeof body.entityId === "string" ? body.entityId : "";
  const decision = typeof body.decision === "string" ? body.decision : "";
  const note = typeof body.note === "string" ? body.note.slice(0, 500) : "";
  if (!entityId || !ALLOWED_DECISIONS.has(decision)) {
    return NextResponse.json({ error: "entityId and a valid decision (APPROVED, REJECTED, HUMAN_REVIEW) are required." }, { status: 400 });
  }

  await query(
    `INSERT INTO audit_events (id,learner_id,actor_id,action,entity_type,entity_id,metadata) VALUES ($1,NULL,$2,'CONTENT_REVIEW_DECISION','CONTENT_VERSION',$3,$4::jsonb)`,
    [crypto.randomUUID(), session.userId, entityId, JSON.stringify({ decision, note })],
  ).catch(() => null);

  return NextResponse.json({ ok: true, entityId, decision });
}

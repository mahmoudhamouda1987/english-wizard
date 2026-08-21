import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

function isAdmin(email: string): boolean {
  const allowlist = (process.env.ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}

const ALLOWED_DECISIONS = new Set(["APPROVED", "REJECTED", "HUMAN_REVIEW"]);

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isAdmin(session.email)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const pending = await query(
    `SELECT entity_id, kind, version, change_summary, created_at FROM content_versions ORDER BY created_at DESC LIMIT 100`,
  ).catch(() => ({ rows: [] as unknown[] }));
  return NextResponse.json({ queue: pending.rows });
}

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isAdmin(session.email)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

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

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "onboarding_started",
  "onboarding_completed",
  "levelquest_started",
  "levelquest_question_answered",
  "levelquest_completed_viewed",
  "report_downloaded",
  "trial_viewed",
  "upgrade_modal_opened",
  "upgrade_clicked",
  "plan_page_viewed",
  "trial_expired_notice",
]);

/**
 * Lightweight client analytics: records a product event into learning_events.
 * Whitelisted event types only; strictly best-effort and never blocking.
 */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { event?: string; payload?: Record<string, unknown> } | null;
  const event = body?.event;
  if (!event || !ALLOWED.has(event)) return NextResponse.json({ error: "event must be a known product event." }, { status: 400 });

  try {
    await query(
      `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1, $2::uuid, $3, $4, now())`,
      [randomUUID(), user.learnerId, event, JSON.stringify(body?.payload ?? {})],
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  // Onboarding (Part 34)
  "onboarding_started",
  "onboarding_completed",
  // LevelQuest assessment
  "levelquest_started",
  "levelquest_question_answered",
  "question_skipped",
  "question_flagged",
  "listening_started",
  "listening_completed",
  "speaking_started",
  "speaking_completed",
  "assessment_completed",
  "assessment_abandoned",
  "levelquest_completed_viewed",
  // Report
  "report_generated",
  "report_downloaded",
  // Dashboard + trial + subscription
  "dashboard_entered",
  "trial_started",
  "trial_viewed",
  "trial_expired_notice",
  "premium_feature_viewed",
  "upgrade_modal_opened",
  "upgrade_clicked",
  "plan_page_viewed",
  "subscription_started",
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

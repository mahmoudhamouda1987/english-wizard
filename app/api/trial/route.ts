import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { getTrial, startTrial, markTrialExpired, markTrialConverted } from "@/src/infrastructure/trial-repository";
import { effectiveTrialStatus, trialView, type TrialRecord } from "@/src/domain/trial";
import { getSubscription } from "@/src/infrastructure/subscription-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const trial = await getTrial(user.learnerId);
  // Lazy-apply expiry when computed during a read.
  const trialStatus = effectiveTrialStatus(trial);
  if (trial && trialStatus === "EXPIRED" && trial.status !== "EXPIRED") {
    await markTrialExpired(user.learnerId);
  }
  return NextResponse.json({
    trial: trialView(trial),
    trialStatus,
  }, { headers: { "Cache-Control": "no-store" } });
}

/** Start a 7-day trial (idempotent). Used at onboarding and from an upgrade prompt. */
export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const subscription = await getSubscription(user.learnerId);
  const trial = await startTrial(user.learnerId);

  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1, $2::uuid, 'trial.started', $3, now())`,
    [randomUUID(), user.learnerId, JSON.stringify({ days: 7, endsAt: trial.endsAt })],
  );
  await query(
    `INSERT INTO audit_events (id, learner_id, actor_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2::uuid, $2::uuid, 'TRIAL_START', 'trial_subscription', $2::text, $3::jsonb)`,
    [randomUUID(), user.learnerId, JSON.stringify({ endsAt: trial.endsAt, hadPaidSubscription: Boolean(subscription) })],
  );

  return NextResponse.json({ trial: trialView(trial), trialStatus: effectiveTrialStatus(trial) }, { status: 201 });
}

/** CONVERT records the learner moved onto a paid plan; CONVERTED trials stay at FULL during expiry checks. */
export async function PUT() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  await markTrialConverted(user.learnerId);
  return NextResponse.json({ ok: true });
}

/** Force mark expired (used by admin/testing; also invoked when the countdown hits zero). */
export async function DELETE() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  await markTrialExpired(user.learnerId);
  return NextResponse.json({ ok: true });
}

export type { TrialRecord };

import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { getTrial } from "@/src/infrastructure/trial-repository";
import { trialView, effectiveTrialStatus } from "@/src/domain/trial";
import { getSubscription } from "@/src/infrastructure/subscription-repository";
import { effectiveTier } from "@/src/domain/subscription";
import { effectiveTierWithGrace } from "@/src/domain/billing-webhooks";

export const dynamic = "force-dynamic";

/**
 * Consolidated access overview used by gating UI across the app.
 * A learner is "premium" if a paid tier is active OR they are inside their 7-day trial.
 * This single endpoint lets pages (dashboard, pathways, practice) decide whether to show
 * locked-feature upgrade prompts and the trial countdown.
 */
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const subscription = await getSubscription(user.learnerId);
  const paid = effectiveTierWithGrace(subscription ? { status: subscription.status, tier: subscription.tier, periodEnd: subscription.periodEnd } : null);
  const paidTier = paid.inGrace ? paid.tier : effectiveTier(subscription);

  const trial = await getTrial(user.learnerId);
  const trialStatus = effectiveTrialStatus(trial);
  const view = trialView(trial);

  const premium = paidTier !== "FREE" || (trialStatus === "ACTIVE" && view.active);

  return NextResponse.json({
    premium,
    trial: view,
    trialStatus,
    paidTier,
    inTrial: trialStatus === "ACTIVE" && view.active,
    trialExpired: trialStatus === "EXPIRED" && paidTier === "FREE",
  }, { headers: { "Cache-Control": "no-store" } });
}

import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { getSubscription, upsertSubscription } from "@/src/infrastructure/subscription-repository";
import { effectiveTier, planValueModel, SUBSCRIPTION_PLANS, type SubscriptionRecord } from "@/src/domain/subscription";
import { PLAN_ENTITLEMENTS, type PlanTier } from "@/src/domain/entitlements";

export const dynamic = "force-dynamic";

const TIERS: PlanTier[] = ["FREE", "PLUS", "PRO"];

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const subscription = await getSubscription(user.learnerId);
  const tier = effectiveTier(subscription);
  return NextResponse.json({
    subscription,
    effectiveTier: tier,
    entitlements: PLAN_ENTITLEMENTS[tier],
    valueModel: planValueModel(tier),
    plans: SUBSCRIPTION_PLANS,
    billingNote: "Plan changes in this environment are recorded directly and audited. A production payment provider attaches its own reference via the same record.",
  });
}

type ChangeBody = {
  action?: "CHANGE_PLAN" | "CANCEL" | "RESUME" | "PROVIDER_EVENT";
  tier?: string;
  provider?: string;
  externalReference?: string;
};

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as ChangeBody | null;
  const current = await getSubscription(user.learnerId);

  async function save(next: Partial<SubscriptionRecord>): Promise<SubscriptionRecord> {
    const record = await upsertSubscription({
      learnerId: user!.learnerId,
      tier: (next.tier ?? current?.tier ?? "FREE") as PlanTier,
      status: next.status ?? current?.status ?? "ACTIVE",
      provider: next.provider ?? current?.provider ?? "NONE",
      externalReference: next.externalReference ?? current?.externalReference,
      periodEnd: next.periodEnd ?? current?.periodEnd,
      cancelAtPeriodEnd: next.cancelAtPeriodEnd ?? current?.cancelAtPeriodEnd ?? false,
    });
    await query(
      `INSERT INTO audit_events (id, learner_id, actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2::uuid, $2::uuid, 'SUBSCRIPTION_CHANGE', 'subscription', $2::text, $3::jsonb)`,
      [randomUUID(), user!.learnerId, JSON.stringify({ from: current?.tier ?? null, to: record.tier, status: record.status, action: body?.action })],
    );
    return record;
  }

  switch (body?.action) {
    case "CHANGE_PLAN": {
      if (!body.tier || !TIERS.includes(body.tier as PlanTier)) {
        return NextResponse.json({ error: `tier must be one of ${TIERS.join(", ")}.` }, { status: 400 });
      }
      const record = await save({ tier: body.tier as PlanTier, status: "ACTIVE", cancelAtPeriodEnd: false, provider: body.provider ?? "NONE", ...(body.externalReference ? { externalReference: body.externalReference } : {}) });
      return NextResponse.json({ subscription: record, effectiveTier: effectiveTier(record) }, { status: 201 });
    }
    case "CANCEL": {
      if (!current) return NextResponse.json({ error: "No subscription to cancel." }, { status: 404 });
      if (current.tier === "FREE") return NextResponse.json({ error: "Free plan does not need cancellation." }, { status: 400 });
      const record = await save({ status: "CANCELLED", cancelAtPeriodEnd: true });
      return NextResponse.json({ subscription: record, effectiveTier: effectiveTier(record), note: "Access continues until the paid period ends; learning data is never deleted by a plan change." });
    }
    case "RESUME": {
      if (!current) return NextResponse.json({ error: "No subscription to resume." }, { status: 404 });
      const record = await save({ status: "ACTIVE", cancelAtPeriodEnd: false });
      return NextResponse.json({ subscription: record, effectiveTier: effectiveTier(record) });
    }
    case "PROVIDER_EVENT": {
      if (!body.externalReference) return NextResponse.json({ error: "externalReference is required for provider events." }, { status: 400 });
      if (body.tier && !TIERS.includes(body.tier as PlanTier)) return NextResponse.json({ error: `tier must be one of ${TIERS.join(", ")}.` }, { status: 400 });
      const record = await save({
        tier: (body.tier ?? current?.tier ?? "FREE") as PlanTier,
        provider: body.provider ?? "PROVIDER",
        externalReference: body.externalReference,
        status: "ACTIVE",
      });
      return NextResponse.json({ subscription: record, effectiveTier: effectiveTier(record) }, { status: 201 });
    }
    default:
      return NextResponse.json({ error: "action must be CHANGE_PLAN, CANCEL, RESUME or PROVIDER_EVENT." }, { status: 400 });
  }
}

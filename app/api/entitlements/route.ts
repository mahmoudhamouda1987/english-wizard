import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { PLAN_ENTITLEMENTS, type PlanTier } from "@/src/domain/entitlements";

export const dynamic = "force-dynamic";

function validTier(value: unknown): value is PlanTier {
  return value === "FREE" || value === "PLUS" || value === "PRO";
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const result = await query<{ tier: PlanTier }>("SELECT tier FROM entitlements WHERE learner_id=$1 ORDER BY tier LIMIT 1", [user.learnerId]);
  const tier = validTier(result.rows[0]?.tier) ? result.rows[0].tier : "FREE";
  return NextResponse.json({ tier, entitlements: PLAN_ENTITLEMENTS[tier] });
}

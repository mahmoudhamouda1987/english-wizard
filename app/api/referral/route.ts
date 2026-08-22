import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { getOrCreateReferralCode, referralStats } from "@/src/infrastructure/referral-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const referral = await getOrCreateReferralCode(user.learnerId);
  const stats = await referralStats(user.learnerId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return NextResponse.json({
    code: referral.code,
    inviteUrl: `${siteUrl}/auth?ref=${referral.code}`,
    invited: stats.invited,
    joined: stats.completed,
    rewardNote: "When a friend creates an account with your link, you both move closer to premium rewards — and your friend starts with a welcome boost.",
  });
}

import { NextResponse } from "next/server";
import type { LearnerProfile } from "@/src/domain/profile";
import { getProfile, upsertProfile } from "@/src/infrastructure/profile-repository";
import { currentUser } from "@/src/infrastructure/auth";

function validTargetLevel(value: unknown): value is LearnerProfile["targetLevel"] {
  return typeof value === "string" && ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].includes(value);
}

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return NextResponse.json({ profile: await getProfile(session.learnerId) });
}

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: "JSON body required." }, { status: 400 });
  const dailyMinutes = Number(body.dailyMinutes ?? 20);
  if (!Number.isInteger(dailyMinutes) || dailyMinutes < 5 || dailyMinutes > 180) {
    return NextResponse.json({ error: "dailyMinutes must be between 5 and 180." }, { status: 400 });
  }
  const targetLevel = validTargetLevel(body.targetLevel) ? body.targetLevel : "B1";
  const existing = await getProfile(session.learnerId);
  const profile = await upsertProfile({
    learnerId: session.learnerId,
    displayName: typeof body.displayName === "string" && body.displayName.trim() ? body.displayName.trim() : session.displayName,
    nativeLanguage: typeof body.nativeLanguage === "string" && body.nativeLanguage.trim() ? body.nativeLanguage.trim() : "Arabic",
    targetLevel,
    dailyMinutes,
    goals: Array.isArray(body.goals) ? body.goals.filter((item): item is string => typeof item === "string").slice(0, 8) : (existing?.goals ?? []),
    englishDna: existing?.englishDna ?? { overallLevel: "Not assessed", strengths: [], focusAreas: [], preferredSkills: [], confidence: 0 },
    updatedAt: new Date().toISOString(),
  });
  return NextResponse.json({ profile });
}

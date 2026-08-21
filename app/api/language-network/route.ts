import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { getChunksForLevel, capabilityByLevel } from "@/src/domain/language-network";
import type { CEFRLevel } from "@/src/domain/learner";

export const dynamic = "force-dynamic";

const LEVELS: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

export async function GET(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const level = new URL(request.url).searchParams.get("level") as CEFRLevel | null;
  const selected = level && LEVELS.includes(level) ? level : "A1";
  return NextResponse.json({ level: selected, chunks: getChunksForLevel(selected), communicationCapabilities: capabilityByLevel(selected) });
}

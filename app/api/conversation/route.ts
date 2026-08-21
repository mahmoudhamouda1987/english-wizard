import { NextRequest, NextResponse } from "next/server";
import { conversationForLevel } from "@/src/domain/conversation";
import { wordOfDayForLevel } from "@/src/domain/word-of-day";
import type { CEFRLevel } from "@/src/domain/curriculum";

const levels: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("level") ?? "A1";
  const level = levels.includes(raw as CEFRLevel) ? raw as CEFRLevel : "A1";
  const exercise = conversationForLevel(level);
  return NextResponse.json({ exercise: { ...exercise, gapScript: undefined }, wordOfDay: wordOfDayForLevel(level) });
}

import { NextResponse } from "next/server";
import { ALL_LESSONS } from "@/src/domain/all-lessons";

export async function GET() {
  const lessons = [...ALL_LESSONS]
    .sort((a, b) => a.sequence - b.sequence)
    .map(({ id, title, mission, objectiveId, level, skill, sequence }) => ({ id, title, mission, objectiveId, level, skill, sequence }));

  return NextResponse.json({ lessons });
}

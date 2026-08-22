import { NextResponse } from "next/server";
import { mediaAgentsStatus } from "@/src/domain/media-agents";

export const dynamic = "force-dynamic";

export async function GET() {
  const agents = mediaAgentsStatus();
  return NextResponse.json({
    agents,
    ready: agents.filter((a) => a.configured).length,
    note: "Add each provider API key as an environment variable to activate AI-generated videos, voices and images across tabs.",
  });
}

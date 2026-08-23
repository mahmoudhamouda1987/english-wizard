import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { getLearnerState } from "@/src/infrastructure/learner-repository";
import { getProfile } from "@/src/infrastructure/profile-repository";
import { query } from "@/src/infrastructure/database";
import { scenarioById, scriptedReply, type RoleplayScenario } from "@/src/domain/roleplay";

export const dynamic = "force-dynamic";

interface Turn { role: "user" | "partner"; content: string }

async function aiReply(scenario: RoleplayScenario, level: string, history: Turn[], message: string, memoryLine: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const system = [
      `You are a friendly ${scenario.partnerRole} in a role-play for an English learner at CEFR ${level}.`,
      `Scenario: ${scenario.situation}`,
      `Stay in character, keep replies under 60 words, ask one follow-up question when natural.`,
      `Gently model correct English; if the learner makes a clear error, rephrase it correctly inside your reply without lecturing.`,
      memoryLine ? `Learner memory: ${memoryLine}` : "",
    ].filter(Boolean).join(" ");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          ...history.slice(-8).map((turn) => ({ role: turn.role === "user" ? "user" : "assistant", content: turn.content })),
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 160,
      }),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = payload.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { scenarioId?: string; message?: string; history?: Turn[]; userTurnCount?: number } | null;
  const scenario = body?.scenarioId ? scenarioById(body.scenarioId) : undefined;
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 1000) : "";
  if (!scenario || !message) return NextResponse.json({ error: "scenarioId and message are required." }, { status: 400 });

  const history = Array.isArray(body?.history)
    ? body!.history!.filter((t) => t && typeof t.content === "string" && (t.role === "user" || t.role === "partner")).slice(-10)
    : [];

  const profile = await getProfile(user.learnerId);
  const state = await getLearnerState(user.learnerId);
  const level = profile?.targetLevel ?? scenario.level;
  const topErrors = [...(state?.errors ?? [])].sort((a, b) => b.occurrences - a.occurrences).slice(0, 3);
  const memoryLine = topErrors.length
    ? `recurring weak points: ${topErrors.map((e) => `${e.skill} (${e.objectiveId})`).join(", ")} — weave gentle practice opportunities naturally.`
    : "";

  const turnCount = Math.max(0, Number(body?.userTurnCount ?? history.filter((h) => h.role === "user").length));
  let reply = await aiReply(scenario, level, history, message, memoryLine);
  const engine: "ai" | "scripted" = reply ? "ai" : "scripted";
  if (!reply) reply = scriptedReply(scenario, turnCount);

  // Target-phrase coaching: which scenario phrases did the learner attempt?
  const lower = message.toLowerCase();
  const usedPhrases = scenario.targetPhrases.filter((p) => lower.includes(p.toLowerCase()));
  if (message.split(/\s+/).length >= 6) {
    await query(
      `INSERT INTO learning_events (id, learner_id, event_type, payload) VALUES ($1, $2, $3, $4::jsonb)`,
      [crypto.randomUUID(), user.learnerId, "roleplay.turn", JSON.stringify({ scenarioId: scenario.id, words: message.split(/\s+/).length, usedTargetPhrases: usedPhrases.length })],
    ).catch(() => undefined);
  }

  return NextResponse.json({
    reply,
    engine,
    usedTargetPhrases: usedPhrases,
    targetPhrases: scenario.targetPhrases,
  });
}

import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { estimateRetention } from "@/src/domain/retention-model";
import { query } from "@/src/infrastructure/database";
import { currentUser } from "@/src/infrastructure/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const result = await query(
    "SELECT id, skill, prompt, answer, interval_days, ease, repetitions, due_at, COALESCE(updated_at, created_at) AS last_reviewed_at FROM review_cards WHERE learner_id=$1 ORDER BY due_at ASC LIMIT 20",
    [user.learnerId],
  );
  const cards = result.rows.map((card) => ({
    ...card,
    retention: estimateRetention({ lastReviewedAt: card.last_reviewed_at, intervalDays: Number(card.interval_days), ease: Number(card.ease), repetitions: Number(card.repetitions) }),
  }));
  return NextResponse.json({ cards, retention: cards.length ? cards.reduce((sum, card) => sum + card.retention.probability, 0) / cards.length : null });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { cardId?: string; quality?: number } | null;
  const cardIdValue = body?.cardId;
  const qualityValue = body?.quality;
  if (typeof cardIdValue !== "string" || typeof qualityValue !== "number" || !Number.isInteger(qualityValue) || qualityValue < 0 || qualityValue > 5) {
    return NextResponse.json({ error: "cardId and quality (0-5) are required." }, { status: 400 });
  }
  const cardId: string = cardIdValue;
  const quality: number = qualityValue;
  const card = await query("SELECT id, interval_days, ease, repetitions FROM review_cards WHERE id=$1 AND learner_id=$2", [cardId, user.learnerId]);
  if (card.rows.length === 0) return NextResponse.json({ error: "Review card not found." }, { status: 404 });
  const current = card.rows[0] as { interval_days: number; ease: number; repetitions: number };
  let repetitions = Number(current.repetitions);
  let intervalDays = Number(current.interval_days);
  let ease = Number(current.ease);
  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    repetitions += 1;
    intervalDays = repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.max(1, Math.round(intervalDays * ease));
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }
  const due = new Date(Date.now() + intervalDays * 86400000).toISOString();
  await query("UPDATE review_cards SET interval_days=$1,ease=$2,repetitions=$3,due_at=$4,updated_at=NOW() WHERE id=$5 AND learner_id=$6", [intervalDays, ease, repetitions, due, cardId, user.learnerId]);
  await query("INSERT INTO learning_events (id, learner_id, event_type, payload) VALUES ($1,$2,$3,$4::jsonb)", [randomUUID(), user.learnerId, "review.completed", JSON.stringify({ cardId, quality, intervalDays, dueAt: due })]);
  const retention = estimateRetention({ lastReviewedAt: new Date(), intervalDays, ease, repetitions });
  return NextResponse.json({ cardId, intervalDays, ease, repetitions, dueAt: due, retention });
}

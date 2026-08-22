import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const cards = await query<{ skill: string; prompt: string; answer: string | null; interval_days: number; ease: string; repetitions: number; due_at: Date }>(
    `SELECT skill, prompt, answer, interval_days, ease::text, repetitions, due_at
     FROM review_cards WHERE learner_id = $1 ORDER BY due_at ASC`,
    [session.learnerId],
  );

  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const lines = ["#separator:Comma", "#html:false", "#tags column:5", "#columns:front,back,tags,due,interval"];
  for (const c of cards.rows) {
    lines.push([esc(c.prompt), esc(c.answer ?? ""), esc(`english-wizard ${c.skill}`), esc(new Date(c.due_at).toISOString().slice(0, 10)), esc(c.interval_days)].join(","));
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="english-wizard-review-deck.csv"`,
    },
  });
}

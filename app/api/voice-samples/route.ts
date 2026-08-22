import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

interface SampleRow { id: string; prompt: string; transcript: string | null; audio_data_url: string; duration_ms: number | null; created_at: Date }

const MAX_CHARS = 2_400_000; // ~1.8 MB binary as base64

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid sample id." }, { status: 400 });
    const one = await query<SampleRow>(`SELECT id, prompt, transcript, audio_data_url, duration_ms, created_at FROM voice_samples WHERE id = $1 AND learner_id = $2`, [id, user.learnerId]);
    const row = one.rows[0];
    if (!row) return NextResponse.json({ error: "Sample not found." }, { status: 404 });
    return NextResponse.json({
      sample: { id: row.id, prompt: row.prompt, transcript: row.transcript, durationMs: row.duration_ms, createdAt: new Date(row.created_at).toISOString(), audioDataUrl: row.audio_data_url },
    });
  }

  const list = await query<Omit<SampleRow, "audio_data_url">>(
    `SELECT id, prompt, transcript, duration_ms, created_at FROM voice_samples WHERE learner_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [user.learnerId],
  );
  return NextResponse.json({
    samples: list.rows.map((row) => ({ id: row.id, prompt: row.prompt, transcript: row.transcript, durationMs: row.duration_ms, createdAt: new Date(row.created_at).toISOString() })),
  });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { prompt?: string; transcript?: string; audioDataUrl?: string; durationMs?: number } | null;
  if (!body?.prompt || typeof body.prompt !== "string") return NextResponse.json({ error: "A calibration prompt is required." }, { status: 400 });
  if (!body.audioDataUrl || typeof body.audioDataUrl !== "string" || !body.audioDataUrl.startsWith("data:audio/")) {
    return NextResponse.json({ error: "A recorded audio data URL is required." }, { status: 400 });
  }
  if (body.audioDataUrl.length > MAX_CHARS) return NextResponse.json({ error: "Recording too long — keep it under two minutes." }, { status: 413 });

  const inserted = await query<{ id: string }>(
    `INSERT INTO voice_samples (id, learner_id, prompt, transcript, audio_data_url, duration_ms)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [randomUUID(), user.learnerId, body.prompt.slice(0, 300), typeof body.transcript === "string" ? body.transcript.slice(0, 2000) : null, body.audioDataUrl, Number.isFinite(body.durationMs) ? Math.round(body.durationMs as number) : null],
  );
  return NextResponse.json({ ok: true, id: inserted.rows[0].id }, { status: 201 });
}

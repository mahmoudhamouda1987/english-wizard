import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { LEARNING_CHUNKS, COMMUNICATION_FUNCTIONS, classifyChunkKnowledge, getChunksForLevel, type ChunkKnowledge } from "@/src/domain/chunks";
import { getProfile } from "@/src/infrastructure/profile-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const profile = await getProfile(user.learnerId);
  const level = profile?.englishDna.overallLevel ?? profile?.targetLevel ?? "A1";
  const states = await query("SELECT chunk_id, knowledge, encounters, productive_attempts, successful_productions, last_seen_at, next_review_at FROM learner_chunk_states WHERE learner_id=$1 ORDER BY last_seen_at DESC", [user.learnerId]);
  return NextResponse.json({
    level,
    functions: COMMUNICATION_FUNCTIONS,
    chunks: getChunksForLevel(level as Parameters<typeof getChunksForLevel>[0]).map((chunk) => ({ ...chunk, state: states.rows.find((row) => row.chunk_id === chunk.id) ?? null })),
    total: LEARNING_CHUNKS.length,
  });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { chunkId?: string; productive?: boolean; success?: boolean } | null;
  if (!body?.chunkId || !LEARNING_CHUNKS.some((chunk) => chunk.id === body.chunkId)) {
    return NextResponse.json({ error: "A valid chunkId is required." }, { status: 400 });
  }
  const productive = body.productive === true;
  const success = body.success === true;
  const existing = await query("SELECT encounters, productive_attempts, successful_productions FROM learner_chunk_states WHERE learner_id=$1 AND chunk_id=$2", [user.learnerId, body.chunkId]);
  const current = existing.rows[0] as { encounters: number; productive_attempts: number; successful_productions: number } | undefined;
  const encounters = Number(current?.encounters ?? 0) + 1;
  const productiveAttempts = Number(current?.productive_attempts ?? 0) + (productive ? 1 : 0);
  const successfulProductions = Number(current?.successful_productions ?? 0) + (productive && success ? 1 : 0);
  const knowledge: ChunkKnowledge = classifyChunkKnowledge({ encounters, productiveAttempts, successfulProductions });
  const nextReviewAt = new Date(Date.now() + (knowledge === "PRODUCTIVE" ? 7 : 2) * 86400000).toISOString();
  await query(
    `INSERT INTO learner_chunk_states (learner_id, chunk_id, knowledge, encounters, productive_attempts, successful_productions, last_seen_at, next_review_at)
     VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7)
     ON CONFLICT (learner_id, chunk_id) DO UPDATE SET knowledge=EXCLUDED.knowledge, encounters=EXCLUDED.encounters, productive_attempts=EXCLUDED.productive_attempts, successful_productions=EXCLUDED.successful_productions, last_seen_at=NOW(), next_review_at=EXCLUDED.next_review_at`,
    [user.learnerId, body.chunkId, knowledge, encounters, productiveAttempts, successfulProductions, nextReviewAt],
  );
  return NextResponse.json({ chunkId: body.chunkId, knowledge, encounters, productiveAttempts, successfulProductions, nextReviewAt }, { status: 201 });
}

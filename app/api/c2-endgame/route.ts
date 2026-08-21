import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import {
  C2_ENDGAME_STAGES,
  completeC2EndgameStage,
  initialC2EndgameState,
  isC2EndgameComplete,
  type C2EndgameState,
} from "@/src/domain/c2-endgame";
import type { EvidenceModality } from "@/src/domain/learning-evidence";

export const dynamic = "force-dynamic";
const MISSION_ID = "c2-live-in-english";

type C2StageResponse = {
  responseId: string;
  learnerId: string;
  missionId: typeof MISSION_ID;
  stageId: string;
  modality: EvidenceModality;
  response: string;
  linkedEvidenceIds: string[];
  createdAt: string;
};

async function readLatestState(learnerId: string) {
  return query<{ payload: C2EndgameState }>(
    `SELECT payload FROM learning_events WHERE learner_id=$1 AND event_type='C2_ENDGAME_RUNTIME' ORDER BY occurred_at DESC LIMIT 1`,
    [learnerId],
  );
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const result = await readLatestState(user.learnerId);
  const state = result.rows[0]?.payload ?? initialC2EndgameState();
  const stage = C2_ENDGAME_STAGES[state.stageIndex];
  return NextResponse.json({ missionId: MISSION_ID, state, stage: stage ?? null, complete: isC2EndgameComplete(state) });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    response?: unknown;
    modality?: unknown;
    evidenceIds?: unknown;
  } | null;
  const responseText = typeof body?.response === "string" ? body.response.trim() : "";
  const modality = body?.modality as EvidenceModality | undefined;
  const evidenceIds = Array.isArray(body?.evidenceIds) ? body.evidenceIds.map(String).filter(Boolean) : [];

  if (responseText.length < 20) return NextResponse.json({ error: "A substantive stage response is required." }, { status: 400 });
  if (!modality || !["READING", "LISTENING", "SPEAKING", "WRITING", "MEDIATION"].includes(modality)) {
    return NextResponse.json({ error: "A valid evidence modality is required." }, { status: 400 });
  }

  const result = await readLatestState(user.learnerId);
  const state = result.rows[0]?.payload ?? initialC2EndgameState();
  const stage = C2_ENDGAME_STAGES[state.stageIndex];
  if (!stage) return NextResponse.json({ missionId: MISSION_ID, state, complete: true });

  if (evidenceIds.length > 0) {
    const linked = await query<{ id: string }>(
      `SELECT payload->>'id' AS id FROM learning_events WHERE learner_id=$1 AND event_type='LEARNING_EVIDENCE' AND payload->>'id' = ANY($2::text[])`,
      [user.learnerId, evidenceIds],
    );
    if (linked.rows.length !== new Set(evidenceIds).size) {
      return NextResponse.json({ error: "One or more linked evidence records do not belong to this learner." }, { status: 400 });
    }
  }

  const now = new Date().toISOString();
  const responseEvent: C2StageResponse = {
    responseId: randomUUID(),
    learnerId: user.learnerId,
    missionId: MISSION_ID,
    stageId: stage.id,
    modality,
    response: responseText,
    linkedEvidenceIds: evidenceIds,
    createdAt: now,
  };
  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1,$2,'C2_STAGE_RESPONSE',$3::jsonb,$4)`,
    [responseEvent.responseId, user.learnerId, JSON.stringify(responseEvent), now],
  );

  const criteriaEvidence = Object.fromEntries(stage.successCriteria.map((criterion) => [criterion, 1]));
  const next = completeC2EndgameStage(state, stage.id, criteriaEvidence, now);
  next.evidence[`stage-response:${stage.id}`] = 1;
  if (evidenceIds.length) next.evidence[`linked-evidence:${stage.id}`] = evidenceIds.length;

  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1,$2,'C2_ENDGAME_RUNTIME',$3::jsonb,$4)`,
    [randomUUID(), user.learnerId, JSON.stringify(next), now],
  );

  return NextResponse.json({
    missionId: MISSION_ID,
    state: next,
    stage: C2_ENDGAME_STAGES[next.stageIndex] ?? null,
    complete: isC2EndgameComplete(next),
    responseId: responseEvent.responseId,
  }, { status: 201 });
}

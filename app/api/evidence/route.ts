import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { getLearnerState, saveLearnerState } from "@/src/infrastructure/learner-repository";
import { applyEvidenceToMastery, buildMasteryGraph, MASTERY_GRAPH_NODES } from "@/src/domain/mastery-graph";
import { buildEvidence, summarizeEvidence, type LearningEvidence } from "@/src/domain/learning-evidence";

export const dynamic = "force-dynamic";

function resolveCapabilityIds(evidence: LearningEvidence): string[] {
  const direct = evidence.capabilityIds.filter((id) => MASTERY_GRAPH_NODES.some((node) => node.id === id));
  if (direct.length) return direct;
  return MASTERY_GRAPH_NODES.filter((node) => node.learningObjectives.includes(evidence.objectiveId)).map((node) => node.id);
}

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const result = await query<{ payload: LearningEvidence }>(
    `SELECT payload FROM learning_events WHERE learner_id = $1 AND event_type = 'LEARNING_EVIDENCE' ORDER BY occurred_at DESC LIMIT 100`,
    [session.learnerId],
  );
  const evidence = result.rows.map((row) => row.payload);
  return NextResponse.json({ evidence, summary: summarizeEvidence(evidence) });
}

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as Partial<LearningEvidence> | null;
  if (!body?.sessionType || !body?.missionId || !body?.objectiveId || !body?.modality || !body?.outcome || !body?.level) {
    return NextResponse.json({ error: "sessionType, missionId, objectiveId, modality, outcome and level are required." }, { status: 400 });
  }

  const evidence = buildEvidence({
    id: randomUUID(),
    learnerId: session.learnerId,
    sessionType: body.sessionType,
    missionId: body.missionId,
    objectiveId: body.objectiveId,
    capabilityIds: body.capabilityIds ?? [],
    modality: body.modality,
    outcome: body.outcome,
    score: typeof body.score === "number" ? body.score : 0,
    confidence: typeof body.confidence === "number" ? body.confidence : 0,
    level: body.level,
    context: body.context ?? "FAMILIAR",
    errorTags: body.errorTags ?? [],
    createdAt: new Date().toISOString(),
  });

  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1, $2, 'LEARNING_EVIDENCE', $3::jsonb, $4)`,
    [evidence.id, session.learnerId, JSON.stringify(evidence), evidence.createdAt],
  );
  await query(
    `INSERT INTO evidence_records (id, learner_id, source_type, skill, objective_id, evidence, score, transfer, occurred_at) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)`,
    [evidence.id, session.learnerId, evidence.sessionType, evidence.modality, evidence.objectiveId, JSON.stringify(evidence), evidence.score, evidence.context === "TRANSFER", evidence.createdAt],
  );

  const state = await getLearnerState(session.learnerId);
  if (state) {
    const currentGraph = state.masteryGraph?.length
      ? {
          version: 1 as const,
          nodes: MASTERY_GRAPH_NODES,
          edges: MASTERY_GRAPH_NODES.flatMap((node) => node.prerequisites.map((from) => ({ from, to: node.id, relation: "prerequisite" as const }))),
          mastery: state.masteryGraph,
        }
      : buildMasteryGraph(evidence.createdAt);
    const capabilityIds = resolveCapabilityIds(evidence);
    const nextGraph = capabilityIds.length
      ? applyEvidenceToMastery(currentGraph, {
          capabilityIds,
          score: evidence.score,
          confidence: evidence.confidence,
          context: evidence.context,
          occurredAt: evidence.createdAt,
        })
      : currentGraph;

    const nextSkillMastery = [...state.mastery];
    for (const graphItem of nextGraph.mastery.filter((item) => capabilityIds.includes(item.capabilityId))) {
      const node = MASTERY_GRAPH_NODES.find((item) => item.id === graphItem.capabilityId);
      if (!node) continue;
      const nextItem = {
        skill: node.skill,
        level: node.level,
        score: graphItem.score,
        confidence: graphItem.confidence,
        evidenceCount: graphItem.evidenceCount,
        updatedAt: evidence.createdAt,
      };
      const index = nextSkillMastery.findIndex((item) => item.skill === node.skill);
      const current = index >= 0 ? nextSkillMastery[index] : undefined;
      if (!current || graphItem.score >= current.score) {
        if (index >= 0) nextSkillMastery[index] = nextItem;
        else nextSkillMastery.push(nextItem);
      }
    }
    await saveLearnerState({
      ...state,
      mastery: nextSkillMastery,
      masteryGraph: nextGraph.mastery,
      version: state.version + 1,
      updatedAt: evidence.createdAt,
    });
  }

  return NextResponse.json({ evidence, masteryUpdated: Boolean(state), status: "recorded" }, { status: 201 });
}

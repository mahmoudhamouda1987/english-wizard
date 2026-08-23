import { NextResponse } from "next/server";
import { createInitialLearnerState } from "@/src/domain/learner-factory";
import { recommendNextAction } from "@/src/domain/next-action";
import { healLearnerStateForCurriculum, type CurriculumRef } from "@/src/domain/curriculum-heal";
import { MVP_LESSONS } from "@/src/domain/curriculum";
import { getLearnerState, saveLearnerState } from "@/src/infrastructure/learner-repository";
import { currentUser } from "@/src/infrastructure/auth";

export const dynamic = "force-dynamic";

const CURRICULUM: CurriculumRef[] = MVP_LESSONS.map(({ id, objectiveId }) => ({ id, objectiveId }));

async function currentState(learnerId: string) {
  const existing = await getLearnerState(learnerId);
  if (!existing) return await saveLearnerState(createInitialLearnerState(learnerId));
  const healed = healLearnerStateForCurriculum(existing, CURRICULUM);
  return healed ? await saveLearnerState(healed) : existing;
}

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const state = await currentState(session.learnerId);
  return NextResponse.json({ state: { ...state, nextAction: recommendNextAction(state) } }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const existing = await getLearnerState(session.learnerId);
  if (existing && !healLearnerStateForCurriculum(existing, CURRICULUM)) {
    return NextResponse.json({ state: { ...existing, nextAction: recommendNextAction(existing) }, created: false }, { headers: { "Cache-Control": "no-store" } });
  }
  const state = await currentState(session.learnerId);
  return NextResponse.json({ state: { ...state, nextAction: recommendNextAction(state) }, created: !existing }, { headers: { "Cache-Control": "no-store" }, status: existing ? 200 : 201 });
}

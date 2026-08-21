import { NextResponse } from "next/server";
import { createInitialLearnerState } from "@/src/domain/learner-factory";
import { recommendNextAction } from "@/src/domain/next-action";
import { getLearnerState, saveLearnerState } from "@/src/infrastructure/learner-repository";
import { currentUser } from "@/src/infrastructure/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const existing = await getLearnerState(session.learnerId);
  if (existing) {
    return NextResponse.json({ state: { ...existing, nextAction: recommendNextAction(existing) } });
  }
  const state = await saveLearnerState(createInitialLearnerState(session.learnerId));
  return NextResponse.json({ state: { ...state, nextAction: recommendNextAction(state) }, created: true });
}

export async function POST() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const existing = await getLearnerState(session.learnerId);
  if (existing) return NextResponse.json({ state: { ...existing, nextAction: recommendNextAction(existing) }, created: false });
  const state = await saveLearnerState(createInitialLearnerState(session.learnerId));
  return NextResponse.json({ state: { ...state, nextAction: recommendNextAction(state) }, created: true }, { status: 201 });
}

import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { Skill } from "@/src/domain/learner";
import { stateForEvidence } from "@/src/domain/mastery-graph";
import { buildErrorIntelligence } from "@/src/domain/error-intelligence";
import { getLearnerState, saveLearnerState } from "@/src/infrastructure/learner-repository";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";

const skills: Skill[] = ["reading", "listening", "writing", "speaking", "grammar", "vocabulary", "pronunciation"];
type PracticeBody = { skill?: string; objectiveId?: string; correct?: boolean; lessonId?: string; evidenceId?: string; prompt?: string; answer?: string };

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = await request.json().catch(() => null) as PracticeBody | null;
  if (!parsed || typeof parsed !== "object") return NextResponse.json({ error: "A JSON request body is required." }, { status: 400 });
  const body = parsed;
  const skillValue = typeof body.skill === "string" ? body.skill : "";
  const objectiveId = typeof body.objectiveId === "string" ? body.objectiveId.trim() : "";
  if (!skills.includes(skillValue as Skill) || !objectiveId) return NextResponse.json({ error: "skill and objectiveId are required." }, { status: 400 });
  const skill = skillValue as Skill;
  const state = await getLearnerState(user.learnerId);
  if (!state) return NextResponse.json({ error: "Learner not found." }, { status: 404 });
  const now = new Date().toISOString();
  const previous = state.mastery.find((item) => item.skill === skill);
  const previousScore = previous?.score ?? 0;
  const score = body.correct ? Math.min(100, Math.round(previousScore * 0.7 + 30)) : Math.max(0, Math.round(previousScore * 0.8));
  const evidenceCount = (previous?.evidenceCount ?? 0) + 1;
  const mastery = [...state.mastery.filter((item) => item.skill !== skill), {
    skill,
    level: previous?.level ?? "A1",
    score,
    confidence: Math.min(1, (previous?.confidence ?? 0.4) + 0.05),
    uncertainty: Math.max(0, 1 - Math.min(1, (previous?.confidence ?? 0.4) + 0.05)),
    evidenceCount,
    updatedAt: now,
  }];

  const errorId = `${skill}:${objectiveId}`;
  const existing = state.errors.find((item) => item.id === errorId);
  const errors = body.correct
    ? state.errors.map((item) => {
        if (item.id !== errorId) return item;
        if (item.status === "improving") return { ...item, status: "resolved" as const, lastSeenAt: now, reviewAt: undefined, intervention: undefined };
        return { ...item, status: "improving" as const, lastSeenAt: now };
      })
    : [...state.errors.filter((item) => item.id !== errorId), {
        id: errorId,
        skill,
        objectiveId,
        description: "Practice response needs reinforcement.",
        occurrences: (existing?.occurrences ?? 0) + 1,
        severity: score < 40 ? "high" as const : score < 70 ? "medium" as const : "low" as const,
        status: existing?.status === "resolved" || existing?.status === "improving" ? ("recurring" as const) : ("new" as const),
        lastSeenAt: now,
      }];

  const oldGraph = state.masteryGraph ?? [];
  const graphById = new Map(oldGraph.map((item) => [item.capabilityId, item]));
  const relatedCapability = [...graphById.keys()].find((id) => id.includes(objectiveId.replace(/[^a-z0-9]+/gi, "-")))
    ?? (skill === "grammar" ? "grammar.present-simple-routines" : skill === "speaking" ? "speaking.self-introduction" : skill === "writing" ? "writing.opinion-paragraph" : skill === "listening" ? "listening.main-idea-everyday" : skill === "pronunciation" ? "pronunciation.word-stress-foundation" : skill === "vocabulary" ? "lexicon.work-schedule" : undefined);
  if (relatedCapability) {
    const currentNode = graphById.get(relatedCapability);
    graphById.set(relatedCapability, {
      capabilityId: relatedCapability,
      state: stateForEvidence(score, evidenceCount, false),
      score,
      confidence: Math.min(0.99, (currentNode?.confidence ?? 0.3) + 0.08),
      evidenceCount,
      lastEvidenceAt: now,
      updatedAt: now,
    });
  }

  const errorIntelligence = state.errorIntelligence ?? [];
  const newIntelligence = !body.correct && errors.length
    ? buildErrorIntelligence(errors.find((item) => item.id === errorId) ?? errors[errors.length - 1], previous?.level ?? "A1", now, score)
    : undefined;
  const updatedErrorIntelligence = newIntelligence
    ? [...errorIntelligence.filter((item) => item.learnerErrorId !== newIntelligence.learnerErrorId), newIntelligence]
    : errorIntelligence;

  const history = body.lessonId ? state.lessonHistory.map((item) => item.lessonId === body.lessonId ? { ...item, attemptCount: item.attemptCount + 1, evidenceIds: [...item.evidenceIds, body.evidenceId ?? `evidence-${Date.now()}`], status: item.status === "not_started" ? "in_progress" as const : item.status, startedAt: item.startedAt ?? now } : item) : state.lessonHistory;
  const saved = await saveLearnerState({ ...state, mastery, masteryGraph: [...graphById.values()], errorIntelligence: updatedErrorIntelligence, errors, lessonHistory: history, version: state.version + 1, updatedAt: now });

  if (!body.correct) {
    const prompt = typeof body.prompt === "string" && body.prompt.trim() ? body.prompt.slice(0, 500) : `${skill} review: ${objectiveId}`;
    const answer = typeof body.answer === "string" ? body.answer.slice(0, 500) : null;
    const existingCard = await query("SELECT id FROM review_cards WHERE learner_id=$1 AND skill=$2 AND prompt=$3 LIMIT 1", [user.learnerId, skill, prompt]);
    if (existingCard.rows.length === 0) {
      await query("INSERT INTO review_cards (id, learner_id, skill, prompt, answer, due_at) VALUES ($1,$2,$3,$4,$5,$6)", [randomUUID(), user.learnerId, skill, prompt, answer, now]);
    } else {
      await query("UPDATE review_cards SET due_at=$1, updated_at=NOW() WHERE id=$2 AND learner_id=$3", [now, existingCard.rows[0].id, user.learnerId]);
    }
  }

  return NextResponse.json({ state: saved, score, masteryState: relatedCapability ? graphById.get(relatedCapability)?.state : undefined, errorIntelligence: newIntelligence ?? null, feedback: body.correct ? "Correct — your evidence has strengthened this skill." : "Not quite. This has been recorded as a review target and added to your spaced-review queue." });
}

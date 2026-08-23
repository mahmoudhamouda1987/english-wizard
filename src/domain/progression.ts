import type { LearnerState } from "./learner";

export interface LessonOutcome {
  lessonId: string;
  objectiveId: string;
  evidenceIds: string[];
  masteryUpdates: LearnerState["mastery"];
  errors: LearnerState["errors"];
  completedAt: string;
}

/**
 * Applies a completed lesson to learner state without resetting progress.
 * The next unfinished curriculum item is selected and activated immediately.
 */
export function completeLesson(
  state: LearnerState,
  outcome: LessonOutcome,
  curriculum: string[],
): LearnerState {
  const completed = new Set(state.completedLessonIds);
  completed.add(outcome.lessonId);

  const nextLessonId = curriculum.find((lessonId) => !completed.has(lessonId)) ?? null;
  const history = state.lessonHistory.map((lesson) => {
    if (lesson.lessonId === outcome.lessonId) {
      return { ...lesson, status: "completed" as const, completedAt: outcome.completedAt, evidenceIds: outcome.evidenceIds, attemptCount: lesson.attemptCount + 1 };
    }
    if (lesson.lessonId === nextLessonId && lesson.status === "not_started") {
      return { ...lesson, status: "in_progress" as const, startedAt: outcome.completedAt };
    }
    return lesson;
  });

  return {
    ...state,
    currentLessonId: nextLessonId,
    completedLessonIds: [...completed],
    lessonHistory: history,
    mastery: mergeMastery(state.mastery, outcome.masteryUpdates),
    errors: mergeErrors(state.errors, outcome.errors),
    nextAction: nextLessonId
      ? { type: "lesson", id: nextLessonId, reason: "Continue to the next unfinished curriculum lesson.", priority: "LOW" }
      : null,
    version: state.version + 1,
    updatedAt: outcome.completedAt,
  };
}

/**
 * Records a retry attempt when the production score does not meet the lesson's
 * mastery threshold. The lesson stays current, evidence is kept, and the next
 * action tells the learner exactly what score is still needed.
 */
export function recordLessonRetry(
  state: LearnerState,
  outcome: Pick<LessonOutcome, "lessonId" | "evidenceIds" | "completedAt">,
  requiredScore: number,
): LearnerState {
  const history = state.lessonHistory.map((lesson) => {
    if (lesson.lessonId !== outcome.lessonId) return lesson;
    return {
      ...lesson,
      status: lesson.status === "completed" ? lesson.status : ("in_progress" as const),
      startedAt: lesson.startedAt ?? outcome.completedAt,
      attemptCount: lesson.attemptCount + 1,
      evidenceIds: [...lesson.evidenceIds, ...outcome.evidenceIds].slice(0, 50),
    };
  });
  const hasRecord = history.some((lesson) => lesson.lessonId === outcome.lessonId);
  return {
    ...state,
    currentLessonId: state.currentLessonId ?? outcome.lessonId,
    lessonHistory: hasRecord ? history : [...history, { lessonId: outcome.lessonId, objectiveId: "", status: "in_progress" as const, startedAt: outcome.completedAt, attemptCount: 1, evidenceIds: [...outcome.evidenceIds] }],
    nextAction: { type: "lesson", id: outcome.lessonId, reason: `Not cleared yet — reach ${requiredScore}% on this lesson's production task to advance.`, priority: "MEDIUM" },
    version: state.version + 1,
    updatedAt: outcome.completedAt,
  };
}

function mergeMastery(current: LearnerState["mastery"], updates: LearnerState["mastery"]) {
  const bySkill = new Map(current.map((item) => [item.skill, item]));
  for (const update of updates) bySkill.set(update.skill, update);
  return [...bySkill.values()];
}

function mergeErrors(current: LearnerState["errors"], updates: LearnerState["errors"]) {
  const byId = new Map(current.map((item) => [item.id, item]));
  for (const update of updates) {
    const existing = byId.get(update.id);
    byId.set(update.id, existing ? { ...existing, ...update, occurrences: Math.max(existing.occurrences, update.occurrences) } : update);
  }
  return [...byId.values()];
}

import type { LearnerState } from "./learner";

export interface CurriculumRef {
  id: string;
  objectiveId: string;
}

export function healLearnerStateForCurriculum(
  state: LearnerState,
  curriculum: CurriculumRef[],
  now = new Date().toISOString(),
): LearnerState | null {
  const validIds = new Set(curriculum.map((lesson) => lesson.id));
  if (curriculum.length === 0) return null;
  const completed = state.completedLessonIds.filter((id) => validIds.has(id));
  const staleCurrent = !state.currentLessonId || !validIds.has(state.currentLessonId);
  const staleHistory = state.lessonHistory.length !== curriculum.length || state.lessonHistory.some((record) => !validIds.has(record.lessonId));
  const staleCompleted = completed.length !== state.completedLessonIds.length;
  if (!staleCurrent && !staleHistory && !staleCompleted) return null;

  const completedSet = new Set(completed);
  const next = curriculum.find((lesson) => !completedSet.has(lesson.id)) ?? null;
  const previousById = new Map(state.lessonHistory.map((record) => [record.lessonId, record]));
  const lessonHistory = curriculum.map((lesson) => {
    const previous = previousById.get(lesson.id);
    const status = completedSet.has(lesson.id)
      ? ("completed" as const)
      : lesson.id === next?.id
        ? ("in_progress" as const)
        : ("not_started" as const);
    return {
      lessonId: lesson.id,
      objectiveId: lesson.objectiveId,
      status,
      ...(status === "completed" ? { completedAt: previous?.completedAt ?? now } : {}),
      ...(status === "in_progress" ? { startedAt: previous?.startedAt ?? now } : {}),
      attemptCount: previous?.attemptCount ?? 0,
      evidenceIds: [...(previous?.evidenceIds ?? [])],
    };
  });

  return {
    ...state,
    currentLessonId: next?.id ?? null,
    completedLessonIds: [...completedSet],
    lessonHistory,
    nextAction: next
      ? { type: "lesson", id: next.id, reason: "Your learning path was updated — continue with your current lesson.", priority: "LOW" }
      : null,
    version: state.version + 1,
    updatedAt: now,
  };
}

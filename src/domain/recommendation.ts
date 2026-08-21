import type { LearnerState } from "./learner";
import type { CurriculumLesson } from "./curriculum";

export interface Recommendation {
  type: "lesson" | "review" | "assessment";
  id: string;
  reason: string;
}

export function nextBestAction(state: LearnerState, lessons: CurriculumLesson[]): Recommendation | null {
  const completed = new Set(state.completedLessonIds);

  const highSeverityError = [...state.errors]
    .filter((error) => error.severity === "high" && error.occurrences >= 2)
    .sort((a, b) => b.occurrences - a.occurrences)[0];

  if (highSeverityError) {
    return {
      type: "review",
      id: highSeverityError.objectiveId,
      reason: `Review recurring ${highSeverityError.skill} difficulty before introducing a new capability.`,
    };
  }

  const next = [...lessons]
    .sort((a, b) => a.sequence - b.sequence)
    .find((lesson) => !completed.has(lesson.id));

  if (!next) return null;

  return {
    type: "lesson",
    id: next.id,
    reason: state.currentLessonId === next.id
      ? "Continue the learner's current next-best lesson."
      : "Select the earliest incomplete lesson compatible with the current path.",
  };
}

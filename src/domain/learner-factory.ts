import { ALL_LESSONS } from "./all-lessons";
import { buildMasteryGraph } from "./mastery-graph";
import type { LearnerState } from "./learner";

export function createInitialLearnerState(learnerId: string, now = new Date().toISOString()): LearnerState {
  const lessons = [...ALL_LESSONS].sort((a, b) => a.sequence - b.sequence);
  const first = lessons[0];
  const graph = buildMasteryGraph(now);

  return {
    learnerId,
    currentLessonId: first?.id ?? null,
    completedLessonIds: [],
    lessonHistory: lessons.map((lesson, index) => ({
      lessonId: lesson.id,
      objectiveId: lesson.objectiveId,
      status: index === 0 ? "in_progress" : "not_started",
      ...(index === 0 ? { startedAt: now } : {}),
      attemptCount: 0,
      evidenceIds: [],
    })),
    mastery: [],
    masteryGraph: graph.mastery,
    errorIntelligence: [],
    errors: [],
    nextAction: first ? { type: "lesson", id: first.id, reason: "Begin with the first curriculum lesson.", priority: "LOW" } : null,
    version: 1,
    updatedAt: now,
  };
}

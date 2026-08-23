import { describe, expect, it } from "vitest";
import { completeLesson, recordLessonRetry } from "./progression";
import type { LearnerState } from "./learner";

const baseState: LearnerState = {
  learnerId: "test-learner",
  currentLessonId: "lesson-1",
  completedLessonIds: [],
  lessonHistory: [{ lessonId: "lesson-1", objectiveId: "obj-1", status: "in_progress", attemptCount: 1, evidenceIds: [] }],
  mastery: [],
  errors: [],
  nextAction: { type: "lesson", id: "lesson-1", reason: "Continue the current lesson.", priority: "LOW" },
  version: 1,
  updatedAt: "2026-08-15T00:00:00.000Z",
};

describe("lesson progression", () => {
  it("records completion and advances to the next incomplete lesson", () => {
    const result = completeLesson(
      baseState,
      { lessonId: "lesson-1", objectiveId: "obj-1", evidenceIds: ["e1"], masteryUpdates: [], errors: [], completedAt: "2026-08-15T01:00:00.000Z" },
      ["lesson-1", "lesson-2", "lesson-3"],
    );

    expect(result.completedLessonIds).toContain("lesson-1");
    expect(result.currentLessonId).toBe("lesson-2");
    expect(result.nextAction).toEqual({ type: "lesson", id: "lesson-2", reason: "Continue to the next unfinished curriculum lesson.", priority: "LOW" });
    expect(result.lessonHistory[0].status).toBe("completed");
  });

  it("does not loop back to a completed lesson", () => {
    const state = { ...baseState, completedLessonIds: ["lesson-1", "lesson-2"] };
    const result = completeLesson(
      state,
      { lessonId: "lesson-1", objectiveId: "obj-1", evidenceIds: ["e1"], masteryUpdates: [], errors: [], completedAt: "2026-08-15T01:00:00.000Z" },
      ["lesson-1", "lesson-2", "lesson-3"],
    );

    expect(result.currentLessonId).toBe("lesson-3");
  });

  it("ends the sequence cleanly when all lessons are complete", () => {
    const state = { ...baseState, completedLessonIds: ["lesson-1", "lesson-2"] };
    const result = completeLesson(
      state,
      { lessonId: "lesson-1", objectiveId: "obj-1", evidenceIds: [], masteryUpdates: [], errors: [], completedAt: "2026-08-15T01:00:00.000Z" },
      ["lesson-1", "lesson-2"],
    );

    expect(result.currentLessonId).toBeNull();
    expect(result.nextAction).toBeNull();
  });
});

describe("mastery-gated retries", () => {
  it("keeps the lesson current and records the attempt without completing it", () => {
    const result = recordLessonRetry(
      baseState,
      { lessonId: "lesson-1", evidenceIds: ["ev-weak"], completedAt: "2026-08-15T02:00:00.000Z" },
      75,
    );

    expect(result.currentLessonId).toBe("lesson-1");
    expect(result.completedLessonIds).not.toContain("lesson-1");
    expect(result.lessonHistory[0]).toMatchObject({ lessonId: "lesson-1", status: "in_progress", attemptCount: 2, evidenceIds: ["ev-weak"] });
    expect(result.nextAction).toMatchObject({ type: "lesson", id: "lesson-1", priority: "MEDIUM" });
    expect(result.nextAction?.reason).toContain("75%");
    expect(result.version).toBe(2);
  });

  it("creates a history record when none exists yet", () => {
    const empty = { ...baseState, lessonHistory: [] };
    const result = recordLessonRetry(empty, { lessonId: "lesson-9", evidenceIds: ["e1"], completedAt: "2026-08-15T02:00:00.000Z" }, 80);

    expect(result.lessonHistory).toHaveLength(1);
    expect(result.lessonHistory[0]).toMatchObject({ lessonId: "lesson-9", status: "in_progress", attemptCount: 1 });
  });
});

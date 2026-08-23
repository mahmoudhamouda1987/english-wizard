import { describe, expect, it } from "vitest";
import { healLearnerStateForCurriculum } from "./curriculum-heal";
import type { LearnerState } from "./learner";

const CURRICULUM = [
  { id: "c-1", objectiveId: "obj-01" },
  { id: "c-2", objectiveId: "obj-02" },
  { id: "c-3", objectiveId: "obj-03" },
];

function stateWith(overrides: Partial<LearnerState>): LearnerState {
  return {
    learnerId: "test-learner",
    currentLessonId: "c-1",
    completedLessonIds: [],
    lessonHistory: CURRICULUM.map((lesson) => ({ lessonId: lesson.id, objectiveId: lesson.objectiveId, status: "not_started", attemptCount: 0, evidenceIds: [] })),
    mastery: [],
    errors: [],
    nextAction: { type: "lesson", id: "c-1", reason: "Begin.", priority: "LOW" },
    version: 7,
    updatedAt: "2026-08-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("curriculum healing", () => {
  it("returns null when the persisted state already matches the curriculum", () => {
    expect(healLearnerStateForCurriculum(stateWith({}), CURRICULUM)).toBeNull();
  });

  it("remaps a stale current lesson and legacy history onto the new curriculum", () => {
    const stale = stateWith({
      currentLessonId: "legacy-a1-self-intro",
      completedLessonIds: ["legacy-a1-self-intro"],
      lessonHistory: [
        { lessonId: "legacy-a1-self-intro", objectiveId: "old-obj", status: "completed", completedAt: "2026-07-01T00:00:00.000Z", attemptCount: 3, evidenceIds: ["ev-old"] },
      ],
    });

    const healed = healLearnerStateForCurriculum(stale, CURRICULUM);
    expect(healed).not.toBeNull();
    expect(healed!.currentLessonId).toBe("c-1");
    expect(healed!.completedLessonIds).toEqual([]);
    expect(healed!.lessonHistory).toHaveLength(3);
    expect(healed!.lessonHistory[0]).toMatchObject({ lessonId: "c-1", status: "in_progress", attemptCount: 0 });
    expect(healed!.lessonHistory[1].status).toBe("not_started");
    expect(healed!.nextAction).toMatchObject({ type: "lesson", id: "c-1", priority: "LOW" });
    expect(healed!.version).toBe(8);
  });

  it("keeps valid completions and resumes at the first unfinished lesson", () => {
    const partial = stateWith({
      currentLessonId: "c-2",
      completedLessonIds: ["c-1"],
      lessonHistory: [
        { lessonId: "c-1", objectiveId: "obj-01", status: "completed", completedAt: "2026-08-10T00:00:00.000Z", attemptCount: 2, evidenceIds: ["ev-1"] },
        { lessonId: "c-2", objectiveId: "obj-02", status: "in_progress", startedAt: "2026-08-11T00:00:00.000Z", attemptCount: 1, evidenceIds: [] },
        { lessonId: "c-3", objectiveId: "obj-03", status: "not_started", attemptCount: 0, evidenceIds: [] },
      ],
    });

    const healed = healLearnerStateForCurriculum(partial, CURRICULUM.filter((l) => l.id !== "c-3"));
    expect(healed).not.toBeNull();
    expect(healed!.currentLessonId).toBe("c-2");
    expect(healed!.completedLessonIds).toEqual(["c-1"]);
    const first = healed!.lessonHistory.find((record) => record.lessonId === "c-1");
    expect(first).toMatchObject({ status: "completed", completedAt: "2026-08-10T00:00:00.000Z", attemptCount: 2, evidenceIds: ["ev-1"] });
  });

  it("clears the pointer without a next action once every lesson is completed", () => {
    const done = stateWith({
      currentLessonId: null,
      completedLessonIds: CURRICULUM.map((lesson) => lesson.id),
      lessonHistory: CURRICULUM.map((lesson) => ({ lessonId: lesson.id, objectiveId: lesson.objectiveId, status: "completed" as const, attemptCount: 1, evidenceIds: [] })),
    });

    const healed = healLearnerStateForCurriculum(done, CURRICULUM);
    expect(healed).not.toBeNull();
    expect(healed!.currentLessonId).toBeNull();
    expect(healed!.nextAction).toBeNull();
    expect(healed!.lessonHistory.every((record) => record.status === "completed")).toBe(true);
  });
});

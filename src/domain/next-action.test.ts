import { describe, expect, it } from "vitest";
import { recommendNextAction } from "./next-action";
import type { LearnerState } from "./learner";

const baseState: LearnerState = {
  learnerId: "learner-1",
  currentLessonId: "lesson-1",
  completedLessonIds: [],
  lessonHistory: [],
  mastery: [
    { skill: "reading", level: "B1", score: 72, confidence: 0.8, updatedAt: "2026-08-20T00:00:00.000Z" },
    { skill: "listening", level: "B1", score: 48, confidence: 0.7, updatedAt: "2026-08-20T00:00:00.000Z" },
  ],
  errors: [],
  nextAction: null,
  version: 1,
  updatedAt: "2026-08-20T00:00:00.000Z",
};

describe("next action recommendation", () => {
  it("prioritizes a high-severity error", () => {
    const result = recommendNextAction({
      ...baseState,
      errors: [{ id: "e1", skill: "grammar", objectiveId: "grammar-tenses", description: "tense confusion", occurrences: 5, severity: "high", lastSeenAt: "2026-08-20T00:00:00.000Z" }],
    });
    expect(result.type).toBe("practice");
    expect(result.id).toBe("grammar-tenses");
    expect(result.priority).toBe("HIGH");
  });

  it("maps a weak listening area to listening work", () => {
    const result = recommendNextAction(baseState);
    expect(result.type).toBe("listening");
    expect(result.id).toBe("skill-listening");
  });

  it("continues an existing lesson when no urgent gap exists", () => {
    const result = recommendNextAction({
      ...baseState,
      mastery: [{ skill: "reading", level: "B1", score: 82, confidence: 0.9, updatedAt: "2026-08-20T00:00:00.000Z" }],
    });
    expect(result.type).toBe("lesson");
    expect(result.id).toBe("lesson-1");
  });
});

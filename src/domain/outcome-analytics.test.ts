import { describe, expect, it } from "vitest";
import { canAccess, DEFAULT_ENTITLEMENTS, outcomeSnapshots } from "./outcome-analytics";

const evidence = [
  { id: "e1", learnerId: "l1", sessionType: "STANDARD_JOURNEY" as const, missionId: "m", objectiveId: "o", capabilityIds: ["cap"], modality: "WRITING" as const, outcome: "PARTIAL" as const, score: 50, confidence: 0.7, level: "B1" as const, context: "UNFAMILIAR" as const, errorTags: [], createdAt: "2026-08-01T00:00:00.000Z" },
  { id: "e2", learnerId: "l1", sessionType: "STANDARD_JOURNEY" as const, missionId: "m", objectiveId: "o", capabilityIds: ["cap"], modality: "WRITING" as const, outcome: "CORRECT" as const, score: 90, confidence: 0.9, level: "B1" as const, context: "TRANSFER" as const, errorTags: [], createdAt: "2026-08-10T00:00:00.000Z" },
];

describe("outcome analytics", () => {
  it("calculates capability growth and transfer", () => {
    const [snapshot] = outcomeSnapshots("l1", evidence);
    expect(snapshot.scoreDelta).toBe(40);
    expect(snapshot.evidenceCount).toBe(2);
    expect(snapshot.transferRate).toBe(0.5);
  });

  it("enforces feature entitlements explicitly", () => {
    expect(canAccess(DEFAULT_ENTITLEMENTS, "AI_TEACHER")).toBe(true);
    expect(canAccess(DEFAULT_ENTITLEMENTS, "EXAM_PATHWAY")).toBe(false);
  });
});

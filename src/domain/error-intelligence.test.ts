import { describe, expect, it } from "vitest";
import { buildErrorIntelligence, classifyError } from "./error-intelligence";

describe("error intelligence", () => {
  it("classifies common grammar errors", () => {
    expect(classifyError("grammar", "present perfect verb form")).toBe("grammar");
    expect(classifyError("writing", "weak cohesion and linking")).toBe("coherence");
  });

  it("creates an intervention and review schedule for recurring errors", () => {
    const item = buildErrorIntelligence({
      id: "err-1",
      skill: "grammar",
      objectiveId: "a2-past-events",
      description: "Past tense verb form confusion",
      occurrences: 4,
      severity: "high",
      lastSeenAt: "2026-08-17T00:00:00.000Z",
    }, "A2", "2026-08-17T00:00:00.000Z", 35);
    expect(item.status).toBe("recurring");
    expect(item.confidence).toBeGreaterThan(0.5);
    expect(item.intervention.length).toBeGreaterThan(20);
    expect(item.reviewAt).not.toBe(item.lastSeenAt);
  });
});

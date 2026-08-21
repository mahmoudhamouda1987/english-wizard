import { describe, expect, it } from "vitest";
import { applyEvidenceToMastery, buildMasteryGraph, stateForEvidence } from "./mastery-graph";

describe("mastery graph", () => {
  it("creates prerequisite-linked capabilities across levels", () => {
    const graph = buildMasteryGraph("2026-08-17T00:00:00.000Z");
    expect(graph.nodes.length).toBeGreaterThan(5);
    expect(graph.edges.some((edge) => edge.relation === "prerequisite")).toBe(true);
    expect(graph.mastery).toHaveLength(graph.nodes.length);
  });

  it("does not call a single successful response mastery", () => {
    expect(stateForEvidence(80, 1, false)).toBe("RECALLED");
    expect(stateForEvidence(92, 2, false)).not.toBe("MASTERED");
    expect(stateForEvidence(92, 5, true)).toBe("MASTERED");
  });

  it("folds repeated evidence into capability score, confidence and state", () => {
    let graph = buildMasteryGraph("2026-08-17T00:00:00.000Z");
    for (let i = 0; i < 3; i += 1) {
      graph = applyEvidenceToMastery(graph, {
        capabilityIds: ["grammar.present-simple-routines"],
        score: 90,
        confidence: 0.8,
        context: "UNFAMILIAR",
        occurredAt: `2026-08-17T0${i}:00:00.000Z`,
      });
    }
    const item = graph.mastery.find((entry) => entry.capabilityId === "grammar.present-simple-routines")!;
    expect(item.evidenceCount).toBe(3);
    expect(item.score).toBe(72);
    expect(item.state).toBe("PRODUCED");
    expect(item.confidence).toBe(0.8);
  });
});

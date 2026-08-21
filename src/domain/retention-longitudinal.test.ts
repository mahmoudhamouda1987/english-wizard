import { describe, expect, it } from "vitest";
import { applyEvidenceToMastery, buildMasteryGraph, type CapabilityMastery, type MasteryGraph } from "./mastery-graph";
import { schedule } from "./spaced-repetition";

const DAY = 24 * 60 * 60 * 1000;
const CAPABILITY = "present-perfect-b1";

function graphWith(capabilityId: string): MasteryGraph {
  const base = buildMasteryGraph();
  const mastery: CapabilityMastery[] = base.mastery.some((item) => item.capabilityId === capabilityId)
    ? base.mastery
    : [...base.mastery, { capabilityId, state: "UNKNOWN", score: 0, confidence: 0, evidenceCount: 0, updatedAt: new Date().toISOString() }];
  return { ...base, mastery };
}

describe("longitudinal retention model (simulated 8-week learner)", () => {
  it("advances one capability from UNKNOWN through staged states across spaced weeks with monotonically rising scores", () => {
    let graph = graphWith(CAPABILITY);
    const timeline: Array<{ week: number; state: string; score: number }> = [];

    const evidencePlan: Array<{ week: number; score: number; confidence: number; context: "FAMILIAR" | "TRANSFER" }> = [
      { week: 0, score: 80, confidence: 0.9, context: "FAMILIAR" },
      { week: 1, score: 85, confidence: 0.95, context: "FAMILIAR" },
      { week: 2, score: 90, confidence: 0.95, context: "FAMILIAR" },
      { week: 4, score: 95, confidence: 0.95, context: "TRANSFER" },
    ];

    for (const step of evidencePlan) {
      graph = applyEvidenceToMastery(graph, {
        capabilityIds: [CAPABILITY],
        score: step.score,
        confidence: step.confidence,
        context: step.context,
        occurredAt: new Date(step.week * 7 * DAY).toISOString(),
      });
      const node = graph.mastery.find((item) => item.capabilityId === CAPABILITY);
      if (!node) throw new Error("capability missing from graph");
      timeline.push({ week: step.week, state: node.state, score: node.score });
    }

    expect(timeline[0].state).toBe("EXPOSED");
    expect(timeline[timeline.length - 1].state).toBe("USED_SPONTANEOUSLY");
    const states = timeline.map((event) => event.state);
    expect(states).toEqual(["EXPOSED", "PRODUCED", "USED_IN_CONTEXT", "USED_SPONTANEOUSLY"]);
    const scores = timeline.map((event) => event.score);
    for (let index = 1; index < scores.length; index += 1) {
      expect(scores[index]).toBeGreaterThan(scores[index - 1]);
    }
  });

  it("schedules SM-2 reviews at growing intervals that stay inside a two-quarter horizon", () => {
    let card = { id: "card-1", dueAt: new Date().toISOString(), intervalDays: 1, ease: 2.5, repetitions: 0 };
    const intervals: number[] = [];
    for (let round = 0; round < 6; round += 1) {
      card = schedule(card, 4);
      intervals.push(card.intervalDays);
    }
    expect(intervals.length).toBe(6);
    expect(intervals[0]).toBeLessThanOrEqual(intervals[intervals.length - 1]);
    expect(intervals.reduce((a, b) => a + b, 0)).toBeGreaterThan(30);
    expect(card.ease).toBeGreaterThanOrEqual(1.3);

    const lapsed = schedule({ ...card }, 1);
    expect(lapsed.intervalDays).toBe(1);
    expect(lapsed.repetitions).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { countActive, day7Retention, medianSessionsPerLearner, type ProductActivityRow } from "./product-analytics";

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_800_000_000_000;

function row(learnerId: string, ageDays: number): ProductActivityRow {
  return { learner_id: learnerId, occurred_at: new Date(NOW - ageDays * DAY) };
}

describe("product analytics", () => {
  it("counts distinct active learners within windows", () => {
    const rows = [row("a", 1), row("a", 2), row("b", 3), row("c", 20)];
    expect(countActive(rows, 7, NOW)).toBe(2);
    expect(countActive(rows, 30, NOW)).toBe(3);
    expect(countActive([], 7, NOW)).toBe(0);
  });

  it("computes median active days per learner", () => {
    const rows = [
      row("a", 1), row("a", 2), row("a", 3),
      row("b", 1),
    ];
    expect(medianSessionsPerLearner(rows, 30, NOW)).toBe(2);
  });

  it("returns null day-7 retention when no learner is old enough", () => {
    const registrations = new Map([["a", NOW - 2 * DAY]]);
    expect(day7Retention([row("a", 1)], registrations, NOW)).toBeNull();
  });

  it("computes day-7 retention for an eligible cohort", () => {
    const joined = NOW - 10 * DAY;
    const registrations = new Map([["returned", joined], ["churned", joined]]);
    const rows = [row("returned", 3)];
    expect(day7Retention(rows, registrations, NOW)).toBe(0.5);
  });
});

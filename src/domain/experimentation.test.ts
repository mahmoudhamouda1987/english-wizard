import { describe, expect, it } from "vitest";
import { assignVariant, canTransition, validateExperiment } from "./experimentation";

describe("experimentation", () => {
  it("allows only lifecycle-valid transitions", () => {
    expect(canTransition("DRAFT", "RUNNING")).toBe(true);
    expect(canTransition("RUNNING", "COMPLETED")).toBe(true);
    expect(canTransition("RUNNING", "STOPPED")).toBe(true);
    expect(canTransition("DRAFT", "COMPLETED")).toBe(false);
    expect(canTransition("COMPLETED", "RUNNING")).toBe(false);
    expect(canTransition("STOPPED", "RUNNING")).toBe(false);
  });

  it("assigns variants deterministically and always within the bucket set", () => {
    const experiment = { id: "exp-1", control: "control", variants: ["treatment-a", "treatment-b"] };
    const first = assignVariant("learner-1", experiment);
    expect(assignVariant("learner-1", experiment)).toBe(first);
    for (let index = 0; index < 50; index += 1) {
      expect(["control", "treatment-a", "treatment-b"]).toContain(assignVariant(`learner-${index}`, experiment));
    }
  });

  it("rejects invalid experiment definitions", () => {
    expect(validateExperiment({ name: "x" }).ok).toBe(false);
    expect(validateExperiment({ name: "valid name", hypothesis: "short" }).ok).toBe(false);
    expect(validateExperiment({ name: "valid name", hypothesis: "long enough hypothesis", control: "control" }).ok).toBe(false);
    expect(
      validateExperiment({ name: "valid name", hypothesis: "long enough hypothesis", control: "control", variants: ["treatment"], primaryLearningMetric: "RETENTION" }).ok,
    ).toBe(true);
  });

  it("requires unique variant names", () => {
    const result = validateExperiment({
      name: "valid name",
      hypothesis: "long enough hypothesis",
      control: "same",
      variants: ["same"],
      primaryLearningMetric: "RETENTION",
    });
    expect(result.ok).toBe(false);
  });
});

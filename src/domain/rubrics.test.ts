import { describe, expect, it } from "vitest";
import { rubricFor, rubricScoreFromBand } from "./rubrics";

const BANDS = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

describe("CEFR skill rubrics", () => {
  it("covers all four formal skills across every CEFR band", () => {
    for (const skill of ["speaking", "writing", "reading", "listening"] as const) {
      const rubric = rubricFor(skill);
      expect(rubric).toBeDefined();
      for (const band of BANDS) {
        expect(rubric?.[band].descriptor.length).toBeGreaterThan(20);
        expect(rubric?.[band].canDoExample.length).toBeGreaterThan(10);
      }
    }
  });

  it("keeps descriptors strictly increasing in demand across bands", () => {
    const scores = BANDS.map((band) => rubricScoreFromBand(band));
    for (let index = 1; index < scores.length; index += 1) {
      expect(scores[index]).toBeGreaterThan(scores[index - 1]);
    }
  });

  it("maps bands to monotonically increasing numeric scores", () => {
    expect(rubricScoreFromBand("Pre-A1")).toBeLessThan(rubricScoreFromBand("C2"));
  });
});

import { describe, it, expect } from "vitest";
import {
  FLUENCY_MODULES,
  modulesForBand,
  fluencyModuleById,
  fluencyEligibility,
  fluencyFeedbackBand,
} from "./fluency-track";

describe("Fluency Track curriculum (Parts 77-84)", () => {
  it("has exactly 16 signature modules", () => {
    expect(FLUENCY_MODULES).toHaveLength(16);
  });

  it("numbers modules 1-16 and keeps titles faithful to the contract", () => {
    expect(FLUENCY_MODULES.map((m) => m.number)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
    expect(fluencyModuleById("ft-1")?.title).toBe("Everyday Transactions & Small Talk");
    expect(fluencyModuleById("ft-16")?.title).toBe("Mastery Capstone: Spontaneous Eloquence");
  });

  it("distributes four modules per band B1-C2", () => {
    expect(modulesForBand("B1")).toHaveLength(4);
    expect(modulesForBand("B2")).toHaveLength(4);
    expect(modulesForBand("C1")).toHaveLength(4);
    expect(modulesForBand("C2")).toHaveLength(4);
  });

  it("every module has complete stage content: explanation, drills, both role-plays, checkpoint", () => {
    for (const m of FLUENCY_MODULES) {
      expect(m.explanation.principles.length).toBeGreaterThanOrEqual(3);
      expect(m.explanation.modelDialogue.length).toBeGreaterThanOrEqual(4);
      expect(m.drills.length).toBeGreaterThanOrEqual(3);
      expect(m.guidedRoleplay.persona.pressure).toBeLessThan(m.pressureRoleplay.persona.pressure);
      expect(m.guidedRoleplay.fallbacks.length).toBeGreaterThanOrEqual(4);
      expect(m.pressureRoleplay.complication).toBeTruthy();
      expect(m.checkpoint.criteria.length).toBeGreaterThanOrEqual(4);
      expect(m.checkpoint.feedbackBands.length).toBeGreaterThanOrEqual(3);
      expect(m.gymTieIn).toBeTruthy();
    }
  });

  it("gives guided and pressure role-plays distinct personas with rising pressure", () => {
    for (const m of FLUENCY_MODULES) {
      expect(m.guidedRoleplay.persona.name).not.toBe(m.pressureRoleplay.persona.name);
      expect(m.pressureRoleplay.persona.pressure).toBeGreaterThanOrEqual(2);
    }
  });

  it("covers both Business and Life tracks across the programme", () => {
    const tracks = new Set(FLUENCY_MODULES.map((m) => m.track));
    expect(tracks.has("BUSINESS")).toBe(true);
    expect(tracks.has("LIFE")).toBe(true);
    expect(tracks.has("DUAL")).toBe(true);
  });
});

describe("Fluency entry gate (Part 78)", () => {
  it("admits B1 and above", () => {
    for (const level of ["B1", "B2", "C1", "C2"]) {
      expect(fluencyEligibility(level).eligible).toBe(true);
    }
  });

  it("routes below-B1 learners to General English with a reason naming their target", () => {
    for (const level of ["Pre-A1", "A1", "A2"]) {
      const gate = fluencyEligibility(level);
      expect(gate.eligible).toBe(false);
      expect(gate.route).toBe("/general-english");
      expect(gate.reason).toContain(level);
    }
    expect(fluencyEligibility("A2").reason).toContain("B1");
  });

  it("sends unassessed learners to LevelCheck, never into the programme", () => {
    const gate = fluencyEligibility("Not assessed");
    expect(gate.eligible).toBe(false);
    expect(gate.route).toBe("/diagnostic");
  });
});

describe("Honest fluency feedback (Part 84)", () => {
  it("returns the top band only for full criteria completion", () => {
    const m = fluencyModuleById("ft-5")!;
    const top = m.checkpoint.feedbackBands[m.checkpoint.feedbackBands.length - 1];
    expect(fluencyFeedbackBand(m, m.checkpoint.criteria.length, m.checkpoint.criteria.length)).toBe(top);
  });

  it("returns a band, never a fabricated decimal score", () => {
    const m = fluencyModuleById("ft-9")!;
    const band = fluencyFeedbackBand(m, 2, 4);
    expect(m.checkpoint.feedbackBands).toContain(band);
  });
});

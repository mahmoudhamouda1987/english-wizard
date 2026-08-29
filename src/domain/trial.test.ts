import { describe, expect, it } from "vitest";
import { effectiveTrialStatus, generateSequentialStudentId, generateStudentId, trialEndsAt, trialView, TRIAL_DURATION_DAYS } from "./trial";

describe("trial domain", () => {
  it("computes a 7-day end time", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const end = trialEndsAt(start);
    expect(end.getTime() - start.getTime()).toBe(TRIAL_DURATION_DAYS * 86400000);
  });

  it("resolves ACTIVE only while col> now < endsAt, else EXPIRED", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const end = trialEndsAt(start);
    const record = { learnerId: "x", startedAt: start.toISOString(), endsAt: end.toISOString(), status: "ACTIVE" as const };
    expect(effectiveTrialStatus(record, new Date("2026-01-02T00:00:00Z"))).toBe("ACTIVE");
    expect(effectiveTrialStatus(record, new Date("2026-01-09T00:00:01Z"))).toBe("EXPIRED");
    expect(effectiveTrialStatus(null)).toBe("EXPIRED");
  });

  it("builds a countdown view with days/hours/fraction", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const end = trialEndsAt(start);
    const record = { learnerId: "x", startedAt: start.toISOString(), endsAt: end.toISOString(), status: "ACTIVE" as const };
    // Halfway through: 3.5 days elapsed of 7 -> remaining half.
    const mid = new Date("2026-01-04T12:00:00Z");
    const view = trialView(record, mid);
    expect(view.active).toBe(true);
    expect(view.daysLeft).toBe(3);
    expect(view.totalHours).toBe(168);
    expect(view.fractionRemaining).toBeCloseTo(0.5, 1);
  });

  it("returns an inactive view for expired or missing trials", () => {
    expect(trialView(null).active).toBe(false);
    const start = new Date("2026-01-01T00:00:00Z");
    const record = { learnerId: "x", startedAt: start.toISOString(), endsAt: trialEndsAt(start).toISOString(), status: "ACTIVE" as const };
    expect(trialView(record, new Date("2026-01-20T00:00:00Z")).active).toBe(false);
  });

  it("generates EW-YY-XXXXXX student IDs from an unambiguous alphabet", () => {
    expect(generateStudentId(new Date("2026-08-29T00:00:00Z"), () => 0)).toBe("EW-26-222222");
    expect(generateStudentId(new Date("2026-08-29T00:00:00Z"), () => 0.999999)).toMatch(/^EW-26-[A-Z2-9]{6}$/);
    const id = generateStudentId(new Date("2026-08-29T00:00:00Z"));
    expect(id).toMatch(/^EW-\d{2}-[A-Z2-9]{6}$/);
    expect(id).not.toContain("0");
    expect(id).not.toContain("O");
    expect(id).not.toContain("1");
    expect(id).not.toContain("I");
    expect(id).not.toContain("L");
  });

  it("keeps the legacy sequential scheme available for existing IDs", () => {
    expect(generateSequentialStudentId(2026, 42)).toBe("EW-2026-000042");
  });
});

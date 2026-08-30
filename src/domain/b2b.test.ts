import { describe, it, expect } from "vitest";
import {
  generateApiKey,
  hashApiKey,
  generateLinkToken,
  aggregateCohort,
  makeReportId,
} from "./b2b";

describe("B2B assessment architecture (Parts 94-96)", () => {
  it("issues API keys that verify by hash and never round-trip", () => {
    const { key, hash } = generateApiKey();
    expect(key.startsWith("ewb2b_")).toBe(true);
    expect(hashApiKey(key)).toBe(hash);
    expect(hash).not.toContain(key);
  });

  it("generates opaque link tokens distinct from each other", () => {
    const a = generateLinkToken();
    const b = generateLinkToken();
    expect(a).not.toBe(b);
    expect(a).not.toMatch(/^[0-9a-f-]{36}$/); // not a UUID — row ids stay private
  });

  it("aggregates cohort stats without exposing individuals", () => {
    const stats = aggregateCohort(
      [{ status: "COMPLETED" }, { status: "COMPLETED" }, { status: "OPEN" }],
      [
        { cefrLevel: "B2", skillProfile: { speaking: { level: "B2", percent: 70 }, writing: { level: "B1", percent: 50 } } },
        { cefrLevel: "B2", skillProfile: { speaking: { level: "B2", percent: 80 }, writing: { level: "B2", percent: 62 } } },
      ],
    );
    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(2);
    expect(stats.completionRate).toBe(67);
    expect(stats.levelDistribution["B2"]).toBe(2);
    expect(stats.weakestSkills[0].skill).toBe("writing");
  });

  it("produces stable verification report ids", () => {
    expect(makeReportId("assess-1")).toBe(makeReportId("assess-1"));
    expect(makeReportId("assess-2")).not.toBe(makeReportId("assess-1"));
    expect(makeReportId("assess-1")).toMatch(/^EW-[0-9A-F]{10}$/);
  });
});

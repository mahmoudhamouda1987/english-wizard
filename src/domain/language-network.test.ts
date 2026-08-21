import { describe, expect, it } from "vitest";
import { capabilityByLevel, getChunksForLevel } from "./language-network";

describe("language network", () => {
  it("separates receptive and productive chunk knowledge", async () => {
    const chunks = getChunksForLevel("B2");
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks.some((chunk) => chunk.receptive && !chunk.productive)).toBe(true);
    expect(chunks.some((chunk) => chunk.productive)).toBe(true);
  });

  it("progresses communication functions by level", () => {
    const a1 = capabilityByLevel("A1");
    const b2 = capabilityByLevel("B2");
    const c2 = capabilityByLevel("C2");
    expect(a1.map((item) => item.function)).toContain("INTRODUCE");
    expect(b2.map((item) => item.function)).toContain("PERSUADE");
    expect(c2.map((item) => item.function)).toContain("ARGUE");
  });
});

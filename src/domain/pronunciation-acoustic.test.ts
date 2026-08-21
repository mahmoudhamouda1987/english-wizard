import { describe, expect, it } from "vitest";
import { assessAcousticPronunciation } from "./pronunciation-acoustic";

describe("assessAcousticPronunciation", () => {
  it("returns bounded evidence-backed signals", () => {
    const result = assessAcousticPronunciation({
      durationMs: 7200,
      speechLikeRatio: 0.8,
      silenceRatio: 0.18,
      rmsMean: 0.65,
      zeroCrossingRate: 0.12,
      wordsPerMinuteEstimate: 92,
    }, 18);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.signals.length).toBeGreaterThan(0);
    expect(result.limitations.join(" ")).toMatch(/phoneme-level/);
  });

  it("flags excessive pauses", () => {
    const result = assessAcousticPronunciation({
      durationMs: 12000,
      speechLikeRatio: 0.3,
      silenceRatio: 0.6,
      rmsMean: 0.3,
      zeroCrossingRate: 0.05,
      wordsPerMinuteEstimate: 60,
    }, 12);
    expect(result.signals.some((signal) => signal.includes("pauses"))).toBe(true);
  });
});

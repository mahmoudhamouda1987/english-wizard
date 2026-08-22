import { describe, expect, it } from "vitest";
import { normaliseWords, scoreSpeech } from "./speech-scoring";

describe("speech scoring", () => {
  it("gives 100 for a perfect attempt regardless of punctuation or case", () => {
    const r = scoreSpeech("I would like a cup of tea.", "i would LIKE a cup of tea");
    expect(r.accuracy).toBe(100);
    expect(r.missing).toHaveLength(0);
  });

  it("identifies missing words", () => {
    const r = scoreSpeech("the rain in spain stays mainly", "the rain in spain");
    expect(r.missing).toEqual(["stays", "mainly"]);
    expect(r.matched).toEqual(["the", "rain", "in", "spain"]);
    expect(r.accuracy).toBeLessThan(100);
    expect(r.accuracy).toBeGreaterThan(40);
  });

  it("penalises extra rambling words mildly", () => {
    const clean = scoreSpeech("good morning teacher", "good morning teacher");
    const rambly = scoreSpeech("good morning teacher", "well good morning teacher today yes");
    expect(clean.accuracy).toBe(100);
    expect(rambly.accuracy).toBeLessThan(100);
    expect(rambly.accuracy).toBeGreaterThanOrEqual(80);
  });

  it("handles empty transcripts as zero", () => {
    const r = scoreSpeech("hello there", "");
    expect(r.accuracy).toBe(0);
    expect(r.missing).toEqual(["hello", "there"]);
  });

  it("normalises punctuation and apostrophes", () => {
    expect(normaliseWords("Don’t stop — it’s 5 o’clock!")).toEqual(["don't", "stop", "it's", "5", "o'clock"]);
  });

  it("penalises wrong word order via subsequence alignment", () => {
    const r = scoreSpeech("she sells sea shells", "sea shells she sells");
    expect(r.matched.length).toBe(2);
    expect(r.accuracy).toBeLessThan(70);
  });
});

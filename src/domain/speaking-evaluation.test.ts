import { describe, expect, it } from "vitest";
import { evaluateSpeakingTranscript, overallSpeakingBand } from "./speaking-evaluation";

describe("Speaking evaluation (Part 8 — real signals, no fabrication)", () => {
  it("reports empty responses honestly", () => {
    const e = evaluateSpeakingTranscript("", "B1");
    expect(e.submitted).toBe(false);
    expect(e.band).toBeNull();
    expect(e.note).toContain("No response recorded");
  });

  it("marks very short responses as too short to place (never guesses)", () => {
    const e = evaluateSpeakingTranscript("Hello, I am fine.", "B2");
    expect(e.submitted).toBe(true);
    expect(e.words).toBe(4);
    expect(e.band).toBeNull();
  });

  it("places a simple short response at low bands", () => {
    const e = evaluateSpeakingTranscript("I live in Cairo with my family. I like football and reading books.", "A2");
    expect(e.submitted).toBe(true);
    expect(e.band).not.toBeNull();
    expect(["Pre-A1", "A1", "A2"].includes(e.band!)).toBe(true);
  });

  it("recognizes extended structured production at higher bands", () => {
    const text = [
      "In my opinion, working from home has fundamentally changed how professionals manage their time and energy.",
      "Because commuting consumes hours every week, remote work gives people the freedom to design their own schedules.",
      "However, it also introduces challenges: collaboration becomes harder, and the boundary between work and rest can blur.",
      "Although some companies have returned to the office, most employees still value flexibility.",
      "Therefore, I believe the future of work will be hybrid, combining the focus of home with the connection of the office.",
      "Ultimately, organizations that adapt thoughtfully will retain the best talent.",
    ].join(" ");
    const e = evaluateSpeakingTranscript(text, "B2");
    expect(e.words).toBeGreaterThan(90);
    expect(e.sentences).toBeGreaterThanOrEqual(5);
    expect(e.connectives).toBeGreaterThanOrEqual(3);
    expect(["B2", "C1"].includes(e.band!)).toBe(true);
  });

  it("never exceeds one band above the prompt level", () => {
    const text = [
      "Evaluating the ethical implications of AI-generated information requires careful consideration of provenance, accountability and epistemic trust.",
      "Because synthetic media can be produced at negligible cost, the burden of verification shifts onto readers and institutions.",
      "Although regulation offers one avenue, media literacy seems more durable; moreover, platforms must design provenance signals into their products.",
      "In conclusion, defending a position here means acknowledging trade-offs rather than claiming absolute certainty.",
    ].join(" ");
    const e = evaluateSpeakingTranscript(text, "Pre-A1");
    expect(e.band).toBe("A1"); // ceiling = prompt + 1
  });

  it("always labels the feedback as indicative, never an official score", () => {
    const e = evaluateSpeakingTranscript("I have a dog. His name is Rex. He likes to run in the park every evening.", "A1");
    expect(e.note).toContain("not an official speaking score");
  });
});

describe("Overall speaking band", () => {
  it("returns null when no responses were placed", () => {
    expect(overallSpeakingBand([])).toBeNull();
    expect(overallSpeakingBand([evaluateSpeakingTranscript("", "B1")])).toBeNull();
  });

  it("takes the median of placed responses", () => {
    // Constructed to place at A1, A2 and B1 respectively → median A2.
    const a = evaluateSpeakingTranscript("I like music very much. It makes me happy every day.", "A1");
    const b = evaluateSpeakingTranscript("Yesterday I went to the cinema with my two best friends. We watched a very funny movie about space and laughed a lot together.", "A2");
    const c = evaluateSpeakingTranscript("Working from home offers real flexibility, although it can blur the boundary between work and rest; therefore I believe hybrid models suit most teams best.", "B1");
    const overall = overallSpeakingBand([a, b, c]);
    expect(overall).toBe("A2");
  });
});

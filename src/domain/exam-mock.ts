import type { CEFRLevel } from "./learner";
import { READING_ACTIVITIES } from "./content-library";

export interface MockQuestion { id: string; question: string; answer: string }
export interface MockSectionResult { key: string; label: string; percent: number }

/** Builds a fresh three-part mock (reading, writing prompt, speaking phrase) per sitting. */
export function buildMock(seed: number): { readingPassage: string; readingTitle: string; questions: MockQuestion[]; writingPrompt: string; speakingPhrase: string } {
  const readings = READING_ACTIVITIES.filter((r) => r.level === "B2");
  const reading = readings[seed % readings.length] ?? READING_ACTIVITIES[8];
  const questions = reading.comprehensionQuestions.map((q, i) => ({ id: `m${i}`, question: q.question, answer: q.answer }));
  const prompts = [
    "Some employers monitor staff messages. Argue for or against, with two reasons (6–8 sentences).",
    "Describe how AI will change your industry within five years. Acknowledge one counter-argument (6–8 sentences).",
    "Your city plans to ban cars downtown. Present both sides, then conclude (6–8 sentences).",
  ];
  const phrases = [
    "The available evidence suggests flexible work improves retention when managed well.",
    "I would recommend validating these assumptions before we proceed further.",
    "Responsible argument requires attention to what the wording permits audiences to infer.",
  ];
  return {
    readingPassage: reading.passage,
    readingTitle: reading.title,
    questions,
    writingPrompt: prompts[seed % prompts.length],
    speakingPhrase: phrases[seed % phrases.length],
  };
}

/** Transparent IELTS-style band mapping from an internal percent (internal estimate only). */
export function ieltsBand(percent: number): number {
  const table: Array<[number, number]> = [[90, 8], [80, 7], [70, 6.5], [60, 6], [50, 5.5], [40, 5], [30, 4.5]];
  for (const [min, band] of table) if (percent >= min) return band;
  return 4;
}

export function cefrFromPercent(percent: number): CEFRLevel {
  if (percent >= 92) return "C2";
  if (percent >= 80) return "C1";
  if (percent >= 65) return "B2";
  if (percent >= 50) return "B1";
  if (percent >= 35) return "A2";
  if (percent >= 20) return "A1";
  return "Pre-A1";
}

/** Writing heuristic identical in spirit to the writing lab: length × structure coverage. */
export function scoreWritingMock(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
  const linkers = ["however", "moreover", "therefore", "although", "nevertheless", "in contrast"].filter((l) => text.toLowerCase().includes(l)).length;
  return Math.min(100, Math.round(Math.min(words / 90, 1) * 55 + Math.min(sentences / 6, 1) * 25 + Math.min(linkers / 2, 1) * 20));
}

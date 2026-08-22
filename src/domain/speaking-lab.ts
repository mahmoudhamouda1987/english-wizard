import type { CEFRLevel } from "./learner";

export interface LabPhrase { id: string; level: CEFRLevel; focus: string; text: string }

/** Calibration phrases per level for the Speaking Coach. */
export const LAB_PHRASES: LabPhrase[] = [
  { id: "sl-prea1-1", level: "Pre-A1", focus: "greetings", text: "Hello. My name is Omar." },
  { id: "sl-prea1-2", level: "Pre-A1", focus: "polite requests", text: "One coffee and one cake, please." },
  { id: "sl-prea1-3", level: "Pre-A1", focus: "numbers", text: "That is three pounds fifty." },
  { id: "sl-a1-1", level: "A1", focus: "routine", text: "I wake up at seven and walk to work." },
  { id: "sl-a1-2", level: "A1", focus: "introduction", text: "I am from Cairo and I live with my family." },
  { id: "sl-a1-3", level: "A1", focus: "questions", text: "Where is the nearest train station?" },
  { id: "sl-a2-1", level: "A2", focus: "past narrative", text: "Last weekend we visited my aunt and cooked together." },
  { id: "sl-a2-2", level: "A2", focus: "apologies", text: "Sorry I am late, the traffic was terrible." },
  { id: "sl-a2-3", level: "A2", focus: "plans", text: "We are going to travel to Spain next summer." },
  { id: "sl-b1-1", level: "B1", focus: "opinions", text: "In my view remote work improves focus for most people." },
  { id: "sl-b1-2", level: "B1", focus: "requests", text: "Could you send me the report before Thursday afternoon?" },
  { id: "sl-b1-3", level: "B1", focus: "storytelling", text: "The meeting had already started when my train finally arrived." },
  { id: "sl-b2-1", level: "B2", focus: "argument", text: "The evidence suggests flexible work improves retention when managed well." },
  { id: "sl-b2-2", level: "B2", focus: "negotiation", text: "We are prepared to offer twenty units per month at the agreed rate." },
  { id: "sl-b2-3", level: "B2", focus: "concession", text: "Admittedly the upfront cost is high, yet the long term savings are greater." },
  { id: "sl-c1-1", level: "C1", focus: "hedging", text: "The available data suggests a modest but statistically significant effect." },
  { id: "sl-c1-2", level: "C1", focus: "leadership", text: "Rarely have we witnessed such commitment from an entire team." },
  { id: "sl-c1-3", level: "C1", focus: "precision", text: "I would recommend validating these assumptions before we proceed further." },
  { id: "sl-c2-1", level: "C2", focus: "nuance", text: "The issue is deceptively complex once the competing constraints are considered." },
  { id: "sl-c2-2", level: "C2", focus: "rhetoric", text: "Responsible argument requires attention to what the wording permits audiences to infer." },
  { id: "sl-c2-3", level: "C2", focus: "crisis tone", text: "We acknowledge the concern, remediation is underway, and trust will be rebuilt." },
];

export function phrasesForLevel(level: CEFRLevel): LabPhrase[] {
  const pool = LAB_PHRASES.filter((p) => p.level === level);
  return pool.length ? pool : LAB_PHRASES.filter((p) => p.level === "A1");
}

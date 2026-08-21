import type { CEFRLevel, Skill } from "./learner";

export interface ChunkRecord {
  id: string;
  text: string;
  meaning: string;
  level: CEFRLevel;
  function: string;
  collocations: string[];
  examples: string[];
  receptive: boolean;
  productive: boolean;
  pronunciationNotes?: string[];
}

export type CommunicationFunction =
  | "INTRODUCE"
  | "REQUEST"
  | "CLARIFY"
  | "AGREE"
  | "DISAGREE"
  | "PERSUADE"
  | "NEGOTIATE"
  | "HEDGE"
  | "SUMMARIZE"
  | "MEDIATE"
  | "ARGUE"
  | "PRESENT";

export interface CommunicationCapability {
  id: string;
  function: CommunicationFunction;
  level: CEFRLevel;
  skills: Skill[];
  successCriteria: string[];
  exampleChunks: string[];
  transferContexts: string[];
}

export const CORE_CHUNKS: ChunkRecord[] = [
  { id: "chunk-could-i-have", text: "Could I have ...?", meaning: "a polite request", level: "A1", function: "REQUEST", collocations: ["a minute", "some water", "another one"], examples: ["Could I have some water, please?"], receptive: true, productive: true },
  { id: "chunk-how-about", text: "How about ...?", meaning: "making a suggestion", level: "A2", function: "REQUEST", collocations: ["how about tomorrow", "how about a coffee"], examples: ["How about meeting later?"], receptive: true, productive: false },
  { id: "chunk-the-thing-is", text: "The thing is ...", meaning: "introducing the main point or difficulty", level: "B1", function: "CLARIFY", collocations: ["the thing is though", "the thing is we"], examples: ["The thing is, we don't have the data yet."], receptive: true, productive: false },
  { id: "chunk-im-not-sure", text: "I'm not sure ...", meaning: "softening uncertainty or disagreement", level: "B1", function: "HEDGE", collocations: ["I'm not sure I agree", "I'm not sure this will work"], examples: ["I'm not sure this approach will work."], receptive: true, productive: true },
  { id: "chunk-from-my-perspective", text: "From my perspective ...", meaning: "introducing a considered opinion", level: "B2", function: "PRESENT", collocations: ["from my perspective", "from my perspective, the issue"], examples: ["From my perspective, the evidence is mixed."], receptive: true, productive: true },
  { id: "chunk-to-be-fair", text: "To be fair, ...", meaning: "introducing a balancing consideration before disagreeing", level: "B2", function: "DISAGREE", collocations: ["to be fair though", "to be fair to them"], examples: ["To be fair, the proposal does address the main risk."], receptive: true, productive: false },
  { id: "chunk-that-said", text: "That said, ...", meaning: "introducing a contrast or qualification", level: "C1", function: "HEDGE", collocations: ["that said, there is", "that said, we should"], examples: ["That said, we should test the assumption."], receptive: true, productive: false },
  { id: "chunk-the-question-is", text: "The question is whether ...", meaning: "framing an analytical issue", level: "C2", function: "ARGUE", collocations: ["the question is whether", "the question is how"], examples: ["The question is whether the evidence justifies the conclusion."], receptive: true, productive: false },
];

export const COMMUNICATION_CAPABILITIES: CommunicationCapability[] = [
  { id: "introduce-a1", function: "INTRODUCE", level: "A1", skills: ["speaking", "writing"], successCriteria: ["Gives clear identity information", "Uses basic accurate chunks"], exampleChunks: ["chunk-could-i-have"], transferContexts: ["meeting a colleague", "joining a class"] },
  { id: "clarify-a2", function: "CLARIFY", level: "A2", skills: ["speaking", "listening"], successCriteria: ["Asks for repetition or clarification", "Shows understanding"], exampleChunks: ["chunk-could-i-have"], transferContexts: ["travel problem", "work instruction"] },
  { id: "disagree-b1", function: "DISAGREE", level: "B1", skills: ["speaking", "writing"], successCriteria: ["Disagrees without blocking the interaction", "Provides one reason"], exampleChunks: ["chunk-im-not-sure"], transferContexts: ["team meeting", "social discussion"] },
  { id: "persuade-b2", function: "PERSUADE", level: "B2", skills: ["speaking", "writing", "reading"], successCriteria: ["States a position", "Supports it with reasons/evidence", "Addresses an objection"], exampleChunks: ["chunk-from-my-perspective"], transferContexts: ["proposal meeting", "opinion article"] },
  { id: "hedge-c1", function: "HEDGE", level: "C1", skills: ["speaking", "writing", "reading"], successCriteria: ["Qualifies claims appropriately", "Separates evidence from certainty"], exampleChunks: ["chunk-that-said"], transferContexts: ["executive briefing", "research discussion"] },
  { id: "argue-c2", function: "ARGUE", level: "C2", skills: ["speaking", "writing", "reading", "mediation"], successCriteria: ["Controls nuance", "Anticipates interpretations", "Makes assumptions explicit"], exampleChunks: ["chunk-the-question-is"], transferContexts: ["policy memo", "high-stakes debate"] },
];

export function getChunksForLevel(level: CEFRLevel): ChunkRecord[] {
  const order: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
  const rank = order.indexOf(level);
  return CORE_CHUNKS.filter((chunk) => order.indexOf(chunk.level) <= rank);
}

export function capabilityByLevel(level: CEFRLevel): CommunicationCapability[] {
  const order: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
  const rank = order.indexOf(level);
  return COMMUNICATION_CAPABILITIES.filter((capability) => order.indexOf(capability.level) <= rank);
}

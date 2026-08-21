import type { CEFRLevel } from "./learner";

export type ChunkKnowledge = "RECEPTIVE" | "PRODUCTIVE";

export type CommunicationFunction =
  | "INTRODUCE"
  | "ASK_FOR_INFORMATION"
  | "CLARIFY"
  | "AGREE_DISAGREE"
  | "GIVE_OPINION"
  | "SUGGEST"
  | "PERSUADE"
  | "NEGOTIATE"
  | "SUMMARISE"
  | "MEDIATE";

export interface LearningChunk {
  id: string;
  text: string;
  meaning: string;
  level: CEFRLevel;
  functions: CommunicationFunction[];
  variants: string[];
  contexts: string[];
  commonErrors: string[];
}

export interface LearnerChunkState {
  chunkId: string;
  knowledge: ChunkKnowledge;
  encounters: number;
  productiveAttempts: number;
  successfulProductions: number;
  lastSeenAt: string;
  nextReviewAt?: string;
}

export const COMMUNICATION_FUNCTIONS: Record<CommunicationFunction, { title: string; levels: CEFRLevel[] }> = {
  INTRODUCE: { title: "Introduce yourself and others", levels: ["Pre-A1", "A1", "A2"] },
  ASK_FOR_INFORMATION: { title: "Ask for information", levels: ["A1", "A2", "B1"] },
  CLARIFY: { title: "Clarify meaning", levels: ["A2", "B1", "B2", "C1"] },
  AGREE_DISAGREE: { title: "Agree and disagree appropriately", levels: ["A2", "B1", "B2", "C1"] },
  GIVE_OPINION: { title: "Give and support an opinion", levels: ["B1", "B2", "C1", "C2"] },
  SUGGEST: { title: "Suggest and recommend", levels: ["A2", "B1", "B2", "C1"] },
  PERSUADE: { title: "Persuade and influence", levels: ["B2", "C1", "C2"] },
  NEGOTIATE: { title: "Negotiate and reach agreement", levels: ["B2", "C1", "C2"] },
  SUMMARISE: { title: "Summarise key information", levels: ["B1", "B2", "C1", "C2"] },
  MEDIATE: { title: "Mediate information for another person", levels: ["B1", "B2", "C1", "C2"] },
};

export const LEARNING_CHUNKS: LearningChunk[] = [
  { id: "chunk.nice-to-meet-you", text: "Nice to meet you.", meaning: "A natural greeting when meeting someone for the first time.", level: "A1", functions: ["INTRODUCE"], variants: ["It's nice to meet you."], contexts: ["first meeting", "work", "social"], commonErrors: ["nice-meeting-you"] },
  { id: "chunk.could-you-please", text: "Could you please...", meaning: "A polite way to make a request.", level: "A2", functions: ["ASK_FOR_INFORMATION"], variants: ["Could you...", "Would you mind..."], contexts: ["work", "service", "everyday"], commonErrors: ["direct-command"] },
  { id: "chunk.what-do-you-mean", text: "What do you mean by...", meaning: "A direct way to ask for clarification.", level: "B1", functions: ["CLARIFY"], variants: ["Could you clarify...", "What exactly do you mean by..."], contexts: ["conversation", "work", "study"], commonErrors: ["unclear-reference"] },
  { id: "chunk.from-my-point-of-view", text: "From my point of view...", meaning: "A structured way to introduce an opinion.", level: "B1", functions: ["GIVE_OPINION"], variants: ["In my view...", "As far as I'm concerned..."], contexts: ["discussion", "meeting", "writing"], commonErrors: ["unsupported-opinion"] },
  { id: "chunk.one-option-would-be", text: "One option would be to...", meaning: "A useful way to make a cautious suggestion.", level: "B2", functions: ["SUGGEST", "NEGOTIATE"], variants: ["We could...", "Another possibility would be to..."], contexts: ["meetings", "planning", "negotiation"], commonErrors: ["over-direct-suggestion"] },
  { id: "chunk.to-put-it-another-way", text: "To put it another way...", meaning: "A discourse marker used to restate or clarify an idea.", level: "C1", functions: ["CLARIFY", "SUMMARISE"], variants: ["In other words...", "Put differently..."], contexts: ["presentation", "discussion", "academic"], commonErrors: ["repetition-without-change"] },
];

export function getChunksForLevel(level: CEFRLevel): LearningChunk[] {
  const rank: Record<CEFRLevel, number> = { "Pre-A1": 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  return LEARNING_CHUNKS.filter((chunk) => rank[chunk.level] <= rank[level]);
}

export function classifyChunkKnowledge(state: Pick<LearnerChunkState, "encounters" | "productiveAttempts" | "successfulProductions">): ChunkKnowledge {
  return state.productiveAttempts > 0 && state.successfulProductions > 0 ? "PRODUCTIVE" : "RECEPTIVE";
}

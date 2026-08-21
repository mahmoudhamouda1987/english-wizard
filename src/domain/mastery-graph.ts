import type { CEFRLevel, Skill } from "./learner";

export type MasteryState = "UNKNOWN" | "EXPOSED" | "RECOGNISED" | "UNDERSTOOD" | "CONTROLLED" | "RECALLED" | "PRODUCED" | "USED_IN_CONTEXT" | "USED_SPONTANEOUSLY" | "RETAINED" | "MASTERED";

export interface CapabilityNode { id: string; title: string; domain: "grammar" | "vocabulary" | "pronunciation" | "reading" | "listening" | "speaking" | "writing" | "mediation" | "communication"; skill: Skill; level: CEFRLevel; description: string; function?: string; prerequisites: string[]; contrasts: string[]; commonErrors: string[]; learningObjectives: string[]; }
export interface CapabilityEdge { from: string; to: string; relation: "prerequisite" | "supports" | "contrasts" | "transfers_to"; }
export interface CapabilityMastery { capabilityId: string; state: MasteryState; score: number; confidence: number; evidenceCount: number; lastEvidenceAt?: string; retainedAt?: string; updatedAt: string; }
export interface MasteryGraph { version: 1; nodes: CapabilityNode[]; edges: CapabilityEdge[]; mastery: CapabilityMastery[]; }

export const MASTERY_GRAPH_NODES: CapabilityNode[] = [
  { id: "grammar.present-simple-routines", title: "Present simple for routines and facts", domain: "grammar", skill: "grammar", level: "A1", description: "Use present simple forms for habitual actions and stable facts.", function: "describing routines and facts", prerequisites: [], contrasts: ["grammar.present-continuous-now"], commonErrors: ["third-person-s", "be-vs-main-verb"], learningObjectives: ["a1-present-simple-routines"] },
  { id: "grammar.past-simple-events", title: "Past simple for completed events", domain: "grammar", skill: "grammar", level: "A2", description: "Describe completed past events with appropriate forms and time markers.", prerequisites: ["grammar.present-simple-routines"], contrasts: ["grammar.present-perfect-experience"], commonErrors: ["irregular-past", "did-plus-past"], learningObjectives: ["a2-past-events"] },
  { id: "grammar.present-perfect-experience", title: "Present perfect for experiences and duration", domain: "grammar", skill: "grammar", level: "B1", description: "Connect past experiences or states to the present appropriately.", prerequisites: ["grammar.past-simple-events"], contrasts: ["grammar.past-simple-events"], commonErrors: ["have-vs-had", "past-participle"], learningObjectives: ["b1-authentic-listening"] },
  { id: "lexicon.work-schedule", title: "Schedule and appointment language", domain: "vocabulary", skill: "vocabulary", level: "A2", description: "Use practical scheduling vocabulary productively in everyday contexts.", prerequisites: [], contrasts: [], commonErrors: ["appointment-vs-meeting"], learningObjectives: ["a2-daily-interactions"] },
  { id: "speaking.self-introduction", title: "Self-introduction in interaction", domain: "communication", skill: "speaking", level: "A1", description: "Introduce yourself, answer basic questions and maintain a short exchange.", prerequisites: [], contrasts: [], commonErrors: ["fragmented-answers", "missing-follow-up"], learningObjectives: ["a1-self-introduction-speaking", "a1-asking-basic-questions"] },
  { id: "listening.main-idea-everyday", title: "Main idea in everyday speech", domain: "listening", skill: "listening", level: "A2", description: "Identify the purpose and main point of clear everyday exchanges.", prerequisites: [], contrasts: [], commonErrors: ["detail-without-main-idea", "speed-processing"], learningObjectives: ["a2-main-idea"] },
  { id: "writing.opinion-paragraph", title: "Connected opinion paragraph", domain: "writing", skill: "writing", level: "B1", description: "Express an opinion with reasons, examples and linking devices.", prerequisites: ["grammar.present-simple-routines"], contrasts: [], commonErrors: ["fragmented-cohesion", "weak-linkers"], learningObjectives: ["b1-opinion-writing"] },
  { id: "pronunciation.word-stress-foundation", title: "Core word stress and intelligibility", domain: "pronunciation", skill: "pronunciation", level: "Pre-A1", description: "Hear and reproduce high-value stress patterns that support intelligibility.", prerequisites: [], contrasts: [], commonErrors: ["flat-stress", "syllable-timing-transfer"], learningObjectives: ["prea1-sound-foundations"] },
];

export const MASTERY_GRAPH_EDGES: CapabilityEdge[] = MASTERY_GRAPH_NODES.flatMap((node) => node.prerequisites.map((prerequisite) => ({ from: prerequisite, to: node.id, relation: "prerequisite" as const })));

export function stateForEvidence(score: number, evidenceCount: number, spontaneous = false): MasteryState {
  if (score >= 92 && evidenceCount >= 5 && spontaneous) return "MASTERED";
  if (score >= 88 && evidenceCount >= 4 && spontaneous) return "RETAINED";
  if (score >= 82 && spontaneous) return "USED_SPONTANEOUSLY";
  if (score >= 76 && evidenceCount >= 3) return "USED_IN_CONTEXT";
  if (score >= 70 && evidenceCount >= 2) return "PRODUCED";
  if (score >= 60) return "RECALLED";
  if (score >= 45) return "CONTROLLED";
  if (score >= 30) return "UNDERSTOOD";
  if (score >= 15) return "RECOGNISED";
  if (score > 0) return "EXPOSED";
  return "UNKNOWN";
}

export function buildMasteryGraph(now = new Date().toISOString()): MasteryGraph {
  return { version: 1, nodes: MASTERY_GRAPH_NODES, edges: MASTERY_GRAPH_EDGES, mastery: MASTERY_GRAPH_NODES.map((node) => ({ capabilityId: node.id, state: "UNKNOWN", score: 0, confidence: 0, evidenceCount: 0, updatedAt: now })) };
}

export function applyEvidenceToMastery(
  graph: MasteryGraph,
  input: { capabilityIds: string[]; score: number; confidence: number; context: "FAMILIAR" | "UNFAMILIAR" | "TRANSFER"; occurredAt: string },
): MasteryGraph {
  const spontaneous = input.context !== "FAMILIAR";
  const supported = Math.max(0, Math.min(100, Math.round(input.score))) * Math.max(0, Math.min(1, input.confidence));
  const mastery = graph.mastery.map((current) => {
    if (!input.capabilityIds.includes(current.capabilityId)) return current;
    const evidenceCount = current.evidenceCount + 1;
    const score = Math.round((current.score * current.evidenceCount + supported) / evidenceCount);
    const confidence = Math.max(current.confidence, Math.max(0, Math.min(1, input.confidence)));
    const state = evidenceCount === 1 ? "EXPOSED" : stateForEvidence(score, evidenceCount, spontaneous);
    return { ...current, score, confidence, evidenceCount, state, lastEvidenceAt: input.occurredAt, ...(state === "RETAINED" || state === "MASTERED" ? { retainedAt: current.retainedAt ?? input.occurredAt } : {}), updatedAt: input.occurredAt };
  });
  return { ...graph, mastery };
}

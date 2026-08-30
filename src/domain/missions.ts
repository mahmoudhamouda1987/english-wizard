import type { CEFRLevel } from "./curriculum";

export interface LearningWorld {
  id: string;
  number: number;
  title: string;
  level: CEFRLevel;
  purpose: string;
  missionIds: string[];
}

export interface Mission {
  id: string;
  worldId: string;
  level: CEFRLevel;
  title: string;
  scenario: string;
  objectiveIds: string[];
  skillMix: Array<"reading" | "listening" | "speaking" | "writing" | "vocabulary" | "grammar" | "pronunciation" | "mediation">;
  requiredEvidence: string[];
  successCriteria: string[];
}

export interface BossMission extends Mission {
  boss: true;
  integratedTasks: Array<"listen" | "speak" | "write" | "read" | "solve" | "explain" | "decide">;
}

export const WORLDS: LearningWorld[] = [
  { id: "world-0", number: 0, title: "First English", level: "Pre-A1", purpose: "Build survival comprehension and sound foundations.", missionIds: ["mission-prea1-survive"] },
  { id: "world-1", number: 1, title: "Survival", level: "A1", purpose: "Handle introductions, simple requests and everyday exchanges.", missionIds: ["mission-a1-meet", "mission-a1-order"] },
  { id: "world-2", number: 2, title: "Everyday Life", level: "A2", purpose: "Manage practical interactions, plans and problems.", missionIds: ["mission-a2-real-life", "mission-a2-problem"] },
  { id: "world-3", number: 3, title: "Independent English", level: "B1", purpose: "Communicate independently across common personal and work situations.", missionIds: ["mission-b1-independent"] },
  { id: "world-4", number: 4, title: "Business English", level: "B2", purpose: "Lead, negotiate, present and defend ideas.", missionIds: ["mission-b2-professional", "boss-b2-proposal"] },
  { id: "world-5", number: 5, title: "Advanced English", level: "C1", purpose: "Handle complex discussion, analysis and persuasion.", missionIds: ["mission-c1-analysis"] },
  { id: "world-6", number: 6, title: "Mastery", level: "C2", purpose: "Communicate with precision, nuance and rhetorical flexibility.", missionIds: ["mission-c2-nuance", "boss-c2-live-in-english"] },
];

export const MISSIONS: Mission[] = [
  { id: "mission-prea1-survive", worldId: "world-0", level: "Pre-A1", title: "Survive Your First English Day", scenario: "Use greetings, numbers, names and simple requests to navigate a basic day.", objectiveIds: ["prea1-survival-phrases", "prea1-basic-reading", "prea1-basic-listening"], skillMix: ["listening", "speaking", "reading", "vocabulary"], requiredEvidence: ["identify-key-information", "produce-survival-phrase"], successCriteria: ["understand-essential-phrases", "produce-basic-response"] },
  { id: "mission-a1-meet", worldId: "world-1", level: "A1", title: "Meet Someone New", scenario: "Meet a colleague and keep a short personal conversation going.", objectiveIds: ["a1-self-introduction-speaking", "a1-asking-basic-questions"], skillMix: ["speaking", "listening", "vocabulary"], requiredEvidence: ["self-introduction", "follow-up-question"], successCriteria: ["complete-5-turn-exchange", "intelligible-basic-production"] },
  { id: "mission-a1-order", worldId: "world-1", level: "A1", title: "Order What You Need", scenario: "Order food or a drink and clarify a simple request.", objectiveIds: ["a1-basic-listening-intent"], skillMix: ["listening", "speaking", "vocabulary"], requiredEvidence: ["understand-request", "make-order"], successCriteria: ["complete-transaction"] },
  { id: "mission-a2-real-life", worldId: "world-2", level: "A2", title: "Handle Real Life", scenario: "Arrange a practical appointment, discuss a schedule and write a short confirmation.", objectiveIds: ["a2-daily-interactions", "a2-short-messages", "a2-main-idea"], skillMix: ["speaking", "listening", "writing", "vocabulary"], requiredEvidence: ["appointment-dialogue", "written-confirmation"], successCriteria: ["solve-routine-task", "communicate-key-details"] },
  { id: "mission-a2-problem", worldId: "world-2", level: "A2", title: "Solve a Travel Problem", scenario: "Explain a simple travel problem and ask staff for a solution.", objectiveIds: ["a2-past-events", "a2-daily-interactions"], skillMix: ["speaking", "listening", "writing"], requiredEvidence: ["problem-explanation", "solution-request"], successCriteria: ["describe-problem", "agree-on-next-step"] },
  { id: "mission-b1-independent", worldId: "world-3", level: "B1", title: "Handle an Independent Conversation", scenario: "Explain an experience, discuss plans and give advice without a script.", objectiveIds: ["b1-independent-conversation", "b1-opinion-writing", "b1-authentic-listening"], skillMix: ["speaking", "listening", "writing", "reading"], requiredEvidence: ["connected-speech", "opinion-paragraph"], successCriteria: ["maintain-topic", "give-reasons", "ask-follow-up"] },
  { id: "mission-b2-professional", worldId: "world-4", level: "B2", title: "Lead a Professional Meeting", scenario: "Open a meeting, handle disagreement and agree on decisions.", objectiveIds: ["b2-argumentation", "b2-structured-writing", "b2-fast-listening"], skillMix: ["speaking", "listening", "writing", "mediation"], requiredEvidence: ["meeting-contribution", "decision-summary"], successCriteria: ["defend-position", "manage-turns", "summarise-decision"] },
  { id: "mission-c1-analysis", worldId: "world-5", level: "C1", title: "Analyse a Complex Issue", scenario: "Interpret conflicting information, explain implications and persuade an informed audience.", objectiveIds: ["c1-fluent-discussion", "c1-advanced-writing", "c1-complex-listening", "c1-critical-reading"], skillMix: ["reading", "listening", "speaking", "writing", "mediation"], requiredEvidence: ["source-synthesis", "qualified-claim", "audience-adaptation"], successCriteria: ["synthesise-sources", "hedge-claims", "defend-conclusion"] },
  { id: "mission-c2-nuance", worldId: "world-6", level: "C2", title: "Communicate with Precision", scenario: "Interpret nuanced arguments and adapt rhetoric for different audiences.", objectiveIds: ["c2-precision-speaking", "c2-expert-writing", "c2-complex-listening", "c2-expert-reading"], skillMix: ["reading", "listening", "speaking", "writing", "mediation"], requiredEvidence: ["rhetorical-analysis", "register-shift", "precise-response"], successCriteria: ["control-nuance", "adapt-register", "communicate-precisely"] },
];

export const BOSS_MISSIONS: BossMission[] = [
  { id: "boss-b2-proposal", worldId: "world-4", level: "B2", boss: true, title: "Defend the Proposal", scenario: "Listen to concerns, present a proposal, negotiate changes and write the final decision.", objectiveIds: ["b2-argumentation", "b2-structured-writing", "b2-fast-listening"], skillMix: ["listening", "speaking", "writing", "mediation"], requiredEvidence: ["stakeholder-response", "proposal-pitch", "decision-note"], successCriteria: ["respond-to-objection", "defend-proposal", "document-outcome"], integratedTasks: ["listen", "speak", "solve", "write", "decide"] },
  { id: "boss-c2-live-in-english", worldId: "world-6", level: "C2", boss: true, title: "Live in English", scenario: "Complete a simulated day involving meetings, analysis, conversation and rapid decision-making.", objectiveIds: ["c2-precision-speaking", "c2-expert-writing", "c2-complex-listening", "c2-expert-reading"], skillMix: ["reading", "listening", "speaking", "writing", "mediation"], requiredEvidence: ["multi-stage-performance", "nuanced-explanation", "decision-under-uncertainty"], successCriteria: ["maintain-performance-across-contexts", "adapt-register", "explain-and-defend-decisions"], integratedTasks: ["read", "listen", "speak", "write", "explain", "decide"] },
];

export function missionForId(id: string): Mission | BossMission | undefined {
  return [...MISSIONS, ...BOSS_MISSIONS].find((mission) => mission.id === id);
}

export function worldForLevel(level: CEFRLevel): LearningWorld | undefined {
  return WORLDS.find((world) => world.level === level);
}

import type { CEFRLevel } from "./curriculum";
import { rotatedPool } from "./variety";

export interface FirstWinQuestion {
  id: string;
  band: "beginner" | "intermediate" | "advanced";
  question: string;
  options: string[];
  answer: string;
}

const POOL: FirstWinQuestion[] = [
  // Beginner band — near-certain wins for Pre-A1..A2
  { id: "fw-b-greet", band: "beginner", question: "Someone says “Hello!” — what is the best reply?", options: ["Hello! Nice to meet you.", "I am fine thank you goodbye.", "Tomorrow."], answer: "Hello! Nice to meet you." },
  { id: "fw-b-name", band: "beginner", question: "Complete: “My ___ is Sara.”", options: ["name", "old", "from"], answer: "name" },
  { id: "fw-b-order", band: "beginner", question: "You want water in a café. What do you say?", options: ["Water, please.", "Water me give.", "Drink now?"], answer: "Water, please." },
  { id: "fw-b-thanks", band: "beginner", question: "Which is correct?", options: ["Thank you very much.", "Thank you very muchly.", "Thanks you much."], answer: "Thank you very much." },
  { id: "fw-b-where", band: "beginner", question: "Complete: “Where ___ you from?”", options: ["are", "is", "be"], answer: "are" },
  { id: "fw-b-number", band: "beginner", question: "How do you say 15?", options: ["fifteen", "fifty", "fiveteen"], answer: "fifteen" },
  // Intermediate band — B1..B2
  { id: "fw-i-tense", band: "intermediate", question: "Choose the correct sentence.", options: ["I have lived here since 2020.", "I live here since 2020.", "I am living here since 2020."], answer: "I have lived here since 2020." },
  { id: "fw-i-polite", band: "intermediate", question: "Most polite way to ask a colleague for help?", options: ["Could you help me with this?", "Help me now.", "You must help."], answer: "Could you help me with this?" },
  { id: "fw-i-link", band: "intermediate", question: "Complete: “It was raining, ___ we still went out.”", options: ["but", "because", "so"], answer: "but" },
  { id: "fw-i-word", band: "intermediate", question: "“The meeting was ___ until Monday.”", options: ["postponed", "posted", "pontified"], answer: "postponed" },
  { id: "fw-i-comp", band: "intermediate", question: "Choose the correct comparative.", options: ["This is more efficient than that.", "This is more efficienter than that.", "This is efficienter than that."], answer: "This is more efficient than that." },
  { id: "fw-i-reply", band: "intermediate", question: "A colleague says “Thanks for your help.” Best work reply?", options: ["Anytime — happy to help.", "No problem my friend.", "It is nothing why you thank."], answer: "Anytime — happy to help." },
  // Advanced band — C1..C2
  { id: "fw-a-hedge", band: "advanced", question: "Most appropriately hedged claim?", options: ["The data suggests a modest effect.", "The data proves everything.", "Data is useless always."], answer: "The data suggests a modest effect." },
  { id: "fw-a-register", band: "advanced", question: "Best formal equivalent of “find out”?", options: ["ascertain", "dig up", "suss out"], answer: "ascertain" },
  { id: "fw-a-invert", band: "advanced", question: "Complete with correct inversion: “Rarely ___ such commitment.”", options: ["have we seen", "we have seen", "we saw have"], answer: "have we seen" },
  { id: "fw-a-nuance", band: "advanced", question: "“Her explanation was ___ — it seemed simple but hid complexity.”", options: ["deceptively clear", "clearly deceptive", "deceitfully cleared"], answer: "deceptively clear" },
  { id: "fw-a-concession", band: "advanced", question: "Choose the strongest concessive connector.", options: ["Albeit", "Plus", "Anyway"], answer: "Albeit" },
  { id: "fw-a-tone", band: "advanced", question: "In a board memo, which phrasing controls tone best?", options: ["We recommend deferring the decision pending validation.", "This decision is dumb until we validate.", "Maybe think about validating possibly."], answer: "We recommend deferring the decision pending validation." },
];

export function firstWinQuestions(level: CEFRLevel): FirstWinQuestion[] {
  const band = ["Pre-A1", "A1", "A2"].includes(level) ? "beginner" : ["B1", "B2"].includes(level) ? "intermediate" : "advanced";
  const pool = POOL.filter((q) => q.band === band);
  return rotatedPool(pool, level, "first-win").slice(0, 3);
}

import type { CEFRLevel } from "./curriculum";
import { rotate } from "./variety";

export interface ConversationTurn { speaker: "A" | "B"; name: string; text: string; }
export interface ListeningGap { id: string; answer: string; options: string[]; turnIndex: number; }
export interface ConversationExercise {
  id: string;
  level: CEFRLevel;
  title: string;
  context: string;
  durationSeconds: number;
  speakers: Array<{ id: "A" | "B"; name: string; role: string }>;
  turns: ConversationTurn[];
  gapScript: string;
  gaps: ListeningGap[];
}

const base = (level: CEFRLevel, id: string, title: string, context: string, aName: string, bName: string, turns: ConversationTurn[], gapAnswers: string[]): ConversationExercise => ({
  id, level, title, context, durationSeconds: 60,
  speakers: [{ id: "A", name: aName, role: "interviewer" }, { id: "B", name: bName, role: "guest" }],
  turns,
  gapScript: turns.map((t) => `${t.name}: ${t.text}`).join("\n"),
  gaps: gapAnswers.map((answer, index) => ({
    id: `${id}-gap-${index + 1}`,
    answer,
    turnIndex: Math.max(0, turns.findIndex((turn) => new RegExp(`\\b${answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(turn.text))),
    options: [answer, ...gapAnswers.filter((g) => g !== answer).slice(0, 2)].slice(0, 3),
  })),
});

export const CONVERSATIONS: ConversationExercise[] = [
  base("Pre-A1", "conv-prea1-welcome", "Nice to Meet You", "A first introduction", "Mia", "Omar", [
    { speaker: "A", name: "Mia", text: "Hi! My name is Mia. What's your name?" },
    { speaker: "B", name: "Omar", text: "Hi, Mia. I'm Omar. Nice to meet you." },
    { speaker: "A", name: "Mia", text: "Nice to meet you too. Where are you from?" },
    { speaker: "B", name: "Omar", text: "I'm from Cairo. I live here with my family." },
    { speaker: "A", name: "Mia", text: "That's great. I work near here." },
  ], ["Mia", "Omar", "Cairo", "family", "work"]),
  base("A1", "conv-a1-first-day", "Your First Day", "A short interview about a new job", "Sara", "Omar", [
    { speaker: "A", name: "Sara", text: "Welcome, Omar. Is this your first day?" },
    { speaker: "B", name: "Omar", text: "Yes. I'm excited to start my new job." },
    { speaker: "A", name: "Sara", text: "What team are you joining?" },
    { speaker: "B", name: "Omar", text: "I'm joining the sales team. I enjoy talking to people." },
    { speaker: "A", name: "Sara", text: "Great. I'll show you around the office." },
  ], ["first", "job", "team", "people", "office"]),
  base("A2", "conv-a2-travel-plans", "Planning a Trip", "Two friends compare travel plans", "Lina", "Adam", [
    { speaker: "A", name: "Lina", text: "Have you decided where you'll travel this summer?" },
    { speaker: "B", name: "Adam", text: "I'm thinking about Spain. I'd like to explore smaller cities." },
    { speaker: "A", name: "Lina", text: "That sounds interesting. How long will you stay?" },
    { speaker: "B", name: "Adam", text: "About ten days, if my schedule allows it." },
    { speaker: "A", name: "Lina", text: "Then you should book your train tickets early." },
  ], ["decided", "Spain", "cities", "schedule", "tickets"]),
  base("B1", "conv-b1-career", "Changing Careers", "An interview about a professional change", "Nora", "Daniel", [
    { speaker: "A", name: "Nora", text: "What made you decide to change careers?" },
    { speaker: "B", name: "Daniel", text: "I wanted work that gave me more opportunities to learn." },
    { speaker: "A", name: "Nora", text: "Was the transition difficult?" },
    { speaker: "B", name: "Daniel", text: "At first, yes. I had to build new skills while working full-time." },
    { speaker: "A", name: "Nora", text: "What advice would you give someone considering the same move?" },
  ], ["decide", "opportunities", "transition", "skills", "advice"]),
  base("B2", "conv-b2-remote-work", "The Future of Work", "A manager and analyst discuss remote work", "Leila", "Mark", [
    { speaker: "A", name: "Leila", text: "Do you think remote work has changed how teams collaborate?" },
    { speaker: "B", name: "Mark", text: "Absolutely. It has made flexibility easier, but communication has become more deliberate." },
    { speaker: "A", name: "Leila", text: "Which practices have made the biggest difference?" },
    { speaker: "B", name: "Mark", text: "Clear documentation, shorter meetings, and more explicit expectations." },
    { speaker: "A", name: "Leila", text: "So the technology matters, but the habits matter more?" },
  ], ["changed", "flexibility", "practices", "documentation", "habits"]),
  base("C1", "conv-c1-leadership", "Leadership Under Pressure", "A podcast interview with a senior leader", "Helen", "Victor", [
    { speaker: "A", name: "Helen", text: "How do you make decisions when the evidence is incomplete?" },
    { speaker: "B", name: "Victor", text: "I separate what we know from what we assume, then make the smallest reversible decision." },
    { speaker: "A", name: "Helen", text: "How do you communicate uncertainty without creating panic?" },
    { speaker: "B", name: "Victor", text: "I explain the range of outcomes and what signals would cause us to change course." },
    { speaker: "A", name: "Helen", text: "That sounds demanding, but also very transparent." },
  ], ["evidence", "assume", "reversible", "uncertainty", "transparent"]),
  base("C2", "conv-c2-policy", "A Difficult Policy Question", "An expert interview on a complex public issue", "Amelia", "Jon", [
    { speaker: "A", name: "Amelia", text: "Where do you draw the line between an effective policy and an intrusive one?" },
    { speaker: "B", name: "Jon", text: "The distinction depends on proportionality, accountability, and whether less restrictive alternatives exist." },
    { speaker: "A", name: "Amelia", text: "Can a policy be justified if its benefits are difficult to quantify?" },
    { speaker: "B", name: "Jon", text: "Yes, but the burden of justification increases when measurement is uncertain." },
    { speaker: "A", name: "Amelia", text: "So uncertainty does not remove the obligation to reason carefully." },
  ], ["intrusive", "proportionality", "alternatives", "benefits", "uncertain"]),
  // Second dialogue per level — daily rotation doubles practice variety
  base("Pre-A1", "conv-prea1-cafe", "Ordering a Coffee", "A first visit to a café", "Emma", "Yusuf", [
    { speaker: "A", name: "Emma", text: "Hi! What can I get you?" },
    { speaker: "B", name: "Yusuf", text: "Hello. A coffee, please." },
    { speaker: "A", name: "Emma", text: "Sure. Anything to eat? The cake is very good." },
    { speaker: "B", name: "Yusuf", text: "Yes, please. One cake." },
    { speaker: "A", name: "Emma", text: "Great. That's four dollars, please." },
  ], ["coffee", "cake", "eat", "four", "get"]),
  base("A1", "conv-a1-shopping", "At the Market", "Buying fruit at a market stall", "Rana", "Tom", [
    { speaker: "A", name: "Rana", text: "Good morning! Can I help you?" },
    { speaker: "B", name: "Tom", text: "Yes, please. I want some apples. How much are they?" },
    { speaker: "A", name: "Rana", text: "Apples are two dollars a kilo today." },
    { speaker: "B", name: "Tom", text: "OK. I'd like one kilo, and bananas too, please." },
    { speaker: "A", name: "Rana", text: "Of course. That's three dollars fifty altogether." },
  ], ["help", "apples", "kilo", "bananas", "dollars"]),
  base("A2", "conv-a2-doctor", "Seeing the Doctor", "A patient describes symptoms", "Dr. Reyes", "Kareem", [
    { speaker: "A", name: "Dr. Reyes", text: "What seems to be the problem today?" },
    { speaker: "B", name: "Kareem", text: "I've had a sore throat for three days, and last night I felt hot." },
    { speaker: "A", name: "Dr. Reyes", text: "Any coughing or difficulty swallowing?" },
    { speaker: "B", name: "Kareem", text: "Swallowing hurts a little, but I don't cough at night." },
    { speaker: "A", name: "Dr. Reyes", text: "It looks like a mild infection. You'll be fine in a few days with rest." },
  ], ["throat", "three", "hot", "swallowing", "rest"]),
  base("B1", "conv-b1-apartment", "Renting an Apartment", "A viewing with a landlord", "Mr. Haddad", "Claire", [
    { speaker: "A", name: "Mr. Haddad", text: "So, the flat has two bedrooms and the rent includes water." },
    { speaker: "B", name: "Claire", text: "Good. Is electricity separate? And what about internet?" },
    { speaker: "A", name: "Mr. Haddad", text: "Electricity is billed monthly, but fibre internet is already installed." },
    { speaker: "B", name: "Claire", text: "That works for me since I work from home most days." },
    { speaker: "A", name: "Mr. Haddad", text: "Perfect. When would you like to move in?" },
  ], ["bedrooms", "rent", "electricity", "internet", "home"]),
  base("B2", "conv-b2-negotiation", "Closing a Deal", "Two managers negotiate a contract", "Sofia", "Richard", [
    { speaker: "A", name: "Sofia", text: "We're prepared to offer twenty units per month at the agreed rate." },
    { speaker: "B", name: "Richard", text: "The rate worked last year, but our costs have shifted. We need five percent more." },
    { speaker: "A", name: "Sofia", text: "Five percent is difficult. What if we extend the contract to eighteen months instead?" },
    { speaker: "B", name: "Richard", text: "Longer security does help us plan. Let's say three percent plus the extension." },
    { speaker: "A", name: "Sofia", text: "Agreed, pending a quick review from our legal team." },
  ], ["units", "rate", "percent", "contract", "legal"]),
  base("C1", "conv-c1-startup", "Scaling Pains", "A founder on a business podcast", "Priya", "Marco", [
    { speaker: "A", name: "Priya", text: "Your team tripled in a year. What broke first?" },
    { speaker: "B", name: "Marco", text: "Honestly, decision-making. Every hire added context, but also coordination overhead nobody had budgeted for." },
    { speaker: "A", name: "Priya", text: "How did you respond — more process, or fewer decisions?" },
    { speaker: "B", name: "Marco", text: "Neither, at first. We mapped which choices actually needed founders, then delegated the rest explicitly." },
    { speaker: "A", name: "Priya", text: "So the bottleneck was never headcount; it was clarity about ownership." },
  ], ["tripled", "coordination", "process", "delegated", "ownership"]),
  base("C2", "conv-c2-ethics", "The Ethics of Attention", "A philosopher interviewed about technology", "Nadia", "Prof. Lang", [
    { speaker: "A", name: "Nadia", text: "Is designing apps to maximise attention inherently exploitative?" },
    { speaker: "B", name: "Prof. Lang", text: "Not inherently — but when the business model monetises regret, exploitation becomes structural rather than incidental." },
    { speaker: "A", name: "Nadia", text: "Can regulation fix that without freezing innovation?" },
    { speaker: "B", name: "Prof. Lang", text: "Regulation shapes incentives; it cannot supply the virtues regulation presupposes. Both are necessary." },
    { speaker: "A", name: "Nadia", text: "A sober conclusion — neither techno-optimism nor resignation." },
  ], ["attention", "monetises", "structural", "incentives", "virtues"]),
];

export function conversationForLevel(level: CEFRLevel): ConversationExercise {
  const pool = CONVERSATIONS.filter((item) => item.level === level);
  if (pool.length === 0) return CONVERSATIONS.find((item) => item.level === "A1")!;
  return rotate(pool, level, "conversation");
}


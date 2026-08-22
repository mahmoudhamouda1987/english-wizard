import type { CEFRLevel } from "./learner";

export interface RoleplayScenario {
  id: string;
  title: string;
  level: CEFRLevel;
  situation: string;
  partnerRole: string;
  opener: string;
  /** Scripted partner turns used when no AI key is configured — one per user turn, cycling with variations. */
  fallbacks: string[];
  targetPhrases: string[];
}

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: "rp-cafe",
    title: "Order at a café",
    level: "Pre-A1",
    situation: "You walk into a café. Order a drink and something to eat, then ask the price.",
    partnerRole: "barista",
    opener: "Hi there! Welcome. What can I get for you today?",
    fallbacks: [
      "Great choice! Would you like anything to eat with that?",
      "Sure. Anything else for you today?",
      "That'll be four pounds fifty, please.",
      "Lovely! Take a seat and I'll bring it over.",
    ],
    targetPhrases: ["Could I have", "please", "How much"],
  },
  {
    id: "rp-interview",
    title: "Job interview",
    level: "B1",
    situation: "You are interviewing for a position at an international company. Introduce yourself and answer questions.",
    partnerRole: "hiring manager",
    opener: "Thanks for coming in. To start, could you tell me a little about yourself and your background?",
    fallbacks: [
      "Interesting. What would you say is your greatest professional strength?",
      "Can you give me a specific example of when you used that skill?",
      "Why do you want to work with us specifically?",
      "Where do you see yourself in three years?",
      "Do you have any questions for me about the role?",
    ],
    targetPhrases: ["In my current role", "For example", "I would say", "I am particularly proud of"],
  },
  {
    id: "rp-hotel",
    title: "Hotel complaint",
    level: "A2",
    situation: "Your hotel room's air conditioning is broken and it is very hot. Complain politely at reception.",
    partnerRole: "receptionist",
    opener: "Good evening! How can I help you?",
    fallbacks: [
      "Oh dear, I'm sorry to hear that. Which room are you staying in?",
      "I see. Have you tried adjusting the thermostat on the wall?",
      "Apologies for that. I can send maintenance up right away, or move you to another room.",
      "We've arranged a new room for you — same price, better view.",
    ],
    targetPhrases: ["I'm afraid", "Could you please", "The problem is"],
  },
  {
    id: "rp-doctor",
    title: "At the doctor",
    level: "A2",
    situation: "You have felt unwell for three days. Describe your symptoms to the doctor.",
    partnerRole: "doctor",
    opener: "Come in, take a seat. What seems to be the problem?",
    fallbacks: [
      "I see. How long have you had these symptoms?",
      "Any fever, coughing, or difficulty swallowing?",
      "Let me check your temperature. It's slightly raised.",
      "It looks like a mild infection. Rest, fluids, and this prescription — you'll be fine in a few days.",
    ],
    targetPhrases: ["I've had", "It hurts when", "Since yesterday"],
  },
  {
    id: "rp-meeting",
    title: "Disagree in a meeting",
    level: "C1",
    situation: "A colleague proposes cutting the testing phase to ship faster. Push back diplomatically.",
    partnerRole: "colleague",
    opener: "So my proposal is simple: we cut QA from four weeks to one and hit the March deadline. Thoughts?",
    fallbacks: [
      "Fair point — but surely one week of testing is enough for a minor release?",
      "What specific risks are you actually worried about?",
      "Couldn't we just hotfix anything that slips through?",
      "Alright, suppose leadership asks why we missed March — what do we tell them?",
      "Okay, you've made a compelling case. Let's propose the phased approach instead.",
    ],
    targetPhrases: ["I see the appeal, however", "The data suggests", "May I offer an alternative"],
  },
];

export function scenarioById(id: string): RoleplayScenario | undefined {
  return ROLEPLAY_SCENARIOS.find((s) => s.id === id);
}

export function scriptedReply(scenario: RoleplayScenario, userTurnCount: number): string {
  return scenario.fallbacks[Math.min(userTurnCount, scenario.fallbacks.length - 1)];
}

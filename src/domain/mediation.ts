import type { CEFRLevel, Skill } from "./learner";

export type MediationMode = "RELAY" | "SUMMARIZE" | "EXPLAIN" | "FACILITATE" | "COLLABORATIVE";
export type MediationSource = "NOTICE" | "EMAIL" | "ARTICLE" | "MEETING" | "DATA" | "POLICY";

export interface MediationActivity {
  id: string;
  level: CEFRLevel;
  mode: MediationMode;
  sourceType: MediationSource;
  sourceText: string;
  learnerRole: string;
  targetAudience: string;
  goal: string;
  constraints: string[];
  successCriteria: string[];
  transferPrompt: string;
  skills: Skill[];
}

export interface MediationAssessment {
  taskId: string;
  score: number;
  fulfilledGoal: boolean;
  preservedKeyMeaning: boolean;
  adaptedToAudience: boolean;
  managedLanguage: boolean;
  evidenceNotes: string[];
  nextStep: "RETRY" | "TRANSFER" | "REVIEW";
}

const LEVEL_RANK: Record<CEFRLevel, number> = {
  "Pre-A1": 0,
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

export const MEDIATION_ACTIVITIES: MediationActivity[] = [
  {
    id: "med-a2-relay-notice",
    level: "A2",
    mode: "RELAY",
    sourceType: "NOTICE",
    sourceText: "The library closes at 6 pm today. The study room is unavailable after 4 pm because of maintenance.",
    learnerRole: "Tell a classmate who has not read the notice.",
    targetAudience: "A classmate",
    goal: "Pass on the two practical changes clearly.",
    constraints: ["Do not copy the notice word for word.", "Keep both times accurate."],
    successCriteria: ["Includes both key facts", "Uses language appropriate for a classmate", "Avoids changing the times"],
    transferPrompt: "Explain a different practical change from a short notice to someone who needs to act on it.",
    skills: ["reading", "speaking"],
  },
  {
    id: "med-b1-summary-email",
    level: "B1",
    mode: "SUMMARIZE",
    sourceType: "EMAIL",
    sourceText: "The team meeting has moved from Tuesday to Wednesday at 10. Maria asks everyone to bring one idea for reducing support response time.",
    learnerRole: "Update a colleague who missed the email.",
    targetAudience: "A busy colleague",
    goal: "Give the essential change and action in a short message.",
    constraints: ["Be concise.", "Do not add a new deadline."],
    successCriteria: ["Communicates the new meeting time", "States the required preparation", "Uses concise workplace language"],
    transferPrompt: "Give a colleague a concise update from a longer workplace message.",
    skills: ["reading", "writing", "speaking"],
  },
  {
    id: "med-b2-article-explain",
    level: "B2",
    mode: "EXPLAIN",
    sourceType: "ARTICLE",
    sourceText: "A company report says remote onboarding reduced first-month questions by 18%, but new staff reported weaker informal connections with teammates.",
    learnerRole: "Explain the finding to a manager deciding whether to extend remote onboarding.",
    targetAudience: "A manager",
    goal: "Present the useful finding and the trade-off without overstating the evidence.",
    constraints: ["Separate evidence from interpretation.", "Mention both the benefit and the limitation."],
    successCriteria: ["Preserves the 18% result", "Explains the trade-off", "Uses appropriately cautious language"],
    transferPrompt: "Explain a short evidence summary to a decision-maker while preserving uncertainty and trade-offs.",
    skills: ["reading", "speaking", "writing"],
  },
  {
    id: "med-c1-meeting-facilitate",
    level: "C1",
    mode: "FACILITATE",
    sourceType: "MEETING",
    sourceText: "Three colleagues disagree about whether to prioritize speed, reliability or cost in the next release.",
    learnerRole: "Facilitate the discussion and help the group reach a usable decision.",
    targetAudience: "A mixed-experience project team",
    goal: "Clarify positions, surface the trade-off and move the group toward a decision.",
    constraints: ["Represent each position fairly.", "Do not decide for the group.", "Make the trade-off explicit."],
    successCriteria: ["Clarifies competing priorities", "Represents positions accurately", "Moves discussion toward a shared decision"],
    transferPrompt: "Facilitate a different disagreement by reframing positions and identifying common ground.",
    skills: ["listening", "speaking", "mediation"],
  },
  {
    id: "med-c2-policy-synthesis",
    level: "C2",
    mode: "COLLABORATIVE",
    sourceType: "POLICY",
    sourceText: "A policy proposal expands access to a public service while adding eligibility checks intended to prevent misuse. Critics argue the checks could exclude people who need the service most.",
    learnerRole: "Brief a policy group before a negotiation.",
    targetAudience: "Policy specialists with competing priorities",
    goal: "Synthesize the proposal and criticism, expose assumptions and prepare the group for negotiation.",
    constraints: ["Do not present contested claims as settled facts.", "Identify at least one unresolved assumption."],
    successCriteria: ["Synthesizes competing positions", "Preserves uncertainty", "Makes assumptions explicit", "Frames a productive negotiation question"],
    transferPrompt: "Mediate a complex disagreement by synthesizing positions, assumptions and unresolved questions.",
    skills: ["reading", "writing", "speaking", "mediation"],
  },
];

export function getMediationActivitiesForLevel(level: CEFRLevel): MediationActivity[] {
  const rank = LEVEL_RANK[level];
  return MEDIATION_ACTIVITIES.filter((item) => LEVEL_RANK[item.level] <= rank);
}

export function assessMediation(activity: MediationActivity, response: string): MediationAssessment {
  const normalized = response.trim();
  const wordCount = normalized ? normalized.split(/\s+/).length : 0;
  const fulfilledGoal = wordCount >= (LEVEL_RANK[activity.level] >= 4 ? 35 : 15);
  const preservedKeyMeaning = activity.successCriteria.every((criterion) => {
    const keywords = criterion.toLowerCase().split(/\W+/).filter((word) => word.length > 4);
    return keywords.length === 0 || keywords.some((keyword) => normalized.toLowerCase().includes(keyword));
  });
  const adaptedToAudience = activity.targetAudience.length > 0 && normalized.length >= 40;
  const managedLanguage = /\b(however|but|because|so|therefore|although|although|might|may|could|should)\b/i.test(normalized);

  let score = 0;
  score += fulfilledGoal ? 25 : 0;
  score += preservedKeyMeaning ? 30 : 0;
  score += adaptedToAudience ? 20 : 0;
  score += managedLanguage ? 25 : 0;
  score = Math.min(100, score);

  const evidenceNotes = [
    fulfilledGoal ? "Response has enough content to attempt the mediation goal." : "Response is too short to demonstrate the full mediation goal.",
    preservedKeyMeaning ? "Some success criteria language is reflected in the response." : "One or more success criteria require another attempt.",
    adaptedToAudience ? "Response has enough contextual language to evaluate audience adaptation." : "Audience adaptation needs clearer evidence.",
    managedLanguage ? "The response uses explicit relationships/qualification language." : "The response needs clearer relationships or qualification between ideas.",
  ];

  return {
    taskId: activity.id,
    score,
    fulfilledGoal,
    preservedKeyMeaning,
    adaptedToAudience,
    managedLanguage,
    evidenceNotes,
    nextStep: score < 60 ? "RETRY" : score < 80 ? "TRANSFER" : "REVIEW",
  };
}

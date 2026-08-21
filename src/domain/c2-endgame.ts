export type C2EndgameStageId =
  | "morning_briefing"
  | "stakeholder_meeting"
  | "rapid_analysis"
  | "social_conversation"
  | "written_decision"
  | "evening_debrief";

export interface C2EndgameStage {
  id: C2EndgameStageId;
  title: string;
  scenario: string;
  requiredSkills: Array<"reading" | "listening" | "speaking" | "writing" | "mediation">;
  evidence: string[];
  successCriteria: string[];
}

export interface C2EndgameState {
  stageIndex: number;
  completedStageIds: C2EndgameStageId[];
  evidence: Record<string, number>;
  startedAt?: string;
  completedAt?: string;
}

export const C2_ENDGAME_STAGES: C2EndgameStage[] = [
  {
    id: "morning_briefing",
    title: "Morning Briefing",
    scenario: "Read a concise briefing, identify uncertainty and explain the key implications to a colleague.",
    requiredSkills: ["reading", "speaking"],
    evidence: ["source-synthesis", "qualified-claim"],
    successCriteria: ["distinguish-fact-from-inference", "state-implications-clearly"],
  },
  {
    id: "stakeholder_meeting",
    title: "Stakeholder Meeting",
    scenario: "Listen to competing stakeholder positions, negotiate a workable compromise and defend the decision.",
    requiredSkills: ["listening", "speaking", "mediation"],
    evidence: ["turn-management", "objection-response", "register-shift"],
    successCriteria: ["manage-disagreement", "adapt-to-stakeholder", "defend-compromise"],
  },
  {
    id: "rapid_analysis",
    title: "Rapid Analysis",
    scenario: "Process incomplete information under time pressure and explain what is known, unknown and most likely.",
    requiredSkills: ["reading", "listening", "speaking"],
    evidence: ["decision-under-uncertainty", "nuanced-explanation"],
    successCriteria: ["prioritise-information", "calibrate-certainty"],
  },
  {
    id: "social_conversation",
    title: "Social Conversation",
    scenario: "Move naturally between informal conversation, humour, clarification and a sensitive disagreement.",
    requiredSkills: ["listening", "speaking"],
    evidence: ["natural-interaction", "repair-strategy", "register-shift"],
    successCriteria: ["maintain-natural-flow", "repair-misunderstanding", "adjust-register"],
  },
  {
    id: "written_decision",
    title: "Written Decision",
    scenario: "Write a concise decision note that synthesises the discussion, trade-offs, risks and next actions.",
    requiredSkills: ["reading", "writing", "mediation"],
    evidence: ["source-synthesis", "structured-writing", "audience-adaptation"],
    successCriteria: ["synthesise-relevant-points", "make-trade-offs-explicit", "write-for-audience"],
  },
  {
    id: "evening_debrief",
    title: "Evening Debrief",
    scenario: "Reflect on the day, defend one difficult decision and explain how your position changed after new evidence.",
    requiredSkills: ["speaking", "writing"],
    evidence: ["metacognitive-explanation", "position-revision", "precise-response"],
    successCriteria: ["justify-revision", "separate-confidence-from-certainty", "reflect-precisely"],
  },
];

export function initialC2EndgameState(now = new Date().toISOString()): C2EndgameState {
  return { stageIndex: 0, completedStageIds: [], evidence: {}, startedAt: now };
}

export function currentC2EndgameStage(state: C2EndgameState): C2EndgameStage | undefined {
  return C2_ENDGAME_STAGES[state.stageIndex];
}

export function completeC2EndgameStage(
  state: C2EndgameState,
  stageId: C2EndgameStageId,
  evidence: Record<string, number>,
  now = new Date().toISOString(),
): C2EndgameState {
  const stage = currentC2EndgameStage(state);
  if (!stage || stage.id !== stageId) throw new Error("C2 endgame stage is not the current stage.");
  if (stage.successCriteria.some((criterion) => !(evidence[criterion] >= 1))) {
    throw new Error("C2 endgame stage requires evidence for every success criterion.");
  }

  const mergedEvidence = { ...state.evidence };
  for (const [key, value] of Object.entries(evidence)) mergedEvidence[key] = (mergedEvidence[key] ?? 0) + value;
  for (const tag of stage.evidence) mergedEvidence[tag] = (mergedEvidence[tag] ?? 0) + 1;
  const completedStageIds = [...state.completedStageIds, stage.id];
  const nextIndex = state.stageIndex + 1;
  return {
    ...state,
    stageIndex: nextIndex,
    completedStageIds,
    evidence: mergedEvidence,
    completedAt: nextIndex >= C2_ENDGAME_STAGES.length ? now : undefined,
  };
}

export function isC2EndgameComplete(state: C2EndgameState): boolean {
  return state.completedStageIds.length === C2_ENDGAME_STAGES.length && state.stageIndex >= C2_ENDGAME_STAGES.length;
}

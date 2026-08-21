import type { CEFRLevel } from "./learner";
import { BOSS_MISSIONS, MISSIONS, type Mission } from "./missions";
import type { NextActionRecommendation } from "./next-action";
import { CEFR_SESSION_TYPES, type SessionType } from "./advanced-learning";

export interface DailyMissionContext {
  level: CEFRLevel;
  nextAction?: NextActionRecommendation | null;
  dueReviews: number;
  recurringErrors: number;
  recentMissionIds: string[];
}

export interface DailyMissionPlan {
  mission: Mission;
  sessionType: SessionType;
  rationale: string;
  focus: "SKILL_GAP" | "RETENTION" | "ERROR_REPAIR" | "PROGRESS";
}

function levelMissions(level: CEFRLevel): Mission[] {
  return [...MISSIONS, ...BOSS_MISSIONS].filter((mission) => mission.level === level);
}

export function chooseDailyMission(context: DailyMissionContext): DailyMissionPlan {
  const candidates = levelMissions(context.level);
  const recent = new Set(context.recentMissionIds);
  const nonRecent = candidates.filter((mission) => !recent.has(mission.id));
  const pool = nonRecent.length ? nonRecent : candidates;
  const action = context.nextAction?.type;

  if (context.recurringErrors > 0 && action === "practice") {
    return { mission: pool[0], sessionType: "QUICK_QUEST", rationale: "Recurring errors are currently the strongest actionable signal.", focus: "ERROR_REPAIR" };
  }
  if (context.dueReviews > 0 || action === "review") {
    return { mission: pool[0], sessionType: "QUICK_QUEST", rationale: "Retention evidence is due, so the daily mission begins with retrieval.", focus: "RETENTION" };
  }

  const supported = CEFR_SESSION_TYPES[context.level === "Pre-A1" ? "PRE_A1" : context.level];
  const sessionType = supported.includes("STANDARD_JOURNEY") ? "STANDARD_JOURNEY" : supported[0];
  return { mission: pool[0], sessionType, rationale: "No urgent retention or error signal dominates; continue the next capability gap.", focus: "PROGRESS" };
}

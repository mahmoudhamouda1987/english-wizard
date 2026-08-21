import type { LearnerState } from "./learner";

export type NextActionType = "lesson" | "review" | "assessment" | "rest" | "listening" | "vocabulary" | "pronunciation" | "writing" | "practice";

export interface NextActionRecommendation {
  type: NextActionType;
  id: string;
  reason: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export function recommendNextAction(state: LearnerState): NextActionRecommendation {
  const unresolved = state.errors
    .filter((error) => error.status !== "resolved")
    .sort((a, b) => {
      const severityRank = { high: 3, medium: 2, low: 1 } as const;
      return (severityRank[b.severity] - severityRank[a.severity]) || (b.occurrences - a.occurrences);
    });

  const highError = unresolved.find((error) => error.severity === "high");
  if (highError) {
    return { type: "practice", id: highError.objectiveId, reason: `Recurring high-priority error: ${highError.description}`, priority: "HIGH" };
  }

  const mediumError = unresolved[0];
  if (mediumError) {
    const type: NextActionType = mediumError.skill === "listening"
      ? "listening"
      : mediumError.skill === "vocabulary"
        ? "vocabulary"
        : mediumError.skill === "pronunciation"
          ? "pronunciation"
          : mediumError.skill === "writing"
            ? "writing"
            : "practice";
    return { type, id: mediumError.objectiveId, reason: `Practice the skill where your latest evidence shows a recurring issue: ${mediumError.description}`, priority: "MEDIUM" };
  }

  const weakest = [...state.mastery].sort((a, b) => a.score - b.score)[0];
  if (weakest && weakest.score < 60) {
    const type: NextActionType = weakest.skill === "listening"
      ? "listening"
      : weakest.skill === "vocabulary"
        ? "vocabulary"
        : weakest.skill === "pronunciation"
          ? "pronunciation"
          : weakest.skill === "writing"
            ? "writing"
            : weakest.skill === "speaking"
              ? "practice"
              : "lesson";
    return { type, id: `skill-${weakest.skill}`, reason: `${weakest.skill} is currently your lowest observed mastery area at ${Math.round(weakest.score)}%.`, priority: "MEDIUM" };
  }

  if (state.currentLessonId) {
    return { type: "lesson", id: state.currentLessonId, reason: "Continue the lesson already in progress so the learning loop can reach production and transfer.", priority: "LOW" };
  }

  return { type: "review", id: "daily-review", reason: "No unresolved high-priority issue is currently blocking progress; retrieve previously learned material next.", priority: "LOW" };
}

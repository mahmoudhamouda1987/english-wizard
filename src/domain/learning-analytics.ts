export interface LearningEvent {
  event_type: string;
  payload: Record<string, unknown>;
  occurred_at: string;
}

export interface LearningAnalyticsSummary {
  sessionsObserved: number;
  activitiesCompleted: number;
  evidenceProduced: number;
  averagePerformance: number | null;
  recentPerformance: number | null;
  masterySignals: number;
  recurringErrors: number;
  reviewDue: number;
  retentionSignal: number | null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function summarizeLearningEvents(events: LearningEvent[], reviewDue = 0): LearningAnalyticsSummary {
  const performance = events.map((event) => numberValue(event.payload.performanceScore)).filter((value): value is number => value !== null);
  const masterySignals = events.filter((event) => event.event_type.includes("mastery") || event.payload.masteryState).length;
  const recurringErrors = events.filter((event) => event.event_type === "error" || event.payload.errorId).length;
  const activitiesCompleted = events.filter((event) => event.event_type === "lesson_completed" || event.event_type === "activity_completed").length;
  const evidenceProduced = events.filter((event) => event.payload.evidenceId || event.payload.evidenceIds).length;
  const sessionsObserved = events.filter((event) => event.event_type === "session_started").length;
  const averagePerformance = performance.length ? Math.round(performance.reduce((a,b)=>a+b,0) / performance.length) : null;
  const recent = performance.slice(-5);
  const recentPerformance = recent.length ? Math.round(recent.reduce((a,b)=>a+b,0) / recent.length) : null;
  const retentionSignal = performance.length >= 3 ? Math.max(0, Math.min(1, (recentPerformance ?? 0) / 100)) : null;
  return { sessionsObserved, activitiesCompleted, evidenceProduced, averagePerformance, recentPerformance, masterySignals, recurringErrors, reviewDue, retentionSignal };
}

export interface ProductActivityRow {
  learner_id: string;
  occurred_at: Date | string;
}

export interface ProductMetrics {
  totalLearners: number;
  activeLearners7d: number;
  activeLearners30d: number;
  evidenceEvents30d: number;
  aiRequests30d: number;
  medianSessionsPerActiveLearner: number;
  day7RetentionRate: number | null;
}

function toTime(value: Date | string): number {
  return new Date(value).getTime();
}

export function countActive(rows: ProductActivityRow[], withinDays: number, now = Date.now()): number {
  const cutoff = now - withinDays * 24 * 60 * 60 * 1000;
  return new Set(rows.filter((row) => toTime(row.occurred_at) >= cutoff).map((row) => row.learner_id)).size;
}

export function medianSessionsPerLearner(rows: ProductActivityRow[], withinDays: number, now = Date.now()): number {
  const cutoff = now - withinDays * 24 * 60 * 60 * 1000;
  const perLearner = new Map<string, Set<number>>();
  for (const row of rows) {
    const time = toTime(row.occurred_at);
    if (time < cutoff) continue;
    const days = perLearner.get(row.learner_id) ?? new Set<number>();
    days.add(Math.floor(time / (24 * 60 * 60 * 1000)));
    perLearner.set(row.learner_id, days);
  }
  const counts = [...perLearner.values()].map((days) => days.size).sort((a, b) => a - b);
  if (!counts.length) return 0;
  const mid = Math.floor(counts.length / 2);
  return counts.length % 2 ? counts[mid] : Math.round(((counts[mid - 1] + counts[mid]) / 2) * 10) / 10;
}

export function day7Retention(rows: ProductActivityRow[], registrations: Map<string, number>, now = Date.now()): number | null {
  const cohortCutoff = now - 7 * 24 * 60 * 60 * 1000;
  const eligible = [...registrations.entries()].filter(([, joinedAt]) => joinedAt <= cohortCutoff);
  if (!eligible.length) return null;
  let returned = 0;
  for (const [learnerId, joinedAt] of eligible) {
    const windowStart = joinedAt + 6 * 24 * 60 * 60 * 1000;
    const windowEnd = joinedAt + 8 * 24 * 60 * 60 * 1000;
    if (rows.some((row) => row.learner_id === learnerId && toTime(row.occurred_at) >= windowStart && toTime(row.occurred_at) <= windowEnd)) returned += 1;
  }
  return Math.round((returned / eligible.length) * 100) / 100;
}

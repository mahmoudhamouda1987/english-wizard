export interface RetentionEstimate {
  halfLifeDays: number;
  elapsedDays: number;
  probability: number;
  status: "SECURE" | "DUE_SOON" | "AT_RISK";
}

export function estimateHalfLife(intervalDays: number, ease: number, repetitions: number): number {
  const interval = Math.max(1, Number(intervalDays) || 1);
  const stability = Math.max(1, Number(ease) || 1) / 1.7;
  const repetitionBoost = 1 + Math.min(2, Math.max(0, repetitions)) * 0.12;
  return Math.max(1, interval * stability * repetitionBoost);
}

export function forgettingProbability(elapsedDays: number, halfLifeDays: number): number {
  const elapsed = Math.max(0, elapsedDays);
  const halfLife = Math.max(0.25, halfLifeDays);
  return Math.pow(0.5, elapsed / halfLife);
}

export function estimateRetention(input: {
  lastReviewedAt: string | Date;
  now?: string | Date;
  intervalDays: number;
  ease: number;
  repetitions: number;
}): RetentionEstimate {
  const now = new Date(input.now ?? new Date());
  const reviewed = new Date(input.lastReviewedAt);
  const elapsedDays = Math.max(0, (now.getTime() - reviewed.getTime()) / 86_400_000);
  const halfLifeDays = estimateHalfLife(input.intervalDays, input.ease, input.repetitions);
  const probability = forgettingProbability(elapsedDays, halfLifeDays);
  return {
    halfLifeDays: Number(halfLifeDays.toFixed(2)),
    elapsedDays: Number(elapsedDays.toFixed(2)),
    probability: Number(probability.toFixed(3)),
    status: probability >= 0.8 ? "SECURE" : probability >= 0.5 ? "DUE_SOON" : "AT_RISK",
  };
}

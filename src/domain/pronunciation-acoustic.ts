export interface AcousticPronunciationMetrics {
  durationMs: number;
  speechLikeRatio: number;
  silenceRatio: number;
  rmsMean: number;
  zeroCrossingRate: number;
  wordsPerMinuteEstimate: number | null;
}

export interface AcousticPronunciationAssessment {
  score: number;
  signals: string[];
  limitations: string[];
}

export function assessAcousticPronunciation(metrics: AcousticPronunciationMetrics, expectedWordCount: number): AcousticPronunciationAssessment {
  const durationSeconds = Math.max(metrics.durationMs / 1000, 0.25);
  const wpm = Number.isFinite(metrics.wordsPerMinuteEstimate ?? NaN)
    ? metrics.wordsPerMinuteEstimate
    : (expectedWordCount > 0 ? (expectedWordCount / durationSeconds) * 60 : null);

  let score = 45;
  score += Math.min(20, Math.max(0, metrics.speechLikeRatio) * 20);
  score += Math.min(15, Math.max(0, metrics.rmsMean) * 15);
  score += Math.min(15, Math.max(0, 1 - Math.max(0, metrics.silenceRatio)) * 15);
  if (wpm !== null) {
    const rhythmPenalty = Math.min(20, Math.abs(wpm - 100) / 5);
    score -= rhythmPenalty;
  }

  const signals: string[] = [];
  if (metrics.silenceRatio > 0.45) signals.push("Frequent or long pauses detected.");
  if (metrics.speechLikeRatio < 0.45) signals.push("A low speech-like signal ratio was detected.");
  if (wpm !== null && wpm < 70) signals.push("Speech appears slow relative to the expected phrase length.");
  if (wpm !== null && wpm > 170) signals.push("Speech appears fast relative to the expected phrase length.");
  if (signals.length === 0) signals.push("Acoustic timing and energy signals are within the expected practice range.");

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    signals,
    limitations: [
      "These are acoustic practice proxies, not phoneme-level pronunciation scores.",
      "No claim is made about exact sound accuracy, accent quality, or CEFR certification.",
    ],
  };
}

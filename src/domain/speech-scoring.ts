/** Word-level speech scoring: compares what the learner said against the target phrase. */

export interface SpeechScore {
  accuracy: number; // 0–100
  matched: string[];
  missing: string[];
  extra: string[];
}

export function normaliseWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function longestCommonSubsequenceTable(a: string[], b: string[]): number[][] {
  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      table[i][j] = a[i - 1] === b[j - 1]
        ? table[i - 1][j - 1] + 1
        : Math.max(table[i - 1][j], table[i][j - 1]);
    }
  }
  return table;
}

/**
 * Scores a spoken attempt against the target using word-level LCS alignment.
 * Accuracy rewards every target word recognised in order; extra inserted words
 * reduce the score mildly so rambling cannot game it.
 */
export function scoreSpeech(target: string, transcript: string): SpeechScore {
  const targetWords = normaliseWords(target);
  const saidWords = normaliseWords(transcript);

  if (targetWords.length === 0) return { accuracy: 0, matched: [], missing: [], extra: [] };
  if (saidWords.length === 0) return { accuracy: 0, matched: [], missing: [...targetWords], extra: [] };

  const table = longestCommonSubsequenceTable(targetWords, saidWords);

  // Walk the LCS path to collect matched / missing / extra words.
  const matched: string[] = [];
  const missing: string[] = [];
  let i = targetWords.length;
  let j = saidWords.length;
  while (i > 0 && j > 0) {
    if (targetWords[i - 1] === saidWords[j - 1]) {
      matched.unshift(targetWords[i - 1]);
      i--; j--;
    } else if (table[i - 1][j] >= table[i][j - 1]) {
      missing.unshift(targetWords[i - 1]);
      i--;
    } else {
      j--;
    }
  }
  while (i > 0) { missing.unshift(targetWords[i - 1]); i--; }

  const extraSet = new Set(saidWords);
  for (const m of matched) extraSet.delete(m);
  const extra = [...extraSet];

  const recall = matched.length / targetWords.length;
  const precisionPenalty = Math.min(0.2, Math.max(0, extra.length * 0.03));
  const accuracy = Math.max(0, Math.min(100, Math.round((recall - precisionPenalty) * 100)));
  return { accuracy, matched, missing, extra };
}

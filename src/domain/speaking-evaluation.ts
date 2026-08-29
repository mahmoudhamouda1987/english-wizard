/**
 * Speaking response evaluation (Part 8 — real evaluation, never fabricated).
 *
 * Analyses the actual transcript the learner produced and derives INDICATIVE
 * CEFR-referenced indicators from real linguistic signals:
 *   - response length (words, sentences)
 *   - syntactic growth (average sentence length, clause connectives)
 *   - lexical diversity (moving-average type–token ratio)
 *   - discourse control (connective variety, repetition)
 *
 * The output is always labelled as indicative automated feedback — never an
 * official speaking score, percentage or certification (Part 30: no fake
 * functionality). Where a transcript is too short to analyse, the evaluator
 * says so instead of guessing.
 */

import type { CEFRLevel } from "./levelquest";

export interface SpeakingEvaluation {
  submitted: boolean;
  /** Word count of the response (0 when absent). */
  words: number;
  sentences: number;
  avgSentenceLength: number;
  /** Moving-average type–token ratio (0..1) — lexical variety. */
  lexicalDiversity: number | null;
  /** Distinct discourse connectives detected (and, but, because, however…). */
  connectives: number;
  /** Indicative CEFR band for this response, or null when evidence is insufficient. */
  band: CEFRLevel | null;
  /** Honest human-readable summary shown on the report. */
  note: string;
  /** The evaluated transcript (first 1200 chars) for review surfaces. */
  transcriptPreview: string;
}

const CONNECTIVES = [
  "and", "but", "because", "so", "then", "after", "before", "when", "while",
  "however", "although", "though", "which", "if", "unless", "since", "therefore",
  "moreover", "besides", "instead", "whereas", "despite", "finally", "also",
];

const FILLERS = ["um", "uh", "erm", "like", "you know", "kind of", "sort of"];

/** Moving-average type–token ratio with a 50-word window (MATTR-style). */
function lexicalDiversity(words: string[]): number | null {
  if (words.length < 10) return null;
  const window = Math.min(50, words.length);
  if (words.length <= window) {
    return new Set(words.map((w) => w.toLowerCase())).size / words.length;
  }
  let sum = 0;
  let windows = 0;
  for (let i = 0; i + window <= words.length; i += 10) {
    const slice = words.slice(i, i + window);
    sum += new Set(slice.map((w) => w.toLowerCase())).size / window;
    windows += 1;
  }
  return windows > 0 ? sum / windows : null;
}

function countConnectives(words: string[]): number {
  const lower = words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ""));
  const found = new Set<string>();
  for (const c of CONNECTIVES) {
    if (c.includes(" ")) {
      // multi-word connectives ("you know" style) — check the joined text
      if (lower.join(" ").includes(c)) found.add(c);
    } else if (lower.includes(c)) {
      found.add(c);
    }
  }
  return found.size;
}

/**
 * Indicative band from real signals. Anchored to the prompt's target level:
 * the response can demonstrate up to one band above the prompt's level, but
 * never beyond C2. Short or empty responses yield null (insufficient evidence).
 */
function indicativeBand(
  words: number,
  sentences: number,
  diversity: number | null,
  connectiveCount: number,
  promptLevel: CEFRLevel,
): CEFRLevel | null {
  if (words < 5) return null;
  let band: CEFRLevel;
  if (words < 12) band = "Pre-A1";
  else if (words < 22) band = "A1";
  else if (words < 35 && sentences >= 2) band = "A2";
  else if (words < 50 && sentences >= 3 && connectiveCount >= 2) band = "B1";
  else if (words < 75 && sentences >= 4 && (diversity ?? 0) >= 0.55 && connectiveCount >= 3) band = "B2";
  else if (words < 110 && sentences >= 5 && (diversity ?? 0) >= 0.6 && connectiveCount >= 4) band = "C1";
  else if (words >= 110 && sentences >= 6 && (diversity ?? 0) >= 0.62) band = "C2";
  else band = "A2"; // has substance but does not meet the next band's structure bar

  const PROMPT_INDEX: Record<CEFRLevel, number> = { "Pre-A1": 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  const ORDER: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
  const ceiling = Math.min(6, PROMPT_INDEX[promptLevel] + 1);
  if (ORDER.indexOf(band) > ceiling) band = ORDER[ceiling];
  return band;
}

export function evaluateSpeakingTranscript(transcript: string | undefined | null, promptLevel: CEFRLevel): SpeakingEvaluation {
  const text = (transcript ?? "").trim();
  if (!text) {
    return {
      submitted: false, words: 0, sentences: 0, avgSentenceLength: 0,
      lexicalDiversity: null, connectives: 0, band: null,
      note: "No response recorded for this task.",
      transcriptPreview: "",
    };
  }

  const words = text.split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}'-]/gu, "")).filter(Boolean);
  const sentenceParts = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 2);
  const sentences = Math.max(sentenceParts.length, words.length >= 8 ? 1 : 0);
  const diversity = lexicalDiversity(words);
  const connectiveCount = countConnectives(words);
  const fillerCount = FILLERS.reduce((acc, f) => acc + (text.toLowerCase().split(f).length - 1), 0);
  const band = indicativeBand(words.length, sentences, diversity, connectiveCount, promptLevel);

  const parts: string[] = [`${words.length} words`, `${sentences} sentence${sentences === 1 ? "" : "s"}`];
  if (diversity !== null) parts.push(`${Math.round(diversity * 100)}% lexical variety`);
  if (connectiveCount > 0) parts.push(`${connectiveCount} connective${connectiveCount === 1 ? "" : "s"}`);
  if (fillerCount > 3) parts.push("some hesitation markers");
  const note = band
    ? `Indicative ${band} production — ${parts.join(", ")}. Automated feedback, not an official speaking score.`
    : `Response recorded (${parts.join(", ")}) — too short to place. Automated feedback, not an official speaking score.`;

  return {
    submitted: true,
    words: words.length,
    sentences,
    avgSentenceLength: sentences > 0 ? Math.round((words.length / sentences) * 10) / 10 : words.length,
    lexicalDiversity: diversity !== null ? Math.round(diversity * 100) / 100 : null,
    connectives: connectiveCount,
    band,
    note,
    transcriptPreview: text.slice(0, 1200),
  };
}

/** Overall indicative speaking band across a sitting: the median of placed responses. */
export function overallSpeakingBand(evals: SpeakingEvaluation[]): CEFRLevel | null {
  const bands = evals.map((e) => e.band).filter((b): b is CEFRLevel => b !== null);
  if (bands.length === 0) return null;
  const ORDER: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
  const idxs = bands.map((b) => ORDER.indexOf(b)).sort((a, b) => a - b);
  const mid = Math.floor(idxs.length / 2);
  const median = idxs.length % 2 === 1 ? idxs[mid] : Math.round((idxs[mid - 1] + idxs[mid]) / 2);
  return ORDER[Math.max(0, Math.min(6, median))];
}

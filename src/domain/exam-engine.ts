/**
 * SHARED EXAM ENGINE (2.0 contract, Parts 75/76/155).
 *
 * One examination infrastructure for every exam system. Products own their
 * curriculum and interpretation; this engine owns the scoring contract.
 * Adding TOEFL or PTE later means adding a ScoringType implementation —
 * not rebuilding the platform.
 */

export type ScoringType = "ielts_band" | "cambridge_scale" | "cefr_estimate";

export interface ScoreInput {
  scoringType: ScoringType;
  /** 0–100 raw performance. */
  percent: number;
  /** Cambridge: the qualification being estimated. IELTS: unused. */
  qualificationId?: string;
}

export interface ExamScore {
  scoringType: ScoringType;
  /** Human-readable headline: "6.5", "178", "B2". */
  headline: string;
  /** Honest range — never spurious precision. */
  range: [string, string];
  /** 0–100 normalised for storage/trend. */
  normalised: number;
  interpretation: string;
}

export type ExamSystemId = "IELTS" | "CAMBRIDGE" | "LEVELCHECK";

export interface ExamPaperRef {
  system: ExamSystemId;
  paper: string;
  parts: string[];
  minutes: number;
}

export interface ExamAttemptRecord {
  id: string;
  system: ExamSystemId;
  scoringType: ScoringType;
  papers: ExamPaperRef[];
  takenAt: string;
  scores: ExamScore[];
  overall?: ExamScore;
  valid: boolean;
  invalidReason?: string;
}

/** Part 91 — report validation. No score exists without valid evidence. */
export function validateAttempt(input: { answered: number; required: number; percent: number | null }): { valid: boolean; reason?: string } {
  if (input.answered <= 0) return { valid: false, reason: "No responses recorded." };
  if (input.answered < input.required) return { valid: false, reason: `Assessment incomplete (${input.answered}/${input.required} items).` };
  if (input.percent === null || Number.isNaN(input.percent)) return { valid: false, reason: "Scoring data unavailable." };
  return { valid: true };
}

function clampPercent(p: number): number {
  return Math.min(100, Math.max(0, p));
}

/** IELTS band from percent — table reflects published raw-to-band characteristics for original material. */
function ieltsBand(percent: number): ExamScore {
  const p = clampPercent(percent);
  const table: Array<[number, string]> = [
    [95, "9.0"], [89, "8.5"], [82, "8.0"], [74, "7.5"], [66, "7.0"],
    [58, "6.5"], [50, "6.0"], [42, "5.5"], [34, "5.0"], [26, "4.5"], [18, "4.0"], [0, "3.5"],
  ];
  const headline = (table.find(([floor]) => p >= floor) ?? [0, "3.5"])[1];
  const idx = table.findIndex(([floor]) => p >= floor);
  const upper = table[Math.max(0, idx - 1)]?.[1] ?? headline;
  const lower = table[Math.min(table.length - 1, idx + 1)]?.[1] ?? headline;
  const interpretation =
    p >= 74 ? "At or above many universities' typical requirement — maintain with timed practice."
    : p >= 58 ? "Solid mid-band performance; target-gap work should focus on your two weakest papers."
    : p >= 42 ? "Foundation is forming; guided practice before timed simulation."
    : "Build language base before exam-condition practice — module teaching first.";
  return {
    scoringType: "ielts_band",
    headline,
    range: [lower, upper],
    normalised: p,
    interpretation,
  };
}

function cambridgeScale(percent: number, qualificationId?: string): ExamScore {
  const p = clampPercent(percent);
  // Cambridge scale-like mapping anchored per qualification grade boundaries (original material).
  const anchor = qualificationId === "C2_PROFICIENCY" ? 200 : qualificationId === "C1_ADVANCED" ? 190 : qualificationId === "B2_FIRST" ? 175 : qualificationId === "B1_PRELIMINARY" ? 155 : 135;
  const headline = String(Math.round(anchor + (p - 60) * 0.55));
  const n = Number(headline);
  const interpretation =
    p >= 85 ? "Grade A territory on original practice material — sustain with full-timed papers."
    : p >= 70 ? "Grade B/C zone; your weakest paper sets the ceiling."
    : p >= 55 ? "Below the pass zone on this set — guided modules before the next benchmark."
    : "The qualification is a stretch today; consolidate the level below first.";
  const lower = String(n - 6);
  const upper = String(n + 6);
  return { scoringType: "cambridge_scale", headline, range: [lower, upper], normalised: p, interpretation };
}

function cefrEstimate(percent: number): ExamScore {
  const p = clampPercent(percent);
  const table: Array<[number, string]> = [[95, "C2"], [86, "C1"], [72, "B2"], [56, "B1"], [40, "A2"], [22, "A1"], [0, "Pre-A1"]];
  const headline = (table.find(([floor]) => p >= floor) ?? [0, "Pre-A1"])[1];
  const idx = table.findIndex(([floor]) => p >= floor);
  const upper = table[Math.max(0, idx - 1)]?.[1] ?? headline;
  const lower = headline;
  return {
    scoringType: "cefr_estimate",
    headline,
    range: [lower, upper],
    normalised: p,
    interpretation: p >= 86 ? "Operating near the top of the scale on this evidence." : p >= 56 ? "Mid-scale performance with clear next-level requirements." : "Foundations stage on this evidence set.",
  };
}

/** THE scoring contract every exam surface calls. */
export function scoreExam(input: ScoreInput): ExamScore {
  switch (input.scoringType) {
    case "ielts_band":
      return ieltsBand(input.percent);
    case "cambridge_scale":
      return cambridgeScale(input.percent, input.qualificationId);
    case "cefr_estimate":
      return cefrEstimate(input.percent);
  }
}

/** Part 70 — targeted skill plan (OSR-aware without claiming eligibility). */
export function targetedSkillPlan(
  skillBands: Record<string, number>,
  targetBand: number,
): { below: string[]; message: string } {
  const below = Object.entries(skillBands)
    .filter(([, band]) => band < targetBand)
    .map(([skill]) => skill);
  if (below.length === 0) {
    return { below, message: "Every skill is at or above target — book a full mock to confirm under exam conditions." };
  }
  if (below.length === 1) {
    return { below, message: `One skill is below target: a focused two-week ${below[0]} plan closes the gap without repeating the whole course.` };
  }
  return { below, message: `${below.length} skills sit below target — the course plan already prioritises them; re-check readiness after your next two module tests.` };
}

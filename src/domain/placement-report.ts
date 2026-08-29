/**
 * Placement report document model.
 *
 * Single source of truth for everything the candidate-facing report displays
 * (PDF and web). Enforces the document's evidence rules:
 *   - a final level is only ever presented alongside valid response data;
 *   - unassessed skills are labelled "Not assessed" — never scored, never inferred;
 *   - strengths / development priorities are drawn only from assessed skills;
 *   - internal system information (variant, adaptive estimate scale) never
 *     reaches the candidate-facing document.
 */

import { createHash } from "crypto";

export const CEFR_LEVELS = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

/** Skills displayed on the report, in display order. */
export const REPORT_SKILLS = ["listening", "speaking", "reading", "writing", "grammar", "vocabulary"] as const;
export type ReportSkill = (typeof REPORT_SKILLS)[number];

const SKILL_LABELS: Record<ReportSkill, string> = {
  listening: "Listening",
  speaking: "Speaking",
  reading: "Reading",
  writing: "Writing",
  grammar: "Grammar",
  vocabulary: "Vocabulary",
};

const OBJECTIVE_SKILLS = ["grammar", "vocabulary", "reading", "listening"] as const;

const LEVEL_NAMES: Record<CefrLevel, string> = {
  "Pre-A1": "STARTER",
  A1: "ELEMENTARY",
  A2: "PRE-INTERMEDIATE",
  B1: "INTERMEDIATE",
  B2: "UPPER INTERMEDIATE",
  C1: "ADVANCED",
  C2: "PROFICIENT",
};

/** CEFR global-scale interpretation, presented as a framework reading — never as candidate claims. */
const LEVEL_MEANINGS: Record<CefrLevel, string> = {
  "Pre-A1":
    "At Pre-A1 level, learners can recognise familiar words and very basic phrases concerning themselves, their family and their immediate surroundings when people speak slowly and clearly.",
  A1:
    "At A1 level, learners can understand and use familiar everyday expressions and very basic phrases aimed at the satisfaction of concrete needs, and interact in a simple way provided the other person talks slowly and clearly.",
  A2:
    "At A2 level, learners can understand sentences and frequently used expressions related to areas of everyday life, communicate in simple and routine tasks, and describe aspects of their background and immediate environment.",
  B1:
    "At B1, learners can generally understand the main points of clear standard English, manage many everyday situations and describe experiences, events, plans and opinions with reasonable fluency.",
  B2:
    "At B2 level, learners can understand the main ideas of complex text, interact with a degree of fluency and spontaneity that makes regular interaction with proficient speakers possible, and present clear, detailed arguments on a wide range of subjects.",
  C1:
    "At C1 level, learners can understand demanding texts and recognise implicit meaning, express ideas fluently and spontaneously, and use language flexibly and effectively for social, academic and professional purposes.",
  C2:
    "At C2 level, learners can understand virtually everything heard or read, summarise information from different spoken and written sources, and express themselves spontaneously, very fluently and precisely, differentiating finer shades of meaning.",
};

export const ASSESSMENT_METHOD = "Adaptive CEFR-Aligned Assessment";

export const METHODOLOGY_TEXT =
  "English Wizard's placement assessment uses an adaptive assessment approach to estimate the learner's English proficiency across the assessed language skills. Question difficulty responds to demonstrated performance to help identify the candidate's most appropriate CEFR-referenced level. Proficiency is referenced to the Common European Framework of Reference for Languages (CEFR), the international standard for describing language ability.";

export const INCOMPLETE_MESSAGE =
  "No valid assessment responses were recorded. Complete the assessment to receive a placement result.";

export type PlacementReportInput = {
  reportId: string;
  level: string | null;
  confidence: string | null;
  boundary?: string | null;
  skillProfile: Record<string, string>;
  skillScores: Record<string, number>;
  skillAnswered: Record<string, number>;
  answeredCount: number | null;
  presentedCount?: number | null;
  speakingSubmitted: boolean;
  speakingResponses?: number | null;
  speakingBand?: string | null;
  displayName: string | null;
  studentId: string | null;
  createdAt: string | Date;
  durationSeconds?: number | null;
  lowEvidenceSkills?: string[];
};

export type SkillRow = {
  skill: ReportSkill;
  label: string;
  assessed: boolean;
  level: string | null;
  score: number | null;
  questions: number | null;
  lowEvidence: boolean;
  evidence: string;
};

export type PlacementReportDoc = {
  status: "COMPLETE" | "INCOMPLETE";
  reportRef: string;
  candidate: string;
  studentId: string;
  dateLong: string;
  method: string;
  result: {
    level: CefrLevel;
    name: string;
    confidence: string;
    boundary: string | null;
    meaning: string;
  } | null;
  cefrIndex: number;
  nextMilestone: string | null;
  programme: string;
  stats: { label: string; value: string }[];
  skills: SkillRow[];
  strengths: { label: string; score: number; questions: number }[];
  strengthsNote: string;
  priorities: { label: string; score: number; questions: number }[];
  prioritiesNote: string;
};

/**
 * Deterministic public document reference, e.g. "EW-RPT-7F4K82".
 * Derived from the report UUID (stable across renders); the unguessable
 * verification key remains the full UUID carried in the QR target.
 */
export function reportReference(uuid: string): string {
  const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford-style: no 0/O/1/I/L/U
  const digest = createHash("sha256").update(`ew-report:${uuid}`).digest();
  let ref = "";
  for (let i = 0; i < 6; i++) ref += ALPHABET[digest[i] % ALPHABET.length];
  return `EW-RPT-${ref}`;
}

export function isValidLevel(level: string | null | undefined): level is CefrLevel {
  return typeof level === "string" && (CEFR_LEVELS as readonly string[]).includes(level);
}

function nextLevelOf(level: CefrLevel): CefrLevel | null {
  const idx = CEFR_LEVELS.indexOf(level);
  return idx >= 0 && idx < CEFR_LEVELS.length - 1 ? CEFR_LEVELS[idx + 1] : null;
}

function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds || seconds <= 0 || !Number.isFinite(seconds)) return null;
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return "Under a minute";
  return `${minutes} min`;
}

export function buildPlacementReportDoc(input: PlacementReportInput): PlacementReportDoc {
  const objectiveAnswered = OBJECTIVE_SKILLS.reduce((sum, s) => sum + (input.skillAnswered?.[s] ?? 0), 0);
  const complete = isValidLevel(input.level) && objectiveAnswered > 0;
  const level = complete ? (input.level as CefrLevel) : null;
  const reportRef = reportReference(input.reportId);
  const date = new Date(input.createdAt);
  const dateLong = date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const answered = (skill: ReportSkill): number =>
    skill === "speaking"
      ? (input.speakingSubmitted ? (input.speakingResponses ?? 0) : 0)
      : skill === "writing"
        ? 0
        : (input.skillAnswered?.[skill] ?? 0);

  const skills: SkillRow[] = REPORT_SKILLS.map((skill) => {
    const questions = answered(skill);
    const assessed = skill === "writing" ? false : questions > 0;
    const lowEvidence = (input.lowEvidenceSkills ?? []).includes(skill);
    return {
      skill,
      label: SKILL_LABELS[skill],
      assessed,
      level: assessed ? ((skill === "speaking" ? (input.speakingBand ?? null) : (input.skillProfile?.[skill] as string | null)) ?? null) : null,
      score: assessed && skill !== "speaking" ? (input.skillScores?.[skill] ?? null) : null,
      questions: assessed ? questions : 0,
      lowEvidence,
      evidence: assessed
        ? skill === "speaking"
          ? "Recorded and typed responses, reviewed in conversation."
          : skill === "writing"
            ? "Not part of this assessment sitting."
            : `${questions} question${questions === 1 ? "" : "s"} answered${lowEvidence ? " — limited evidence" : ""}`
        : skill === "writing"
          ? "Not part of this assessment sitting."
          : "Not assessed in this sitting.",
    };
  });

  const assessedObjective = OBJECTIVE_SKILLS.filter((s) => (input.skillAnswered?.[s] ?? 0) > 0);
  const rankedAssessed = assessedObjective
    .map((s) => ({ label: SKILL_LABELS[s], score: input.skillScores?.[s] ?? 0, questions: input.skillAnswered?.[s] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const strengths = rankedAssessed.slice(0, 2);
  const priorities = [...rankedAssessed].reverse().slice(0, 2);
  const hasSpeakingEvidence = input.speakingSubmitted;

  const responsesAnalysed = complete ? (input.answeredCount ?? objectiveAnswered + (hasSpeakingEvidence ? (input.speakingResponses ?? 0) : 0)) : 0;
  const questionsCompleted = input.presentedCount ?? input.answeredCount ?? null;
  const duration = formatDuration(input.durationSeconds);
  const skillsAssessed = skills.filter((s) => s.assessed).length;

  const stats: { label: string; value: string }[] = complete
    ? [
        { label: "Responses analysed", value: String(responsesAnalysed) },
        ...(questionsCompleted != null ? [{ label: "Questions presented", value: String(questionsCompleted) }] : []),
        ...(duration ? [{ label: "Assessment duration", value: duration }] : []),
        { label: "Skills assessed", value: `${skillsAssessed} of 5` },
      ]
    : [];

  const next = level ? nextLevelOf(level) : null;

  return {
    status: complete ? "COMPLETE" : "INCOMPLETE",
    reportRef,
    candidate: (input.displayName ?? "").trim() || "Candidate",
    studentId: (input.studentId ?? "").trim() || "—",
    dateLong,
    method: ASSESSMENT_METHOD,
    result: level
      ? {
          level,
          name: LEVEL_NAMES[level],
          confidence: (input.confidence ?? "Moderate").trim() || "Moderate",
          boundary: (input.boundary ?? "").trim() || null,
          meaning: LEVEL_MEANINGS[level],
        }
      : null,
    cefrIndex: level ? CEFR_LEVELS.indexOf(level) : -1,
    nextMilestone: next,
    programme: level ? `English Wizard ${level} Programme` : "English Wizard Programme",
    stats,
    skills,
    strengths,
    strengthsNote:
      strengths.length > 0
        ? "Relative strengths among the skills assessed in this sitting."
        : "Insufficient assessment evidence to establish strengths.",
    priorities,
    prioritiesNote:
      priorities.length > 0
        ? "Skills that would benefit most from focused practice, based on this sitting."
        : "Insufficient assessment evidence to establish development priorities.",
  };
}

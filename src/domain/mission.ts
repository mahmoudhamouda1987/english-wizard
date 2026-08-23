/**
 * Lesson mission layer: turns each lesson's topic cluster into a life
 * simulation brief — recurring cast, an AI role-play situation, a level-right
 * writing challenge and a real-life mission the learner can actually do.
 */
import { topicsForLesson, rungForLevel, stageForLevel } from "./topics";
import { castFor, continuityLine } from "./characters";
import { MVP_LESSONS } from "./curriculum";
import type { CEFRLevel } from "./learner";

export interface MissionBrief {
  lessonId: string;
  stageName: string;
  stageClaim: string;
  topicTitles: string[];
  ladderExamples: string[];
  cast: string[];
  roleplay: { scenarioId: string; situation: string; yourRole: string; partnerRole: string; goal: string };
  writing: { genre: string; prompt: string; minWords: number; maxWords: number };
  speakingChallenge: string;
  realLifeMission: string;
}

const RP_BY_LEVEL: Record<string, string> = {
  "Pre-A1": "rp-cafe",
  A1: "rp-cafe",
  A2: "rp-hotel",
  B1: "rp-doctor",
  B2: "rp-meeting",
  C1: "rp-meeting",
  C2: "rp-interview",
};

const WRITING_BY_LEVEL: Record<CEFRLevel, Array<{ genre: string; min: number; max: number }>> = {
  "Pre-A1": [{ genre: "labels & short messages", min: 8, max: 40 }],
  A1: [{ genre: "short personal sentences", min: 20, max: 70 }],
  A2: [{ genre: "short message or simple email", min: 40, max: 120 }],
  B1: [{ genre: "connected opinion paragraph / email", min: 80, max: 200 }],
  B2: [{ genre: "professional email or short report", min: 130, max: 320 }],
  C1: [{ genre: "analytical report or argument", min: 200, max: 450 }],
  C2: [{ genre: "nuanced essay / persuasive professional piece", min: 260, max: 600 }],
};

export function missionFor(lessonId: string): MissionBrief | undefined {
  const lesson = MVP_LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  const set = topicsForLesson(lessonId);
  const [a, b] = castFor(lessonId);
  const stage = stageForLevel(lesson.level);
  const main = set.primary[0];
  const second = set.primary[1] ?? main;
  const ladderExamples = [
    rungForLevel(main?.id ?? "", lesson.level)?.example,
    rungForLevel(second?.id ?? "", lesson.level)?.example,
  ].filter((x): x is string => Boolean(x));

  const writingOptions = WRITING_BY_LEVEL[lesson.level];
  const w = writingOptions[lesson.sequence % writingOptions.length];

  return {
    lessonId,
    stageName: stage.name,
    stageClaim: stage.claim,
    topicTitles: set.primary.map((t) => t.title),
    ladderExamples,
    cast: [continuityLine(a.profile), continuityLine(b.profile)],
    roleplay: {
      scenarioId: RP_BY_LEVEL[lesson.level] ?? "rp-cafe",
      situation: `A realistic ${main?.title.toLowerCase() ?? "daily life"} situation at ${lesson.title.replace(/^.*?:\s*/, "")} difficulty (${lesson.level}).`,
      yourRole: "yourself, in the situation",
      partnerRole: `${a.profile.name}, who is ${a.profile.occupation}`,
      goal: `Handle the situation so both sides understand each other — use language from this lesson's scenes.`,
    },
    writing: {
      genre: w.genre,
      prompt: `Write about "${main?.title ?? lesson.title}" from your own life as ${w.genre}. Use at least two expressions you met in this lesson.`,
      minWords: w.min,
      maxWords: w.max,
    },
    speakingChallenge: `Speak for 60–90 seconds about ${second?.title.toLowerCase() ?? "the lesson topic"}: describe one real experience, then give your opinion.`,
    realLifeMission: buildRealLifeMission(main?.title ?? "", second?.title ?? ""),
  };
}

function buildRealLifeMission(a: string, b: string): string {
  return `Within the next 48 hours: use this lesson in real life — write or say something connected to ${a}${b ? ` and ${b}` : ""} to a real person (message, post, voice note or conversation). Bring the result back here as evidence.`;
}

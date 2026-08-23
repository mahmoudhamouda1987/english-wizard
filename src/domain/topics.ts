/**
 * 150-topic master curriculum engine.
 *
 * Every topic declares its home lesson via `lessonId`, so LESSON_TOPIC_MAP is
 * derived directly from the library (5 primary topics per lesson; the lesson-28
 * capstone integrates the final 15). Topics evolve across CEFR levels through
 * their ladder, and deliberate REVISITS bring earlier topics back at higher
 * difficulty in later lessons — a progression engine, not a flat list.
 */
import { TOPICS_150_A, type Topic150 } from "./topics150-a";
import { TOPICS_150_B } from "./topics150-b";
import { TOPICS_150_C } from "./topics150-c";
import { TOPICS_150_D } from "./topics150-d";
import { TOPICS_150_E } from "./topics150-e";
import { TOPICS_150_F } from "./topics150-f";
import type { CEFRLevel } from "./learner";

export type { Topic150 };

export interface LadderRung { level: string; example: string }

/** A life topic in the master library (full metadata superset). */
export type LifeTopic = Topic150;

export const LIFE_TOPICS: Topic150[] = [
  ...TOPICS_150_A, ...TOPICS_150_B, ...TOPICS_150_C,
  ...TOPICS_150_D, ...TOPICS_150_E, ...TOPICS_150_F,
];

const byId = new Map(LIFE_TOPICS.map((topic) => [topic.id, topic]));

/** Primary topic cluster per lesson — derived from each topic's declared home lesson, ordered by topic number. */
export const LESSON_TOPIC_MAP: Record<string, string[]> = Object.fromEntries(
  (() => {
    const map = new Map<string, string[]>();
    for (const topic of LIFE_TOPICS) {
      const ids = map.get(topic.lessonId) ?? [];
      ids.push(topic.id);
      map.set(topic.lessonId, ids);
    }
    return map;
  })(),
);

/** Deliberate spaced-retrieval revisits: earlier topics reappearing later at higher difficulty. */
export const REVISITS: Array<{ lessonId: string; topicId: string; angle: string }> = [
  { lessonId: "lesson-05-health-body", topicId: "daily-routines", angle: "illness, rest and healthy daily habits" },
  { lessonId: "lesson-08-future-plans", topicId: "prices-money-payment", angle: "planning and budgeting for future goals" },
  { lessonId: "lesson-12-travel-international", topicId: "travel-basics", angle: "real trips: airports, hotels and problems abroad" },
  { lessonId: "lesson-14-money-personal-finance", topicId: "shopping-everyday-items", angle: "consumer choices and spending discipline" },
  { lessonId: "lesson-16-society-culture", topicId: "celebrations-special-occasions", angle: "festivals across cultures and what they reveal" },
  { lessonId: "lesson-18-professional-communication", topicId: "workplace-communication", angle: "professional register and difficult messages" },
  { lessonId: "lesson-19-problem-solving-decisions", topicId: "travel-problems", angle: "structured troubleshooting under time pressure" },
  { lessonId: "lesson-22-psychology-human-mind", topicId: "basic-feelings-emotions", angle: "emotional granularity beyond happy and sad" },
  { lessonId: "lesson-23-leadership-personal-development", topicId: "career-ambitions", angle: "turning ambition into systems" },
  { lessonId: "lesson-26-advanced-argumentation", topicId: "conflict-disagreement", angle: "disagreement as structured debate" },
  { lessonId: "lesson-28-real-world-mastery", topicId: "job-interviews", angle: "capstone interview performance integrating every skill" },
];

export interface LessonTopicSet {
  primary: LifeTopic[];
  revisited: Array<{ topic: LifeTopic; angle: string }>;
}

export function topicsForLesson(lessonId: string): LessonTopicSet {
  const ids = LESSON_TOPIC_MAP[lessonId] ?? [];
  return {
    primary: ids.map((id) => byId.get(id)).filter((t): t is LifeTopic => Boolean(t)),
    revisited: REVISITS.filter((r) => r.lessonId === lessonId)
      .map((r) => ({ topic: byId.get(r.topicId), angle: r.angle }))
      .filter((r): r is { topic: LifeTopic; angle: string } => Boolean(r.topic)),
  };
}

export function lessonsForTopic(topicId: string): string[] {
  const lessons = Object.entries(LESSON_TOPIC_MAP).filter(([, ids]) => ids.includes(topicId)).map(([id]) => id);
  const revisitLessons = REVISITS.filter((r) => r.topicId === topicId).map((r) => r.lessonId);
  return [...new Set([...lessons, ...revisitLessons])];
}

export function topicById(topicId: string): LifeTopic | undefined {
  return byId.get(topicId);
}

/** The difficulty evolution of one topic across levels — the heart of the engine. */
export function ladderFor(topicId: string): LadderRung[] {
  return byId.get(topicId)?.ladder ?? [];
}

/** Closest ladder rung for a target level (exact match, else nearest below). */
export function rungForLevel(topicId: string, level: CEFRLevel | string): LadderRung | undefined {
  const order: string[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
  const ladder = ladderFor(topicId);
  if (ladder.length === 0) return undefined;
  const li = Math.max(0, order.indexOf(String(level)));
  let best: LadderRung | undefined;
  for (const rung of ladder) {
    const ri = order.indexOf(rung.level);
    if (ri >= 0 && ri <= li) best = rung;
  }
  return best ?? ladder[0];
}

// ---- Life progression stages ------------------------------------------------

export interface LifeStage { name: string; claim: string }
const STAGES: Array<{ levels: CEFRLevel[]; stage: LifeStage }> = [
  { levels: ["Pre-A1"], stage: { name: "SURVIVE", claim: "I can understand and communicate basic needs." } },
  { levels: ["A1"], stage: { name: "FUNCTION", claim: "I can manage everyday life." } },
  { levels: ["A2"], stage: { name: "CONNECT", claim: "I can socialise and communicate with other people." } },
  { levels: ["B1"], stage: { name: "STUDY", claim: "I can learn, work and discuss ideas." } },
  { levels: ["B2"], stage: { name: "WORK", claim: "I can function professionally and hold my own." } },
  { levels: ["C1"], stage: { name: "ADVANCE", claim: "I can lead, negotiate, persuade and analyse." } },
  { levels: ["C2"], stage: { name: "DEBATE", claim: "I can defend, challenge and refine ideas with precision." } },
];

export function stageForLevel(level: CEFRLevel | string): LifeStage {
  return STAGES.find((s) => s.levels.includes(level as CEFRLevel))?.stage ?? STAGES[0].stage;
}

export function topicEngineStats() {
  const assigned = new Set<string>();
  for (const ids of Object.values(LESSON_TOPIC_MAP)) for (const id of ids) assigned.add(id);
  return {
    totalTopics: LIFE_TOPICS.length,
    assignedTopics: assigned.size,
    unassigned: LIFE_TOPICS.filter((t) => !assigned.has(t.id)).map((t) => t.id),
    lessonsWithClusters: Object.keys(LESSON_TOPIC_MAP).length,
    ladderedTopics: LIFE_TOPICS.filter((t) => t.ladder.length >= 2).length,
  };
}

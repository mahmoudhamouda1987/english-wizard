/**
 * 100-topic life simulation curriculum engine.
 *
 * The master topic library feeds the 28-lesson progression: each lesson owns a
 * coherent cluster of real-life topics, and every topic evolves across CEFR
 * levels through its ladder. Topics may be revisited at higher difficulty in
 * later lessons (see REVISITS), turning the library into a progression engine
 * rather than a flat list.
 */
import { TOPICS_A, type LifeTopic, type TopicCategory, type LadderRung } from "./topics-a";
import { TOPICS_B } from "./topics-b";
import { TOPICS_C } from "./topics-c";
import { TOPICS_D } from "./topics-d";
import type { CEFRLevel } from "./learner";

export type { LifeTopic, TopicCategory, LadderRung };

export const LIFE_TOPICS: LifeTopic[] = [...TOPICS_A, ...TOPICS_B, ...TOPICS_C, ...TOPICS_D];

const byId = new Map(LIFE_TOPICS.map((topic) => [topic.id, topic]));

/** Primary topic cluster per lesson — coherent life domains, weighted toward professional/global themes at higher levels. */
export const LESSON_TOPIC_MAP: Record<string, string[]> = {
  // Pre-A1 — survive: immediate personal world
  "lesson-prea1-survival": ["meeting-people", "weather-seasons"],
  "lesson-prea1-sounds": ["family-relatives", "home-living"],
  "lesson-prea1-reading": ["shopping-everyday", "clothes-style"],
  "lesson-prea1-listening": ["food-meals", "neighborhood-community"],
  // A1 — function: daily life and simple socialising
  "lesson-a1-self-introduction": ["time-schedules", "personality-character"],
  "lesson-a1-routines": ["daily-routines", "health-wellbeing"],
  "lesson-a1-questions": ["hobbies-free-time", "entertainment-music"],
  "lesson-a1-listening": ["restaurants-ordering", "invitations-plans"],
  // A2 — connect: manage everyday life socially
  "lesson-a2-interactions": ["transportation", "help-directions", "friends-socializing"],
  "lesson-a2-past": ["travel-holidays", "celebrations-traditions", "culture-customs"],
  "lesson-a2-messages": ["relationships-communication", "conflict-apologies", "hotels-accommodation"],
  "lesson-a2-listening": ["doctor-healthcare", "emotions-feelings", "sports-activities"],
  // B1 — study: independent adult life, money, information
  "lesson-b1-conversation": ["school-university", "languages-study-skills", "decisions-problem-solving"],
  "lesson-b1-writing": ["exams-goals-academic", "choosing-career", "goals-growth"],
  "lesson-b1-listening": ["news-media-information", "jobs-workplace", "workplace-communication"],
  "lesson-b1-reading": ["money-personal-finance", "banking-payments", "saving-budgeting"],
  // B2 — work/advance: professional & business English
  "lesson-b2-argument": ["job-interviews", "negotiation-persuasion", "customer-service", "communication-styles", "confidence-self-expression", "success-failure-resilience"],
  "lesson-b2-writing": ["job-applications-cv", "starting-new-job", "marketing-branding", "time-management-productivity", "stress-balance", "ethics-values-choices"],
  "lesson-b2-listening": ["meetings-presentations", "teamwork-collaboration", "performance-feedback", "remote-work-collaboration", "ai-future-work", "smartphones-apps"],
  "lesson-b2-reading": ["leadership-management", "problem-solving-work", "sales-business-development", "starting-business", "entrepreneurship-innovation", "running-small-business"],
  // C1 — think: complex professional, social and global discussion
  "lesson-c1-discussion": ["loans-debt", "investing-wealth", "buying-home-property", "economy-cost-of-living", "business-ideas-opportunities"],
  "lesson-c1-writing": ["business-finance-profit", "business-markets-trade", "globalization-international-business", "international-relations-challenges", "energy-resources-future"],
  "lesson-c1-listening": ["environment-sustainability", "science-medicine-progress", "space-exploration-universe", "poverty-inequality-mobility", "migration-living-abroad"],
  "lesson-c1-reading": ["government-politics-citizenship", "diversity-inclusion-perspectives", "critical-thinking-information", "online-safety-privacy", "social-media-influence"],
  // C2 — debate/master: sophisticated abstract thought
  "lesson-c2-speaking": ["freedom-responsibility-choice", "human-behavior-psychology", "leadership-power-influence", "big-ideas-arguments-debates"],
  "lesson-c2-writing": ["philosophy-meaning-life", "happiness-good-life", "love-human-connection", "vision-future-your-place"],
  "lesson-c2-listening": ["technology-everyday", "internet-social-media", "technology-vs-humanity", "future-of-humanity"],
  "lesson-c2-reading": ["motivation-discipline-habits", "law-rules-rights", "cities-urban-life", "war-peace-resolution"],
};

/** Deliberate spaced-retrieval revisits: topics reappearing later at higher difficulty. */
export const REVISITS: Array<{ lessonId: string; topicId: string; angle: string }> = [
  { lessonId: "lesson-a2-interactions", topicId: "shopping-everyday", angle: "returns, complaints and polite haggling" },
  { lessonId: "lesson-b1-reading", topicId: "food-meals", angle: "food systems, labels and consumer choices" },
  { lessonId: "lesson-b2-argument", topicId: "money-personal-finance", angle: "should I save this or invest it?" },
  { lessonId: "lesson-b2-listening", topicId: "health-wellbeing", angle: "burnout, prevention and workplace wellbeing debates" },
  { lessonId: "lesson-c1-discussion", topicId: "travel-holidays", angle: "overtourism vs economies that depend on it" },
  { lessonId: "lesson-c1-listening", topicId: "technology-everyday", angle: "smart cities and algorithmic daily life" },
  { lessonId: "lesson-c2-speaking", topicId: "ai-future-work", angle: "is machine creativity still creativity?" },
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

// ---- Life progression stages (§16) -----------------------------------------

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
  for (const r of REVISITS) assigned.add(r.topicId);
  return {
    totalTopics: LIFE_TOPICS.length,
    assignedTopics: assigned.size,
    unassigned: LIFE_TOPICS.filter((t) => !assigned.has(t.id)).map((t) => t.id),
    lessonsWithClusters: Object.keys(LESSON_TOPIC_MAP).length,
    ladderedTopics: LIFE_TOPICS.filter((t) => t.ladder.length >= 2).length,
  };
}

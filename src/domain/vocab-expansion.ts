/**
 * Vocabulary top-up engine: every lesson must surface >=20 audio words.
 * Authored lesson vocab stays first; curated topical glossary keys follow,
 * and a CEFR band pool guarantees the floor of 20 in every lesson.
 */
import type { GlossEntry } from "./glossary-ar-1";
import { GLOSSARY_AR_1 } from "./glossary-ar-1";
import { GLOSSARY_AR_2 } from "./glossary-ar-2";
import type { CEFRLevel } from "./learner";
import { LESSON_TOPIC_MAP, LIFE_TOPICS } from "./topics";

const GLOSSARIES: Record<string, GlossEntry> = { ...GLOSSARY_AR_1, ...GLOSSARY_AR_2 };

/** Topical top-up keys per lesson, derived live from each lesson's own topics' curated vocabulary. */
const TOPICAL: Record<string, string[]> = Object.fromEntries(
  Object.entries(LESSON_TOPIC_MAP).map(([lessonId, ids]) => {
    const words = new Set<string>();
    for (const id of ids) {
      const topic = LIFE_TOPICS.find((t) => t.id === id);
      if (!topic) continue;
      for (const raw of topic.vocab) {
        const key = raw.toLowerCase().replace(/[.!?]$/, "").trim();
        if (key.length <= 24 && GLOSSARIES[key]) words.add(key);
        if (words.size >= 12) break;
      }
      if (words.size >= 12) break;
    }
    return [lessonId, [...words]];
  }),
);

const BAND_POOLS: Record<CEFRLevel, string[]> = {
  "Pre-A1": ["hello", "hi", "goodbye", "please", "thanks", "sorry", "yes", "no", "welcome", "excuse", "water", "bread", "tea", "cake", "food", "home", "family", "friend", "help", "eat", "drink", "buy", "morning", "night", "day", "today"],
  A1: ["name", "time", "today", "tomorrow", "week", "coffee", "rice", "chicken", "fruit", "menu", "shop", "station", "school", "teacher", "student", "question", "answer", "book", "english", "practice", "mistake", "happy", "good", "new", "big", "small"],
  A2: ["yesterday", "afternoon", "evening", "month", "monday", "friday", "hour", "house", "office", "hospital", "street", "market", "restaurant", "hotel", "room", "meeting", "email", "job", "plan", "idea", "problem", "busy", "late", "early", "free", "delicious"],
  B1: ["colleague", "neighbour", "deadline", "appointment", "schedule", "manager", "interview", "salary", "report", "project", "team", "improve", "recommend", "invite", "explain", "remember", "forget", "decide", "progress", "goal", "opinion", "reason", "confident", "difficult", "important", "busy"],
  B2: ["evidence", "certificate", "level", "progress", "goal", "plan", "idea", "opinion", "reason", "problem", "decide", "improve", "recommend", "explain", "remember", "understand", "important", "difficult", "confident", "reliable", "generous", "convenient", "deadline", "interview", "salary", "manager"],
  C1: ["evidence", "certificate", "opinion", "reason", "idea", "goal", "progress", "decide", "improve", "recommend", "explain", "understand", "important", "difficult", "confident", "reliable", "generous", "convenient", "apologise", "complain", "deadline", "schedule", "appointment", "interview", "certificate", "level"],
  C2: ["evidence", "opinion", "reason", "idea", "decide", "understand", "important", "difficult", "confident", "reliable", "generous", "convenient", "apologise", "apologize", "complain", "recommend", "explain", "improve", "progress", "certificate", "schedule", "appointment", "deadline", "salary", "interview", "manager"],
};

export function expandVocab(
  original: Array<GlossEntry & { word: string }>,
  lessonId: string,
  level: CEFRLevel,
): Array<GlossEntry & { word: string }> {
  const seen = new Set(original.map((v) => v.word.toLowerCase()));
  const out: Array<GlossEntry & { word: string }> = [...original];
  const pushKey = (key: string): boolean => {
    const g = GLOSSARIES[key];
    if (!g || seen.has(key)) return false;
    seen.add(key);
    out.push({ word: key, ar: g.ar, pos: g.pos, en: g.en });
    return true;
  };
  for (const key of TOPICAL[lessonId] ?? []) pushKey(key);
  for (const key of BAND_POOLS[level] ?? []) {
    if (out.length >= 20) break;
    pushKey(key);
  }
  if (out.length < 20) {
    const otherBands = (Object.keys(BAND_POOLS) as CEFRLevel[]).filter((l) => l !== level);
    for (const band of otherBands) {
      for (const key of BAND_POOLS[band]) {
        if (out.length >= 20) break;
        pushKey(key);
      }
      if (out.length >= 20) break;
    }
  }
  return out.slice(0, Math.max(20, original.length));
}

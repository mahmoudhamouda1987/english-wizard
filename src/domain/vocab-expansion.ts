/**
 * Vocabulary top-up engine: every lesson must surface >=20 audio words.
 * Authored lesson vocab stays first; curated topical glossary keys follow,
 * and a CEFR band pool guarantees the floor of 20 in every lesson.
 */
import type { GlossEntry } from "./glossary-ar-1";
import { GLOSSARY_AR_1 } from "./glossary-ar-1";
import { GLOSSARY_AR_2 } from "./glossary-ar-2";
import type { CEFRLevel } from "./learner";

const GLOSSARIES: Record<string, GlossEntry> = { ...GLOSSARY_AR_1, ...GLOSSARY_AR_2 };

const TOPICAL: Record<string, string[]> = {
  "lesson-prea1-survival": ["water", "bread", "tea", "cake", "buy", "eat", "drink", "food"],
  "lesson-prea1-sounds": ["pen", "book", "shop", "bus", "station", "cafe"],
  "lesson-prea1-reading": ["book", "read", "school", "student", "english", "practice"],
  "lesson-prea1-listening": ["listen", "speak", "hello", "name", "teacher", "question", "answer"],
  "lesson-a1-self-introduction": ["name", "friend", "family", "speak", "meet", "hello", "welcome", "colleague"],
  "lesson-a1-routines": ["wake", "sleep", "breakfast", "lunch", "dinner", "work", "school", "morning", "evening", "night"],
  "lesson-a1-questions": ["question", "answer", "know", "think", "speak", "talk", "learn", "teach", "write", "read"],
  "lesson-a1-listening": ["listen", "speak", "slow", "easy", "important", "practice", "understand"],
  "lesson-a2-interactions": ["excuse", "sorry", "welcome", "help", "wait", "call", "meet", "talk", "invite"],
  "lesson-a2-past": ["yesterday", "week", "month", "arrive", "start", "finish", "change", "choose"],
  "lesson-a2-messages": ["send", "call", "email", "meet", "invite", "wait", "explain", "remember", "forget"],
  "lesson-a2-listening": ["listen", "understand", "slow", "fast", "question", "example", "mistake", "practice"],
  "lesson-b1-conversation": ["talk", "speak", "opinion", "idea", "think", "know", "recommend", "invite", "explain"],
  "lesson-b1-writing": ["write", "email", "report", "example", "mistake", "improve", "plan"],
  "lesson-b1-listening": ["listen", "understand", "explain", "example", "evidence", "progress"],
  "lesson-b1-reading": ["read", "book", "english", "learn", "understand", "improve", "goal"],
  "lesson-b2-argument": ["opinion", "reason", "evidence", "decide", "think", "important", "difficult"],
  "lesson-b2-writing": ["write", "report", "deadline", "manager", "project", "team", "improve", "reliable"],
  "lesson-b2-listening": ["listen", "understand", "explain", "evidence", "reason", "opinion"],
  "lesson-b2-reading": ["read", "evidence", "understand", "important", "idea", "know"],
  "lesson-c1-discussion": ["opinion", "reason", "evidence", "decide", "recommend", "confident", "reliable"],
  "lesson-c1-writing": ["write", "report", "deadline", "project", "manager", "explain", "recommend", "apologise"],
  "lesson-c1-listening": ["understand", "explain", "evidence", "opinion", "reason", "progress"],
  "lesson-c1-reading": ["read", "evidence", "understand", "important", "difficult", "goal"],
  "lesson-c2-speaking": ["opinion", "confident", "generous", "reliable", "convenient", "complain", "apologise"],
  "lesson-c2-writing": ["write", "report", "deadline", "evidence", "explain", "recommend", "apologise"],
  "lesson-c2-listening": ["understand", "explain", "evidence", "opinion", "reason"],
  "lesson-c2-reading": ["read", "evidence", "understand", "know", "important"],
};

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

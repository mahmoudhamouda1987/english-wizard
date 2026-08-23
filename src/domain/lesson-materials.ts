/**
 * Per-lesson teaching materials, synthesised from the 150-topic library:
 * vocabulary is drawn from each topic's curated word set (Arabic-glossed via
 * the in-platform glossaries), exercises are derived deterministically from
 * topic purposes and titles, then expanded to the 20-audio-word floor.
 */
import type { GlossEntry } from "./glossary-ar-1";
import { GLOSSARY_AR_1 } from "./glossary-ar-1";
import { GLOSSARY_AR_2 } from "./glossary-ar-2";
import { LESSON_TOPIC_MAP, LIFE_TOPICS } from "./topics";
import { MVP_LESSONS } from "./curriculum";
import { expandVocab } from "./vocab-expansion";
import type { Topic150 } from "./topics150-a";

export interface MaterialExercise { q: string; choices: string[]; answer: number }
export interface LessonMaterials {
  vocab: Array<GlossEntry & { word: string }>;
  exercises: MaterialExercise[];
}

const GLOSSARIES: Record<string, GlossEntry> = { ...GLOSSARY_AR_1, ...GLOSSARY_AR_2 };

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rotate(correct: string[], wrong: string[], seed: number): { choices: string[]; answer: number } {
  const choices = [correct[0], ...wrong.slice(0, 2)];
  const shift = seed % choices.length;
  const rotated = [...choices.slice(shift), ...choices.slice(0, shift)];
  return { choices: rotated, answer: (0 - shift + choices.length * 4) % choices.length };
}

function materialsForLesson(lessonId: string): LessonMaterials | undefined {
  const topicIds = LESSON_TOPIC_MAP[lessonId];
  if (!topicIds?.length) return undefined;
  const topics = topicIds.map((id) => LIFE_TOPICS.find((t) => t.id === id)).filter((t): t is Topic150 => Boolean(t));

  // Vocabulary: topic-curated words that exist in the Arabic glossaries.
  const vocab: Array<GlossEntry & { word: string }> = [];
  const seenWord = new Set<string>();
  for (const topic of topics) {
    for (const raw of topic.vocab) {
      const key = raw.toLowerCase().replace(/[.!?]$/, "").trim();
      if (seenWord.has(key)) continue;
      const g = GLOSSARIES[key];
      if (!g) continue;
      seenWord.add(key);
      vocab.push({ word: key, ar: g.ar, pos: g.pos, en: g.en });
    }
    if (vocab.length >= 14) break;
  }

  // Exercises: deterministic quizzes built from topic purposes and vocabulary.
  const exercises: MaterialExercise[] = [];
  const allWords = [...new Set(topics.flatMap((t) => t.vocab.map((w) => w.toLowerCase().replace(/[.!?]$/, "").trim())))];

  for (let i = 0; i < topics.length && exercises.length < 4; i++) {
    const topic = topics[i];
    const s = hash(topic.id);
    // "Which word belongs to this theme?"
    if (allWords.length >= 3) {
      const own = topic.vocab.map((w) => w.toLowerCase().replace(/[.!?]$/, "").trim()).find((w) => GLOSSARIES[w]);
      const others = allWords.filter((w) => !topic.vocab.some((v) => v.toLowerCase().startsWith(w)));
      if (own && others.length >= 2) {
        const r = rotate([own], [others[s % others.length], others[(s + 7) % others.length]], s + i);
        if (new Set(r.choices).size === 3) {
          exercises.push({ q: `Which word belongs to the theme “${topic.title}”?`, choices: r.choices, answer: r.answer });
        }
      }
    }
    // "What is the goal?" — purpose recognition.
    if (exercises.length < 4 && topics.length >= 3) {
      const otherPurposes = topics.filter((t) => t.id !== topic.id).map((t) => t.purpose.split(":")[0].split(".")[0]);
      const r = rotate([topic.purpose.split(":")[0].split(".")[0]], [otherPurposes[i % otherPurposes.length], otherPurposes[(i + 1) % otherPurposes.length]], s + 3);
      if (new Set(r.choices).size === 3) {
        exercises.push({ q: `In “${topic.title}”, what is the main goal?`, choices: r.choices, answer: r.answer });
      }
    }
  }

  return { vocab, exercises };
}

export const LESSON_MATERIALS: Record<string, LessonMaterials> = Object.fromEntries(
  MVP_LESSONS.map((lesson) => {
    const raw = materialsForLesson(lesson.id);
    return [lesson.id, raw ? { ...raw, vocab: expandVocab(raw.vocab, lesson.id, lesson.level) } : raw];
  }).filter(([, mats]) => Boolean(mats)),
) as Record<string, LessonMaterials>;

export function materialsFor(lessonId: string): LessonMaterials | undefined {
  return LESSON_MATERIALS[lessonId];
}

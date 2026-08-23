/** Harvests every in-platform sentence into a level-tagged dictation bank (scenes + chunks + lesson examples). */
import { LEARNING_SCENES } from "./scenes";
import { LEARNING_CHUNKS } from "./chunks";
import { LESSON_BODIES } from "./lesson-bodies";
import { MVP_LESSONS } from "./curriculum";
import type { CEFRLevel } from "./learner";

export interface DictationItem { text: string; meaning: string; source: string }

const LEVELS: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

const LESSON_LEVEL: Record<string, CEFRLevel> = Object.fromEntries(
  MVP_LESSONS.filter((l) => l.id.startsWith("lesson-")).map((l) => [l.id, l.level]),
);

let cache: DictationItem[] | null = null;

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

function buildBank(): DictationItem[] {
  const items: DictationItem[] = [];
  const seen = new Set<string>();
  const push = (text: string, meaning: string, source: string) => {
    const clean = text.trim();
    if (!clean || clean.length < 8 || clean.length > 180) return;
    const wordCount = clean.split(/\s+/).length;
    if (wordCount < 3) return;
    const key = normalise(clean);
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ text: clean, meaning, source });
  };

  for (const scene of LEARNING_SCENES) {
    for (const line of scene.lines) {
      push(line.text, line.note ?? `From the scene “${scene.title}”.`, `scene:${scene.id}`);
    }
  }
  for (const chunk of LEARNING_CHUNKS) {
    push(chunk.text, chunk.meaning, "chunk");
    for (const variant of chunk.variants ?? []) push(variant, `${chunk.meaning} (variant)`, "chunk");
  }
  for (const [lessonId, body] of Object.entries(LESSON_BODIES)) {
    const level = LESSON_LEVEL[lessonId];
    if (!level) continue;
    for (const example of body.examples ?? []) push(example, body.tip ? `Lesson example. Tip: ${body.tip}` : "Lesson example.", `body:${lessonId}`);
  }
  return items;
}

function bank(): DictationItem[] {
  if (!cache) cache = buildBank();
  return cache;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic per-level ordering keeps rounds stable while feeling shuffled. */
export function dictationItemsForLevel(level: string, count = 20): Array<{ text: string; meaning: string }> {
  const idx = LEVELS.indexOf(level as CEFRLevel);
  const near = [LEVELS[idx], LEVELS[idx - 1], LEVELS[idx + 1]].filter(Boolean);
  const pool = bank().filter((item) => near.includes((LESSON_LEVEL[item.source.split(":")[1]] ?? inferLevel(item)) as CEFRLevel));
  const ranked = pool
    .map((item) => ({ item, k: hash(level + "|" + item.text) }))
    .sort((a, b) => a.k - b.k)
    .map(({ item }) => item);
  return ranked.slice(0, count).map(({ text, meaning }) => ({ text, meaning }));
}

function inferLevel(item: DictationItem): CEFRLevel {
  if (item.source.startsWith("chunk")) {
    const chunk = LEARNING_CHUNKS.find((c) => c.text === item.text || c.variants?.includes(item.text));
    if (chunk) return chunk.level;
  }
  if (item.source.startsWith("scene:")) {
    const scene = LEARNING_SCENES.find((s) => s.id === item.source.slice(6));
    if (scene) return scene.levels[0];
  }
  return "B1";
}

export function dictationBankSize(): number {
  return bank().length;
}

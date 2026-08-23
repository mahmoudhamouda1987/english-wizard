/** Combined in-platform scene library + lesson mapping + dictation sourcing. */
import { SCENES_A } from "./scenes-a";
import { SCENES_B } from "./scenes-b";
import type { CEFRLevel } from "./learner";
import { LEARNING_CHUNKS } from "./chunks";
export type { LearningScene, SceneLine, SceneQuizItem } from "./scenes-types";

const LEVEL_ORDER: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

export const LEARNING_SCENES = [...SCENES_A, ...SCENES_B];

export function sceneById(id: string): import("./scenes-types").LearningScene | undefined {
  return LEARNING_SCENES.find((s) => s.id === id);
}

/** Maps a curriculum lesson onto the most relevant flagship scene. */
export function sceneForLesson(lesson: { title: string; mission?: string; skill?: string; level: string }): import("./scenes-types").LearningScene {
  const hay = `${lesson.title} ${lesson.mission ?? ""} ${lesson.skill ?? ""}`.toLowerCase();
  const scored = LEARNING_SCENES.map((scene) => {
    const topicHits = scene.topics.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
    const levelGap = Math.min(...scene.levels.map((l) => Math.abs(LEVEL_ORDER.indexOf(l as CEFRLevel) - LEVEL_ORDER.indexOf(lesson.level as CEFRLevel))));
    return { scene, score: topicHits * 10 - levelGap };
  }).sort((a, b) => b.score - a.score);
  return scored[0].scene;
}

/** Dictation items for a level, sourced from the in-platform chunk bank (with variants). */
export function dictationForLevel(level: string, count = 6): Array<{ text: string; meaning: string }> {
  const idx = LEVEL_ORDER.indexOf(level as CEFRLevel);
  const exact = LEARNING_CHUNKS.filter((c) => c.level === level);
  const near = idx > 0 ? LEARNING_CHUNKS.filter((c) => c.level === LEVEL_ORDER[idx - 1]) : [];
  const source = [...exact, ...near];
  if (source.length === 0) return [];
  const items: Array<{ text: string; meaning: string }> = [];
  const seen = new Set<string>();
  for (let i = 0; i < source.length && items.length < count; i++) {
    const chunk = source[i % source.length];
    const text = i < source.length ? chunk.text : chunk.variants[0] ?? chunk.text;
    if (!seen.has(text)) {
      seen.add(text);
      items.push({ text, meaning: chunk.meaning });
    }
  }
  return items;
}

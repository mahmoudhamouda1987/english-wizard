/** Combined in-platform scene library + lesson mapping + dictation sourcing. */
import { SCENES_A } from "./scenes-a";
import { SCENES_B } from "./scenes-b";
import { SCENES_C } from "./scenes-c";
import { SCENES_D } from "./scenes-d";
import { SCENES_E } from "./scenes-e";
import { SCENES_F } from "./scenes-f";
import { SCENES_G } from "./scenes-g";
import { SCENES_H } from "./scenes-h";
import type { CEFRLevel } from "./learner";
import type { LearningScene } from "./scenes-types";
import { dictationItemsForLevel } from "./dictation-bank";
import { composedScenesForLesson } from "./scene-generator";
export type { LearningScene, SceneLine, SceneQuizItem } from "./scenes-types";

const LEVEL_ORDER: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

export const LEARNING_SCENES = [...SCENES_A, ...SCENES_B, ...SCENES_C, ...SCENES_D, ...SCENES_E, ...SCENES_F, ...SCENES_G, ...SCENES_H];

export function sceneById(id: string): import("./scenes-types").LearningScene | undefined {
  return LEARNING_SCENES.find((s) => s.id === id);
}

/** Maps a curriculum lesson onto the most relevant flagship scene (exact binding first, then topic+level). */
export function sceneForLesson(lesson: { id?: string; title: string; mission?: string; skill?: string; level: string }): import("./scenes-types").LearningScene {
  if (lesson.id) {
    const exact = LEARNING_SCENES.find((s) => s.lessonIds?.includes(lesson.id!));
    if (exact) return exact;
  }
  const hay = `${lesson.title} ${lesson.mission ?? ""} ${lesson.skill ?? ""}`.toLowerCase();
  const scored = LEARNING_SCENES.map((scene) => {
    const topicHits = scene.topics.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
    const levelGap = Math.min(...scene.levels.map((l) => Math.abs(LEVEL_ORDER.indexOf(l as CEFRLevel) - LEVEL_ORDER.indexOf(lesson.level as CEFRLevel))));
    return { scene, score: topicHits * 10 - levelGap };
  }).sort((a, b) => b.score - a.score);
  return scored[0].scene;
}

/** Dictation items for a lesson: 20 per round, drawn differently per lesson via its id as seed. */
export function dictationForLevel(level: string, count = 20, seedKey = ""): Array<{ text: string; meaning: string }> {
  return dictationItemsForLevel(level, count, seedKey);
}

/**
 * The full 20-scene set for a lesson: the hand-written flagship scene bound to
 * this exact lesson first, then deterministic composed scenes to fill the
 * quota — every lesson always surfaces exactly 20 playable scenes.
 */
export function fullSceneSetForLesson(lessonId: string): LearningScene[] {
  const flagship = LEARNING_SCENES.find((s) => s.lessonIds?.includes(lessonId));
  const composed = composedScenesForLesson(lessonId);
  const merged = flagship ? [flagship, ...composed] : composed;
  return merged.slice(0, 20);
}

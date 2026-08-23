/** Combined per-lesson teaching materials, augmented to the 20-audio-word floor. */
import { MATERIALS_A, type LessonMaterials } from "./lesson-materials-a";
import { MATERIALS_B } from "./lesson-materials-b";
import { expandVocab } from "./vocab-expansion";
import { MVP_LESSONS } from "./curriculum";

export type { LessonMaterials };

const RAW: Record<string, LessonMaterials> = {
  ...MATERIALS_A,
  ...MATERIALS_B,
};

export const LESSON_MATERIALS: Record<string, LessonMaterials> = Object.fromEntries(
  Object.entries(RAW).map(([id, m]) => {
    const level = MVP_LESSONS.find((l) => l.id === id)?.level;
    return [id, level ? { ...m, vocab: expandVocab(m.vocab, id, level) } : m];
  }),
);

export function materialsFor(lessonId: string): LessonMaterials | undefined {
  return LESSON_MATERIALS[lessonId];
}

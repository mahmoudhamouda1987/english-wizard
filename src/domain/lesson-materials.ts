/** Combined per-lesson teaching materials with trusted media sources. */
import { MATERIALS_A, type LessonMaterials } from "./lesson-materials-a";
import { MATERIALS_B } from "./lesson-materials-b";

export type { LessonMaterials };

export const LESSON_MATERIALS: Record<string, LessonMaterials> = {
  ...MATERIALS_A,
  ...MATERIALS_B,
};

export function materialsFor(lessonId: string): LessonMaterials | undefined {
  return LESSON_MATERIALS[lessonId];
}

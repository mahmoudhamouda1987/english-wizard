/** Combined teaching content for all 28 curriculum lessons. */
import { LESSON_BODIES_A, type LessonBody } from "./lesson-bodies-a";
import { LESSON_BODIES_B } from "./lesson-bodies-b";

export type { LessonBody };

export const LESSON_BODIES: Record<string, LessonBody> = {
  ...LESSON_BODIES_A,
  ...LESSON_BODIES_B,
};

export function lessonBody(lessonId: string): LessonBody | undefined {
  return LESSON_BODIES[lessonId];
}

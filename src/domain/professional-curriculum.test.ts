import { describe, expect, it } from "vitest";
import { PROFESSIONAL_CURRICULUM, professionalLessonsByLevel, professionalLessonById } from "./professional-curriculum";
import { PROFESSIONAL_SCENES, scenesForProfessionalLesson, allProfessionalSceneIds } from "./professional-scenes";
import { PROFESSIONAL_MATERIALS, materialsForProfessionalLesson } from "./professional-materials";
import { PROFESSIONAL_BODIES, bodyForProfessionalLesson } from "./professional-bodies";

describe("Professional curriculum", () => {
  it("has exactly 28 lessons spanning B1 to C2", () => {
    expect(PROFESSIONAL_CURRICULUM).toHaveLength(28);
    const levels = new Set(PROFESSIONAL_CURRICULUM.map((l) => l.level));
    expect(levels.has("B1")).toBe(true);
    expect(levels.has("B2")).toBe(true);
    expect(levels.has("C1")).toBe(true);
    expect(levels.has("C2")).toBe(true);
  });

  it("each lesson has a unique id and objectiveId", () => {
    const ids = PROFESSIONAL_CURRICULUM.map((l) => l.id);
    const objIds = PROFESSIONAL_CURRICULUM.map((l) => l.objectiveId);
    expect(new Set(ids).size).toBe(28);
    expect(new Set(objIds).size).toBe(28);
  });

  it("lessons are grouped 7 per level", () => {
    expect(professionalLessonsByLevel("B1")).toHaveLength(7);
    expect(professionalLessonsByLevel("B2")).toHaveLength(7);
    expect(professionalLessonsByLevel("C1")).toHaveLength(7);
    expect(professionalLessonsByLevel("C2")).toHaveLength(7);
  });

  it("professionalLessonById resolves known ids", () => {
    expect(professionalLessonById("pro-lesson-01-professional-emails")).toBeDefined();
    expect(professionalLessonById("pro-lesson-28-thought-leadership")).toBeDefined();
    expect(professionalLessonById("fake-id")).toBeUndefined();
  });

  it("every lesson has scenes", () => {
    for (const lesson of PROFESSIONAL_CURRICULUM) {
      const scenes = scenesForProfessionalLesson(lesson.id);
      expect(scenes.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("every lesson has materials with exercises", () => {
    for (const lesson of PROFESSIONAL_CURRICULUM) {
      const mats = materialsForProfessionalLesson(lesson.id);
      expect(mats).toBeDefined();
      expect(mats!.exercises.length).toBeGreaterThanOrEqual(3);
      expect(mats!.vocab.length).toBeGreaterThanOrEqual(8);
    }
  });

  it("every lesson has a teaching body", () => {
    for (const lesson of PROFESSIONAL_CURRICULUM) {
      const body = bodyForProfessionalLesson(lesson.id);
      expect(body).toBeDefined();
      expect(body!.explanation.length).toBeGreaterThan(50);
      expect(body!.examples.length).toBeGreaterThanOrEqual(2);
      expect(body!.commonMistakes.length).toBeGreaterThanOrEqual(2);
      expect(body!.tip.length).toBeGreaterThan(10);
    }
  });

  it("scenes have valid structure", () => {
    for (const scene of PROFESSIONAL_SCENES) {
      expect(scene.lessonId).toBeTruthy();
      expect(scene.lines.length).toBeGreaterThanOrEqual(4);
      expect(scene.quiz.length).toBeGreaterThanOrEqual(2);
      expect(scene.characters.a.name).toBeTruthy();
      expect(scene.characters.b.name).toBeTruthy();
      for (const line of scene.lines) {
        expect(["a", "b"]).toContain(line.speaker);
        expect(line.text.length).toBeGreaterThan(5);
        expect(line.ar.length).toBeGreaterThan(5);
      }
    }
  });

  it("allProfessionalSceneIds returns all scene ids", () => {
    const ids = allProfessionalSceneIds();
    expect(ids.length).toBe(PROFESSIONAL_SCENES.length);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

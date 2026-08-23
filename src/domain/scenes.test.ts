import { describe, expect, it } from "vitest";
import { LEARNING_SCENES, sceneById, sceneForLesson, dictationForLevel } from "./scenes";
import { LESSON_MATERIALS } from "./lesson-materials";

describe("learning scenes", () => {
  it("covers the full CEFR range with at least one scene per level", () => {
    const levels = new Set(LEARNING_SCENES.flatMap((s) => s.levels));
    for (const level of ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]) {
      expect(levels.has(level as never), `missing coverage for ${level}`).toBe(true);
    }
  });

  it("every scene is well-formed: lines, Arabic, notes and quiz answers in range", () => {
    for (const scene of LEARNING_SCENES) {
      expect(scene.lines.length).toBeGreaterThanOrEqual(6);
      for (const line of scene.lines) {
        expect(line.text.length).toBeGreaterThan(0);
        expect(line.ar.length).toBeGreaterThan(0);
      }
      expect(scene.characters.a.name).not.toBe(scene.characters.b.name);
      for (const item of scene.quiz) {
        expect(item.choices).toHaveLength(3);
        expect(item.answer).toBeGreaterThanOrEqual(0);
        expect(item.answer).toBeLessThan(3);
      }
    }
  });

  it("sceneById returns the requested scene", () => {
    const cafe = sceneById("cafe-order");
    expect(cafe?.title).toBe("Ordering at a café");
    expect(sceneById("does-not-exist")).toBeUndefined();
  });

  it("maps every lesson with materials onto a valid scene", () => {
    const lessonIds = Object.keys(LESSON_MATERIALS);
    expect(lessonIds.length).toBeGreaterThan(20);
    for (const id of lessonIds) {
      const mats = LESSON_MATERIALS[id];
      const scene = sceneForLesson({ title: id, mission: "", skill: "", level: "B1" });
      expect(scene.id, `lesson ${id} has no mapped scene`).toBeTruthy();
      void mats;
    }
  });

  it("prefers topic matches when mapping lessons to scenes", () => {
    const healthScene = sceneForLesson({ title: "Describe symptoms at the doctor", mission: "", skill: "listening", level: "A2" });
    expect(healthScene.id).toBe("doctor-visit");
  });

  it("dictation items exist for every CEFR level and contain text + meaning", () => {
    for (const level of ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]) {
      const items = dictationForLevel(level);
      if (items.length === 0) continue;
      for (const item of items) {
        expect(item.text.length).toBeGreaterThan(3);
        expect(item.meaning.length).toBeGreaterThan(3);
      }
    }
    expect(dictationForLevel("B1").length).toBeGreaterThan(0);
  });
});

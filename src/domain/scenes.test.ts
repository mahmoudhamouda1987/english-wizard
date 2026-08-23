import { describe, expect, it } from "vitest";
import { LEARNING_SCENES, sceneById, sceneForLesson, dictationForLevel } from "./scenes";
import { LESSON_MATERIALS } from "./lesson-materials";
import { MVP_LESSONS } from "./curriculum";
import { dictationItemsForLevel, dictationBankSize } from "./dictation-bank";
import { practiceForLesson } from "./practice-generator";

const LESSON_IDS = MVP_LESSONS.filter((l) => l.id.startsWith("lesson-")).map((l) => l.id);

describe("learning scenes (x20 expansion)", () => {
  it("hosts at least 40 scenes covering every lesson exactly", () => {
    expect(LEARNING_SCENES.length).toBeGreaterThanOrEqual(40);
    for (const id of LESSON_IDS) {
      const exact = LEARNING_SCENES.find((s) => s.lessonIds?.includes(id));
      expect(exact, `no bespoke scene bound to ${id}`).toBeTruthy();
    }
  });

  it("sceneForLesson prefers the exact lesson-bound scene", () => {
    const lesson = MVP_LESSONS.find((l) => l.id === "lesson-b1-conversation")!;
    const scene = sceneForLesson(lesson);
    expect(scene.lessonIds).toContain("lesson-b1-conversation");
  });

  it("covers the full CEFR range with at least one scene per level", () => {
    const levels = new Set(LEARNING_SCENES.flatMap((s) => s.levels));
    for (const level of ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]) {
      expect(levels.has(level as never), `missing coverage for ${level}`).toBe(true);
    }
  });

  it("every scene is well-formed: lines, Arabic and quiz answers in range", () => {
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

  it("dictation bank harvests a large sentence pool", () => {
    expect(dictationBankSize()).toBeGreaterThan(300);
  });

  it("serves ~20 dictation items per level with meanings", () => {
    for (const level of ["A1", "A2", "B1", "B2"]) {
      const items = dictationItemsForLevel(level, 20);
      expect(items.length, `level ${level}`).toBeGreaterThanOrEqual(18);
      for (const item of items) {
        expect(item.text.split(/\s+/).length).toBeGreaterThanOrEqual(3);
        expect(item.meaning.length).toBeGreaterThan(3);
      }
    }
  });

  it("every lesson gets at least 15 generated-or-authored practice exercises with valid answers", () => {
    for (const id of LESSON_IDS) {
      const set = practiceForLesson(id);
      expect(set.length, `${id} has only ${set.length}`).toBeGreaterThanOrEqual(15);
      for (const ex of set) {
        expect(ex.choices.length).toBe(3);
        expect(ex.answer).toBeGreaterThanOrEqual(0);
        expect(ex.answer).toBeLessThan(3);
        expect(new Set(ex.choices.map((c) => c.toLowerCase())).size).toBe(3);
      }
    }
  });
});

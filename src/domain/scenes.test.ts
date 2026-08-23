import { describe, expect, it } from "vitest";
import { LEARNING_SCENES, sceneById, sceneForLesson, dictationForLevel, fullSceneSetForLesson } from "./scenes";
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

  it("every lesson surfaces exactly 20 playable scenes, flagship first", () => {
    for (const id of LESSON_IDS) {
      const set = fullSceneSetForLesson(id);
      expect(set.length, `${id} has only ${set.length} scenes`).toBe(20);
      expect(new Set(set.map((s) => s.id)).size).toBe(20);
      expect(set[0].lessonIds).toContain(id);
      for (const scene of set) {
        expect(scene.lines.length).toBeGreaterThanOrEqual(6);
        for (const line of scene.lines) {
          expect(line.text.length).toBeGreaterThan(0);
          expect(line.ar.length).toBeGreaterThan(0);
        }
        expect(scene.quiz.length).toBeGreaterThanOrEqual(3);
        for (const item of scene.quiz) {
          expect(item.choices).toHaveLength(3);
          expect(item.answer).toBeGreaterThanOrEqual(0);
          expect(item.answer).toBeLessThan(3);
          expect(new Set(item.choices).size).toBe(3);
        }
      }
    }
  });

  it("sceneForLesson prefers the exact lesson-bound scene", () => {
    const lesson = MVP_LESSONS.find((l) => l.id === "lesson-15-media-entertainment")!;
    const scene = sceneForLesson(lesson);
    expect(scene.lessonIds).toContain("lesson-15-media-entertainment");
  });

  it("covers the full CEFR range with at least one scene per level", () => {
    const levels = new Set(LEARNING_SCENES.flatMap((s) => s.levels));
    for (const level of ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]) {
      expect(levels.has(level as never), `missing coverage for ${level}`).toBe(true);
    }
  });

  it("every authored scene is well-formed: lines, Arabic and quiz answers in range", () => {
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

  it("each lesson draws its own distinct 20-item dictation round", () => {
    const a = dictationForLevel("A2", 20, "lesson-06-people-social-life").map((i) => i.text);
    const b = dictationForLevel("A2", 20, "lesson-07-past-experiences").map((i) => i.text);
    expect(a).toHaveLength(20);
    expect(b).toHaveLength(20);
    const overlap = a.filter((t) => b.includes(t)).length;
    expect(overlap, "two same-level lessons drew identical rounds").toBeLessThan(20);
  });

  it("every lesson exposes at least 20 audio words with Arabic", () => {
    for (const id of LESSON_IDS) {
      const vocab = LESSON_MATERIALS[id]?.vocab ?? [];
      expect(vocab.length, `${id} has only ${vocab.length} words`).toBeGreaterThanOrEqual(20);
      for (const v of vocab) {
        expect(v.word.length).toBeGreaterThan(0);
        expect(v.ar.length).toBeGreaterThan(0);
      }
    }
  });

  it("every lesson gets at least 20 generated-or-authored practice exercises with valid answers", () => {
    for (const id of LESSON_IDS) {
      const set = practiceForLesson(id);
      expect(set.length, `${id} has only ${set.length}`).toBeGreaterThanOrEqual(20);
      for (const ex of set) {
        expect(ex.choices.length).toBe(3);
        expect(ex.answer).toBeGreaterThanOrEqual(0);
        expect(ex.answer).toBeLessThan(3);
        expect(new Set(ex.choices.map((c) => c.toLowerCase())).size).toBe(3);
      }
    }
  });
});

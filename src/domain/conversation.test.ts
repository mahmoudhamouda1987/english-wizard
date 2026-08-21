import { describe, expect, it } from "vitest";
import { conversationForLevel, CONVERSATIONS } from "./conversation";
import { wordOfDayForLevel } from "./word-of-day";

describe("conversation listening lab", () => {
  it("provides one conversation for every CEFR level", () => {
    expect(CONVERSATIONS.map((item) => item.level)).toEqual(["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]);
    for (const level of ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"] as const) {
      const exercise = conversationForLevel(level);
      expect(exercise.durationSeconds).toBe(60);
      expect(exercise.speakers).toHaveLength(2);
      expect(exercise.gaps).toHaveLength(5);
      expect(exercise.turns).toHaveLength(5);
    }
  });

  it("provides a Word of the Day at every level", () => {
    for (const level of ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"] as const) {
      const word = wordOfDayForLevel(level);
      expect(word.level).toBe(level);
      expect(word.word.length).toBeGreaterThan(0);
      expect(word.arabicMeaning.length).toBeGreaterThan(0);
      expect(word.pronunciation.length).toBeGreaterThan(0);
    }
  });
});

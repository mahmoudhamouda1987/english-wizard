import { describe, expect, it } from "vitest";
import { LIFE_TOPICS, LESSON_TOPIC_MAP, REVISITS, topicsForLesson, lessonsForTopic, ladderFor, rungForLevel, stageForLevel, topicEngineStats } from "./topics";
import { missionFor } from "./mission";
import { CHARACTER_UNIVERSE, castFor } from "./characters";
import { MVP_LESSONS } from "./curriculum";
import { practiceForLesson } from "./practice-generator";

const LESSON_IDS = MVP_LESSONS.map((l) => l.id);

describe("100-topic life simulation engine", () => {
  it("defines exactly 100 unique numbered topics", () => {
    expect(LIFE_TOPICS).toHaveLength(100);
    expect(new Set(LIFE_TOPICS.map((t) => t.n)).size).toBe(100);
    expect(new Set(LIFE_TOPICS.map((t) => t.id)).size).toBe(100);
  });

  it("assigns every topic to at least one lesson; every lesson has a coherent cluster", () => {
    const stats = topicEngineStats();
    expect(stats.assignedTopics).toBe(100);
    expect(stats.unassigned).toEqual([]);
    for (const id of LESSON_IDS) {
      const set = topicsForLesson(id);
      expect(set.primary.length, `${id} has no cluster`).toBeGreaterThanOrEqual(2);
      expect(new Set(set.primary.map((t) => t.id)).size).toBe(set.primary.length);
    }
  });

  it("keeps progression logical: survival topics early, abstract debate late", () => {
    const prea1 = topicsForLesson("lesson-prea1-survival").primary.map((t) => t.category);
    expect(prea1.every((c) => !["philosophy", "global"].includes(c))).toBe(true);
    const c2 = topicsForLesson("lesson-c2-speaking").primary.map((t) => t.category);
    expect(c2.some((c) => ["philosophy", "thinking"].includes(c))).toBe(true);
    // money evolves from A1 "how much" to C2 essay territory
    const moneyLadder = ladderFor("money-personal-finance").map((r) => r.level);
    expect(moneyLadder[0]).toBe("A1");
    expect(moneyLadder[moneyLadder.length - 1]).toBe("C2");
  });

  it("gives every topic a difficulty ladder with at least two rungs", () => {
    for (const topic of LIFE_TOPICS) {
      expect(topic.ladder.length, `${topic.title} has no evolution`).toBeGreaterThanOrEqual(2);
      for (const rung of topic.ladder) expect(rung.example.length).toBeGreaterThan(8);
    }
  });

  it("resolves the right ladder rung per level and never overshoots", () => {
    expect(rungForLevel("money-personal-finance", "Pre-A1")?.example).toContain("How much");
    expect(rungForLevel("money-personal-finance", "B1")?.example).toContain("budget");
    expect(rungForLevel("meeting-people", "B1")?.example).not.toContain("conference");
  });

  it("supports spaced retrieval: revisit pairs exist and lessons resolve them", () => {
    expect(REVISITS.length).toBeGreaterThanOrEqual(5);
    for (const r of REVISITS) {
      expect(LESSON_TOPIC_MAP[r.lessonId]).toBeTruthy();
      expect(lessonsForTopic(r.topicId).length).toBeGreaterThanOrEqual(1);
    }
    expect(topicsForLesson("lesson-b2-argument").revisited.some((r) => r.topic.id === "money-personal-finance")).toBe(true);
  });

  it("maps all seven levels onto life stages in order", () => {
    expect(stageForLevel("Pre-A1").name).toBe("SURVIVE");
    expect(stageForLevel("A2").name).toBe("CONNECT");
    expect(stageForLevel("C2").name).toBe("DEBATE");
    for (const level of ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]) {
      expect(stageForLevel(level).claim.length).toBeGreaterThan(10);
    }
  });

  it("runs a reusable character universe that casts stable duos", () => {
    expect(CHARACTER_UNIVERSE.length).toBeGreaterThanOrEqual(14);
    const [a, b] = castFor("stable-key");
    const [a2] = castFor("stable-key");
    expect(a.profile.name).toBe(a2.profile.name);
    expect(a.profile.name).not.toBe(b.profile.name);
    for (const c of CHARACTER_UNIVERSE) {
      expect(c.occupation.length).toBeGreaterThan(3);
      expect(c.goal.length).toBeGreaterThan(3);
    }
  });

  it("builds a complete mission brief for every lesson", () => {
    for (const id of LESSON_IDS) {
      const m = missionFor(id);
      expect(m, `no mission for ${id}`).toBeTruthy();
      expect(m!.topicTitles.length).toBeGreaterThanOrEqual(2);
      expect(m!.roleplay.scenarioId).toMatch(/^rp-/);
      expect(m!.writing.prompt.length).toBeGreaterThan(30);
      expect(m!.writing.minWords).toBeGreaterThan(0);
      expect(m!.realLifeMission).toContain("48 hours");
      if (!["Pre-A1"].includes(MVP_LESSONS.find((l) => l.id === id)!.level)) {
        expect(m!.ladderExamples.length, `${id} lacks ladder examples`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("recycles earlier vocabulary into later practice sets", () => {
    const set = practiceForLesson("lesson-b1-conversation", ["lesson-a2-interactions"]);
    const review = set.filter((e) => e.q.startsWith("Review —"));
    expect(review.length).toBeGreaterThanOrEqual(1);
    for (const ex of review) {
      expect(ex.choices).toHaveLength(3);
      expect(new Set(ex.choices.map((c) => c.slice(0, 12))).size).toBe(3);
    }
  });
});

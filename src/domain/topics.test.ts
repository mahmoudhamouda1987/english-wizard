import { describe, expect, it } from "vitest";
import { LIFE_TOPICS, LESSON_TOPIC_MAP, REVISITS, topicsForLesson, lessonsForTopic, ladderFor, rungForLevel, stageForLevel, topicEngineStats } from "./topics";
import { missionFor } from "./mission";
import { CHARACTER_UNIVERSE, castFor } from "./characters";
import { MVP_LESSONS } from "./curriculum";
import { practiceForLesson } from "./practice-generator";

const LESSON_IDS = MVP_LESSONS.map((l) => l.id);

describe("150-topic master curriculum engine", () => {
  it("defines exactly 150 unique numbered topics with full metadata", () => {
    expect(LIFE_TOPICS).toHaveLength(150);
    expect(new Set(LIFE_TOPICS.map((t) => t.n)).size).toBe(150);
    expect(new Set(LIFE_TOPICS.map((t) => t.id)).size).toBe(150);
    for (const topic of LIFE_TOPICS) {
      expect(topic.lessonId, `${topic.id} missing home lesson`).toMatch(/^lesson-\d{2}-[a-z-]+$/);
      expect(topic.purpose.length).toBeGreaterThan(20);
      expect(topic.vocab.length).toBeGreaterThanOrEqual(6);
      expect(topic.grammar.length).toBeGreaterThanOrEqual(2);
      expect(topic.skills.speaking.length).toBeGreaterThan(0);
      expect(topic.scenario.length).toBeGreaterThan(20);
      expect(topic.pitfall.length).toBeGreaterThan(20);
    }
  });

  it("assigns every topic to exactly one lesson; every lesson owns a coherent cluster", () => {
    const stats = topicEngineStats();
    expect(stats.assignedTopics).toBe(150);
    expect(stats.unassigned).toEqual([]);
    expect(stats.lessonsWithClusters).toBe(28);
    for (const id of LESSON_IDS) {
      const set = topicsForLesson(id);
      expect(set.primary.length, `${id} has no cluster`).toBeGreaterThanOrEqual(2);
      expect(new Set(set.primary.map((t) => t.id)).size).toBe(set.primary.length);
    }
    // 5 primary topics per lesson except the lesson-28 capstone which integrates 15.
    for (const id of LESSON_IDS) {
      const expected = id === "lesson-28-real-world-mastery" ? 15 : 5;
      expect(topicsForLesson(id).primary.length, `${id} cluster size`).toBe(expected);
    }
  });

  it("keeps progression logical: survival topics early, abstract debate late", () => {
    const early = topicsForLesson("lesson-01-me-my-world").primary.map((t) => t.category);
    expect(early.every((c) => !["philosophy", "global", "politics"].includes(c))).toBe(true);
    const late = topicsForLesson("lesson-26-advanced-argumentation").primary.map((t) => t.category);
    expect(late.some((c) => ["philosophy", "thinking", "argumentation"].includes(c))).toBe(true);
    // money evolves from early transaction English to capstone life-planning territory
    const order = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
    const moneyLadder = ladderFor("financial-independence-planning").map((r) => r.level);
    const ranks = moneyLadder.map((l) => order.indexOf(l));
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
    expect(moneyLadder[moneyLadder.length - 1]).toBe("C1");
  });

  it("gives every topic a difficulty ladder with at least two rungs", () => {
    for (const topic of LIFE_TOPICS) {
      expect(topic.ladder.length, `${topic.title} has no evolution`).toBeGreaterThanOrEqual(2);
      for (const rung of topic.ladder) expect(rung.example.length).toBeGreaterThan(8);
    }
  });

  it("resolves the right ladder rung per level and never overshoots", () => {
    expect(rungForLevel("greetings-introductions", "A1")?.level).toBe("Pre-A1");
    expect(rungForLevel("greetings-introductions", "B2")?.level).toBe("B1");
    expect(rungForLevel("english-as-life-tool", "Pre-A1")?.level).toBe("Pre-A1");
    expect(rungForLevel("english-as-life-tool", "A2")?.level).toBe("A2");
  });

  it("supports spaced retrieval: revisit pairs exist and lessons resolve them", () => {
    expect(REVISITS.length).toBeGreaterThanOrEqual(5);
    for (const r of REVISITS) {
      expect(LESSON_TOPIC_MAP[r.lessonId], `unknown revisit lesson ${r.lessonId}`).toBeTruthy();
      expect(lessonsForTopic(r.topicId).length).toBeGreaterThanOrEqual(1);
      expect(r.angle.length).toBeGreaterThan(10);
    }
    expect(topicsForLesson("lesson-28-real-world-mastery").revisited.some((r) => r.topic.id === "job-interviews")).toBe(true);
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
    const set = practiceForLesson("lesson-15-media-entertainment", ["lesson-06-people-social-life"]);
    const review = set.filter((e) => e.q.startsWith("Review —"));
    expect(review.length).toBeGreaterThanOrEqual(1);
    for (const ex of review) {
      expect(ex.choices).toHaveLength(3);
      expect(new Set(ex.choices.map((c) => c.slice(0, 12))).size).toBe(3);
    }
  });
});

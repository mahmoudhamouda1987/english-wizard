import { describe, it, expect } from "vitest";
import {
  authoritativeLevel,
  contentGate,
  weakSpotLoop,
  productSnapshot,
} from "./product-intelligence";
import type { LearnerProfile } from "./profile";
import type { LearnerState } from "./learner";

function profile(over: Partial<LearnerProfile> = {}): LearnerProfile {
  return {
    learnerId: "l1",
    displayName: "Tester",
    nativeLanguage: "ar",
    targetLevel: "B2",
    dailyMinutes: 30,
    goals: [],
    englishDna: {
      overallLevel: "B1",
      strengths: [],
      focusAreas: [],
      preferredSkills: [],
      confidence: 0.8,
    },
    ...over,
  } as LearnerProfile;
}

function state(over: Partial<LearnerState> = {}): LearnerState {
  return {
    learnerId: "l1",
    currentLessonId: null,
    completedLessonIds: [],
    lessonHistory: [],
    mastery: [],
    errors: [],
    nextAction: null,
    version: 1,
    updatedAt: new Date().toISOString(),
    ...over,
  } as LearnerState;
}

describe("Level consistency engine (Part 105)", () => {
  it("derives one level from the DNA estimate — the single source of truth", () => {
    expect(authoritativeLevel(profile())).toBe("B1");
    expect(authoritativeLevel(profile({ englishDna: { overallLevel: "C1", strengths: [], focusAreas: [], preferredSkills: [], confidence: 0.9 } } as unknown as LearnerProfile))).toBe("C1");
  });

  it("falls back to target level, then A1 — never to page-local guesses", () => {
    const p = profile();
    delete (p.englishDna as unknown as { overallLevel?: string }).overallLevel;
    expect(authoritativeLevel(p)).toBe("B2");
    expect(authoritativeLevel(null)).toBe("A1");
  });

  it("gates content: core, stretch, future, behind", () => {
    expect(contentGate("B1", "B1")).toBe("core");
    expect(contentGate("B1", "B2")).toBe("stretch");
    expect(contentGate("B1", "C1")).toBe("future");
    expect(contentGate("B1", "A2")).toBe("behind");
  });
});

describe("Weak-spot loop (Part 85)", () => {
  it("returns an empty plan when there are no weak spots", () => {
    const loop = weakSpotLoop(state(), profile());
    expect(loop.spot).toBeNull();
    expect(loop.steps).toHaveLength(0);
  });

  it("builds a cross-product plan from one recurring weakness", () => {
    const s = state({
      errorIntelligence: [
        {
          id: "e1", learnerErrorId: "le1", skill: "grammar", category: "grammar",
          objectiveId: "o1", level: "B1", pattern: "conditionals", explanation: "mixed conditionals",
          occurrences: 5, confidence: 0.9, severity: "high", status: "recurring",
          intervention: "drill", nextPractice: "today", reviewAt: "", lastSeenAt: "",
        },
      ],
    } as unknown as Partial<LearnerState>);
    const loop = weakSpotLoop(s, profile({ goals: ["IELTS 7.0", "business meetings"] } as Partial<LearnerProfile>));
    expect(loop.spot?.description).toContain("conditionals");
    const products = loop.steps.map((s2) => s2.productId);
    expect(products).toContain("GENERAL_ENGLISH");
    expect(products).toContain("FLUENCY_TRACK");
    expect(products).toContain("IELTS");
    expect(products).toContain("BUSINESS_ENGLISH");
  });

  it("omits exam and business steps for learners without those goals", () => {
    const s = state({
      errorIntelligence: [
        {
          id: "e1", learnerErrorId: "le1", skill: "vocabulary", category: "lexical",
          objectiveId: "o1", level: "B1", pattern: "collocation", explanation: "",
          occurrences: 2, confidence: 0.7, severity: "medium", status: "new",
          intervention: "", nextPractice: "", reviewAt: "", lastSeenAt: "",
        },
      ],
    } as unknown as Partial<LearnerState>);
    const loop = weakSpotLoop(s, profile());
    expect(loop.steps.map((x) => x.productId)).not.toContain("IELTS");
    expect(loop.steps.map((x) => x.productId)).not.toContain("BUSINESS_ENGLISH");
  });
});

describe("Product snapshots (Parts 104/107)", () => {
  it("gates exam products below their entry levels (A2 learner: IELTS and Fluency locked, General open)", () => {
    const p = profile({ englishDna: { overallLevel: "A2", strengths: [], focusAreas: [], preferredSkills: [], confidence: 0.9 } } as unknown as LearnerProfile);
    expect(productSnapshot("IELTS", p).ready).toBe(false);
    expect(productSnapshot("FLUENCY_TRACK", p).ready).toBe(false);
    expect(productSnapshot("GENERAL_ENGLISH", p).ready).toBe(true);
  });

  it("opens products at the right bands from the same level source", () => {
    const p = profile({ englishDna: { overallLevel: "B2", strengths: [], focusAreas: [], preferredSkills: [], confidence: 0.9 } } as unknown as LearnerProfile);
    expect(productSnapshot("IELTS", p).ready).toBe(true);
    expect(productSnapshot("FLUENCY_TRACK", p).ready).toBe(true);
    expect(productSnapshot("BUSINESS_ENGLISH", p).ready).toBe(true);
  });
});

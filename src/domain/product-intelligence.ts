import type { CEFRLevel, LearnerState } from "./learner";
import type { LearnerProfile } from "./profile";
import type { ErrorIntelligenceRecord } from "./error-intelligence";

/**
 * UNIFIED LEARNER INTELLIGENCE — product layer (2.0 contract, Parts 1–2, 85, 104–106).
 *
 * ONE source of truth for level: every product page reads `authoritativeLevel`
 * (never a page-local guess). ONE weak-spot engine whose recommendations fan out
 * across products so the learner never has to find their own remedy.
 */

export type ProductId = "GENERAL_ENGLISH" | "BUSINESS_ENGLISH" | "IELTS" | "CAMBRIDGE" | "FLUENCY_TRACK";

const LEVEL_ORDER: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

export function levelIndex(level: string): number {
  const i = LEVEL_ORDER.indexOf(level as CEFRLevel);
  return i === -1 ? 1 : i;
}

/** Part 105 — the single authoritative CEFR level for every surface. */
export function authoritativeLevel(profile: LearnerProfile | null): CEFRLevel {
  const dna = profile?.englishDna?.overallLevel;
  if (dna && LEVEL_ORDER.includes(dna as CEFRLevel)) return dna as CEFRLevel;
  const target = profile?.targetLevel;
  if (target) return target;
  return "A1";
}

/** Part 104 — level gating. Primary content matches level; adjacent levels allowed as tasters. */
export function contentGate(
  learnerLevel: CEFRLevel,
  contentLevel: CEFRLevel,
): "core" | "stretch" | "future" | "behind" {
  const d = levelIndex(contentLevel) - levelIndex(learnerLevel);
  if (d === 0) return "core";
  if (d === 1) return "stretch";
  if (d > 1) return "future";
  return "behind";
}

export interface WeakSpot {
  category: string;
  description: string;
  occurrences: number;
  status: string;
  priority: number;
}

/** Extract prioritised weak spots from learner state (error intelligence first, raw errors second). */
export function weakSpots(state: LearnerState | null): WeakSpot[] {
  if (!state) return [];
  const intel = (state.errorIntelligence ?? []) as ErrorIntelligenceRecord[];
  const fromIntel = intel
    .filter((e) => e.status !== "resolved")
    .map((e) => ({
      category: String(e.category ?? "general"),
      description: String(e.pattern || e.explanation || e.category || "recurring difficulty"),
      occurrences: Number(e.occurrences ?? 1),
      status: String(e.status ?? "new"),
      priority: (e.status === "recurring" ? 100 : e.status === "improving" ? 40 : 60) + Number(e.occurrences ?? 1),
    }));
  const covered = new Set(fromIntel.map((w) => w.category));
  const fromErrors = (state.errors ?? [])
    .filter((e) => !covered.has(String(e.category ?? "general")))
    .map((e) => ({
      category: String(e.category ?? "general"),
      description: String(e.description ?? e.category ?? "difficulty"),
      occurrences: Number(e.occurrences ?? 1),
      status: "new",
      priority: 50 + Number(e.occurrences ?? 1),
    }));
  return [...fromIntel, ...fromErrors].sort((a, b) => b.priority - a.priority).slice(0, 6);
}

export interface ProductRecommendation {
  productId: ProductId;
  surface: string;
  href: string;
  why: string;
}

const SKILL_SURFACE: Record<string, { productId: ProductId; surface: string; href: string }> = {
  grammar: { productId: "GENERAL_ENGLISH", surface: "Grammar studio", href: "/grammar" },
  vocabulary: { productId: "GENERAL_ENGLISH", surface: "Vocabulary studio", href: "/vocabulary" },
  listening: { productId: "GENERAL_ENGLISH", surface: "English Ear", href: "/english-ear" },
  reading: { productId: "GENERAL_ENGLISH", surface: "Reading Studio", href: "/reading" },
  writing: { productId: "GENERAL_ENGLISH", surface: "Writing studio", href: "/writing" },
  speaking: { productId: "FLUENCY_TRACK", surface: "Conversation Gym", href: "/conversation" },
  pronunciation: { productId: "GENERAL_ENGLISH", surface: "Speaking Coach", href: "/pronunciation" },
  mediation: { productId: "GENERAL_ENGLISH", surface: "Chunks & Mediation", href: "/chunks" },
};

/**
 * Part 85 — the connected improvement loop. One weak spot → a plan that spans
 * Grammar, Vocabulary, Say It Better, Role-play, Review, and — when the learner
 * is an exam or business candidate — the relevant product work.
 */
export function weakSpotLoop(
  state: LearnerState | null,
  profile: LearnerProfile | null,
): { spot: WeakSpot | null; steps: ProductRecommendation[]; summary: string } {
  const spots = weakSpots(state);
  const spot = spots[0] ?? null;
  if (!spot) {
    return {
      spot: null,
      steps: [],
      summary: "No recurring weak spots right now — your review queue and daily plan are the best next moves.",
    };
  }
  const primary = SKILL_SURFACE[spot.category] ?? SKILL_SURFACE.grammar;
  const isExamCandidate = profile?.goals?.some((g) => /ielts|cambridge|exam|band/i.test(g)) ?? false;
  const isBusiness = profile?.goals?.some((g) => /business|work|interview|meeting|career/i.test(g)) ?? false;
  const steps: ProductRecommendation[] = [
    {
      productId: "GENERAL_ENGLISH",
      surface: "Review & Mastery",
      href: "/review",
      why: `Clears the ${spot.category} pattern while it is fresh — spacing does the remembering for you.`,
    },
    {
      productId: primary.productId,
      surface: primary.surface,
      href: primary.href,
      why: `Targeted ${spot.category} work aimed at the same gap: “${spot.description}”.`,
    },
    {
      productId: "FLUENCY_TRACK",
      surface: "Say It Better",
      href: "/say-it-better",
      why: `Rebuilds the sentence patterns around your ${spot.category} habit in live production.`,
    },
    {
      productId: "FLUENCY_TRACK",
      surface: "Role-play",
      href: "/roleplay",
      why: `Pressure-tests the fix in real dialogue before it fades.`,
    },
  ];
  if (isExamCandidate) {
    steps.push({
      productId: "IELTS",
      surface: "IELTS skills",
      href: "/ielts",
      why: `Your target band work now prioritises this exact weakness in exam tasks.`,
    });
  }
  if (isBusiness) {
    steps.push({
      productId: "BUSINESS_ENGLISH",
      surface: "Business English",
      href: "/business-english",
      why: `Workplace scenarios generated around the same gap.`,
    });
  }
  return {
    spot,
    steps,
    summary: `One weak spot, one connected plan: every product now trains “${spot.description}” until it clears.`,
  };
}

export interface ProductSnapshot {
  productId: ProductId;
  level: CEFRLevel;
  headline: string;
  ready: boolean;
  gateMessage: string;
  nextHref: string;
}

/** Per-product snapshot derived from the SAME intelligence — no page-local level logic. */
export function productSnapshot(
  productId: ProductId,
  profile: LearnerProfile | null,
): ProductSnapshot {
  const level = authoritativeLevel(profile);
  const idx = levelIndex(level);
  switch (productId) {
    case "GENERAL_ENGLISH":
      return {
        productId,
        level,
        headline: `Core curriculum, tuned to ${level}.`,
        ready: true,
        gateMessage: "",
        nextHref: "/worlds",
      };
    case "BUSINESS_ENGLISH":
      return {
        productId,
        level,
        headline: idx >= 2 ? `Workplace outcomes at your ${level} level.` : "Workplace English builds best from A2 upward.",
        ready: idx >= 2,
        gateMessage: idx >= 2 ? "" : "Business scenarios open from A2 — your General English work is building toward it.",
        nextHref: idx >= 2 ? "/business-english" : "/general-english",
      };
    case "IELTS":
      return {
        productId,
        level,
        headline: idx >= 2 ? `Band preparation calibrated from ${level}.` : "IELTS preparation builds best from B1 upward.",
        ready: idx >= 3,
        gateMessage: idx >= 3 ? "" : "IELTS coursework starts at B1. Your path will take you there — every session counts twice.",
        nextHref: idx >= 3 ? "/ielts" : "/general-english",
      };
    case "CAMBRIDGE":
      return {
        productId,
        level,
        headline: `A2 Key → C2 Proficiency, matched to ${level}.`,
        ready: idx >= 1,
        gateMessage: idx >= 1 ? "" : "Take LevelCheck to place yourself before choosing a qualification.",
        nextHref: idx >= 1 ? "/cambridge" : "/diagnostic",
      };
    case "FLUENCY_TRACK":
      return {
        productId,
        level,
        headline: idx >= 3 ? `Spoken fluency from your ${level} base.` : "The Fluency Track starts at B1.",
        ready: idx >= 3,
        gateMessage: idx >= 3 ? "" : "Fluency work opens at B1 — your current sessions are building the base.",
        nextHref: idx >= 3 ? "/fluency-track" : "/general-english",
      };
  }
}

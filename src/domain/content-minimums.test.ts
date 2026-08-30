import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EAR_ACTIVITIES, READING_ACTIVITIES } from "./content-library";
import { LAB_PHRASES } from "./speaking-lab";
import { GRAMMAR_DRILLS_EXTRA } from "./grammar-drills-expansion";
import { VOCAB_PAGE_EXPANSION_A } from "./vocab-page-expansion-a";
import { VOCAB_PAGE_EXPANSION_B } from "./vocab-page-expansion-b";

/**
 * Spec Part 100 — minimum content per CEFR band (Pre-A1 → C2):
 * Role-play 6 · Speaking Coach 20 · English Ear 20 · Reading 6 · Writing 3 ·
 * Vocabulary 100 · Grammar 30. Role-play and Writing are locked by their own
 * suites; this file locks the rest so content can only grow, never shrink.
 */
const BANDS = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

function countByLevel<T extends { level: string }>(items: T[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) counts[item.level] = (counts[item.level] ?? 0) + 1;
  return counts;
}

describe("Part 100 content minimums per band", () => {
  it("Speaking Coach has >= 20 phrases per band", () => {
    const by = countByLevel(LAB_PHRASES);
    for (const band of BANDS) expect(by[band] ?? 0).toBeGreaterThanOrEqual(20);
  });

  it("English Ear has >= 20 activities per band", () => {
    const by = countByLevel(EAR_ACTIVITIES);
    for (const band of BANDS) expect(by[band] ?? 0).toBeGreaterThanOrEqual(20);
  });

  it("Reading has >= 6 activities per band", () => {
    const by = countByLevel(READING_ACTIVITIES);
    for (const band of BANDS) expect(by[band] ?? 0).toBeGreaterThanOrEqual(6);
  });

  it("Grammar expansion bank has enough drills to reach 30 per band with the base page bank", () => {
    const by = countByLevel(GRAMMAR_DRILLS_EXTRA);
    const baseCounts = countGrammarBase();
    for (const band of BANDS) {
      expect((by[band] ?? 0) + (baseCounts[band] ?? 0)).toBeGreaterThanOrEqual(30);
    }
  });

  it("Vocabulary page reaches >= 100 entries per band (base + expansions)", () => {
    const merged: Record<string, number> = {};
    for (const bank of [VOCAB_PAGE_EXPANSION_A, VOCAB_PAGE_EXPANSION_B]) {
      for (const [band, entries] of Object.entries(bank)) {
        merged[band] = (merged[band] ?? 0) + entries.length;
      }
    }
    const base = countVocabBase();
    for (const band of BANDS) expect((merged[band] ?? 0) + (base[band] ?? 0)).toBeGreaterThanOrEqual(100);
  });

  it("vocabulary page wires both expansion banks and offers all 7 bands", () => {
    const page = readFileSync(new URL("../../app/(app)/vocabulary/page.tsx", import.meta.url), "utf8");
    expect(page).toContain("VOCAB_PAGE_EXPANSION_A");
    expect(page).toContain("VOCAB_PAGE_EXPANSION_B");
    expect(page).toContain('"Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"');
  });

  it("grammar page wires the expansion bank", () => {
    const page = readFileSync(new URL("../../app/(app)/grammar/page.tsx", import.meta.url), "utf8");
    expect(page).toContain("GRAMMAR_DRILLS_EXTRA");
  });

  it("vocab expansion banks have no duplicate headwords across both waves", () => {
    const seen = new Set<string>();
    for (const bank of [VOCAB_PAGE_EXPANSION_A, VOCAB_PAGE_EXPANSION_B]) {
      for (const entries of Object.values(bank)) {
        for (const entry of entries) {
          const key = entry.word.toLowerCase();
          expect(seen.has(key), `duplicate headword: ${entry.word}`).toBe(false);
          seen.add(key);
        }
      }
    }
  });
});

/** Base grammar drills live in the page (client component); count via regex. */
function countGrammarBase(): Record<string, number> {
  const src = readFileSync(new URL("../../app/(app)/grammar/page.tsx", import.meta.url), "utf8");
  const base = src.slice(src.indexOf("const BASE_DRILLS"), src.indexOf("/** Part 100: 30 grammar drills"));
  const counts: Record<string, number> = {};
  for (const band of BANDS) counts[band] = (base.match(new RegExp(`level: "${band}"`, "g")) ?? []).length;
  return counts;
}

/** Base vocabulary bank lives in the page (client component); count via regex. */
function countVocabBase(): Record<string, number> {
  const src = readFileSync(new URL("../../app/(app)/vocabulary/page.tsx", import.meta.url), "utf8");
  const base = src.slice(src.indexOf("const BANK_BASE"), src.indexOf("/** Part 100: 100 vocabulary"));
  const counts: Record<string, number> = {};
  for (const band of BANDS) {
    const match = base.match(new RegExp(`\\b${band}:\\s*\\[([\\s\\S]*?)\\n  \\]`));
    counts[band] = match ? (match[1].match(/word: "/g) ?? []).length : 0;
  }
  return counts;
}

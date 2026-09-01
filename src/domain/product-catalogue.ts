import type { ProductId } from "./pricing";
import type { CatalogueProduct } from "./entitlements";

/* ═══════════════════════════════════════════════════════════════════════════
 * PRODUCT CATALOGUE — display metadata for the five learning paths.
 *
 * Single source of truth for names, taglines, destinations and visual
 * identity across the Learning Paths hub, the Current Path switcher, the
 * explore/preview pages and Settings. Icons are referenced by key and
 * resolved to components in client code (this module stays import-safe for
 * both server and client). Gradients are CSS values applied to identity
 * tiles — identical in both themes by design.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type ProductIconKey = "globe" | "briefcase" | "flame" | "board" | "certificate";

export interface ProductMeta {
  id: Exclude<ProductId, "all-access">;
  name: string;
  /** Compact name for tight spaces (mobile chips, the header switcher). */
  shortName: string;
  /** One-line purpose shown under the product name (spec §13). */
  tagline: string;
  href: string;
  icon: ProductIconKey;
  /** Identity-tile gradient (theme-independent by design). */
  gradient: string;
  /** Who this path is for (explore page + hub detail). */
  audience: string;
  /** Level or target band range. */
  levelRange: string;
  /** The key outcome a learner can expect. */
  outcome: string;
  /** Feature list for the explore page. */
  features: string[];
  /** Curriculum modules for the explore page. */
  curriculum: string[];
  /** Sample content teaser (title + body) for the explore page. */
  sample: { title: string; body: string };
  /** Whether the 7-day trial covers this product. */
  trialEligible: boolean;
}

export const PRODUCT_CATALOGUE: ProductMeta[] = [
  {
    id: "general-english",
    name: "General English",
    shortName: "General",
    tagline: "Build complete English proficiency.",
    href: "/general-english",
    icon: "globe",
    gradient: "linear-gradient(135deg, #6d5bf6, #8a63ff)",
    audience: "For learners who want their everyday English to work anywhere — conversation, reading, writing and listening growing together.",
    levelRange: "Pre-A1 → C2",
    outcome: "Communicate comfortably in daily life and follow real native-level content with confidence.",
    features: [
      "Adaptive CEFR curriculum from first words to fluent expression",
      "Level-tuned lessons with real-world missions",
      "Skill studios for reading, writing, listening and grammar",
      "Checkpoints that confirm every level before you move on",
    ],
    curriculum: [
      "Foundations — survival English and first conversations",
      "Everyday life — routines, places, people and plans",
      "Connections — opinions, stories and richer vocabulary",
      "Fluency — debates, nuance and natural expression",
      "Mastery — precision, register and near-native range",
    ],
    sample: {
      title: "Lesson · Ordering with confidence",
      body: "You are at a café with a colleague. Practise a natural exchange — greeting, ordering, small talk — with gentle correction woven into the conversation.",
    },
    trialEligible: true,
  },
  {
    id: "business-english",
    name: "Business English",
    shortName: "Business",
    tagline: "Communicate confidently at work.",
    href: "/business-english",
    icon: "briefcase",
    gradient: "linear-gradient(135deg, #0e7490, #22b8cf)",
    audience: "For professionals who need reliable English in meetings, emails, negotiations and interviews.",
    levelRange: "A2 → C1",
    outcome: "Handle workplace communication — from concise emails to persuasive presentations — with professional register.",
    features: [
      "Workplace scenarios: meetings, emails, interviews, negotiations",
      "Professional vocabulary and tone coaching",
      "Interview and presentation rehearsal with feedback",
      "Business reading and writing studios",
    ],
    curriculum: [
      "Professional foundations — introductions, small talk, email etiquette",
      "Meetings & calls — contributing, chairing, following up",
      "Written precision — reports, proposals, concise updates",
      "Influence — negotiation, presentations, interviews",
    ],
    sample: {
      title: "Lesson · The Monday stand-up",
      body: "Give a crisp two-minute update on your project: progress, blockers, next steps. The coach tightens your phrasing until it sounds boardroom-ready.",
    },
    trialEligible: true,
  },
  {
    id: "fluency-track",
    name: "Fluency Track",
    shortName: "Fluency",
    tagline: "Develop confident spoken communication.",
    href: "/fluency-track",
    icon: "flame",
    gradient: "linear-gradient(135deg, #e8590c, #f7b955)",
    audience: "For learners who understand English but hesitate when they speak — and want conversation to feel effortless.",
    levelRange: "B1 → C2",
    outcome: "Speak spontaneously — hold your own in fast, unscripted conversation without translating in your head.",
    features: [
      "Conversation-first modules with AI partners",
      "Fluency checkpoints measuring pace, pause and recovery",
      "Role-play scenarios across daily and professional life",
      "Speaking Coach with pronunciation and rhythm feedback",
    ],
    curriculum: [
      "Unblocking — from rehearsed lines to real answers",
      "Flow — longer turns, natural connectives, fewer pauses",
      "Range — humour, disagreement, storytelling",
      "Command — debates, interviews, thinking in English",
    ],
    sample: {
      title: "Module · The unexpected question",
      body: "Your partner changes topic mid-conversation — twice. Practise recovering gracefully, buying time naturally and answering without freezing.",
    },
    trialEligible: true,
  },
  {
    id: "ielts",
    name: "IELTS",
    shortName: "IELTS",
    tagline: "Prepare for your target IELTS band.",
    href: "/ielts",
    icon: "board",
    gradient: "linear-gradient(135deg, #b02a37, #e8590c)",
    audience: "For candidates targeting a specific IELTS band — Academic or General Training — with a score plan, not guesswork.",
    levelRange: "Bands 5.0 → 8.5",
    outcome: "Walk into the exam knowing exactly what each band requires — and that your practice matches it task by task.",
    features: [
      "All four papers: Listening, Reading, Writing, Speaking",
      "Band-descriptor-aligned feedback on writing and speaking",
      "Timed exam simulations with realistic pressure",
      "Target-band readiness tracking and gap analysis",
    ],
    curriculum: [
      "Exam mechanics — formats, timing, scoring logic",
      "Task mastery — Task 1/2 writing, Part 1–3 speaking",
      "Skill lift — academic vocabulary, paraphrase, coherence",
      "Full simulations — mock exams under real conditions",
    ],
    sample: {
      title: "Task · Writing Task 2 under time",
      body: "A full 40-minute essay simulation. Your response is scored against the official band descriptors — task response, coherence, lexis, grammar — with a targeted rewrite plan.",
    },
    trialEligible: true,
  },
  {
    id: "cambridge",
    name: "Cambridge",
    shortName: "Cambridge",
    tagline: "Prepare for your target qualification.",
    href: "/cambridge",
    icon: "certificate",
    gradient: "linear-gradient(135deg, #0b7285, #2f9e44)",
    audience: "For learners pursuing a Cambridge English Qualification — A2 Key through C2 Proficiency — with exam-format confidence.",
    levelRange: "A2 Key → C2 Proficiency",
    outcome: "Sit your Cambridge exam knowing every paper's rhythm — and that your readiness has been measured honestly.",
    features: [
      "Paper-by-paper preparation for each qualification level",
      "Reading & Use of English strategy training",
      "Speaking test rehearsals with examiner-style prompts",
      "Readiness checkpoints before you book the real exam",
    ],
    curriculum: [
      "Qualification map — choosing and understanding your exam",
      "Paper strategies — timing, task types, marking logic",
      "Language lift — grammar and vocabulary at exam standard",
      "Final readiness — full mock and gap review",
    ],
    sample: {
      title: "Paper · Reading & Use of English, Part 2",
      body: "A timed open-cloze drill with examiner reasoning: why each answer fits, what the trap was, and the pattern to recognise it next time.",
    },
    trialEligible: true,
  },
];

export function productMeta(id: string): ProductMeta | undefined {
  return PRODUCT_CATALOGUE.find((p) => p.id === id);
}

/** All Access display card (used beside the five paths where relevant). */
export const ALL_ACCESS_META = {
  id: "all-access" as const,
  name: "All Access",
  tagline: "Every product, every feature — one subscription.",
  gradient: "linear-gradient(135deg, #0d1930, #4f2fb8 60%, #8a63ff)",
};

/* ── Required entry level per path (Current Path switcher chip, hub badges) ──
   `display` is the learner-facing label (mirrors the low end of levelRange);
   `cefr` is the comparable CEFR floor used to check the learner's level.
   IELTS "Bands 5.0" ≈ B1; Cambridge "A2 Key" = A2. General English is open to
   everyone from Pre-A1. */
const PRODUCT_ENTRY_LEVELS: Record<CatalogueProduct, { display: string; cefr: string }> = {
  "general-english": { display: "Pre-A1", cefr: "Pre-A1" },
  "business-english": { display: "A2", cefr: "A2" },
  "fluency-track": { display: "B1", cefr: "B1" },
  ielts: { display: "Band 5.0", cefr: "B1" },
  cambridge: { display: "A2 Key", cefr: "A2" },
};

export function productEntryLevel(id: string): { display: string; cefr: string } {
  return PRODUCT_ENTRY_LEVELS[id as CatalogueProduct] ?? PRODUCT_ENTRY_LEVELS["general-english"];
}

const CEFR_ORDER = ["PRE-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

/** True when the learner's CEFR level meets (or exceeds) the path's entry floor. */
export function learnerMeetsEntry(learnerCefr: string | null | undefined, requiredCefr: string): boolean {
  if (!learnerCefr) return true;
  const learner = CEFR_ORDER.indexOf(learnerCefr.trim().toUpperCase());
  const required = CEFR_ORDER.indexOf(requiredCefr.toUpperCase());
  if (learner < 0 || required < 0) return true;
  return learner >= required;
}

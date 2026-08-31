import type { ProductId } from "./pricing";

/* ═══════════════════════════════════════════════════════════════════════════
 * PRODUCT CATALOGUE — display metadata for the five learning paths.
 *
 * Single source of truth for names, taglines, destinations and visual
 * identity across the sidebar, the dashboard showcase and Settings. Icons are
 * referenced by key and resolved to components in client code (this module
 * stays import-safe for both server and client). Gradients are CSS values
 * applied to identity tiles — identical in both themes by design.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type ProductIconKey = "globe" | "briefcase" | "flame" | "board" | "certificate";

export interface ProductMeta {
  id: Exclude<ProductId, "all-access">;
  name: string;
  /** Compact name for tight spaces (mobile tab bar, chips). */
  shortName: string;
  tagline: string;
  href: string;
  icon: ProductIconKey;
  /** Identity-tile gradient (theme-independent by design). */
  gradient: string;
}

export const PRODUCT_CATALOGUE: ProductMeta[] = [
  {
    id: "general-english",
    name: "General English",
    shortName: "General",
    tagline: "Build your complete English foundation — Pre-A1 to C2.",
    href: "/general-english",
    icon: "globe",
    gradient: "linear-gradient(135deg, #6d5bf6, #8a63ff)",
  },
  {
    id: "business-english",
    name: "Business English",
    shortName: "Business",
    tagline: "Real workplace outcomes — meetings, emails, interviews.",
    href: "/business-english",
    icon: "briefcase",
    gradient: "linear-gradient(135deg, #0e7490, #22b8cf)",
  },
  {
    id: "fluency-track",
    name: "Fluency Track (Conversation)",
    shortName: "Fluency",
    tagline: "Speak spontaneously — conversation first, B1 to C2.",
    href: "/fluency-track",
    icon: "flame",
    gradient: "linear-gradient(135deg, #e8590c, #f7b955)",
  },
  {
    id: "ielts",
    name: "IELTS Preparation",
    shortName: "IELTS",
    tagline: "Academic & General Training, band-accurate practice.",
    href: "/ielts",
    icon: "board",
    gradient: "linear-gradient(135deg, #b02a37, #e8590c)",
  },
  {
    id: "cambridge",
    name: "Cambridge English Qualifications",
    shortName: "Cambridge",
    tagline: "A2 Key to C2 Proficiency — exam-format confidence.",
    href: "/cambridge",
    icon: "certificate",
    gradient: "linear-gradient(135deg, #0b7285, #2f9e44)",
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

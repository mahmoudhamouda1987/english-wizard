import type { ProductId } from "./pricing";

/* ═══════════════════════════════════════════════════════════════════════════
 * ENTITLEMENTS — one commercial model (spec Parts 77–91).
 *
 * The plan IS the subscribed product from the 2.0 catalogue: five products
 * plus All Access, or FREE (no subscription — the core curriculum stays
 * included with every account). There are no abstract Plus/Pro tiers.
 *
 *   FREE                core learning included, 5 AI / 2 speaking checks daily
 *   any single product  30 AI / 10 speaking checks daily, deep study, boss
 *                       missions; exam surfaces only with IELTS / Cambridge
 *   all-access          everything unlimited
 *
 * An ACTIVE 7-day trial is resolved to "all-access" by the caller (see
 * gatingTier in ./subscription) — meaningful trial access, still protected
 * by the daily AI cost hard cap.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type PlanTier = "FREE" | ProductId;
export type Feature = "CORE_CURRICULUM" | "AI_TEACHER" | "SPEAKING_COACH" | "EXAM_PATHWAY" | "DEEP_STUDY" | "BOSS_MISSION";

/** The catalogue lines a learner can subscribe to (everything except FREE). */
export const SUBSCRIBABLE_PRODUCTS: ProductId[] = [
  "general-english",
  "business-english",
  "fluency-track",
  "ielts",
  "cambridge",
  "all-access",
];

/** Products that unlock the exam pathway surfaces. */
export const EXAM_PRODUCTS: ProductId[] = ["ielts", "cambridge", "all-access"];

export function isPlanTier(value: unknown): value is PlanTier {
  return value === "FREE" || (typeof value === "string" && (SUBSCRIBABLE_PRODUCTS as string[]).includes(value));
}

export const PRODUCT_NAMES: Record<PlanTier, string> = {
  "FREE": "Free",
  "general-english": "General English",
  "business-english": "Business English",
  "fluency-track": "Fluency Track",
  "ielts": "IELTS",
  "cambridge": "Cambridge",
  "all-access": "All Access",
};

export interface FeatureEntitlement {
  tier: PlanTier;
  feature: Feature;
  enabled: boolean;
  dailyQuota?: number;
}

function productEntitlements(tier: PlanTier): FeatureEntitlement[] {
  if (tier === "FREE") {
    return [
      { tier, feature: "CORE_CURRICULUM", enabled: true },
      { tier, feature: "AI_TEACHER", enabled: true, dailyQuota: 5 },
      { tier, feature: "SPEAKING_COACH", enabled: true, dailyQuota: 2 },
      { tier, feature: "EXAM_PATHWAY", enabled: false },
      { tier, feature: "DEEP_STUDY", enabled: false },
      { tier, feature: "BOSS_MISSION", enabled: false },
    ];
  }
  const unlimited = tier === "all-access";
  const exam = (EXAM_PRODUCTS as string[]).includes(tier);
  return [
    { tier, feature: "CORE_CURRICULUM", enabled: true },
    { tier, feature: "AI_TEACHER", enabled: true, ...(unlimited ? {} : { dailyQuota: 30 }) },
    { tier, feature: "SPEAKING_COACH", enabled: true, ...(unlimited ? {} : { dailyQuota: 10 }) },
    { tier, feature: "EXAM_PATHWAY", enabled: exam },
    { tier, feature: "DEEP_STUDY", enabled: true, ...(unlimited ? {} : { dailyQuota: 3 }) },
    { tier, feature: "BOSS_MISSION", enabled: true, ...(unlimited ? {} : { dailyQuota: 1 }) },
  ];
}

function buildPlanEntitlements(): Record<PlanTier, FeatureEntitlement[]> {
  const map = { FREE: productEntitlements("FREE") } as Record<PlanTier, FeatureEntitlement[]>;
  for (const product of SUBSCRIBABLE_PRODUCTS) map[product] = productEntitlements(product);
  return map;
}

export const PLAN_ENTITLEMENTS: Record<PlanTier, FeatureEntitlement[]> = buildPlanEntitlements();

export function entitlementFor(tier: PlanTier, feature: Feature): FeatureEntitlement {
  return PLAN_ENTITLEMENTS[tier].find((item) => item.feature === feature)!;
}

export function canUseFeature(tier: PlanTier, feature: Feature, usedToday = 0): boolean {
  const entitlement = entitlementFor(tier, feature);
  return entitlement.enabled && (entitlement.dailyQuota === undefined || usedToday < entitlement.dailyQuota);
}

/* ═══════════════════════════════════════════════════════════════════════════
 * PRODUCT ACCESS — display state vs enforcement.
 *
 * The lock/unlock badge shown in the navigation and on product cards reflects
 * the learner's subscription: a product is unlocked when it is the subscribed
 * line, or when All Access (or the 7-day trial, which gates as All Access)
 * covers it.
 *
 * AUDIT_MODE is the build-phase master switch: while English Wizard 2.0 is
 * being audited, EVERY surface stays accessible regardless of the badge, so
 * reviewers can walk all lessons, all paths and all products. Flip it to
 * false at commercial launch and the same function starts enforcing.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Build-phase audit switch: true = badges show intent, but nothing is enforced. */
export const AUDIT_MODE = true;

export type CatalogueProduct = Exclude<ProductId, "all-access">;

/** The five learning-path products a learner can subscribe to individually. */
export const CATALOGUE_PRODUCTS: CatalogueProduct[] = [
  "general-english",
  "business-english",
  "fluency-track",
  "ielts",
  "cambridge",
];

/** Badge state: is this product inside the learner's subscription? */
export function isProductUnlockedFor(tier: PlanTier, product: CatalogueProduct): boolean {
  if (tier === "all-access") return true;
  return tier === product;
}

/** Enforcement: may the learner open this product's content right now? */
export function productAccessible(tier: PlanTier, product: CatalogueProduct): boolean {
  if (AUDIT_MODE) return true;
  return isProductUnlockedFor(tier, product);
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LEARNING PATHS HUB — access states for the product cards and the Current
 * Path switcher (learning-paths IA, spec parts 5–11).
 *
 *   "CURRENT"  the product the learner is using right now (activeProduct)
 *   "ACTIVE"   entitled but not currently selected
 *   "LOCKED"   visible but not in the subscription — explore-only
 * ═══════════════════════════════════════════════════════════════════════════ */

export type ProductAccessState = "CURRENT" | "ACTIVE" | "LOCKED";

/** Every catalogue product the learner's plan covers (all five with All Access / trial). */
export function subscribedProducts(tier: PlanTier): CatalogueProduct[] {
  if (tier === "all-access") return [...CATALOGUE_PRODUCTS];
  if (tier === "FREE") return [];
  return [tier as CatalogueProduct];
}

/** Card + switcher state for one product, given the plan and current selection. */
export function productAccessState(tier: PlanTier, product: CatalogueProduct, activeProduct?: string | null): ProductAccessState {
  if (!isProductUnlockedFor(tier, product)) return "LOCKED";
  if (activeProduct && activeProduct === product) return "CURRENT";
  return "ACTIVE";
}

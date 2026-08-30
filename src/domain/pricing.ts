/* ═══════════════════════════════════════════════════════════════════════════
 * PRICING — authoritative commercial configuration (spec Parts 77–91).
 *
 * ONE PRICE PER PRODUCT (monthly + yearly with annual saving) plus ONE
 * All-Access plan. No Basic/Premium split, no free-forever tier — every new
 * learner gets a 7-day trial; after it ends, a subscription is required for
 * premium learning (profile, reports, history and Student ID are preserved).
 *
 * Nothing in this file may be hardcoded inside components: pages render from
 * this configuration. Prices are LAUNCH POSITIONING recommendations —
 * re-evaluate against current market data before commercial launch (Part 78).
 * ═══════════════════════════════════════════════════════════════════════════ */

export type ProductId =
  | "general-english"
  | "business-english"
  | "fluency-track"
  | "ielts"
  | "cambridge"
  | "all-access";

export type RegionCode = "WW" | "EG";
export type CurrencyCode = "USD" | "EGP";

export interface RegionConfig {
  code: RegionCode;
  label: string;
  currency: CurrencyCode;
}

export const REGIONS: Record<RegionCode, RegionConfig> = {
  WW: { code: "WW", label: "Worldwide", currency: "USD" },
  EG: { code: "EG", label: "Egypt", currency: "EGP" },
};

export interface EntitlementSet {
  /** The product surfaces this price unlocks. */
  products: Array<Exclude<ProductId, "all-access">>;
  /** Feature entitlements granted while this product is subscribed. */
  features: string[];
}

export interface PriceEntry {
  product: ProductId;
  name: string;
  region: RegionCode;
  currency: CurrencyCode;
  /** Monthly price in major units (e.g. 12.99 USD, 399 EGP). */
  monthly: number;
  /** Annual price in major units. */
  annual: number;
  /** Whole annual saving vs 12 × monthly, in the same currency. */
  annualSaving: number;
  trialDays: number;
  effectiveDate: string;
  entitlements: EntitlementSet;
  positioning: string;
}

const CORE_FEATURES = [
  "LevelCheck placement",
  "Personalised learning path",
  "Daily plan and progress insights",
  "Review, mastery and portfolio evidence",
];

const ALL_PRODUCTS: Array<Exclude<ProductId, "all-access">> = [
  "general-english",
  "business-english",
  "fluency-track",
  "ielts",
  "cambridge",
];

/** Annual saving = (12 × monthly) − annual, rounded to a sensible unit. */
function saving(monthly: number, annual: number, currency: CurrencyCode): number {
  const raw = monthly * 12 - annual;
  return currency === "EGP" ? Math.round(raw / 10) * 10 : Math.round(raw * 100) / 100;
}

function entry(
  product: ProductId,
  name: string,
  region: RegionCode,
  monthly: number,
  annual: number,
  entitlements: EntitlementSet,
  positioning: string,
  effectiveDate = "2026-09-01",
): PriceEntry {
  const currency = REGIONS[region].currency;
  return {
    product, name, region, currency, monthly, annual,
    annualSaving: saving(monthly, annual, currency),
    trialDays: 7, effectiveDate, entitlements, positioning,
  };
}

/* ── Launch price catalogue (Parts 78–79). Config, not component copy. ── */

const WORLDWIDE: PriceEntry[] = [
  entry("general-english", "General English", "WW", 12.99, 119.99,
    { products: ["general-english"], features: [...CORE_FEATURES, "Full Pre-A1 → C2 curriculum"] },
    "Everyday English that holds up in the real world."),
  entry("business-english", "Business English", "WW", 16.99, 159.99,
    { products: ["business-english"], features: [...CORE_FEATURES, "Workplace outcomes: emails, meetings, interviews", "Practise Your Actual Thing"] },
    "English that works in meetings, emails and interviews."),
  entry("fluency-track", "Fluency Track", "WW", 18.99, 179.99,
    { products: ["fluency-track"], features: [...CORE_FEATURES, "Sixteen signature fluency modules", "Conversation Gym and pressure role-plays"] },
    "From B1 understanding to C2 spontaneous fluency."),
  entry("ielts", "IELTS", "WW", 21.99, 199.99,
    { products: ["ielts"], features: [...CORE_FEATURES, "Academic & General Training preparation", "Teach → guided → timed → mock → report"] },
    "Structured preparation for your target band, 4.0–9.0."),
  entry("cambridge", "Cambridge", "WW", 21.99, 199.99,
    { products: ["cambridge"], features: [...CORE_FEATURES, "A2 Key → C2 Proficiency preparation", "Paper-by-paper readiness checks"] },
    "Exam-ready for the qualification employers recognise."),
  entry("all-access", "All Access", "WW", 29.99, 269.99,
    { products: ALL_PRODUCTS, features: [...CORE_FEATURES, "All five products, one subscription", "Everything the ecosystem offers"] },
    "One subscription. The complete English Wizard ecosystem."),
];

const EGYPT: PriceEntry[] = [
  entry("general-english", "General English", "EG", 399, 3599,
    { products: ["general-english"], features: [...CORE_FEATURES, "Full Pre-A1 → C2 curriculum"] },
    "Everyday English that holds up in the real world."),
  entry("business-english", "Business English", "EG", 499, 4499,
    { products: ["business-english"], features: [...CORE_FEATURES, "Workplace outcomes: emails, meetings, interviews", "Practise Your Actual Thing"] },
    "English that works in meetings, emails and interviews."),
  entry("fluency-track", "Fluency Track", "EG", 549, 4999,
    { products: ["fluency-track"], features: [...CORE_FEATURES, "Sixteen signature fluency modules", "Conversation Gym and pressure role-plays"] },
    "From B1 understanding to C2 spontaneous fluency."),
  entry("ielts", "IELTS", "EG", 599, 5399,
    { products: ["ielts"], features: [...CORE_FEATURES, "Academic & General Training preparation", "Teach → guided → timed → mock → report"] },
    "Structured preparation for your target band, 4.0–9.0."),
  entry("cambridge", "Cambridge", "EG", 599, 5399,
    { products: ["cambridge"], features: [...CORE_FEATURES, "A2 Key → C2 Proficiency preparation", "Paper-by-paper readiness checks"] },
    "Exam-ready for the qualification employers recognise."),
  entry("all-access", "All Access", "EG", 799, 7199,
    { products: ALL_PRODUCTS, features: [...CORE_FEATURES, "All five products, one subscription", "Everything the ecosystem offers"] },
    "One subscription. The complete English Wizard ecosystem."),
];

/** Full catalogue, both regions. */
export const PRICE_CATALOGUE: PriceEntry[] = [...WORLDWIDE, ...EGYPT];

/** Resolve the catalogue for one region, in display order (products, then All Access). */
export function pricesForRegion(region: RegionCode): PriceEntry[] {
  const order: ProductId[] = ["general-english", "business-english", "fluency-track", "ielts", "cambridge", "all-access"];
  return PRICE_CATALOGUE
    .filter((p) => p.region === region)
    .sort((a, b) => order.indexOf(a.product) - order.indexOf(b.product));
}

/**
 * Region resolution (Part 81): the billing country is the authoritative
 * commercial signal when available; IP geolocation may only be a secondary
 * default, never the sole source. Unknown → worldwide.
 */
export function resolveRegion(billingCountry?: string | null): RegionCode {
  if (!billingCountry) return "WW";
  const c = billingCountry.trim().toUpperCase();
  return c === "EG" || c === "EGYPT" ? "EG" : "WW";
}

/** Format a price for display in its region currency. */
export function formatPrice(amount: number, currency: CurrencyCode): string {
  if (currency === "EGP") return `EGP ${amount.toLocaleString("en-EG")}`;
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Annual saving as a percentage of the monthly × 12 baseline. */
export function annualSavingPct(p: PriceEntry): number {
  return Math.round(((p.monthly * 12 - p.annual) / (p.monthly * 12)) * 100);
}

/** Homepage entry pricing (Part 83): one honest "from" line, region-aware. */
export function entryPrice(region: RegionCode): { product: string; price: string } {
  const ge = pricesForRegion(region).find((p) => p.product === "general-english")!;
  return { product: ge.name, price: `${formatPrice(ge.monthly, ge.currency)}/month` };
}

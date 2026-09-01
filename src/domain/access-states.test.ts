import { describe, expect, it } from "vitest";
import {
  AUDIT_MODE,
  CATALOGUE_PRODUCTS,
  isProductUnlockedFor,
  productAccessState,
  productAccessible,
  subscribedProducts,
  type CatalogueProduct,
  type PlanTier,
} from "./entitlements";

/**
 * Regression lock for the Learning Paths hub access-state model
 * (learning-paths IA, spec parts 5–11). The hub cards, the header Current
 * Path switcher and the ProductGate all render from these three functions —
 * if their semantics drift, every locked/active/current badge in the product
 * drifts with them.
 */

describe("isProductUnlockedFor (badge semantics)", () => {
  it("all-access unlocks every catalogue product", () => {
    for (const product of CATALOGUE_PRODUCTS) {
      expect(isProductUnlockedFor("all-access", product)).toBe(true);
    }
  });

  it("a single-product tier unlocks exactly that product", () => {
    expect(isProductUnlockedFor("ielts", "ielts")).toBe(true);
    expect(isProductUnlockedFor("ielts", "cambridge")).toBe(false);
    expect(isProductUnlockedFor("general-english", "business-english")).toBe(false);
  });

  it("FREE unlocks nothing", () => {
    for (const product of CATALOGUE_PRODUCTS) {
      expect(isProductUnlockedFor("FREE", product)).toBe(false);
    }
  });
});

describe("productAccessState (card + switcher states)", () => {
  it("FREE sees every product as LOCKED — visible, explore-only, never CURRENT", () => {
    for (const product of CATALOGUE_PRODUCTS) {
      expect(productAccessState("FREE", product, "general-english")).toBe("LOCKED");
    }
  });

  it("the selected product is CURRENT, the rest of the plan ACTIVE", () => {
    expect(productAccessState("ielts", "ielts", "ielts")).toBe("CURRENT");
    expect(productAccessState("all-access", "ielts", "ielts")).toBe("CURRENT");
    expect(productAccessState("all-access", "cambridge", "ielts")).toBe("ACTIVE");
  });

  it("ACTIVE when entitled with no selection yet (fresh profile)", () => {
    expect(productAccessState("ielts", "ielts", null)).toBe("ACTIVE");
    expect(productAccessState("all-access", "general-english", null)).toBe("ACTIVE");
  });

  it("LOCKED wins over CURRENT — a switched-away entitlement never fakes currency", () => {
    // Learner on ielts switches activeProduct to an entitled product; a locked
    // product must stay LOCKED regardless of what activeProduct points at.
    expect(productAccessState("ielts", "cambridge", "cambridge")).toBe("LOCKED");
  });
});

describe("subscribedProducts (plan coverage)", () => {
  it("FREE covers no products", () => {
    expect(subscribedProducts("FREE")).toEqual([]);
  });

  it("all-access covers exactly the five catalogue products", () => {
    expect(subscribedProducts("all-access")).toEqual(CATALOGUE_PRODUCTS);
  });

  it("a single-product tier covers itself only", () => {
    expect(subscribedProducts("business-english")).toEqual(["business-english"]);
  });
});

describe("productAccessible (enforcement boundary)", () => {
  it("commercial launch: audit mode is OFF — enforcement equals badge semantics", () => {
    // Flipped at commercial launch; the developer-only audit LAYER (personas,
    // level overrides, resets) remains environment-locked in
    // infrastructure/audit-mode.ts and never touches this switch.
    expect(AUDIT_MODE).toBe(false);
    expect(productAccessible("FREE", "ielts")).toBe(false);
    expect(productAccessible("FREE", "cambridge")).toBe(false);
    expect(productAccessible("ielts", "ielts")).toBe(true);
    expect(productAccessible("ielts", "cambridge")).toBe(false);
    expect(productAccessible("all-access", "general-english")).toBe(true);
  });

  it("access equals badge semantics", () => {
    // Enforcement and badges read the same helper — they cannot drift.
    expect(isProductUnlockedFor("all-access", "ielts")).toBe(true);
    expect(isProductUnlockedFor("FREE", "ielts")).toBe(false);
  });
});

describe("catalogue invariants (hub renders five products, no duplicates)", () => {
  it("exactly five products, unique ids", () => {
    expect(CATALOGUE_PRODUCTS).toHaveLength(5);
    expect(new Set(CATALOGUE_PRODUCTS).size).toBe(5);
  });

  it("every entry is a valid PlanTier (a product can be a subscription tier)", () => {
    for (const product of CATALOGUE_PRODUCTS) {
      const tier = product as PlanTier;
      expect(typeof tier).toBe("string");
      expect(subscribedProducts(tier)).toEqual([product as CatalogueProduct]);
    }
  });
});

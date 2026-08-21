import { describe, expect, it } from "vitest";
import { budgetState, canSpend, fingerprintRequest, passesQualityGate, routeAITask } from "./ai-operations";

describe("AI operations", () => {
  it("routes tasks to appropriate model tiers", () => {
    expect(routeAITask("WRITING", "LOW").tier).toBe("FAST");
    expect(routeAITask("DIAGNOSTIC", "LOW").tier).toBe("PREMIUM");
    expect(routeAITask("LESSON", "MEDIUM").tier).toBe("BALANCED");
  });

  it("routes to real OpenAI model identifiers with cost-ordered capacity", () => {
    const fast = routeAITask("EXPLANATION", "LOW");
    const balanced = routeAITask("LESSON", "MEDIUM");
    const premium = routeAITask("DIAGNOSTIC", "HIGH");
    for (const route of [fast, balanced, premium]) {
      expect(route.model).toMatch(/^gpt-[a-z0-9.\-]+$/);
      expect(route.model).not.toContain("gpt-5.6\"");
    }
    expect(new Set([fast.model, balanced.model, premium.model]).size).toBe(3);
    expect(fast.maxTokens).toBeLessThan(balanced.maxTokens);
    expect(balanced.maxTokens).toBeLessThan(premium.maxTokens);
  });

  it("enforces hard and soft budget states", () => {
    const budget = { learnerId: "l1", dailyCents: 100, usedCents: 60, hardLimitCents: 100, softLimitCents: 50 };
    expect(budgetState(budget)).toBe("SOFT_LIMIT");
    expect(canSpend(budget, 40)).toBe(true);
    expect(canSpend(budget, 41)).toBe(false);
  });

  it("fingerprints equivalent normalized requests consistently", () => {
    const a = fingerprintRequest({ task: "LESSON", normalizedInput: "Hello   World", contextVersion: "v1" });
    const b = fingerprintRequest({ task: "LESSON", normalizedInput: " hello world ", contextVersion: "v1" });
    expect(a).toBe(b);
  });

  it("rejects unsafe or weak AI outputs", () => {
    expect(passesQualityGate({ validSchema: true, alignedLevel: true, safe: true, grounded: true, useful: true, hallucinationRisk: 0.1 })).toBe(true);
    expect(passesQualityGate({ validSchema: true, alignedLevel: true, safe: true, grounded: true, useful: true, hallucinationRisk: 0.5 })).toBe(false);
  });
});

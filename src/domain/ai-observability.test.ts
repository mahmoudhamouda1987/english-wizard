import { describe, expect, it } from "vitest";
import { classifyAIStatus, redactAIProviderDetail } from "./ai-observability";

describe("AI observability", () => {
  it("classifies provider throttling/auth failures without exposing details", () => {
    expect(classifyAIStatus(429)).toBe("PROVIDER_ERROR");
    expect(classifyAIStatus(401)).toBe("PROVIDER_ERROR");
    expect(redactAIProviderDetail("secret response body")).toBeUndefined();
  });

  it("does not treat client validation as a provider error", () => {
    expect(classifyAIStatus(400)).toBe("UNEXPECTED_ERROR");
  });
});

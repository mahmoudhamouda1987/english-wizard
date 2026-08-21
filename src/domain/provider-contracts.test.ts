import { describe, expect, it } from "vitest";
import { isProviderCapabilitySupported, unavailableProvider } from "./provider-contracts";

describe("provider contracts", () => {
  it("represents unsupported capabilities explicitly", () => {
    const result = unavailableProvider("TRANSCRIPTION");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("NOT_CONFIGURED");
  });

  it("checks capability declarations without pretending support", () => {
    expect(isProviderCapabilitySupported(["LLM", "TTS"], "LLM")).toBe(true);
    expect(isProviderCapabilitySupported(["LLM", "TTS"], "EMBEDDINGS")).toBe(false);
  });
});

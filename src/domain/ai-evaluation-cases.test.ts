import { describe, expect, it } from "vitest";
import { AI_EVALUATION_CASES } from "./ai-evaluation-cases";

describe("AI evaluation corpus", () => {
  it("covers core educational and safety failure modes", () => {
    const tasks = new Set(AI_EVALUATION_CASES.map((item) => item.task));
    expect(tasks.has("EXPLANATION")).toBe(true);
    expect(tasks.has("CORRECTION")).toBe(true);
    expect(tasks.has("CEFR")).toBe(true);
    expect(tasks.has("SCORING")).toBe(true);
    expect(tasks.has("HALLUCINATION")).toBe(true);
    expect(tasks.has("SAFETY")).toBe(true);
    expect(AI_EVALUATION_CASES.length).toBeGreaterThanOrEqual(6);
    for (const item of AI_EVALUATION_CASES) expect(item.expectedProperties.length).toBeGreaterThan(1);
  });
});

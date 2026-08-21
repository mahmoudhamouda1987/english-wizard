import { test, expect } from "@playwright/test";

test("AI writing and speaking feedback return persisted learner evidence metadata", async ({ request }) => {
  const email = `ai-evidence-${Date.now()}@example.com`;
  const registered = await request.post("/api/auth/register", { data: { email, displayName: "AI Evidence Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();

  const before = await request.get("/api/evidence");
  expect(before.ok()).toBeTruthy();
  expect((await before.json()).evidence).toHaveLength(0);

  if (!process.env.OPENAI_API_KEY) test.skip(true, "Live OpenAI verification requires OPENAI_API_KEY in the test environment.");

  const writing = await request.post("/api/ai/writing", { data: {
    prompt: "Write one short sentence about your daily routine.",
    answer: "I go to work at eight every day.",
  }});
  expect(writing.ok()).toBeTruthy();
  const writingPayload = await writing.json();
  expect(writingPayload.evidence.source).toBe("AI_FEEDBACK");
  expect(writingPayload.evidence.context).toBe("FAMILIAR");
  expect(writingPayload.evidence.modality).toBe("WRITING");

  const speaking = await request.post("/api/ai/speaking", { data: {
    prompt: "Introduce yourself in one sentence.",
    transcript: "My name is Alex and I work in an office.",
  }});
  expect(speaking.ok()).toBeTruthy();
  const speakingPayload = await speaking.json();
  expect(speakingPayload.evidence.source).toBe("AI_FEEDBACK");
  expect(speakingPayload.evidence.context).toBe("FAMILIAR");
  expect(speakingPayload.evidence.modality).toBe("SPEAKING");

  const after = await request.get("/api/evidence");
  expect(after.ok()).toBeTruthy();
  const evidence = (await after.json()).evidence;
  expect(evidence).toHaveLength(2);
  expect(evidence.every((item: { context: string; source?: string }) => item.context === "FAMILIAR" && item.source === "AI_FEEDBACK")).toBe(true);
});

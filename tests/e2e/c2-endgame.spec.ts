import { test, expect } from "@playwright/test";

async function register(request: import("@playwright/test").APIRequestContext) {
  const email = `c2-${Date.now()}@example.com`;
  const result = await request.post("/api/auth/register", {
    data: { email, displayName: "C2 Learner", password: "StrongPass123!" },
  });
  expect(result.ok()).toBeTruthy();
}

test("C2 Live in English persists a submitted stage response across reads", async ({ request }) => {
  await register(request);
  const initial = await request.get("/api/c2-endgame");
  expect(initial.ok()).toBeTruthy();
  const first = await initial.json();
  expect(first.stage.id).toBe("morning_briefing");

  const rejected = await request.post("/api/c2-endgame", { data: { response: "Too short", modality: "WRITING" } });
  expect(rejected.status()).toBe(400);

  const submitted = await request.post("/api/c2-endgame", {
    data: {
      response: "The briefing suggests a material operational risk, but the source does not establish the cause with enough certainty. I would explain the likely implications while separating confirmed facts from the inference.",
      modality: "WRITING",
    },
  });
  expect(submitted.status()).toBe(201);
  const afterSubmit = await submitted.json();
  expect(afterSubmit.state.completedStageIds).toContain("morning_briefing");
  expect(afterSubmit.state.stageIndex).toBe(1);

  const persisted = await request.get("/api/c2-endgame");
  const persistedPayload = await persisted.json();
  expect(persistedPayload.state.stageIndex).toBe(1);
  expect(persistedPayload.stage.id).toBe("stakeholder_meeting");
});

test("C2 endgame does not report mastery certification when all stages are submitted", async ({ request }) => {
  await register(request);
  for (const response of [
    "I would separate what is known from what is inferred and explain the implications to the colleague in precise terms.",
    "I would acknowledge the opposing position, negotiate the workable compromise and defend it using the stakeholder priorities.",
    "I would prioritise the strongest information, state what remains uncertain and calibrate the conclusion to the evidence available.",
    "I would maintain the social interaction naturally, repair the misunderstanding and adjust register when the disagreement becomes sensitive.",
    "I would synthesise the discussion, make the trade-offs explicit and write the decision for the intended audience.",
    "I would explain how new evidence changed my position, distinguish confidence from certainty and defend the revised decision precisely.",
  ]) {
    const result = await request.post("/api/c2-endgame", { data: { response, modality: "WRITING" } });
    expect(result.status()).toBe(201);
  }

  const final = await request.get("/api/c2-endgame");
  const payload = await final.json();
  expect(payload.complete).toBe(true);
  expect(payload).not.toHaveProperty("certified");
  expect(payload).not.toHaveProperty("masteryAwarded");
});

import { test, expect, type APIRequestContext } from "@playwright/test";

async function register(request: APIRequestContext) {
  const email = `adaptive-diagnostic-${Date.now()}@example.com`;
  const response = await request.post("/api/auth/register", { data: { email, displayName: "Adaptive Learner", password: "StrongPass123!" } });
  expect(response.ok()).toBeTruthy();
}

test("diagnostic exposes evidence-driven next questions", async ({ request }) => {
  await register(request);
  const first = await request.get("/api/diagnostic");
  expect(first.ok()).toBeTruthy();
  const firstPayload = await first.json();
  expect(firstPayload.adaptive.nextQuestionId).toBeTruthy();

  const firstId = firstPayload.adaptive.nextQuestionId as string;
  const firstQuestion = firstPayload.questions.find((question: { id: string }) => question.id === firstId);
  expect(firstQuestion).toBeTruthy();

  const encoded = encodeURIComponent(JSON.stringify([{ id: firstId, answer: firstQuestion.options[0] }]));
  const second = await request.get(`/api/diagnostic?answers=${encoded}`);
  expect(second.ok()).toBeTruthy();
  const secondPayload = await second.json();
  expect(secondPayload.adaptive.askedIds).toContain(firstId);
  expect(secondPayload.adaptive.nextQuestionId).not.toBe(firstId);
});

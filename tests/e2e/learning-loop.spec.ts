import { test, expect, type APIRequestContext } from "@playwright/test";

async function register(request: APIRequestContext) {
  const email = `loop-${Date.now()}@example.com`;
  const response = await request.post("/api/auth/register", { data: { email, displayName: "Loop Learner", password: "StrongPass123!" } });
  expect(response.ok()).toBeTruthy();
}

test("learning loop state persists and advances from production evidence", async ({ request }) => {
  await register(request);
  const first = await request.get("/api/learning-loop");
  expect(first.ok()).toBeTruthy();
  expect((await first.json()).loop.phase).toBe("TEACH");

  const next = await request.post("/api/learning-loop", { data: { phase: "TEACH", evidenceId: "loop-e1", passed: true, score: 90 } });
  expect(next.ok()).toBeTruthy();
  expect((await next.json()).loop.phase).toBe("NOTICE");

  const invalid = await request.post("/api/learning-loop", { data: { phase: "TEACH" } });
  expect(invalid.status()).toBe(409);

  const second = await request.get("/api/learning-loop");
  expect((await second.json()).loop.evidenceIds).toContain("loop-e1");
});

import { test, expect } from "@playwright/test";

test("chunks API and learner-facing practice persist receptive/productive knowledge", async ({ page }) => {
  const request = page.request;
  const email = `chunks-${Date.now()}@example.com`;
  const register = await request.post("/api/auth/register", { data: { email, displayName: "Chunks Learner", password: "StrongPass123!" } });
  expect(register.ok()).toBeTruthy();

  const first = await request.get("/api/chunks");
  expect(first.ok()).toBeTruthy();
  const payload = await first.json();
  expect(payload.chunks.length).toBeGreaterThan(0);
  expect(payload.functions.GIVE_OPINION).toBeTruthy();

  const chunkId = payload.chunks[0].id;
  const receptive = await request.post("/api/chunks", { data: { chunkId, productive: false, success: false } });
  expect(receptive.status()).toBe(201);
  expect((await receptive.json()).knowledge).toBe("RECEPTIVE");

  const productive = await request.post("/api/chunks", { data: { chunkId, productive: true, success: true } });
  expect(productive.status()).toBe(201);
  expect((await productive.json()).knowledge).toBe("PRODUCTIVE");

  await page.goto("/chunks");
  await expect(page.getByRole("heading", { name: "Chunks & Mediation" })).toBeVisible();
  await expect(page.getByRole("button", { name: /I can use it/ }).first()).toBeVisible();
});

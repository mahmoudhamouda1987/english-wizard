import { test, expect } from "@playwright/test";

test("learner state and AI endpoints are protected without a session", async ({ request }) => {
  expect((await request.get("/api/learner-state")).status()).toBe(401);
  expect((await request.get("/api/profile")).status()).toBe(401);
  expect((await request.get("/api/privacy")).status()).toBe(401);
  expect((await request.get("/api/evidence")).status()).toBe(401);
  expect((await request.get("/api/analytics")).status()).toBe(401);
  expect((await request.post("/api/ai/lesson", { data: { goal: "grammar" } })).status()).toBe(401);
});

test("public health endpoint remains available without exposing learner data", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  expect(payload.status).toBe("ok");
  expect(payload).not.toHaveProperty("learnerId");
});

test("onboarding and settings expose core accessibility landmarks and labels", async ({ page }) => {
  const email = `a11y-${Date.now()}@example.com`;
  const registered = await page.request.post("/api/auth/register", { data: { email, displayName: "A11y Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();
  await page.goto("/onboarding");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByLabel("Your name")).toBeVisible();
  await page.goto("/settings");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByRole("heading").first()).toBeVisible();
});

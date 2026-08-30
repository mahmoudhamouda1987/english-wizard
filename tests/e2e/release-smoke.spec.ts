import { test, expect } from "@playwright/test";

test("public production shell and security release contract", async ({ request, page }) => {
  const home = await request.get("/");
  expect(home.ok()).toBeTruthy();

  const health = await request.get("/api/health");
  expect(health.ok()).toBeTruthy();
  expect((await health.json()).status).toBe("ok");

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBeTruthy();
  const manifestPayload = await manifest.json();
  expect(manifestPayload.name).toBe("English Wizard");
  expect(manifestPayload.display).toBe("standalone");

  const serviceWorker = await request.get("/sw.js");
  expect(serviceWorker.ok()).toBeTruthy();
  expect(await serviceWorker.text()).toContain("english-wizard-shell-v3");

  const offline = await request.get("/offline");
  expect(offline.ok()).toBeTruthy();

  expect((await request.get("/api/learner-state")).status()).toBe(401);
  expect((await request.get("/api/evidence")).status()).toBe(401);
  expect((await request.post("/api/ai/lesson", { data: { goal: "grammar" } })).status()).toBe(401);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Master English/i })).toBeVisible();
  // Brand identity (final brand spec Parts 1/4): slogan signature + CHECK MY LEVEL as the single primary CTA.
  await expect(page.getByText("Intelligent English. Measurable Progress.").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Check My Level" }).first()).toBeVisible();
  await expect(page.getByText(/Discover My Level/i)).toHaveCount(0);
  // Part 83: homepage offers entry pricing ("Explore plans"), never free-forever claims.
  await expect(page.getByRole("link", { name: /Explore plans/i })).toBeVisible();
  await expect(page.getByText(/free forever/i)).toHaveCount(0);
  expect(await page.locator('img[alt="English Wizard logo"]').first().isVisible()).toBeTruthy();
});

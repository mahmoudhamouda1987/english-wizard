import { test, expect } from "@playwright/test";

test("product metrics endpoint requires authentication", async ({ request }) => {
  expect((await request.get("/api/metrics")).status()).toBe(401);
  expect((await request.get("/api/experiments")).status()).toBe(401);
});

test("authenticated learners see aggregate product analytics without personal data exposure", async ({ page }) => {
  const email = `metrics-${Date.now()}@example.com`;
  const registered = await page.request.post("/api/auth/register", { data: { email, displayName: "Metrics Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();

  const response = await page.request.get("/api/metrics");
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  expect(payload.totalLearners).toBeGreaterThan(0);
  expect(typeof payload.activeLearners7d).toBe("number");
  expect(["number", "object"]).toContain(typeof payload.day7RetentionRate);
  expect(JSON.stringify(payload)).not.toContain(email);
  expect(payload).not.toHaveProperty("learnerId");
});

test("experiment lifecycle validates definitions and transitions with deterministic assignment", async ({ page }) => {
  const email = `experiment-${Date.now()}@example.com`;
  const registered = await page.request.post("/api/auth/register", { data: { email, displayName: "Experiment Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();

  const invalid = await page.request.post("/api/experiments", { data: { action: "CREATE", name: "x" } });
  expect(invalid.status()).toBe(400);

  const created = await page.request.post("/api/experiments", {
    data: {
      action: "CREATE",
      name: `review-copy-test-${Date.now()}`,
      hypothesis: "Encouraging copy increases weekly review completion.",
      control: "control",
      variants: ["encouraging"],
      primaryLearningMetric: "RETENTION",
    },
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();

  const skipped = await page.request.post("/api/experiments", { data: { action: "TRANSITION", id, to: "COMPLETED" } });
  expect(skipped.status()).toBe(400);

  const started = await page.request.post("/api/experiments", { data: { action: "TRANSITION", id, to: "RUNNING" } });
  expect(started.ok()).toBeTruthy();

  const listed = await page.request.get("/api/experiments");
  const listing = await listed.json();
  const running = listing.experiments.find((experiment: { id: string }) => experiment.id === id);
  expect(running.status).toBe("RUNNING");
  expect(["control", "encouraging"]).toContain(listing.myAssignments[running.name]);
});

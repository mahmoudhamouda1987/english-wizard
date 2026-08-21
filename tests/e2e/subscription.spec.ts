import { test, expect } from "@playwright/test";

test("subscription lifecycle is separate from learning state and enforces plan gating", async ({ request }) => {
  const email = `billing-${Date.now()}@example.com`;
  await request.post("/api/auth/register", { data: { email, displayName: "Billing Learner", password: "StrongPass123!" } });

  const initial = await (await request.get("/api/subscription")).json();
  expect(initial.effectiveTier).toBe("FREE");
  expect(initial.valueModel.lockedUntilUpgrade).toContain("EXAM_PATHWAY");
  expect(initial.subscription ?? null).toBeNull();

  const upgrade = await request.post("/api/subscription", { data: { action: "CHANGE_PLAN", tier: "PLUS" } });
  expect(upgrade.status()).toBe(201);
  const upgraded = await upgrade.json();
  expect(upgraded.subscription.tier).toBe("PLUS");
  expect(upgraded.effectiveTier).toBe("PLUS");

  const after = await (await request.get("/api/subscription")).json();
  expect(after.valueModel.lockedUntilUpgrade).not.toContain("EXAM_PATHWAY");

  const cancel = await request.post("/api/subscription", { data: { action: "CANCEL" } });
  expect(cancel.ok()).toBeTruthy();
  const cancelled = await cancel.json();
  expect(cancelled.effectiveTier).toBe("FREE");
  expect(cancelled.subscription.cancelAtPeriodEnd).toBe(true);

  const resume = await request.post("/api/subscription", { data: { action: "RESUME" } });
  expect((await resume.json()).effectiveTier).toBe("PLUS");

  const invalid = await request.post("/api/subscription", { data: { action: "CHANGE_PLAN", tier: "ULTIMATE" } });
  expect(invalid.status()).toBe(400);

  const learning = await (await request.get("/api/learner-state")).json();
  expect(learning.state.currentLessonId).toBeTruthy();
});

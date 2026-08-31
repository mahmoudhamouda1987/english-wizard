import { test, expect } from "@playwright/test";

test("subscription lifecycle is separate from learning state and enforces plan gating", async ({ request }) => {
  const email = `billing-${Date.now()}@example.com`;
  await request.post("/api/auth/register", { data: { email, displayName: "Billing Learner", password: "StrongPass123!" } });

  const initial = await (await request.get("/api/subscription")).json();
  expect(initial.effectiveTier).toBe("FREE");
  expect(initial.valueModel.lockedUntilUpgrade).toContain("EXAM_PATHWAY");
  expect(initial.subscription ?? null).toBeNull();

  // A single-product subscription (general-english) — no exam surfaces.
  const upgrade = await request.post("/api/subscription", { data: { action: "CHANGE_PLAN", tier: "general-english" } });
  expect(upgrade.status()).toBe(201);
  const upgraded = await upgrade.json();
  expect(upgraded.subscription.tier).toBe("general-english");
  expect(upgraded.effectiveTier).toBe("general-english");

  const after = await (await request.get("/api/subscription")).json();
  expect(after.valueModel.lockedUntilUpgrade).toContain("EXAM_PATHWAY");

  const examUpgrade = await request.post("/api/subscription", { data: { action: "CHANGE_PLAN", tier: "all-access" } });
  expect(examUpgrade.status()).toBe(201);
  const examAfter = await (await request.get("/api/subscription")).json();
  expect(examAfter.effectiveTier).toBe("all-access");
  expect(examAfter.valueModel.lockedUntilUpgrade).not.toContain("EXAM_PATHWAY");

  const cancel = await request.post("/api/subscription", { data: { action: "CANCEL" } });
  expect(cancel.ok()).toBeTruthy();
  const cancelled = await cancel.json();
  expect(cancelled.effectiveTier).toBe("FREE");
  expect(cancelled.subscription.cancelAtPeriodEnd).toBe(true);

  const resume = await request.post("/api/subscription", { data: { action: "RESUME" } });
  expect((await resume.json()).effectiveTier).toBe("all-access");

  const invalid = await request.post("/api/subscription", { data: { action: "CHANGE_PLAN", tier: "PLUS" } });
  expect(invalid.status()).toBe(400);

  const learning = await (await request.get("/api/learner-state")).json();
  expect(learning.state.currentLessonId).toBeTruthy();
});

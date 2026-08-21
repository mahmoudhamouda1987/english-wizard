import { test, expect } from "@playwright/test";

test("authenticated analytics reports capability outcomes and entitlements", async ({ request }) => {
  const email = `analytics-${Date.now()}@example.com`;
  const registered = await request.post("/api/auth/register", { data: { email, displayName: "Analytics Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();
  const evidence = await request.post("/api/evidence", { data: {
    sessionType: "STANDARD_JOURNEY",
    missionId: "m-1",
    objectiveId: "o-1",
    capabilityIds: ["cap-1"],
    modality: "WRITING",
    outcome: "CORRECT",
    score: 90,
    confidence: 0.9,
    level: "B1",
    context: "TRANSFER",
    errorTags: [],
  }});
  expect(evidence.status()).toBe(201);
  const analytics = await request.get("/api/analytics");
  expect(analytics.ok()).toBeTruthy();
  const payload = await analytics.json();
  expect(payload.snapshots).toHaveLength(1);
  expect(payload.snapshots[0].currentScore).toBe(90);
  expect(payload.entitlements.some((item: { feature: string; enabled: boolean }) => item.feature === "AI_TEACHER" && item.enabled)).toBe(true);
});

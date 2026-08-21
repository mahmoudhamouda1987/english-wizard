import { test, expect } from "@playwright/test";

async function register(request: import("@playwright/test").APIRequestContext, suffix: string) {
  const email = `privacy-${suffix}-${Date.now()}@example.com`;
  const response = await request.post("/api/auth/register", { data: { email, displayName: "Privacy Learner", password: "StrongPass123!" } });
  expect(response.ok()).toBeTruthy();
  await request.post("/api/learner-state");
  return { email };
}

test("privacy export includes learner evidence and entitlements", async ({ request }) => {
  await register(request, "export");
  const evidence = await request.post("/api/evidence", { data: {
    sessionType: "STANDARD_JOURNEY",
    missionId: "privacy-export",
    objectiveId: "objective-a1",
    capabilityIds: ["greetings.speaking"],
    modality: "SPEAKING",
    outcome: "CORRECT",
    score: 90,
    confidence: 0.9,
    level: "A1",
    context: "TRANSFER",
  }});
  expect(evidence.status()).toBe(201);
  const exported = await request.get("/api/privacy/export");
  expect(exported.ok()).toBeTruthy();
  const payload = await exported.json();
  expect(payload.evidenceRecords).toHaveLength(1);
  expect(Array.isArray(payload.entitlements)).toBe(true);
  expect(payload.privacyPreferences).toBeDefined();
});

test("account deletion requires explicit confirmation and removes learner access", async ({ request }) => {
  await register(request, "delete");
  const denied = await request.post("/api/privacy/delete", { data: { confirm: "DELETE" } });
  expect(denied.status()).toBe(400);
  const deleted = await request.post("/api/privacy/delete", { data: { confirm: "DELETE_MY_ACCOUNT" } });
  expect(deleted.ok()).toBeTruthy();
  expect((await deleted.json()).deleted).toBe(true);
  expect((await request.get("/api/learner-state")).status()).toBe(401);
});

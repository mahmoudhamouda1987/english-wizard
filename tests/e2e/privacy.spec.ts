import { test, expect } from "@playwright/test";

test("learner can export their persisted data", async ({ request }) => {
  const email = `privacy-export-${Date.now()}@example.com`;
  const registered = await request.post("/api/auth/register", { data: { email, displayName: "Privacy Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();
  await request.post("/api/learner-state");
  const exportResponse = await request.get("/api/privacy/export");
  expect(exportResponse.ok()).toBeTruthy();
  const payload = await exportResponse.json();
  expect(payload.learnerId).toBeTruthy();
  expect(payload.account.email).toBe(email);
  expect(payload.state).toBeTruthy();
});

test("learner can explicitly delete their account and loses authenticated access", async ({ request }) => {
  const email = `privacy-delete-${Date.now()}@example.com`;
  const registered = await request.post("/api/auth/register", { data: { email, displayName: "Delete Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();
  await request.post("/api/learner-state");
  const deleted = await request.post("/api/privacy/delete", { data: { confirm: "DELETE_MY_ACCOUNT" } });
  expect(deleted.ok()).toBeTruthy();
  expect((await request.get("/api/learner-state")).status()).toBe(401);
});

import { test, expect } from "@playwright/test";

test("admin governance endpoints are protected", async ({ request }) => {
  expect((await request.get("/api/admin/overview")).status()).toBe(401);
  expect((await request.get("/api/admin/review")).status()).toBe(401);
});

test("non-admin authenticated learners are forbidden from governance actions", async ({ page }) => {
  const email = `governance-${Date.now()}@example.com`;
  const registered = await page.request.post("/api/auth/register", { data: { email, displayName: "Governance Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();
  expect((await page.request.get("/api/admin/overview")).status()).toBe(403);

  const review = await page.request.post("/api/admin/review", { data: { entityId: "obj-a1-1", decision: "APPROVED" } });
  expect(review.status()).toBe(403);
});

test("review decisions require a valid decision value for admins", async ({ request }) => {
  const register = await request.post("/api/auth/register", { data: { email: `admin-${Date.now()}@example.com`, displayName: "Admin", password: "StrongPass123!" } });
  expect(register.ok()).toBeTruthy();
  const invalid = await request.post("/api/admin/review", { data: { entityId: "x", decision: "MAYBE" } });
  expect([403, 400]).toContain(invalid.status());
});

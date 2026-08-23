import { test, expect } from "@playwright/test";

async function register(page: import("@playwright/test").Page, prefix: string) {
  const email = `${prefix}-${Date.now()}@example.com`;
  const registered = await page.request.post("/api/auth/register", { data: { email, displayName: "Surface Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();
  return email;
}

test("Say It Better presents all five structured variants", async ({ page }) => {
  await register(page, "sib");
  await page.goto("/say-it-better");
  await expect(page.locator("main")).toBeVisible();
  for (const variant of ["Your version", "Correction", "Natural", "Advanced", "Professional"]) {
    await expect(page.getByText(variant, { exact: true })).toBeVisible();
  }
});

test("English Ear trains connected speech against the formal spelling", async ({ page }) => {
  await register(page, "ear");
  await page.goto("/english-ear");
  await expect(page.getByRole("heading", { name: /Hear what people actually say/ })).toBeVisible();
  await expect(page.getByText(/Written form:/)).toBeVisible();
  await page.getByRole("button", { name: /Hear spoken form/ }).click();
  await expect(page.getByText(/Listen attempts:/)).toContainText("1");
});

test("Reading engine progresses from word meaning to specialist text tasks", async ({ page }) => {
  await register(page, "read");
  await page.goto("/reading");
  await expect(page.locator("main")).toBeVisible();
  const body = await page.locator("main").innerText();
  expect(body).toMatch(/Read, understand/i);
  expect(body).toMatch(/Transfer/i);
});

test("Thinking in English exposes a level-based progression with prompts", async ({ page }) => {
  await register(page, "think");
  await page.goto("/thinking-in-english");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByRole("button", { name: "A1", exact: true }).first()).toBeVisible();
  await expect(page.getByText("you are here")).toBeVisible();
});

test("session planner supports every contract session type", async ({ request }) => {
  const email = `sessions-${Date.now()}@example.com`;
  const registered = await request.post("/api/auth/register", { data: { email, displayName: "Session Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();
  const cases: Array<{ type: string; level: string; missionId: string }> = [
    { type: "QUICK_QUEST", level: "A1", missionId: "mission-a1-meet" },
    { type: "STANDARD_JOURNEY", level: "B2", missionId: "mission-b2-professional" },
    { type: "DEEP_STUDY", level: "B2", missionId: "mission-b2-professional" },
    { type: "BOSS_MISSION", level: "B2", missionId: "mission-b2-professional" },
  ];
  for (const { type, level, missionId } of cases) {
    const response = await request.post("/api/session-plan", { data: { type, level, missionId } });
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.plan.type).toBe(type);
  }
  const gated = await request.post("/api/session-plan", { data: { type: "QUICK_QUEST", level: "B2", missionId: "mission-b2-professional" } });
  expect(gated.status()).toBe(400);
});

test("every curriculum lesson explains why the learner is learning it", async ({ page }) => {
  await register(page, "why");
  await page.goto("/learn");
  await expect(page.getByTestId("learning-rationale")).toBeVisible();
  const rationale = await page.getByTestId("learning-rationale").innerText();
  expect(rationale).toMatch(/Why you are learning this/i);
  expect(rationale).toMatch(/Real-world value/i);
});

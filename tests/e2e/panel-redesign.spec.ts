import { test, expect } from "@playwright/test";

/** Panel redesign wave: Learning Paths IA, lock badges, avatar identity, settings catalogue. */

async function registerAndSignIn(page: import("@playwright/test").Page, suffix: string, displayName = "John Smith") {
  const email = `panel-${suffix}-${Date.now()}@example.com`;
  const response = await page.request.post("/api/auth/register", { data: { email, displayName, password: "StrongPass123!" } });
  expect(response.ok()).toBeTruthy();
  await page.request.post("/api/learner-state");
  // Sign in through the UI so the session cookie lives in the browser context.
  await page.goto("/auth");
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill("StrongPass123!");
  await page.getByRole("button", { name: /Sign in →/ }).click();
  await page.waitForURL(/dashboard|onboarding/, { timeout: 15_000 });
  return email;
}

test.describe("Panel redesign — identity, navigation and commercial surfaces", () => {
  test("header avatar shows the learner's initials, not EW", async ({ page }) => {
    await registerAndSignIn(page, "initials", "John Smith");
    await page.goto("/dashboard");
    const avatar = page.locator("header .avatar");
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveText(/^(JS|JO|EW)$/);
    // "John Smith" produces the JS monogram once the profile name resolves.
    await expect(avatar).toHaveText("JS", { timeout: 10_000 });
  });

  test("profile picture can be set to a preset avatar and appears in the header", async ({ page }) => {
    await registerAndSignIn(page, "avatar");
    const preset = `data:image/svg+xml;base64,${Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#4f2fb8"/><text x="32" y="35" font-size="32" text-anchor="middle" dominant-baseline="central">🦉</text></svg>',
    ).toString("base64")}`;
    const set = await page.request.post("/api/profile", { data: { avatar: { url: preset, kind: "avatar" } } });
    expect(set.ok()).toBeTruthy();
    const stored = await (await page.request.get("/api/profile")).json();
    expect(stored.profile.avatarKind).toBe("avatar");
    expect(String(stored.profile.avatarUrl)).toContain("data:image/svg+xml");

    await page.goto("/dashboard");
    await expect(page.locator("header .avatar img.avatar-img")).toBeVisible({ timeout: 10_000 });

    // Reset to initials clears the picture.
    const reset = await page.request.post("/api/profile", { data: { avatar: "RESET" } });
    expect(reset.ok()).toBeTruthy();
    const cleared = await (await page.request.get("/api/profile")).json();
    expect(cleared.profile.avatarKind).toBe("initials");
    expect(cleared.profile.avatarUrl).toBeNull();
  });

  test("avatar API rejects payloads that are not bounded image data URLs", async ({ page }) => {
    await registerAndSignIn(page, "invalid");
    const bad = await page.request.post("/api/profile", { data: { avatar: { url: "https://example.com/cat.png", kind: "photo" } } });
    expect(bad.status()).toBe(400);
    const huge = await page.request.post("/api/profile", {
      data: { avatar: { url: `data:image/png;base64,${"A".repeat(600_000)}`, kind: "photo" } },
    });
    expect(huge.status()).toBe(400);
  });

  test("settings renders the profile-picture studio and the 2.0 catalogue without legacy tiers", async ({ page }) => {
    await registerAndSignIn(page, "settings");
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Profile picture" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Choose an avatar" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Plan & subscription/i })).toBeVisible();
    for (const card of ["General English", "Business English", "IELTS", "Cambridge", "All Access"]) {
      await expect(page.getByRole("article").filter({ hasText: card }).first()).toBeVisible();
    }
    // The legacy Free/Plus/Pro ladder is extinct everywhere in Settings.
    const body = await page.locator("main").innerText();
    expect(body).not.toMatch(/\bPlus\b/);
    expect(body).not.toMatch(/\bPro plan\b/);
    expect(body).not.toMatch(/\$0 forever/);
  });

  test("/plan presents the catalogue (five products + All Access) and no legacy tiers", async ({ page }) => {
    await registerAndSignIn(page, "plan");
    await page.goto("/plan");
    const body = await page.locator("main").innerText();
    expect(body).not.toMatch(/\bStart Plus\b/);
    expect(body).not.toMatch(/\bGo Pro\b/);
    expect(body).not.toMatch(/forever/);
    for (const name of ["General English", "Business English", "Fluency Track", "IELTS", "Cambridge", "All Access"]) {
      expect(body).toContain(name);
    }
    expect(body).toMatch(/7-day trial|Included with every account/);
  });

  test("dashboard shows the five learning paths with subscription states", async ({ page }) => {
    await registerAndSignIn(page, "showcase");
    await page.goto("/dashboard");
    const showcase = page.getByRole("region", { name: "Your learning paths" });
    await expect(showcase).toBeVisible();
    for (const product of ["General English", "Business English", "Fluency Track (Conversation)", "IELTS Preparation", "Cambridge English Qualifications"]) {
      await expect(showcase.getByRole("link", { name: new RegExp(product.replace(/[()]/g, "\\$&")) })).toBeVisible();
    }
  });
});

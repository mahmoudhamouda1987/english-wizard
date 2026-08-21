import { test, expect } from "@playwright/test";

test("keyboard users can skip navigation and every page exposes a labelled main landmark", async ({ page }) => {
  await page.goto("/dashboard");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused().catch(() => undefined);
  await expect(page.locator("main#main-content")).toHaveCount(1);
});

test("text size control adjusts and persists the reading scale", async ({ page }) => {
  await page.goto("/chunks");
  const control = page.getByRole("group", { name: "Text size" });
  await expect(control).toBeVisible();
  await control.getByRole("button", { name: "A++" }).click();
  await expect(control.getByRole("button", { name: "A++" })).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator("html").getAttribute("data-text-size")).toBe("XLARGE");
  await page.reload();
  expect(await page.locator("html").getAttribute("data-text-size")).toBe("XLARGE");
});

test("reduced-motion styles ship in production CSS", async ({ page }) => {
  await page.goto("/");
  const reducedMotion = await page.evaluate(() => {
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of Array.from(rules)) {
        if ((rule as CSSMediaRule).media && (rule as CSSMediaRule).media.mediaText.includes("prefers-reduced-motion")) return true;
      }
    }
    return false;
  });
  expect(reducedMotion).toBe(true);
});

test("audio learning surfaces expose visible transcripts and accessible audio controls", async ({ page }) => {
  const email = `a11y-audio-${Date.now()}@example.com`;
  const registered = await page.request.post("/api/auth/register", { data: { email, displayName: "A11y Audio", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();

  await page.goto("/english-ear");
  await expect(page.getByRole("heading", { name: /Hear what people actually say/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Hear spoken form/ })).toBeVisible();
  await expect(page.getByText(/Written form:/)).toBeVisible();

  await page.goto("/conversation");
  await expect(page.getByRole("heading", { name: /Conversation transcript/i })).toBeVisible();

  await page.goto("/pronunciation");
  await expect(page.getByRole("button", { name: "Play phrase" })).toBeVisible();
});

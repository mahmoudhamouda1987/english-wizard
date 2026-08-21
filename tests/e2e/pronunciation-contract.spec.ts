import { test, expect } from "@playwright/test";

test("pronunciation route exposes privacy-safe local recording controls", async ({ page }) => {
  await page.goto("/pronunciation");
  await expect(page.getByRole("heading", { name: "Listen. Repeat. Measure the signals." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play phrase" })).toBeVisible();
  await expect(page.getByText("Record local self-check")).toBeVisible();
  await expect(page.getByText(/does not claim phoneme-level pronunciation accuracy/)).toBeVisible();
});

import { test, expect } from "@playwright/test";

test("pronunciation route exposes privacy-safe local recording controls", async ({ page }) => {
  await page.goto("/pronunciation");
  await expect(page.getByRole("heading", { name: "Speaking Coach" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Hear British model/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Record my attempt/ })).toBeVisible();
  await expect(page.getByText(/does not claim phoneme-level pronunciation accuracy/)).toBeVisible();
});

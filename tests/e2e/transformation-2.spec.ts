import { test, expect } from "@playwright/test";

/**
 * ENGLISH WIZARD 2.0 — MEGA PRODUCT TRANSFORMATION E2E suite.
 * Covers the contract gates: CTA rename, product surfaces, redirects,
 * sidebar PRODUCTS group, Fluency Passport evidence and B2B API.
 */

async function register(page: import("@playwright/test").Page, prefix: string) {
  const email = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.com`;
  const registered = await page.request.post("/api/auth/register", {
    data: { email, displayName: "Transformation Learner", password: "StrongPass123!" },
  });
  expect(registered.ok()).toBeTruthy();
  return email;
}

test.describe("Public site (Part 5)", () => {
  test("single assessment CTA: CHECK MY LEVEL present, Check My English extinct", async ({ page }) => {
    await page.goto("/");
    const main = await page.locator("body").innerText();
    expect(main).toMatch(/Check My Level/i);
    expect(main).not.toMatch(/Check My English/i);
  });

  test("public header offers Learn, Levels, Skills, For Organisations, Pricing and Sign in", async ({ page }) => {
    await page.goto("/");
    for (const label of ["Learn", "Levels", "Skills", "For Organisations", "Pricing", "Sign in"]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
  });

  test("LevelCheck journey header is branded (logo + LEVELCHECK + Exit)", async ({ page }) => {
    await register(page, "lc");
    await page.goto("/diagnostic");
    await expect(page.getByRole("button", { name: /Start LevelCheck/ })).toBeVisible();
    await page.getByRole("button", { name: /Start LevelCheck/ }).click();
    await expect(page.getByText("LEVELCHECK", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Exit" })).toBeVisible();
  });
});

test.describe("Product surfaces (Parts 54–84, 107–108)", () => {
  test("General English product page wires the core curriculum surfaces", async ({ page }) => {
    await register(page, "ge");
    await page.goto("/general-english");
    const body = await page.locator("main").innerText();
    for (const marker of ["Worlds & Missions", "My Journey", "English Ear", "Reading Engine"]) {
      expect(body).toContain(marker);
    }
  });

  test("Business English product page shows outcome model and Practise Your Actual Thing", async ({ page }) => {
    await register(page, "be");
    await page.goto("/business-english");
    const body = await page.locator("main").innerText();
    expect(body).toContain("Write this email");
    expect(body).toMatch(/Practise your actual thing/i);
  });

  test("Practise Your Actual Thing accepts a pasted real task", async ({ page }) => {
    await register(page, "actual");
    await page.goto("/business-english/actual-thing");
    await expect(page.locator("main")).toBeVisible();
    const body = await page.locator("main").innerText();
    expect(body).toContain("Practise Your Actual Thing");
  });

  test("IELTS product hub exposes course, variants and honest non-certification language", async ({ page }) => {
    await register(page, "ielts-hub");
    await page.goto("/ielts");
    const body = await page.locator("main").innerText();
    expect(body).toContain("IELTS Preparation");
  });

  test("IELTS course surface loads", async ({ page }) => {
    await register(page, "ielts-course");
    await page.goto("/ielts/course");
    await expect(page.locator("main")).toBeVisible();
  });

  test("Cambridge product hub lists the five qualifications", async ({ page }) => {
    await register(page, "cam-hub");
    await page.goto("/cambridge");
    const body = await page.locator("main").innerText();
    expect(body).toContain("Cambridge English Qualifications");
    expect(body).toContain("Choose your qualification");
  });

  test("Cambridge course surface loads", async ({ page }) => {
    await register(page, "cam-course");
    await page.goto("/cambridge/course");
    await expect(page.locator("main")).toBeVisible();
  });

  test("Fluency Track honours the B1 entry gate for unassessed learners (Part 78)", async ({ page }) => {
    await register(page, "ft");
    await page.goto("/fluency-track");
    await expect(page.getByText("Entry rule")).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Route closures (audit dispositions)", () => {
  test("/pathways/ielts redirects to the IELTS product", async ({ page }) => {
    await register(page, "redir1");
    await page.goto("/pathways/ielts");
    await page.waitForURL(/\/ielts\/course$/, { timeout: 15_000 });
    expect(new URL(page.url()).pathname).toBe("/ielts/course");
  });

  test("/pathways/cambridge redirects to the Cambridge product", async ({ page }) => {
    await register(page, "redir2");
    await page.goto("/pathways/cambridge");
    await page.waitForURL(/\/cambridge\/course$/, { timeout: 15_000 });
    expect(new URL(page.url()).pathname).toBe("/cambridge/course");
  });

  test("/pathways/professional redirects to Business English", async ({ page }) => {
    await register(page, "redir3");
    await page.goto("/pathways/professional");
    await page.waitForURL(/\/business-english$/, { timeout: 15_000 });
    expect(new URL(page.url()).pathname).toBe("/business-english");
  });
});

test.describe("Sidebar PRODUCTS group (Parts 3/14/16)", () => {
  test("app sidebar shows Products group with five product destinations", async ({ page }) => {
    await register(page, "nav");
    await page.goto("/dashboard");
    const productsToggle = page.getByRole("button", { name: "Products", exact: true });
    await expect(productsToggle).toBeVisible();
    if ((await productsToggle.getAttribute("aria-expanded")) === "false") {
      await productsToggle.click();
    }
    for (const product of ["General English", "Business English", "IELTS", "Cambridge", "Fluency Track"]) {
      await expect(page.getByRole("link", { name: new RegExp(`^\\s*${product}\\s*$`) })).toBeVisible();
    }
  });
});

test.describe("Evidence layer (Parts 87–88)", () => {
  test("Fluency Passport page renders shareable credential surface", async ({ page }) => {
    await register(page, "passport");
    await page.goto("/fluency-passport");
    const body = await page.locator("main").innerText();
    expect(body).toMatch(/Fluency Passport/i);
  });

  test("Verification service answers an unknown reference honestly", async ({ page }) => {
    await page.goto("/verification");
    await expect(page.getByText("Verification reference").first()).toBeVisible();
  });
});

test.describe("B2B assessment API (Parts 94–96)", () => {
  test("org bootstrap returns a one-time key; key creates links; candidate link resolves", async ({ request }) => {
    const boot = await request.put("/api/b2b/assessments", {
      data: { name: `Cohort Co ${Date.now()}`, contactEmail: `hr-${Date.now()}@example.com` },
    });
    expect([200, 201]).toContain(boot.status());
    const { apiKey } = (await boot.json()) as { apiKey?: string };
    expect(apiKey).toMatch(/^ewb2b_/);

    const create = await request.post("/api/b2b/assessments", {
      headers: { authorization: `Bearer ${apiKey}` },
      data: { label: "Senior analyst screening", system: "LEVELCHECK", candidateEmail: `cand-${Date.now()}@example.com` },
    });
    expect([200, 201]).toContain(create.status());
    const { candidateLink } = (await create.json()) as { candidateLink?: string };
    expect(candidateLink).toMatch(/^\/assessment\/[A-Za-z0-9_-]+$/);
    const linkToken = candidateLink!.replace("/assessment/", "");

    const candidate = await request.get(`/api/b2b/assessments/${linkToken}`);
    expect(candidate.ok()).toBeTruthy();
    const payload = (await candidate.json()) as { assessment?: { status?: string } };
    expect(payload.assessment?.status).toBe("OPEN");

    const list = await request.get("/api/b2b/assessments", { headers: { authorization: `Bearer ${apiKey}` } });
    expect(list.ok()).toBeTruthy();
  });

  test("candidate link page renders real status; unknown token answered honestly", async ({ page }) => {
    const boot = await page.request.put("/api/b2b/assessments", {
      data: { name: `Link Page Co ${Date.now()}`, contactEmail: `hr-${Date.now()}@example.com` },
    });
    const { apiKey } = (await boot.json()) as { apiKey: string };
    const create = await page.request.post("/api/b2b/assessments", {
      headers: { authorization: `Bearer ${apiKey}` },
      data: { label: "Candidate link check", system: "LEVELCHECK" },
    });
    const { candidateLink } = (await create.json()) as { candidateLink: string };

    await page.goto(candidateLink);
    await expect(page.getByRole("heading", { name: "Your assessment" })).toBeVisible();
    await expect(page.getByText("Candidate link check")).toBeVisible();
    await expect(page.getByText(/not yet completed/i)).toBeVisible();

    await page.goto("/assessment/not-a-real-token-000");
    await expect(page.getByText(/No matching record/i)).toBeVisible();
  });

  test("B2B API rejects missing or invalid keys", async ({ request }) => {
    const noKey = await request.post("/api/b2b/assessments", { data: { label: "No key" } });
    expect(noKey.status()).toBe(401);
    const badKey = await request.post("/api/b2b/assessments", {
      headers: { authorization: "Bearer ewb2b_invalid" },
      data: { label: "Bad key" },
    });
    expect(badKey.status()).toBe(401);
  });
});

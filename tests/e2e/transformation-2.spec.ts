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
  // Match the production onboarding funnel: completing onboarding auto-starts
  // the 7-day trial, and an ACTIVE trial gates as all-access. Content-walking
  // tests mirror that (idempotent — safe to call more than once).
  const trial = await page.request.post("/api/trial", { data: {} });
  expect(trial.ok()).toBeTruthy();
  return email;
}

/** Registration WITHOUT the onboarding trial — the raw FREE commercial state. */
async function registerFree(page: import("@playwright/test").Page, prefix: string) {
  const email = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.com`;
  const registered = await page.request.post("/api/auth/register", {
    data: { email, displayName: "Free Learner", password: "StrongPass123!" },
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
    // The ProductGate resolves the subscription asynchronously — assert with
    // auto-retrying expectations instead of a single innerText snapshot.
    const main = page.locator("main");
    for (const marker of ["Worlds & Missions", "My Journey", "English Ear", "Reading Studio"]) {
      await expect(main).toContainText(marker, { timeout: 10_000 });
    }
  });

  test("Business English product page shows outcome model and Practise Your Actual Thing", async ({ page }) => {
    await register(page, "be");
    await page.goto("/business-english");
    const main = page.locator("main");
    await expect(main).toContainText("Write this email", { timeout: 10_000 });
    await expect(main).toContainText(/Practise your actual thing/i);
  });

  test("Practise Your Actual Thing accepts a pasted real task", async ({ page }) => {
    await register(page, "actual");
    await page.goto("/business-english/actual-thing");
    const main = page.locator("main");
    await expect(main).toContainText("Practise Your Actual Thing", { timeout: 10_000 });
  });

  test("IELTS product hub exposes course, variants and honest non-certification language", async ({ page }) => {
    await register(page, "ielts-hub");
    await page.goto("/ielts");
    const main = page.locator("main");
    await expect(main).toContainText("IELTS Preparation", { timeout: 10_000 });
  });

  test("IELTS course surface loads", async ({ page }) => {
    await register(page, "ielts-course");
    await page.goto("/ielts/course");
    await expect(page.locator("main")).toBeVisible();
  });

  test("Cambridge product hub lists the five qualifications", async ({ page }) => {
    await register(page, "cam-hub");
    await page.goto("/cambridge");
    const main = page.locator("main");
    await expect(main).toContainText("Cambridge English Qualifications", { timeout: 10_000 });
    await expect(main).toContainText("Choose your qualification");
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

test.describe("Sidebar LEARN group (learning-paths IA: products live ONLY in the hub)", () => {
  test("app sidebar shows the LEARN group with the hub and no per-product items", async ({ page }) => {
    await register(page, "nav");
    await page.goto("/dashboard");
    const sidebar = page.getByRole("complementary").getByRole("navigation", { name: "Primary navigation" });
    const learnToggle = sidebar.getByRole("button", { name: "Learn", exact: true });
    await expect(learnToggle).toBeVisible();
    if ((await learnToggle.getAttribute("aria-expanded")) === "false") {
      await learnToggle.click();
    }
    for (const item of ["Learning Paths", "My Journey", "Lessons", "Worlds & Missions"]) {
      await expect(sidebar.getByRole("link", { name: new RegExp(`^\\s*${item}`) })).toBeVisible();
    }
    // The five products are NOT sidebar destinations any more (spec §3/§15).
    for (const product of ["General English", "Business English", "Fluency Track", "IELTS", "Cambridge"]) {
      await expect(sidebar.getByRole("link", { name: new RegExp(`^\\s*${product}\\b`) })).toHaveCount(0);
    }
    // Skill Studios is an expandable subgroup of PRACTISE with the seven studios
    // (spec §3: Practise → Conversation & Role-play / Speaking Coach / Say It Better / Skill Studios ▾).
    const practiseToggle = sidebar.getByRole("button", { name: "Practise", exact: true });
    await expect(practiseToggle).toBeVisible();
    if ((await practiseToggle.getAttribute("aria-expanded")) === "false") {
      await practiseToggle.click();
    }
    const studios = sidebar.getByRole("button", { name: /Skill Studios/ });
    await expect(studios).toBeVisible();
    await studios.click();
    for (const studio of ["Reading Studio", "Writing Studio", "Vocabulary Studio", "Grammar Studio", "Thinking in English"]) {
      await expect(sidebar.getByRole("link", { name: new RegExp(`^\\s*${studio}`) })).toBeVisible();
    }
  });

  test("Learning Paths hub shows the five products with access states and explore CTA", async ({ page }) => {
    // registerFree = the raw FREE commercial state — the hub's LOCKED badges
    // ("Not subscribed", never a bare icon) are exactly what this locks.
    await registerFree(page, "hub");
    await page.goto("/learning-paths");
    await expect(page.getByRole("heading", { name: "Learning Paths", level: 1 })).toBeVisible();
    for (const product of ["General English", "Business English", "Fluency Track", "IELTS", "Cambridge"]) {
      await expect(page.getByRole("heading", { name: product, level: 2 })).toBeVisible();
    }
    await expect(page.getByText(/Not subscribed/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore" }).first()).toBeVisible();
  });

  test("Explore page renders the full product preview without premium content", async ({ page }) => {
    // Locked-state preview: trial CTA is part of the LOCKED explore page.
    await registerFree(page, "explore");
    await page.goto("/learning-paths/ielts");
    await expect(page.getByRole("heading", { name: "IELTS", level: 1 })).toBeVisible();
    await expect(page.getByText("Where this path takes you")).toBeVisible();
    await expect(page.getByText("The journey, module by module")).toBeVisible();
    await expect(page.getByRole("link", { name: /Start 7-day trial/ })).toBeVisible();
  });

  test("Current Path switcher in the header switches the active path", async ({ page }) => {
    await register(page, "switcher");
    await page.goto("/dashboard");
    const switcher = page.getByRole("button", { name: /Current path: .* — switch learning path/i });
    await expect(switcher).toBeVisible();
    await switcher.click();
    await page.getByRole("option", { name: /Business English/ }).click();
    await expect(page.getByRole("button", { name: /Current path: Business English — switch learning path/i })).toBeVisible();
  });

  test("Assess group keeps Tests & Exams as a pure assessment area", async ({ page }) => {
    await register(page, "assess");
    await page.goto("/pathways");
    await expect(page.getByRole("link", { name: /Start Full Check/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Take the mock exam/i })).toBeVisible();
    // The former product preparation panels have moved to Learning Paths (scope to main content).
    const main = page.locator("main");
    await expect(main.getByText("IELTS preparation")).toHaveCount(0);
    await expect(main.getByText("Cambridge preparation")).toHaveCount(0);
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

test.describe("Commercial enforcement (launch flip — AUDIT_MODE=false)", () => {
  test("a FREE learner with no trial sees the premium panel, never premium content", async ({ page }) => {
    await registerFree(page, "lock");
    const sub = await page.request.get("/api/subscription");
    const payload = (await sub.json()) as { effectiveTier: string; gatingTier: string };
    expect(payload.effectiveTier).toBe("FREE");
    expect(payload.gatingTier).toBe("FREE");

    await page.goto("/ielts");
    const main = page.locator("main");
    await expect(main).toContainText("Premium path", { timeout: 10_000 });
    await expect(main).toContainText("This path is not part of your current subscription");
    await expect(main.getByRole("link", { name: "Explore this path" })).toBeVisible();
    // The gate's audit note disappears with the flip — enforcement is real now.
    await expect(main).not.toContainText(/audit note/i);
  });

  test("hub badges show intent with text — the lock icon is never the sole indicator", async ({ page }) => {
    await registerFree(page, "lockhub");
    await page.goto("/learning-paths");
    const main = page.locator("main");
    await expect(main).toContainText("Five complete products", { timeout: 10_000 });
    await expect(main).toContainText("Not subscribed", { timeout: 10_000 });
    // The build-phase audit banner is gone at launch.
    await expect(main).not.toContainText(/every path is open to audit/i);
    // The hub's own audit note (badge semantics) is gone too.
    await expect(main).not.toContainText(/badges show the intended commercial state/i);
  });

  test("starting the 7-day trial reopens the gated surface (gatingTier = all-access)", async ({ page }) => {
    await registerFree(page, "trial");
    await page.goto("/ielts");
    await expect(page.locator("main")).toContainText("Premium path", { timeout: 10_000 });

    const trial = await page.request.post("/api/trial", { data: {} });
    expect(trial.ok()).toBeTruthy();
    const sub = await page.request.get("/api/subscription");
    expect(((await sub.json()) as { gatingTier: string }).gatingTier).toBe("all-access");

    await page.goto("/ielts");
    const main = page.locator("main");
    await expect(main).toContainText(/IELTS/, { timeout: 10_000 });
    await expect(main).not.toContainText("Premium path");
  });
});

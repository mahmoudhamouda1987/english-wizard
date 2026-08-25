import { test, expect } from "@playwright/test";

test("IELTS pathway is selectable, distinct from general mastery, and never claims certification", async ({ request }) => {
  const email = `pathways-${Date.now()}@example.com`;
  const registered = await request.post("/api/auth/register", { data: { email, displayName: "Pathway Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();

  const catalog = await request.get("/api/pathways");
  expect(catalog.ok()).toBeTruthy();
  const payload = await catalog.json();
  expect(payload.catalog.ielts.exam).toBe("IELTS");
  expect(payload.catalog.ielts.variants).toEqual(expect.arrayContaining(["ACADEMIC", "GENERAL"]));
  expect(payload.catalog.ielts.bands).toContain(7);
  expect(payload.catalog.cambridge.exam).toBe("CAMBRIDGE");
  expect(payload.catalog.cambridge.qualifications).toContain("B2_FIRST");
  expect(payload.catalog.professional.domains.length).toBeGreaterThanOrEqual(56);
  expect(payload.catalog.ielts.certificationClaim).toBe(false);
  expect(payload.disclaimer).toMatch(/never|not official/i);

  const selected = await request.post("/api/pathways", { data: { pathway: "IELTS", ieltsVariant: "GENERAL", bandTarget: "7", target: "7.0" } });
  expect(selected.status()).toBe(201);
  const selection = (await selected.json()).selection;
  expect(selection.pathway).toBe("IELTS");

  const reread = await (await request.get("/api/pathways")).json();
  expect(reread.selected.pathway).toBe("IELTS");

  const invalid = await request.post("/api/pathways", { data: { pathway: "TOEFL" } });
  expect(invalid.status()).toBe(400);
});

test("IELTS catalog exposes variant and band options", async ({ request }) => {
  const email = `ielts-catalog-${Date.now()}@example.com`;
  await request.post("/api/auth/register", { data: { email, displayName: "IELTS Catalog", password: "StrongPass123!" } });
  const res = await request.get("/api/pathways");
  const payload = await res.json();
  expect(payload.catalog.ielts.variants.length).toBe(2);
  expect(payload.catalog.ielts.bands.length).toBe(11);
  expect(payload.catalog.ielts.variants).toEqual(expect.arrayContaining(["ACADEMIC", "GENERAL"]));
});

test("Cambridge pathway exposes all five qualifications", async ({ request }) => {
  const email = `cambridge-catalog-${Date.now()}@example.com`;
  await request.post("/api/auth/register", { data: { email, displayName: "Cambridge Catalog", password: "StrongPass123!" } });
  const res = await request.get("/api/pathways");
  const payload = await res.json();
  expect(payload.catalog.cambridge.qualifications).toEqual(["A2_KEY", "B1_PRELIMINARY", "B2_FIRST", "C1_ADVANCED", "C2_PROFICIENCY"]);
});

test("professional pathway returns 56 domains with tracks", async ({ request }) => {
  const email = `pro-catalog-${Date.now()}@example.com`;
  await request.post("/api/auth/register", { data: { email, displayName: "Pro Catalog", password: "StrongPass123!" } });
  const res = await request.get("/api/pathways");
  const payload = await res.json();
  const domains = payload.catalog.professional.domains;
  expect(domains.length).toBeGreaterThanOrEqual(56);
  for (const domain of domains) {
    expect(domain.id).toBeTruthy();
    expect(domain.label).toBeTruthy();
    expect(domain.tracks.length).toBeGreaterThanOrEqual(2);
  }
});

test("professional pathway selection by domain and track persists", async ({ request }) => {
  const email = `pro-select-${Date.now()}@example.com`;
  await request.post("/api/auth/register", { data: { email, displayName: "Pro Select", password: "StrongPass123!" } });
  const post = await request.post("/api/pathways", { data: { pathway: "PROFESSIONAL", domain: "sales", track: "objections" } });
  expect(post.status()).toBe(201);
  const reread = await (await request.get("/api/pathways")).json();
  expect(reread.selected.pathway).toBe("PROFESSIONAL");
  expect(reread.selected.domain).toBe("sales");
  expect(reread.selected.track).toBe("objections");
});

test("professional pathway readiness requires transfer evidence", async ({ request }) => {
  const email = `pro-pathway-${Date.now()}@example.com`;
  await request.post("/api/auth/register", { data: { email, displayName: "Pro Learner", password: "StrongPass123!" } });

  const before = await (await request.get("/api/pathways")).json();
  const business = before.catalog.professional.domains.find((item: { id: string }) => item.id === "general-business");
  expect(business).toBeDefined();

  await request.post("/api/evidence", { data: {
    sessionType: "STANDARD_JOURNEY",
    missionId: "business-communication",
    objectiveId: "business-communication",
    capabilityIds: ["business-communication"],
    modality: "SPEAKING",
    outcome: "CORRECT",
    score: 90,
    confidence: 0.9,
    level: "B1",
    context: "TRANSFER",
  }});
});

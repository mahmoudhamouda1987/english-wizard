import { test, expect } from "@playwright/test";

test("IELTS pathway is selectable, distinct from general mastery, and never claims certification", async ({ request }) => {
  const email = `pathways-${Date.now()}@example.com`;
  const registered = await request.post("/api/auth/register", { data: { email, displayName: "Pathway Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();

  const catalog = await request.get("/api/pathways");
  expect(catalog.ok()).toBeTruthy();
  const payload = await catalog.json();
  expect(payload.catalog.ielts.exam).toBe("IELTS");
  expect(payload.catalog.cambridge.exam).toBe("CAMBRIDGE");
  expect(payload.catalog.professional.length).toBeGreaterThan(3);
  expect(payload.catalog.ielts.certificationClaim).toBe(false);
  expect(payload.disclaimer).toMatch(/never|not official/i);

  const selected = await request.post("/api/pathways", { data: { pathway: "IELTS", target: "7.0" } });
  expect(selected.status()).toBe(201);
  const selection = (await selected.json()).selection;
  expect(selection.pathway).toBe("IELTS");
  expect(selection.target).toBe("7.0");

  const reread = await (await request.get("/api/pathways")).json();
  expect(reread.selected.pathway).toBe("IELTS");
  expect(reread.selected.target).toBe("7.0");

  const invalid = await request.post("/api/pathways", { data: { pathway: "TOEFL" } });
  expect(invalid.status()).toBe(400);
});

test("professional pathway readiness requires transfer evidence", async ({ request }) => {
  const email = `pro-pathway-${Date.now()}@example.com`;
  await request.post("/api/auth/register", { data: { email, displayName: "Pro Learner", password: "StrongPass123!" } });

  const before = await (await request.get("/api/pathways")).json();
  const business = before.catalog.professional.find((item: { domain: string }) => item.domain === "BUSINESS");
  expect(business.readiness.ready).toBe(false);

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

  const after = await (await request.get("/api/pathways")).json();
  const updated = after.catalog.professional.find((item: { domain: string }) => item.domain === "BUSINESS");
  expect(updated.readiness.ready).toBe(true);
});

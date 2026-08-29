import { test, expect } from "@playwright/test";

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test.describe("IELTS exam API", () => {
  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/register", { data: { email: uniqueEmail("ielts"), displayName: "IELTS E2E", password: "StrongPass123!" } });
  });

  test("GET /api/exams/ielts returns a plan with modules for all four skills", async ({ request }) => {
    const res = await request.get("/api/exams/ielts?variant=ACADEMIC&band=6.5");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.plan.variant).toBe("ACADEMIC");
    expect(data.plan.modules.length).toBeGreaterThanOrEqual(3);
    const skills = data.plan.modules.map((m: { skill: string }) => m.skill);
    expect(skills).toContain("listening");
    expect(skills).toContain("reading");
    expect(skills).toContain("writing");
    expect(skills).toContain("speaking");
  });

  test("POST /api/exams/ielts returns grading and band estimate", async ({ request }) => {
    const res = await request.post("/api/exams/ielts", {
      data: { variant: "GENERAL", band: "6", skill: "reading", answers: {} },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.overallBand).toBeGreaterThanOrEqual(0);
    expect(data.overallBand).toBeLessThanOrEqual(9);
    expect(data.bandEstimate).toBeGreaterThanOrEqual(0);
    expect(data.gap).toBeDefined();
  });
});

test.describe("Cambridge exam API", () => {
  test.beforeEach(async ({ request }) => {
    await request.post("/api/auth/register", { data: { email: uniqueEmail("camb"), displayName: "Cambridge E2E", password: "StrongPass123!" } });
  });

  test("GET /api/exams/cambridge returns assessment with items", async ({ request }) => {
    const res = await request.get("/api/exams/cambridge?qualification=B2_FIRST&kind=readiness-assessment");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.assessment.qualification.id).toBe("B2_FIRST");
    expect(data.assessment.objectiveItems.length).toBeGreaterThanOrEqual(5);
  });

  test("POST /api/exams/cambridge grades answers and returns scale estimate", async ({ request }) => {
    const res = await request.post("/api/exams/cambridge", {
      data: { qualification: "C1_ADVANCED", kind: "readiness-assessment", answers: {} },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.scaleEstimate).toBeGreaterThanOrEqual(142);
    expect(data.readiness).toBeDefined();
    expect(typeof data.readiness.verdict).toBe("string");
  });
});

test.describe("Content QA API", () => {
  test("GET /api/admin/content-qa requires auth", async ({ request }) => {
    const res = await request.get("/api/admin/content-qa");
    expect(res.status()).toBe(401);
  });
});

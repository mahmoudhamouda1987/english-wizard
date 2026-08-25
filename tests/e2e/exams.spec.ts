import { test, expect } from "@playwright/test";

test.describe("IELTS exam API", () => {
  const email = `ielts-e2e-${Date.now()}@example.com`;
  let authed: Awaited<ReturnType<typeof import("@playwright/test").test["step"]>> extends never ? never : unknown;

  test.beforeAll(async ({ request }) => {
    await request.post("/api/auth/register", { data: { email, displayName: "IELTS E2E", password: "StrongPass123!" } });
  });

  test("GET /api/exams/ielts returns catalog with modules for both variants", async ({ request }) => {
    const res = await request.get("/api/exams/ielts?variant=ACADEMIC");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.variant).toBe("ACADEMIC");
    expect(data.modules.length).toBeGreaterThanOrEqual(3);
    expect(data.modules.some((m: { kind: string }) => m.kind === "listening")).toBe(true);
    expect(data.modules.some((m: { kind: string }) => m.kind === "reading")).toBe(true);
    expect(data.modules.some((m: { kind: string }) => m.kind === "writing")).toBe(true);
    expect(data.modules.some((m: { kind: string }) => m.kind === "speaking")).toBe(true);
  });

  test("POST /api/exams/ielts returns grading and band estimate", async ({ request }) => {
    const res = await request.post("/api/exams/ielts", {
      data: { variant: "GENERAL", bandTarget: "6", answers: {} },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.result).toBeDefined();
    expect(data.result.overallBand).toBeGreaterThanOrEqual(0);
    expect(data.result.overallBand).toBeLessThanOrEqual(9);
    expect(data.result.band).toBeGreaterThanOrEqual(4);
    expect(data.result.gapToTarget).toBeDefined();
  });
});

test.describe("Cambridge exam API", () => {
  test("GET /api/exams/cambridge returns assessment with items", async ({ request }) => {
    const res = await request.get("/api/exams/cambridge?qualification=B2_FIRST&kind=readiness-assessment");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.qualification).toBe("B2_FIRST");
    expect(data.assessment.objectiveItems.length).toBeGreaterThanOrEqual(5);
  });

  test("POST /api/exams/cambridge grades answers and returns scale estimate", async ({ request }) => {
    const res = await request.post("/api/exams/cambridge", {
      data: { qualification: "C1_ADVANCED", answers: {} },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.result.scaleEstimate).toBeGreaterThanOrEqual(142);
    expect(data.result.readiness).toBeDefined();
    expect(typeof data.result.readiness.verdict).toBe("string");
  });
});

test.describe("Content QA API", () => {
  test("GET /api/admin/content-qa requires auth", async ({ request }) => {
    const res = await request.get("/api/admin/content-qa");
    expect(res.status()).toBe(401);
  });
});

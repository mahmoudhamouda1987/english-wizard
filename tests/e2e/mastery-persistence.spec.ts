import { test, expect, type APIRequestContext } from "@playwright/test";

async function register(request: APIRequestContext) {
  const email = `mastery-${Date.now()}@example.com`;
  const response = await request.post("/api/auth/register", { data: { email, displayName: "Mastery Learner", password: "StrongPass123!" } });
  expect(response.ok()).toBeTruthy();
  await request.post("/api/learner-state");
}

test("learner state persists capability mastery graph state", async ({ request }) => {
  await register(request);
  const first = await request.get("/api/learner-state");
  expect(first.ok()).toBeTruthy();
  const firstPayload = await first.json();
  expect(Array.isArray(firstPayload.state.masteryGraph)).toBe(true);
  expect(firstPayload.state.masteryGraph.length).toBeGreaterThan(0);

  const evidence = await request.post("/api/evidence", {
    data: {
      sessionType: "STANDARD_JOURNEY",
      missionId: "mastery-round-trip",
      objectiveId: "a1-present-simple-routines",
      capabilityIds: ["grammar.present-simple-routines"],
      modality: "GRAMMAR",
      outcome: "CORRECT",
      score: 90,
      confidence: 0.8,
      level: "A1",
      context: "UNFAMILIAR",
      errorTags: [],
    },
  });
  expect(evidence.ok()).toBeTruthy();
  expect((await evidence.json()).masteryUpdated).toBe(true);

  const second = await request.get("/api/learner-state");
  expect(second.ok()).toBeTruthy();
  const secondPayload = await second.json();
  expect(Array.isArray(secondPayload.state.masteryGraph)).toBe(true);
  expect(secondPayload.state.masteryGraph.length).toBe(firstPayload.state.masteryGraph.length);
  const mastery = secondPayload.state.masteryGraph.find((item: { capabilityId: string }) => item.capabilityId === "grammar.present-simple-routines");
  expect(mastery.evidenceCount).toBe(1);
  expect(mastery.score).toBe(72);
  expect(mastery.state).toBe("EXPOSED");
});

import { test, expect, type APIRequestContext } from "@playwright/test";

async function register(request: APIRequestContext, suffix: string) {
  const email = `e2e-${suffix}-${Date.now()}@example.com`;
  const response = await request.post("/api/auth/register", { data: { email, displayName: "E2E Learner", password: "StrongPass123!" } });
  expect(response.ok()).toBeTruthy();
  const state = await request.post("/api/learner-state");
  expect(state.ok()).toBeTruthy();
  return { email, password: "StrongPass123!" };
}

async function answerDiagnostic(request: APIRequestContext) {
  const questionsResponse = await request.get("/api/diagnostic");
  expect(questionsResponse.ok()).toBeTruthy();
  const questions = await questionsResponse.json();
  const answers = questions.questions.map((question: { id: string; options: string[] }, index: number) => ({ id: question.id, answer: question.options[index % question.options.length] }));
  return request.post("/api/diagnostic", { data: { answers, production: { writingSample: "I work in an office and I enjoy learning English every day. I want to speak clearly at work and with friends.", speakingTranscript: "My name is Alex. I work in an office and I enjoy learning English because it helps me communicate with more people." } } });
}

test("onboarding creates a persisted learner and dashboard loads state", async ({ page }) => {
  await register(page.request, "dashboard");
  await page.goto("/onboarding");
  // The premium onboarding opens with a 5-screen welcome carousel; advance through
  // every screen to reach the setup form (Part 35).
  await expect(page.getByRole("button", { name: /→/ })).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.getByRole("button", { name: /→/ }).click();
  }
  await page.getByLabel("Your name").fill("E2E Learner");
  await page.getByRole("button", { name: /Improve work English/ }).click();
  await page.getByRole("button", { name: /Start the assessment/ }).click();
  await expect(page).toHaveURL(/\/diagnostic/);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)|Your learning journey/ })).toBeVisible();
  await expect(page.getByText(/Your English journey continues at/i)).toBeVisible();
  await expect(page.getByText(/next best step|Start by checking your English/i)).toBeVisible();
});

test("diagnostic produces English DNA, adaptive evidence, and assessed-level placement", async ({ request }) => {
  await register(request, "diagnostic");
  const questionsResponse = await request.get("/api/diagnostic");
  expect(questionsResponse.ok()).toBeTruthy();
  const initial = await questionsResponse.json();
  expect(initial.adaptive.nextQuestionId).toBeTruthy();
  const diagnostic = await answerDiagnostic(request);
  expect(diagnostic.ok()).toBeTruthy();
  const result = await diagnostic.json();
  expect(result.result.level).toMatch(/Pre-A1|A1|A2|B1|B2|C1|C2/);
  expect(result.result.production.writingScore).toBeGreaterThan(0);
  expect(result.result.production.speakingScore).toBeGreaterThan(0);
  expect(result.adaptive.evidence.length).toBeGreaterThan(0);
  expect(result.adaptive.questionsRemaining).toBeGreaterThanOrEqual(0);
  const profile = await request.get("/api/profile");
  expect(profile.ok()).toBeTruthy();
  const persisted = await profile.json();
  expect(persisted.profile.englishDna.overallLevel).toBe(result.result.level);
  expect(persisted.profile.englishDna.productionEvidence.writingScore).toBe(result.result.production.writingScore);
  expect(persisted.profile.englishDna.diagnosticEvidence.length).toBeGreaterThan(0);
});

test("curriculum API exposes all CEFR levels", async ({ request }) => {
  const response = await request.get("/api/curriculum");
  expect(response.ok()).toBeTruthy();
  const { lessons } = await response.json();
  expect(new Set(lessons.map((lesson: { level: string }) => lesson.level))).toEqual(new Set(["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]));
  expect(lessons.length).toBeGreaterThanOrEqual(28);
});

test("conversation API provides a one-minute five-gap exercise for every level", async ({ request }) => {
  for (const level of ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]) {
    const response = await request.get(`/api/conversation?level=${encodeURIComponent(level)}`);
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.exercise.durationSeconds).toBe(60);
    expect(payload.exercise.speakers).toHaveLength(2);
    expect(payload.exercise.gaps).toHaveLength(5);
    expect(payload.wordOfDay.level).toBe(level);
  }
});

test("conversation page renders listening controls, transcript, Word of the Day, and five gaps", async ({ page }) => {
  await register(page.request, "conversation");
  await page.goto("/conversation?level=B1");
  await expect(page.getByRole("heading", { name: /Conversation/ }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Play conversation/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /conversation transcript/i })).toBeVisible();
  await expect(page.getByText(/Here is the same script with \d+ words removed/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Missing word 1" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Missing word 5" })).toBeVisible();
});

test("new learning surfaces render from the authenticated dashboard", async ({ page }) => {
  await register(page.request, "surfaces");
  for (const path of ["/worlds", "/reading", "/english-ear", "/say-it-better"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
  }
  await page.goto("/dashboard");
  // Expand the LEARN group in the desktop sidebar, then the skill links are present.
  const sidebar = page.getByRole("complementary").getByRole("navigation", { name: "Primary navigation" });
  await sidebar.getByRole("button", { name: "Learn" }).click();
  await sidebar.getByRole("button", { name: "Skills" }).click();
  await sidebar.getByRole("button", { name: "Practise" }).click();
  await expect(sidebar.getByRole("link", { name: /Worlds & Missions/i })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "English Ear" })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Reading Engine" })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Say It Better" })).toBeVisible();
});

test("privacy preferences and voice consent persist per learner", async ({ request }) => {
  await register(request, "privacy");
  const saved = await request.post("/api/privacy", { data: { preferences: { analytics: true, personalizedAi: true, voiceProcessing: true, voiceRetentionDays: 30, shareForHumanReview: false }, purpose: "speaking_feedback", consented: true, providerDisclosure: "Configured speech/AI provider processing for speaking feedback." } });
  expect(saved.ok()).toBeTruthy();
  const loaded = await request.get("/api/privacy");
  expect(loaded.ok()).toBeTruthy();
  const payload = await loaded.json();
  expect(payload.preferences.voice_processing).toBe(true);
  expect(payload.preferences.voice_retention_days).toBe(30);
  expect(payload.consents.some((item: { purpose: string; consented: boolean }) => item.purpose === "speaking_feedback" && item.consented)).toBe(true);
});

test("completing a real production attempt persists mastery and advances to the next expanded lesson", async ({ request }) => {
  await register(request, "progress");
  const created = await (await request.get("/api/learner-state")).json();
  const firstLesson = created.state.currentLessonId as string;
  const completion = await request.post("/api/lesson/complete", { data: { lessonId: firstLesson, evidenceIds: ["e2e-production-evidence"], performanceScore: 82 } });
  expect(completion.ok()).toBeTruthy();
  const result = await completion.json();
  expect(result.state.completedLessonIds).toContain(firstLesson);
  expect(result.state.currentLessonId).not.toBe(firstLesson);
  expect(result.state.nextAction.id).toBe(result.state.currentLessonId);
  expect(result.state.mastery.length).toBeGreaterThan(0);
  const history = result.state.lessonHistory.find((item: { lessonId: string }) => item.lessonId === firstLesson);
  expect(history.status).toBe("completed");
  expect(history.evidenceIds).toContain("e2e-production-evidence");
  const persisted = await request.get("/api/learner-state");
  expect(persisted.ok()).toBeTruthy();
  expect((await persisted.json()).state.currentLessonId).toBe(result.state.currentLessonId);
  const duplicate = await request.post("/api/lesson/complete", { data: { lessonId: firstLesson, evidenceIds: ["duplicate"] } });
  expect(duplicate.status()).toBe(409);
});

test("failed practice creates a persisted spaced-review card and review submission reschedules it", async ({ request }) => {
  await register(request, "review");
  const failed = await request.post("/api/practice/submit", { data: { skill: "grammar", objectiveId: "a1-present-simple-routines", correct: false, prompt: "Complete: I ___ in an office.", answer: "I works" } });
  expect(failed.ok()).toBeTruthy();
  const review = await request.get("/api/review");
  expect(review.ok()).toBeTruthy();
  const cards = await review.json();
  expect(cards.cards.length).toBeGreaterThan(0);
  const card = cards.cards[0];
  const reviewed = await request.post("/api/review", { data: { cardId: card.id, quality: 4 } });
  expect(reviewed.ok()).toBeTruthy();
  const outcome = await reviewed.json();
  expect(outcome.intervalDays).toBeGreaterThanOrEqual(1);
});

test("session logout and re-login restore the same learner state", async ({ request }) => {
  const credentials = await register(request, "relogin");
  const stateBefore = await request.get("/api/learner-state");
  const before = await stateBefore.json();
  expect(before.state.learnerId).toBeTruthy();
  const logout = await request.post("/api/auth/logout");
  expect(logout.ok()).toBeTruthy();
  const unauthorized = await request.get("/api/learner-state");
  expect(unauthorized.status()).toBe(401);
  const login = await request.post("/api/auth/login", { data: { email: credentials.email, password: credentials.password } });
  expect(login.ok()).toBeTruthy();
  const stateAfter = await request.get("/api/learner-state");
  expect(stateAfter.ok()).toBeTruthy();
  const after = await stateAfter.json();
  expect(after.state.learnerId).toBe(before.state.learnerId);
  expect(after.state.currentLessonId).toBe(before.state.currentLessonId);
});

test("a second user receives a separate learner state", async ({ request, browser }) => {
  await register(request, "isolation-a");
  const first = await (await request.get("/api/learner-state")).json();
  const secondContext = await browser.newContext();
  const secondRequest = secondContext.request;
  await register(secondRequest, "isolation-b");
  const second = await (await secondRequest.get("/api/learner-state")).json();
  expect(second.state.learnerId).not.toBe(first.state.learnerId);
  await secondContext.close();
});

test("cross-modal evidence persists and summarizes independently of lesson completion", async ({ request }) => {
  await register(request, "evidence");
  const created = await request.post("/api/evidence", { data: {
    sessionType: "STANDARD_JOURNEY",
    missionId: "mission-a1-1",
    objectiveId: "objective-a1-1",
    capabilityIds: ["greetings.speaking"],
    modality: "SPEAKING",
    outcome: "CORRECT",
    score: 88,
    confidence: 0.85,
    level: "A1",
    context: "TRANSFER",
    errorTags: ["grammar", "grammar"],
  }});
  expect(created.status()).toBe(201);
  const listed = await request.get("/api/evidence");
  expect(listed.ok()).toBeTruthy();
  const payload = await listed.json();
  expect(payload.evidence).toHaveLength(1);
  expect(payload.evidence[0].modality).toBe("SPEAKING");
  expect(payload.evidence[0].errorTags).toEqual(["grammar"]);
  expect(payload.summary.transferCount).toBe(1);
  expect(payload.summary.correctRate).toBe(1);
});

test("interest signals persist and produce a ranked learner interest profile", async ({ request }) => {
  await register(request, "interests");
  const first = await request.post("/api/interests", { data: { topic: "technology", weight: 8, source: "EXPLICIT_PREFERENCE" } });
  expect(first.status()).toBe(201);
  const second = await request.post("/api/interests", { data: { topic: "travel", weight: 4, source: "CHOICE" } });
  expect(second.status()).toBe(201);
  const loaded = await request.get("/api/interests");
  expect(loaded.ok()).toBeTruthy();
  const payload = await loaded.json();
  expect(payload.signals).toHaveLength(2);
  expect(payload.profile.preferred[0].topic).toBe("technology");
});

test("session planner persists valid session modes and rejects invalid level-mode combinations", async ({ request }) => {
  await register(request, "sessions");
  const quick = await request.post("/api/session-plan", { data: { type: "QUICK_QUEST", level: "A1", missionId: "mission-a1-1" } });
  expect(quick.status()).toBe(201);
  const boss = await request.post("/api/session-plan", { data: { type: "BOSS_MISSION", level: "A1", missionId: "mission-a1-boss" } });
  expect(boss.status()).toBe(400);
  const loaded = await request.get("/api/session-plan");
  expect(loaded.ok()).toBeTruthy();
  expect((await loaded.json()).plans).toHaveLength(1);
});

test("protected AI endpoints reject unauthenticated access", async ({ request }) => {
  expect((await request.post("/api/ai/lesson", { data: { goal: "grammar" } })).status()).toBe(401);
  expect((await request.post("/api/ai/writing", { data: { prompt: "Write something", answer: "Some answer" } })).status()).toBe(401);
  expect((await request.post("/api/ai/speaking", { data: { prompt: "Speak", transcript: "Hello" } })).status()).toBe(401);
});

test("health endpoint is reachable in the running application", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  expect((await response.json()).status).toBe("ok");
});

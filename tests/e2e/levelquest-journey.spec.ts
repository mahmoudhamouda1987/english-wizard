import { test, expect, request as pwRequest, type APIRequestContext } from "@playwright/test";

/**
 * LevelQuest end-to-end journey (Part 38): adaptive sitting → answers →
 * answer-change recalculation → finalize → report → official PDF → public
 * verification → personalized starting anchor → Student ID uniqueness.
 */

async function register(request: APIRequestContext, tag: string) {
  const email = `lq-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
  const res = await request.post("/api/auth/register", {
    data: { email, displayName: `LQ Learner ${tag}`, password: "StrongPass123!" },
  });
  expect(res.ok()).toBeTruthy();
  return email;
}

/** A learner with its OWN cookie jar, so multiple learners never share a session. */
async function newLearner(tag: string) {
  const ctx = await pwRequest.newContext({ baseURL: "http://127.0.0.1:3000" });
  await register(ctx, tag);
  return ctx;
}

test("adaptive sitting progresses, recalculates on change, finalizes and produces a verifiable report", async ({ request }) => {
  await register(request, "journey");

  // 1. Session creation: adaptive first item, budget meta present.
  const start = await (await request.get("/api/levelquest")).json();
  expect(start.sessionId).toBeTruthy();
  expect(start.variant).toBeGreaterThanOrEqual(1);
  expect(start.variantTheme).toBeTruthy();
  expect(start.remainingSeconds).toBeLessThanOrEqual(30 * 60);
  expect(start.progress).toBeTruthy();
  expect(start.paper.length).toBeGreaterThanOrEqual(1);
  expect(start.paper[0].answer).toBeUndefined(); // answers never leak

  const answerItem = async (itemId: string, option: string) =>
    (await request.post("/api/levelquest", {
      data: { sessionId: start.sessionId, itemId, answer: option },
    })).json();

  // 2. Answer several items adaptively: the sequence must grow (appended items).
  //    Speaking tasks interleave roughly every 6 objective items — answer them
  //    too, and track exactly how many speaking responses are submitted.
  let state = start;
  const answered: string[] = [];
  let speakingAnswered = 0;
  for (let i = 0; i < 9; i++) {
    const item = state.paper[answered.length];
    if (!item) break;
    const result = await answerItem(item.id, item.options[0] ?? "spoken response");
    expect(result.ok).toBe(true);
    answered.push(item.id);
    if (item.type === "speaking") speakingAnswered += 1;
    expect(result.estimate).toBeGreaterThanOrEqual(0);
    expect(result.estimate).toBeLessThanOrEqual(6);
    if (result.appended) {
      const ids = state.paper.map((x: { id: string }) => x.id);
      expect(ids).not.toContain(result.appended.id); // genuinely new item
      state = { ...state, paper: [...state.paper, result.appended] };
    }
    expect(result.progress.presented).toBeGreaterThan(i); // sequence grows
  }
  expect(answered.length).toBe(9);

  // 3. Changing an answer recalculates instead of corrupting (Part 10).
  const changeRes = await request.post("/api/levelquest", {
    data: { sessionId: start.sessionId, itemId: answered[0], answer: "changed-answer" },
  });
  expect(changeRes.ok()).toBeTruthy();
  const changed = await changeRes.json();
  expect(changed.changed).toBe(true);
  expect(typeof changed.estimate).toBe("number");

  // 4. Flag persistence.
  const flagRes = await request.post("/api/levelquest", {
    data: { sessionId: start.sessionId, flag: [answered[1]] },
  });
  expect(flagRes.ok()).toBeTruthy();

  // 5. Resume (GET) preserves answered state and flags.
  const resumed = await (await request.get("/api/levelquest")).json();
  expect(resumed.sessionId).toBe(start.sessionId);
  expect(Object.keys(resumed.answered).length).toBeGreaterThanOrEqual(9);
  expect(resumed.flags).toContain(answered[1]);

  // 6. Finalize → full result payload (Parts 14/16).
  const finRes = await request.post("/api/levelquest", { data: { sessionId: start.sessionId, finalize: true } });
  expect(finRes.ok()).toBeTruthy();
  const { result } = await finRes.json();
  expect(result.level).toBeTruthy();
  expect(["High", "Moderate"].includes(result.confidence)).toBe(true);
  expect(result.assessmentId).toBeTruthy();
  expect(result.variant).toBeGreaterThanOrEqual(1);
  expect(result.skillProfile).toBeTruthy();
  // The fixed counter counts ONLY speaking items (was inflated to all answers).
  expect(result.speakingResponses).toBe(speakingAnswered);
  expect(result.answeredCount).toBeGreaterThanOrEqual(9);
  expect(typeof result.studentName).toBe("string");

  // 7. Official PDF report.
  const pdf = await request.get("/api/levelquest/report");
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");

  // 8. Public verification page confirms the assessment is genuine.
  const verify = await request.get(`/api/levelquest/verify?r=${result.assessmentId}`);
  expect(verify.status()).toBe(200);
  const verifyHtml = await verify.text();
  expect(verifyHtml).toContain("genuine");

  // 9. The HTML report page reflects the placement.
  const reportPage = await request.get("/report");
  expect(reportPage.status()).toBe(200);
  expect(await reportPage.text()).toContain(result.level);
});

test("repeat sittings rotate the variant (Part 4)", async ({ request }) => {
  await register(request, "variants");
  const first = await (await request.get("/api/levelquest")).json();
  await request.post("/api/levelquest", { data: { sessionId: first.sessionId, finalize: true } });
  const second = await (await request.get("/api/levelquest")).json();
  expect(second.sessionId).not.toBe(first.sessionId);
  expect(second.variant).not.toBe(first.variant); // different paper next sitting
});

test("student IDs are unique across learners (Part 25)", async () => {
  const ctxA = await newLearner("id-a");
  const ctxB = await newLearner("id-b");
  const profileBody = { displayName: "A", dailyMinutes: 20, nativeLanguage: "Arabic", targetLevel: "B1", goals: ["Speak confidently"] };
  const pa = await (await ctxA.post("/api/profile", { data: profileBody })).json();
  const pb = await (await ctxB.post("/api/profile", { data: { ...profileBody, displayName: "B" } })).json();
  expect(pa.studentId).toMatch(/^EW-\d{2}-[A-Z2-9]{6}$/); // EW-26-7F4K82-style, no placeholder zeros
  expect(pb.studentId).toMatch(/^EW-\d{2}-[A-Z2-9]{6}$/);
  expect(pa.studentId).not.toBe(pb.studentId);
  expect(pa.studentId).not.toContain("0000"); // never a placeholder constant
  await ctxA.dispose();
  await ctxB.dispose();
});

test("placement personalizes the curriculum starting anchor (Part 24)", async ({ request }) => {
  await register(request, "anchor");
  const start = await (await request.get("/api/levelquest")).json();
  // Answer everything presented (up to budget) correctly to push the estimate up.
  let paper = start.paper as Array<{ id: string; options: string[] }>;
  for (let round = 0; round < 40; round++) {
    const item = paper[round];
    if (!item) break;
    const res = await request.post("/api/levelquest", { data: { sessionId: start.sessionId, itemId: item.id, answer: item.options?.[0] ?? "a" } });
    const body = await res.json();
    if (body.appended) paper = [...paper, body.appended];
  }
  const fin = await request.post("/api/levelquest", { data: { sessionId: start.sessionId, finalize: true } });
  expect(fin.ok()).toBeTruthy();

  const state = await (await request.get("/api/learner-state")).json();
  expect(state.state.currentLessonId).toBeTruthy();
  // The anchor must be a real curriculum lesson id.
  expect(state.state.currentLessonId).toMatch(/^lesson-\d{2}-/);
});

test("exam pathways enforce premium server-side (Parts 13/19)", async ({ request }) => {
  await register(request, "gate");
  // Fresh learner without trial: IELTS selection must be 402 with an upgrade payload.
  const res = await request.post("/api/pathways", { data: { pathway: "IELTS" } });
  expect(res.status()).toBe(402);
  const body = await res.json();
  expect(body.upgrade.feature).toBe("EXAM_PATHWAY");
  // Free pathway remains selectable.
  const free = await request.post("/api/pathways", { data: { pathway: "GENERAL_ENGLISH" } });
  expect(free.ok()).toBeTruthy();
});

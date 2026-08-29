import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import {
  paperForVariant,
  variantForLearner,
  updateEstimate,
  levelToEstimate,
  selectNextAdaptiveItem,
  selectNextSpeakingItem,
  placementVerdict,
  recomputeEstimate,
  firstLessonIdForLevel,
  SESSION_BUDGET,
  LEVELQUEST_BANK,
  CEFR_ORDER,
  VARIANT_THEMES,
  type LevelQuestItem,
  type SkillKey,
} from "@/src/domain/levelquest";
import { evaluateSpeakingTranscript, overallSpeakingBand, type SpeakingEvaluation } from "@/src/domain/speaking-evaluation";
import { getLearnerState, saveLearnerState } from "@/src/infrastructure/learner-repository";
import { ALL_LESSONS } from "@/src/domain/all-lessons";

export const dynamic = "force-dynamic";

const TOTAL_SECONDS = 30 * 60;

interface Graded { correct: boolean; expected?: string; explanation?: string; given: string }
/**
 * SessionState v2 — sequence-based genuinely adaptive sitting.
 * v2 fields: version, sequence (presentation order), startEstimate,
 * lastSpeakingLevelIndex, finalized readiness is derived on demand.
 * v1 sessions (no version field) keep legacy linear behaviour for resume.
 */
interface SessionState {
  sessionId: string;
  version?: 2;
  variant: number;
  startedAt: string;
  deadlineAt: string;
  status: "IN_PROGRESS" | "COMPLETE";
  sequence: string[];            // v2: presentation order (item ids)
  asked: string[];               // graded answers in first-submission order (compat)
  answers: Record<string, Graded>;
  flag: string[];
  estimate: number;
  startEstimate?: number;
  lastSpeakingLevelIndex?: number | null;
  skillCorrect: Record<string, number>;
  skillTotal: Record<string, number>;
}

const bankForVariant = (variant: number): LevelQuestItem[] => LEVELQUEST_BANK.filter((i) => i.variant === variant);
const itemById = (variant: number, id: string): LevelQuestItem | undefined =>
  bankForVariant(variant).find((i) => i.id === id);

/** Strip answers/explanations before exposing an item to the client. */
function expose(item: LevelQuestItem) {
  return {
    id: item.id, cefr: item.cefr, difficulty: item.difficulty, skill: item.skill,
    subskill: item.subskill, type: item.type, prompt: item.prompt, options: item.options,
    estimatedTime: item.estimatedTime,
    ...(item.theme ? { theme: item.theme } : {}),
    ...(item.type === "listening" && item.audioText ? { audioText: item.audioText } : {}),
  };
}

/** Progress snapshot for the client (Part 9/11: visible progress + estimated completion). */
function progressFor(state: SessionState) {
  const items = state.sequence.map((id) => itemById(state.variant, id)).filter((i): i is LevelQuestItem => i !== undefined);
  const objectivePresented = items.filter((i) => i.type !== "speaking").length;
  const speakingPresented = items.filter((i) => i.type === "speaking").length;
  const objectiveAnswered = items.filter((i) => i.type !== "speaking" && state.answers[i.id]).length;
  const speakingAnswered = items.filter((i) => i.type === "speaking" && (state.answers[i.id]?.given ?? "").length > 0).length;
  const target = SESSION_BUDGET.objective + SESSION_BUDGET.speaking;
  const { ready, reason } = readyToFinalize(state, items);
  return {
    presented: state.sequence.length,
    target,
    objectivePresented,
    objectiveAnswered,
    speakingPresented,
    speakingAnswered,
    readyToFinalize: ready,
    readyReason: reason,
  };
}

/** Adaptive early-stop / completion logic (Part 6: stop when the boundary is located). */
function readyToFinalize(state: SessionState, items: LevelQuestItem[]): { ready: boolean; reason: string | null } {
  const objective = items.filter((i) => i.type !== "speaking");
  const answeredObjective = objective.filter((i) => state.answers[i.id]);
  if (objective.length >= SESSION_BUDGET.objective && state.sequence.length >= SESSION_BUDGET.objective) {
    return { ready: true, reason: "Full objective battery presented." };
  }
  const skills: SkillKey[] = ["grammar", "vocabulary", "reading", "listening"];
  const perSkillOk = skills.every((s) => (state.skillTotal[s] ?? 0) >= SESSION_BUDGET.minPerSkillForEarlyStop);
  const enough = answeredObjective.length >= SESSION_BUDGET.minObjectiveForEarlyStop;
  if (enough && perSkillOk && state.sequence.length >= SESSION_BUDGET.minObjectiveForEarlyStop) {
    // Enough evidence: the pool near the estimate is being exhausted.
    const unaskedNear = bankForVariant(state.variant).filter(
      (i) => i.type !== "speaking" && !state.sequence.includes(i.id) && Math.abs(CEFR_ORDER.indexOf(i.cefr) + i.difficulty / 10 - state.estimate) <= 1,
    );
    if (unaskedNear.length < 3) return { ready: true, reason: "Sufficient evidence gathered — your level boundary is located." };
  }
  return { ready: false, reason: null };
}

/** Append the next adaptive item to the presentation sequence (v2). */
function appendNextItem(state: SessionState): LevelQuestItem | null {
  const items = state.sequence.map((id) => itemById(state.variant, id)).filter((i): i is LevelQuestItem => i !== undefined);
  const objectivePresented = items.filter((i) => i.type !== "speaking").length;
  const speakingPresented = items.filter((i) => i.type === "speaking").length;

  // Interleave speaking roughly every 6 objective items so production evidence
  // is spread across the sitting instead of piled at the end.
  const dueSpeaking =
    speakingPresented < SESSION_BUDGET.speaking &&
    (objectivePresented >= SESSION_BUDGET.objective || objectivePresented >= (speakingPresented + 1) * 6);

  let next: LevelQuestItem | null = null;
  if (dueSpeaking) {
    next = selectNextSpeakingItem(state.variant, state.sequence, state.estimate, state.lastSpeakingLevelIndex ?? null);
    if (next) state.lastSpeakingLevelIndex = CEFR_ORDER.indexOf(next.cefr);
  } else if (objectivePresented < SESSION_BUDGET.objective) {
    next = selectNextAdaptiveItem(state.variant, {
      askedIds: state.sequence,
      estimate: state.estimate,
      skillTotal: state.skillTotal,
      lastItemId: state.sequence[state.sequence.length - 1] ?? null,
    });
  }
  if (next) state.sequence.push(next.id);
  return next;
}

/** GET — assign variant, resume or create a session, return the presented sequence. */
export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const resume = await query(
      `SELECT id, payload FROM levelquest_sessions WHERE learner_id = $1 AND status = 'IN_PROGRESS' ORDER BY started_at DESC LIMIT 1`,
      [session.learnerId],
    );
    let state: SessionState | null = null;
    if (resume.rowCount && resume.rows[0]) {
      state = resume.rows[0].payload as SessionState;
      state.sessionId = resume.rows[0].id;
    }

    const known = await query(`SELECT english_dna FROM learner_profiles WHERE learner_id = $1::uuid`, [session.learnerId]);
    const knownLevel = (known.rows[0]?.english_dna as { overallLevel?: string } | undefined)?.overallLevel;
    const startEstimate = levelToEstimate(knownLevel);

    let variant: number;
    if (state) {
      variant = state.variant;
    } else {
      variant = await pickVariedVariant(session.learnerId);
    }

    if (!state) {
      const sessionId = crypto.randomUUID();
      const startedAt = new Date();
      const deadlineAt = new Date(startedAt.getTime() + TOTAL_SECONDS * 1000).toISOString();
      state = {
        sessionId, version: 2, variant, startedAt: startedAt.toISOString(), deadlineAt,
        status: "IN_PROGRESS", sequence: [], asked: [], answers: {}, flag: [],
        estimate: startEstimate, startEstimate, lastSpeakingLevelIndex: null,
        skillCorrect: {}, skillTotal: {},
      };
      // First item: adaptive selection from the learner's baseline.
      appendNextItem(state);
      await query(
        `INSERT INTO levelquest_sessions (id, learner_id, variant, status, payload, started_at) VALUES ($1, $2::uuid, $3, 'IN_PROGRESS', $4, now())`,
        [sessionId, session.learnerId, variant, JSON.stringify(state)],
      );
    } else if (state.version !== 2) {
      // Legacy v1 session: synthesize a v2 sequence from the legacy paper so the
      // learner resumes exactly where they left off, without corruption.
      const paper = paperForVariant(variant);
      const presented = new Set(state.asked);
      state.version = 2;
      state.sequence = paper.filter((i) => presented.has(i.id)).map((i) => i.id)
        .concat(paper.filter((i) => !presented.has(i.id)).map((i) => i.id));
      state.startEstimate = state.startEstimate ?? startEstimate;
      state.lastSpeakingLevelIndex = state.lastSpeakingLevelIndex ?? null;
      await query(`UPDATE levelquest_sessions SET payload = $2 WHERE id = $1`, [state.sessionId, JSON.stringify(state)]);
    }

    const exposed = state.sequence
      .map((id) => itemById(variant, id))
      .filter((i): i is LevelQuestItem => Boolean(i))
      .map(expose);

    const remaining = serverRemaining(state);
    let returnedState = state;
    if (remaining <= 0 && state.status === "IN_PROGRESS") {
      returnedState = { ...state, status: "COMPLETE" };
      await query(`UPDATE levelquest_sessions SET status = 'COMPLETE', payload = $2, completed_at = now() WHERE id = $1`, [state.sessionId, JSON.stringify(returnedState)]);
    }

    return NextResponse.json({
      paper: exposed,
      sessionId: returnedState.sessionId,
      variant: returnedState.variant,
      answered: Object.fromEntries(Object.entries(returnedState.answers).map(([k, v]) => [k, v.correct])),
      flags: returnedState.flag,
      estimate: returnedState.estimate,
      startEstimate: returnedState.startEstimate ?? startEstimate,
      progress: progressFor(returnedState),
      variantTheme: VARIANT_THEMES[(returnedState.variant - 1) % VARIANT_THEMES.length],
      remainingSeconds: Math.max(0, remaining),
      ...(knownLevel ? { startLevel: knownLevel } : {}),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to start LevelQuest." }, { status: 500 });
  }
}

/** Choose a variant different from the learner's most recent completed attempt. */
async function pickVariedVariant(learnerId: string): Promise<number> {
  const recent = await query(
    `SELECT variant FROM levelquest_sessions WHERE learner_id = $1 AND status = 'COMPLETE' ORDER BY completed_at DESC NULLS LAST, started_at DESC LIMIT 1`,
    [learnerId],
  );
  const last = recent.rowCount && recent.rows[0] ? recent.rows[0].variant as number : null;
  const base = variantForLearner(learnerId);
  if (last === null) return base;
  return ((base - 1 + 7) % 15) + 1;
}

function serverRemaining(state: SessionState): number {
  if (!state.deadlineAt) return TOTAL_SECONDS;
  return Math.ceil((new Date(state.deadlineAt).getTime() - Date.now()) / 1000);
}

/** POST — grade an answer (changes recalculate), append the next adaptive item, or finalize. */
export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as
    | { sessionId?: string; itemId?: string; answer?: string; flag?: string[]; finalize?: boolean; more?: boolean }
    | null;
  if (!body?.sessionId) return NextResponse.json({ error: "sessionId required." }, { status: 400 });

  try {
    const saved = await query(
      `SELECT id, payload FROM levelquest_sessions WHERE id = $1 AND learner_id = $2::uuid`,
      [body.sessionId, session.learnerId],
    );
    if (!saved.rowCount || !saved.rows[0]) return NextResponse.json({ error: "Session not found." }, { status: 404 });
    const state = saved.rows[0].payload as SessionState;
    state.sessionId = saved.rows[0].id;

    // Server-authoritative 30-minute deadline: once elapsed, no more answers —
    // the session is finalized with the evidence gathered (never lose answers).
    if (serverRemaining(state) <= 0 && state.status === "IN_PROGRESS" && !body.flag) {
      return finalize(session.learnerId, state);
    }

    if (body.flag) {
      state.flag = body.flag;
      await query(`UPDATE levelquest_sessions SET payload = $2 WHERE id = $1`, [state.sessionId, JSON.stringify(state)]);
      return NextResponse.json({ ok: true });
    }

    if (body.finalize) return finalize(session.learnerId, state);

    // "more" — the learner reached the end of the presented sequence without
    // answering (skipped ahead); append the next adaptive item.
    if (body.more && !body.itemId) {
      if (state.version !== 2) return NextResponse.json({ ok: true, ended: true });
      const appended = appendNextItem(state);
      await query(`UPDATE levelquest_sessions SET payload = $2 WHERE id = $1`, [state.sessionId, JSON.stringify(state)]);
      return NextResponse.json({
        ok: true,
        appended: appended ? expose(appended) : null,
        ended: !appended,
        progress: progressFor(state),
      });
    }

    const item = itemById(state.variant, body.itemId ?? "");
    if (!item) return NextResponse.json({ error: "Item not found." }, { status: 404 });

    const given = (body.answer ?? "").trim();
    const changing = state.answers[item.id] !== undefined;

    // Grade. Speaking cannot be right/wrong — it records the production transcript.
    const graded: Graded = item.type === "speaking"
      ? { correct: false, expected: item.answer, explanation: item.explanation, given }
      : { correct: given.toLowerCase() === item.answer.toLowerCase(), expected: item.answer, explanation: item.explanation, given };

    state.answers[item.id] = graded;
    if (!state.asked.includes(item.id)) state.asked.push(item.id);

    // Rebuild tallies and estimate from all evidence — changes recalculate
    // instead of silently corrupting the result (Part 10).
    rebuildTallies(state);
    if (item.type !== "speaking") {
      if (state.version === 2) {
        const orderedObjective = state.sequence
          .map((id) => itemById(state.variant, id))
          .filter((i): i is LevelQuestItem => i !== undefined && i.type !== "speaking");
        state.estimate = recomputeEstimate(orderedObjective, state.answers, state.startEstimate ?? 0);
      } else {
        state.estimate = updateEstimate(state.estimate, graded.correct, gi(item), state.asked.length);
      }
    }

    // Append the next adaptive item (v2 sitting).
    let appended: LevelQuestItem | null = null;
    if (state.version === 2) appended = appendNextItem(state);

    await query(`UPDATE levelquest_sessions SET payload = $2 WHERE id = $1`, [state.sessionId, JSON.stringify(state)]);

    return NextResponse.json({
      ok: true,
      changed: changing,
      answered: Object.fromEntries(Object.entries(state.answers).map(([k, v]) => [k, v.correct])),
      estimate: Math.round(state.estimate * 100) / 100,
      appended: appended ? expose(appended) : null,
      progress: state.version === 2 ? progressFor(state) : undefined,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to save answer." }, { status: 500 });
  }
}

function gi(item: LevelQuestItem): number {
  return CEFR_ORDER.indexOf(item.cefr) + item.difficulty / 10;
}

/** Rebuild per-skill tallies from the graded answers (supports answer changes). */
function rebuildTallies(state: SessionState) {
  const skillCorrect: Record<string, number> = {};
  const skillTotal: Record<string, number> = {};
  for (const [id, graded] of Object.entries(state.answers)) {
    const item = itemById(state.variant, id);
    if (!item) continue;
    skillTotal[item.skill] = (skillTotal[item.skill] ?? 0) + 1;
    if (graded.correct) skillCorrect[item.skill] = (skillCorrect[item.skill] ?? 0) + 1;
  }
  state.skillCorrect = skillCorrect;
  state.skillTotal = skillTotal;
}

async function finalize(learnerId: string, state: SessionState) {
  const objective: SkillKey[] = ["grammar", "vocabulary", "reading", "listening"];
  const skillScores: Record<string, number> = {};
  const skillProfile: Record<string, string> = {};
  const skillLowEvidence: string[] = [];
  for (const skill of objective) {
    const total = state.skillTotal[skill] ?? 0;
    const correct = state.skillCorrect[skill] ?? 0;
    skillScores[skill] = total ? Math.round((correct / total) * 100) : 0;
    skillProfile[skill] = percentToLevel(skillScores[skill]);
  }
  const skillScoreArray = objective.map((s) => skillScores[s] ?? 0);
  const ranked = objective.map((s) => [s, skillScores[s] ?? 0] as [string, number]).sort((a, b) => b[1] - a[1]);
  const strengths = ranked.slice(0, 2).map(([s]) => s);
  const focus = ranked.slice(-2).map(([s]) => s);

  // Placement verdict: estimate + standard error + boundary (Part 14).
  const answeredObjectiveItems = state.sequence.length > 0 && state.version === 2
    ? state.sequence.map((id) => itemById(state.variant, id)).filter((i): i is LevelQuestItem => i !== undefined && i.type !== "speaking" && Boolean(state.answers[i.id]))
    : Object.keys(state.answers)
        .map((id) => itemById(state.variant, id))
        .filter((i): i is LevelQuestItem => i !== undefined && i.type !== "speaking");
  const verdict = placementVerdict(state.estimate, answeredObjectiveItems);
  const overallIdx = CEFR_ORDER.indexOf(verdict.level);

  // Evidence guard against pseudo-precision (Part 16): a skill with fewer than
  // 3 graded items cannot display a band more than one above the overall
  // verdict — 1/1 = 100% must never print "C2" next to an A1 verdict.
  for (const skill of objective) {
    const total = state.skillTotal[skill] ?? 0;
    if (total > 0 && total < 3) {
      const cappedIdx = Math.min(CEFR_ORDER.indexOf(skillProfile[skill] as never), overallIdx + 1);
      const capped = CEFR_ORDER[Math.max(0, cappedIdx)];
      if (capped !== skillProfile[skill]) {
        skillProfile[skill] = capped;
        if (!skillLowEvidence.includes(skill)) skillLowEvidence.push(skill);
      }
    }
  }

  // Speaking evaluation (Part 8): real transcript analysis, honestly labelled.
  const speakingFeedback: Record<string, SpeakingEvaluation> = {};
  for (const [id, graded] of Object.entries(state.answers)) {
    const item = itemById(state.variant, id);
    if (!item || item.type !== "speaking" || !graded.given) continue;
    speakingFeedback[id] = evaluateSpeakingTranscript(graded.given, item.cefr);
  }
  const speakingEvals = Object.values(speakingFeedback);
  const speakingSubmitted = speakingEvals.some((e) => e.submitted);
  const speakingBand = overallSpeakingBand(speakingEvals);
  const speakingCount = speakingEvals.filter((e) => e.submitted).length;

  const reportId = crypto.randomUUID();
  const result = {
    assessmentId: reportId,
    level: verdict.level,
    confidence: verdict.confidence,
    boundary: verdict.boundary,
    estimate: Math.round(state.estimate * 10) / 10,
    standardError: verdict.se,
    skillProfile,
    skillScores,
    skillLowEvidence,
    skillAnswered: Object.fromEntries(objective.map((s) => [s, state.skillTotal[s] ?? 0])),
    skillsAttempted: objective.filter((s) => (state.skillTotal[s] ?? 0) > 0),
    strengths,
    focusAreas: focus,
    variant: state.variant,
    variantTheme: VARIANT_THEMES[(state.variant - 1) % VARIANT_THEMES.length],
    answeredCount: Object.keys(state.answers).length,
    presentedCount: state.sequence.length,
    speakingSubmitted,
    speakingResponses: speakingCount, // fixed: counts only speaking items (was all answers)
    speakingBand,
    speakingFeedback,
  };

  state.status = "COMPLETE";
  await query(`UPDATE levelquest_sessions SET status = 'COMPLETE', payload = $2, completed_at = now() WHERE id = $1`, [state.sessionId, JSON.stringify(state)]);

  // Persistence below is best-effort: the report must always reach the learner
  // even if a given table write fails, so each write is isolated.
  try {
    await query(
      `INSERT INTO diagnostic_attempts (id, learner_id, answers, scores, cefr_level, english_dna, created_at) VALUES ($1, $2::uuid, $3, $4, $5, $6, now())`,
      [crypto.randomUUID(), learnerId, JSON.stringify(state.answers), JSON.stringify(skillScoreArray), verdict.level,
        JSON.stringify({ overallLevel: verdict.level, confidence: verdict.confidence, skillProfile, strengths, focusAreas: focus, variant: state.variant, generatedAt: new Date().toISOString() })],
    );
    await query(
      `INSERT INTO placement_reports (id, learner_id, variant, level, confidence, skill_profile, report_json, created_at) VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, now())`,
      [reportId, learnerId, state.variant, verdict.level, verdict.confidence, JSON.stringify(skillProfile), JSON.stringify(result)],
    );
    await query(
      `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1, $2::uuid, 'levelquest.completed', $3, now())`,
      [crypto.randomUUID(), learnerId, JSON.stringify({ level: verdict.level, confidence: verdict.confidence, variant: state.variant, boundary: verdict.boundary, speakingBand })],
    );
  } catch { /* report is already computed; persistence failure is non-fatal */ }

  // Persist the placed level into the learner's profile so the dashboard reflects it.
  try {
    await query(
      `UPDATE learner_profiles
       SET english_dna = $2::jsonb, updated_at = NOW()
       WHERE learner_id = $1::uuid`,
      [learnerId, JSON.stringify({
        overallLevel: verdict.level,
        strengths,
        focusAreas: focus,
        preferredSkills: ranked.slice(0, 3).map(([s]) => s),
        confidence: verdict.confidence === "High" ? 0.9 : 0.6,
        boundary: verdict.boundary,
        speakingBand,
        placementAnchorLesson: firstLessonIdForLevel(verdict.level),
      })],
    );
  } catch { /* profile persistence is best-effort */ }

  // Personalize the curriculum starting point (Part 24): move the learner's
  // current lesson to the first lesson of their placed level — but never
  // backwards behind progress they have already made.
  try {
    const anchorId = firstLessonIdForLevel(verdict.level);
    const anchorSeq = ALL_LESSONS.find((l) => l.id === anchorId)?.sequence ?? 10;
    const current = await getLearnerState(learnerId);
    if (current) {
      const currentSeq = current.currentLessonId ? ALL_LESSONS.find((l) => l.id === current.currentLessonId)?.sequence ?? 10 : 10;
      if (anchorSeq > currentSeq || !current.currentLessonId) {
        const history = current.lessonHistory.map((h) =>
          h.lessonId === anchorId
            ? { ...h, status: "in_progress" as const, startedAt: h.startedAt ?? new Date().toISOString() }
            : h.status === "in_progress"
              ? { ...h, status: "not_started" as const }
              : h,
        );
        await saveLearnerState({
          ...current,
          currentLessonId: anchorId,
          lessonHistory: history,
          nextAction: { type: "lesson", id: anchorId, reason: `Your LevelQuest result (${verdict.level}) personalizes your starting point.`, priority: "MEDIUM" },
          version: current.version + 1,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch { /* curriculum anchor is best-effort; report is unaffected */ }

  // Report header identity (Part 16): student name + Student ID + date.
  let studentName: string | null = null;
  let studentId: string | null = null;
  try {
    const idRow = await query<{ display_name: string | null; student_id: string | null }>(
      `SELECT COALESCE(ua.display_name, lp.display_name) AS display_name, l.student_id
       FROM learners l
       LEFT JOIN user_accounts ua ON ua.learner_id = l.id
       LEFT JOIN learner_profiles lp ON lp.learner_id = l.id
       WHERE l.id = $1::uuid`,
      [learnerId],
    );
    studentName = idRow.rows[0]?.display_name ?? null;
    studentId = idRow.rows[0]?.student_id ?? null;
  } catch { /* identity is cosmetic on the report; never block finalize */ }

  return NextResponse.json({
    result: {
      ...result,
      studentName,
      studentId,
      assessmentDate: new Date().toISOString(),
    },
  });
}

function percentToLevel(p: number): string {
  if (p >= 90) return "C2";
  if (p >= 82) return "C1";
  if (p >= 72) return "B2";
  if (p >= 62) return "B1";
  if (p >= 45) return "A2";
  if (p >= 25) return "A1";
  return "Pre-A1";
}

import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import {
  paperForVariant,
  adaptiveOrderForStart,
  variantForLearner,
  updateEstimate,
  estimateToLevel,
  levelToEstimate,
  CEFR_ORDER,
  type LevelQuestItem,
  type SkillKey,
} from "@/src/domain/levelquest";

export const dynamic = "force-dynamic";

interface Graded { correct: boolean; expected?: string; explanation?: string; given: string }
interface SessionState {
  sessionId: string;
  variant: number;
  startedAt: string;
  status: "IN_PROGRESS" | "COMPLETE";
  asked: string[];
  answers: Record<string, Graded>;
  flag: string[];
  estimate: number;
  skillCorrect: Record<string, number>;
  skillTotal: Record<string, number>;
}

function gi(item: LevelQuestItem): number {
  return CEFR_ORDER.indexOf(item.cefr) + item.difficulty / 10;
}

/** GET — assign variant, resume or create session, return full ordered paper (answers hidden). */
export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const variant = variantForLearner(session.learnerId);

    // Start the adaptive ramp from the learner's known level when available, so a
    // confident B2 learner is not given the same opening questions as an A1 learner.
    const known = await query(`SELECT english_dna FROM learner_profiles WHERE learner_id = $1::uuid`, [session.learnerId]);
    const knownLevel = (known.rows[0]?.english_dna as { overallLevel?: string } | undefined)?.overallLevel;
    const startEstimate = levelToEstimate(knownLevel);
    const paper = adaptiveOrderForStart(variant, startEstimate);

    // Resume in-progress session
    const resume = await query(
      `SELECT id, payload FROM levelquest_sessions WHERE learner_id = $1 AND status = 'IN_PROGRESS' ORDER BY started_at DESC LIMIT 1`,
      [session.learnerId],
    );
    let state: SessionState | null = null;
    if (resume.rowCount && resume.rows[0]) {
      state = resume.rows[0].payload as SessionState;
      state.sessionId = resume.rows[0].id;
    }

    if (!state) {
      const sessionId = crypto.randomUUID();
      state = {
        sessionId, variant, startedAt: new Date().toISOString(), status: "IN_PROGRESS",
        asked: [], answers: {}, flag: [], estimate: 0, skillCorrect: {}, skillTotal: {},
      };
      await query(
        `INSERT INTO levelquest_sessions (id, learner_id, variant, status, payload, started_at) VALUES ($1, $2::uuid, $3, 'IN_PROGRESS', $4, now())`,
        [sessionId, session.learnerId, variant, JSON.stringify(state)],
      );
    }

    const exposed = paper.map(({ id, cefr, difficulty, skill, subskill, type, prompt, options, estimatedTime, audioText }) => ({
      id, cefr, difficulty, skill, subskill, type, prompt, options, estimatedTime,
      ...(type === "listening" && audioText ? { audioText } : {}),
    }));

    return NextResponse.json({
      paper: exposed,
      sessionId: state.sessionId,
      variant: state.variant,
      answered: Object.fromEntries(Object.entries(state.answers).map(([k, v]) => [k, v.correct])),
      flags: state.flag,
      estimate: state.estimate,
      startEstimate,
      ...(knownLevel ? { startLevel: knownLevel } : {}),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to start LevelQuest." }, { status: 500 });
  }
}

/** POST — grade an answer and (optionally) finalize. */
export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as
    | { sessionId?: string; itemId?: string; answer?: string; flag?: string[]; finalize?: boolean }
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

    if (body.flag) {
      state.flag = body.flag;
      await query(`UPDATE levelquest_sessions SET payload = $2 WHERE id = $1`, [state.sessionId, JSON.stringify(state)]);
      return NextResponse.json({ ok: true });
    }

    if (body.finalize) return finalize(session.learnerId, state);

    const paper = paperForVariant(state.variant);
    const item = paper.find((i) => i.id === body.itemId);
    if (!item) return NextResponse.json({ error: "Item not found." }, { status: 404 });

    // Grade (idempotent — only counts first time)
    if (state.answers[item.id] === undefined) {
      const given = (body.answer ?? "").trim();
      const correct = item.type !== "speaking" && given.toLowerCase() === item.answer.toLowerCase();
      state.answers[item.id] = { correct, expected: item.answer, explanation: item.explanation, given };
      state.asked.push(item.id);
      state.skillCorrect[item.skill] = (state.skillCorrect[item.skill] ?? 0) + (correct ? 1 : 0);
      state.skillTotal[item.skill] = (state.skillTotal[item.skill] ?? 0) + 1;
      // Only update estimate from objective (non-speaking) items
      if (item.type !== "speaking") {
        state.estimate = updateEstimate(state.estimate, correct, gi(item), state.asked.length);
      }
      await query(`UPDATE levelquest_sessions SET payload = $2 WHERE id = $1`, [state.sessionId, JSON.stringify(state)]);
    } else {
      await query(`UPDATE levelquest_sessions SET payload = $2 WHERE id = $1`, [state.sessionId, JSON.stringify(state)]);
    }

    return NextResponse.json({ ok: true, answered: Object.fromEntries(Object.entries(state.answers).map(([k, v]) => [k, v.correct])), estimate: state.estimate });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to save answer." }, { status: 500 });
  }
}

async function finalize(learnerId: string, state: SessionState) {
  // Objective skills are genuinely graded. Speaking production cannot be scored
  // automatically/exactly, so it is reported as honest submitted-responses rather
  // than a fabricated percentage (per product integrity rules).
  const objective: SkillKey[] = ["grammar", "vocabulary", "reading", "listening"];
  const skillScores: Record<string, number> = {};
  const skillProfile: Record<string, string> = {};
  const speakingSubmitted = (state.skillTotal.speaking ?? 0) > 0;
  for (const skill of objective) {
    const total = state.skillTotal[skill] ?? 0;
    const correct = state.skillCorrect[skill] ?? 0;
    skillScores[skill] = total ? Math.round((correct / total) * 100) : 0;
    skillProfile[skill] = percentToLevel(skillScores[skill]);
  }
  const skillScoreArray = objective.map((s) => skillScores[s] ?? 0);
  const overall = estimateToLevel(state.estimate);
  const ranked = objective.map((s, i) => [s, skillScoreArray[i]] as [string, number]).sort((a, b) => b[1] - a[1]);
  const strengths = ranked.slice(0, 2).map(([s]) => s);
  const focus = ranked.slice(-2).map(([s]) => s);
  const speakingCount = Object.keys(state.answers).filter((id) => (state.answers[id] as { given: string }).given).length;

  const result = {
    level: overall.level,
    confidence: overall.confidence,
    estimate: Math.round(state.estimate * 10) / 10,
    skillProfile,
    skillScores,
    skillAnswered: Object.fromEntries(objective.map((s) => [s, state.skillTotal[s] ?? 0])),
    skillsAttempted: objective.filter((s) => (state.skillTotal[s] ?? 0) > 0),
    strengths,
    focusAreas: focus,
    variant: state.variant,
    answeredCount: Object.keys(state.answers).length,
    speakingSubmitted,
    speakingResponses: speakingCount,
  };

  state.status = "COMPLETE";
  await query(`UPDATE levelquest_sessions SET status = 'COMPLETE', payload = $2, completed_at = now() WHERE id = $1`, [state.sessionId, JSON.stringify(state)]);

  // Persistence below is best-effort: the report must always reach the learner even
  // if a given table write fails, so each insert is isolated.
  try {
    await query(
      `INSERT INTO diagnostic_attempts (id, learner_id, answers, scores, cefr_level, english_dna, created_at) VALUES ($1, $2::uuid, $3, $4, $5, $6, now())`,
      [crypto.randomUUID(), learnerId, JSON.stringify(state.answers), JSON.stringify(skillScoreArray), overall.level,
        JSON.stringify({ overallLevel: overall.level, confidence: overall.confidence, skillProfile, strengths, focusAreas: focus, variant: state.variant, generatedAt: new Date().toISOString() })],
    );
    await query(
      `INSERT INTO placement_reports (id, learner_id, variant, level, confidence, skill_profile, report_json, created_at) VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, now())`,
      [crypto.randomUUID(), learnerId, state.variant, overall.level, overall.confidence, JSON.stringify(skillProfile), JSON.stringify(result)],
    );
    await query(
      `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1, $2::uuid, 'levelquest.completed', $3, now())`,
      [crypto.randomUUID(), learnerId, JSON.stringify({ level: overall.level, confidence: overall.confidence, variant: state.variant })],
    );
  } catch { /* report is already computed; persistence failure is non-fatal */ }

  // Persist the placed level into the learner's profile so the dashboard reflects it.
  try {
    await query(
      `UPDATE learner_profiles
       SET english_dna = $2::jsonb, updated_at = NOW()
       WHERE learner_id = $1::uuid`,
      [learnerId, JSON.stringify({
        overallLevel: overall.level,
        strengths,
        focusAreas: focus,
        preferredSkills: ranked.slice(0, 3).map(([s]) => s),
        confidence: overall.confidence === "High" ? 0.9 : overall.confidence === "Moderate" ? 0.6 : 0.3,
      })],
    );
  } catch { /* profile persistence is best-effort */ }

  return NextResponse.json({ result });
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

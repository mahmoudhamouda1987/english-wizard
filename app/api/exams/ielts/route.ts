import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import {
  buildIeltsPlan,
  bandFromPercent,
  roundHalf,
  gradeObjectiveItems,
  scoreIeltsWriting,
  scoreSpeakingRubric,
  gapToTarget,
  READING_SETS,
  LISTENING_SETS,
  WRITING_TASKS,
  SPEAKING_CARDS,
  type IeltsVariant,
  type BandTarget,
  type IeltsSkill,
  type ModuleStage,
  BAND_TARGETS,
} from "@/src/domain/ielts";

export const dynamic = "force-dynamic";

function safeVariant(value: string | null): IeltsVariant | null {
  if (!value) return null;
  const v = value.toUpperCase().trim();
  return v === "ACADEMIC" || v === "GENERAL" ? v : null;
}

function safeBand(value: string | null): BandTarget | null {
  if (!value) return null;
  const n = Number(value);
  return (BAND_TARGETS as readonly number[]).includes(n) ? (n as BandTarget) : null;
}

/** GET /api/exams/ielts  — catalog, plan, or module content via query params. */
export async function GET(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const url = new URL(request.url);
  const variant = safeVariant(url.searchParams.get("variant"));
  const band = safeBand(url.searchParams.get("band"));
  const skill = url.searchParams.get("skill") as IeltsSkill | null;
  const stage = url.searchParams.get("stage") as ModuleStage | null;

  if (!variant || !band) {
    return NextResponse.json({
      variants: ["ACADEMIC", "GENERAL"],
      bands: BAND_TARGETS,
      message: "Supply variant and band to receive a plan.",
    });
  }
  const plan = buildIeltsPlan(variant, band);
  if (!skill || !stage) return NextResponse.json({ plan });

  if (stage === "mock") {
    const mockReading = READING_SETS[variant === "ACADEMIC" ? 0 : 3];
    const writingTasks = WRITING_TASKS.filter((t) => t.variant === variant).slice(0, 2);
    return NextResponse.json({ variant, band, reading: mockReading, writingTasks, speaking: SPEAKING_CARDS.filter((c) => c.part === 2).slice(0, 2) });
  }

  if (stage === "teach" || stage === "guided") {
    const sharedExplanations: Record<string, string[]> = {
      reading: ["IELTS reading tests your ability to locate information and recognise paraphrase. The answer is always in the passage.", "Skim for the main idea first, then scan for specific keywords from the question.", "Distractors rephrase the passage — match meaning, not identical words."],
      listening: ["Prediction is your greatest tool: read the gaps before audio plays and anticipate word types.", "Spelling and number accuracy are scored — write exactly what you hear.", "Distractors often come first then are corrected — wait for final confirmation."],
      writing: ["Task 1: Overview first, then specific comparisons — examiners reward structured data description.", "Task 2: Position your argument in the introduction, support with two body paragraphs.", "Coherence matters: use linking devices sparingly but precisely."],
      speaking: ["Extend answers to 3-4 sentences with one example to demonstrate range.", "Self-correcting naturally shows examiners you monitor grammar under pressure.", "Fluency beats complexity — fillers and stumbles break your band."],
    };
    return NextResponse.json({ skill, stage, explanations: sharedExplanations[skill] ?? [], module: plan.modules.find((m) => m.skill === skill && m.stage === stage) });
  }

  if (stage === "timed" || stage === "module-test") {
    if (skill === "reading") {
      const set = READING_SETS.find((r) => r.variant === variant) ?? READING_SETS[0];
      return NextResponse.json({ skill, stage, items: set.items, passage: set.passage, title: set.title, minutes: stage === "module-test" ? 18 : 14 });
    }
    if (skill === "listening") {
      const set = LISTENING_SETS[0];
      return NextResponse.json({ skill, stage, items: set.items, script: set.script, title: set.title, minutes: 8 });
    }
    if (skill === "writing") {
      const task = WRITING_TASKS.find((t) => t.variant === variant) ?? WRITING_TASKS[0];
      return NextResponse.json({ skill, stage, task, minutes: task.minutes });
    }
    if (skill === "speaking") {
      const card = SPEAKING_CARDS.find((c) => c.part === 2) ?? SPEAKING_CARDS[0];
      return NextResponse.json({ skill, stage, card, minutes: 3 });
    }
  }

  return NextResponse.json({ error: "Unknown module or stage." }, { status: 400 });
}

/** POST /api/exams/ielts  — submit answers and receive scores, band estimate, recommendations. */
export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as {
    variant?: string; band?: string; skill?: string;
    answers?: Record<string, string>; writingText?: string;
    speakingRubric?: { fluencyCoherence?: string; lexicalResource?: string; grammaticalRange?: string; pronunciation?: string };
    completedTiming?: boolean;
  } | null;
  const variant = safeVariant(body?.variant ?? null) ?? "ACADEMIC";
  const band = safeBand(body?.band ?? null) ?? 7;
  const skill = (body?.skill ?? "reading").toLowerCase() as IeltsSkill;

  const skillPercents: Partial<Record<IeltsSkill, number>> = {};
  const feedback: string[] = [];

  if (skill === "reading") {
    const set = READING_SETS.find((r) => r.variant === variant) ?? READING_SETS[0];
    const result = gradeObjectiveItems(set.items, body?.answers ?? {});
    skillPercents.reading = result.percent;
    feedback.push(...result.perItem.filter((r) => !r.correct).map((r) => `Q: "${r.expected}" — ${r.explain}`));
  } else if (skill === "listening") {
    const set = LISTENING_SETS[0];
    const result = gradeObjectiveItems(set.items, body?.answers ?? {});
    skillPercents.listening = result.percent;
    feedback.push(...result.perItem.filter((r) => !r.correct).map((r) => `Q: "${r.expected}" — ${r.explain}`));
  } else if (skill === "writing") {
    const task = WRITING_TASKS.find((t) => t.variant === variant) ?? WRITING_TASKS[0];
    const { percent: writingPercent, feedback: writingFeedback } = scoreIeltsWriting(task, body?.writingText ?? "");
    skillPercents.writing = writingPercent;
    feedback.push(...writingFeedback);
  } else if (skill === "speaking") {
    const rubric = {
      fluencyCoherence: ((body?.speakingRubric?.fluencyCoherence ?? "okay") as "weak" | "okay" | "good"),
      lexicalResource: ((body?.speakingRubric?.lexicalResource ?? "okay") as "weak" | "okay" | "good"),
      grammaticalRange: ((body?.speakingRubric?.grammaticalRange ?? "okay") as "weak" | "okay" | "good"),
      pronunciation: ((body?.speakingRubric?.pronunciation ?? "okay") as "weak" | "okay" | "good"),
    };
    const { percent: speakingPercent, feedback: speakingFeedback } = scoreSpeakingRubric(rubric, body?.completedTiming ?? false);
    skillPercents.speaking = speakingPercent;
    feedback.push(...speakingFeedback);
  }

  const bandEstimate = bandFromPercent(Object.values(skillPercents)[0] ?? 50);
  const gap = gapToTarget(skillPercents, band);

  // Store attempt for progress tracking
  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1, $2::uuid, 'IELTS_MODULE_COMPLETE', $3, now())`,
    [crypto.randomUUID(), session.learnerId, JSON.stringify({ variant, band: String(band), skill, bandEstimate, percent: Object.values(skillPercents)[0] ?? 0, feedbackCount: feedback.length })],
  );

  return NextResponse.json({ variant, band: String(band), skill, skillPercents, bandEstimate: roundHalf(bandEstimate), overallBand: gap.band, gap: gap.gap, meetsTarget: gap.meetsTarget, feedback, recommendations: gap.recommendations, disclaimer: "Internal estimate only — not an official IELTS result." }, { status: 200, headers: { "Cache-Control": "no-store" } });
}

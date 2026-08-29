/**
 * LevelQuest — Adaptive English Placement Assessment.
 * Question bank: 15 variants across Pre-A1 → C2.
 * Each variant is a balanced, genuinely-different paper built from a shared
 * CEFR-tagged bank. Items carry metadata for adaptive selection and scoring.
 */

export type CEFRLevel = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type SkillKey = "grammar" | "vocabulary" | "reading" | "listening" | "speaking";
export type QuestionType = "mcq" | "listening" | "speaking";

export const CEFR_ORDER: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

import { THEME_OBJECTIVE_BANKS } from "./levelquest-themes";

/**
 * Each of the 15 LevelCheck variants carries a distinct thematic identity. Beyond
 * item ordering, the theme drives genuinely different speaking prompts (see
 * SPEAKING_PROMPTS) and is surfaced in the paper and report, so two sittings do
 * not feel like the same assessment.
 */
export const VARIANT_THEMES: string[] = [
  "Everyday Life",
  "Travel & Places",
  "Education & Learning",
  "Work & Business",
  "Technology & Digital",
  "Health & Wellbeing",
  "Culture, Arts & Media",
  "Environment & Nature",
  "Science & Discovery",
  "Society & Community",
  "News & Current Events",
  "Communication & Relationships",
  "Global Life & Modern World",
  "Food & Leisure",
  "Mixed Interest",
];

export interface LevelQuestItem {
  id: string;
  variant: number;
  theme?: string;
  cefr: CEFRLevel;
  difficulty: number;
  skill: SkillKey;
  subskill: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  audioText?: string;
  estimatedTime: number;
}

const LEVEL_INDEX: Record<CEFRLevel, number> = { "Pre-A1": 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

export function g(item: Pick<LevelQuestItem, "cefr" | "difficulty">): number {
  return LEVEL_INDEX[item.cefr] + item.difficulty / 10;
}

/** Deterministic per-variant papers built from the theme-specific objective banks. */
function buildBank(): LevelQuestItem[] {
  const items: LevelQuestItem[] = [];
  let id = 0;

  const LEVELS = CEFR_ORDER;

  // Each of the 15 variants owns its own theme's objective prompts (grammar,
  // vocabulary, reading, listening) across all seven CEFR bands — genuinely
  // distinct content, not just reordered shared templates.
  for (let v = 1; v <= 15; v++) {
    const theme = VARIANT_THEMES[v - 1];
    const themeBank = THEME_OBJECTIVE_BANKS[theme];
    for (const level of LEVELS) {
      const templates = themeBank?.[level] ?? [];
      for (let t = 0; t < templates.length; t++) {
        const template = templates[t];
        // Difficulty ranges 1..9 within each band so the adaptive engine has a
        // gradient to climb and every band keeps low-difficulty anchor items.
        const diff = ((t * 7 + v * 3) % 9) + 1; // 1..9
        items.push({
          id: `lq-${++id}`,
          variant: v,
          theme,
          cefr: level,
          difficulty: diff,
          skill: template.skill,
          subskill: template.subskill,
          type: template.audioText ? "listening" : "mcq",
          prompt: template.prompt,
          options: template.options,
          answer: template.answer,
          explanation: template.explanation,
          audioText: template.audioText,
          estimatedTime: template.audioText ? 45 : 30,
        });
      }
    }
  }

  // Speaking prompts are genuinely distinct per theme AND per level (15×7), so each
  // of the 15 variants presents different production tasks, not just reordered ones.
  const SPEAKING_PROMPTS: Record<string, string[]> = {
    "Everyday Life": ["Say your name, your age, and where you live.", "Describe what you do every morning.", "Describe your home and your neighbourhood.", "Describe a typical day in your life and what you enjoy most.", "Describe a household task you dislike and suggest how to make it easier.", "Discuss how everyday routines have changed over the past decade.", "Evaluate how modern conveniences have changed the quality of daily life."],
    "Travel & Places": ["Say one country you would like to visit.", "Tell me about a place you have visited.", "Describe your ideal holiday.", "Describe a journey you remember well.", "Give your opinion on travelling alone versus travelling in a group.", "Discuss the impact of tourism on local communities.", "Evaluate the trade-offs between mass tourism and cultural preservation."],
    "Education & Learning": ["Say something you learn at school.", "Describe your favourite subject.", "Describe what you like about learning English.", "Describe a good teacher you have had.", "Give your opinion about online learning.", "Discuss whether university degrees are still necessary today.", "Evaluate how the purpose of education should change in the coming century."],
    "Work & Business": ["Say what job you would like to do.", "Describe what you do at work or school.", "Describe your dream job.", "Describe an interview you have had.", "Give your opinion about working from home.", "Discuss the pros and cons of flexible working.", "Evaluate how automation will reshape professional work."],
    "Technology & Digital": ["Say one thing you use a phone for.", "Describe how you use the internet.", "Describe an app you use every day.", "Describe how technology has changed how you communicate.", "Give your opinion about social media.", "Discuss the benefits and risks of artificial intelligence.", "Evaluate the ethical implications of AI-generated information."],
    "Health & Wellbeing": ["Say what you eat for breakfast.", "Describe what you do to stay healthy.", "Describe your favourite exercise.", "Describe a healthy habit you would like to build.", "Give your opinion about sleep and screen time.", "Discuss the role of diet in public health.", "Evaluate how modern lifestyles shape long-term health outcomes."],
    "Culture, Arts & Media": ["Say your favourite colour or song.", "Describe a film you like.", "Describe a celebration in your country.", "Describe a work of art or a film that affected you.", "Give your opinion about how films portray real events.", "Discuss the role of art in society.", "Evaluate the influence of mass media on culture and identity."],
    "Environment & Nature": ["Say one animal you like.", "Describe the weather today.", "Describe a place in nature you enjoy.", "Describe what people can do to protect the environment.", "Give your opinion about recycling.", "Discuss how climate change affects daily life.", "Evaluate the effectiveness of international climate agreements."],
    "Science & Discovery": ["Say one thing you see in the sky.", "Describe something scientists study.", "Describe an interesting fact you learned.", "Describe a scientific discovery that matters to you.", "Give your opinion about space exploration.", "Discuss the responsibility of scientists in society.", "Evaluate how science and ethics should interact in emerging technologies."],
    "Society & Community": ["Say who is in your family.", "Describe your friends.", "Describe your neighbourhood.", "Describe how communities help each other.", "Give your opinion about volunteering.", "Discuss the challenges of living in large cities.", "Evaluate the balance between individual freedom and community wellbeing."],
    "News & Current Events": ["Say one way you hear the news.", "Describe what is happening in your city.", "Describe a news story you remember.", "Describe how you follow the news.", "Give your opinion about how the news is reported.", "Discuss the reliability of information online.", "Evaluate the role of journalism in a democratic society."],
    "Communication & Relationships": ["Say how you greet people.", "Describe how you talk to your friends.", "Describe someone you communicate with every day.", "Describe a time you had to explain something clearly.", "Give your opinion about text messaging versus phone calls.", "Discuss how technology affects relationships.", "Evaluate the value of face-to-face conversation in the digital age."],
    "Global Life & Modern World": ["Say one country you know about.", "Describe food from another country.", "Describe a tradition from another culture.", "Describe how the world has connected people.", "Give your opinion about globalisation.", "Discuss the advantages and disadvantages of a globalised culture.", "Evaluate how globalisation affects local languages and traditions."],
    "Food & Leisure": ["Say your favourite food.", "Describe what you eat for dinner.", "Describe your favourite place to relax.", "Describe a meal you enjoyed with other people.", "Give your opinion about home cooking versus eating out.", "Discuss the meaning of food in different cultures.", "Evaluate how food traditions are preserved or lost in modern society."],
    "Mixed Interest": ["Say one thing you like to do.", "Describe a hobby you have.", "Describe something new you learned recently.", "Describe a goal you are working towards.", "Give your opinion about learning a language as an adult.", "Discuss how people change as they grow older.", "Evaluate what 'success' should mean in the modern world."],
  };

  let sid = 100000;
  for (let v = 1; v <= 15; v++) {
    const theme = VARIANT_THEMES[v - 1];
    const prompts = SPEAKING_PROMPTS[theme];
    for (let li = 0; li < CEFR_ORDER.length; li++) {
      const level = CEFR_ORDER[li];
      const prompt = (prompts && prompts[li]) || SPEAKING_PROMPTS["Everyday Life"][li];
      items.push({
        id: `lq-${++sid}`,
        variant: v,
        theme,
        cefr: level,
        difficulty: 5,
        skill: "speaking",
        subskill: "production",
        type: "speaking",
        prompt,
        options: [],
        answer: "(spoken response)",
        explanation: "Answered by recorded or typed spoken production.",
        estimatedTime: level === "C2" ? 90 : 60,
      });
    }
  }

  return items;
}

export const LEVELQUEST_BANK: LevelQuestItem[] = buildBank();

export function variantForLearner(seed: string | number): number {
  const s = typeof seed === "string" ? Math.abs(Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0)) : Math.abs(seed);
  return (s % 15) + 1;
}

const EXAM_SKILLS: SkillKey[] = ["grammar", "vocabulary", "reading", "listening"];

/** Build a balanced, ordered paper for a variant (speaking appended last). */
export function paperForVariant(variant: number): LevelQuestItem[] {
  const pool = LEVELQUEST_BANK.filter((i) => i.variant === variant && i.type !== "speaking");
  const speaking = LEVELQUEST_BANK.filter((i) => i.variant === variant && i.type === "speaking");
  const paper: LevelQuestItem[] = [];
  for (const skill of EXAM_SKILLS) {
    const filtered = pool.filter((i) => i.skill === skill).sort((a, b) => g(a) - g(b));
    paper.push(...filtered);
  }
  paper.push(...speaking);
  return paper;
}

/**
 * Adaptive next-item selection.
 * Maintains an estimated ability level (0..6). Selects the unasked item whose
 * global difficulty is closest to the estimate, without jumping more than one
 * level at a time and without trapping the learner.
 */
export function adaptiveNextItem(
  paper: LevelQuestItem[],
  asked: string[],
  estimate: number,
): LevelQuestItem | null {
  const unasked = paper.filter((i) => !asked.includes(i.id) && i.type !== "speaking");
  if (unasked.length === 0) return null;
  const windowed = unasked.filter((i) => Math.abs(g(i) - estimate) <= 1);
  const pool = windowed.length >= 3 ? windowed : unasked;
  pool.sort((a, b) => Math.abs(g(a) - estimate) - Math.abs(g(b) - estimate));
  return pool[0];
}

/** Update the ability estimate from a graded answer. Weighted smoothing: recent + cumulative. */
export function updateEstimate(prev: number, correct: boolean, itemDifficulty: number, evidenceCount: number): number {
  const step = Math.max(0.35, 0.8 / Math.max(1, evidenceCount + 1));
  if (correct) {
    return Math.min(6, prev + step * Math.max(0.25, 1 - Math.abs(itemDifficulty - prev)));
  }
  return Math.max(0, prev - step * Math.max(0.25, 1 - Math.abs(itemDifficulty - prev)));
}

/** Map 0..6 ability estimate to a CEFR level. */
export function estimateToLevel(estimate: number): { level: CEFRLevel; confidence: "High" | "Moderate" } {
  const idx = Math.max(0, Math.min(6, Math.round(estimate)));
  const fractional = estimate - Math.floor(estimate);
  const confidence = (fractional < 0.3 || fractional > 0.7) ? "High" : "Moderate";
  return { level: CEFR_ORDER[idx], confidence };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ADAPTIVE ENGINE V2 — genuine runtime item-adaptive selection (Part 6).
 *
 * V1 presented a paper whose ORDER was precomputed once (baseline-first climb);
 * the runtime estimate never re-routed the sequence. V2 makes the sitting
 * genuinely item-adaptive: after every graded answer the server selects the
 * next item from the variant pool using the current ability estimate, with
 * band windows, skill balancing, anti-jump guards and a 30-minute-fit budget.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Sitting budget sized so a complete sitting fits the 30:00 timer with speaking. */
export const SESSION_BUDGET = {
  /** Maximum objective (mcq/listening) items presented in one sitting. */
  objective: 30,
  /** Speaking tasks per sitting (drawn from the variant's 7 level-keyed prompts). */
  speaking: 4,
  /** Minimum objective evidence before adaptive early-stop is allowed. */
  minObjectiveForEarlyStop: 16,
  /** Minimum evidence per objective skill before early-stop is allowed. */
  minPerSkillForEarlyStop: 3,
} as const;

export interface AdaptiveSelectionContext {
  askedIds: string[];
  estimate: number;
  skillTotal: Record<string, number>;
  /** Last presented item id (used for anti-repetition of subskill). */
  lastItemId?: string | null;
}

/**
 * Select the next objective item for a sitting (Part 6 adaptive rules):
 * - prefers items within ±1.0 band of the estimate (widens only when starved);
 * - balances skills so no skill dominates the evidence;
 * - never jumps several bands off a single correct answer (window enforces);
 * - never traps the learner (fallback to globally closest items);
 * - avoids repeating the same subskill back-to-back when alternatives exist.
 */
export function selectNextAdaptiveItem(variant: number, ctx: AdaptiveSelectionContext): LevelQuestItem | null {
  const pool = LEVELQUEST_BANK.filter(
    (i) => i.variant === variant && i.type !== "speaking" && !ctx.askedIds.includes(i.id),
  );
  if (pool.length === 0) return null;

  const est = clampEstimate(ctx.estimate);
  const lastSubskill = ctx.lastItemId
    ? LEVELQUEST_BANK.find((i) => i.id === ctx.lastItemId)?.subskill ?? null
    : null;

  // Skill deficit: skills with less evidence get priority.
  const skills: SkillKey[] = ["grammar", "vocabulary", "reading", "listening"];
  const counts = skills.map((s) => ctx.skillTotal[s] ?? 0);
  const minCount = Math.min(...counts);

  const candidates = pool.map((item) => {
    const dist = Math.abs(g(item) - est);
    const skillDeficit = (ctx.skillTotal[item.skill] ?? 0) - minCount; // 0 for least-asked skills
    const subskillRepeat = lastSubskill && item.subskill === lastSubskill ? 0.45 : 0;
    return { item, score: dist + skillDeficit * 0.28 + subskillRepeat };
  });
  candidates.sort((a, b) => a.score - b.score);

  // Band window: ±1.0 preferred; widen progressively rather than jumping levels.
  for (const window of [1.0, 1.4, 1.8]) {
    const inWindow = candidates.filter((c) => Math.abs(g(c.item) - est) <= window);
    if (inWindow.length >= 3) return inWindow[0].item;
  }
  return candidates[0].item;
}

/**
 * Select the next speaking task. The FIRST task enters near the learner's
 * estimated level (not always Pre-A1); later tasks walk upward one band at a
 * time from the previous speaking task so production difficulty progresses.
 */
export function selectNextSpeakingItem(
  variant: number,
  askedIds: string[],
  estimate: number,
  lastSpeakingLevelIndex: number | null,
): LevelQuestItem | null {
  const pool = LEVELQUEST_BANK.filter(
    (i) => i.variant === variant && i.type === "speaking" && !askedIds.includes(i.id),
  );
  if (pool.length === 0) return null;
  if (lastSpeakingLevelIndex === null) {
    const target = clampEstimate(estimate);
    return pool.sort((a, b) => Math.abs(LEVEL_INDEX[a.cefr] - target) - Math.abs(LEVEL_INDEX[b.cefr] - target))[0];
  }
  const upward = pool.filter((i) => LEVEL_INDEX[i.cefr] > lastSpeakingLevelIndex);
  if (upward.length > 0) {
    return upward.sort((a, b) => LEVEL_INDEX[a.cefr] - LEVEL_INDEX[b.cefr])[0];
  }
  return pool.sort((a, b) => LEVEL_INDEX[a.cefr] - LEVEL_INDEX[b.cefr])[0];
}

/* ── Ability estimation, confidence and boundary detection (Part 14) ── */

/** Rasch-style probability of a correct answer at ability `est` on difficulty `d`. */
export function probabilityCorrect(est: number, difficulty: number): number {
  return 1 / (1 + Math.exp(-1.7 * (est - difficulty)));
}

/**
 * Standard error of the ability estimate from the answered items' information.
 * SE = 1 / sqrt(Σ 4·p·(1−p)); small SE = precise estimate.
 */
export function estimateStandardError(
  items: Array<Pick<LevelQuestItem, "cefr" | "difficulty">>,
  estimate: number,
): number {
  let info = 0;
  for (const item of items) {
    const p = probabilityCorrect(estimate, g(item));
    info += 4 * p * (1 - p);
  }
  return info > 0 ? 1 / Math.sqrt(info) : 2;
}

export interface PlacementVerdict {
  level: CEFRLevel;
  confidence: "High" | "Moderate";
  /** e.g. "B1 / Emerging B2" when the estimate sits near the next boundary. */
  boundary: string | null;
  emerging: CEFRLevel | null;
  se: number;
}

/**
 * Final placement verdict combining the estimate, its standard error and
 * boundary proximity. Does NOT imply precision the evidence cannot support:
 * - confidence is High only when the SE is small or the evidence is decisive;
 * - an "Emerging X" boundary is reported when the estimate sits close to the
 *   next band with meaningful evidence behind it (Part 14).
 */
export function placementVerdict(
  estimate: number,
  answeredItems: Array<Pick<LevelQuestItem, "cefr" | "difficulty">>,
): PlacementVerdict {
  const se = estimateStandardError(answeredItems, estimate);
  const idx = Math.max(0, Math.min(6, Math.round(estimate)));
  const level = CEFR_ORDER[idx];

  const enoughEvidence = answeredItems.length >= SESSION_BUDGET.minObjectiveForEarlyStop;
  const high = (se <= 0.52 && answeredItems.length >= 12) || (enoughEvidence && se <= 0.62);
  const confidence: "High" | "Moderate" = high ? "High" : "Moderate";

  // Boundary (Part 14): "B1 / Emerging B2" means the estimate rounded UP into
  // the band — the learner sits just below the band's centre with real
  // evidence, so the previous band is acknowledged alongside the verdict.
  // Estimates at/above the band centre claim no emergence (no overclaiming).
  const roundedUp = estimate > idx - 0.5 && estimate < idx; // frac >= .5 rounds up
  let emerging: CEFRLevel | null = null;
  if (enoughEvidence && answeredItems.length >= 12 && roundedUp && idx > 0) {
    emerging = CEFR_ORDER[idx - 1];
  }
  const boundary = emerging ? `${emerging} / Emerging ${level}` : null;
  return { level, confidence, boundary, emerging, se: Math.round(se * 100) / 100 };
}

/**
 * Recompute the ability estimate from scratch over all graded answers in
 * presentation order. Used when a learner changes a previously-graded answer
 * (Part 10: recalculation instead of silent corruption).
 */
export function recomputeEstimate(
  orderedItems: LevelQuestItem[], // presentation order, objective items only
  answers: Record<string, { correct: boolean }>,
  startEstimate: number,
): number {
  let est = clampEstimate(startEstimate);
  let n = 0;
  for (const item of orderedItems) {
    const graded = answers[item.id];
    if (!graded) continue;
    n += 1;
    est = updateEstimate(est, graded.correct, g(item), n);
  }
  return est;
}

/* ── Placement → curriculum personalization (Part 24) ── */

const LEVEL_FIRST_LESSON: Record<CEFRLevel, string> = {
  "Pre-A1": "lesson-01-me-my-world",
  A1: "lesson-03-food-shopping-services",
  A2: "lesson-06-people-social-life",
  B1: "lesson-13-relationships-behaviour",
  B2: "lesson-17-business-economy",
  C1: "lesson-21-science-natural-world",
  C2: "lesson-26-advanced-argumentation",
};

/** The first curriculum lesson of a CEFR level (personalized starting point). */
export function firstLessonIdForLevel(level: string): string {
  return LEVEL_FIRST_LESSON[level as CEFRLevel] ?? LEVEL_FIRST_LESSON["Pre-A1"];
}

const clampEstimate = (e: number) => Math.max(0, Math.min(6, e));

/**
 * Convert a known CEFR level to a starting ability estimate (0..6).
 *
 * Baseline-first rule (Part 9-11): an unknown learner is NEVER thrown advanced
 * questions. When no prior level is known we anchor at the baseline (Pre-A1, 0)
 * and let the adaptive path climb only on sustained evidence, rather than probing
 * from the middle of the range.
 */
export function levelToEstimate(level?: string | null): number {
  const idx = level ? CEFR_ORDER.indexOf(level as CEFRLevel) : -1;
  return idx >= 0 ? idx : 0;
}

const BASELINE_GRACE = 0.35;

/**
 * Baseline-first adaptive ordering.
 *
 * Builds a deterministic paper for a learner whose true ability is approximated by
 * `startEstimate`. The battery starts AT or JUST BELOW the learner's baseline band
 * (never with advanced questions up front) and climbs one CEFR band at a time,
 * probing the next band only after sustained correct evidence in the current band.
 * Items within reach are presented before overshoot items. The order converges so
 * that following it produces a final estimate near the learner's true level, and
 * every objective item is presented exactly once (listening tail, then speaking).
 */
export function adaptiveOrderForStart(variant: number, startEstimate: number): LevelQuestItem[] {
  const objective = LEVELQUEST_BANK.filter((i) => i.variant === variant && i.type !== "speaking");
  const speaking = LEVELQUEST_BANK.filter((i) => i.variant === variant && i.type === "speaking");

  const byBand: LevelQuestItem[][] = CEFR_ORDER.map(() => []);
  for (const item of objective) byBand[LEVEL_INDEX[item.cefr]].push(item);
  for (const band of byBand) band.sort((a, b) => g(a) - g(b));

  // Anchor below or at the learner's true band so the opening is accessible.
  const trueIdx = clampEstimate(Math.round(startEstimate));
  const startBand = Math.max(0, trueIdx - 1);

  const order: LevelQuestItem[] = [];
  const seen = new Set<string>();

  const push = (item: LevelQuestItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    order.push(item);
  };

  const record: Record<number, { correct: number; total: number }> = {};
  for (let b = 0; b < 7; b++) record[b] = { correct: 0, total: 0 };

  // Present from the baseline band upward, probing one band ahead of mastery.
  // The simulated learner of true ability `trueIdx` answers correctly on items
  // within reach (g <= trueIdx + grace) and misses overshoot items, so the probe
  // only "advances" one band when the current band shows sustained success.
  let current = startBand;
  while (current < 7) {
    // Current band items, ascending difficulty
    for (const item of byBand[current]) {
      push(item);
      const correct = g(item) <= trueIdx + BASELINE_GRACE;
      record[current].total++;
      if (correct) record[current].correct++;
    }
    // Probe the next band (cap: reachable items first). Only climb after the
    // current band shows a majority of correct answers (sustained evidence).
    const bandRate = record[current].total ? record[current].correct / record[current].total : 0;
    const canClimb = bandRate >= 0.6;
    if (!canClimb || current === 6) break;
    current++;
  }

  // Append everything not yet presented in ascending difficulty order (the full
  // battery is available to the learner even if not part of the climb path).
  const remaining = objective.filter((i) => !seen.has(i.id)).sort((a, b) => g(a) - g(b));
  for (const item of remaining) push(item);

  // Keep listening tail together after the objective battery, then speaking last.
  const pushed = new Set(order.map((i) => i.id));
  const listening = objective.filter((i) => !pushed.has(i.id) && i.skill === "listening");
  const stillLeft = objective.filter((i) => !new Set([...pushed, ...listening.map((l) => l.id)]).has(i.id));
  order.push(...stillLeft, ...listening, ...speaking);

  return order;
}

/**
 * Simulated run: returns the converged ability band (0..6) for a learner of true
 * ability `trueIndex`, using the boundary-confirmation model. We grade every item
 * the paper presented, tally per-CEFR-band success rates, then walk upward through
 * the bands: a band is considered "mastered" (adds to the level) when the learner
 * sustained at least half of that band's items correctly. The level is the highest
 * fully-sustained band — the boundary the adaptive battery is designed to find.
 */
export function simulateConvergence(paper: LevelQuestItem[], trueIndex: number): number {
  const bandCorrect: number[] = CEFR_ORDER.map(() => 0);
  const bandTotal: number[] = CEFR_ORDER.map(() => 0);
  const target = clampEstimate(trueIndex);
  for (const item of paper) {
    if (item.type === "speaking") continue;
    const b = LEVEL_INDEX[item.cefr];
    bandTotal[b]++;
    if (g(item) <= target + BASELINE_GRACE) bandCorrect[b]++;
  }
  let level = 0;
  for (let b = 0; b < 7; b++) {
    if (bandTotal[b] === 0) continue;
    if (bandCorrect[b] / bandTotal[b] < 0.5) break;
    level = b;
  }
  return clampEstimate(level);
}


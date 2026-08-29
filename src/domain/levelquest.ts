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


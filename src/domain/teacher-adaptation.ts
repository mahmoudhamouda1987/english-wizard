import type { CEFRLevel, Skill } from "./learner";

export type TeachingMove = "explain" | "simplify" | "challenge" | "slow_down" | "speed_up" | "correct" | "review" | "move_on" | "ask_question" | "model";
export type HelpMode = "simpler_words" | "different_example" | "visual" | "step_by_step" | "arabic_support" | "real_life_example" | "compare_forms";

export interface InterestSignal {
  topic: string;
  score: number;
  source: "onboarding" | "choice" | "conversation" | "reading" | "writing" | "search";
  observedAt: string;
}

export interface LearnedInterest {
  topic: string;
  score: number;
  evidenceCount: number;
  lastObservedAt: string;
  breadthSuggestion?: string;
}

export interface TeachingContext {
  level: CEFRLevel;
  skill: Skill;
  score: number;
  confidence: number;
  errorCount: number;
  learnerAskedForHelp: boolean;
  repeatedFailure: boolean;
  strongPerformance: boolean;
  dailyMinutes: number;
}

export interface TeacherAdaptationDecision {
  move: TeachingMove;
  rationale: string;
  helpMode?: HelpMode;
  targetDifficultyDelta: -1 | 0 | 1;
  nextPrompt: string;
}

export interface ThinkingInEnglishStep {
  level: CEFRLevel;
  stage: "label" | "phrase" | "describe" | "retell" | "reason" | "argue" | "synthesise";
  prompt: string;
  target: string;
}

export function updateInterest(signals: InterestSignal[], now = new Date().toISOString()): LearnedInterest[] {
  const byTopic = new Map<string, LearnedInterest>();
  for (const signal of signals) {
    const key = signal.topic.trim().toLowerCase();
    if (!key) continue;
    const current = byTopic.get(key);
    const score = Math.min(100, (current?.score ?? 0) + signal.score);
    byTopic.set(key, {
      topic: signal.topic.trim(),
      score,
      evidenceCount: (current?.evidenceCount ?? 0) + 1,
      lastObservedAt: now,
      breadthSuggestion: score >= 70 ? `Broaden from ${signal.topic} to a related but unfamiliar topic.` : undefined,
    });
  }
  return [...byTopic.values()].sort((a,b)=>b.score-a.score);
}

export function chooseTeachingMove(ctx: TeachingContext): TeacherAdaptationDecision {
  if (ctx.learnerAskedForHelp) return { move:"simplify", rationale:"The learner explicitly signalled non-understanding.", helpMode:"different_example", targetDifficultyDelta:-1, nextPrompt:"Show this idea using a different, simpler example." };
  if (ctx.repeatedFailure) return { move:"review", rationale:"Repeated errors indicate that more retrieval and contrast are needed before advancement.", targetDifficultyDelta:-1, nextPrompt:"Let's review the key idea, practise it once, then try it in a new context." };
  if (ctx.strongPerformance && ctx.confidence >= 0.8) return { move:"challenge", rationale:"Strong performance with high confidence supports a controlled increase in difficulty.", targetDifficultyDelta:1, nextPrompt:"Now use the same capability in a less predictable situation." };
  if (ctx.errorCount > 0) return { move:"correct", rationale:"Recent errors should be addressed before adding unnecessary complexity.", targetDifficultyDelta:0, nextPrompt:"Let's fix the most important error, then retry the task." };
  return { move:"move_on", rationale:"Current evidence is adequate for the next activity.", targetDifficultyDelta:0, nextPrompt:"You're ready for the next step." };
}

export function explainDifferently(mode: HelpMode, target: string): string {
  const prefix = {
    simpler_words: "Use simpler words: ",
    different_example: "Use a different example: ",
    visual: "Turn it into a simple visual idea: ",
    step_by_step: "Explain it step by step: ",
    arabic_support: "Support the explanation briefly in Arabic: ",
    real_life_example: "Use a realistic everyday situation: ",
    compare_forms: "Compare the two forms directly: ",
  }[mode];
  return `${prefix}${target}`;
}

export function thinkingInEnglishPrompt(level: CEFRLevel): ThinkingInEnglishStep {
  if (level === "Pre-A1" || level === "A1") return { level, stage:"label", prompt:"Name three things you can see without translating.", target:"direct word retrieval" };
  if (level === "A2") return { level, stage:"describe", prompt:"Describe what is happening around you using short English phrases.", target:"phrase retrieval" };
  if (level === "B1") return { level, stage:"retell", prompt:"Retell a short event in English using your own words.", target:"connected production" };
  if (level === "B2") return { level, stage:"reason", prompt:"Explain why you would choose one option over another.", target:"reasoning in English" };
  if (level === "C1") return { level, stage:"argue", prompt:"Defend a position and qualify your claims.", target:"nuanced reasoning" };
  return { level:"C2", stage:"synthesise", prompt:"Synthesise two viewpoints and produce a precise conclusion.", target:"high-level spontaneous thought" };
}

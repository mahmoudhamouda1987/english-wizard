/**
 * Deterministic scene composer: builds 19 extra coherent, subtitled scenes per
 * lesson on top of its hand-written flagship scene, using curated exchange
 * pairs so every generated dialogue is natural at the lesson's CEFR band.
 */
import type { CEFRLevel } from "./learner";
import { EXCHANGE_PAIRS, SCENE_SETTINGS, CHARACTER_DUOS, type ExchangePair, type PairKind } from "./dialogue-bank";
import { MVP_LESSONS } from "./curriculum";
import type { LearningScene, SceneLine, SceneQuizItem } from "./scenes-types";

function h32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const RECIPES_LOW: PairKind[][] = [
  ["greet", "request", "price", "thanks"],
  ["greet", "name", "origin", "thanks"],
  ["greet", "help", "clarify", "thanks"],
];
const RECIPES_MID: PairKind[][] = [
  ...RECIPES_LOW,
  ["greet", "problem", "clarify", "thanks"],
  ["greet", "suggest", "help", "thanks"],
  ["request", "price", "problem", "thanks"],
];
const RECIPES_HIGH: PairKind[][] = [
  ...RECIPES_MID,
  ["opinion", "rebut", "suggest", "thanks"],
  ["greet", "opinion", "rebut", "clarify"],
  ["request", "clarify", "rebut", "thanks"],
];

function recipesFor(level: CEFRLevel): PairKind[][] {
  if (level === "Pre-A1" || level === "A1") return RECIPES_LOW;
  if (level === "A2" || level === "B1") return RECIPES_MID;
  return RECIPES_HIGH;
}

const PALETTES: Array<[string, string]> = [
  ["#eef4ff", "#dce7ff"],
  ["#fdf3e7", "#fae3c8"],
  ["#edfaf1", "#d6f2e0"],
  ["#f6effc", "#eadcf7"],
];

const PROPS = ["shopping basket", "train tickets", "notebook", "coffee cup", "phone screen", "shopping bag", "bus pass", "meeting notes"];

/** Picks one unused pair of the requested kind at the right level; falls back through a preference chain so recipes always complete. */
const FALLBACK_ORDER: PairKind[] = ["thanks", "clarify", "help", "request", "origin", "name", "greet", "problem", "suggest", "opinion", "rebut", "price"];
function pickPair(kind: PairKind, level: CEFRLevel, used: Set<ExchangePair>, seed: number): ExchangePair | undefined {
  const fits = (p: ExchangePair) => p.levels.includes(level) && !used.has(p);
  for (const candidateKind of [kind, ...FALLBACK_ORDER.filter((k) => k !== kind)]) {
    const tier = EXCHANGE_PAIRS.filter((p) => fits(p) && p.kind === candidateKind);
    if (tier.length > 0) return tier[seed % tier.length];
  }
  return undefined;
}

export function composedScenesForLesson(lessonId: string): LearningScene[] {
  const lesson = MVP_LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return [];
  const out: LearningScene[] = [];
  for (let n = 1; n <= 19; n++) {
    const seed = h32(`${lessonId}#${n}`);
    const recipe = recipesFor(lesson.level)[seed % recipesFor(lesson.level).length];
    const setting = SCENE_SETTINGS[h32(`${lessonId}set${n}`) % SCENE_SETTINGS.length];
    const duo = CHARACTER_DUOS[h32(`${lessonId}duo${n}`) % CHARACTER_DUOS.length];
    const used = new Set<ExchangePair>();
    const pairs: ExchangePair[] = [];
    let fallbackSeed = seed;
    for (const kind of recipe) {
      const pair = pickPair(kind, lesson.level, used, h32(`${lessonId}${kind}${n}`));
      if (pair) {
        used.add(pair);
        pairs.push(pair);
      } else {
        const any = pickPair("thanks", lesson.level, used, fallbackSeed++);
        if (any) {
          used.add(any);
          pairs.push(any);
        }
      }
    }
    if (pairs.length < 3) continue;
    const lines: SceneLine[] = [];
    pairs.forEach((p, i) => {
      lines.push({ speaker: i % 2 === 0 ? "a" : "b", text: p.a.text, ar: p.a.ar });
      lines.push({ speaker: i % 2 === 0 ? "b" : "a", text: p.b.text, ar: p.b.ar });
    });
    const quiz: SceneQuizItem[] = [];
    const mid = Math.floor(lines.length / 2);
    const midSpeakerName = lines[mid].speaker === "a" ? duo.a.name : duo.b.name;
    const namePool = CHARACTER_DUOS.flatMap((d) => [d.a.name, d.b.name]).filter((n) => n !== duo.a.name && n !== duo.b.name);
    const decoy = namePool[h32(`${lessonId}dn${n}`) % namePool.length];
    quiz.push({ q: `Who says: “${lines[mid].text}”?`, choices: [duo.a.name, duo.b.name, decoy], answer: midSpeakerName === duo.a.name ? 0 : 1 });
    const otherTexts = lines.map((l) => l.text).filter((t) => t !== lines[1].text && t !== lines[0].text);
    quiz.push({
      q: `What comes right after: “${lines[0].text}”?`,
      choices: [lines[1].text, otherTexts[0] ?? lines[2].text, otherTexts[1] ?? lines[3].text],
      answer: 0,
    });
    const lastAr = lines[lines.length - 1].ar;
    const wrongEn = lines.map((l) => l.text).filter((t) => t !== lines[lines.length - 1].text);
    quiz.push({ q: `Which line means “${lastAr}” in English?`, choices: [lines[lines.length - 1].text, wrongEn[0], wrongEn[1]], answer: 0 });
    out.push({
      id: `${lessonId}-s${String(n).padStart(2, "0")}`,
      lessonIds: [lessonId],
      title: `${setting.label.replace(/^./, (c) => c.toUpperCase())} · ${n + 1}/20`,
      levels: [lesson.level],
      topics: [lesson.skill, lesson.title.split(":")[0].trim().toLowerCase()],
      setting: setting.label,
      prop: PROPS[h32(`${lessonId}prop${n}`) % PROPS.length],
      palette: PALETTES[n % PALETTES.length],
      characters: duo,
      lines,
      quiz,
    });
  }
  return out;
}

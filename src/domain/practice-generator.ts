/**
 * Deterministic exercise generator: multiplies every lesson's practice set using
 * in-platform data (chunks, glossary vocab, scenes, lesson bodies), always drawn
 * from the lesson's own level band so difficulty rises with CEFR elevation.
 */
import { LEARNING_CHUNKS } from "./chunks";
import { LESSON_BODIES } from "./lesson-bodies";
import { LESSON_MATERIALS } from "./lesson-materials";
import { sceneForLesson } from "./scenes";
import { MVP_LESSONS } from "./curriculum";
import type { MaterialExercise } from "./lesson-materials-a";
import type { CommunicationFunction } from "./chunks";

const FUNCTION_LABELS: Record<CommunicationFunction, string> = {
  INTRODUCE: "introduce yourself or someone else",
  ASK_FOR_INFORMATION: "ask politely for information",
  CLARIFY: "check or clarify what was said",
  AGREE_DISAGREE: "agree or disagree with someone",
  GIVE_OPINION: "give your opinion",
  SUGGEST: "make a suggestion",
  PERSUADE: "persuade someone gently",
  NEGOTIATE: "negotiate terms or conditions",
  SUMMARISE: "summarise what has been said",
  MEDIATE: "mediate between two sides",
};

const LEVEL_ORDER = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

function levelIndex(level: string): number {
  const i = LEVEL_ORDER.indexOf(level as (typeof LEVEL_ORDER)[number]);
  return i < 0 ? 3 : i;
}

/** Deterministic pseudo-shuffle so rounds are stable across reloads. */
function seeded(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickOthers<T>(pool: T[], exclude: (t: T) => boolean, n: number, seed: number): T[] {
  return pool.filter((t) => !exclude(t)).filter((_, i) => (i * 7 + seed) % pool.length < pool.length).slice(0, n);
}

function rotateChoices(correct: number, choices: string[], seed: number): { choices: string[]; answer: number } {
  const shift = seed % choices.length;
  const rotated = [...choices.slice(shift), ...choices.slice(0, shift)];
  return { choices: rotated, answer: (correct - shift + choices.length * 4) % choices.length };
}

export function generatedExercises(lessonId: string): MaterialExercise[] {
  const lesson = MVP_LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return [];
  const li = levelIndex(lesson.level);
  const nearLevels = new Set([LEVEL_ORDER[li], LEVEL_ORDER[li - 1], LEVEL_ORDER[li + 1]].filter(Boolean));
  const chunks = LEARNING_CHUNKS.filter((c) => nearLevels.has(c.level as (typeof LEVEL_ORDER)[number]));
  const allChunkTexts = LEARNING_CHUNKS.map((c) => c.text);
  const out: MaterialExercise[] = [];
  const seenQ = new Set<string>();
  const pushEx = (ex: MaterialExercise) => { if (seenQ.has(ex.q)) return; seenQ.add(ex.q); out.push(ex); };

  // 1. Variant match — which means the same?
  for (let i = 0; i < Math.min(chunks.length, 3); i++) {
    const c = chunks[(i * 5 + seeded(lessonId)) % chunks.length];
    const variant = c.variants?.[0];
    if (!variant || variant === c.text) continue;
    const distractors = pickOthers(allChunkTexts, (t) => t === c.text || t === variant, 2, seeded(c.id));
    if (distractors.length < 2) continue;
    const r = rotateChoices(0, [variant, ...distractors], seeded(variant));
    pushEx({ q: `Which phrase means the same as “${c.text}”?`, choices: r.choices, answer: r.answer });
  }

  // 2. Gap-fill — blank the key word of a chunk.
  for (let i = 0; i < Math.min(chunks.length, 3); i++) {
    const c = chunks[(i * 11 + 3) % chunks.length];
    const words = c.text.replace(/[.,!?…]/g, "").split(" ").filter((w) => w.length >= 4 && /^[A-Za-z']+$/.test(w));
    if (!words.length) continue;
    const key = words.sort((a, b) => b.length - a.length)[0];
    if (!key) continue;
    const otherWords = LEARNING_CHUNKS
      .filter((o) => o.id !== c.id && o.level === c.level)
      .map((o) => o.text.replace(/[.,!?…]/g, "").split(" "))
      .flat()
      .filter((w) => /^[A-Za-z']+$/.test(w) && w !== key && Math.abs(w.length - key.length) <= 2);
    const uniq = [...new Set(otherWords)];
    if (uniq.length < 2) continue;
    const s = seeded(key + c.id);
    const d1 = uniq[s % uniq.length];
    const d2 = uniq[(s * 7 + 3) % uniq.length];
    if (d1 === d2) continue;
    const gapped = c.text.replace(key, "______");
    const r = rotateChoices(0, [key, d1, d2], s);
    pushEx({ q: `Complete the chunk: “${gapped}”`, choices: r.choices, answer: r.answer });
  }

  // 3. Function match — when do you say this?
  for (let i = 0; i < Math.min(chunks.length, 2); i++) {
    const c = chunks[(i * 13 + 7) % chunks.length];
    const fn = c.functions?.[0] as CommunicationFunction | undefined;
    if (!fn || !FUNCTION_LABELS[fn]) continue;
    const wrongFns = (Object.keys(FUNCTION_LABELS) as CommunicationFunction[]).filter((f) => f !== fn);
    const s = seeded(fn + c.id);
    const w1 = wrongFns[s % wrongFns.length];
    let w2 = wrongFns[(s + 5) % wrongFns.length];
    if (w2 === w1) w2 = wrongFns[(s + 1) % wrongFns.length];
    const r = rotateChoices(0, [FUNCTION_LABELS[fn], FUNCTION_LABELS[w1], FUNCTION_LABELS[w2]], s);
    pushEx({ q: `You hear: “${c.text}”. The speaker wants to…`, choices: r.choices, answer: r.answer });
  }

  // 4–5. Vocabulary matches from this lesson's own glossary set.
  const mats = LESSON_MATERIALS[lessonId];
  if (mats && mats.vocab.length >= 3) {
    const v = mats.vocab;
    for (let i = 0; i < Math.min(v.length, 3); i++) {
      const w = v[(i * 3 + 1) % v.length];
      const others = [v[(i * 3 + 2) % v.length], v[(i * 3 + 3) % v.length]];
      if (others.some((o) => o.word === w.word)) continue;
      const r = rotateChoices(0, [w.ar, others[0].ar, others[1].ar], seeded(w.word));
      pushEx({ q: `Which word means “${w.ar}” in English?`, choices: r.choices.map((c) => {
        const found = v.find((x) => x.ar === c);
        return found ? found.word : c;
      }), answer: r.answer });
    }
    const withEn = v.filter((w) => w.en);
    for (let i = 0; i < Math.min(withEn.length, 2); i++) {
      const w = withEn[i];
      const others = v.filter((o) => o.word !== w.word).slice(i % Math.max(1, v.length - 2));
      if (others.length < 2) continue;
      const r = rotateChoices(0, [w.word, others[0].word, others[1].word], seeded(w.en!));
      pushEx({ q: `${w.en} — which word is it?`, choices: r.choices, answer: r.answer });
    }
    // Word → Arabic direction.
    for (let i = 0; i < Math.min(v.length, 3); i++) {
      const w = v[i];
      const o1 = v[(i + 1) % v.length];
      const o2 = v[(i + 2) % v.length];
      if (o1.ar === w.ar || o2.ar === w.ar) continue;
      const r = rotateChoices(0, [w.ar, o1.ar, o2.ar], seeded("w2a:" + w.word));
      pushEx({ q: `Which matches “${w.word}”?`, choices: r.choices, answer: r.answer });
    }
  }

  // 6–7. Scene comprehension: who said it + what comes next + Arabic meaning match.
  const scene = sceneForLesson(lesson);
  if (scene && scene.lines.length >= 6) {
    const s = seeded(scene.id);
    const lineIdx = s % (scene.lines.length - 1);
    const line = scene.lines[lineIdx];
    const nextLine = scene.lines[lineIdx + 1];
    if (line.speaker === "a") {
      pushEx({ q: `In the scene “${scene.title}”, who says: “${line.text}”?`, choices: [scene.characters.a.name, scene.characters.b.name, "Both of them"], answer: 0 });
    } else {
      pushEx({ q: `In the scene “${scene.title}”, who says: “${line.text}”?`, choices: [scene.characters.b.name, scene.characters.a.name, "Both of them"], answer: 0 });
    }
    const later = scene.lines.filter((l, i) => i > lineIdx + 1);
    const alt = later.length ? later[later.length > 1 ? 1 : 0].text : scene.lines[0].text;
    const r = rotateChoices(0, [nextLine.text, alt, scene.lines[0].text].filter((t, i, arr) => arr.indexOf(t) === i), s + lineIdx);
    if (r.choices.length === 3) {
      pushEx({ q: `In the scene “${scene.title}”, what comes right after: “${line.text}”?`, choices: r.choices, answer: r.answer });
    }
    // Match the line to its Arabic meaning.
    for (let k = 0; k < Math.min(scene.lines.length - 2, 2); k++) {
      const idx2 = (k * 4 + s) % (scene.lines.length - 1);
      const target = scene.lines[idx2];
      const others = scene.lines.filter((l) => l !== target).map((l) => l.ar).filter((ar, i, arr) => arr.indexOf(ar) === i);
      if (others.length < 2 || others[0] === target.ar || others[1] === target.ar) continue;
      const r2 = rotateChoices(0, [target.ar, others[0], others[1]], s + idx2 * 3);
      if (new Set(r2.choices.map((c) => c.slice(0, 12))).size < 3) continue;
      pushEx({ q: `What does this line from “${scene.title}” mean? “${target.text}”`, choices: r2.choices, answer: r2.answer });
    }
  }

  // 8. Fix-the-mistake from this lesson's common mistakes list (up to two).
  const body = LESSON_BODIES[lessonId];
  if (body) {
    let added = 0;
    for (const mistake of body.commonMistakes) {
      if (added >= 2) break;
      const m = mistake.match(/(.{3,60}?) instead of (.+)/i);
      if (!m) continue;
      const wrong = m[1].replace(/^["“]|["”]$/g, "").trim().replace(/^(saying|using|writing)\s+/i, "");
      const right = m[2].replace(/["“”]/g, "").replace(/\s+—.*$/, "").replace(/\.$/, "").trim();
      if (!right || right.length > 60) continue;
      if (right.toLowerCase() === wrong.toLowerCase()) continue;
      pushEx({ q: `Which is correct in standard English?`, choices: [right, wrong, `Both are equally correct`], answer: 0 });
      added++;
    }
  }

  // 9. Floor guarantee: keep the set rich even when pools are small.
  const vAll = LESSON_MATERIALS[lessonId]?.vocab ?? [];
  const authoredCount = LESSON_MATERIALS[lessonId]?.exercises.length ?? 0;
  const floorTarget = Math.max(12, 15 - authoredCount);
  if (vAll.length >= 3) {
    for (let k = 0; k < vAll.length * 3 && out.length < floorTarget; k++) {
      const w = vAll[k % vAll.length];
      const o1 = vAll[(k + 1) % vAll.length];
      const o2 = vAll[(k + 2) % vAll.length];
      const q = `Which matches “${w.word}”?`;
      if (seenQ.has(q) || o1.ar === w.ar || o2.ar === w.ar) continue;
      const r = rotateChoices(0, [w.ar, o1.ar, o2.ar], seeded("floor:" + w.word + k));
      out.push({ q, choices: r.choices, answer: r.answer });
      seenQ.add(q);
    }
  }

  // 10. Scene-meaning top-up: guarantee the floor using the lesson's own scene.
  if (out.length < floorTarget && scene && scene.lines.length >= 4) {
    const arPool = scene.lines.map((l) => l.ar);
    for (let i = 0; i < scene.lines.length && out.length < floorTarget; i++) {
      const target = scene.lines[i];
      const others = arPool.filter((ar) => ar !== target.ar);
      if (others.length < 2) continue;
      const q = `What does this line from “${scene.title}” mean? “${target.text}”`;
      if (seenQ.has(q)) continue;
      const r = rotateChoices(0, [target.ar, others[0], others[1]], seeded("scenetop:" + target.text));
      if (new Set(r.choices.map((c) => c.slice(0, 12))).size < 3) continue;
      out.push({ q, choices: r.choices, answer: r.answer });
      seenQ.add(q);
    }
  }

  return out;
}

/** Hand-authored core exercises + generated expansion, de-duplicated by question text. */
export function practiceForLesson(lessonId: string): MaterialExercise[] {
  const authored = LESSON_MATERIALS[lessonId]?.exercises ?? [];
  const generated = generatedExercises(lessonId);
  const seen = new Set(authored.map((e) => e.q.toLowerCase()));
  const merged = [...authored];
  for (const ex of generated) {
    const key = ex.q.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(ex);
  }
  return merged;
}

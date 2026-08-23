/**
 * Teaching bodies for all 28 curriculum lessons, synthesised directly from the
 * 150-topic master library: explanations come from topic purposes and grammar
 * foci, examples come from each topic's CEFR ladder, common mistakes come from
 * each topic's documented pitfall.
 */
import { LESSON_TOPIC_MAP, LIFE_TOPICS, rungForLevel } from "./topics";
import { MVP_LESSONS } from "./curriculum";
import type { Topic150 } from "./topics150-a";

export interface LessonBody {
  explanation: string;
  examples: string[];
  commonMistakes: string[];
  tip: string;
}

const SKILL_TIPS: Record<string, string> = {
  speaking: "Say every example out loud twice before you move on — your mouth learns like your memory does.",
  listening: "Replay once for the gist, once for detail. Two passes beat one anxious stare.",
  reading: "Read once fast for the main idea, then again slowly for detail.",
  writing: "Draft short, check verbs, then extend. Short correct sentences grow into long good ones.",
  vocabulary: "Learn phrases, not single words — chunks survive pressure.",
  grammar: "Practise one structure until it is automatic before adding another.",
  pronunciation: "Copy rhythm and stress, not just sounds — English runs on stress.",
  mediation: "Switch roles and registers deliberately: same message, different audience.",
};

const LEVEL_ORDER = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

function bodyForLesson(lessonId: string): LessonBody | undefined {
  const lesson = MVP_LESSONS.find((l) => l.id === lessonId);
  const topicIds = LESSON_TOPIC_MAP[lessonId];
  if (!lesson || !topicIds?.length) return undefined;
  const topics = topicIds.map((id) => LIFE_TOPICS.find((t) => t.id === id)).filter((t): t is Topic150 => Boolean(t));
  const li = LEVEL_ORDER.indexOf(lesson.level);

  const explanation =
    `This lesson covers ${topics.length} connected themes: ${topics.map((t) => t.title.toLowerCase()).join(", ")}. ` +
    `You will practise them at ${lesson.level} level through ${lesson.mission.charAt(0).toLowerCase()}${lesson.mission.slice(1)} ` +
    `Key language includes ${topics.flatMap((t) => t.grammar).slice(0, 4).join(", ")}.`;

  const examples: string[] = [];
  const seenExample = new Set<string>();
  for (const topic of topics) {
    for (const delta of [0, 1]) {
      const targetLevel = LEVEL_ORDER[Math.max(0, Math.min(6, li + delta))];
      const rung = rungForLevel(topic.id, targetLevel);
      if (!rung) continue;
      const clean = rung.example.trim();
      const wordCount = clean.split(/\s+/).length;
      if (clean.length >= 8 && clean.length <= 180 && wordCount >= 3 && !seenExample.has(clean.toLowerCase())) {
        seenExample.add(clean.toLowerCase());
        examples.push(clean);
      }
    }
  }

  const commonMistakes = topics.map((t) => t.pitfall);

  return {
    explanation,
    examples,
    commonMistakes,
    tip: SKILL_TIPS[lesson.skill] ?? SKILL_TIPS.speaking,
  };
}

export const LESSON_BODIES: Record<string, LessonBody> = Object.fromEntries(
  MVP_LESSONS.map((lesson) => [lesson.id, bodyForLesson(lesson.id)]).filter(([, body]) => Boolean(body)),
) as Record<string, LessonBody>;

export function lessonBody(lessonId: string): LessonBody | undefined {
  return LESSON_BODIES[lessonId];
}

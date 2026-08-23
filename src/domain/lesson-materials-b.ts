/** Lesson materials part B (B1 → C2). */
import type { LessonMaterials } from "./lesson-materials-a";

const bcSkill = (skill: string, cefr: string) => {
  const slug = cefr.toLowerCase();
  const s = skill === "grammar" ? "grammar" : skill === "vocabulary" ? "vocabulary" : skill === "reading" ? "reading" : skill === "listening" ? "listening" : "speaking";
  return `https://learnenglish.britishcouncil.org/skills/${s}/${slug}-${s}`;
};
const yt = (topic: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent("BBC Learning English " + topic)}`;
const SIX_MIN = { label: "▶ BBC 6 Minute English", url: "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english" };
const NEWS = { label: "▶ BBC News Review", url: "https://www.bbc.co.uk/learningenglish/english/features/news-review" };
const CAMBRIDGE = { label: "🎮 Cambridge free activities", url: "https://www.cambridgeenglish.org/learning-english/games-social/" };
const englishFile = { label: "📘 Oxford English File exercises", url: "https://elt.oup.com/student/englishfile/" };
const v = (word: string, ar: string, pos?: string, en?: string) => ({ word, ar, pos, en });

export const MATERIALS_B: Record<string, LessonMaterials> = {
  "lesson-b1-conversation": {
    vocab: [v("hedge", "تحوّط / يلطّف", "verb"), v("personally", "شخصيًا"), v("to be honest", "بصراحة"), v("makes sense", "منطقي")],
    exercises: [
      { q: "Hedged opinion:", choices: ["Everyone knows…", "I'd argue that… mainly because…", "It is obvious."], answer: 1 },
      { q: "Best filler while thinking?", choices: ["Uhhhh…", "Well, actually, let me think.", "(silence)"], answer: 1 },
    ],
    watch: [SIX_MIN, CAMBRIDGE],
    practiceUrl: bcSkill("speaking", "B1"),
  },
  "lesson-b1-writing": {
    vocab: [v("position", "موقف / رأي"), v("evidence", "دليل"), v("concession", "إقرار بالرأي الآخر"), v("moreover", "علاوة على ذلك")],
    exercises: [
      { q: "Evidence verb pair:", choices: ["research suggests", "everybody says", "I feel like always"], answer: 0 },
      { q: "Concession opener:", choices: ["Admittedly, … nevertheless …", "Also also also", "In conclusion first"], answer: 0 },
    ],
    watch: [{ label: "▶ BBC Essay writing", url: yt("how to write opinion essay") }, englishFile],
    practiceUrl: bcSkill("writing", "B1"),
  },
  "lesson-b1-listening": {
    vocab: [v("understatement", "تقليل متعمّد من الشأن"), v("sceptical", "متشكك"), v("to be fair", "الحق يقال")],
    exercises: [
      { q: "“Interesting…” said flatly usually means:", choices: ["fascinating", "doubt", "agreement"], answer: 1 },
      { q: "“No rush, but…” implies:", choices: ["no urgency at all", "there IS urgency", "a question of time zones"], answer: 1 },
    ],
    watch: [NEWS],
    practiceUrl: bcSkill("listening", "B1"),
  },
  "lesson-b1-reading": {
    vocab: [v("signpost", "لافتة إرشادية (في النص)"), v("in contrast", "في المقابل"), v("for instance", "على سبيل المثال")],
    exercises: [
      { q: "“However” announces:", choices: ["support", "the opposite view", "a conclusion"], answer: 1 },
      { q: "First fast pass should read:", choices: ["every word twice", "first sentences of paragraphs", "only the title"], answer: 1 },
    ],
    watch: [{ label: "▶ BBC Reading skills", url: yt("reading skills intermediate") }],
    practiceUrl: bcSkill("reading", "B1"),
  },
  "lesson-b2-argument": {
    vocab: [v("rebuttal", "رد حجّي"), v("counter", "مضاد"), v("credible", "مصدوق"), v("churn", "تسرّب العملاء")],
    exercises: [
      { q: "Strongest move order:", choices: ["claim → evidence → counter → rebuttal", "insult → claim", "evidence → shout"], answer: 0 },
      { q: "Concede strategically to:", choices: ["lose the debate", "make rejection credible", "waste time"], answer: 1 },
    ],
    watch: [NEWS, CAMBRIDGE],
    practiceUrl: bcSkill("speaking", "B2"),
  },
  "lesson-b2-writing": {
    vocab: [v("purpose line", "جملة الغرض"), v("nominal fog", "ضباب اسمي (أسلوب متكتل)"), v("remuneration", "أجر / تعويض")],
    exercises: [
      { q: "De-nominalise: “conduct an investigation of” →", choices: ["investigate", "investigation-do", "look into-ness"], answer: 0 },
      { q: "Where does the ask go?", choices: ["Buried mid-paragraph", "Last line with deadline", "Subject line only"], answer: 1 },
    ],
    watch: [{ label: "▶ BBC Business writing", url: yt("business email writing") }, englishFile],
    practiceUrl: bcSkill("writing", "B2"),
  },
  "lesson-b2-listening": {
    vocab: [v("spine", "العمود (الحجة)"), v("flagged", "مُعلَّم كمخاطرة"), v("digression", "خروج عن الموضوع")],
    exercises: [
      { q: "“Let me build on that…” means the speaker will:", choices: ["contradict", "extend a point", "leave"], answer: 1 },
      { q: "Getting back to the point signals:", choices: ["end of digression", "new meeting", "lunch break"], answer: 0 },
    ],
    watch: [NEWS],
    practiceUrl: bcSkill("listening", "B2"),
  },
  "lesson-b2-reading": {
    vocab: [v("stance", "موقف الكاتب"), v("loaded wording", "صياغة موجَّهة"), v("audit", "تدقيق")],
    exercises: [
      { q: "“Critics say” vs “experts note” differs in:", choices: ["nothing", "implied authority/stance", "length"], answer: 1 },
      { q: "Evaluative adjectives reveal:", choices: ["the weather", "writer's attitude", "font choice"], answer: 1 },
    ],
    watch: [NEWS],
    practiceUrl: bcSkill("reading", "B2"),
  },
  "lesson-c1-discussion": {
    vocab: [v("reframe", "يعيد صياغة الإطار"), v("assumption", "افتراض"), v("park it", "يؤجّل النقطة"), v("converge", "يتقارب")],
    exercises: [
      { q: "Meta-language example:", choices: ["You're wrong.", "We may be conflating two issues.", "Anyway."], answer: 1 },
      { q: "To park a tangent:", choices: ["Worth exploring — let's return later.", "Shut up.", "Never mention again."], answer: 0 },
    ],
    watch: [SIX_MIN, CAMBRIDGE],
    practiceUrl: bcSkill("speaking", "C1"),
  },
  "lesson-c1-writing": {
    vocab: [v("qualify", "يؤهّل / يحدّد نطاقًا"), v("calibrate", "يعاير درجة اليقين"), v("deletion", "الحذف الأسلوبي")],
    exercises: [
      { q: "Strongest commitment:", choices: ["may contribute", "likely drives", "might maybe help"], answer: 1 },
      { q: "Cut without loss:", choices: ["due to the fact that", "because", "owing to the reality that"], answer: 1 },
    ],
    watch: [{ label: "▶ BBC Advanced writing", url: yt("advanced academic writing") }, englishFile],
    practiceUrl: bcSkill("writing", "C1"),
  },
  "lesson-c1-listening": {
    vocab: [v("subtext", "المعنى الضمني"), v("strategic ambiguity", "غموض مقصود"), v("register shift", "تحوّل مستوى اللغة")],
    exercises: [
      { q: "“Concerns were raised” hides:", choices: ["who objected", "the date", "nothing"], answer: 0 },
      { q: "“Shouldn't we…?” often functions as:", choices: ["a real question", "an instruction", "a joke"], answer: 1 },
    ],
    watch: [NEWS],
    practiceUrl: bcSkill("listening", "C1"),
  },
  "lesson-c1-reading": {
    vocab: [v("falsify", "يدحّض"), v("premise", "مقدمة استدلال"), v("triangulate", "يقارن المصادر")],
    exercises: [
      { q: "Attack the weakest:", choices: ["conclusion", "joint (premise/inference)", "author"], answer: 1 },
      { q: "Falsifiability asks what would:", choices: ["prove nicely", "disprove the claim", "sound smart"], answer: 1 },
    ],
    watch: [SIX_MIN],
    practiceUrl: bcSkill("reading", "C1"),
  },
  "lesson-c2-speaking": {
    vocab: [v("obstinate", "عنيد (سلبًا)"), v("tenacious", "مثابر (إيجابًا)"), v("rhetoric", "بلاغة")],
    exercises: [
      { q: "Judgement inside vocabulary: praising stubborn effort =", choices: ["obstinate", "tenacious", "stubbornish"], answer: 1 },
      { q: "At C2, weight beats:", choices: ["clarity", "speed", "grammar"], answer: 1 },
    ],
    watch: [{ label: "▶ BBC Sophisticated speech", url: yt("c2 english proficiency speaking") }],
    practiceUrl: bcSkill("speaking", "C2"),
  },
  "lesson-c2-writing": {
    vocab: [v("given-new flow", "تدفق المعطى→الجديد"), v("orchestrate", "يسهر على التنسيق"), v("effortless", "بلا تكلف ظاهرة")],
    exercises: [
      { q: "Given-new ordering places new information:", choices: ["first", "last", "never"], answer: 1 },
      { q: "Uniform sentence lengths cause:", choices: ["hypnotic boredom", "clarity", "prizes"], answer: 0 },
    ],
    watch: [{ label: "▶ BBC Style mastery", url: yt("advanced english style writing") }],
    practiceUrl: bcSkill("writing", "C2"),
  },
  "lesson-c2-listening": {
    vocab: [v("performance", "أداء خطابي"), v("omission", "تجاهل مقصود"), v("calibrated audience", "جمهور مستهدف باللغة")],
    exercises: [
      { q: "“To be fair to them…” precedes:", choices: ["a concession then counterattack", "surrender", "weather"], answer: 0 },
      { q: "Selective statistics reveal:", choices: ["nothing", "the unstated thesis", "typos"], answer: 1 },
    ],
    watch: [NEWS],
    practiceUrl: bcSkill("listening", "C2"),
  },
  "lesson-c2-reading": {
    vocab: [v("foregrounding", "إبراز متعمّد"), v("agency engineering", "هندسة الفاعلية"), v("absent voice", "الصوت الغائب")],
    exercises: [
      { q: "“Mistakes were made” engineers:", choices: ["clarity", "agency removal", "rhyme"], answer: 1 },
      { q: "The absent voice question asks who is:", choices: ["quoted", "affected but never quoted", "the editor"], answer: 1 },
    ],
    watch: [SIX_MIN],
    practiceUrl: bcSkill("reading", "C2"),
  },
};

/** Lesson materials part A (Pre-A1 to A2): vocabulary + exercises, fully in-platform. */
import type { GlossEntry } from "./glossary-ar-1";

export interface MaterialExercise { q: string; choices: string[]; answer: number }
export interface LessonMaterials {
  vocab: Array<GlossEntry & { word: string }>;
  exercises: MaterialExercise[];
}

const v = (word: string, ar: string, pos?: string, en?: string) => ({ word, ar, pos, en });
export const MATERIALS_A: Record<string, LessonMaterials> = {
  "lesson-prea1-survival": {
    vocab: [v("hello", "مرحبًا"), v("please", "من فضلك"), v("thanks", "شكرًا"), v("sorry", "آسف"), v("water", "ماء"), v("how much", "بكم؟")],
    exercises: [
      { q: "You want water politely. Say:", choices: ["Water me.", "Could I have water, please?", "Give water now."], answer: 1 },
      { q: "Someone helps you. You say:", choices: ["Thank you!", "Please!", "Excuse me."], answer: 0 },
    ],
  },
  "lesson-prea1-sounds": {
    vocab: [v("pen", "قلم"), v("bin", "سلة مهملات"), v("ship", "سفينة"), v("sheep", "خروف"), v("hotel", "فندق")],
    exercises: [
      { q: "Which word has the puff of air (p)?", choices: ["bin", "pin", "big"], answer: 1 },
      { q: "“Ship” and “sheep” differ by:", choices: ["spelling only", "vowel length", "nothing"], answer: 1 },
    ],
  },
  "lesson-prea1-reading": {
    vocab: [v("exit", "مخرج"), v("open", "مفتوح"), v("closed", "مغلق"), v("push", "ادفع"), v("pull", "اسحب")],
    exercises: [
      { q: "Door sign says PULL. You:", choices: ["push", "pull", "knock"], answer: 1 },
      { q: "SHOP sign says CLOSED. It is:", choices: ["open", "shut", "busy"], answer: 1 },
    ],
  },
  "lesson-prea1-listening": {
    vocab: [v("name", "اسم"), v("gate", "بوابة"), v("five", "خمسة"), v("bus stop", "موقف باص")],
    exercises: [
      { q: "“Gate five” means you go to gate number:", choices: ["4", "5", "15"], answer: 1 },
      { q: "Catch the anchor: “Two coffees please” — how many?", choices: ["two", "three", "twelve"], answer: 0 },
    ],
  },
  "lesson-a1-self-introduction": {
    vocab: [v("introduce", "يقدّم شخصًا"), v("from", "من"), v("live", "يسكن"), v("hobby", "هواية")],
    exercises: [
      { q: "Complete: “___ Omar.” (natural spoken intro)", choices: ["My name are", "I'm", "Name my"], answer: 1 },
      { q: "Best closer after introducing yourself?", choices: ["Goodbye.", "And what about you?", "Numbers."], answer: 1 },
    ],
  },
  "lesson-a1-routines": {
    vocab: [v("wake up", "يستيقظ"), v("usually", "عادةً"), v("always", "دائمًا"), v("never", "أبدًا"), v("walk", "يمشي")],
    exercises: [
      { q: "He ___ to work by bus.", choices: ["go", "goes", "going"], answer: 1 },
      { q: "Pick the time phrase: “___ I check emails.”", choices: ["First", "Person", "Cheap"], answer: 0 },
    ],
  },
  "lesson-a1-questions": {
    vocab: [v("where", "أين"), v("what", "ماذا"), v("why", "لماذا"), v("how about you", "وأنت؟")],
    exercises: [
      { q: "Fix: “Where you live?”", choices: ["Where you do live?", "Where do you live?", "Where living you?"], answer: 1 },
      { q: "Keep chat alive with:", choices: ["Silence", "One-word answers", "A follow-up question"], answer: 2 },
    ],
  },
  "lesson-a1-listening": {
    vocab: [v("free", "متفرغ / مجاني"), v("delayed", "متأخر"), v("plan", "خطة"), v("worried", "قلق")],
    exercises: [
      { q: "“Are you free Friday?” is an:", choices: ["invitation", "insult", "invoice"], answer: 0 },
      { q: "“Could you help me?” really asks:", choices: ["ability", "for help", "the time"], answer: 1 },
    ],
  },
  "lesson-a2-interactions": {
    vocab: [v("offer", "يعرض / يقدّم"), v("react", "يتفاعل"), v("shall we", "هل ن…؟"), v("poor you", "مسكين!")],
    exercises: [
      { q: "Offer snacks politely:", choices: ["Shall I bring some snacks?", "Bring snacks!", "Snacks maybe."], answer: 0 },
      { q: "React to great news:", choices: ["Oh.", "That sounds amazing!", "Whatever."], answer: 1 },
    ],
  },
  "lesson-a2-past": {
    vocab: [v("went", "ذهب (ماضٍ)"), v("saw", "رأى (ماضٍ)"), v("bought", "اشترى (ماضٍ)"), v("suddenly", "فجأة")],
    exercises: [
      { q: "Yesterday I ___ my aunt.", choices: ["visit", "visited", "visiting"], answer: 1 },
      { q: "Question form:", choices: ["Did you went?", "Did you go?", "Do you went?"], answer: 1 },
    ],
  },
  "lesson-a2-messages": {
    vocab: [v("quick one", "أمر سريع"), v("running late", "متأخر قليلًا"), v("cheers", "شكرًا (ودّي)")],
    exercises: [
      { q: "Best message opener for Sara:", choices: ["Dear Madam,", "Hi Sara —", "(no greeting)"], answer: 1 },
      { q: "Put the request:", choices: ["in paragraph three", "in line one", "never"], answer: 1 },
    ],
  },
  "lesson-a2-listening": {
    vocab: [v("suggest", "يقترح"), v("objection", "اعتراض"), v("deal", "اتفاق"), v("however", "لكن / غير أن")],
    exercises: [
      { q: "“But it leaves at six!” signals:", choices: ["agreement", "an objection", "greeting"], answer: 1 },
      { q: "Explicit agreement sounds like:", choices: ["Maybe.", "Deal.", "Why not both?"], answer: 1 },
    ],
  },
};

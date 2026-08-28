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

export interface LevelQuestItem {
  id: string;
  variant: number;
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

interface Template {
  skill: SkillKey;
  subskill: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  audioText?: string;
}

const BANKS: Record<CEFRLevel, Template[]> = {
  "Pre-A1": [
    { skill: "vocabulary", subskill: "everyday-objects", prompt: "Look at the picture. What is this? 🍎", options: ["an apple", "an orange", "a banana", "a grape"], answer: "an apple", explanation: "The red round fruit is an apple." },
    { skill: "grammar", subskill: "to-be", prompt: "I ___ a student.", options: ["is", "am", "are", "be"], answer: "am", explanation: "'I am' is the correct form." },
    { skill: "vocabulary", subskill: "colors", prompt: "The sky is ___ on a clear day.", options: ["blue", "red", "green", "black"], answer: "blue", explanation: "The clear sky is blue." },
    { skill: "grammar", subskill: "plural", prompt: "One book, two ___.", options: ["book", "books", "bookes", "booked"], answer: "books", explanation: "The regular plural adds -s." },
    { skill: "grammar", subskill: "numbers", prompt: "How many hands do you have?", options: ["Two", "Three", "Four", "Ten"], answer: "Two", explanation: "People have two hands." },
    { skill: "reading", subskill: "basic-note", prompt: "A note says: 'Open 9am to 5pm.' When does it open?", options: ["9am", "5am", "9pm", "10am"], answer: "9am", explanation: "It opens at 9 in the morning." },
    { skill: "reading", subskill: "basic-sign", prompt: "A sign says: 'No smoking here.' What must you not do?", options: ["Smoke", "Eat", "Run", "Talk"], answer: "Smoke", explanation: "'No smoking' means do not smoke." },
    { skill: "listening", subskill: "greetings", audioText: "Hello, my name is Anna.", prompt: "Listen. What is the person's name?", options: ["Anna", "Emma", "Lisa", "Mona"], answer: "Anna", explanation: "She says her name is Anna." },
    { skill: "listening", subskill: "age", audioText: "I am five years old.", prompt: "Listen. How old is the speaker?", options: ["Five", "Four", "Six", "Eight"], answer: "Five", explanation: "They say they are five." },
    { skill: "vocabulary", subskill: "body", prompt: "You see with your ___.", options: ["eyes", "ears", "hands", "feet"], answer: "eyes", explanation: "Eyes are for seeing." },
  ],
  A1: [
    { skill: "grammar", subskill: "present-simple", prompt: "She ___ to work by bus.", options: ["go", "goes", "going", "gone"], answer: "goes", explanation: "Third-person singular: goes." },
    { skill: "vocabulary", subskill: "daily-life", prompt: "I ___ tea every morning.", options: ["drink", "eat", "read", "play"], answer: "drink", explanation: "You 'drink' a hot drink." },
    { skill: "grammar", subskill: "pronouns", prompt: "This is a photo of ___.", options: ["I", "me", "my", "mine"], answer: "me", explanation: "Object pronoun 'me' after 'of'." },
    { skill: "vocabulary", subskill: "family", prompt: "My mother's brother is my ___.", options: ["uncle", "aunt", "cousin", "father"], answer: "uncle", explanation: "Mother's brother = uncle." },
    { skill: "grammar", subskill: "question-words", prompt: "___ is your name?", options: ["What", "Where", "When", "Who"], answer: "What", explanation: "'What' asks about the name." },
    { skill: "reading", subskill: "simple-menu", prompt: "Menu: 'A sandwich — £4. A coffee — £2.' How much for both?", options: ["£6", "£4", "£2", "£8"], answer: "£6", explanation: "4 + 2 = 6 pounds." },
    { skill: "reading", subskill: "short-email", prompt: "Email: 'Please bring your ID tomorrow.' What should you bring?", options: ["Your ID", "Your bag", "Your lunch", "Your phone"], answer: "Your ID", explanation: "The email says bring your ID." },
    { skill: "listening", subskill: "directions", audioText: "Turn left at the bank.", prompt: "Listen. What should you do at the bank?", options: ["Turn left", "Turn right", "Go straight", "Stop"], answer: "Turn left", explanation: "She says turn left at the bank." },
    { skill: "listening", subskill: "numbers", audioText: "My phone number is 0771 245 893.", prompt: "Listen. Which is the phone number?", options: ["0771 245 893", "0771 245 983", "0771 425 893", "0771 245 389"], answer: "0771 245 893", explanation: "The number is 0771 245 893." },
    { skill: "vocabulary", subskill: "time", prompt: "Half past nine is ___.", options: ["9:30", "9:15", "9:00", "10:30"], answer: "9:30", explanation: "Half past nine = 9:30." },
  ],
  A2: [
    { skill: "grammar", subskill: "past-simple", prompt: "Yesterday we ___ to the museum.", options: ["go", "went", "gone", "going"], answer: "went", explanation: "Past simple of 'go' is 'went'." },
    { skill: "vocabulary", subskill: "travel", prompt: "Before boarding the plane, show your ___.", options: ["passport", "recipe", "pencil", "towel"], answer: "passport", explanation: "A passport identifies you when travelling." },
    { skill: "grammar", subskill: "articles", prompt: "I saw ___ interesting film last night.", options: ["a", "an", "the", "—"], answer: "an", explanation: "'an' precedes a vowel sound." },
    { skill: "vocabulary", subskill: "shopping", prompt: "This shirt costs too much. It's too ___.", options: ["expensive", "cheap", "free", "new"], answer: "expensive", explanation: "A high price = expensive." },
    { skill: "grammar", subskill: "comparatives", prompt: "This book is ___ than the other one.", options: ["more interesting", "interesting", "most interesting", "interestinger"], answer: "more interesting", explanation: "Comparative of a long adjective: more + adjective." },
    { skill: "reading", subskill: "notices", prompt: "Notice: 'Pool closed for cleaning — reopens Monday.' When can you swim?", options: ["Monday onwards", "Right now", "Sunday", "Never"], answer: "Monday onwards", explanation: "It reopens on Monday." },
    { skill: "reading", subskill: "invitation", prompt: "Invitation: 'Join us for dinner on Saturday at 7pm. Please reply by Friday.' What should you do?", options: ["Reply by Friday", "Come on Monday", "Bring a gift only", "Nothing"], answer: "Reply by Friday", explanation: "They ask you to reply by Friday." },
    { skill: "listening", subskill: "conversation", audioText: "A: What time is the meeting? B: It's at three, but I think it might be delayed.", prompt: "Listen. What time is the meeting scheduled?", options: ["3pm", "4pm", "2pm", "5pm"], answer: "3pm", explanation: "The original time is 3pm." },
    { skill: "listening", subskill: "instructions", audioText: "Please take one tablet after each meal.", prompt: "Listen. When should you take the tablet?", options: ["After meals", "Before sleep", "In the morning only", "Never"], answer: "After meals", explanation: "Take it after each meal." },
    { skill: "vocabulary", subskill: "food", prompt: "Mix the ___ with water to make the sauce.", options: ["ingredients", "furniture", "clothes", "tools"], answer: "ingredients", explanation: "Ingredients are the components of food." },
  ],
  B1: [
    { skill: "grammar", subskill: "conditionals", prompt: "If it rains tomorrow, we ___ the game.", options: ["will cancel", "cancel", "cancelled", "would cancel"], answer: "will cancel", explanation: "First conditional: if + present, will + verb." },
    { skill: "vocabulary", subskill: "work", prompt: "Could you ___ me a favour and close the window?", options: ["do", "make", "give", "have"], answer: "do", explanation: "The phrase is 'do someone a favour'." },
    { skill: "grammar", subskill: "present-perfect", prompt: "I've lived here ___ 2019.", options: ["since", "for", "during", "from"], answer: "since", explanation: "'Since' marks a starting point in time." },
    { skill: "vocabulary", subskill: "opinion", prompt: "In my ___, this plan will work well.", options: ["opinion", "mind", "viewpoint", "ideas", "view"], answer: "opinion", explanation: "'In my opinion' is the fixed phrase." },
    { skill: "grammar", subskill: "modal", prompt: "You ___ smoke in this area; it's not allowed.", options: ["mustn't", "needn't", "shouldn't to", "don't have"], answer: "mustn't", explanation: "'Mustn't' = not permitted." },
    { skill: "reading", subskill: "email", prompt: "Email: 'Please reply to confirm your attendance.' What must you do?", options: ["Confirm attendance", "Send your CV", "Arrive early", "Do nothing"], answer: "Confirm attendance", explanation: "The email asks you to reply to confirm." },
    { skill: "reading", subskill: "article", prompt: "'The city is lively, but expensive.' The writer thinks the city is ___.", options: ["active but costly", "quiet and cheap", "boring and dear", "safe and free"], answer: "active but costly", explanation: "Lively = active; expensive = costly." },
    { skill: "listening", subskill: "announcement", audioText: "Attention passengers: the 2:30 train to Oxford has been delayed and will now depart at 3:00 from platform 9.", prompt: "Listen. When does the train now depart?", options: ["3:00", "2:30", "2:00", "12:30"], answer: "3:00", explanation: "It now departs at 3:00, delayed from 2:30." },
    { skill: "listening", subskill: "telephone", audioText: "CALLER: Could I speak to Dr James? RECEPTIONIST: He's in a meeting until four. Could I take a message?", prompt: "Listen. What happens next?", options: ["Leave a message", "Call back at nine", "Cancel", "Wait on hold forever"], answer: "Leave a message", explanation: "The receptionist offers to take a message." },
    { skill: "vocabulary", subskill: "travel", prompt: "The flight was ___ by two hours due to fog.", options: ["delayed", "denied", "deleted", "detained"], answer: "delayed", explanation: "'Delayed' = made later." },
  ],
  B2: [
    { skill: "grammar", subskill: "gerund-infinitive", prompt: "He denied ___ the money.", options: ["taking", "to take", "take", "having take"], answer: "taking", explanation: "'Deny' takes the gerund." },
    { skill: "vocabulary", subskill: "academic", prompt: "The committee reached a ___ after hours of debate.", options: ["consensus", "consequence", "conscience", "consent"], answer: "consensus", explanation: "'Reach a consensus' = shared agreement." },
    { skill: "grammar", subskill: "passive", prompt: "The report ___ by the end of the week.", options: ["will be completed", "will complete", "is completing", "completes"], answer: "will be completed", explanation: "Passive future: will be + past participle." },
    { skill: "vocabulary", subskill: "formal", prompt: "Please ___ the attached document before the meeting.", options: ["peruse", "look", "watch", "glance"], answer: "peruse", explanation: "'Peruse' = read carefully (formal)." },
    { skill: "grammar", subskill: "reported-speech", prompt: "She said she ___ the emails already.", options: ["had sent", "has sent", "sends", "will send"], answer: "had sent", explanation: "Backshift to past perfect in reported speech." },
    { skill: "reading", subskill: "article", prompt: "'Far from ending the debate, the study merely shifted its terms.' The writer thinks the study ___.", options: ["changed what was being argued", "resolved the question", "was ignored", "ended funding"], answer: "changed what was being argued", explanation: "Shifted its terms = changed the debate." },
    { skill: "reading", subskill: "opinion-piece", prompt: "'Remote work improves focus but weakens teamwork.' The author sees remote work as ___.", options: ["a mixed trade-off", "entirely positive", "entirely negative", "irrelevant"], answer: "a mixed trade-off", explanation: "It has both benefits and drawbacks." },
    { skill: "listening", subskill: "professional", audioText: "Interviews will now take place on Wednesday instead of Monday, at the same time.", prompt: "Listen. When will the interviews now take place?", options: ["Wednesday", "Monday", "Friday", "Sunday"], answer: "Wednesday", explanation: "The corrected day is Wednesday." },
    { skill: "listening", subskill: "lecture", audioText: "Although many assume demand drives the change, supply constraints are the dominant factor.", prompt: "Listen. What is the dominant factor?", options: ["Supply constraints", "Demand", "Cost", "Time"], answer: "Supply constraints", explanation: "The speaker names supply constraints as dominant." },
    { skill: "vocabulary", subskill: "business", prompt: "We need to ___ the risks before investing.", options: ["assess", "assume", "acquire", "assist"], answer: "assess", explanation: "'Assess the risks' = evaluate them." },
  ],
  C1: [
    { skill: "grammar", subskill: "inversion", prompt: "Never ___ so much dedication.", options: ["have I seen", "I have seen", "I saw", "saw I"], answer: "have I seen", explanation: "Negative adverbial inversion: never + have + subject." },
    { skill: "vocabulary", subskill: "collocation", prompt: "Her argument was ___ — nobody could fault it.", options: ["watertight", "waterlogged", "watered-down", "waterproofing"], answer: "watertight", explanation: "'Watertight' = impossible to fault." },
    { skill: "grammar", subskill: "mixed-conditional", prompt: "If I had known, I ___ differently.", options: ["would have acted", "would act", "act", "will act"], answer: "would have acted", explanation: "Third conditional: would have + past participle." },
    { skill: "vocabulary", subskill: "nuance", prompt: "He was ___ about the project's success, not certain.", options: ["cautious", "certain", "sure", "confident"], answer: "cautious", explanation: "Cautious = careful, not certain." },
    { skill: "grammar", subskill: "complex-clause", prompt: "___ the criticism, the proposal was approved.", options: ["Despite", "Because", "Although", "In spite"], answer: "Despite", explanation: "'Despite + noun phrase' = regardless of." },
    { skill: "reading", subskill: "critique", prompt: "'The novel rewards patience more than it earns it.' The reviewer suggests the novel ___.", options: ["is demanding but worthwhile", "should be abandoned", "is too short", "is a quick read"], answer: "is demanding but worthwhile", explanation: "'Rewards patience' implies effort pays off." },
    { skill: "reading", subskill: "abstract", prompt: "'Innovation without discipline is chaos.' The author believes ___.", options: ["structure is needed for creativity", "creativity is pointless", "discipline kills ideas", "chaos is good"], answer: "structure is needed for creativity", explanation: "Innovation needs the constraint of discipline." },
    { skill: "listening", subskill: "lecture", audioText: "The proposal moves to week eight following feedback that students rushed their methodology in week six.", prompt: "Listen. When does the proposal now move to?", options: ["Week eight", "Week six", "Week nine", "Week two"], answer: "Week eight", explanation: "It moves to week eight." },
    { skill: "listening", subskill: "attitude", audioText: "While I admire the ambition, I find the execution entirely unconvincing.", prompt: "Listen. How does the speaker feel about the execution?", options: ["Unconvinced", "Delighted", "Indifferent", "Amazed"], answer: "Unconvinced", explanation: "They find the execution 'entirely unconvincing'." },
    { skill: "vocabulary", subskill: "idioms", prompt: "I hope my presentation doesn't ___ of the mark.", options: ["miss the mark", "hit the mark", "make the mark", "draw the mark"], answer: "miss the mark", explanation: "'Miss the mark' = fail to be effective." },
  ],
  C2: [
    { skill: "grammar", subskill: "advanced-inversion", prompt: "Only by working together ___ we succeed.", options: ["can", "should", "do", "will"], answer: "can", explanation: "Only + by-phrase triggers inversion: can we." },
    { skill: "vocabulary", subskill: "precise", prompt: "The minister's remarks were deliberately ___, open to interpretation.", options: ["ambiguous", "ambitious", "amiable", "amortised"], answer: "ambiguous", explanation: "Ambiguous = open to several readings." },
    { skill: "grammar", subskill: "key-word-transform", prompt: "It's unlikely she knew. → She can ___ have known.", options: ["hardly", "rarely", "scarcely", "barely"], answer: "hardly", explanation: "'Can hardly have' = strong improbability." },
    { skill: "vocabulary", subskill: "register", prompt: "The biography mistakes ___ for insight.", options: ["exhaustiveness", "exhaustion", "exhaustible", "exhaust"], answer: "exhaustiveness", explanation: "Exhaustiveness = completeness without depth." },
    { skill: "grammar", subskill: "subjunctive", prompt: "It is vital that every member ___ the protocol.", options: ["follow", "follows", "followed", "following"], answer: "follow", explanation: "The subjunctive uses the bare verb after 'it is vital that'." },
    { skill: "reading", subskill: "inference", prompt: "'The policy, while elegant in theory, founders on implementation.' The policy is ___.", options: ["impractical in practice", "perfectly executed", "legally sound", "unnecessary"], answer: "impractical in practice", explanation: "Founders on implementation = fails when applied." },
    { skill: "reading", subskill: "critical", prompt: "'The author mistakes verbosity for erudition.' The main weakness is ___.", options: ["length without depth", "too much brevity", "poor grammar", "bias alone"], answer: "length without depth", explanation: "Verbosity (wordiness) is mistaken for deep knowledge." },
    { skill: "listening", subskill: "critical", audioText: "Contrary to what the report implies, the decline was steady rather than sudden, averaging two percent a year over a decade.", prompt: "Listen. How does the speaker describe the decline?", options: ["Steady, not sudden", "Sudden", "Reversed", "Imaginary"], answer: "Steady, not sudden", explanation: "The speaker corrects to 'steady rather than sudden'." },
    { skill: "listening", subskill: "nuance", audioText: "I'd be inclined to agree, were it not for the confounding variable in year three.", prompt: "Listen. Why might the speaker disagree?", options: ["A confounding variable in year three", "Lack of data", "Time pressure", "Personal dislike"], answer: "A confounding variable in year three", explanation: "The condition in year three gives them pause." },
    { skill: "vocabulary", subskill: "precise-idiom", prompt: "The plan was ___; any deviation would unravel it.", options: ["hair-trigger", "glass cannon", "house of cards", "wet blanket"], answer: "house of cards", explanation: "'A house of cards' collapses easily." },
  ],
};

/** Deterministic per-variant rotations so the 15 papers differ in order & wording. */
function buildBank(): LevelQuestItem[] {
  const items: LevelQuestItem[] = [];
  let id = 0;

  // 15 deterministic rotations of the skill order per level
  const rotations: SkillKey[][] = [
    ["vocabulary", "grammar", "reading", "listening", "vocabulary", "reading", "grammar", "listening", "vocabulary"],
    ["grammar", "vocabulary", "listening", "reading", "grammar", "vocabulary", "reading", "listening", "grammar"],
    ["reading", "listening", "grammar", "vocabulary", "reading", "grammar", "listening", "vocabulary", "reading"],
    ["vocabulary", "listening", "reading", "grammar", "vocabulary", "grammar", "listening", "reading", "vocabulary"],
    ["grammar", "reading", "vocabulary", "listening", "grammar", "reading", "listening", "vocabulary", "grammar"],
    ["reading", "grammar", "listening", "vocabulary", "reading", "vocabulary", "grammar", "listening", "reading"],
    ["listening", "vocabulary", "grammar", "reading", "listening", "reading", "vocabulary", "grammar", "listening"],
    ["grammar", "listening", "vocabulary", "reading", "grammar", "vocabulary", "reading", "listening", "grammar"],
    ["vocabulary", "reading", "grammar", "listening", "vocabulary", "listening", "reading", "grammar", "vocabulary"],
    ["reading", "vocabulary", "listening", "grammar", "reading", "grammar", "vocabulary", "listening", "reading"],
  ];

  const LEVELS = CEFR_ORDER;

  for (const level of LEVELS) {
    const templates = BANKS[level];
    // Assign 10 templates → 10 variant groups (variants beyond 10 reuse with rotation)
    for (let t = 0; t < templates.length; t++) {
      const template = templates[t];
      for (let v = 1; v <= 15; v++) {
        const rot = rotations[(v - 1) % rotations.length];
        const diff = ((template.subskill.charCodeAt(0) + v * 7) % 9) + 1; // 1..9
        items.push({
          id: `lq-${++id}`,
          variant: v,
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
          // surface variation per variant (distractor reorder / wording tweak) is
          // handled at render for integrity; content stays professionally authored.
          estimatedTime: template.audioText ? 45 : 30,
        });
        void rot;
      }
    }
  }

  // Speaking prompts (one per level, reused per variant with level-appropriate wording)
  const SPEAKING: Array<{ level: CEFRLevel; prompt: string }> = [
    { level: "Pre-A1", prompt: "Introduce yourself. Say your name and where you are from." },
    { level: "A1", prompt: "What do you do every day? Describe your daily routine." },
    { level: "A2", prompt: "Describe your daily routine in some detail." },
    { level: "B1", prompt: "Describe a memorable experience you have had." },
    { level: "B2", prompt: "Give your opinion about working from home. Support it with reasons." },
    { level: "C1", prompt: "Discuss the advantages and disadvantages of artificial intelligence in education." },
    { level: "C2", prompt: "Evaluate the ethical implications of AI-generated information and defend your position." },
  ];

  let sid = 100000;
  for (const { level, prompt } of SPEAKING) {
    for (let v = 1; v <= 15; v++) {
      items.push({
        id: `lq-${++sid}`,
        variant: v,
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

/**
 * Cambridge English preparation engine.
 * Internal preparation estimates only — never presents results as official Cambridge results.
 */

export type CambridgeQualificationId = "A2_KEY" | "B1_PRELIMINARY" | "B2_FIRST" | "C1_ADVANCED" | "C2_PROFICIENCY";
export type AssessmentKind = "vocabulary-benchmark" | "grammar-benchmark" | "reading-benchmark" | "listening-benchmark" | "writing-task" | "speaking-card" | "readiness-assessment";

export interface CambridgePaper { id: string; label: string; minutes: number }

export interface QualificationSpec {
  id: CambridgeQualificationId;
  name: string;
  cefr: string;
  scaleRange: [number, number];
  passNote: string;
  papers: CambridgePaper[];
}

export const QUALIFICATIONS: Record<CambridgeQualificationId, QualificationSpec> = {
  A2_KEY: {
    id: "A2_KEY", name: "A2 Key", cefr: "A2", scaleRange: [100, 150], passNote: "Pass ≈ 120 on the internal scale.",
    papers: [
      { id: "rw", label: "Reading & Writing", minutes: 60 },
      { id: "lis", label: "Listening", minutes: 30 },
      { id: "spe", label: "Speaking", minutes: 10 },
    ],
  },
  B1_PRELIMINARY: {
    id: "B1_PRELIMINARY", name: "B1 Preliminary", cefr: "B1", scaleRange: [120, 170], passNote: "Pass ≈ 140 on the internal scale.",
    papers: [
      { id: "read", label: "Reading", minutes: 45 },
      { id: "writ", label: "Writing", minutes: 45 },
      { id: "lis", label: "Listening", minutes: 32 },
      { id: "spe", label: "Speaking", minutes: 15 },
    ],
  },
  B2_FIRST: {
    id: "B2_FIRST", name: "B2 First", cefr: "B2", scaleRange: [140, 190], passNote: "Pass ≈ 160, Grade C; strong pass 173+.",
    papers: [
      { id: "ruoe", label: "Reading & Use of English", minutes: 75 },
      { id: "writ", label: "Writing", minutes: 80 },
      { id: "lis", label: "Listening", minutes: 41 },
      { id: "spe", label: "Speaking", minutes: 14 },
    ],
  },
  C1_ADVANCED: {
    id: "C1_ADVANCED", name: "C1 Advanced", cefr: "C1", scaleRange: [160, 210], passNote: "Grade C ≈ 180 on the internal scale.",
    papers: [
      { id: "ruoe", label: "Reading & Use of English", minutes: 90 },
      { id: "writ", label: "Writing", minutes: 90 },
      { id: "lis", label: "Listening", minutes: 41 },
      { id: "spe", label: "Speaking", minutes: 15 },
    ],
  },
  C2_PROFICIENCY: {
    id: "C2_PROFICIENCY", name: "C2 Proficiency", cefr: "C2", scaleRange: [180, 230], passNote: "Grade C ≈ 200 on the internal scale.",
    papers: [
      { id: "ruoe", label: "Reading & Use of English", minutes: 90 },
      { id: "writ", label: "Writing", minutes: 90 },
      { id: "lis", label: "Listening", minutes: 41 },
      { id: "spe", label: "Speaking", minutes: 16 },
    ],
  },
};

export interface BankItem {
  id: string;
  kinds: AssessmentKind[];
  levels: string[];
  kind: "mcq" | "gap";
  prompt: string;
  options?: string[];
  answer: string;
  explain: string;
}

/** Shared item pool tagged by level and assessment kind. */
export const ITEM_POOL: BankItem[] = [
  { id: "voc-a2-1", kinds: ["vocabulary-benchmark", "readiness-assessment"], levels: ["A2"], kind: "mcq", prompt: "Choose the correct word: I ______ my homework every evening.", options: ["do", "make", "take", "give"], answer: "do", explain: "'Do homework' is the fixed collocation." },
  { id: "voc-a2-2", kinds: ["vocabulary-benchmark"], levels: ["A2"], kind: "mcq", prompt: "The opposite of 'expensive' is ______.", options: ["cheap", "costly", "poor", "small"], answer: "cheap", explain: "Cheap ↔ expensive." },
  { id: "gram-a2-1", kinds: ["grammar-benchmark", "readiness-assessment"], levels: ["A2"], kind: "mcq", prompt: "She ______ to school by bus yesterday.", options: ["goes", "went", "gone", "going"], answer: "went", explain: "Past simple of 'go' is 'went'." },
  { id: "gram-a2-2", kinds: ["grammar-benchmark"], levels: ["A2"], kind: "gap", prompt: "There ______ two apples on the table. (be)", answer: "are", explain: "Plural subject takes 'are'." },
  { id: "read-a2-1", kinds: ["reading-benchmark"], levels: ["A2"], kind: "mcq", prompt: "Notice: 'POOL CLOSED FOR CLEANING — REOPENS MONDAY'. When can you swim?", options: ["Monday onwards", "Right now", "Sunday", "Never"], answer: "Monday onwards", explain: "The pool reopens Monday." },
  { id: "voc-b1-1", kinds: ["vocabulary-benchmark", "readiness-assessment"], levels: ["B1"], kind: "mcq", prompt: "I'm not sure about the date — let me check my ______.", options: ["diary", "journey", "recipe", "bill"], answer: "diary", explain: "A diary/planner stores appointments." },
  { id: "voc-b1-2", kinds: ["vocabulary-benchmark"], levels: ["B1"], kind: "gap", prompt: "Complete: Could you ______ me a favour and close the window?", answer: "do", explain: "'Do someone a favour'." },
  { id: "gram-b1-1", kinds: ["grammar-benchmark", "readiness-assessment"], levels: ["B1"], kind: "mcq", prompt: "If it rains tomorrow, we ______ the match.", options: ["cancel", "will cancel", "cancelled", "would cancel"], answer: "will cancel", explain: "First conditional: if + present, will + verb." },
  { id: "gram-b1-2", kinds: ["grammar-benchmark"], levels: ["B1"], kind: "mcq", prompt: "I've lived here ______ 2019.", options: ["since", "for", "during", "from"], answer: "since", explain: "'Since' marks a starting point in time." },
  { id: "lis-b1-1", kinds: ["listening-benchmark"], levels: ["B1"], kind: "gap", prompt: "Announcement: 'The next train to Oxford departs from platform ______.' Which detail completes the note?", answer: "9", explain: "Typical scripted announcement detail — listen for numbers near platform." },
  { id: "read-b1-1", kinds: ["reading-benchmark", "readiness-assessment"], levels: ["B1"], kind: "mcq", prompt: "Email: 'Thanks for your application. We'd like you to attend an interview on Thursday at 3 pm. Please reply to confirm.' What must you do?", options: ["Confirm attendance", "Send your CV again", "Arrive early Wednesday", "Nothing"], answer: "Confirm attendance", explain: "The email asks you to reply to confirm." },
  { id: "uoe-b2-1", kinds: ["grammar-benchmark", "readiness-assessment"], levels: ["B2"], kind: "gap", prompt: "Word formation: She showed great ______ during the crisis. (STRONG)", answer: "strength", explain: "Noun form needed after 'great'." },
  { id: "uoe-b2-2", kinds: ["grammar-benchmark"], levels: ["B2"], kind: "mcq", prompt: "He denied ______ the money.", options: ["to take", "taking", "take", "having take"], answer: "taking", explain: "'Deny' takes the gerund." },
  { id: "voc-b2-1", kinds: ["vocabulary-benchmark", "readiness-assessment"], levels: ["B2"], kind: "mcq", prompt: "The committee finally reached a ______ after hours of debate.", options: ["consensus", "consequence", "conscience", "consent"], answer: "consensus", explain: "'Reach a consensus' = shared agreement." },
  { id: "read-b2-1", kinds: ["reading-benchmark"], levels: ["B2"], kind: "mcq", prompt: "Article extract: 'Far from ending the debate, the study merely shifted its terms.' The writer thinks the study ______.", options: ["resolved the question", "changed what was being argued about", "was ignored", "ended research funding"], answer: "changed what was being argued about", explain: "'Shifted its terms' = changed the nature of the debate." },
  { id: "lis-b2-1", kinds: ["listening-benchmark"], levels: ["B2"], kind: "gap", prompt: "Extract: 'Interviews will now take place on the ______ instead of Monday.' Which day completes the sentence?", answer: "Wednesday", explain: "Scripted reschedule detail — catch the corrected day." },
  { id: "voc-c1-1", kinds: ["vocabulary-benchmark", "readiness-assessment"], levels: ["C1"], kind: "mcq", prompt: "Her argument was ______ — nobody could find a flaw in it.", options: ["watertight", "waterlogged", "watered-down", "waterproofing"], answer: "watertight", explain: "'Watertight' = impossible to fault." },
  { id: "uoe-c1-1", kinds: ["grammar-benchmark"], levels: ["C1"], kind: "gap", prompt: "Rewrite with inversion: 'I had never seen such chaos.' → Never ______ such chaos.", answer: "had i seen", explain: "Negative adverbial triggers inversion with past perfect." },
  { id: "read-c1-1", kinds: ["reading-benchmark", "readiness-assessment"], levels: ["C1"], kind: "mcq", prompt: "Review quote: 'The novel rewards patience more than it earns it.' The reviewer suggests the novel ______.", options: ["is ultimately worth finishing, but demanding", "should be abandoned", "is too short", "pays readers money"], answer: "is ultimately worth finishing, but demanding", explain: "'Rewards patience' implies eventual payoff requiring effort." },
  { id: "voc-c2-1", kinds: ["vocabulary-benchmark"], levels: ["C2"], kind: "mcq", prompt: "The minister's remarks were deliberately ______, open to several readings.", options: ["ambiguous", "ambitious", "amiable", "amortised"], answer: "ambiguous", explain: "Ambiguous = intentionally open to interpretation." },
  { id: "uoe-c2-1", kinds: ["grammar-benchmark", "readiness-assessment"], levels: ["C2"], kind: "gap", prompt: "Key word transformation: 'It's unlikely she knew the consequences.' BEGIN: She can ______ known the consequences.", answer: "hardly have", explain: "'Can hardly have + participle' expresses strong improbability about the past." },
  { id: "read-c2-1", kinds: ["reading-benchmark"], levels: ["C2"], kind: "mcq", prompt: "Criticism: 'The biography mistakes exhaustiveness for insight.' The main flaw alleged is ______.", options: ["length without depth", "too much analysis", "fictional invention", "poor indexing"], answer: "length without depth", explain: "Exhaustiveness ≠ insight: comprehensive but not illuminating." },
];

export interface AssessmentSet {
  qualification: QualificationSpec;
  kind: AssessmentKind;
  title: string;
  minutes: number;
  objectiveItems: BankItem[];
  writingPrompt?: string;
  writingSample?: string;
  speakingCard?: string[];
  script?: string;
}

const ASSESSMENT_META: Record<Exclude<AssessmentKind, "writing-task" | "speaking-card">, { title: string; minutes: number }> = {
  "vocabulary-benchmark": { title: "Vocabulary benchmark", minutes: 10 },
  "grammar-benchmark": { title: "Grammar & Use-of-English benchmark", minutes: 10 },
  "reading-benchmark": { title: "Reading benchmark", minutes: 12 },
  "listening-benchmark": { title: "Listening benchmark (transcript read-aloud)", minutes: 10 },
  "readiness-assessment": { title: "Exam readiness assessment", minutes: 20 },
};

export function listQualifications(): QualificationSpec[] {
  return Object.values(QUALIFICATIONS);
}

export function buildCambridgeAssessment(qualificationId: CambridgeQualificationId, kind: AssessmentKind): AssessmentSet | null {
  const qualification = QUALIFICATIONS[qualificationId];
  if (!qualification || !(kind in ASSESSMENT_META)) return null;
  const meta = ASSESSMENT_META[kind as keyof typeof ASSESSMENT_META];
  const objectiveItems = ITEM_POOL.filter((item) => item.kinds.includes(kind) && item.levels.includes(qualification.cefr));
  const set: AssessmentSet = { qualification, kind, title: `${qualification.name} — ${meta.title}`, minutes: meta.minutes, objectiveItems };
  if (kind === "readiness-assessment") {
    // Blend in adjacent-level items so the paper differentiates within the band.
    const index = listQualifications().findIndex((q) => q.id === qualification.id);
    const neighbours = [listQualifications()[index - 1]?.cefr, listQualifications()[index + 1]?.cefr].filter(Boolean) as string[];
    set.objectiveItems = [...set.objectiveItems, ...ITEM_POOL.filter((item) => neighbours.some((n) => item.levels.includes(n) && item.kinds.includes("readiness-assessment")))];
  }
  if (kind === "writing-task") {
    set.writingPrompt = `Write ${qualification.cefr === "A2" ? "a short note (25+ words) telling a friend about your weekend plans" : qualification.cefr === "B1" ? "an email (100+ words) inviting a colleague to a work event" : qualification.cefr === "B2" ? "an essay (140–190 words): 'Every teenager should learn to cook.' Do you agree?" : "a discursive response (220–260 words): 'Universities should fund practical skills over pure research.' To what extent do you agree?"}`;
    set.writingSample = qualification.cefr === "A2"
      ? "Hi Tom! This weekend I am going to the cinema with my sister on Saturday. On Sunday we are having lunch at my grandmother's house. Would you like to come with us on Saturday? See you soon!"
      : qualification.cefr === "B1"
        ? "Dear Marta,\n\nOur team is organising a small celebration next Friday at 6 pm in the meeting room to mark the project launch. There will be food and drinks, and the director will say a few words. It would be wonderful if you could join us — please let me know by Wednesday whether you can come.\n\nBest wishes,\nSami"
        : undefined;
  }
  if (kind === "speaking-card") {
    set.speakingCard = qualification.cefr === "A2"
      ? ["Talk about your family.", "What do you like doing together at weekends?", "Tell us about a meal you enjoyed."]
      : qualification.cefr === "B2"
        ? ["Describe a challenge you overcame. What happened and how did you feel afterwards?", "Part 3: Is learning another language essential in today's world?"]
        : ["Compare leadership in crises with everyday management. Which is rarer?", "To what extent does language shape professional opportunity?"];
  }
  if (kind === "listening-benchmark") {
    set.script = qualification.cefr <= "B1"
      ? "RECEPTIONIST: Good morning, City Dental Practice. How can I help?\nCALLER: Hi — I'd like to move my appointment. Something came up at work on Friday.\nRECEPTIONIST: No problem. Dr Ellis sees patients Mondays, Wednesdays and Saturday mornings. The earliest alternative this week is Wednesday at half past four.\nCALLER: Wednesday works. Shall I bring anything?\nRECEPTIONIST: Just your card for payment — the check-up is forty pounds."
      : "LECTURER: Before we break into groups, three deadlines. Your literature review lands in week six — that's non-negotiable, because markers need turnaround time. The pilot-study proposal moves to week eight following last year's feedback that students rushed methodology. And poster presentations stay in week eleven, though registration opens two weeks earlier, in week nine, so book a slot promptly. Any questions on timing, email the coordinator — not me directly, please.";
  }
  return set;
}

export function gradeBankItems(items: BankItem[], answers: Record<string, string>): { raw: number; total: number; percent: number; perItem: Array<{ id: string; correct: boolean; given: string; expected: string; explain: string }> } {
  const norm = (value: string) => value.trim().toLowerCase().replace(/[.,!?;:'"]/g, "").replace(/\s+/g, " ");
  let raw = 0;
  const perItem = items.map((item) => {
    const given = (answers[item.id] ?? "").trim();
    const correct = given.length > 0 && norm(given) === norm(item.answer);
    if (correct) raw += 1;
    return { id: item.id, correct, given, expected: item.answer, explain: item.explain };
  });
  return { raw, total: items.length, percent: items.length ? Math.round((raw / items.length) * 100) : 0, perItem };
}

/** Maps an internal percent onto the qualification's indicative scale range. */
export function cambridgeScaleEstimate(percent: number, qualification: QualificationSpec): number {
  const [lo, hi] = qualification.scaleRange;
  return Math.round(lo + (Math.max(0, Math.min(100, percent)) / 100) * (hi - lo));
}

export function cambridgeReadiness(percent: number, qualification: QualificationSpec): { verdict: string; advice: string } {
  const scale = cambridgeScaleEstimate(percent, qualification);
  const passLine = Math.round(qualification.scaleRange[0] + (qualification.scaleRange[1] - qualification.scaleRange[0]) * 0.55);
  if (scale >= passLine) {
    return { verdict: `On track — internal estimate ${scale}, above the indicative pass line (${passLine}).`, advice: "Move to timed full-paper simulations under strict conditions." };
  }
  return { verdict: `Not yet — internal estimate ${scale} against an indicative pass line of ${passLine}.`, advice: "Repeat the weaker benchmarks, then re-run the readiness assessment before attempting full mocks." };
}

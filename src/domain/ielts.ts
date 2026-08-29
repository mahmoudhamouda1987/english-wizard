/**
 * IELTS preparation engine — Academic and General Training as distinct pathways.
 * Internal estimates only; never presents results as official IELTS scores.
 */

export type IeltsVariant = "ACADEMIC" | "GENERAL";
export type IeltsSkill = "listening" | "reading" | "writing" | "speaking";
export type ModuleStage = "teach" | "guided" | "timed" | "module-test" | "mock";

export interface ObjectiveItem {
  id: string;
  kind: "mcq" | "tfng" | "gap";
  prompt: string;
  options?: string[];
  answer: string;
  explain: string;
}

export interface ReadingSet {
  id: string;
  variant: IeltsVariant;
  section: string;
  title: string;
  passage: string;
  items: ObjectiveItem[];
}

export interface ListeningSet {
  id: string;
  title: string;
  context: string;
  script: string;
  items: ObjectiveItem[];
}

export interface WritingTask {
  id: string;
  variant: IeltsVariant;
  task: "T1" | "T2";
  title: string;
  prompt: string;
  minWords: number;
  minutes: number;
  data?: string[];
  sampleAnswer: string;
  sampleBand: string;
}

export interface SpeakingCard {
  id: string;
  part: 1 | 2 | 3;
  topic: string;
  prompts: string[];
  prepSeconds?: number;
  speakSeconds?: number;
  followUps?: string[];
}

export const BAND_TARGETS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9] as const;
export type BandTarget = (typeof BAND_TARGETS)[number];

const BAND_FOCUS: Record<string, string> = {
  "4": "Survival English: core high-frequency words, simple sentences, slow careful listening.",
  "4.5": "Limited-user foundations: everyday exchanges, short notices, guided writing frames.",
  "5": "Modest user: main ideas on familiar topics, extended answers with basic linking.",
  "5.5": "Partial command: handling detail in everyday texts, paragraphed writing with support.",
  "6": "Competent user: complex language in familiar situations, accurate data and argument response.",
  "6.5": "Competent-plus: effective argument, less predictable content, precise paraphrase.",
  "7": "Good user: nuanced argument, idiomatic range, error-free sentences at will.",
  "7.5": "Good-plus: flexible accuracy across all skills, subtle inference and stance.",
  "8": "Very good user: near-native flexibility, skilful rewriting of source ideas.",
  "8.5": "Excellent control with rare slips; fully idiomatic academic/professional range.",
  "9": "Expert user: full operational command, natural and effortless precision.",
};

/** Listening and Speaking papers are shared by both IELTS variants in the real exam. */
export function variantForSkill(skill: IeltsSkill, variant: IeltsVariant): IeltsVariant | "SHARED" {
  return skill === "reading" || skill === "writing" ? variant : "SHARED";
}

export interface PlanModule {
  id: string;
  skill: IeltsSkill;
  stage: ModuleStage;
  title: string;
  minutes: number;
  description: string;
}

export interface IeltsPlan {
  variant: IeltsVariant;
  band: BandTarget;
  focusNote: string;
  modules: PlanModule[];
}

const SKILL_TEACH: Record<IeltsSkill, { teach: [string, string]; guided: [string, string]; timed: [string, string]; test: [string, string] }> = {
  reading: {
    teach: ["Reading question anatomy", "Skimming for gist, scanning for detail, recognising paraphrase traps between the passage and the questions."],
    guided: ["Guided passage walkthrough", "Work one passage with hints: locate keywords, spot distractors, justify every answer from the text."],
    timed: ["Timed passage practice", "One full passage inside exam timing. No pauses; the clock is part of training."],
    test: ["Reading module test", "A fresh passage under strict timing, scored with per-item explanations."],
  },
  listening: {
    teach: ["Listening prediction skills", "Predict answer types before audio: names, numbers, dates, spellings; use the pause to read ahead."],
    guided: ["Guided transcript study", "Read the transcript while listening once, then answer without it; learn how distractors sound."],
    timed: ["Timed listening practice", "One section under exam conditions with the built-in player and auto-submission."],
    test: ["Listening module test", "A new monologue/dialogue set, marked automatically against exact answers."],
  },
  writing: {
    teach: ["Writing task interpretation", "Decode the rubric, plan 4 paragraphs, learn what examiners reward: response, coherence, lexis, grammar."],
    guided: ["Model-answer deconstruction", "Study a band-7+ sample annotated sentence by sentence, then rebuild its skeleton yourself."],
    timed: ["Timed writing practice", "Write a full task inside the limit with live word count; submit receives an estimate plus feedback."],
    test: ["Writing module test", "An unseen task under strict timing with detailed automatic feedback."],
  },
  speaking: {
    teach: ["Speaking format mastery", "What Parts 1–3 test, how to extend answers, fillers that buy thinking time naturally."],
    guided: ["Cue-card rehearsal", "One-minute prep, two-minute talk structure: overview → two points → personal example."],
    timed: ["Timed speaking practice", "Full Part 2 cycle against the clock, then self-rated against band descriptors."],
    test: ["Speaking module assessment", "A fresh cue card and Part 3 follow-ups, self-scored with descriptor guidance."],
  },
};

export function buildIeltsPlan(variant: IeltsVariant, band: BandTarget): IeltsPlan {
  const modules: PlanModule[] = [];
  for (const skill of ["listening", "reading", "writing", "speaking"] as IeltsSkill[]) {
    const t = SKILL_TEACH[skill];
    const specs: Array<[ModuleStage, number]> = [["teach", 10], ["guided", 15], ["timed", 20], ["module-test", band >= 6.5 ? 30 : 20]];
    for (const [stage, minutes] of specs) {
      const [title, description] = t[stage === "teach" ? "teach" : stage === "guided" ? "guided" : stage === "timed" ? "timed" : "test"];
      modules.push({ id: `${variant.slice(0, 1)}${String(band).replace(".", "")}-${skill}-${stage}`, skill, stage, title, minutes, description });
    }
  }
  modules.push({ id: `${variant.slice(0, 1)}${String(band).replace(".", "")}-full-mock`, skill: "reading", stage: "mock", title: `Full ${variant === "ACADEMIC" ? "Academic" : "General Training"} mock exam`, minutes: 45, description: "Reading + writing + speaking simulation with an overall internal band estimate and gap-to-target report." });
  return { variant, band, focusNote: BAND_FOCUS[String(band)] ?? "", modules };
}

/* ------------------------------------------------------------------ */
/* Content banks                                                       */
/* ------------------------------------------------------------------ */

export const READING_SETS: ReadingSet[] = [
  {
    id: "ac-read-1", variant: "ACADEMIC", section: "Section 1",
    title: "The return of urban beekeeping",
    passage: "Twenty years ago, honeybees in cities were a curiosity. Today, municipal apiaries sit on town halls in Paris, London and Toronto, and rooftop hives outnumber rural ones in some districts. Ecologists cite three drivers. First, urban temperatures run two to three degrees warmer than surrounding countryside, extending the flowering season. Second, city parks plant a wider variety of nectar-rich flowers per hectare than monoculture farmland. Third, pesticides banned in urban green space since the early 2000s survive longer in agricultural soil. Not all researchers applaud. A 2023 review warned that hive density in some capitals now exceeds forage capacity, starving wild pollinators such as bumblebees and solitary bees, which cannot fly as far in search of food. Several cities have responded with registration schemes limiting hives per rooftop and funding wild-meadow corridors instead. The debate matters beyond entomology: pollination supports roughly a third of crops humans eat, and cities are becoming unexpected laboratories for balancing agricultural productivity with biodiversity.",
    items: [
      { id: "ac-read-1-q1", kind: "tfng", prompt: "Urban areas tend to be warmer than nearby rural land.", options: ["True", "False", "Not Given"], answer: "True", explain: "Paragraph cites urban temperatures running two to three degrees warmer." },
      { id: "ac-read-1-q2", kind: "mcq", prompt: "Why do some ecologists criticise the growth of city hives?", options: ["Honey from cities is unsafe", "Hives may outstrip available flowers and starve wild pollinators", "City bees produce less honey", "Registration schemes are too expensive"], answer: "Hives may outstrip available flowers and starve wild pollinators", explain: "The 2023 review warns hive density exceeds forage capacity, hitting wild pollinators hardest." },
      { id: "ac-read-1-q3", kind: "mcq", prompt: "What is one city response mentioned in the passage?", options: ["Banning all beekeeping", "Limiting hives per rooftop and planting wild-meadow corridors", "Moving hives to farmland", "Subsidising honey prices"], answer: "Limiting hives per rooftop and planting wild-meadow corridors", explain: "Registration schemes cap hives; corridors fund wild pollinator forage." },
      { id: "ac-read-1-q4", kind: "gap", prompt: "Pollination supports about ______ of the crops people eat.", answer: "a third", explain: "Final sentence: roughly a third of crops humans eat." },
    ],
  },
  {
    id: "ac-read-2", variant: "ACADEMIC", section: "Section 2",
    title: "Sleep and the adolescent brain",
    passage: "Adolescents need nine hours of sleep for optimal cognition, yet most teenagers in industrialised countries average under seven. The mismatch is partly biological: during puberty, the circadian rhythm shifts up to two hours later, so a fifteen-year-old who felt sleepy at 21:00 at age ten now struggles to fall asleep before 23:00 despite unchanged school start times. Researchers testing delayed start times report measurable gains: one United States district moving its first bell from 07:15 to 08:45 recorded attendance rises, fewer traffic accidents involving student drivers, and mathematics grades up half a grade point within a year. Critics note costs — bus rescheduling, sports fixtures, and parental routines built around early starts. Economists counter that the benefits compound: better sleep predicts stronger memory consolidation, which underpins the very examination outcomes schools exist to improve. Several national bodies now recommend no secondary school begins before 08:30, though implementation remains patchy and politically contested.",
    items: [
      { id: "ac-read-2-q1", kind: "mcq", prompt: "What biological change affects teenage sleep?", options: ["They need less sleep than children", "Their body clock shifts later during puberty", "They sleep more deeply", "Their melatonin production stops"], answer: "Their body clock shifts later during puberty", explain: "Circadian rhythm shifts up to two hours later in puberty." },
      { id: "ac-read-2-q2", kind: "tfng", prompt: "The US district's later start improved maths grades.", options: ["True", "False", "Not Given"], answer: "True", explain: "Mathematics grades rose half a grade point within a year." },
      { id: "ac-read-2-q3", kind: "mcq", prompt: "How do economists respond to critics of later start times?", options: ["Costs are irrelevant", "Better sleep improves memory and therefore the exam results schools aim for", "Parents should adapt completely", "Sports matter more than sleep"], answer: "Better sleep improves memory and therefore the exam results schools aim for", explain: "Benefits compound via memory consolidation underlying exam outcomes." },
      { id: "ac-read-2-q4", kind: "gap", prompt: "National bodies recommend secondary schools begin no earlier than ______.", answer: "08:30", explain: "Final sentence recommends 08:30 starts; accept 8:30." },
    ],
  },
  {
    id: "ac-read-3", variant: "ACADEMIC", section: "Section 3",
    title: "Reading the ice: ship logbooks as climate archives",
    passage: "When climatologists wanted sea-ice records older than satellites, they turned to an unlikely archive: whalers' logbooks. British Arctic whaling crews from 1750 to 1850 recorded daily positions, weather and — crucially — the edge of the ice, because their livelihood depended on finding open water. Transcribing 40,000 logbook pages, historians and scientists reconstructed summer ice boundaries decade by decade. The series shows the late-eighteenth-century hunt pushing progressively north as the ice retreated, then a sudden advance around 1810 correlated with volcanic aerosols cooling the hemisphere after the 1809 unknown eruption and the 1815 Tambora explosion. Logbook data carry caveats: positions relied on dead reckoning before cheap chronometers, and captains occasionally exaggerated danger to justify failed seasons. Cross-checks against diaries, customs manifests and modern ice-core chemistry filter much of this noise. The project's deeper lesson is methodological — commercial records, kept for profit rather than science, can become rigorous evidence when their biases are modelled rather than ignored.",
    items: [
      { id: "ac-read-3-q1", kind: "mcq", prompt: "Why did whalers record the ice edge so carefully?", options: ["Science interest", "Open water was essential to their catch and income", "Insurance requirements", "Naval orders"], answer: "Open water was essential to their catch and income", explain: "Their livelihood depended on finding open water." },
      { id: "ac-read-3-q2", kind: "tfng", prompt: "The 1810 ice advance has been linked to volcanic cooling.", options: ["True", "False", "Not Given"], answer: "True", explain: "Correlated with aerosols after eruptions in 1809 and 1815." },
      { id: "ac-read-3-q3", kind: "mcq", prompt: "Which problem with logbook data is NOT mentioned?", options: ["Imprecise position fixing", "Captains exaggerating dangers", "Weather damage to paper", "Commercial bias"], answer: "Weather damage to paper", explain: "Dead reckoning error, exaggeration and bias appear; paper damage does not." },
      { id: "ac-read-3-q4", kind: "gap", prompt: "Before cheap chronometers, ships' positions were estimated by ______.", answer: "dead reckoning", explain: "Stated directly in the caveat paragraph." },
    ],
  },
  {
    id: "gt-read-1", variant: "GENERAL", section: "Section 1",
    title: "Notices: community pool",
    passage: "RIVERSIDE COMMUNITY POOL — SUMMER NOTICE.\nOpening hours: weekdays 06:30–21:00, weekends 08:00–18:00. The learner pool closes 30 minutes before the main pool. Adult-only lap swimming: 06:30–09:00 and 19:00–close on weekdays. Children under 8 must be supervised in the water by an adult at all times; one adult may supervise up to two children. Lockers require a £1 coin, returned on exit. From 1 July, cash is no longer accepted at reception; pay by card or the Riverside app. Monthly unlimited passes cost £38 (adults), £24 (over-60s and students with ID). Refunds for cancelled classes are credited to your account, not issued in cash. Inflatable fun sessions run Saturdays 14:00–16:00 and replace public swimming in the main pool during that time.",
    items: [
      { id: "gt-read-1-q1", kind: "mcq", prompt: "When can adults swim laps without children in the pool on weekdays?", options: ["06:30–09:00 and after 19:00", "Any weekday morning", "Saturday 14:00–16:00", "Weekends only"], answer: "06:30–09:00 and after 19:00", explain: "Adult-only sessions: 06:30–09:00 and 19:00–close on weekdays." },
      { id: "gt-read-1-q2", kind: "tfng", prompt: "One adult may watch three children aged 7 in the water.", options: ["True", "False", "Not Given"], answer: "False", explain: "One adult supervises up to two children under 8." },
      { id: "gt-read-1-q3", kind: "mcq", prompt: "How do you get money back for a cancelled class?", options: ["Cash at reception", "Credit to your account", "Cheque by post", "No refunds are given"], answer: "Credit to your account", explain: "Refunds are credited, not paid in cash." },
      { id: "gt-read-1-q4", kind: "gap", prompt: "A student monthly pass costs £______ with ID.", answer: "24", explain: "Over-60s and students pay £24." },
    ],
  },
  {
    id: "gt-read-2", variant: "GENERAL", section: "Section 2",
    title: "Staff handbook: working from home",
    passage: "Northgate Logistics permits hybrid remote work for office roles after probation. Staff may work from home up to three days weekly, agreed with line managers by the previous Thursday. Core collaboration hours are 10:00–15:00; outside these, flexible scheduling applies provided weekly hours are met. Company laptops must connect through the approved VPN; printing client documents at home is prohibited for data-protection reasons. Homeworkers claim a £6 monthly contribution toward energy costs upon submitting the online form once per tax year. Equipment beyond the standard kit (chair, monitor riser) requires occupational-health approval. Managers should judge remote staff on outputs, not visible online status; monitoring software beyond standard logging is not permitted. If a homeworker is ill, normal sickness-reporting rules apply — remote work is not a substitute for sick leave.",
    items: [
      { id: "gt-read-2-q1", kind: "mcq", prompt: "Who approves extra equipment such as a special chair?", options: ["Line manager", "Occupational health", "HR director", "IT helpdesk"], answer: "Occupational health", explain: "Non-standard equipment needs occupational-health approval." },
      { id: "gt-read-2-q2", kind: "tfng", prompt: "Staff must be visibly online throughout core hours.", options: ["True", "False", "Not Given"], answer: "False", explain: "Managers judge outputs, not visible online status." },
      { id: "gt-read-2-q3", kind: "mcq", prompt: "How often is the energy-cost form submitted?", options: ["Monthly", "Once per tax year", "Every week worked from home", "Only when equipment changes"], answer: "Once per tax year", explain: "Submitted once per tax year for the £6 monthly credit." },
      { id: "gt-read-2-q4", kind: "gap", prompt: "Remote-work days must be agreed with managers by ______ each week.", answer: "Thursday", explain: "Agreed by the previous Thursday." },
    ],
  },
  {
    id: "gt-read-3", variant: "GENERAL", section: "Section 3",
    title: "The craft of letterpress revival",
    passage: "In an age of instant digital print, a small band of artisans is keeping letterpress alive — printing from metal type pressed into paper. The revival began, oddly, with design students: bored by flawless screens, they sought the deep impression and slight irregularity that only hand-set type gives. Workshops that once trained apprentices for newspapers now run weekend courses where lawyers, nurses and retirees ink their first business card. Machines matter less than material knowledge. A printer must read the grain of paper, mix ink to humidity, and pack the platen so pressure falls evenly across a forme of mixed type heights. Old hands argue these judgements cannot be videoed, only transmitted beside the press — which is why the few remaining masters, most in their seventies, are courted by studios worldwide. Collectors now pay premium prices for posters printed in editions of fifty. Sceptics call it nostalgia; practitioners reply that constraints breed creativity, and that a craft surviving by teaching patience has proved its worth.",
    items: [
      { id: "gt-read-3-q1", kind: "mcq", prompt: "What first drove the letterpress revival?", options: ["Cheap old machines", "Design students seeking character absent from screens", "Newspaper demand", "Collector investment"], answer: "Design students seeking character absent from screens", explain: "Revival began with design students bored by flawless screens." },
      { id: "gt-read-3-q2", kind: "tfng", prompt: "Most remaining master printers are young apprentices.", options: ["True", "False", "Not Given"], answer: "False", explain: "The few remaining masters are mostly in their seventies." },
      { id: "gt-read-3-q3", kind: "mcq", prompt: "Which judgement does the passage say a printer must make?", options: ["Choosing fonts from catalogues", "Mixing ink according to humidity", "Programming press robots", "Negotiating paper prices"], answer: "Mixing ink according to humidity", explain: "Material knowledge includes mixing ink to humidity." },
      { id: "gt-read-3-q4", kind: "gap", prompt: "Collectors pay premium prices for posters printed in editions of ______.", answer: "fifty", explain: "Editions of fifty; accept 50." },
    ],
  },
];

/** Listening and Speaking are shared across Academic and General Training. */
export const LISTENING_SETS: ListeningSet[] = [
  {
    id: "lis-1", title: "Gym membership enquiry", context: "Form completion — notes",
    script: "AGENT: Good morning, Northfield Sports Centre, how can I help?\nCALLER: Hello — I'd like details about joining. I saw your poster mentions an off-peak rate?\nAGENT: Yes. Off-peak membership covers entry before four p.m. on weekdays and costs thirty-two pounds fifty a month. Full access any time is forty-one pounds.\nCALLER: And the pool — is it included?\nAGENT: Both include the pool and classes, though spin cycling has a two-pound supplement per session. You can join online or here at reception — just bring photo ID and a direct debit. We're closed bank holidays, otherwise open seven days, eight till ten weekdays and nine till six weekends.\nCALLER: Perfect, thanks — I'll come Saturday morning.",
    items: [
      { id: "lis-1-q1", kind: "gap", prompt: "Off-peak monthly fee: £______", answer: "32.50", explain: "\"thirty-two pounds fifty\"; accept 32,50." },
      { id: "lis-1-q2", kind: "gap", prompt: "Off-peak entry allowed before ______ on weekdays.", answer: "4 pm", explain: "Before four p.m.; accept 4pm / 16:00." },
      { id: "lis-1-q3", kind: "mcq", prompt: "What extra cost applies to spin classes?", options: ["£2 per session", "Included free", "£1.50 per session", "Monthly supplement"], answer: "£2 per session", explain: "Two-pound supplement per session." },
      { id: "lis-1-q4", kind: "mcq", prompt: "What must the caller bring to join?", options: ["Photo ID and direct-debit details", "A doctor's note", "Two passport photos", "Proof of address only"], answer: "Photo ID and direct-debit details", explain: "Bring photo ID and a direct debit." },
    ],
  },
  {
    id: "lis-2", title: "University library orientation", context: "Multiple choice + sentence completion",
    script: "LIBRARIAN: Welcome everyone. Borrowing allowances depend on your course: undergraduates twelve books, postgraduates twenty. Standard loan is four weeks, but anything marked 'short loan' returns after three days — fines are twenty pence a day, capped at five pounds. Renew twice online unless someone has reserved the item. Level two holds sciences, level three humanities, and the silent-study floor is level four — no conversations there at all, please. Group-work rooms on level one book out via the website for up to two hours daily. Printing costs five pence a side; add credit at the kiosk by the entrance. Finally, the 24-hour study zone sits in the annex — swipe your student card after midnight when the main doors lock.",
    items: [
      { id: "lis-2-q1", kind: "gap", prompt: "Postgraduate borrowing allowance: ______ books", answer: "20", explain: "Postgraduates borrow twenty." },
      { id: "lis-2-q2", kind: "gap", prompt: "Daily fine: ______ pence", answer: "20", explain: "Twenty pence a day." },
      { id: "lis-2-q3", kind: "mcq", prompt: "Where must visitors stay completely silent?", options: ["Level four", "Group rooms", "The annex", "Level two"], answer: "Level four", explain: "Silent-study floor is level four." },
      { id: "lis-2-q4", kind: "mcq", prompt: "How do you access the annex after midnight?", options: ["Swipe student card", "Ask security", "Through level one", "It closes at midnight"], answer: "Swipe student card", explain: "Swipe your card after the main doors lock." },
    ],
  },
  {
    id: "lis-3", title: "Booking a repair appointment", context: "Table completion",
    script: "AGENT: CityFix appliance repairs.\nCUSTOMER: My washing machine is leaking. Can you send someone this week?\nAGENT: Of course. Postcode first?\nCUSTOMER: EH12 5AB.\nAGENT: Thanks. Engineers cover your area Tuesdays and Thursdays, mornings only. It's a ninety-pound call-out covering diagnosis and minor parts; major parts quoted separately. Which day suits?\nCUSTOMER: Thursday morning. Do I need to be home?\nAGENT: An adult over eighteen must be present for insurance. Payment is taken after the visit — card preferred. You'll receive a text confirming the two-hour arrival window the evening before.\nCUSTOMER: Thursday it is.",
    items: [
      { id: "lis-3-q1", kind: "gap", prompt: "Engineer days available: Tuesdays and ______", answer: "Thursdays", explain: "Tuesdays and Thursdays, mornings only." },
      { id: "lis-3-q2", kind: "gap", prompt: "Call-out charge: £______", answer: "90", explain: "Ninety pounds; accept 90.00." },
      { id: "lis-3-q3", kind: "mcq", prompt: "Who must be present during the repair?", options: ["An adult over 18", "The account holder only", "No one", "A neighbour"], answer: "An adult over 18", explain: "Insurance requires an adult over eighteen." },
      { id: "lis-3-q4", kind: "mcq", prompt: "When does the customer learn the arrival window?", options: ["The evening before, by text", "At booking", "On the morning, by call", "Never — engineers just arrive"], answer: "The evening before, by text", explain: "Text confirms two-hour window the evening before." },
    ],
  },
  {
    id: "lis-4", title: "Radio item: coastal cleanup", context: "Note completion — plural care",
    script: "PRESENTER: Last September's harbour cleanup collected eleven tonnes of rubbish in a single weekend — double the previous year. Organiser Maria Voss credits school clubs: 'We stopped lecturing adults and started equipping fourteen-year-olds with grabbers and gloves.' This year's event expands to three beaches; volunteers meet at the lifeboat station, where parking is free but limited, so organisers urge car-sharing or the special bus from the station forecourt leaving hourly from eight a.m. Gloves and bags are provided; bring your own water bottle — last year volunteers left behind two hundred plastic bottles, which rather defeated the object! Registration closes Friday; walk-ins accepted only before ten a.m.",
    items: [
      { id: "lis-4-q1", kind: "gap", prompt: "Last year's haul: ______ tonnes", answer: "11", explain: "Eleven tonnes." },
      { id: "lis-4-q2", kind: "mcq", prompt: "Where do volunteers gather?", options: ["Lifeboat station", "Harbour gate", "Station forecourt", "Beach cafe"], answer: "Lifeboat station", explain: "Volunteers meet at the lifeboat station." },
      { id: "lis-4-q3", kind: "mcq", prompt: "What should volunteers bring?", options: ["Water bottle", "Gloves", "Rubbish bags", "Parking permit"], answer: "Water bottle", explain: "Gloves and bags provided; bring your own bottle." },
      { id: "lis-4-q4", kind: "gap", prompt: "Special buses leave hourly from ______ a.m.", answer: "8", explain: "From eight a.m.; accept eight." },
    ],
  },
];

export const WRITING_TASKS: WritingTask[] = [
  {
    id: "ac-w1", variant: "ACADEMIC", task: "T1", title: "Academic Task 1 — table",
    prompt: "The table shows household spending in one European country across three years. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    minWords: 150, minutes: 20,
    data: ["Category | 2000 | 2010 | 2020", "Housing | 22% | 28% | 34%", "Food | 25% | 19% | 15%", "Transport | 14% | 13% | 11%", "Communication | 2% | 6% | 9%", "Leisure | 9% | 12% | 13%"],
    sampleAnswer: "The table compares the proportion of household expenditure devoted to five categories in 2000, 2010 and 2020. Overall, housing grew steadily to become the dominant expense, while food showed the sharpest decline, and communication spending almost quintupled from the smallest base. Housing accounted for just over a fifth of spending in 2000 but rose in each subsequent decade, reaching 34% by 2020. By contrast, food fell from a quarter of the budget to 15%, losing its place as the largest category sometime before 2010. Transport declined slightly throughout, whereas leisure climbed modestly from 9% to 13%. The most dramatic change concerned communication: at a mere 2% in 2000, it overtook transport by 2020 to reach 9%. Taken together, the figures suggest spending shifted from essentials toward housing and technology-driven services.",
    sampleBand: "7.5 — clear overview, accurate selection, controlled comparisons, range of change language.",
  },
  {
    id: "ac-w2", variant: "ACADEMIC", task: "T1", title: "Academic Task 1 — process",
    prompt: "The diagram describes how recycled paper is produced. Write a report describing the main stages of the process.",
    minWords: 150, minutes: 20,
    data: ["Stages: collection of used paper → sorting and removal of staples/plastic → pulping with water and chemicals → cleaning and de-inking → pressing and drying → rolling into new paper"],
    sampleAnswer: "The diagram illustrates the sequence of operations involved in manufacturing recycled paper, from the collection of waste material to the production of finished rolls. Overall, the process comprises six main stages, beginning with gathering used paper and ending mechanically, with de-inking representing the key cleaning phase. First, used paper is collected from households and businesses and transported to a recycling facility, where workers remove contaminants such as staples and plastic film during sorting. The sorted paper then undergoes pulping, in which it is mixed with water and chemicals and broken down into fibres. The resulting pulp passes through a cleaning stage where residual ink is stripped out. In the final stages, the clean pulp is pressed to extract water and dried, before being rolled into large reels of new paper ready for distribution.",
    sampleBand: "7.0 — logical sequencing, passive voice handled accurately, appropriate process vocabulary.",
  },
  {
    id: "ac-w3", variant: "ACADEMIC", task: "T2", title: "Academic Task 2 — discussion essay",
    prompt: "Some people believe universities should only offer places to students with the highest examination results. Others argue that admission should consider wider qualities and potential. Discuss both views and give your own opinion. Give reasons and examples.",
    minWords: 250, minutes: 40,
    sampleAnswer: "Whether university admission should rest solely on examination scores divides opinion. This essay discusses both positions before arguing that a balanced admissions policy serves students and society better. Supporters of grade-based selection emphasise fairness and simplicity. Identical exams sat under identical conditions appear to treat every applicant alike, and objective cut-offs avoid the suspicion of favouritism that surrounds interviews or portfolios. Universities also face thousands of applications; a transparent threshold keeps selection administrable. However, examinations capture only a narrow slice of ability. A candidate who cared for siblings through school may show resilience and time-management that no paper rewards, while coaching can inflate privileged students' scores. Research on graduate outcomes suggests prior attainment predicts first-year marks far better than degree performance or career success, implying that rigid thresholds select test-takers rather than future professionals. In my view, grades should anchor admissions but not monopolise them. Contextual offers and structured assessments of potential correct for disadvantage without abandoning merit, producing intakes both fairer and, ultimately, more capable.",
    sampleBand: "8.0 — sustained position, logical paragraphing, precise hedging and academic lexis.",
  },
  {
    id: "gt-w1", variant: "GENERAL", task: "T1", title: "General Training Task 1 — formal letter",
    prompt: "You recently bought a piece of equipment for your kitchen, but it did not work properly. You phoned the shop but received no help. Write a letter to the shop manager. In your letter: describe the purchase and the problem; explain why the phone call did not help; say what you want the manager to do.",
    minWords: 150, minutes: 20,
    sampleAnswer: "Dear Sir or Madam,\n\nI am writing regarding a blender purchased from your High Street branch on 3 March, receipt number 88231, which has failed to operate correctly since the day of purchase. Although the motor runs, the blade assembly spins loosely and the machine cannot crush even soft fruit.\n\nI telephoned your customer-service line on 5 March and waited twenty-five minutes before speaking to an advisor, who promised a call back within two working days. That call never came, and a second attempt the following week ended with a suggestion to 'check the manual', which addresses nothing of this kind.\n\nAs the appliance is under warranty, I would like either a replacement unit or a full refund, and confirmation in writing of which you will provide. I can return the item with the original packaging at short notice.\n\nI look forward to your prompt reply.\n\nYours faithfully,\nD. Whitmore",
    sampleBand: "7.5 — appropriate formal register, all bullet points covered, precise complaint vocabulary.",
  },
  {
    id: "gt-w2", variant: "GENERAL", task: "T1", title: "General Training Task 1 — semi-formal/informal letter",
    prompt: "A friend has agreed to look after your flat and pet while you are on holiday. Write a letter to your friend. In your letter: describe arrangements for the pet; explain where things are in the flat; suggest something enjoyable your friend could do in the area.",
    minWords: 150, minutes: 20,
    sampleAnswer: "Hi Priya,\n\nThanks again for agreeing to keep an eye on everything while I'm in Lisbon — it's a huge relief knowing the place is in your hands!\n\nBiscuit the cat is easier than she looks. Feed her half a pouch morning and night (the box is on top of the fridge), and leave fresh water by the window. She'll scratch the sofa unless her post is by the radiator — she's obsessed with it.\n\nEverything else you need is in the kitchen: spare keys hang inside the cupboard left of the sink, and the washing-machine trick is turning the dial twice before pressing start. Heating controls are in the hallway cupboard if evenings turn cold.\n\nDo make the most of the area while you're there — the Sunday market two streets away does the best pastries in town, and the riverside path is lovely at sunset.\n\nHave fun, and thank you a million times!\n\nAlex",
    sampleBand: "7.5 — natural informal tone, fully developed bullets, idiomatic and specific.",
  },
  {
    id: "gt-w3", variant: "GENERAL", task: "T2", title: "General Training Task 2 — opinion essay",
    prompt: "Many employees now work remotely several days a week. Do the advantages of home working outweigh the disadvantages? Give reasons and examples from your own knowledge.",
    minWords: 250, minutes: 40,
    sampleAnswer: "Remote work has moved from rare privilege to routine arrangement, and opinion remains split over whether the gains outweigh the losses. I believe the advantages clearly dominate for most office workers, provided employers manage the risks deliberately. The strongest case for home working concerns time and focus. Commuting consumes hours weekly that staff can redirect to family, exercise or additional productive work, and quiet environments suit deep tasks such as analysis and writing better than noisy open-plan offices. Employers benefit too: studies of hybrid firms report lower premises costs and reduced staff turnover, since flexibility ranks among the most valued benefits when candidates compare offers. Admittedly, drawbacks are real. New employees may struggle to absorb company culture through a screen, and the blurring of home and office invites overwork; some remote staff report loneliness that erodes wellbeing over months. Yet these problems respond to management — structured induction, occasional anchor-days in the office and clear right-to-disconnect policies address each risk directly. Weighing the alternatives, reclaimed commuting time and improved concentration outweigh difficulties that policy, rather than luck, can solve. On balance, home working deserves its place as a permanent option.",
    sampleBand: "7.5 — clear overall position, concession handled, cohesive devices used flexibly.",
  },
];

export const SPEAKING_CARDS: SpeakingCard[] = [
  { id: "sp-p1-1", part: 1, topic: "Work and study", prompts: ["Do you work or are you a student?", "What do you find most interesting about it?", "Would you change anything about your routine?", "How do you relax after a busy day?"] },
  { id: "sp-p1-2", part: 1, topic: "Your home area", prompts: ["Tell me about the area you live in.", "Has it changed much recently?", "What do visitors usually like there?", "Would you like to move somewhere else one day?"] },
  { id: "sp-p1-3", part: 1, topic: "Screens and free time", prompts: ["How much time do you spend looking at screens daily?", "Has this changed compared with five years ago?", "Do you think people rely on phones too much?", "What do you do offline to unwind?"] },
  { id: "sp-p2-1", part: 2, topic: "Describe a skill you learned quickly", prompts: ["what the skill was", "how you learned it", "who or what helped you", "and explain why you managed to learn it quickly"], prepSeconds: 60, speakSeconds: 120, followUps: ["Is it common for people in your country to learn this skill?", "Are practical skills better learned alone or with others?"] },
  { id: "sp-p2-2", part: 2, topic: "Describe a decision you took without much thought", prompts: ["what the decision was", "when you made it", "what happened as a result", "and explain why you decided quickly"], prepSeconds: 60, speakSeconds: 120, followUps: ["Do you think quick decisions are usually worse than careful ones?", "Should important decisions always take a long time?"] },
  { id: "sp-p2-3", part: 2, topic: "Describe a place you go to relax", prompts: ["where it is", "when you first went there", "what you do there", "and explain why it helps you relax"], prepSeconds: 60, speakSeconds: 120, followUps: ["Are public spaces valued enough in modern cities?", "Why do some people find it hard to switch off?"] },
  { id: "sp-p2-4", part: 2, topic: "Describe a piece of advice you would give a younger person", prompts: ["what the advice is", "who gave it to you originally", "why it matters", "and explain how a younger person could apply it"], prepSeconds: 60, speakSeconds: 120, followUps: ["Whose advice do young people trust most today?", "Has internet advice replaced advice from family?"] },
  { id: "sp-p3-1", part: 3, topic: "Education and technology", prompts: ["Should schools limit screen use in lessons?", "Will teachers be replaced by artificial-intelligence tutors?", "How has technology changed how people revise for exams?", "Does easy access to information make learning superficial?"] },
  { id: "sp-p3-2", part: 3, topic: "Cities and quality of life", prompts: ["What makes a city pleasant to live in?", "Should governments restrict cars from city centres?", "How could cities become friendlier to older residents?", "Is city life becoming too expensive to justify?"] },
  { id: "sp-p3-3", part: 3, topic: "Consumer culture", prompts: ["Why do people buy brands rather than cheaper equivalents?", "Does advertising exploit emotions unfairly?", "Will second-hand shopping keep growing?", "Who bears responsibility for the environmental cost of consumption?"] },
];

/* ------------------------------------------------------------------ */
/* Grading                                                             */
/* ------------------------------------------------------------------ */

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/[.,!?;:'"]/g, "").replace(/\s+/g, " ").replace(/^£/, "").replace(/(\d)\s*(pm|a\.m\.|am)$/, "$1$2");
}

export interface AnswerReport { id: string; correct: boolean; given: string; expected: string; explain: string }

export function gradeObjectiveItems(items: ObjectiveItem[], answers: Record<string, string>): { raw: number; total: number; percent: number; perItem: AnswerReport[] } {
  let raw = 0;
  const perItem = items.map((item) => {
    const given = (answers[item.id] ?? "").trim();
    const expected = item.answer;
    const correct = normalise(given).length > 0 && (normalise(given) === normalise(expected)
      || (item.kind !== "mcq" && normalise(expected).split("/").some((alt) => alt.trim() && normalise(given) === normalise(alt))));
    if (correct) raw += 1;
    return { id: item.id, correct, given, expected, explain: item.explain };
  });
  const total = items.length || 1;
  return { raw, total: items.length, percent: Math.round((raw / total) * 100), perItem };
}

/** Refined band mapping (internal estimate only). */
export function bandFromPercent(percent: number): number {
  const table: Array<[number, number]> = [[95, 9], [88, 8.5], [81, 8], [74, 7.5], [67, 7], [61, 6.5], [55, 6], [49, 5.5], [43, 5], [37, 4.5], [30, 4]];
  for (const [min, band] of table) if (percent >= min) return band;
  return 3.5;
}

export function roundHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export function overallBand(skillPercents: Partial<Record<IeltsSkill, number>>): number {
  const values = Object.values(skillPercents).filter((v): v is number => typeof v === "number");
  if (!values.length) return 0;
  const bands = values.map((v) => bandFromPercent(v));
  return roundHalf(bands.reduce((sum, b) => sum + b, 0) / bands.length);
}

const T1_DATA_LEXIS = ["increase", "decrease", "rise", "fall", "peak", "proportion", "percentage", "decline", "grow", "compared", "whereas", "while", "overall"];

/** Heuristic writing scorer (internal estimate only). */
export function scoreIeltsWriting(task: WritingTask, text: string): { percent: number; feedback: string[] } {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = trimmed.toLowerCase();
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 2).length;
  const paragraphs = trimmed.split(/\n\s*\n|\r\n\s*\r\n/).filter((p) => p.trim()).length || (wordCount > 0 ? 1 : 0);
  const linkers = ["however", "moreover", "furthermore", "in contrast", "by contrast", "therefore", "consequently", "although", "while", "on the other hand", "for instance", "for example"].filter((l) => lower.includes(l)).length;
  const feedback: string[] = [];
  const targetMin = task.minWords;
  const lengthScore = Math.min(wordCount / targetMin, 1.15);
  let percent = 0;

  if (task.task === "T1") {
    const lexisHits = T1_DATA_LEXIS.filter((w) => lower.includes(w)).length;
    percent = Math.round(Math.min(100, lengthScore * 42 + Math.min(sentences / 8, 1) * 18 + Math.min(linkers / 3, 1) * 15 + Math.min(lexisHits / 5, 1) * 25));
    if ((task.data?.length ?? 0) > 0 && !/\d/.test(trimmed)) feedback.push("Reference actual figures from the visual — a data task without numbers reads as invented.");
    if (!lower.includes("overall")) feedback.push("Add an 'Overall' statement summarising the main trend(s); examiners look for it.");
  } else {
    percent = Math.round(Math.min(100, lengthScore * 44 + Math.min(paragraphs / 4, 1) * 18 + Math.min(sentences / 12, 1) * 16 + Math.min(linkers / 4, 1) * 22));
    const asksOpinion = /your opinion|do the advantages|agree or disagree|discuss both/.test(task.prompt.toLowerCase());
    if (asksOpinion && !/(i believe|i think|in my view|in my opinion|from my perspective)/.test(lower)) feedback.push("State a clear personal position — the rubric explicitly requires your opinion.");
  }
  if (wordCount < targetMin) feedback.push(`Under length: ${wordCount}/${targetMin} words — penalties apply below ${targetMin}.`);
  else if (wordCount > targetMin * 2.2) feedback.push("Very long responses drift off-topic; trim to the strongest arguments.");
  if (paragraphs < 3 && task.task === "T2") feedback.push("Essay structure needs at least introduction, body and conclusion paragraphs.");
  if (linkers < 2) feedback.push("Use cohesive devices (however, moreover, consequently…) to link ideas explicitly.");
  if (sentences > 0 && wordCount / sentences > 32) feedback.push("Average sentence length is very high — break up long sentences for clarity.");
  if (!feedback.length) feedback.push("Solid structure and coverage. For a higher band, sharpen precision of vocabulary and vary sentence openings.");
  return { percent, feedback };
}

export interface SpeakingRubricScore { fluencyCoherence: "weak" | "okay" | "good"; lexicalResource: "weak" | "okay" | "good"; grammaticalRange: "weak" | "okay" | "good"; pronunciation: "weak" | "okay" | "good" }

export function scoreSpeakingRubric(rubric: SpeakingRubricScore, completedTiming: boolean): { percent: number; feedback: string[] } {
  const weights = { weak: 35, okay: 65, good: 90 };
  const base = (weights[rubric.fluencyCoherence] + weights[rubric.lexicalResource] + weights[rubric.grammaticalRange] + weights[rubric.pronunciation]) / 4;
  const percent = Math.round(base * (completedTiming ? 1 : 0.85));
  const feedback: string[] = [];
  const entries: Array<[string, keyof SpeakingRubricScore]> = [
    ["Fluency & coherence", "fluencyCoherence"],
    ["Lexical resource", "lexicalResource"],
    ["Grammatical range & accuracy", "grammaticalRange"],
    ["Pronunciation", "pronunciation"],
  ];
  for (const [label, key] of entries) {
    const rating = rubric[key];
    if (rating === "weak") feedback.push(`${label}: rated weak — extend answers to 3–4 sentences with one concrete example.`);
    if (rating === "good") feedback.push(`${label}: rated good — maintain this range under exam pressure.`);
  }
  if (!completedTiming) feedback.push("You ended before the full speaking time — pacing to the clock is itself a scored skill.");
  return { percent, feedback };
}

export interface GapReport { band: number; target: BandTarget; meetsTarget: boolean; gap: number; recommendations: string[] }

export function gapToTarget(skillPercents: Partial<Record<IeltsSkill, number>>, target: BandTarget): GapReport {
  const band = overallBand(skillPercents);
  const meetsTarget = band >= target - 0.001;
  const gap = roundHalf(Math.max(0, target - band));
  const recommendations: string[] = [];
  const weakest = (Object.entries(skillPercents) as Array<[IeltsSkill, number]>).sort((a, b) => a[1] - b[1]).slice(0, 2);
  for (const [skill, percent] of weakest) {
    recommendations.push(`${skill.charAt(0).toUpperCase()}${skill.slice(1)} is your weakest skill (${percent}%) — schedule its timed practice twice this week.`);
  }
  if (!meetsTarget) recommendations.push(`You are ${gap} bands from your ${target} target. Focus modules above target-weighted drills close gaps fastest.`);
  else recommendations.push(`Internal estimate meets your ${target} target — keep sharp with weekly full mocks.`);
  return { band, target, meetsTarget, gap, recommendations };
}

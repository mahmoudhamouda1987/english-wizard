import type { CEFRLevel } from "./learner";

/**
 * THE FLUENCY TRACK (2.0 contract, Parts 77–84).
 * A standalone spoken-fluency programme for B1 → C2 learners.
 * Not an exam course. Business Fluency and Life Fluency dual tracks share
 * the same sixteen signature modules; each module labels which track(s) it serves.
 *
 * Design rules enforced here:
 * - Entry gate: learners below B1 are routed back to General English (Part 78).
 * - Module flow: explanation → drills → guided role-play → pressure role-play
 *   → checkpoint → feedback → weak-spot update → Conversation Gym (Part 80).
 * - Personas give every role-play a distinct character (Part 82).
 * - Scoring is honest: CEFR sub-level ranges only, never invented precision (Part 84).
 */

export type FluencyTrack = "BUSINESS" | "LIFE" | "DUAL";
export type FluencyStage = "explanation" | "drills" | "guided" | "pressure" | "checkpoint";

export interface FluencyPersona {
  name: string;
  role: string;
  personality: string;
  objective: string;
  tone: string;
  /** 1 (relaxed) … 3 (demanding). Drives pacing and follow-up pressure. */
  pressure: 1 | 2 | 3;
}

export interface FluencyDrill {
  /** Short production prompt the learner answers aloud in one or two turns. */
  prompt: string;
  /** Language the learner is expected to reach for. */
  usefulLanguage: string[];
}

export interface FluencyModule {
  id: string;
  number: number;
  title: string;
  band: Extract<CEFRLevel, "B1" | "B2" | "C1" | "C2">;
  track: FluencyTrack;
  purpose: string;
  objectives: string[];
  /** ~10 minutes of comprehension input before production work. */
  explanation: {
    keyIdea: string;
    principles: string[];
    modelDialogue: { speaker: "A" | "B"; line: string }[];
  };
  drills: FluencyDrill[];
  guidedRoleplay: {
    scenario: string;
    goal: string;
    persona: FluencyPersona;
    supports: string[];
    opener: string;
    fallbacks: string[];
    targetPhrases: string[];
  };
  pressureRoleplay: {
    scenario: string;
    goal: string;
    persona: FluencyPersona;
    complication: string;
    opener: string;
    fallbacks: string[];
    targetPhrases: string[];
  };
  checkpoint: {
    task: string;
    criteria: string[];
    /** Honest CEFR sub-level bands used in feedback, never spurious decimals. */
    feedbackBands: string[];
  };
  gymTieIn: string;
}

const b1Modules: FluencyModule[] = [
  {
    id: "ft-1",
    number: 1,
    title: "Everyday Transactions & Small Talk",
    band: "B1",
    track: "DUAL",
    purpose: "Handle daily exchanges comfortably and open conversations with strangers without hesitation.",
    objectives: [
      "Open, sustain and close a short social exchange",
      "Use softeners so requests sound natural rather than abrupt",
      "Keep small talk alive with follow-up questions",
    ],
    explanation: {
      keyIdea: "Fluent speakers keep transactions light: they soften, react, and extend.",
      principles: [
        "Lead with a softener: 'Sorry to bother you…', 'Hi, quick question…'",
        "React before you redirect: 'Oh nice — and do you…?'",
        "Close warmly: 'Cheers, have a good one.'",
      ],
      modelDialogue: [
        { speaker: "A", line: "Sorry to bother you — do you know if this train stops at Manchester Piccadilly?" },
        { speaker: "B", line: "It does, but you'll need to change at Sheffield." },
        { speaker: "A", line: "Ah, brilliant, thanks. Is it a long wait in Sheffield?" },
        { speaker: "B", line: "About fifteen minutes, usually." },
        { speaker: "A", line: "Perfect, that's no problem at all. Cheers for your help!" },
      ],
    },
    drills: [
      { prompt: "Ask a colleague you barely know about their weekend — then ask one genuine follow-up question.", usefulLanguage: ["Did you end up going?", "How did that go?", "Oh nice — was it…?"] },
      { prompt: "Softly ask a stranger to move their bag off the seat next to you.", usefulLanguage: ["Sorry to bother you", "Would you mind…?", "Cheers"] },
      { prompt: "Return something to a shop without a receipt, politely but firmly.", usefulLanguage: ["Unfortunately", "I'd rather", "Would it be possible…?"] },
    ],
    guidedRoleplay: {
      scenario: "You've just joined a local gym and you're picking up your membership card. The receptionist is chatty.",
      goal: "Complete the transaction AND keep a 6-turn friendly exchange going.",
      persona: { name: "Debbie", role: "gym receptionist", personality: "warm, chatty, easily sidetracked", objective: "get you sorted while having a natter", tone: "friendly northern English", pressure: 1 },
      supports: ["'How long have you worked here?' keeps any conversation going.", "React first: 'Oh really?' then ask your next question.", "You can buy time with 'Let me think…'"],
      opener: "Morning! You must be the new sign-up — I've got your card right here.",
      fallbacks: ["So, what made you choose our gym, then?", "Ha, you'll be sick of the sight of this place by March!", "Right — card's activated. Any questions?", "Honestly, the Tuesday classes are the best ones.", "Lovely. Well, see you on the floor sometime!"],
      targetPhrases: ["Oh really?", "How long have you", "Cheers, have a good one"],
    },
    pressureRoleplay: {
      scenario: "You're at a customer-service desk. The person in front of you is taking forever and you have a train to catch.",
      goal: "Get served in time WITHOUT being rude — politeness under pressure.",
      persona: { name: "Craig", role: "service desk clerk", personality: "unhurried, slightly defensive", objective: "follow procedure at his own pace", tone: "flat, procedural", pressure: 3 },
      complication: "Craig tells you the system is down and you'll have to come back tomorrow.",
      opener: "Next! … Yeah?",
      fallbacks: ["I can't do that, mate, the system's down.", "You'll have to take it up with the train company, not us.", "Look, everyone here's in the same boat.", "Right, right — I'm going as fast as I can.", "Fine. Give me two minutes."],
      targetPhrases: ["I completely understand, however…", "Is there anything we could do…", "I'd really appreciate it if…"],
    },
    checkpoint: {
      task: "One unscripted minute: you've moved to a new city. Introduce yourself to a neighbour, explain why you've moved, and end the conversation naturally.",
      criteria: ["Opens and closes naturally without prompts", "Uses at least two softeners", "Asks at least one follow-up", "Keeps going for the full minute without abandoning"],
      feedbackBands: ["B1.1", "B1.2", "B1.3", "B2-"],
    },
    gymTieIn: "Daily Speaking Challenge today uses transaction openers from this module.",
  },
  {
    id: "ft-2",
    number: 2,
    title: "Personal Stories & Simple Opinions",
    band: "B1",
    track: "DUAL",
    purpose: "Tell a short story that lands, and give an opinion with one real reason.",
    objectives: [
      "Sequence a story with natural connectors",
      "Finish anecdotes with a point, not a fade-out",
      "Give opinions and gently disagree",
    ],
    explanation: {
      keyIdea: "A good short story has three moves: set-up, surprise, point.",
      principles: [
        "Set the scene in one line: 'So last Friday, I'm on the bus…'",
        "Use present tense for drama: '…and this bloke just stands up and…'",
        "Land the point: '…which is why I now always check the timetable.'",
      ],
      modelDialogue: [
        { speaker: "A", line: "Did I tell you about my first week at work? So, day one, I'm feeling confident…" },
        { speaker: "B", line: "Let me guess — something went wrong." },
        { speaker: "A", line: "I walked into the wrong office building. Spent twenty minutes waiting for a meeting that was happening two streets away." },
        { speaker: "B", line: "No! What did you do?" },
        { speaker: "A", line: "Ran. Which is why I now leave half an hour early everywhere. Lesson learned." },
      ],
    },
    drills: [
      { prompt: "Tell a 45-second story about a journey that went wrong. Set-up, surprise, point.", usefulLanguage: ["So anyway,", "The thing is,", "which is why…"] },
      { prompt: "Give your opinion of remote working with one reason and one example.", usefulLanguage: ["For me, the main thing is…", "Take my… for example", "That said,…"] },
      { prompt: "Disagree with: 'Social media has made friendship shallow.' Be polite but clear.", usefulLanguage: ["I see it a bit differently", "I'd say the opposite, actually", "Fair point, but…"] },
    ],
    guidedRoleplay: {
      scenario: "A new colleague asks about your most embarrassing travel moment over coffee.",
      goal: "Tell one complete story with a clear ending, then invite theirs.",
      persona: { name: "Priya", role: "new colleague", personality: "curious, encouraging, laughs easily", objective: "get to know you through stories", tone: "light, conversational", pressure: 1 },
      supports: ["Start with 'So,' — it signals a story is coming.", "Present tense adds drama: '…and then the door just opens.'", "End with '…which is why I never…'"],
      opener: "Go on then — you said you had a disaster on your first trip abroad. I need to hear this.",
      fallbacks: ["Wait, hang on — how did that even happen?", "Oh no. What did you do?", "That's hilarious. And did you ever go back?", "See, mine's worse, actually —", "Right, you've set the bar high now."],
      targetPhrases: ["So anyway,", "and then suddenly", "which is why I now…"],
    },
    pressureRoleplay: {
      scenario: "You're asked to defend an unpopular opinion in a group discussion at short notice.",
      goal: "State your position, hold it for three exchanges, concede nothing dishonest.",
      persona: { name: "Marcus", role: "debate partner", personality: "sharp, sceptical, enjoys argument", objective: "poke holes in your reasoning", tone: "direct, slightly provocative", pressure: 3 },
      complication: "Marcus misquotes your point back to you on purpose.",
      opener: "You honestly think working four days a week is realistic for most companies? Talk me through it.",
      fallbacks: ["That's not an argument, that's a wish.", "But what about the industries that can't?", "You've changed your point — you said 'always' a minute ago.", "So productivity just… magic?", "Alright. Concede one thing at least."],
      targetPhrases: ["That's not quite what I said — my point was…", "I take your point about…, however…", "Let me put it another way:"],
    },
    checkpoint: {
      task: "Record 90 seconds: tell a true story that explains something about who you are, then give one opinion it connects to.",
      criteria: ["Clear three-move structure", "At least two natural connectors", "Opinion supported by a reason", "No long silences or restarts"],
      feedbackBands: ["B1.1", "B1.2", "B1.3", "B2-"],
    },
    gymTieIn: "Free Talk this week opens with story starters from this module.",
  },
  {
    id: "ft-3",
    number: 3,
    title: "Making Plans & Arrangements",
    band: "B1",
    track: "LIFE",
    purpose: "Fix times, propose alternatives and confirm arrangements smoothly — the plumbing of social life.",
    objectives: [
      "Propose, counter-propose and confirm plans",
      "Handle a change of plan without friction",
      "Close an arrangement with a clear summary",
    ],
    explanation: {
      keyIdea: "Fluent planners offer two options, not open questions.",
      principles: [
        "'Shall we say…?' moves things forward.",
        "Offer an alternative with every objection: 'Can't do Thursday — how about Friday lunchtime?'",
        "Confirm at the end: 'So that's Friday, one o'clock, at the usual place.'",
      ],
      modelDialogue: [
        { speaker: "A", line: "Fancy catching up this week? Shall we say Thursday evening?" },
        { speaker: "B", line: "Thursday's a bit tricky — I'm at the gym till eight. How about Friday after work?" },
        { speaker: "A", line: "Friday works. Shall we say six thirty, that place near your office?" },
        { speaker: "B", line: "Perfect. So that's Friday, six thirty, The Crown. If anything changes I'll text you." },
        { speaker: "A", line: "Lovely, see you then." },
      ],
    },
    drills: [
      { prompt: "Arrange dinner with a busy friend. Propose a time, accept a counter-proposal, confirm.", usefulLanguage: ["Shall we say…?", "…works for me", "So that's… then"] },
      { prompt: "You're running twenty minutes late. Call and rearrange without drama.", usefulLanguage: ["I'm running a bit behind", "Would it be a problem if…?", "Bear with me"] },
      { prompt: "Suggest a weekend trip: destination, day, and who brings what.", usefulLanguage: ["What if we…", "I can sort out…", "Let's leave it at…"] },
    ],
    guidedRoleplay: {
      scenario: "You and a friend are trying to find one evening that works for a cinema trip this week.",
      goal: "Reach a confirmed plan inside eight turns, handling at least one clash.",
      persona: { name: "Tom", role: "old friend", personality: "easygoing but genuinely busy", objective: "see you but juggling shifts", tone: "relaxed, texting-while-talking", pressure: 1 },
      supports: ["Offer pairs of options: 'Thursday or Friday?'", "Echo their constraint back: 'Shift till eight, got it.'", "Always finish with the summary line."],
      opener: "Ooh, cinema — yes! Let me look at my week… Wednesday's out, I'm on a late shift.",
      fallbacks: ["Hmm, Thursday I could do after eight?", "Saturday daytime's easier for me, honestly.", "Wait, what were we seeing again?", "Right, hold on — I'll just check my calendar.", "Done. So that's locked in, then?"],
      targetPhrases: ["Shall we say…?", "…is a bit tricky", "So that's…, then"],
    },
    pressureRoleplay: {
      scenario: "You planned a surprise dinner for a friend's birthday, but the restaurant just cancelled on the day.",
      goal: "Rearrange the whole evening on the phone in real time — keep the surprise intact.",
      persona: { name: "Elaine", role: "restaurant manager", personality: "apologetic but firm, no free tables", objective: "get you off the phone without a refund", tone: "smooth, apologetic, immovable", pressure: 3 },
      complication: "Elaine can only offer a table at 9:45pm — after the birthday person's last train.",
      opener: "I'm so sorry to do this to you today — we've had a kitchen failure and I have to move your booking.",
      fallbacks: ["The earliest I could offer is a quarter to ten.", "I really can't do better than that tonight.", "I can offer you a free dessert course next time?", "Let me just see… no, that table's already held.", "Alright. What are you proposing?"],
      targetPhrases: ["I understand it's not your fault, however…", "What I can do is…", "Could you hold that thought — I just need to check…"],
    },
    checkpoint: {
      task: "Live planning call: arrange a study session with a partner who has three conflicts in a row. Land a confirmed plan.",
      criteria: ["Every objection met with an alternative", "Confirmation summary delivered", "Under eight minutes, no dead ends", "Tone stays warm throughout"],
      feedbackBands: ["B1.2", "B1.3", "B2-", "B2.1"],
    },
    gymTieIn: "Weak-Spot Recall will resurface any planning phrases you fumble.",
  },
  {
    id: "ft-4",
    number: 4,
    title: "Handling Problems Politely",
    band: "B1",
    track: "DUAL",
    purpose: "Complain, return, report and resolve — firm on the problem, soft on the person.",
    objectives: [
      "Describe a problem clearly with facts first",
      "Ask for a specific remedy, not just sympathy",
      "Escalate politely when the first answer is no",
    ],
    explanation: {
      keyIdea: "State facts, state impact, request a fix — in that order.",
      principles: [
        "Facts first: 'I bought this on Monday and it doesn't turn on.'",
        "Impact second: 'I need it for work tomorrow.'",
        "Fix third: 'Could you replace it, or refund me?'",
      ],
      modelDialogue: [
        { speaker: "A", line: "Hi — I ordered this charger on Monday and it arrived damaged. It doesn't hold a connection." },
        { speaker: "B", line: "Right. Have you tried a different socket?" },
        { speaker: "A", line: "I have, and the cable itself is frayed near the plug. I need it for work, so could you replace it today, or shall I refund through the app?" },
        { speaker: "B", line: "If you've got the order number I can swap it now." },
        { speaker: "A", line: "Brilliant — here it is. Thanks for sorting it quickly." },
      ],
    },
    drills: [
      { prompt: "Your hotel room is not the one you booked. Complain and request a specific remedy.", usefulLanguage: ["I booked…, however…", "Could you either… or…?", "I'd appreciate…"] },
      { prompt: "A delivery is three days late and you need it today. Phone and escalate once.", usefulLanguage: ["The issue is…", "What I'd like is…", "If that's not possible, then…"] },
      { prompt: "A colleague keeps missing your handover notes. Raise it without blame.", usefulLanguage: ["I've noticed that…", "It would help me if…", "Can we find a way to…?"] },
    ],
    guidedRoleplay: {
      scenario: "Your broadband has dropped five times this week. You're speaking to support chat-typing-speed but by phone.",
      goal: "Get an engineer visit booked — facts, impact, remedy.",
      persona: { name: "Gary", role: "support agent", personality: "scripted, kind, process-bound", objective: "run the checklist before any fix", tone: "calm, rehearsed", pressure: 2 },
      supports: ["Facts before feelings: dates and counts, not frustration.", "Have your remedy ready: 'an engineer this week'.", "If scripted answers stall you, ask: 'What are my options?'"],
      opener: "Thanks for calling. Can I take your account number and a quick description of the issue?",
      fallbacks: ["Have you tried restarting the router?", "I can see some drops on Friday, but nothing since.", "There's no outage showing in your area.", "Let me check what appointments we have…", "Okay — what outcome are you looking for today?"],
      targetPhrases: ["The issue is…", "What I'd like is…", "If that's not possible, then…"],
    },
    pressureRoleplay: {
      scenario: "A wedding venue lost your booking two weeks before the date. The coordinator is hedging.",
      goal: "Escalate through three answers and leave with a concrete commitment.",
      persona: { name: "Simone", role: "events coordinator", personality: "polished, evasive, allergic to liability", objective: "avoid committing in writing", tone: "sympathetic, corporate", pressure: 3 },
      complication: "Simone offers only vague reassurance and tries to end the call.",
      opener: "I know this is stressful, and I want to assure you we're doing everything we can.",
      fallbacks: ["I can't promise anything on this call.", "These things unfortunately do happen.", "Email is just… we don't usually confirm in writing.", "I hear you, and I'll flag it with the manager.", "I really must take the next call now."],
      targetPhrases: ["I need a commitment I can rely on…", "Could you confirm that in writing today?", "If we can't resolve this now, what is the formal next step?"],
    },
    checkpoint: {
      task: "Three-minute checkpoint: resolve an incorrect bill by phone. Facts, impact, remedy, escalation if needed.",
      criteria: ["Facts stated before emotion", "Specific remedy requested", "One polite escalation", "Ends with confirmed outcome"],
      feedbackBands: ["B1.2", "B1.3", "B2-", "B2.1"],
    },
    gymTieIn: "Pronunciation Lab drills polite stress patterns from this module.",
  },
];

const b2Modules: FluencyModule[] = [
  {
    id: "ft-5",
    number: 5,
    title: "Expressing & Defending Opinions",
    band: "B2",
    track: "DUAL",
    purpose: "Hold a position in real time — concede the small, defend the core, exit with grace.",
    objectives: [
      "Structure an argument in three moves",
      "Distinguish conceding from agreeing",
      "Reframe loaded questions before answering",
    ],
    explanation: {
      keyIdea: "Defence is structure, not volume: concede, contrast, conclude.",
      principles: [
        "Concede deliberately: 'It's true that… — and yet…'",
        "Signal structure: 'My main concern is X. My second is Y.'",
        "Reframe loaded questions: 'I think the real question is…'",
      ],
      modelDialogue: [
        { speaker: "A", line: "Honestly, I think four days a week would sink most small firms." },
        { speaker: "B", line: "It's true the transition would hit small firms hardest — and yet the trial data shows retention up. My main concern is actually the opposite: five-day burnout." },
        { speaker: "A", line: "Burnout's a management problem, not a hours problem." },
        { speaker: "B", line: "Partly — but if management were solving it, we wouldn't see the figures we do. I'd frame it as: what structure makes good management easier?" },
        { speaker: "A", line: "…That's a fair way to put it." },
      ],
    },
    drills: [
      { prompt: "Argue for or against: 'Universities should be free.' Concede one point, defend two.", usefulLanguage: ["It's true that…, and yet…", "My main concern is…", "I'd frame it as…"] },
      { prompt: "Reframe the loaded question: 'Why is your team always late?'", usefulLanguage: ["I think the real question is…", "What I can speak to is…", "Let me give you the specific case…"] },
      { prompt: "Disagree with your manager's plan in a way that keeps the relationship intact.", usefulLanguage: ["Can I offer a concern?", "What worries me slightly is…", "Would it be worth…?"] },
    ],
    guidedRoleplay: {
      scenario: "Your team is choosing between two project approaches. You favour the unfashionable one.",
      goal: "Win at least a 'let's test it' — structured argument, no waffle.",
      persona: { name: "Hannah", role: "team lead", personality: "data-driven, fair, sceptical of fashion", objective: "choose what ships", tone: "professional, brisk", pressure: 2 },
      supports: ["Lead with the concession: it costs you nothing and buys credibility.", "Numbers beat adjectives.", "Name your structure: 'I've got two concerns.'"],
      opener: "Right — quick decision needed. I'm leaning to the standard approach. Sell me the other one.",
      fallbacks: ["What does that cost us in week one?", "The trial data everyone quotes was tiny — you know that?", "Say more about the maintenance side.", "If it fails, what's our exit?", "Huh. Okay — how would we test it cheaply?"],
      targetPhrases: ["It's true that…, and yet…", "My main concern is…", "How would we test it cheaply?"],
    },
    pressureRoleplay: {
      scenario: "A panel interview question attacks a gap in your CV.",
      goal: "Reframe honestly, defend without defensiveness, land on evidence.",
      persona: { name: "Dr Okafor", role: "panel interviewer", personality: "clinical, probing, unimpressed by spin", objective: "test composure under challenge", tone: "measured, cutting", pressure: 3 },
      complication: "The interviewer interrupts your second sentence with a follow-up.",
      opener: "Your CV shows a nine-month gap and then a junior title after a senior one. Explain that to me.",
      fallbacks: ["That's quite a story. Isn't it convenient?", "So you chose to step back. Most people don't.", "I asked why the title went down, not how you felt.", "Let me stop you there — what did the project actually deliver?", "Fine. Last question on this, then we move on."],
      targetPhrases: ["I think the real question is…", "What the numbers showed was…", "I'd make the same choice again, because…"],
    },
    checkpoint: {
      task: "Two-minute position, then live cross-examination: 'Advertising does more harm than good.' Defend, concede, conclude.",
      criteria: ["Concession used deliberately", "Structure signposted", "Survives three challenges", "Closes with a conclusion, not a fade"],
      feedbackBands: ["B2.1", "B2.2", "B2.3", "C1-"],
    },
    gymTieIn: "Free Talk arena this week: opinion crossfire. Weak-spot updates feed your grammar plan.",
  },
  {
    id: "ft-6",
    number: 6,
    title: "Professional & Social Networking",
    band: "B2",
    track: "BUSINESS",
    purpose: "Work a room, remember names, exit conversations and follow up like a professional.",
    objectives: [
      "Introduce yourself with a hook, not a job title dump",
      "Enter and exit group conversations smoothly",
      "Convert a chat into a concrete follow-up",
    ],
    explanation: {
      keyIdea: "Networking is generosity with a memory: give value, capture one next step.",
      principles: [
        "Hook: 'I help hospitals stop losing patient notes' beats 'I'm an IT consultant'.",
        "Ask questions people enjoy answering — projects and problems, not CVs.",
        "Exit with a bridge: 'I'll send you that article — what's the best email?'",
      ],
      modelDialogue: [
        { speaker: "A", line: "I'm Sam — I untangle supply chains for food companies. What brought you tonight?" },
        { speaker: "B", line: "Honestly, the free canapés. But I do logistics for a pharmacy group, so your pitch is uncomfortably relevant." },
        { speaker: "A", line: "Ha! Then you'll have opinions on cold chain tracking. How are you handling temperature excursions at the moment?" },
        { speaker: "B", line: "Badly, since you ask. Spreadsheets." },
        { speaker: "A", line: "Right — I'll send you the two-page brief we wrote on that. What's the best email?" },
      ],
    },
    drills: [
      { prompt: "Deliver your thirty-second introduction with a hook and a question back.", usefulLanguage: ["I help… to…", "What brought you…?", "How are you handling…?"] },
      { prompt: "Join a group of three people mid-conversation at an event.", usefulLanguage: ["Mind if I join you?", "I couldn't help overhearing…", "How do you all know each other?"] },
      { prompt: "Exit a conversation that has run its course, warmly.", usefulLanguage: ["I'll let you mingle", "I'll send you that…", "Lovely to meet you — let's stay in touch"] },
    ],
    guidedRoleplay: {
      scenario: "Industry meetup. You know nobody. Your goal: three real conversations and one follow-up.",
      goal: "Open, sustain, exit and secure one concrete next step.",
      persona: { name: "Lena", role: "product manager", personality: "friendly, restless, scanning the room", objective: "meet useful people efficiently", tone: "brisk but warm", pressure: 2 },
      supports: ["Open with the hook + question.", "If she glances away, exit gracefully with a bridge.", "Names twice: on hearing, on leaving."],
      opener: "Oh hi — are you here for the talks, or just the free coffee like me?",
      fallbacks: ["Ha! Fair. So what do you do, then?", "Sorry — quick aside, I need to say hello to someone — back in a sec.", "Interesting, interesting. And is that growing, the…?", "You know who you should talk to? Marta. She's here somewhere.", "Right — I'm going to circulate, but send me that link, yeah?"],
      targetPhrases: ["I help… to…", "What's the best… to reach you?", "Lovely to meet you"],
    },
    pressureRoleplay: {
      scenario: "You have ninety seconds with a senior figure everyone wants to meet, in a lift.",
      goal: "One memorable exchange and a reason to continue — no rambling.",
      persona: { name: "Mr Adeyemi", role: "group director", personality: "courteous, time-poor, allergic to pitches", objective: "get to the fourth floor undisturbed", tone: "measured, faintly amused", pressure: 3 },
      complication: "He asks a question that exposes that you haven't researched his company.",
      opener: "You have until the fourth floor, I'm afraid.",
      fallbacks: ["And what does your company actually gain from that?", "We tried something similar. It went badly.", "You haven't looked us up, have you?", "Mm. And your part in all this?", "Fourth floor. Send me one paragraph — one — and I'll read it."],
      targetPhrases: ["I'll be brief — one question, then I'll leave you in peace.", "I don't know — I'll find out and come back to you.", "One paragraph, on its way by this evening."],
    },
    checkpoint: {
      task: "Simulated networking block: meet two people, exit both cleanly, secure one follow-up. Six minutes.",
      criteria: ["Hook used, not job-title dump", "Both exits graceful", "One concrete follow-up captured", "Names used naturally"],
      feedbackBands: ["B2.1", "B2.2", "B2.3", "C1-"],
    },
    gymTieIn: "Daily Speaking Challenge: sixty-second hook, three variants.",
  },
  {
    id: "ft-7",
    number: 7,
    title: "Meetings & Collaboration",
    band: "B2",
    track: "BUSINESS",
    purpose: "Speak up in meetings — interrupt cleanly, land points, handle pushback, keep momentum.",
    objectives: [
      "Enter discussion at the right moment",
      "Disagree with the idea, credit the person",
      "Drive decisions with crisp summaries",
    ],
    explanation: {
      keyIdea: "Meetings reward structure and timing, not volume.",
      principles: [
        "Enter on the breath: 'Can I build on that…?'",
        "Disagree with the idea, credit the person: 'That solves the risk — my worry is the cost.'",
        "Summarise to decide: 'So we're agreeing: trial in March, review in April.'",
      ],
      modelDialogue: [
        { speaker: "A", line: "Can I build on that? The pilot solves the risk question, but my worry is the support cost in month two." },
        { speaker: "B", line: "Fair — though we could staff it from the existing rota." },
        { speaker: "A", line: "If we do, I'd want that written into the plan rather than assumed. Shall we say: pilot in March, support review on the fifteenth?" },
        { speaker: "B", line: "Works for me." },
        { speaker: "A", line: "Good. So: March pilot, rota-staffed, review on the fifteenth. I'll circulate." },
      ],
    },
    drills: [
      { prompt: "Interrupt a rambling colleague politely and refocus the meeting.", usefulLanguage: ["Can I jump in?", "Before we move on —", "To bring it back to…"] },
      { prompt: "Disagree with a proposal everyone likes, once, briefly.", usefulLanguage: ["That solves… — my worry is…", "Am I right in thinking…?", "Would it be worth checking…?"] },
      { prompt: "Summarise a messy discussion into one decision sentence.", usefulLanguage: ["So we're agreeing…", "To recap: …, unless anyone objects", "Actions: mine, yours, by Friday"] },
    ],
    guidedRoleplay: {
      scenario: "Weekly stand-up. The schedule is slipping and everyone is talking around it.",
      goal: "Name the slip, propose the fix, get a decision inside six turns.",
      persona: { name: "Yoav", role: "project manager", personality: "optimistic, conflict-averse, drowning in tasks", objective: "keep the meeting pleasant", tone: "upbeat, deflecting", pressure: 2 },
      supports: ["Name the issue once, calmly — then the fix.", "'So we're agreeing…' forces the decision.", "Offer to own something: it buys authority."],
      opener: "Morning all! Loads of energy this week, loving it. Any blockers? No? Great — moving on…",
      fallbacks: ["Ah — it's mostly on track, to be honest.", "The integration is a bit behind, but we're fine, I think?", "I didn't want to make a fuss about it.", "Hmm. What would you propose, then?", "Right — okay, yes. Let's do that."],
      targetPhrases: ["Can I be direct about the timeline?", "So we're agreeing…", "I can own that."],
    },
    pressureRoleplay: {
      scenario: "Senior stakeholders are killing your project in real time, on a call you can't leave.",
      goal: "Survive five challenges, extract one concrete reprieve, stay composed.",
      persona: { name: "Margaret", role: "finance director", personality: "ruthless with numbers, courteous with people", objective: "cut spend today", tone: "icy politeness", pressure: 3 },
      complication: "She has read none of the pre-read and quotes it wrongly.",
      opener: "I've read your paper. It's ambitious. My question is which half of it we cut.",
      fallbacks: ["The payback is… what did you write… 'within two years'? Generous.", "We're not funding ambition this quarter.", "You didn't answer my question.", "Everyone says their project is different.", "Convince me in one sentence, or I take the savings."],
      targetPhrases: ["May I correct one number before we decide?", "The one-sentence version is…", "What I need from you today is…"],
    },
    checkpoint: {
      task: "Run the final four minutes of a decision meeting: summarise, assign actions, confirm owners and dates.",
      criteria: ["Interruptions handled cleanly", "One disagreement navigated", "Decision sentence delivered", "Owners and dates explicit"],
      feedbackBands: ["B2.2", "B2.3", "C1-", "C1.1"],
    },
    gymTieIn: "Shadowing this week uses meeting-interruption rhythms from this module.",
  },
  {
    id: "ft-8",
    number: 8,
    title: "Navigating Conflict & Feedback",
    band: "B2",
    track: "BUSINESS",
    purpose: "Give hard feedback kindly, receive it without collapsing, and de-escalate live.",
    objectives: [
      "Deliver behavioural feedback, not character verdicts",
      "Receive criticism and mine it for the actionable part",
      "De-escalate a heated exchange with language, not surrender",
    ],
    explanation: {
      keyIdea: "Describe behaviour and impact; agree the future; let the past shrink.",
      principles: [
        "Behaviour + impact + request: 'When X happens, Y is the result. Could we do Z?'",
        "Receive: extract the actionable: 'So the fix you want is…?'",
        "De-escalate by slowing down: 'Let's take that one at a time.'",
      ],
      modelDialogue: [
        { speaker: "A", line: "Can I raise something? In the last two client calls, you've answered questions addressed to me. It made me look unprepared." },
        { speaker: "B", line: "I was only trying to keep things moving…" },
        { speaker: "A", line: "I know, and I appreciate that. What would help is if you let me finish my part, and jump in after. Could we try that on Thursday?" },
        { speaker: "B", line: "…Fair. Sorry. Yes, Thursday." },
        { speaker: "A", line: "Thanks. And genuinely — the content was strong." },
      ],
    },
    drills: [
      { prompt: "Give feedback to a teammate who replies to emails addressed to you.", usefulLanguage: ["Can I raise something?", "When X happens…", "Could we try…?"] },
      { prompt: "Your manager criticises your report harshly in public. Respond and move it private.", usefulLanguage: ["I want to get this right — can we talk after?", "So the fix you want is…?", "That one stung, but I take the point about…"] },
      { prompt: "De-escalate: a supplier is shouting about a late payment.", usefulLanguage: ["Let's take that one at a time.", "You're right that…, and…", "Here's what I can do in the next hour…"] },
    ],
    guidedRoleplay: {
      scenario: "A talented junior keeps missing deadlines. This is your third conversation about it.",
      goal: "Be clear it's serious, keep the relationship, agree one concrete system.",
      persona: { name: "Kacper", role: "junior analyst", personality: "defensive first, honest second, keen to improve", objective: "avoid feeling like a failure", tone: "guarded, then open", pressure: 2 },
      supports: ["Behaviour, impact, request — no verdicts on character.", "Let him be defensive once; don't match it.", "End with a system, not a feeling."],
      opener: "You wanted to talk? Look, I know the deadline thing again — I've been flat out, alright?",
      fallbacks: ["Everyone's busy, though. It's not just me.", "So what, you're going to micromanage me now?", "…Okay. That's fair, actually.", "What if I send a plan on Monday mornings?", "I'd rather fix it than be chased, honestly."],
      targetPhrases: ["When X happens, Y is the result.", "I'd rather fix it with you than chase you.", "Shall we try that for two weeks?"],
    },
    pressureRoleplay: {
      scenario: "A client is furious about an error your team made and demands someone be fired.",
      goal: "De-escalate, own the error, refuse the unfair demand, keep the client.",
      persona: { name: "Denise", role: "client operations head", personality: "explosive then calculating", objective: "see consequences, not solutions", tone: "loud, then needle-sharp", pressure: 3 },
      complication: "Mid-call she threatens to move the contract to a competitor.",
      opener: "Someone at your company cost me a week of launch. I want a name and I want it now.",
      fallbacks: ["A name? I want a scalp, not an apology.", "Sorry doesn't un-launch a product.", "So that's a 'no' on consequences. Interesting.", "We have options, you know that.", "…Alright. What exactly are you proposing?"],
      targetPhrases: ["You're right to be angry — here's what happened…", "I won't discuss individuals on this call; I will own the fix.", "Here's what we do in the next 24 hours…"],
    },
    checkpoint: {
      task: "Two-sided checkpoint: give one piece of hard feedback AND receive one, back to back. Five minutes.",
      criteria: ["Feedback is behavioural, not personal", "Received feedback mined for the fix", "No escalation on either side", "Both ends close with agreements"],
      feedbackBands: ["B2.2", "B2.3", "C1-", "C1.1"],
    },
    gymTieIn: "Weak-Spot Recall prioritises any hedging or intensifier habits this module exposes.",
  },
];

const c1Modules: FluencyModule[] = [
  {
    id: "ft-9",
    number: 9,
    title: "Persuasion & Negotiation",
    band: "C1",
    track: "BUSINESS",
    purpose: "Move positions without force — trade concessions, reframe stakes, close with both sides intact.",
    objectives: [
      "Anchor and trade rather than concede",
      "Reframe the negotiation from positions to interests",
      "Close with a summary both sides repeat",
    ],
    explanation: {
      keyIdea: "Skilled negotiators ask more than they assert, and trade instead of yielding.",
      principles: [
        "Trade, never give: 'If we can do X, could you…?'",
        "Interests over positions: 'What would that solve for you?'",
        "Label the dynamic: 'We're both dug in — shall we look at it from the customer's side?'",
      ],
      modelDialogue: [
        { speaker: "A", line: "We need fifteen percent off to make this viable." },
        { speaker: "B", line: "Fifteen isn't something I can simply give. What would it solve for you — margin, or headroom for the retail push?" },
        { speaker: "A", line: "Headroom, honestly. We're funding the launch ourselves." },
        { speaker: "B", line: "Then let's trade: if we hold the price at eight percent off and pre-fund the launch materials, does that solve the headroom problem?" },
        { speaker: "A", line: "…It might. Walk me through the pre-fund." },
        { speaker: "B", line: "Gladly. And to recap what you'd be agreeing: eight percent, launch pre-fund, twelve-month term." },
      ],
    },
    drills: [
      { prompt: "A client demands a 20% discount. Trade instead of conceding.", usefulLanguage: ["If we can do X, could you…?", "What would that solve for you?", "To recap what you'd be agreeing…"] },
      { prompt: "You've been lowballed on a salary offer.", usefulLanguage: ["I'd like to explore the band…", "If the base is fixed, could we discuss…?", "What flexibility exists on…?"] },
      { prompt: "Two departments are deadlocked over shared budget. Reframe.", usefulLanguage: ["We're both dug in —", "What does success look like for you…", "Shall we look at it from…?"] },
    ],
    guidedRoleplay: {
      scenario: "Renewing a supplier contract. They want a long commitment; you want flexibility and a discount.",
      goal: "Trade three times, land a summary both sides repeat.",
      persona: { name: "Alistair", role: "account director", personality: "polished, patient, professional gambler", objective: "lock a three-year term", tone: "warm, unhurried, watchful", pressure: 2 },
      supports: ["Answer questions with a trade, never a bare yes.", "'What would that solve for you?' is your best question.", "Summarise after every agreement — small print grows quietly."],
      opener: "So — three-year renewal at the current rate, and I'll throw in priority support. Sensible for both of us, I'd say.",
      fallbacks: ["Priority support alone is worth a fortune, you know.", "A one-year term makes it very hard for me to hold this price.", "Interesting. And if I did that, what changes for me?", "Let me be honest — my director wants three years.", "Right. So: price holds, you pre-commit the volume, term stays three years. Have I got that?"],
      targetPhrases: ["What would that solve for you?", "If we can do X, could you…?", "Let me play that back…"],
    },
    pressureRoleplay: {
      scenario: "Final-round negotiation where the other side plays hardball: take-it-or-leave-it.",
      goal: "Test the bluff without breaking the deal, then close or walk cleanly.",
      persona: { name: "Vera", role: "procurement lead", personality: "stone-faced, procedural, immune to charm", objective: "extract the last five percent", tone: "flat, final-sounding", pressure: 3 },
      complication: "Vera sets an artificial deadline: 'decision by five o'clock today'.",
      opener: "This is our final position. The decision's made by five o'clock either way.",
      fallbacks: ["That's the number. I don't have room.", "If you need to escalate, escalate. The offer expires at five.", "We have two other bidders, you know.", "Why would I trade anything for less than three years?", "…You realise this is unusual. Go on, then."],
      targetPhrases: ["Help me understand the five o'clock deadline…", "If I could get authorisation for X, would that move it?", "Then I'll walk, and I'd rather we didn't."],
    },
    checkpoint: {
      task: "Full negotiation round: contract renewal with four moving parts. Ten minutes, must close.",
      criteria: ["At least three trades, no bare concessions", "Interests surfaced with questions", "Artificial pressure handled", "Close summarised and confirmed"],
      feedbackBands: ["C1.1", "C1.2", "C1.3", "C2-"],
    },
    gymTieIn: "Conversation Gym pressure rounds this month draw on hardball scenarios.",
  },
  {
    id: "ft-10",
    number: 10,
    title: "Storytelling & Humour",
    band: "C1",
    track: "DUAL",
    purpose: "Tell stories that entertain, use irony safely, and read the room when a joke lands or dies.",
    objectives: [
      "Build and release tension in a told story",
      "Use understatement and irony accurately",
      "Recover gracefully when humour misfires",
    ],
    explanation: {
      keyIdea: "Humour at C1 is timing and understatement, not punchlines.",
      principles: [
        "Understatement: 'The storm was, in fairness, somewhat inconvenient.'",
        "Hold the pause before the reveal — count it.",
        "If a joke dies, node it: '…anyway.' Silence is part of the craft.",
      ],
      modelDialogue: [
        { speaker: "A", line: "So we arrive at the hotel — four stars, allegedly — and the porter takes us to a room with a view of the car park." },
        { speaker: "B", line: "Charming." },
        { speaker: "A", line: "It gets better. My colleague complains, very politely, and they upgrade us… to a room with a view of the car park AND the bins." },
        { speaker: "B", line: "No." },
        { speaker: "A", line: "We booked the conference room there the next year. Said the bins reminded us to stay humble." },
      ],
    },
    drills: [
      { prompt: "Retell a mundane disaster with escalating understatement.", usefulLanguage: ["in fairness,", "somewhat", "as one does"] },
      { prompt: "Deliver a two-line ironic aside about the weather during a heatwave.", usefulLanguage: ["Lovely weather for it", "How refreshing", "Just what we needed"] },
      { prompt: "Tell a story with a deliberate pause before the last word.", usefulLanguage: ["And then he said…", "…nothing.", "Anyway."] },
    ],
    guidedRoleplay: {
      scenario: "Team dinner. You're asked to tell the story of the company's most famous mishap.",
      goal: "Entertain for two minutes, read the audience, land the ending.",
      persona: { name: "Rosie", role: "colleague", personality: "quick-witted, generous laugher, story competitor", objective: "enjoy the story, then top it", tone: "playful, fast", pressure: 2 },
      supports: ["Understatement before exaggeration at this level.", "Pause IS punctuation — hold it.", "If she talks over the laugh, let the line breathe after."],
      opener: "Oh you HAVE to tell her about the Cologne trip. She won't believe it otherwise.",
      fallbacks: ["Wait wait — the wrong city?", "I'm sorry, the PA system announced WHAT?", "That's the bit that kills me every time.", "Okay okay — my turn. And mine's true.", "Right, that's it, you're telling this at the Christmas do."],
      targetPhrases: ["in fairness,", "somewhat", "as one does"],
    },
    pressureRoleplay: {
      scenario: "You're giving a light-hearted after-dinner speech to a mixed audience, and your first joke falls completely flat.",
      goal: "Recover in real time, adjust register, win the room back.",
      persona: { name: "Chairman Ellis", role: "senior partner hosting the dinner", personality: "formal, unamused by defaults, fair when earned", objective: "protect the room's dignity", tone: "dry, watchful", pressure: 3 },
      complication: "Half the room doesn't share the cultural reference in your second attempt.",
      opener: "Ladies and gentlemen, our speaker. Do try to be brief — the bar closes at eleven.",
      fallbacks: ["…Yes. Well.", "Perhaps we'll move to the serious part.", "Some of us missed that reference, I suspect.", "You're enjoying this, aren't you.", "Hm. Better. Carry on."],
      targetPhrases: ["…anyway.", "Let me put that differently for everyone", "I can see that one needs work — moving swiftly on"],
    },
    checkpoint: {
      task: "Three-minute told story with two planned humour moments and one recovery if needed.",
      criteria: ["Tension built and released", "Understatement used accurately", "Timing held (pauses count)", "Recovery managed if material misfires"],
      feedbackBands: ["C1.1", "C1.2", "C1.3", "C2-"],
    },
    gymTieIn: "Free Talk rounds include one story slot per session this month.",
  },
  {
    id: "ft-11",
    number: 11,
    title: "Leading Discussions & Presentations",
    band: "C1",
    track: "BUSINESS",
    purpose: "Hold a room: present with a spine, chair a discussion, and manage the difficult participant.",
    objectives: [
      "Open with a frame, not an agenda read-out",
      "Handle interruptions without losing the thread",
      "Close with an action, not an applause line",
    ],
    explanation: {
      keyIdea: "Leadership speech is architecture: frame, develop, land.",
      principles: [
        "Frame the stakes first: 'In ten minutes you'll approve one of two futures.'",
        "Signpost relentlessly: 'Two reasons. First…'",
        "Land on the action: 'What I need from you today is…'",
      ],
      modelDialogue: [
        { speaker: "A", line: "In the next ten minutes, I'm going to ask you to approve one of two futures for this product. First, the numbers…" },
        { speaker: "B", line: "Sorry — quickly, doesn't this assume the market stays flat?" },
        { speaker: "A", line: "Good question, and I'll take it head-on in the second half — hold me to it. The numbers…" },
        { speaker: "B", line: "…Fine." },
        { speaker: "A", line: "So: two futures, one decision. What I need from you today is the pilot approval, not the full rollout." },
      ],
    },
    drills: [
      { prompt: "Open a two-minute presentation with a frame and a signpost.", usefulLanguage: ["In the next X minutes…", "Two reasons. First…", "What I need from you today is…"] },
      { prompt: "Someone interrupts with a tangent. Park it and return.", usefulLanguage: ["Good challenge — hold me to it later.", "Let's park that and come back…", "To finish the point…"] },
      { prompt: "Chair a discussion where two people dominate. Redistribute.", usefulLanguage: ["I want to hear from…", "We've heard a lot from this side —", "Sam, you've been quiet — what's your read?"] },
    ],
    guidedRoleplay: {
      scenario: "You're presenting a strategy pivot to six senior colleagues. One is hostile.",
      goal: "Present the frame, survive two interruptions, land the ask.",
      persona: { name: "Ingrid", role: "regional director", personality: "imperious, decisive, tests composure", objective: "see if you can be trusted with the room", tone: "clipped, evaluative", pressure: 2 },
      supports: ["The frame buys you authority — spend it early.", "Park interruptions with a promise and KEEP it.", "End on the ask, never on 'so… yeah'."],
      opener: "You have the floor. We've read the pack — surprise us.",
      fallbacks: ["Quickly, before you get going — why should we believe the forecast?", "You're describing last year's strategy with new adjectives.", "Fine. Continue. But come back to that.", "So what exactly are you asking us to approve today?", "Hm. You'll have my answer by Friday."],
      targetPhrases: ["In the next ten minutes…", "Good challenge — hold me to it later.", "What I need from you today is…"],
    },
    pressureRoleplay: {
      scenario: "Chairing a public forum where two participants start trading personal attacks.",
      goal: "Restore order, stay neutral, keep the schedule, no casualties.",
      persona: { name: "Deniz", role: "panel guest", personality: "combative, eloquent, personal when cornered", objective: "win the exchange at any cost", tone: "rising volume, then silky", pressure: 3 },
      complication: "The crowd reacts; you have seconds before it becomes theatre.",
      opener: "I'll be honest — the previous speaker's plan was fantasy, and I think you know it.",
      fallbacks: ["It's not personal, it's incompetence.", "Oh, now we're lecturing about civility?", "Let the audience decide who's evasive.", "Fine. Chair. What's your ruling?", "…Alright. For the record, I'll keep it professional."],
      targetPhrases: ["We'll take the points in order.", "Address the argument, please, not the person.", "I'm going to give each of you one minute, starting with…"],
    },
    checkpoint: {
      task: "Five-minute chaired discussion: three speakers, one conflict, one decision. You run it.",
      criteria: ["Frame stated in the first thirty seconds", "Interruptions parked and honoured", "Conflict neutralised without taking sides", "Decision and owners landed"],
      feedbackBands: ["C1.1", "C1.2", "C1.3", "C2-"],
    },
    gymTieIn: "Shadowing uses presentation signposting prosody this week.",
  },
  {
    id: "ft-12",
    number: 12,
    title: "Emotional Intelligence in Conversation",
    band: "C1",
    track: "DUAL",
    purpose: "Hear what isn't said, name it safely, and steer conversations by their undercurrent.",
    objectives: [
      "Identify the emotion beneath the words and respond to it",
      "Deliver unwelcome truths with care and clarity",
      "Use silence deliberately",
    ],
    explanation: {
      keyIdea: "At C1, the conversation under the conversation matters most.",
      principles: [
        "Name tentatively: 'I might be wrong, but you sound…'",
        "Answer the emotion first, the content second.",
        "Silence after a hard sentence gives it room to land — don't fill it.",
      ],
      modelDialogue: [
        { speaker: "A", line: "It's fine, honestly. Whatever you decide about the role." },
        { speaker: "B", line: "You say it's fine — and I might be wrong, but you sound quite flat about it." },
        { speaker: "A", line: "…I suppose I'd hoped to at least be interviewed for it." },
        { speaker: "B", line: "That's fair, and I'm glad you said it. Let me tell you honestly what happened, and then let's talk about what's next." },
        { speaker: "A", line: "Okay. Yes. Thanks." },
        { speaker: "B", line: "…" },
      ],
    },
    drills: [
      { prompt: "A colleague says 'I'm fine' in a way that suggests otherwise. Open the door gently.", usefulLanguage: ["I might be wrong, but…", "You say…, and yet…", "Do you want to talk about it?"] },
      { prompt: "Tell a loyal team member they're not getting the promotion.", usefulLanguage: ["I want to be straight with you…", "That's fair to feel.", "Here's what I can offer…"] },
      { prompt: "A friend hints at quitting without saying so. Surface it.", usefulLanguage: ["You've mentioned… twice now.", "What's the pull, and what's the push?", "Say more about that."] },
    ],
    guidedRoleplay: {
      scenario: "Your most experienced team member has gone quiet in meetings and their work has slipped for the first time ever.",
      goal: "Surface the real issue without forcing disclosure; leave the door open.",
      persona: { name: "Marie", role: "senior colleague", personality: "private, proud, tired; hates being managed", objective: "protect her dignity", tone: "curt, then careful", pressure: 2 },
      supports: ["Respond to the feeling before the facts.", "Tentative naming: 'you sound…' — never 'you ARE…'.", "Offer silence once. Let her fill it."],
      opener: "You wanted a word? Make it quick, I've got the Morrisson review.",
      fallbacks: ["It's nothing. I'm just busy.", "Busy. Tired. Pick one.", "…It's the reorg, isn't it. Twenty years and they posted the job 'externally'.", "I don't want to make a thing of it.", "…Thanks. For actually asking."],
      targetPhrases: ["I might be wrong, but…", "That's fair to feel.", "Say more about that."],
    },
    pressureRoleplay: {
      scenario: "Delivering a redundancy decision to someone who helped build the company.",
      goal: "Be humane AND final — no false hope, no coldness.",
      persona: { name: "Bob", role: "long-serving employee", personality: "stoic, then cracking; loyal to the company", objective: "understand why and keep his dignity", tone: "controlled, then unsteady", pressure: 3 },
      complication: "Bob asks you directly: 'Was it me?'",
      opener: "Right. I've had the letter. Am I being let go, or not?",
      fallbacks: ["Twenty-two years. Say it plainly.", "Was it me? Just — was it me?", "The consultancy said 'restructure'. What does that actually mean?", "I trained half the people staying. Does that count for nothing?", "…Okay. Okay. Tell me the dates, then."],
      targetPhrases: ["I want to be straight with you…", "This is not about your work — and I know that doesn't soften it much.", "Here's what I can do today, and here's what happens next."],
    },
    checkpoint: {
      task: "Dual checkpoint: one conversation surfacing an unspoken concern, one delivering a hard no. Eight minutes.",
      criteria: ["Emotion named tentatively and accurately", "Feeling answered before content", "Silence used deliberately at least once", "No false hope; relationship preserved"],
      feedbackBands: ["C1.2", "C1.3", "C2-", "C2.1"],
    },
    gymTieIn: "Daily challenge includes one 'read the subtext' listening prompt.",
  },
];

const c2Modules: FluencyModule[] = [
  {
    id: "ft-13",
    number: 13,
    title: "Idiom, Register & Code-Switching",
    band: "C2",
    track: "DUAL",
    purpose: "Shift register mid-stream — boardroom to banter and back — with idiom that lands, not decorates.",
    objectives: [
      "Shift register deliberately, not accidentally",
      "Deploy idiom with cultural accuracy",
      "Repair register mismatches gracefully",
    ],
    explanation: {
      keyIdea: "Mastery is range: the same message, tuned per audience.",
      principles: [
        "Formal spine, informal ribs: structure stays clean even when language relaxes.",
        "Idiom must fit the room — 'touching base' dies in a board paper.",
        "Repair fast: 'to put it more plainly…'",
      ],
      modelDialogue: [
        { speaker: "A", line: "To summarise for the board: the initiative is revenue-positive within two quarters, and we've de-risked the supply side." },
        { speaker: "B", line: "And for the rest of us?" },
        { speaker: "A", line: "Ha — alright. For the rest of us: the money's fine, the trains will run, and nobody's getting sacked. Any questions?" },
        { speaker: "B", line: "Now it's a strategy." },
        { speaker: "A", line: "To put it more plainly for the minutes: full detail's in the appendix." },
      ],
    },
    drills: [
      { prompt: "Say the same bad-news message to the board, then to the team, then to a friend.", usefulLanguage: ["To summarise for the board…", "For the rest of us…", "to put it more plainly…"] },
      { prompt: "Use three workplace idioms naturally in sixty seconds of speech.", usefulLanguage: ["a no-brainer", "back to the drawing board", "across the line"] },
      { prompt: "Catch and repair an over-casual sentence in a formal setting.", usefulLanguage: ["To put it more formally…", "Forgive the shorthand —", "In summary…"] },
    ],
    guidedRoleplay: {
      scenario: "Board presentation, then the corridor afterwards with the same audience.",
      goal: "Deliver the formal version, then the candid version, both controlled.",
      persona: { name: "Sir Edmund", role: "chairman", personality: "patrician, dry, values precision and wit equally", objective: "test range, not just correctness", tone: "measured, faintly playful", pressure: 2 },
      supports: ["Formal first: clean structure, zero slang.", "The corridor version may relax — not collapse.", "One idiom, placed deliberately, beats five scattered."],
      opener: "The board has forty minutes, of which you may use fifteen. Proceed.",
      fallbacks: ["You may drop the preamble — the figures, if you please.", "And in plain English?", "Ha! You may quote yourself in the minutes.", "Careful — 'no-brainer' has ended careers in this room.", "Good. Both registers intact. Uncommon."],
      targetPhrases: ["To summarise for the board…", "For the rest of us…", "to put it more plainly…"],
    },
    pressureRoleplay: {
      scenario: "A live broadcast interview where the host keeps shifting register to trip you.",
      goal: "Match and hold your own register regardless of bait.",
      persona: { name: "Kate Marlowe", role: "broadcast presenter", personality: "forensic, ironic, theatrical when useful", objective: "produce a headline from your slip", tone: "alternating velvet and steel", pressure: 3 },
      complication: "She quotes your informal corridor comment on air.",
      opener: "This morning you told colleagues this was, quote, 'a bit of a mess'. Is it a bit of a mess, or is it — as your statement says — 'under active review'?",
      fallbacks: ["Which is it? A mess or a review?", "You'll forgive the public for reading both.", "So you regret the words, or the leak?", "Let me give you the chance to be crisp.", "Mm. We'll come back to that, won't we."],
      targetPhrases: ["Those were informal words about a serious process.", "The substance is what I said it was — let me restate it…", "I'm happy to be crisp: …"],
    },
    checkpoint: {
      task: "Register relay: one message, three audiences, sixty seconds each, live.",
      criteria: ["Three distinct registers held", "Idiom accurate and placed", "Repair used if mismatch occurs", "Message identical across versions"],
      feedbackBands: ["C2.1", "C2.2", "C2.3"],
    },
    gymTieIn: "Pronunciation Lab: register lives in rhythm as much as words.",
  },
  {
    id: "ft-14",
    number: 14,
    title: "High-Stakes Communication & Leadership",
    band: "C2",
    track: "BUSINESS",
    purpose: "Communicate when the temperature is maximum: crises, exits, public accountability.",
    objectives: [
      "Structure certainty under pressure",
      "Take responsibility without inviting blame-shifts",
      "Lead an audience through bad news to next steps",
    ],
    explanation: {
      keyIdea: "In a crisis, the leader's language IS the situation's size.",
      principles: [
        "Say what you know, what you don't, and when you'll know more — in that order.",
        "Own it once, cleanly: 'The call was mine.'",
        "Always end with the next step and its owner.",
      ],
      modelDialogue: [
        { speaker: "A", line: "Here's what we know: the outage affects roughly a third of users. Here's what we don't: the cause. Engineering reports by four o'clock." },
        { speaker: "B", line: "Was this the release?" },
        { speaker: "A", line: "The call to ship on Friday was mine, and I'd make the timing call again — but we'll know the cause first, then I'll answer that fully." },
        { speaker: "B", line: "And customers?" },
        { speaker: "A", line: "Comms goes out at noon, credits follow automatically. Next update from me at four — sooner if we know more." },
      ],
    },
    drills: [
      { prompt: "Brief your team sixty seconds after learning of a major service failure.", usefulLanguage: ["Here's what we know…", "Here's what we don't…", "Next update at…"] },
      { prompt: "Own a decision that damaged a client relationship.", usefulLanguage: ["The call was mine.", "What we're doing about it…", "What I need from you is…"] },
      { prompt: "Announce a restructure without spin.", usefulLanguage: ["I won't dress this up…", "What this means for you…", "Support starts today…"] },
    ],
    guidedRoleplay: {
      scenario: "Sixty minutes after learning your product's data breach includes customer emails.",
      goal: "Brief a senior colleague with structure, ownership and next steps — no hedging soup.",
      persona: { name: "Farah", role: "chief of staff", personality: "crisp, protective of the CEO, allergic to chaos", objective: "establish facts and sequence", tone: "rapid, precise", pressure: 2 },
      supports: ["Known / unknown / when — the triad is your armour.", "Own the call once; don't repeat the apology.", "Every sentence ends in a next step or a timestamp."],
      opener: "Talk to me. What do we actually know, and who else knows it?",
      fallbacks: ["Regulators — who informs them, and by when?", "And the statement — who writes it, who signs it?", "You're hedging. Give me the timeline flat.", "If this was the Friday release call — whose call was it?", "Good. That's the first sentence I've heard today I can repeat to the CEO."],
      targetPhrases: ["Here's what we know…", "The call was mine.", "Next update at…"],
    },
    pressureRoleplay: {
      scenario: "Public press conference about the breach, hostile questions, live cameras.",
      goal: "Five hostile questions answered with structure; no new damage created.",
      persona: { name: "Hugo Fanshawe", role: "national newspaper correspondent", personality: "forensic, theatrical, hunting the headline", objective: "extract a damaging admission or a dodge", tone: "polite menace", pressure: 3 },
      complication: "He asks whether anyone will resign.",
      opener: "Your customers learned about this from our reporters, not from you. Why should they trust anything you say today?",
      fallbacks: ["'Under active review' — that's what you told investors. True then, is it true now?", "Will you resign?", "Was customer data encrypted? A yes or no would do.", "You knew on Friday. Customers knew on Monday. Explain the gap.", "Last question — and do try to answer it."],
      targetPhrases: ["Here's what I can confirm today…", "I won't speculate; here's when you'll hear it from me…", "The sequencing was a mistake, and here's what changes…"],
    },
    checkpoint: {
      task: "Crisis arc checkpoint: internal brief, then public statement, back to back. Ten minutes.",
      criteria: ["Known/unknown/when structure under pressure", "Ownership taken once, cleanly", "No speculation introduced", "Both messages end with owned next steps"],
      feedbackBands: ["C2.1", "C2.2", "C2.3"],
    },
    gymTieIn: "Pressure-mode Conversation Gym all week: crisis variants.",
  },
  {
    id: "ft-15",
    number: 15,
    title: "Wit, Irony & Cultural Nuance",
    band: "C2",
    track: "LIFE",
    purpose: "Operate inside another culture's humour — understatement, teasing, self-deprecation, and when NOT to be witty.",
    objectives: [
      "Read which mode of irony is in play",
      "Tease and be teased without damage",
      "Recognise the moments that require sincerity",
    ],
    explanation: {
      keyIdea: "British-style humour at C2 is cooperative: everyone protects everyone's face.",
      principles: [
        "Self-deprecation opens doors; other-deprecation closes them.",
        "Understatement signals trust: 'not ideal' can mean 'disastrous'.",
        "Some rooms want sincerity. Read, then choose.",
      ],
      modelDialogue: [
        { speaker: "A", line: "How was the team-building retreat?" },
        { speaker: "B", line: "Character-building. I now know I can survive forty-eight hours without coffee, trust exercises, or hope." },
        { speaker: "A", line: "Ha — and the trust exercises?" },
        { speaker: "B", line: "I fell backwards into Dave's arms as promised. Dave, tragically, had stepped away." },
        { speaker: "A", line: "Not ideal, then." },
        { speaker: "B", line: "It built character. Mine, mostly. And a small fracture." },
      ],
    },
    drills: [
      { prompt: "Describe a terrible holiday using only understatement.", usefulLanguage: ["not ideal", "a learning experience", "one for the memory books, in fairness"] },
      { prompt: "Respond to teasing about being late without apologising or attacking.", usefulLanguage: ["I was aiming for fashionably late —", "I like to make an entrance.", "You're just jealous of the dramatic timing."] },
      { prompt: "Shift a joke exchange into a sincere moment, then back.", usefulLanguage: ["No, but genuinely —", "In all seriousness…", "Anyway — where were we?"] },
    ],
    guidedRoleplay: {
      scenario: "Pub evening with British colleagues. You're the newest person; the teasing is affectionate.",
      goal: "Give as good as you get, self-deprecate once, land one sincere beat.",
      persona: { name: "Nige", role: "veteran colleague", personality: "deadpan, kindly, testing through teasing", objective: "decide if you can take a joke", tone: "dry as a bone", pressure: 2 },
      supports: ["Tease back gently — never the person, always the situation.", "'Not ideal' carries more than it says.", "One sincere beat earns years of goodwill."],
      opener: "Ah, the new one. We were just saying you're surprisingly punctual for a southerner.",
      fallbacks: ["Ooh, get them — they can banter.", "Seriously though, good week's work, that.", "Dave's just upset you beat him at darts.", "No, but honestly — you'd fit in fine here.", "Right, whose round is it? Mine. Again. As always."],
      targetPhrases: ["not ideal", "in all seriousness…", "I like to make an entrance."],
    },
    pressureRoleplay: {
      scenario: "A diplomatic dinner where a guest from another culture misreads your irony as insult.",
      goal: "Repair without patronising; restore warmth inside two exchanges.",
      persona: { name: "Dr Lindqvist", role: "visiting academic", personality: "precise, literal, quietly offended", objective: "restore mutual respect or withdraw", tone: "cool, formal", pressure: 3 },
      complication: "She notes the slight formally, in front of others.",
      opener: "I want to be clear: I found your remark about my conference paper — how do you say — condescending.",
      fallbacks: ["In my country, we tease what we respect.", "So you mock colleagues openly here?", "I do not find it funny. My paper took four years.", "Your 'sincerity' arrives rather late.", "…That is more like it. Let us continue, then."],
      targetPhrases: ["I can see how it landed that way — that wasn't my meaning.", "May I restate it as I intended it?", "In all seriousness — your work changed how I read the field."],
    },
    checkpoint: {
      task: "Nuance checkpoint: survive a teasing round, then repair one cross-cultural misread. Six minutes.",
      criteria: ["Teasing returned without aggression", "Understatement used with intent", "Misread repaired without condescension", "One sincere beat delivered cleanly"],
      feedbackBands: ["C2.1", "C2.2", "C2.3"],
    },
    gymTieIn: "Free Talk: irony rounds with two personas at different pressure levels.",
  },
  {
    id: "ft-16",
    number: 16,
    title: "Mastery Capstone: Spontaneous Eloquence",
    band: "C2",
    track: "DUAL",
    purpose: "Think aloud with structure and grace on any subject, unprepared, at length, on demand.",
    objectives: [
      "Speak coherently for three minutes on an unseen topic",
      "Wield metaphor and rhythm, not just vocabulary",
      "Finish strong: last sentences are engineered, not abandoned",
    ],
    explanation: {
      keyIdea: "Eloquence is architecture under pressure: frame, develop, turn, land.",
      principles: [
        "Buy five seconds honestly: 'That's a question worth taking slowly.'",
        "One metaphor per minute, maximum — carried through, not mixed.",
        "Engineer the final sentence before you need it.",
      ],
      modelDialogue: [
        { speaker: "A", line: "Is remote work killing mentorship?" },
        { speaker: "B", line: "That's a question worth taking slowly. Mentorship was never really the meeting — it was the shadowing, the overheard phone call, the coffee queue. So the honest answer is: the office didn't create mentorship, proximity did. And proximity is now a choice we make rather than a place we sit. Which means mentorship isn't dying — it's being redesigned, and frankly, some of the redesign is overdue." },
        { speaker: "A", line: "Go on." },
        { speaker: "B", line: "The firms that treat it as a design problem will out-teach the ones nostalgic for the queue. The rest will write obituaries for something they never managed in the first place." },
      ],
    },
    drills: [
      { prompt: "Three minutes, unseen topic: 'Cities are for strangers. Discuss.'", usefulLanguage: ["That's a question worth taking slowly.", "The honest answer is…", "Which leaves the real question:…"] },
      { prompt: "Build one sustained metaphor about deadlines and carry it for a minute.", usefulLanguage: ["Think of it as…", "and if we stretch that picture…", "the trouble with that map is…"] },
      { prompt: "End a talk on strengths with an engineered final sentence — rehearse only the last line.", usefulLanguage: ["Which is why…", "And that, in the end, is the whole argument.", "Everything else is commentary."] },
    ],
    guidedRoleplay: {
      scenario: "Podcast guest chair: three unseen prompts, three minutes each, generous host.",
      goal: "Three structured minutes per prompt; one engineered ending.",
      persona: { name: "Adaeze", role: "podcast host", personality: "warm, precise, draws people upward", objective: "get your best thinking on tape", tone: "curious, unhurried", pressure: 2 },
      supports: ["Frame first sentence: it sets the architecture.", "One metaphor, carried through.", "Decide your last sentence during minute two."],
      opener: "No prep, no mercy, plenty of fun. First prompt: 'Small talk is a public good.' Agree or demolish.",
      fallbacks: ["Ooh — push on that a little.", "You've got thirty seconds left. Land it.", "What's the strongest counter to your own view?", "If that was the headline, what's the article?", "Last one — and it's the spiciest."],
      targetPhrases: ["That's a question worth taking slowly.", "The honest answer is…", "Which leaves the real question:…"],
    },
    pressureRoleplay: {
      scenario: "Royal Society-style panel: defend your field's funding against a sceptical chair, live.",
      goal: "Eloquence under hostility — grace, structure, and one memorable close.",
      persona: { name: "Sir Robin Halsey", role: "committee chair", personality: "erudite, impatient, allergic to jargon", objective: "cut the budget unless moved", tone: "patrician, scalpel-edged", pressure: 3 },
      complication: "He cuts you off at ninety seconds and demands the summary.",
      opener: "You have ninety seconds to explain why the taxpayer should fund curiosity. Begin.",
      fallbacks: ["Curiosity. Is that the best justification available?", "You're describing value we cannot measure — that's usually a euphemism.", "Time. Summarise.", "The last speaker said the same, only better.", "…Hm. That final sentence may survive the minutes. Barely."],
      targetPhrases: ["May I give you the summary, then?", "What we cannot measure today, we could not measure yesterday — and yesterday we funded it.", "If this fails, you'll have spent, in total, the cost of one motorway junction."],
    },
    checkpoint: {
      task: "Capstone: three unseen topics, three minutes each, hostile follow-ups allowed. Ten minutes total.",
      criteria: ["Structure intact on all three", "One sustained metaphor executed", "Hostility absorbed without loss of grace", "Every ending engineered, none abandoned"],
      feedbackBands: ["C2.1", "C2.2", "C2.3"],
    },
    gymTieIn: "This capstone unlocks the Mastery badge in your Fluency Passport.",
  },
];

export const FLUENCY_MODULES: FluencyModule[] = [...b1Modules, ...b2Modules, ...c1Modules, ...c2Modules];

export const FLUENCY_BANDS: Extract<CEFRLevel, "B1" | "B2" | "C1" | "C2">[] = ["B1", "B2", "C1", "C2"];

export function modulesForBand(band: string): FluencyModule[] {
  return FLUENCY_MODULES.filter((m) => m.band === band);
}

export function fluencyModuleById(id: string): FluencyModule | undefined {
  return FLUENCY_MODULES.find((m) => m.id === id);
}

/** Part 78 — entry gate. B1 or above may enrol; anyone below is routed to General English. */
export function fluencyEligibility(overallLevel: string): { eligible: boolean; reason: string; route: string } {
  const order = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
  const idx = order.indexOf(overallLevel);
  if (idx >= 3) {
    return { eligible: true, reason: `Your ${overallLevel} foundation is ready for the Fluency Track.`, route: "/fluency-track" };
  }
  if (idx === -1) {
    return {
      eligible: false,
      reason: "Take LevelCheck first — it places you on the CEFR scale and tells you exactly when the Fluency Track opens.",
      route: "/diagnostic",
    };
  }
  const target = idx <= 1 ? "A2" : "B1";
  return {
    eligible: false,
    reason: `The Fluency Track starts at B1. Your placement puts you at ${overallLevel} — build toward ${target} first and the door opens automatically.`,
    route: "/general-english",
  };
}

/** Part 84 — honest band feedback. Maps checkpoint completion to an honest CEFR sub-level range. */
export function fluencyFeedbackBand(module: FluencyModule, criteriaMet: number, totalCriteria: number): string {
  if (totalCriteria <= 0) return module.checkpoint.feedbackBands[0];
  const ratio = criteriaMet / totalCriteria;
  const bands = module.checkpoint.feedbackBands;
  if (ratio >= 0.95) return bands[bands.length - 1];
  if (ratio >= 0.75) return bands[Math.min(bands.length - 2, Math.max(0, Math.floor(bands.length * ratio) - 1))];
  return bands[0];
}

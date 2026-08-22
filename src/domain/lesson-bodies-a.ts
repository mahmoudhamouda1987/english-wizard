/** Lesson bodies part A: Pre-A1 → A2 (12 lessons). */

export interface LessonBody {
  explanation: string;
  examples: string[];
  commonMistakes: string[];
  tip: string;
}

export const LESSON_BODIES_A: Record<string, LessonBody> = {
  "lesson-prea1-survival": {
    explanation: "Survival English is a small kit of words that unlock big situations: hello, please, thank you, yes, no, numbers, and How much?. You do not need grammar to survive your first conversations — you need these fixed phrases said with confidence. Learn them as whole chunks, never as single words.",
    examples: ["Hello! / Hi!", "Please. — Thank you!", "Yes, please. / No, thanks.", "How much is it?", "Sorry! / Excuse me!", "One coffee and one cake, please.", "Numbers 1–10: one, two, three… ten."],
    commonMistakes: ["Saying Thanks you instead of Thank you or Thanks.", "Translating word-by-word instead of using the whole English chunk.", "Forgetting please — in English shops it is expected."],
    tip: "Say each phrase out loud three times today. Your mouth learns like your memory does.",
  },
  "lesson-prea1-sounds": {
    explanation: "Two sounds matter most at the start: the English p (with a puff of air — hold paper near your lips and watch it move on pin) and short i versus long ee (sit vs seat). Word stress also matters: every English word has one loud part, like HO-tel or ba-NA-na.",
    examples: ["pin / bin — pig / big", "sit / seat — ship / sheep", "Word stress: HO-tel, com-PU-ter, ba-NA-na", "Sentence stress: I DIDN'T say that vs I didn't SAY that."],
    commonMistakes: ["Pronouncing p like b — practise the air puff.", "Stressing every syllable equally; choose the loud part.", "Pronouncing every written letter; spelling hides sounds."],
    tip: "Exaggerate stress when practising alone. Normal comes naturally later.",
  },
  "lesson-prea1-reading": {
    explanation: "You can read more English than you think, because signs repeat everywhere: EXIT, OPEN, CLOSED, PUSH, PULL. Reading at this level means recognising whole words by shape, like faces — not spelling letter by letter. Train your eyes on high-frequency words until they feel instant.",
    examples: ["EXIT — you leave here", "OPEN / CLOSED — shop door", "PUSH / PULL — doors", "TOILET / WC", "BUS STOP / TAXI", "MENU: COFFEE … 3 | TEA … 2"],
    commonMistakes: ["Reading letter-by-letter; read the whole word shape.", "Ignoring capital letters on signs — they are normal there.", "Stopping at unknown words instead of using context."],
    tip: "Photograph three English signs around you this week and read them aloud.",
  },
  "lesson-prea1-listening": {
    explanation: "Native speakers sound fast because they shrink small words: Do you becomes d'you, What is your name? sounds like What's yer name?. You do not decode every word yet — catch the anchors: names, numbers, places. Train your ear to grab those and let the rest pass.",
    examples: ["What's your name? → catch NAME", "Two coffees, please. → catch TWO + COFFEE", "The bus is at gate five. → catch GATE + FIVE", "Slow speech: Can… I… help… you?"],
    commonMistakes: ["Panicking when you miss a word — anchor on numbers and names.", "Expecting textbook pronunciation; real speech shrinks words.", "Listening passively; guess before replaying."],
    tip: "Listen twice: first for the gist, second for details.",
  },
  "lesson-a1-self-introduction": {
    explanation: "A great self-introduction follows a frame: name → country/city → job or study → one personal detail → a closing question. The frame keeps you calm because you always know what comes next, and ending with a question hands the conversation back — instantly more social.",
    examples: ["Hi, I'm Omar. I'm from Cairo.", "I work in sales — I enjoy meeting people.", "I'm studying engineering. In my free time I play football.", "Closing question: And what about you?"],
    commonMistakes: ["My name Omar → My name IS Omar, or better: I'm Omar.", "Too formal with peers — Hello, my name is… can sound robotic.", "Ending without a question; the chat dies."],
    tip: "Build your 20-second intro tonight and record it once on your phone.",
  },
  "lesson-a1-routines": {
    explanation: "Routines need present simple plus time markers. With he/she/it add -s: She works. Anchor your story with sequence words — first, then, after that, finally — and frequency words: always, usually, sometimes, never. Routines are the safest early-conversation topic because everyone has one.",
    examples: ["I wake up at seven, then I drink coffee.", "She goes to work by bus. (go → goes)", "First I check emails; after that I join the meeting.", "I usually walk. / I never skip breakfast."],
    commonMistakes: ["Forgetting third-person -s: He work → He works.", "I have 25 years → English says I am 25.", "in/on/at mix-ups: in the morning, on Monday, at 7 o'clock."],
    tip: "Narrate your day out loud in English while doing it.",
  },
  "lesson-a1-questions": {
    explanation: "Conversations continue on questions. The reliable pattern: answer + add detail + return a question. Open questions (what/where/why/how) keep people talking; closed ones (Do you…?) just confirm. One safe follow-up formula carries any chat: And how about you?",
    examples: ["Where are you from? — Cairo. And you?", "What do you do? — the job/study question", "Open: Why did you choose it? Closed: Do you like it?", "Softener: That's interesting — tell me more."],
    commonMistakes: ["How old are you? too soon with strangers — start with work/study.", "Where you live? → missing auxiliary: Where DO you live?", "One-word answers — add one detail always."],
    tip: "Ask two questions for every statement you make in your next English chat.",
  },
  "lesson-a1-listening": {
    explanation: "Every conversation has a direction: invitation, problem, or plan. Listening for the point means catching action words (meet, change, late) and feeling words (happy, worried). Once you know the direction, details fill themselves in around it.",
    examples: ["Are you free Friday? → INVITATION", "My train was delayed again! → PROBLEM + annoyance", "Feeling words: great, awful, worried, excited", "Plan words: let's, shall we, how about"],
    commonMistakes: ["Chasing unknown words instead of the overall direction.", "Missing politeness — Could you…? is a request.", "Interrupting to translate; let the sentence finish."],
    tip: "After listening, state the point in one sentence: They want to meet Friday.",
  },
  "lesson-a2-interactions": {
    explanation: "Real-life English runs on polite frames: requests (Could you…?), offers (Shall I…?), apologies (Sorry, I didn't realise) and reactions (Really? No way!). Learn the frames and swap the middle — fluency is frame-recycling, not inventing new sentences every time.",
    examples: ["Request: Could you say that again, slowly?", "Offer: Shall I bring some snacks?", "Apology + fix: Sorry I'm late — traffic was awful.", "React: That sounds amazing! / Oh no, poor you!"],
    commonMistakes: ["Direct imperatives with strangers: Give me water → Could I have some water, please?", "Over-apologising; one clean apology is enough.", "Flat reactions — show feeling verbally: Wow! Really?"],
    tip: "Collect reaction phrases from shows and reuse them tomorrow in real chats.",
  },
  "lesson-a2-past": {
    explanation: "Stories need past simple plus time connectors. Regular verbs take -ed; the irregular core (went, saw, had, made) must be memorised — they are the skeleton of narrative. Frame every story in four beats: when → where → what happened → how it ended.",
    examples: ["Regular: worked, played, visited, decided", "Irregular core: went, came, saw, ate, took, bought", "Last weekend I visited my aunt. We cooked together and watched a film.", "Connectors: first, then, after that, suddenly, finally"],
    commonMistakes: ["I goed/wented → went.", "Present for past: Yesterday I go… → went.", "Did you went? → Did you GO? (did carries the past)."],
    tip: "Tell yesterday in five sentences tonight: morning, afternoon, evening, surprise, feeling.",
  },
  "lesson-a2-messages": {
    explanation: "Messages are shorter than emails but still have rules: greeting (Hi Sara), reason in line one, clear request with deadline if needed, friendly close (Cheers / See you then). Write the way you speak minus slang — and re-read once before sending.",
    examples: ["Hi Sara — quick one: can you send me the report today? Need it for the 3pm call. Thanks!", "Hey! Free Saturday? A few of us are going to the new café at 6.", "So sorry, running 15 mins late. Order me a coffee?"],
    commonMistakes: ["No greeting or sign-off — feels abrupt.", "Burying the request in paragraph three; state it first.", "Formal email style inside casual chats — match the channel."],
    tip: "Before sending ask: could a busy person reply without asking anything else?",
  },
  "lesson-a2-listening": {
    explanation: "Two-person conversations follow shapes: problem → suggestion → agreement, or plan → objection → new plan. Track who wants what. Signal words guide you: but/yet announce an objection, so/maybe a suggestion, OK/deal an agreement.",
    examples: ["Maybe we could take the earlier train… but it leaves at six! → suggestion + objection", "Agreement markers: Deal. Perfect. That works.", "Disagreement softener: I see your point, however…", "Times decide plans — catch them precisely."],
    commonMistakes: ["Missing the opinion switch after but.", "Confusing whose idea each thing is — track A vs B.", "Assuming agreement before the explicit OK."],
    tip: "While listening, keep two columns: what she wants / what he wants.",
  },
};

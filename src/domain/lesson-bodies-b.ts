/** Lesson bodies part B: B1 → C2 (16 lessons). */
import type { LessonBody } from "./lesson-bodies-a";

export const LESSON_BODIES_B: Record<string, LessonBody> = {
  "lesson-b1-conversation": {
    explanation: "Beyond scripts, fluent speakers manage the conversation itself: hedging opinions (I'd say…), checking understanding (Does that make sense?), and redirecting (That reminds me of…). Opinions travel in steps: signal → view → reason → example. That structure buys thinking time and sounds mature.",
    examples: ["Personally, I'd argue remote work helps focus, mainly because interruptions drop.", "Hedges: kind of, I suppose, to be honest", "Checking in: Am I making sense?", "Redirect: Funny you say that — same happened to me."],
    commonMistakes: ["In my opinion I think… — pick one opinion marker.", "Absolutes like always/never/everyone — soften with usually/many.", "Silences while translating; use fillers: well, actually, let me think."],
    tip: "Steal one hedge per day into real speech; natural caution reads as fluency.",
  },
  "lesson-b1-writing": {
    explanation: "An opinion piece earns trust through structure: hook → clear position → two reasons with evidence → acknowledge the other side → conclusion restating position. One idea per paragraph; connect with however, moreover, therefore. Precision beats length.",
    examples: ["Position: Remote work, on balance, improves professional life.", "Evidence verbs: research suggests, studies indicate, data shows", "Concession: Admittedly, offices build culture; nevertheless flexibility wins on productivity.", "Conclusion opener: Weighing both sides…"],
    commonMistakes: ["Reasons without evidence — add a fact or example.", "New arguments appearing in the conclusion.", "Emotional absolutes weaken tone: everyone knows that…"],
    tip: "Write your position sentence first; if it needs two sentences it is not clear yet.",
  },
  "lesson-b1-listening": {
    explanation: "Real meaning hides under polite surfaces. That's interesting can mean doubt; I'll think about it often means no; challenging frequently signals failure. Discourse markers — honestly, actually, to be fair — announce the true message before it arrives.",
    examples: ["Honestly, it wasn't my best work. → real evaluation coming", "Interesting… (flat tone) → scepticism", "No rush, but… → rush exists", "Understatement: not great → quite bad"],
    commonMistakes: ["Taking polite formulas literally.", "Ignoring tone shifts after markers like honestly.", "Missing irony in positive words said flatly."],
    tip: "Replay one line and ask: what did they mean, not what did they say?",
  },
  "lesson-b1-reading": {
    explanation: "Paragraphs carry signposts: First/Moreover add support; However/Nevertheless flip direction; In short/Therefore conclude. Read the signposts first to map the argument, then read fully. Guessing vocabulary from context beats stopping for every unknown word.",
    examples: ["However = the opposite view is coming", "For instance = example of what was just claimed", "In contrast = comparing two things", "Guess from context: She was exhausted, barely able to keep her eyes open → very tired"],
    commonMistakes: ["Stopping at every unknown word and losing the thread.", "Reading every text at the same speed; skim then scan.", "Ignoring paragraph-level logic."],
    tip: "First pass: read only first sentences of each paragraph — you will get 60% of the meaning.",
  },
  "lesson-b2-argument": {
    explanation: "To make a case, argue in moves: claim → evidence → reasoning → counter-consideration → rebuttal. Signal each move so listeners can follow. Concede strategically — agreeing with the smallest part of the other side makes your rejection of the larger part credible.",
    examples: ["Claim: We should delay the launch by two weeks.", "Evidence: Support tickets doubled since beta; churn is up three points.", "Counter + rebuttal: Yes, marketing prefers March — but reputation damage costs more than a missed window.", "Signals: The evidence points to… / Some may object that… however…"],
    commonMistakes: ["Arguing conclusions without walking through evidence.", "Treating counter-arguments as attacks instead of setup for rebuttal.", "Stacking claims without ranking which matters most."],
    tip: "Before your next debate, write your single strongest piece of evidence — lead with it.",
  },
  "lesson-b2-writing": {
    explanation: "Professional writing optimises for the reader's time: purpose line first, context second, action request last with a deadline. Prefer active voice and concrete verbs (decide, deliver) over nominal fog (make a decision regarding delivery). One subject per email.",
    examples: ["Purpose first: This proposes moving the release to 12 May.", "Action close: Could you confirm by Thursday noon?", "Active vs nominal: We decided over a decision was made", "Softening without weakness: I recommend X, though I'm open to alternatives."],
    commonMistakes: ["Burying the request under background story.", "Nominal fog: conduct an investigation of → investigate.", "Multiple unrelated asks in one email."],
    tip: "Write the final line (the ask) first, then build backwards.",
  },
  "lesson-b2-listening": {
    explanation: "Discussions layer positions on one topic. Track the argument spine: what is claimed, what supports it, who objects and why. Note-take in three symbols: ✓ supported claim, ? challenged claim, ! strong point. Meetings become followable maps instead of noise.",
    examples: ["The data supports this. → ✓", "I'm not convinced the sample holds. → ?", "That's exactly the risk we flagged. → !", "Let me build on that… → extending someone else's point"],
    commonMistakes: ["Recording opinions without knowing whose they are.", "Missing references back: As I said earlier…", "Losing the topic when digressions occur — watch for Getting back to…."],
    tip: "After any meeting, summarise in three bullets: decided, open, next owner.",
  },
  "lesson-b2-reading": {
    explanation: "Between-the-lines reading means separating assertion from support and detecting stance. Ask of every paragraph: is this fact, interpretation, or opinion? Writers reveal attitude through word choice — critics say vs experts note are not neutral twins.",
    examples: ["Claims so far show… vs Studies demonstrate… (strength differs)", "Loaded wording: stubbornly refuses vs consistently maintains", "Hedged conclusion: suggests that, appears to", "Implicit stance via selection: which facts get included first"],
    commonMistakes: ["Treating interpretation as established fact.", "Missing the writer's side hidden in adjective choice.", "Accepting quoted statistics without checking what they measure."],
    tip: "Underline every evaluative adjective in one article; the writer's position will surface.",
  },
  "lesson-c1-discussion": {
    explanation: "Leading complex discussion means steering frames, not winning points: reframe stale debates, name assumptions out loud, and park tangents respectfully. Use meta-language — the question underneath is…, we're conflating two issues — to raise the level for everyone.",
    examples: ["Reframe: I think we're debating tactics when the disagreement is about goals.", "Name assumption: Both options assume demand stays constant — does it?", "Park: Worth exploring — let's put it on the list and return.", "Converge: It sounds like we agree more than the language suggests."],
    commonMistakes: ["Refereeing content while ignoring process.", "Sophistry wins that poison future collaboration.", "Precision without warmth — pair challenge with acknowledgement."],
    tip: "In your next debate, state the other side's best case before answering it.",
  },
  "lesson-c1-writing": {
    explanation: "Precision writing calibrates certainty exactly: may < is likely to < demonstrates. Qualify scope, quantify where possible, and choose verbs that commit or withhold deliberately. Elegant prose comes from deletion — cut hedges that hedge nothing and adjectives that decorate rather than distinguish.",
    examples: ["Calibration ladder: may contribute → likely drives → demonstrably causes", "Scope: among SMEs in manufacturing (not everywhere, always)", "Deletion: in order to → to; due to the fact that → because", "Committing verb: The data contradicts the assumption."],
    commonMistakes: ["Stacking hedges: might perhaps possibly suggest.", "Abstraction creep: solutions leveraging synergies.", "Uniform certainty across weak and strong claims alike."],
    tip: "Take one old paragraph and halve its word count without losing meaning.",
  },
  "lesson-c1-listening": {
    explanation: "Advanced listening reads subtext: status play, hedged criticism, strategic ambiguity. When language turns vague — concerns were raised — ask who, what, how serious. Irony, understatement and politeness all shift meaning; track register changes mid-conversation as signals.",
    examples: ["Concerns were raised → someone powerful objected (passive hides them)", "With respect, … → disagreement follows", "That's one way to look at it. → I disagree", "Register drop to first names/casual = coalition building"],
    commonMistakes: ["Processing words while missing power dynamics.", "Missing that questions can be directives: Shouldn't we…? = do it.", "Ignoring what is NOT said — the omitted option is often the message."],
    tip: "Watch one political interview with subtitles off; log every evasion technique you catch.",
  },
  "lesson-c1-reading": {
    explanation: "Critical readers interrogate the machinery: what counts as evidence here, what would falsify this claim, who benefits from this framing? Map the argument skeleton — premises, inference, conclusion — then attack the weakest joint rather than the conclusion itself.",
    examples: ["Falsifiability test: What observation would disprove this?", "Weakest-joint analysis: premise vs inference vs data quality", "Framing audit: tax relief vs tax cut — same policy, different frame", "Source triangulation: who else reports this and how do their interests differ?"],
    commonMistakes: ["Attacking conclusions while accepting shaky premises.", "Confusing correlation framing with causal claims in prose.", "Letting agreement with conclusions replace evaluating method."],
    tip: "Write the argument as numbered premises; the weak step becomes visible instantly.",
  },
  "lesson-c2-speaking": {
    explanation: "C2 speaking is control under pressure: register shifts mid-sentence, deliberate ambiguity, rhetorical structures deployed sparingly. Precision means choosing the exact word among near-synonyms — not fancy words. The highest skill is saying less with more weight.",
    examples: ["Near-synonym choice: persistent vs obstinate vs tenacious — judgement inside vocabulary", "Rhetorical triad: clear, credible, and cheap to implement.", "Strategic pause replaces filler: … [pause] … which raises the question.", "Register pivot: So — formally — here is our position. Informally? We're thrilled."],
    commonMistakes: ["Ornamental vocabulary that trades clarity for display.", "Overusing rhetorical devices until they feel mechanical.", "Speed as fluency; weight beats pace at this level."],
    tip: "Record one minute on a hard topic; replace every generic word with a judged one.",
  },
  "lesson-c2-writing": {
    explanation: "Expert writing orchestrates voice, rhythm and information flow invisibly: given-new ordering (old information first, new last), sentence-length variation for emphasis, and paragraphs that argue. The reader should never notice craft — only clarity that feels effortless.",
    examples: ["Given-new: The committee rejected the plan. The rejection stunned investors. (end-weight on new info)", "Rhythm: Short sentence for impact. Then a longer one that carries several coordinated ideas forward before resolving.", "Paragraph as argument: claim sentence, development, pivot or proof, link out."],
    commonMistakes: ["Uniform sentence length hypnotising readers into boredom.", "Front-loading new information and losing cohesion.", "Style that announces itself instead of serving the argument."],
    tip: "Read one paragraph aloud; anywhere you stumble, the reader falls too — rewrite there.",
  },
  "lesson-c2-listening": {
    explanation: "At mastery you reconstruct unstated architecture: the argument a speaker is building, the objection they are avoiding, the audience they are performing for. You hear framing choices in real time and can predict where a statement is heading from its opening move.",
    examples: ["Opening move prediction: To be fair to them… → concession before a counterattack", "Unstated thesis: statistics cited selectively → speaker's actual claim", "Audience calibration: jargon level reveals who the speaker wants counted as insiders", "Strategic omission: what the summary leaves out IS the position"],
    commonMistakes: ["Following surface logic while missing performance strategy.", "Treating fluency and confidence as evidence of correctness.", "Not adjusting interpretation once the audience becomes clear."],
    tip: "Pause a talk mid-point and predict the ending; check how often you were right.",
  },
  "lesson-c2-reading": {
    explanation: "Sophisticated texts play games with narration, framing and silence. Mastery means auditing the text's own agenda: what it foregrounds, what it buries in subordinate clauses, whose voice is missing. You read the system that produced the text, not only the text.",
    examples: ["Subordinate burial: Although costs rose, profits held. — what is being downplayed?", "Agency engineering: mistakes were made (by nobody)", "Foreground audit: which of five facts became the headline and why", "Absent voice: who is affected but never quoted?"],
    commonMistakes: ["Admiring style while skipping ideological work the style performs.", "Reading for information only; texts also persuade by arrangement.", "Assuming neutrality from technical tone."],
    tip: "Take one news piece and rewrite it with the opposite framing; both will feel true. That is the lesson.",
  },
};

"use client";

import { useMemo, useState } from "react";
import type { CEFRLevel } from "@/src/domain/learner";
import { rotatedPool } from "@/src/domain/variety";
import { PageHero } from "@/app/components/page-hero";
import { Celebration } from "@/app/components/celebration";

interface GrammarDrill {
  id: string;
  level: CEFRLevel;
  pattern: string;
  explanation: string;
  sentence: string; // contains ___ gap
  answer: string;
  options: string[];
  extra: string[];
}

const DRILLS: GrammarDrill[] = [
  // Pre-A1 — be, articles, this/that
  { id: "g-prea1-be", level: "Pre-A1", pattern: "am / is / are", explanation: "Use am with I, is with he/she/it, are with you/we/they.", sentence: "I ___ a student.", answer: "am", options: ["am", "is"], extra: [] },
  { id: "g-prea1-is", level: "Pre-A1", pattern: "am / is / are", explanation: "He, she and it always take is.", sentence: "She ___ my sister.", answer: "is", options: ["is", "are"], extra: [] },
  { id: "g-prea1-a-an", level: "Pre-A1", pattern: "a / an", explanation: "Use an before a vowel sound: an apple, an hour.", sentence: "I have ___ orange.", answer: "an", options: ["an", "a"], extra: [] },
  // A1 — present simple, plurals, prepositions
  { id: "g-a1-present3rd", level: "A1", pattern: "Present simple: he/she + verb-s", explanation: "With he, she or it, add -s to the verb.", sentence: "He ___ coffee every morning. (drink)", answer: "drinks", options: ["drinks", "drink"], extra: [] },
  { id: "g-a1-in-on-at", level: "A1", pattern: "in / on / at for time", explanation: "at + clock time, on + days, in + months/years.", sentence: "The class starts ___ Monday.", answer: "on", options: ["on", "at", "in"], extra: [] },
  { id: "g-a1-plural", level: "A1", pattern: "Regular plurals", explanation: "Most nouns add -s; after ch/sh/x/s add -es.", sentence: "There are three ___. (box)", answer: "boxes", options: ["boxes", "boxs"], extra: [] },
  { id: "g-a1-some-any", level: "A1", pattern: "some / any", explanation: "some in positive sentences, any in questions and negatives.", sentence: "Do we have ___ milk?", answer: "any", options: ["any", "some"], extra: [] },
  // A2 — past simple, comparatives, going to
  { id: "g-a2-past-irregular", level: "A2", pattern: "Past simple irregulars", explanation: "Common irregular verbs: go→went, buy→bought, see→saw.", sentence: "Yesterday we ___ a film. (see)", answer: "saw", options: ["saw", "seed", "seen"], extra: [] },
  { id: "g-a2-comparative", level: "A2", pattern: "Comparatives", explanation: "Short adjectives take -er + than; long ones take more + adjective + than.", sentence: "This train is ___ than the bus. (fast)", answer: "faster", options: ["faster", "more fast"], extra: [] },
  { id: "g-a2-goingto", level: "A2", pattern: "be going to for plans", explanation: "Use am/is/are + going to + verb for planned futures.", sentence: "We ___ visit my aunt tomorrow.", answer: "are going to", options: ["are going to", "going to"], extra: [] },
  { id: "g-a2-countable", level: "A2", pattern: "much / many", explanation: "many with countable nouns, much with uncountables.", sentence: "How ___ people came to the party?", answer: "many", options: ["many", "much"], extra: [] },
  // B1 — present perfect, first conditional, relative clauses
  { id: "g-b1-presperf", level: "B1", pattern: "Present perfect vs past simple", explanation: "Present perfect connects to now; past simple is finished time.", sentence: "I ___ in three countries. (live — unfinished story)", answer: "have lived", options: ["have lived", "lived"], extra: [] },
  { id: "g-b1-for-since", level: "B1", pattern: "for vs since", explanation: "for + duration (two years), since + starting point (2020).", sentence: "She has worked here ___ 2019.", answer: "since", options: ["since", "for"], extra: [] },
  { id: "g-b1-cond1", level: "B1", pattern: "First conditional", explanation: "If + present simple, will + verb.", sentence: "If it rains, we ___ inside. (stay)", answer: "will stay", options: ["will stay", "stayed"], extra: [] },
  { id: "g-b1-relative", level: "B1", pattern: "who / which / that", explanation: "who for people, which/that for things.", sentence: "The engineer ___ fixed the server is my cousin.", answer: "who", options: ["who", "which"], extra: [] },
  // B2 — passive, second conditional, reported speech
  { id: "g-b2-passive", level: "B2", pattern: "Passive voice", explanation: "be + past participle shifts focus from doer to action.", sentence: "The bridge ___ in 1998. (build)", answer: "was built", options: ["was built", "built"], extra: [] },
  { id: "g-b2-cond2", level: "B2", pattern: "Second conditional", explanation: "If + past simple, would + verb — imaginary situations.", sentence: "If I ___ more time, I would learn the piano. (have)", answer: "had", options: ["had", "have"], extra: [] },
  { id: "g-b2-reported", level: "B2", pattern: "Reported speech", explanation: "Shift tense back one step: 'I am tired' → she said she was tired.", sentence: "He said he ___ busy. (be)", answer: "was", options: ["was", "is"], extra: [] },
  { id: "g-b2-usedto", level: "B2", pattern: "used to / would for past habits", explanation: "used to + verb describes past states and repeated actions.", sentence: "I ___ live near the coast.", answer: "used to", options: ["used to", "use to"], extra: [] },
  // C1 — inversion, cleft sentences, hedged modality
  { id: "g-c1-inversion", level: "C1", pattern: "Negative inversion", explanation: "Front a negative adverbial and invert: Never have I seen…", sentence: "Rarely ___ such precision. (we / witness)", answer: "have we witnessed", options: ["have we witnessed", "we have witnessed"], extra: [] },
  { id: "g-c1-cleft", level: "C1", pattern: "Cleft sentences", explanation: "It was X that… puts emphasis exactly where you want it.", sentence: "___ the delay, not the price, that lost us the client.", answer: "It was", options: ["It was", "That was"], extra: [] },
  { id: "g-c1-modal-perfect", level: "C1", pattern: "Modal perfect speculation", explanation: "must/can't/may have + participle grades certainty about the past.", sentence: "The files vanished; someone ___ deleted them. (certainty)", answer: "must have", options: ["must have", "can have"], extra: [] },
  { id: "g-c1-concession", level: "C1", pattern: "Concession clauses", explanation: "Albeit/whereas/though introduce contrast with precise register control.", sentence: "The results were strong, ___ preliminary. (contrast)", answer: "albeit", options: ["albeit", "moreover"], extra: [] },
  // C2 — subjunctive, elliptical structures, discourse-level grammar
  { id: "g-c2-subjunctive", level: "C2", pattern: "Mandative subjunctive", explanation: "After insist/demand/recommend, use base form: that he be…", sentence: "The board demanded that the report ___ revised. (be)", answer: "be", options: ["be", "is"], extra: [] },
  { id: "g-c2-ellipsis", level: "C2", pattern: "Ellipsis & substitution", explanation: "Mature prose deletes recoverable words: 'She can help, and he will too.'", sentence: "They refused to compromise, as ___ their rivals. (ellipsis of refuse)", answer: "did", options: ["did", "do"], extra: [] },
  { id: "g-c2-participle", level: "C2", pattern: "Participle clauses", explanation: "-ing/-ed clauses compress two sentences into one elegant structure.", sentence: "___ the data, the team revised its forecast. (see)", answer: "Having seen", options: ["Having seen", "Seen"], extra: [] },
  { id: "g-c2-whatever", level: "C2", pattern: "Concessive wh-clauses", explanation: "Whatever/however/no matter intensify concession elegantly.", sentence: "___ hard they tried, the deadline held firm.", answer: "However", options: ["However", "Whatever"], extra: [] },
];

const LEVELS: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

export default function GrammarPage() {
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [saved, setSaved] = useState(false);
  const pool = useMemo(() => {
    const forLevel = DRILLS.filter((d) => d.level === level);
    return rotatedPool(forLevel.length ? forLevel : DRILLS.filter((d) => d.level === "A1"), level, "grammar");
  }, [level]);
  const [index, setIndex] = useState(0);
  const drill = pool[index % pool.length];
  const correct = checked && answer.trim().toLowerCase() === drill.answer.toLowerCase();

  function switchLevel(next: CEFRLevel) {
    setLevel(next); setAnswer(""); setChecked(false); setSaved(false); setIndex(0);
  }

  function nextDrill() {
    setIndex((v) => (v + 1) % pool.length); setAnswer(""); setChecked(false); setSaved(false);
  }

  async function check() {
    setChecked(true);
    if (answer.trim().toLowerCase() !== drill.answer.toLowerCase()) return;
    try {
      await fetch("/api/evidence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionType: "QUICK_QUEST", missionId: `grammar:${level.toLowerCase()}`, objectiveId: `grammar:${drill.id}`, capabilityIds: ["grammar:patterns"], modality: "WRITING", outcome: "CORRECT", score: 90, confidence: 0.8, level, context: "FAMILIAR", errorTags: [] }),
      });
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  return (
    <main id="main-content" style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>
      <PageHero icon="🧩" title="Grammar Gym" sub={`Pattern drills at ${level}. Notice the rule, produce it, then explain it back.`} />
      <Celebration trigger={correct ? drill.id : ""} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {LEVELS.map((x) => <button key={x} className={x === level ? "button" : "button secondary"} onClick={() => switchLevel(x)}>{x}</button>)}
      </div>
      <section className="panel" style={{ marginTop: 18, padding: 22 }}>
        <p className="eyebrow">{drill.pattern}</p>
        <h2 style={{ fontSize: 26, margin: "6px 0" }}>Complete the sentence</h2>
        <p style={{ fontSize: 20, lineHeight: 1.6 }}>{drill.sentence.replace("___", "_____")}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "16px 0" }}>
          {[...new Set([...drill.options, ...drill.extra])].map((option) => (
            <button key={option} className={answer === option ? "button" : "button secondary"} onClick={() => { setAnswer(option); setChecked(false); setSaved(false); }}>{option}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="button" disabled={!answer || checked} onClick={() => void check()}>Check</button>
          <button className="button secondary" onClick={nextDrill}>Next drill →</button>
        </div>
        {checked && (
          <div className={correct ? "result-box" : "state-card error"} style={{ marginTop: 14 }}>
            {correct ? <>✓ Correct — <strong>{drill.answer}</strong> is right.</> : <>Not quite. The answer is <strong>{drill.answer}</strong>.</>}
            <p style={{ margin: "8px 0 0" }}>{drill.explanation}</p>
          </div>
        )}
        {saved && correct && <p className="subtle" style={{ marginTop: 10 }}>Evidence saved to your learner model ✓</p>}
      </section>
    </main>
  );
}

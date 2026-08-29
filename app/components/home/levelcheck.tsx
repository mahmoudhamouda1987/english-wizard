"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal } from "./reveal";
import { IconCheckCircle, IconArrow, IconTarget } from "./icons";

const STEPS = [
  { k: "BASELINE", t: "Start at a sensible baseline", d: "The assessment opens with a question calibrated to a neutral starting point — no wasted minutes." },
  { k: "PERFORMANCE", t: "Every answer is evidence", d: "Correct or not, each response updates the system's picture of what you can actually do." },
  { k: "ADAPT", t: "Difficulty adapts to you", d: "Struggling? It eases up. Cruising? It gets harder. The challenge always matches your demonstrated level." },
  { k: "PROBE", t: "It probes your edges", d: "Questions zero in on the boundary between what you know and what comes next." },
  { k: "CONFIRM", t: "It confirms across skills", d: "Vocabulary, grammar, listening and reading evidence is cross-checked before any verdict." },
  { k: "LEVEL", t: "You get your level — and a report", d: "A precise CEFR placement plus a professional report you can download and share." },
];

const QUESTIONS = [
  { diff: "Baseline · A2", q: "Choose the correct option:", opts: ["She ___ to school every day.", "go", "goes", "going", "gone"], correct: 1 },
  { diff: "Adapting · B1", q: "Complete the sentence:", opts: ["If I ___ more time, I would learn the guitar.", "have", "had", "will have", "having"], correct: 1 },
  { diff: "Probing · B2", q: "Choose the closest meaning:", opts: ["The findings are \u201cpreliminary\u201d.", "final", "provisional", "detailed", "contradictory"], correct: 1 },
  { diff: "Confirming · C1", q: "Complete the sentence:", opts: ["Far from ___ the deadline, the team delivered early.", "miss", "to miss", "missing", "missed"], correct: 2 },
];

export function LevelCheckSection() {
  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState<"answering" | "graded">("answering");
  const [picked, setPicked] = useState<number | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      if (phase === "answering") {
        setPicked(QUESTIONS[qi].correct === 2 ? 2 : 1);
        setPhase("graded");
      } else {
        setPicked(null);
        setPhase("answering");
        setQi((v) => (v + 1) % QUESTIONS.length);
        setStepIdx((v) => Math.min(v + 1, STEPS.length - 1));
      }
    }, phase === "answering" ? 2600 : 1900);
    return () => clearTimeout(t);
  }, [phase, qi]);

  const q = QUESTIONS[qi];

  return (
    <section className="hp-section hp-band-paper" aria-labelledby="hp-lc-title" id="levelcheck">
      <div className="hp-wrap">
        <Reveal className="hp-head hp-center">
          <span className="hp-eyebrow">Your first step · LevelCheck</span>
          <h2 id="hp-lc-title" className="hp-display hp-h2">Know your English.<br />Not just your score.</h2>
          <p className="hp-lead">Most tests hand you a number. LevelCheck walks your ability boundary — question by question — until it knows exactly where you stand.</p>
        </Reveal>

        <div className="hp-adapt">
          <Reveal>
            <ol className="hp-adapt-steps" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {STEPS.map((s, i) => (
                <li className="hp-adapt-step" key={s.k} style={{ opacity: i === stepIdx ? 1 : 0.62, transition: "opacity .5s" }}>
                  <span className="hp-adapt-dot" aria-hidden="true">{i + 1}</span>
                  <div>
                    <strong>{s.t}</strong>
                    <p>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={1}>
            <div className="hp-adapt-visual" role="img" aria-label="Animated preview of an adaptive LevelCheck assessment question">
              <div className="hp-assess-meta"><span>Question {qi + 1} / 30</span><span>{Math.round(((qi + 1) / QUESTIONS.length) * 100)}% explored</span></div>
              <span className="hp-assess-diff"><IconTarget size={13} /> {q.diff}</span>
              <p className="hp-assess-q" style={{ marginTop: 16 }}>{q.q}</p>
              {q.opts.map((o, i) => (
                i === 0 ? (
                  <span className="hp-assess-opt" key={i} style={{ fontWeight: 700, cursor: "default" }}>{o}</span>
                ) : (
                  <span
                    className="hp-assess-opt" key={i}
                    data-state={phase === "graded" ? (i === q.correct ? "correct" : i === picked ? "wrong" : undefined) : undefined}
                  >
                    {o}
                    {phase === "graded" && i === q.correct && <IconCheckCircle size={16} />}
                  </span>
                )
              ))}
              <div className="hp-assess-foot">
                <span>{phase === "graded" ? "Response recorded — recalibrating…" : "LevelCheck is listening to your answers…"}</span>
                <IconArrow size={16} />
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="hp-center" style={{ marginTop: 56 }}>
          <Link className="hp-btn hp-btn-primary" href="/diagnostic">Take LevelCheck</Link>
        </Reveal>
      </div>

      {/* §12 — Your level is not the end */}
      <div className="hp-wrap" style={{ marginTop: "clamp(72px,8vw,110px)" }}>
        <Reveal className="hp-center">
          <span className="hp-eyebrow">Your level is only the starting point</span>
          <h3 className="hp-display" style={{ fontSize: "clamp(26px,3vw,40px)", margin: "14px 0 30px" }}>
            B2 is not a verdict.<br />It is a launchpad.
          </h3>
        </Reveal>
        <Reveal delay={1}>
          <div className="hp-trans-flow">
            <div className="hp-trans-node hp-trans-b2">
              <span className="hp-big">B2</span>
              <small>LevelCheck result</small>
            </div>
            <span className="hp-trans-arrow" aria-hidden="true">→</span>
            <div className="hp-trans-node hp-trans-b2">
              <span className="hp-big" style={{ fontSize: "clamp(22px,2.4vw,30px)", paddingTop: 12, paddingBottom: 12 }}>Personalized path</span>
              <small>Built from your gaps</small>
            </div>
            <span className="hp-trans-arrow" aria-hidden="true">→</span>
            <div className="hp-trans-node hp-trans-c1">
              <span className="hp-big">C1</span>
              <small>Your next milestone</small>
            </div>
          </div>
        </Reveal>
        <Reveal delay={2} className="hp-center" style={{ marginTop: 30 }}>
          <p className="hp-lead" style={{ maxWidth: 560, margin: "0 auto" }}>
            The moment your assessment ends, your learning path begins — every lesson aimed at the distance between where you are and where you are going.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Reveal } from "./reveal";
import {
  IconHeadphones, IconMic, IconBook, IconPen, IconPlay, IconCheck,
  IconRoute, IconChart, IconTarget, IconArrow,
} from "./icons";

/* ---------------- §14 Four skills + §19 speaking emphasis ---------------- */

const SKILLS = [
  {
    key: "listen", label: "Listen", score: "A2 → C2", icon: IconHeadphones,
    blurb: "Real conversations, clear audio, questions that train your ear — not your luck.",
  },
  {
    key: "speak", label: "Speak", score: "A2 → C2", icon: IconMic,
    blurb: "Record yourself, compare yourself over months, and hear exactly what to fix.",
  },
  {
    key: "read", label: "Read", score: "A2 → C2", icon: IconBook,
    blurb: "Articles and stories at your level with instant help on the words that block you.",
  },
  {
    key: "write", label: "Write", score: "A2 → C2", icon: IconPen,
    blurb: "Emails, essays, messages — scored against visible criteria, never a black box.",
  },
] as const;

function Wave() {
  return (
    <div className="hp-wave" aria-hidden="true">
      {[0.0, 0.18, 0.36, 0.1, 0.28, 0.44, 0.16, 0.34, 0.08, 0.26, 0.4, 0.14, 0.32, 0.06, 0.22, 0.38, 0.12, 0.3].map((d, i) => (
        <i key={i} style={{ animationDelay: `${d}s` }} />
      ))}
    </div>
  );
}

function SkillDemo({ k }: { k: string }) {
  if (k === "listen") {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
          <span style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(246,198,103,.16)", border: "1px solid rgba(246,198,103,.4)", color: "#f6c667", flex: "none" }}><IconPlay size={18} /></span>
          <Wave />
        </div>
        <div className="hp-demo-row hp-demo-tutor">
          <span className="who" aria-hidden="true">A</span>
          <span className="hp-demo-bubble">“So the reception closes at six — after that you will need your key card for the side entrance.”</span>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <span className="hp-demo-chip"><IconCheck size={13} /> Captions appear only after your first attempt</span>
          <span className="hp-demo-chip"><IconCheck size={13} /> Playback speed adapts to your level</span>
        </div>
      </div>
    );
  }
  if (k === "speak") {
    return (
      <div>
        <div className="hp-demo-row hp-demo-tutor">
          <span className="who" aria-hidden="true">T</span>
          <span className="hp-demo-bubble">Describe a difficult decision you made recently. What made it difficult?</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "18px 0 16px" }}>
          <span style={{ width: 46, height: 46, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(224,92,110,.2)", border: "1px solid rgba(224,92,110,.6)", color: "#ff9db0", flex: "none" }}><IconMic size={20} /></span>
          <Wave />
          <span className="hp-demo-chip">0:42</span>
        </div>
        <div className="hp-demo-row hp-demo-user">
          <span className="who" aria-hidden="true">You</span>
          <span className="hp-demo-bubble">“The decision was difficult because either option meant giving up something that I genuinely value…”</span>
        </div>
        <span className="hp-demo-chip"><IconCheck size={13} /> Feedback: strong connectors — try pausing between clauses</span>
      </div>
    );
  }
  if (k === "read") {
    return (
      <div className="hp-read-demo">
        <p>The negotiations reached a <mark>stalemate</mark> — neither side was willing to move on the central issue. Analysts described the atmosphere as <mark>cautiously optimistic</mark>, noting that both delegations had agreed to resume talks the following week.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="hp-demo-chip"><IconCheck size={13} /> Tap any word for instant help</span>
          <span className="hp-demo-chip"><IconCheck size={13} /> Comprehension checks as you go</span>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="hp-write-demo">
        Dear Ms. Alvarez,<br />
        I am writing to <span className="fix">apologise about</span> <span className="ok">apologise for</span> the delay in replying to your email. Unfortunately, our <span className="fix">informations</span> <span className="ok">records</span> were being updated…
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        <span className="hp-demo-chip"><IconCheck size={13} /> Criterion: register · formal email</span>
        <span className="hp-demo-chip"><IconCheck size={13} /> Every correction explained</span>
      </div>
    </div>
  );
}

export function SkillsShowcase() {
  const [k, setK] = useState<string>("speak");
  return (
    <section className="hp-section" id="skills" aria-labelledby="hp-skills-title">
      <div className="hp-wrap">
        <Reveal className="hp-head hp-center">
          <span className="hp-eyebrow">The four dimensions</span>
          <h2 id="hp-skills-title" className="hp-display hp-h2">One language.<br />Four dimensions.</h2>
          <p className="hp-lead">Vocabulary quizzes alone do not make you fluent. English Wizard trains every skill that real life will test.</p>
        </Reveal>
        <div className="hp-skill-world">
          {SKILLS.map((s, i) => (
            <Reveal key={s.key} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <button type="button" className="hp-skillcard" data-active={k === s.key} onClick={() => setK(s.key)}>
                <span className="hp-skill-ico"><s.icon size={22} /></span>
                <strong>{s.label}</strong>
                <p>{s.blurb}</p>
                <small>LevelQuest range · {s.score}</small>
              </button>
            </Reveal>
          ))}
        </div>
        <Reveal delay={1}>
          <div className="hp-skill-demo" role="img" aria-label={`Interactive preview of the ${k} practice experience`}>
            <SkillDemo k={k} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- §15 Product showcase — show, don't tell ---------------- */

const SHOTS = [
  {
    n: "01", title: "Your dashboard", small: "Where every journey continues",
    screen: "dashboard", icon: IconChart,
  },
  {
    n: "02", title: "A lesson that adapts", small: "Chosen from evidence, not a fixed checklist",
    screen: "lesson", icon: IconBook,
  },
  {
    n: "03", title: "Speaking practice", small: "The skill most platforms avoid",
    screen: "speaking", icon: IconMic,
  },
  {
    n: "04", title: "LevelQuest", small: "The adaptive assessment behind it all",
    screen: "assessment", icon: IconTarget,
  },
  {
    n: "05", title: "Progress you can see", small: "Every skill, measured over time",
    screen: "progress", icon: IconRoute,
  },
] as const;

type Screen = (typeof SHOTS)[number]["screen"];

function Screen({ s }: { s: Screen }) {
  if (s === "dashboard") {
    return (
      <div className="hp-dash-grid">
        <div className="hp-dash-tile"><small>Current level</small><strong>B2</strong></div>
        <div className="hp-dash-tile green"><small>Streak</small><strong>12 days</strong></div>
        <div className="hp-dash-tile gold"><small>Next milestone</small><strong>C1</strong></div>
        <div className="hp-dash-tile" style={{ gridColumn: "span 2" }}>
          <small>Today&apos;s path</small>
          <div style={{ marginTop: 10, display: "grid", gap: 7 }}>
            <span style={{ fontSize: 12.5, display: "flex", gap: 7, alignItems: "center" }}><IconCheck size={13} style={{ color: "#7de8c8" }} /> Advanced Listening · 15 min</span>
            <span style={{ fontSize: 12.5, display: "flex", gap: 7, alignItems: "center" }}><IconCheck size={13} style={{ color: "#7de8c8" }} /> B2 Grammar: conditionals · 10 min</span>
            <span style={{ fontSize: 12.5, display: "flex", gap: 7, alignItems: "center" }}><IconArrow size={13} style={{ color: "#f6c667" }} /> Speaking: your next recording · 12 min</span>
          </div>
        </div>
        <div className="hp-dash-tile"><small>Review cards</small><strong>18</strong></div>
      </div>
    );
  }
  if (s === "lesson") {
    return (
      <div>
        <div className="hp-assess-meta"><span>Lesson · B2 Core</span><span>Reported speech</span></div>
        <p className="hp-assess-q">“I will call you tomorrow,” she said.</p>
        <p className="hp-assess-q" style={{ opacity: .8 }}>Report it:</p>
        <span className="hp-assess-opt" data-state="correct">She said she would call me the next day.</span>
        <span className="hp-assess-opt">She said she will call me tomorrow.</span>
        <div className="hp-assess-foot"><span>Why: backshift + time-word shift — explained after every answer</span></div>
      </div>
    );
  }
  if (s === "speaking") {
    return (
      <div>
        <div className="hp-demo-row hp-demo-tutor">
          <span className="who" aria-hidden="true">T</span>
          <span className="hp-demo-bubble">You have one minute. Pitch your idea to the board — start with the problem, not the solution.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "18px 0" }}>
          <span style={{ width: 46, height: 46, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(224,92,110,.2)", border: "1px solid rgba(224,92,110,.6)", color: "#ff9db0", flex: "none" }}><IconMic size={20} /></span>
          <Wave />
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <span className="hp-demo-chip"><IconCheck size={13} /> Compare this recording with last month</span>
          <span className="hp-demo-chip"><IconCheck size={13} /> Feedback on pace, connectors and clarity</span>
        </div>
      </div>
    );
  }
  if (s === "assessment") {
    return (
      <div>
        <div className="hp-assess-meta"><span>LevelQuest · adaptive</span><span>~30 min</span></div>
        <p className="hp-assess-q">The review described the method as rigorous but <em>contentious</em>. The method is most likely…</p>
        <span className="hp-assess-opt" data-state="correct">likely to cause disagreement</span>
        <span className="hp-assess-opt">out of date</span>
        <span className="hp-assess-opt">broadly accepted</span>
        <div className="hp-assess-foot"><span>Difficulty is rising — the system is probing your C1 boundary</span><IconArrow size={16} /></div>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {Object.entries({ Listening: 84, Speaking: 71, Reading: 88, Writing: 76 }).map(([k2, v]) => (
        <div className="hp-cefr-sbar" key={k2} style={{ gridTemplateColumns: "90px 1fr 42px", color: "rgba(230,233,255,.75)" }}>
          <span>{k2}</span>
          <span className="track" style={{ background: "rgba(255,255,255,.12)" }}><i style={{ width: `${v}%` }} /></span>
          <strong style={{ textAlign: "right" }}>{v}%</strong>
        </div>
      ))}
      <span className="hp-demo-chip"><IconCheck size={13} /> Verified against your real submissions — not self-reported</span>
    </div>
  );
}

export function ProductShowcase() {
  const [i, setI] = useState(0);
  const shot = SHOTS[i];
  return (
    <section className="hp-section hp-band-paper" aria-labelledby="hp-show-title">
      <div className="hp-wrap-wide">
        <Reveal className="hp-head hp-center">
          <span className="hp-eyebrow">See the product</span>
          <h2 id="hp-show-title" className="hp-display hp-h2">Don&apos;t take our word for it.<br />Look at it.</h2>
        </Reveal>
        <div className="hp-showcase">
          <Reveal>
            <div className="hp-shot-tabs" role="tablist" aria-label="Product areas">
              {SHOTS.map((s, idx) => (
                <button key={s.n} type="button" role="tab" aria-selected={i === idx} className="hp-shot-tab" data-active={i === idx} onClick={() => setI(idx)}>
                  <span className="n"><s.icon size={17} /></span>
                  <span><strong>{s.n} — {s.title}</strong><small>{s.small}</small></span>
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="hp-device" role="img" aria-label={`Preview of ${shot.title}`}>
              <div className="hp-device-bar"><i /><i /><i /><span>english-wizard · {shot.screen}</span></div>
              <div className="hp-device-body"><Screen s={shot.screen} /></div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Reveal } from "./reveal";
import { IconCheck, IconArrow } from "./icons";

const LEVELS = [
  {
    code: "Pre-A1", name: "Beginner", title: "First words, first steps",
    can: ["Recognise and use everyday greetings and basic phrases", "Introduce yourself and ask simple personal questions", "Understand slow, clear, carefully articulated speech"],
    vocab: "hello · my name is… · one, two, three · please · thank you",
    speaking: "“Hello! My name is Sara. I am from Cairo.”",
    bars: { Listening: 15, Speaking: 10, Reading: 20, Writing: 10 },
    next: "A1 — handle simple, everyday exchanges on familiar topics.",
  },
  {
    code: "A1", name: "Elementary", title: "Everyday basics",
    can: ["Handle simple exchanges about yourself, your family and surroundings", "Ask and answer questions on familiar, everyday topics", "Write short, simple notes and messages"],
    vocab: "family · work · market · yesterday · can/can't",
    speaking: "“I live with my family. I work in an office near my home.”",
    bars: { Listening: 30, Speaking: 25, Reading: 32, Writing: 28 },
    next: "A2 — describe your routine, past events and future plans.",
  },
  {
    code: "A2", name: "Pre-intermediate", title: "Getting by with confidence",
    can: ["Describe your routine, background and immediate needs", "Manage travel, shopping and services in predictable situations", "Write short emails and fill in simple forms"],
    vocab: "appointment · receipt · reservation · last week · usually",
    speaking: "“I usually study in the evening, but last night I met a friend.”",
    bars: { Listening: 45, Speaking: 40, Reading: 48, Writing: 42 },
    next: "B1 — express opinions and handle most situations while travelling.",
  },
  {
    code: "B1", name: "Intermediate", title: "Your own opinions, out loud",
    can: ["Deal with most situations on trips, at work and with speakers of English", "Describe experiences, hopes and give reasons for plans", "Produce connected text on familiar subjects"],
    vocab: "although · experience · improve · deal with · opportunity",
    speaking: "“I'd rather take the train — it's slower, but I can work on the way.”",
    bars: { Listening: 60, Speaking: 55, Reading: 62, Writing: 56 },
    next: "B2 — argue a position and follow complex, real-speed speech.",
  },
  {
    code: "B2", name: "Upper-intermediate", title: "Fluency with substance",
    can: ["Understand the main ideas of complex text, including technical discussion", "Interact with native speakers fluently and spontaneously", "Write clear, detailed text and defend a point of view"],
    vocab: "nevertheless · drawback · convey · take into account · feasible",
    speaking: "“It's a workable plan, but we should take the costs into account.”",
    bars: { Listening: 74, Speaking: 68, Reading: 78, Writing: 70 },
    next: "C1 — use English flexibly for professional and academic purposes.",
  },
  {
    code: "C1", name: "Advanced", title: "Flexible and precise",
    can: ["Understand demanding, longer texts and implicit meaning", "Express ideas fluently without much obvious searching for words", "Use language flexibly for social, academic and professional aims"],
    vocab: "compelling · nuance · entail · notwithstanding · articulate",
    speaking: "“The report is compelling, though it leaves one nuance unaddressed.”",
    bars: { Listening: 88, Speaking: 84, Reading: 90, Writing: 85 },
    next: "C2 — near-native ease in every situation.",
  },
  {
    code: "C2", name: "Mastery", title: "English without a ceiling",
    can: ["Understand virtually everything read or heard with ease", "Summarise information from different spoken and written sources", "Express yourself spontaneously, fluently and precisely"],
    vocab: "serendipity · quixotic · bona fide · veritable · leitmotif",
    speaking: "“It's a rare, almost serendipitous alignment of timing and intent.”",
    bars: { Listening: 98, Speaking: 97, Reading: 98, Writing: 96 },
    next: "You have reached the summit of the CEFR scale.",
  },
] as const;

export function CefrJourney() {
  const [idx, setIdx] = useState(4); // B2 default
  const lv = LEVELS[idx];

  return (
    <section className="hp-section hp-cefr" id="cefr" aria-labelledby="hp-cefr-title">
      <div className="hp-wrap">
        <Reveal className="hp-head hp-center">
          <span className="hp-eyebrow">The journey · CEFR-aligned</span>
          <h2 id="hp-cefr-title" className="hp-display hp-h2">Your journey has a destination.</h2>
          <p className="hp-lead">Seven levels, one continuous path. Tap any level to see exactly what you will be able to do when you get there.</p>
        </Reveal>

        <Reveal delay={1}>
          <div className="hp-cefr-track" role="tablist" aria-label="CEFR levels from Pre-A1 to C2">
            {LEVELS.map((l, i) => (
              <button
                key={l.code} role="tab" aria-selected={i === idx}
                className="hp-cefr-node" data-active={i === idx}
                onClick={() => setIdx(i)}
                aria-label={`${l.code} ${l.name}`}
              >
                <span className="dot">{l.code === "Pre-A1" ? "∅" : l.code}</span>
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={2}>
          <div className="hp-cefr-panel" role="tabpanel" aria-label={`${lv.code} details`}>
            <div>
              <span className="hp-eyebrow">{lv.code} · {lv.title}</span>
              <h3 className="hp-h3 hp-display" style={{ margin: "12px 0 16px" }}>What you can do at {lv.code}</h3>
              <ul className="hp-cefr-can">
                {lv.can.map((c) => (
                  <li key={c}><IconCheck size={17} /> {c}</li>
                ))}
              </ul>
              <p className="hp-caption" style={{ margin: "16px 0 4px" }}>Example vocabulary</p>
              <p style={{ margin: 0, fontSize: 14, color: "var(--hp-text)" }}>{lv.vocab}</p>
              <p className="hp-caption" style={{ margin: "14px 0 4px" }}>Example speaking ability</p>
              <p style={{ margin: 0, fontSize: 14.5, fontStyle: "italic", color: "var(--hp-text)" }}>{lv.speaking}</p>
            </div>
            <div className="hp-cefr-skills">
              <h3 className="hp-h3 hp-display" style={{ margin: "0 0 6px" }}>Skill profile at this level</h3>
              {Object.entries(lv.bars).map(([k, v]) => (
                <div className="hp-cefr-sbar" key={k}>
                  <span>{k}</span>
                  <span className="track" role="img" aria-label={`${k} at ${v} percent`}><i style={{ width: `${v}%` }} /></span>
                </div>
              ))}
              <p style={{ margin: "10px 0 0", fontSize: 13.5, color: "var(--hp-muted)", display: "flex", gap: 9, alignItems: "flex-start" }}>
                <IconArrow size={16} style={{ flex: "none", marginTop: 2 }} />
                <span><strong>Next milestone:</strong> {lv.next}</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

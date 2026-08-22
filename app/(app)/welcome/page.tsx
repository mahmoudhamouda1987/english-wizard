"use client";

import { useEffect, useMemo, useState } from "react";
import type { CEFRLevel } from "@/src/domain/learner";
import { firstWinQuestions } from "@/src/domain/first-win";
import { Celebration } from "@/app/components/celebration";

interface Q { id: string; question: string; options: string[]; answer: string }

export default function WelcomePage() {
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(() => firstWinQuestions(level), [level]);
  const current = questions[index % questions.length];

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((p) => { if (p.profile?.targetLevel) setLevel(p.profile.targetLevel); }).catch(() => undefined);
  }, []);

  async function choose(option: string) {
    if (picked) return;
    setPicked(option);
    const correct = option === current.answer;
    if (correct) setCorrectCount((c) => c + 1);
    try {
      await fetch("/api/evidence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionType: "QUICK_QUEST",
          missionId: "first-win",
          objectiveId: `first-win:${current.id}`,
          capabilityIds: ["grammar:patterns"],
          modality: "READING",
          outcome: correct ? "CORRECT" : "INCORRECT",
          score: correct ? 100 : 40,
          confidence: 0.9,
          level,
          context: "FAMILIAR",
          errorTags: [],
        }),
      });
    } catch { /* first-win evidence is best-effort */ }
  }

  function next() {
    if (index + 1 >= questions.length) { setFinished(true); return; }
    setIndex((i) => i + 1);
    setPicked(null);
  }

  return (
    <main id="main-content" className="dash-main" style={{ maxWidth: 760, margin: "0 auto" }}>
      <Celebration trigger={picked && picked === current?.answer ? `a${index}` : ""} />
      <Celebration trigger={finished ? "done" : ""} />

      {!started && (
        <section className="panel" style={{ padding: 32, textAlign: "center", marginTop: 24 }}>
          <span style={{ fontSize: 44 }} aria-hidden="true">🎉</span>
          <h1 style={{ fontSize: 30, margin: "10px 0 8px" }}>Welcome! Let&rsquo;s claim your first win.</h1>
          <p className="subtle" style={{ maxWidth: 460, margin: "0 auto 20px", lineHeight: 1.7 }}>
            Three quick questions at your level ({level}). Answer them and your journey starts with real saved evidence — not an empty dashboard.
          </p>
          <button className="button" onClick={() => setStarted(true)}>Start — it takes 60 seconds →</button>
        </section>
      )}

      {started && !finished && current && (
        <section className="panel" style={{ padding: 28, marginTop: 24 }}>
          <div className="track" aria-hidden="true"><span style={{ width: `${Math.round(((index + (picked ? 1 : 0)) / questions.length) * 100)}%` }} /></div>
          <p className="eyebrow" style={{ marginTop: 14 }}>Question {index + 1} of {questions.length}</p>
          <h2 style={{ fontSize: 22, lineHeight: 1.5, margin: "8px 0 16px" }}>{current.question}</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {current.options.map((option) => {
              const state = !picked ? "button secondary" : option === current.answer ? "button" : picked === option ? "state-card error" : "button secondary";
              return (
                <button key={option} className={state} style={{ textAlign: "left" }} onClick={() => void choose(option)}>
                  {picked && option === current.answer ? "✓ " : ""}{option}
                </button>
              );
            })}
          </div>
          {picked && (
            <div style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <strong>{picked === current.answer ? "✓ Saved as your first proof!" : "Saved — review targets are part of the journey too."}</strong>
              <button className="button" onClick={next}>{index + 1 >= questions.length ? "Finish →" : "Next question →"}</button>
            </div>
          )}
        </section>
      )}

      {finished && (
        <section className="panel" style={{ padding: 32, textAlign: "center", marginTop: 24 }}>
          <span style={{ fontSize: 48 }} aria-hidden="true">{correctCount === questions.length ? "🏆" : "🌱"}</span>
          <h1 style={{ fontSize: 30, margin: "10px 0 8px" }}>Your first win is banked.</h1>
          <p className="subtle" style={{ maxWidth: 480, margin: "0 auto 8px", lineHeight: 1.7 }}>
            {correctCount}/{questions.length} correct — and every answer is now real evidence in your learner model and portfolio.
            From here, the platform builds on exactly what you proved today.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
            <a className="button" href="/dashboard">Go to my command center →</a>
            <a className="button secondary" href="/portfolio">See my first artifacts</a>
          </div>
        </section>
      )}
    </main>
  );
}

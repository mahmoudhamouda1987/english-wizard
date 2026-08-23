"use client";

import { useMemo, useState } from "react";
import { speakText, stopSpeaking } from "@/src/domain/tts";

interface Item { text: string; meaning: string }

function normalise(s: string): string {
  return s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
}

export function ListeningLab({ items }: { items: Item[] }) {
  const [i, setI] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const item = items[i];
  const diff = useMemo(() => {
    if (!item || !checked) return null;
    const target = normalise(item.text).split(" ");
    const given = normalise(input).split(" ").filter(Boolean);
    return target.map((word, wi) => ({ word, ok: given[wi] === word }));
  }, [item, checked, input]);

  if (!items.length) {
    return <div className="state-card">Dictation for your level is being expanded — check back after the next curriculum update.</div>;
  }

  function play(rate: number) {
    if (item) speakText(item.text, { lang: "en-GB", rate });
  }

  function check() {
    setChecked(true);
    const exact = normalise(input) === normalise(item.text);
    if (exact) setScore((s) => s + 1);
  }

  function next() {
    stopSpeaking();
    if (i + 1 >= items.length) { setDone(true); return; }
    setI(i + 1); setInput(""); setChecked(false);
  }

  function restart() { setI(0); setInput(""); setChecked(false); setScore(0); setDone(false); }

  if (done) {
    return (
      <div className="state-card">
        <h3 style={{ marginTop: 0 }}>🎧 Dictation round complete</h3>
        <p>You caught <strong>{score} / {items.length}</strong> exactly right. Replay any item to sharpen it further.</p>
        <button type="button" className="button" onClick={restart}>↺ New round</button>
      </div>
    );
  }

  return (
    <section aria-label="Listening dictation lab" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button type="button" className="button" onClick={() => play(0.9)}>▶ Play at natural speed</button>
        <button type="button" className="button secondary" onClick={() => play(0.6)}>🐢 Slower</button>
        <span style={{ marginLeft: "auto", fontSize: 13 }} className="subtle">Item {i + 1}/{items.length} · Score {score}</span>
      </div>

      <div aria-hidden="true" style={{ fontSize: 40, textAlign: "center", letterSpacing: 4 }}>🎧 🔊 🎧</div>

      <label style={{ display: "grid", gap: 6 }}>
        <span><strong>Type exactly what you hear:</strong></span>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Listen, then type here…" disabled={checked}
          onKeyDown={(e) => { if (e.key === "Enter" && !checked && input.trim()) check(); }} />
      </label>

      {!checked ? (
        <div><button type="button" className="button" onClick={check} disabled={!input.trim()}>Check answer</button></div>
      ) : (
        <div role="status" aria-live="polite" className={diff!.every((w) => w.ok) ? "state-card" : "state-card warning"}>
          <p style={{ margin: "0 0 8px" }}>
            <strong>{diff!.every((w) => w.ok) ? "✓ Perfect!" : "Almost — compare word by word:"}</strong>
          </p>
          <p style={{ margin: "0 0 6px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {diff!.map((w, wi) => (
              <span key={wi} style={{
                padding: "3px 8px", borderRadius: 8, fontWeight: 600,
                background: w.ok ? "#dcf5e2" : "#fde3e3",
                color: w.ok ? "#14532d" : "#7f1d1d",
                textDecoration: w.ok ? "none" : "line-through",
              }}>{w.word}</span>
            ))}
          </p>
          {!diff!.every((w) => w.ok) && (
            <p style={{ margin: 0 }}><em>Target sentence:</em> “{item.text}”</p>
          )}
          <p style={{ margin: "6px 0 10px" }} className="subtle">💡 Meaning: {item.meaning}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="button secondary" onClick={() => play(0.75)}>🔊 Hear it again</button>
            <button type="button" className="button" onClick={next}>{i + 1 >= items.length ? "Finish round →" : "Next item →"}</button>
          </div>
        </div>
      )}
    </section>
  );
}

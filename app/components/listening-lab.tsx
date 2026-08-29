"use client";

import { useMemo, useState } from "react";
import { speakText, stopSpeaking } from "@/src/domain/tts";

interface Item { text: string; meaning: string }

function normalise(s: string): string {
  return s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
}

/** `onComplete` (optional) fires once when the learner finishes the final item — lets host pages record real progress. */
export function ListeningLab({ items, onComplete }: { items: Item[]; onComplete?: () => void }) {
  const [i, setI] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const item = items[i];
  const cloze = useMemo(() => {
    if (!item) return null;
    const words = item.text.split(" ");
    let best = -1;
    let bestLen = 3;
    for (let w = 0; w < words.length; w++) {
      const clean = words[w].replace(/[^A-Za-z']/g, "");
      if (clean.length > bestLen && /^[A-Za-z']+$/.test(clean)) { best = w; bestLen = clean.length; }
    }
    if (best < 0) return null;
    return { word: words[best].replace(/[^A-Za-z']/g, ""), gapped: words.map((w, wi) => (wi === best ? "______" : w)).join(" ") };
  }, [item]);
  const isClozeMode = Boolean(cloze) && i % 4 === 3;
  const diff = useMemo(() => {
    if (!item || !checked || isClozeMode) return null;
    const target = normalise(item.text).split(" ");
    const given = normalise(input).split(" ").filter(Boolean);
    return target.map((word, wi) => {
      const got = given[wi];
      let ok = false;
      let kind: "spelling" | "missing" | "wrong" | undefined;
      if (got === word) ok = true;
      else if (got === undefined) kind = "missing";
      else if (similar(got, word)) kind = "spelling";
      else kind = "wrong";
      return { word, ok, kind };
    });
  }, [item, checked, input, isClozeMode]);
  const explanations = useMemo(() => {
    if (!diff) return [] as string[];
    const out: string[] = [];
    for (const w of diff) {
      if (w.ok) continue;
      if (w.kind === "missing") out.push(`You missed the word “${w.word}” — listen once more and count the words in that part.`);
      else if (w.kind === "spelling") out.push(`You heard “${w.word}” right in sound — check its spelling.`);
      else out.push(`You wrote a different word where the speaker said “${w.word}” — replay at slow speed.`);
    }
    if (normalise(input).split(" ").filter(Boolean).length > normalise(item.text).split(" ").length) {
      out.push("You typed extra words — the speaker says fewer words than you wrote.");
    }
    return out.slice(0, 3);
  }, [diff, input, item.text]);

  if (!items.length) {
    return <div className="state-card">Dictation for your level is being expanded — check back after the next curriculum update.</div>;
  }

  function play(rate: number) {
    if (item) speakText(item.text, { lang: "en-GB", rate });
  }

  function check() {
    setChecked(true);
    if (isClozeMode) {
      if (cloze && normalise(input) === normalise(cloze.word)) setScore((s) => s + 1);
      return;
    }
    const exact = normalise(input) === normalise(item.text);
    if (exact) setScore((s) => s + 1);
  }

  function next() {
    stopSpeaking();
    if (i + 1 >= items.length) { setDone(true); onComplete?.(); return; }
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

      {isClozeMode && cloze && (
        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.8 }} dir="ltr">{cloze.gapped}</p>
      )}

      <label style={{ display: "grid", gap: 6 }}>
        <span><strong>{isClozeMode ? "Type the missing word you hear:" : "Type exactly what you hear:"}</strong></span>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={isClozeMode ? "One word…" : "Listen, then type here…"} disabled={checked}
          onKeyDown={(e) => { if (e.key === "Enter" && !checked && input.trim()) check(); }} />
      </label>

      {!checked ? (
        <div><button type="button" className="button" onClick={check} disabled={!input.trim()}>Check answer</button></div>
      ) : isClozeMode && cloze ? (
        <div role="status" aria-live="polite" className={normalise(input) === normalise(cloze.word) ? "state-card" : "state-card warning"}>
          <p style={{ margin: "0 0 6px" }}>
            <strong>{normalise(input) === normalise(cloze.word) ? "✓ Perfect!" : `Almost — the missing word was “${cloze.word}”:`}</strong>
          </p>
          <p style={{ margin: "0 0 6px" }} dir="ltr">{item.text}</p>
          <p style={{ margin: "6px 0 10px" }} className="subtle">💡 Meaning: {item.meaning}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="button secondary" onClick={() => play(0.75)}>🔊 Hear it again</button>
            <button type="button" className="button" onClick={next}>{i + 1 >= items.length ? "Finish round →" : "Next item →"}</button>
          </div>
        </div>
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
            <>
              <ul style={{ margin: "0 0 8px", paddingLeft: 20, lineHeight: 1.7 }}>
                {explanations.map((ex, ei) => <li key={ei}>{ex}</li>)}
              </ul>
              <p style={{ margin: 0 }}><em>Target sentence:</em> “{item.text}”</p>
            </>
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

function similar(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 2) return false;
  let edits = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) edits++;
    if (edits > 2) return false;
  }
  return true;
}


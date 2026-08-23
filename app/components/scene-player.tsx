"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { speakText, stopSpeaking } from "@/src/domain/tts";
import type { LearningScene } from "@/src/domain/scenes";

const SPEEDS = [0.7, 0.85, 1] as const;

export function ScenePlayer({ scene }: { scene: LearningScene }) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(0.85);
  const [showAr, setShowAr] = useState(true);
  const [finished, setFinished] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const timerRef = useRef<number | null>(null);
  const tokenRef = useRef(0);

  const line = !finished ? scene.lines[idx] : null;

  const speakCurrent = useCallback((i: number, rate: number) => {
    const l = scene.lines[i];
    if (!l) return;
    const pitch = l.speaker === "a" ? 0.9 : 1.2;
    speakText(l.text, { lang: "en-GB", rate: rate * (l.speaker === "b" ? 1 : 0.96), pitch });
  }, [scene]);

  const clearTimer = () => { if (timerRef.current !== null) { window.clearTimeout(timerRef.current); timerRef.current = null; } };
  const stopAll = () => { tokenRef.current++; stopSpeaking(); clearTimer(); };

  const advance = useCallback((from: number) => {
    if (from + 1 < scene.lines.length) {
      setIdx(from + 1);
      timerRef.current = window.setTimeout(() => speakCurrent(from + 1, speed), 650);
    } else {
      setPlaying(false);
      setFinished(true);
    }
  }, [scene.lines.length, speed, speakCurrent]);

  useEffect(() => {
    if (!playing || finished) return;
    const l = scene.lines[idx];
    if (!l) return;
    const myToken = ++tokenRef.current;
    speakText(l.text, {
      lang: "en-GB",
      rate: speed * (l.speaker === "b" ? 1 : 0.96),
      pitch: l.speaker === "a" ? 0.9 : 1.2,
      onEnd: () => {
        if (tokenRef.current !== myToken || timerRef.current !== null) return;
        timerRef.current = window.setTimeout(() => advance(idx), 500);
      },
    });
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, playing, finished, nonce]);

  useEffect(() => () => stopAll(), []);

  function goTo(i: number) {
    stopAll();
    setIdx(i); setFinished(false);
    if (playing) setNonce((n) => n + 1);
  }

  function toggle() {
    if (finished) { setFinished(false); setIdx(0); setPlaying(true); return; }
    if (playing) { stopAll(); setPlaying(false); }
    else setPlaying(true);
  }

  const activeSpeaker = line ? scene.characters[line.speaker] : null;

  return (
    <section aria-label={`Scene: ${scene.title}`} style={{ display: "grid", gap: 14 }}>
      {/* Stage */}
      <div
        aria-hidden="true"
        style={{
          position: "relative",
          borderRadius: 16,
          padding: "18px 18px 64px",
          background: `linear-gradient(135deg, ${scene.palette[0]}, ${scene.palette[1]})`,
          minHeight: 190,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 12, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="chip" style={{ fontSize: 13 }}>{scene.prop} {scene.setting}</span>
          <span className="chip" style={{ fontSize: 13 }}>{scene.levels.join(" · ")}</span>
        </div>

        {/* Characters */}
        <div style={{ position: "absolute", bottom: 10, left: 24, textAlign: "center", transform: line?.speaker === "a" ? "scale(1.15)" : "scale(1)", transition: "transform .3s" }}>
          <div style={{ fontSize: 44, filter: line?.speaker === "a" ? "drop-shadow(0 0 8px rgba(255,255,255,.7))" : "none" }}>{scene.characters.a.emoji}</div>
          <small style={{ color: "#fff", fontWeight: 600 }}>{scene.characters.a.name}</small>
        </div>
        <div style={{ position: "absolute", bottom: 10, right: 24, textAlign: "center", transform: line?.speaker === "b" ? "scale(1.15)" : "scale(1)", transition: "transform .3s" }}>
          <div style={{ fontSize: 44, filter: line?.speaker === "b" ? "drop-shadow(0 0 8px rgba(255,255,255,.7))" : "none" }}>{scene.characters.b.emoji}</div>
          <small style={{ color: "#fff", fontWeight: 600 }}>{scene.characters.b.name}</small>
        </div>

        {/* Speech bubble */}
        <div
          role="status"
          aria-live="polite"
          style={{
            margin: "34px auto 0", maxWidth: 520, background: "#ffffff", borderRadius: 14, padding: "12px 16px",
            boxShadow: "0 4px 14px rgba(0,0,0,.35)", color: "#1c2340", textAlign: "left",
            animation: "ew-bubble-in .25s ease-out",
          }}
        >
          {line ? (
            <>
              <strong style={{ fontSize: 13 }}>{activeSpeaker?.name}</strong>
              <p style={{ margin: "2px 0 0", fontSize: 17, lineHeight: 1.45 }}>{line.text}</p>
              {showAr && <p dir="rtl" style={{ margin: "6px 0 0", fontSize: 14, color: "#5a5f7a" }}>{line.ar}</p>}
              {line.note && <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#7c5cbf", fontWeight: 600 }}>💡 {line.note}</p>}
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 15 }}>🎬 Press play to watch the conversation come alive.</p>
          )}
        </div>
      </div>

      {/* Controls */}
      {!finished && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" className="button" onClick={toggle}>{playing ? "⏸ Pause" : idx === 0 && !playing ? "▶ Play" : "▶ Resume"}</button>
          <button type="button" className="button secondary" onClick={() => goTo(Math.max(0, idx - 1))} disabled={idx === 0}>⏮ Back</button>
          <button type="button" className="button secondary" onClick={() => advance(idx)}>Next ⏭</button>
          <select aria-label="Playback speed" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{ padding: "8px 10px" }}>
            {SPEEDS.map((s) => <option key={s} value={s}>{s < 1 ? `${s}× slower` : "Normal"}</option>)}
          </select>
          <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={showAr} onChange={(e) => setShowAr(e.target.checked)} /> Arabic subtitles
          </label>
          <span style={{ marginLeft: "auto", fontSize: 13 }} className="subtle">{Math.min(idx + 1, scene.lines.length)} / {scene.lines.length}</span>
        </div>
      )}

      {/* Progress dots */}
      {!finished && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {scene.lines.map((_, i) => (
            <button key={i} type="button" aria-label={`Line ${i + 1}`} onClick={() => goTo(i)}
              style={{ width: 22, height: 8, borderRadius: 99, border: "none", cursor: "pointer", background: i <= idx ? "var(--accent, #7c5cbf)" : "var(--border, #ccc)", opacity: i === idx ? 1 : 0.55 }} />
          ))}
        </div>
      )}

      {/* Transcript */}
      {!finished && (
        <details open>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Full transcript (tap a line to replay it)</summary>
          <ol style={{ margin: "10px 0 0", paddingLeft: 20, display: "grid", gap: 6 }}>
            {scene.lines.map((l, i) => (
              <li key={i}>
                <button type="button" onClick={() => goTo(i)} style={{ all: "unset", cursor: "pointer" }}
                  onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}>
                  <strong>{scene.characters[l.speaker].name}:</strong> {l.text}
                  {l.note && <em className="subtle"> — {l.note}</em>}
                </button>
              </li>
            ))}
          </ol>
        </details>
      )}

      {/* Comprehension quiz */}
      {finished && (
        <div className="state-card">
          <h3 style={{ marginTop: 0 }}>🎬 Scene complete! Check your understanding</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {scene.quiz.map((item, qi) => (
              <div key={qi}>
                <p style={{ margin: "0 0 6px" }}><strong>{qi + 1}.</strong> {item.q}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {item.choices.map((c, ci) => (
                    <button key={ci} type="button"
                      className={picked[qi] === undefined ? "button secondary" : ci === item.answer ? "button" : picked[qi] === ci ? "state-card error" : "button secondary"}
                      style={{ padding: "8px 12px" }}
                      onClick={() => setPicked((p) => ({ ...p, [qi]: ci }))}>
                      {picked[qi] !== undefined && ci === item.answer ? "✓ " : ""}{c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="button" className="button secondary" onClick={() => { setPicked({}); setFinished(false); setIdx(0); setPlaying(true); }}>↺ Watch again</button>
          </div>
        </div>
      )}

      <style>{`@keyframes ew-bubble-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}

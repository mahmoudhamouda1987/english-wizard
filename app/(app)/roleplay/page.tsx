"use client";

import { useEffect, useRef, useState } from "react";
import { ROLEPLAY_SCENARIOS, type RoleplayScenario } from "@/src/domain/roleplay";
import { speakText } from "@/src/domain/tts";
import { PageHero } from "@/app/components/page-hero";

interface Turn { role: "user" | "partner"; content: string }

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  start: () => void;
}

export default function RoleplayPage() {
  const [scenario, setScenario] = useState<RoleplayScenario | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [engine, setEngine] = useState<"ai" | "scripted" | null>(null);
  const [usedTargets, setUsedTargets] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [turns, busy]);

  function start(s: RoleplayScenario) {
    setScenario(s);
    setTurns([{ role: "partner", content: s.opener }]);
    setUsedTargets([]);
    setEngine(null);
  }

  async function send() {
    if (!scenario || !input.trim() || busy) return;
    const message = input.trim();
    setInput("");
    setTurns((t) => [...t, { role: "user", content: message }]);
    setBusy(true);
    try {
      const r = await fetch("/api/roleplay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.id, message, history: turns }),
      });
      const payload = await r.json();
      if (r.ok) {
        setEngine(payload.engine);
        setUsedTargets(payload.usedTargetPhrases ?? []);
        setTurns((t) => [...t, { role: "partner", content: payload.reply }]);
        speakText(payload.reply, { lang: "en-GB", rate: 0.95 });
      }
    } finally {
      setBusy(false);
    }
  }

  function listenOnce() {
    const ctor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!ctor) return;
    const recognition = new ctor();
    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.onresult = (event: { results: ArrayLike<ArrayLike<{ transcript?: string }>> }) => {
      const text = Array.from(event.results ?? []).map((item) => item[0]?.transcript ?? "").join(" ").trim();
      if (text) setInput((current) => (current ? `${current} ${text}` : text));
    };
    recognition.start();
  }

  return (
    <main id="main-content" className="dash-main">
      <PageHero icon="🎭" title="Role-play" sub="Live conversation practice with an in-character partner. Speak or type — your tutor remembers your weak spots either way." />

      {!scenario && (
        <div style={{ display: "grid", gap: 12 }}>
          {ROLEPLAY_SCENARIOS.map((s) => (
            <button key={s.id} className="panel" style={{ margin: 0, padding: 18, textAlign: "left", cursor: "pointer" }} onClick={() => start(s)}>
              <strong>{s.title}</strong> <span className="streak-pill">{s.level}</span>
              <p className="subtle" style={{ margin: "6px 0 0" }}>{s.situation}</p>
              <p className="eyebrow" style={{ marginTop: 8 }}>Partner: {s.partnerRole}</p>
            </button>
          ))}
        </div>
      )}

      {scenario && (
        <section className="panel" style={{ padding: 20, display: "grid", gap: 12 }}>
          <div className="panel-title">
            <h3>{scenario.title} · with the {scenario.partnerRole}</h3>
            <button className="link-button" onClick={() => { setScenario(null); setTurns([]); }}>← All scenarios</button>
          </div>

          {engine && (
            <p className="subtle" style={{ margin: 0, fontSize: 13 }}>
              Partner engine: {engine === "ai" ? "🤖 AI (remembers your weak points)" : "📜 scripted trainer"}{usedTargets.length > 0 ? ` · target phrases used this turn: ${usedTargets.join(", ")}` : ""}
            </p>
          )}

          <div style={{ display: "grid", gap: 8, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
            {turns.map((turn, i) => (
              <div key={i} style={{ justifySelf: turn.role === "user" ? "end" : "start", maxWidth: "85%", padding: "10px 14px", borderRadius: 14, background: turn.role === "user" ? "#efeafd" : "#f4f6fb", border: "1px solid var(--border)" }}>
                <small className="subtle" style={{ display: "block", marginBottom: 2 }}>{turn.role === "user" ? "You" : scenario.partnerRole}</small>
                {turn.content}
              </div>
            ))}
            {busy && <div className="subtle">Partner is thinking…</div>}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              aria-label="Your reply"
              placeholder="Type your reply — or use the mic…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void send(); }}
              style={{ flex: 1 }}
            />
            <button className="button secondary" onClick={listenOnce} aria-label="Speak your reply">🎙️</button>
            <button className="button" disabled={!input.trim() || busy} onClick={() => void send()}>Send</button>
          </div>
          <details>
            <summary className="link-button" style={{ cursor: "pointer" }}>Target phrases to weave in</summary>
            <p style={{ marginBottom: 0 }}>{scenario.targetPhrases.map((p) => <span key={p} className="streak-pill" style={{ marginRight: 6 }}>{p}</span>)}</p>
          </details>
        </section>
      )}
    </main>
  );
}

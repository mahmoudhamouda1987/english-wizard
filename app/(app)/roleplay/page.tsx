"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ROLEPLAY_SCENARIOS, type RoleplayScenario } from "@/src/domain/roleplay";
import type { CEFRLevel } from "@/src/domain/learner";
import { speakText } from "@/src/domain/tts";
import { PageHeader } from "@/app/components/page-header";
import { IconMic, IconTarget, IconUsers } from "@/app/components/nav-icons";

interface Turn { role: "user" | "partner"; content: string }

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  start: () => void;
}

const ALL_LEVELS = "All levels";
const LEVEL_ORDER: Array<CEFRLevel> = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

function LoadingSkeleton() {
  return (
    <section className="panel" aria-hidden="true">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" style={{ width: "75%" }} />
      <div className="skeleton skeleton-text" style={{ width: "55%" }} />
      <span className="sr-only">Loading role-play scenarios…</span>
    </section>
  );
}

export default function RoleplayPage() {
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<string>(ALL_LEVELS);
  const [scenario, setScenario] = useState<RoleplayScenario | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [micNote, setMicNote] = useState<string | null>(null);
  const [engine, setEngine] = useState<"ai" | "scripted" | null>(null);
  const [usedTargets, setUsedTargets] = useState<string[]>([]);
  const [allUsedTargets, setAllUsedTargets] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setReady(true); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [turns, busy]);

  const levels = useMemo(() => {
    const present = new Set(ROLEPLAY_SCENARIOS.map((s) => s.level));
    return LEVEL_ORDER.filter((lv) => present.has(lv));
  }, []);

  const visible = useMemo(
    () => (filter === ALL_LEVELS ? ROLEPLAY_SCENARIOS : ROLEPLAY_SCENARIOS.filter((s) => s.level === filter)),
    [filter],
  );

  function start(s: RoleplayScenario) {
    setScenario(s);
    setTurns([{ role: "partner", content: s.opener }]);
    setUsedTargets([]);
    setAllUsedTargets([]);
    setEngine(null);
    setSendError(null);
    setMicNote(null);
  }

  function exit() {
    window.speechSynthesis?.cancel();
    setScenario(null);
    setTurns([]);
    setSendError(null);
    setMicNote(null);
  }

  async function send(resend?: string) {
    if (!scenario || busy) return;
    const message = (resend ?? input).trim();
    if (!message) return;
    if (!resend) setInput("");
    const history = turns;
    setTurns((t) => [...t, { role: "user", content: message }]);
    setBusy(true);
    setSendError(null);
    try {
      const r = await fetch("/api/roleplay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.id, message, history }),
      });
      const payload = await r.json();
      if (!r.ok) throw new Error(payload.error ?? "partner-unreachable");
      setEngine(payload.engine);
      const used = (payload.usedTargetPhrases ?? []) as string[];
      setUsedTargets(used);
      setAllUsedTargets((current) => Array.from(new Set([...current, ...used])));
      setTurns((t) => [...t, { role: "partner", content: payload.reply }]);
      speakText(payload.reply, { lang: "en-GB", rate: 0.95 });
    } catch {
      setTurns((t) => t.slice(0, -1));
      setInput(message);
      setSendError("The partner could not reply just now. Your message is back in the box — press Send to try again.");
    } finally {
      setBusy(false);
    }
  }

  function listenOnce() {
    const ctor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!ctor) {
      setMicNote("Speech input is not available in this browser — type your reply instead.");
      return;
    }
    const recognition = new ctor();
    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.onresult = (event: { results: ArrayLike<ArrayLike<{ transcript?: string }>> }) => {
      const text = Array.from(event.results ?? []).map((item) => item[0]?.transcript ?? "").join(" ").trim();
      if (text) setInput((current) => (current ? `${current} ${text}` : text));
    };
    recognition.start();
  }

  const userTurnCount = turns.filter((t) => t.role === "user").length;

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Practise — role-play"
        title="Role-play"
        purpose="Step into real-life scenarios with an in-character partner. Speak or type — the tutor remembers your weak spots either way."
      />

      {!scenario && (
        <>
          <div className="filters" role="group" aria-label="Filter scenarios by CEFR level">
            <span className="f-label">Level</span>
            <button type="button" className="f-chip" data-active={filter === ALL_LEVELS} onClick={() => setFilter(ALL_LEVELS)}>{ALL_LEVELS}</button>
            {levels.map((lv) => (
              <button key={lv} type="button" className="f-chip" data-active={filter === lv} onClick={() => setFilter(lv)}>{lv}</button>
            ))}
          </div>

          {!ready && <LoadingSkeleton />}

          {ready && visible.length === 0 && (
            <div className="state-card info">
              <strong>What this area is:</strong> live conversation practice inside everyday and professional scenarios — a café, a hotel reception, a job interview and more.
              <p className="empty" style={{ marginTop: 8 }}>There is no role-play at {filter} yet. Choose another level above, or pick “{ALL_LEVELS}” to see every scenario.</p>
            </div>
          )}

          {ready && visible.length > 0 && (
            <div className="lib-grid">
              {visible.map((s) => (
                <button key={s.id} type="button" className="lib-card" onClick={() => start(s)} aria-label={`Start role-play: ${s.title} at ${s.level}`}>
                  <span className="lc-top">
                    <span className="lc-badges">
                      <span className="lc-badge level">{s.level}</span>
                      <span className="lc-badge skill">Speaking</span>
                    </span>
                    <h3>{s.title}</h3>
                    <p>{s.situation}</p>
                  </span>
                  <span className="lc-foot">
                    <span>With the {s.partnerRole}</span>
                    <span>{s.targetPhrases.length} target phrases · about 5 min</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {scenario && (
        <>
          <section className="panel" aria-label="Scenario setup">
            <div className="panel-title">
              <h3>{scenario.title} · with the {scenario.partnerRole}</h3>
              <button type="button" className="link-button" onClick={exit}>All scenarios</button>
            </div>
            <span className="lc-badges" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              <span className="lc-badge level">{scenario.level}</span>
              <span className="lc-badge skill">Speaking</span>
              <span className="lc-badge">Partner: {scenario.partnerRole}</span>
            </span>
            <div className="ck-stage">
              <div>
                <p className="ck-stage-label">Setup</p>
                <p style={{ margin: "8px 0 0", lineHeight: 1.6 }}>{scenario.situation}</p>
              </div>
              <div>
                <p className="ck-stage-label">Objective</p>
                <div className="conv-next" style={{ marginTop: 8 }}>
                  <IconTarget size={16} />
                  <span>Keep the conversation going with the {scenario.partnerRole} — ask, answer, and bring the exchange to a natural close.</span>
                </div>
              </div>
              <div>
                <p className="ck-stage-label">Language support</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  {scenario.targetPhrases.map((p) => (
                    <span key={p} className="chip" data-used={allUsedTargets.includes(p)}>{p}</span>
                  ))}
                </div>
                <p className="empty" style={{ marginTop: 8, fontSize: 12.5 }}>Weave these phrases in naturally — they are what a confident speaker would reach for here.</p>
              </div>
            </div>
          </section>

          {sendError && (
            <div className="state-card error" role="alert">
              {sendError}
            </div>
          )}

          <section className="panel" aria-label="The conversation">
            <div className="panel-title">
              <h3>The conversation</h3>
              {engine && (
                <span>
                  {engine === "ai" ? "Live partner — it remembers your weak points" : "Scripted trainer"}
                </span>
              )}
            </div>

            <div className="rp-chat">
              {turns.map((turn, i) => (
                <div key={i} className={turn.role === "user" ? "bubble-user" : "bubble-tutor"}>
                  <small className="rp-turn-label">{turn.role === "user" ? "You" : scenario.partnerRole}</small>
                  {turn.content}
                </div>
              ))}
              {busy && <p className="empty" style={{ margin: 0 }} role="status">The {scenario.partnerRole} is thinking…</p>}
              <div ref={bottomRef} />
            </div>

            <div className="rp-composer" style={{ marginTop: 14 }}>
              <input
                aria-label="Your reply"
                placeholder="Type your reply — or use the microphone"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void send(); }}
              />
              <button type="button" className="button secondary" onClick={listenOnce} aria-label="Speak your reply">
                <IconMic size={16} />
              </button>
              <button className="button" disabled={!input.trim() || busy} onClick={() => void send()}>Send</button>
            </div>
            {micNote && <p className="empty" style={{ marginTop: 8 }}>{micNote}</p>}
          </section>

          <section className="panel" aria-label="Feedback and reflection">
            <div className="panel-title">
              <h3>Feedback &amp; reflection</h3>
              <span>{userTurnCount} {userTurnCount === 1 ? "reply" : "replies"} so far</span>
            </div>
            {usedTargets.length > 0 ? (
              <div className="result-box" role="status">
                <p style={{ margin: 0 }}>
                  <strong>In your last reply:</strong> {usedTargets.join(", ")} — naturally placed. Keep that instinct.
                </p>
              </div>
            ) : (
              <p className="empty" style={{ margin: 0 }}>After each reply you will see which target phrases you managed to use.</p>
            )}
            <div style={{ marginTop: 12 }}>
              <p className="ck-stage-label">Target phrases so far</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {scenario.targetPhrases.map((p) => (
                  <span key={p} className="chip" data-used={allUsedTargets.includes(p)}>
                    {allUsedTargets.includes(p) ? `Used: ${p}` : p}
                  </span>
                ))}
              </div>
            </div>
            <div className="conv-next" style={{ marginTop: 14 }}>
              <IconUsers size={16} />
              <span>
                <strong>Reflect:</strong> re-read the exchange above. Where did you hesitate? Which phrase would you reach for sooner next time? When the conversation feels complete, return to the scenario list and try a different partner.
              </span>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

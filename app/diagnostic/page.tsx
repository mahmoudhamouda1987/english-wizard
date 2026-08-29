"use client";
import { Component, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { speakText, RECOGNITION_LANG } from "@/src/domain/tts";
import { track } from "@/app/lib/track";

/* ── types ── */
type ExposedItem = { id: string; cefr: string; difficulty: number; skill: string; subskill: string; type: "mcq" | "listening" | "speaking"; prompt: string; options: string[]; estimatedTime: number; audioText?: string };
type Report = { level: string; confidence: string; estimate: number; skillProfile: Record<string, string>; skillScores: Record<string, number>; skillAnswered?: Record<string, number>; skillsAttempted?: string[]; strengths: string[]; focusAreas: string[]; variant: number; answeredCount: number; speakingSubmitted?: boolean; speakingResponses?: number };

const LEVELS = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_COLOR: Record<string, string> = { "Pre-A1": "#94a3b8", A1: "#38bdf8", A2: "#34d399", B1: "#fbbf24", B2: "#fb923c", C1: "#f87171", C2: "#a855f7" };
const SKILL_ICON: Record<string, string> = { grammar: "🔤", vocabulary: "📚", reading: "📖", listening: "🎧", speaking: "🗣️" };
const SKILL_LABEL: Record<string, string> = { grammar: "Grammar", vocabulary: "Vocabulary", reading: "Reading", listening: "Listening", speaking: "Speaking" };
const TOTAL_SECONDS = 30 * 60;

const ASSESSMENT_META = [
  { icon: "⏱️", label: "30:00 max" },
  { icon: "🎚️", label: "Adaptive difficulty" },
  { icon: "🎧", label: "Listening" },
  { icon: "🗣️", label: "Speaking" },
  { icon: "❓", label: "Multiple choice" },
  { icon: "📄", label: "Personalized report" },
];

export default function LevelQuestPage() {
  const router = useRouter();
  const [paper, setPaper] = useState<ExposedItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [variant, setVariant] = useState(0);
  const [idx, setIdx] = useState(0);
  const [options, setOptions] = useState<Record<string, string[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answeredCorrect, setAnsweredCorrect] = useState<Record<string, boolean>>({});
  const [flags, setFlags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [listeningId, setListeningId] = useState<string | null>(null);
  const [showNav, setShowNav] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/levelquest", { cache: "no-store" });
        const p = await r.json();
        if (!r.ok) {
          // Auth or DB issue — show intro/auth state
          setError(p.error ?? "Unable to load LevelQuest.");
          setLoading(false);
          return;
        }
        setPaper(p.paper ?? []);
        setSessionId(p.sessionId);
        setVariant(p.variant);
        setAnsweredCorrect(p.answered ?? {});
        setFlags(p.flags ?? []);
        // Deterministic per-item option ordering (security/collusion)
        setOptions(orderOptions(p.paper ?? []));
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load LevelQuest.");
        setLoading(false);
      }
    })();
  }, []);

  function orderOptions(paper: ExposedItem[]): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    for (const item of paper) {
      if (item.type === "mcq" && item.options.length) {
        // stable rotation by variant + item char sum to avoid trivial pattern detection
        const seed = variant * 7 + Array.from(item.id).reduce((a, c) => a + c.charCodeAt(0), 0);
        const arr = [...item.options];
        for (let i = arr.length - 1; i > 0; i--) { const j = (seed + i) % (i + 1); [arr[i], arr[j]] = [arr[j], arr[i]]; }
        map[item.id] = arr;
      } else {
        map[item.id] = item.options ?? [];
      }
    }
    return map;
  }

  const currentItem = paper[idx];
  const answered = currentItem ? answeredCorrect[currentItem.id] !== undefined : false;

  async function persistAnswer(itemId: string, given: string) {
    if (!sessionId) return;
    setSaving(true);
    try {
      const r = await fetch("/api/levelquest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, itemId, answer: given }),
      });
      const text = await r.text();
      const p = text ? JSON.parse(text) : {};
      if (!r.ok) throw new Error(p.error ?? "Unable to save.");
      setAnsweredCorrect(p.answered ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save answer.");
    } finally { setSaving(false); }
  }

  function chooseOption(item: ExposedItem, option: string) {
    setAnswers((a) => ({ ...a, [item.id]: option }));
    void persistAnswer(item.id, option);
  }

  async function toggleFlag() {
    if (!currentItem || !sessionId) return;
    const next = flags.includes(currentItem.id) ? flags.filter((f) => f !== currentItem.id) : [...flags, currentItem.id];
    setFlags(next);
    try { await fetch("/api/levelquest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, flag: next }) }); } catch { /* non-fatal */ }
  }

  function playListening(item: ExposedItem) {
    if (!item || item.type !== "listening" || typeof window === "undefined") return;
    const text = item.audioText ?? item.prompt;
    if (!text) return;
    window.speechSynthesis.cancel();
    setListeningId(item.id);
    speakText(text, { lang: "en-GB", rate: 0.85, onEnd: () => setListeningId(null) });
  }

  async function finalize() {
    if (!sessionId || finished.current) return;
    finished.current = true;
    try {
      const r = await fetch("/api/levelquest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, finalize: true }),
      });
      const text = await r.text();
      const p = text ? JSON.parse(text) : {};
      if (!r.ok) throw new Error(p.error ?? "Unable to finalize.");
      setReport(p.result);
      localStorage.setItem("lq-result-v1", JSON.stringify({ ...p.result, date: new Date().toISOString() }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to finalize.");
      finished.current = false;
    }
  }

  /* Timer */
  useEffect(() => {
    if (!sessionId || !started || report) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); void finalize(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [sessionId, started, report]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const timerState = secondsLeft > 600 ? "normal" : secondsLeft > 300 ? "attention" : "urgent";

  const answeredCount = Object.values(answeredCorrect).filter(Boolean).length;

  if (report) return <ReportView report={report} />;
  if (loading) return <Centered><Spinner text="Preparing LevelQuest…" /></Centered>;

  /* Auth/intro gate when no paper */
  if (paper.length === 0 && !started) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(160deg, #0f1535, #2a1a4a)", color: "white", textAlign: "center" }}>
      <div style={{ maxWidth: 640 }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🚀</div>
        <p className="eyebrow" style={{ color: "#93c5fd" }}>LEVELQUEST</p>
        <h1 style={{ fontSize: 32, margin: "12px 0" }}>Adaptive English Placement Assessment</h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, opacity: .88, maxWidth: 540, margin: "0 auto 26px" }}>
          LevelQuest adapts to you. As your answers demonstrate stronger English ability, the challenge increases. If questions become too difficult, the assessment adjusts to accurately identify your current level.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, maxWidth: 560, margin: "0 auto 28px" }}>
          {ASSESSMENT_META.map((m) => <div key={m.label} style={{ padding: "14px 10px", borderRadius: 12, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" }}><div style={{ fontSize: 24 }}>{m.icon}</div><div style={{ fontSize: 12.5, marginTop: 6, opacity: .85 }}>{m.label}</div></div>)}
        </div>
        {error && <p style={{ color: "#fda4af", marginBottom: 12 }}>{error}</p>}
        {!error && <button onClick={() => setStarted(true)} className="button" style={{ padding: "15px 36px", fontSize: 16, background: "linear-gradient(135deg,#6840d6,#8b5cf6)" }}>Start LevelQuest →</button>}
        {error && <a className="button" href={`/auth?next=/diagnostic`}>Sign in to continue →</a>}
      </div>
    </main>
  );

  /* Assessment view */
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f7f8fb" }}>
      {!started && paper.length > 0 ? (
        <Centered>
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            <div style={{ fontSize: 60 }}>🚀</div>
            <p className="eyebrow" style={{ color: "#6840d6", margin: "14px 0 6px", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 800, fontSize: 12.5 }}>Level Placement Assessment</p>
            <h1 style={{ fontSize: "clamp(26px,4vw,34px)", margin: "0 0 14px", fontWeight: 800, color: "#172033", lineHeight: 1.2, letterSpacing: "-.01em" }}>Ready to start your placement assessment?</h1>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#334155", maxWidth: 540, margin: "0 auto 20px" }}>
              You&rsquo;ll have <strong style={{ color: "#172033" }}>30 minutes</strong>. You can navigate back and forward, flag questions for review, and change your answers before finishing. One of 15 versions is assigned to you at random.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 10, maxWidth: 520, margin: "0 auto 26px" }}>
              {[
                { icon: "⏱️", t: "30:00 max" },
                { icon: "🎚️", t: "Adaptive difficulty" },
                { icon: "🎧", t: "Listening" },
                { icon: "🗣️", t: "Speaking" },
              ].map((c) => (
                <div key={c.t} style={{ padding: "12px 10px", borderRadius: 12, background: "#f4f0ff", border: "1px solid #e5dcff", color: "#4338ca" }}>
                  <div style={{ fontSize: 22 }}>{c.icon}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>{c.t}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setStarted(true)} className="button" style={{ padding: "16px 40px", fontSize: 16, background: "linear-gradient(135deg,#6840d6,#8b5cf6)", boxShadow: "0 10px 26px rgba(104,64,214,.35)" }}>Begin Assessment →</button>
          </div>
        </Centered>
      ) : (
        <>
          {/* Header */}
          <header style={{ background: "white", borderBottom: "1px solid #e8ebf2", padding: "0 24px", position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, minHeight: 62 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>🧙 English Wizard</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "#6840d622", color: "#6840d6", fontWeight: 700 }}>LEVELQUEST</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <TimerDisplay mm={mm} ss={ss} state={timerState} />
                <button onClick={() => setShowNav((s) => !s)} className="button secondary" style={{ padding: "7px 12px", fontSize: 13 }}>{showNav ? "Hide navigator" : "Navigator"}</button>
              </div>
            </div>
          </header>

          {showNav && <NavGrid paper={paper} answered={answeredCorrect} flags={flags} idx={idx} onGo={setIdx} />}

          <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, opacity: .6 }}>Question {idx + 1} of {paper.length}</span>
              {currentItem && <SkillChip skill={currentItem.skill} />}
              {currentItem && <AdaptiveBadge />}
              {flags.includes(currentItem.id) && <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "#fbbf2422", color: "#b45309", fontWeight: 700 }}>⚑ Flagged</span>}
            </div>

            {error && (
              <div role="alert" style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 10, background: "#fee2e2", color: "#991b1b", fontSize: 13.5, border: "1px solid #fecaca" }}>
                <strong>Something went wrong:</strong> {error}
                <button onClick={() => setError(null)} style={{ marginLeft: 10, background: "transparent", border: "none", color: "#991b1b", cursor: "pointer", textDecoration: "underline", fontSize: 12.5 }}>Dismiss</button>
              </div>
            )}

            {currentItem && (
              <QuestionBoundary key={currentItem.id}>
              <section className="panel" style={{ padding: 28, animation: "cardIn .25s ease" }}>
                {currentItem.type === "listening" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                    <button onClick={() => playListening(currentItem)} style={{ width: 52, height: 52, borderRadius: "50%", border: 0, background: "#6840d6", color: "white", fontSize: 20, cursor: "pointer", flexShrink: 0 }} aria-label="Play audio">{listeningId === currentItem.id ? "❚❚" : "▶"}</button>
                    <div><div style={{ fontWeight: 700, fontSize: 15 }}>Listening</div><div className="subtle" style={{ fontSize: 12.5 }}>Listen to the audio, then choose the best answer.</div></div>
                  </div>
                )}
                {currentItem.type === "speaking" && <SpeakingInterface item={currentItem} onDone={(t) => chooseOption(currentItem, t)} />}
                {currentItem.type !== "speaking" && (
                  <>
                    <h2 style={{ fontSize: 20, margin: currentItem.type === "listening" ? "0 0 18px" : "0 0 18px", lineHeight: 1.4, fontWeight: 700 }}>{currentItem.prompt}</h2>
                    <div style={{ display: "grid", gap: 10 }}>
                      {(options[currentItem.id] ?? currentItem.options).map((opt, oi) => {
                        const isSelected = answers[currentItem.id] === opt;
                        return (
                          <button key={`${opt}-${oi}`} onClick={() => chooseOption(currentItem, opt)} disabled={saving} style={{ textAlign: "left", padding: "14px 16px", borderRadius: 12, border: isSelected ? "2px solid #6840d6" : "1px solid #dfe3ec", background: isSelected ? "#f0ebff" : "white", cursor: "pointer", fontSize: 15, transition: "all .15s", display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ width: 20, height: 20, borderRadius: "50%", border: isSelected ? "6px solid #6840d6" : "2px solid #c3c9d6", display: "inline-block", flexShrink: 0 }} />
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                {answered && <p className="subtle" style={{ marginTop: 14, fontSize: 12.5 }}>✓ Answer saved — you can change it anytime.</p>}
                {currentItem.type === "speaking" && <p className="subtle" style={{ marginTop: 10, fontSize: 12 }}>Recording is optional — typing your response also works.</p>}
              </section>
              </QuestionBoundary>
            )}
          </div>

          {/* Footer nav */}
          <footer style={{ background: "white", borderTop: "1px solid #e8ebf2", padding: "12px 24px", position: "sticky", bottom: 0, marginTop: "auto" }}>
            <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <button onClick={toggleFlag} className="button secondary" style={{ fontSize: 13 }}>{flags.includes(currentItem?.id ?? "") ? "✓ Flagged for review" : "⚑ Flag for review"}</button>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="button secondary">← Previous</button>
                <button onClick={() => setIdx(Math.min(paper.length - 1, idx + 1))} className="button secondary">Next →</button>
                <button onClick={() => void finalize()} className="button" style={{ background: "#10b981" }}>Finish & Get Report ✓</button>
              </div>
            </div>
          </footer>
        </>
      )}
      <style>{`@keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>{children}</main>;
}

function Spinner({ text }: { text: string }) {
  return <div style={{ textAlign: "center" }}><div style={{ fontSize: 56, animation: "pulse 1.2s infinite" }}>🧙</div><p style={{ marginTop: 12, opacity: .7 }}>{text}</p><style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style></div>;
}

function TimerDisplay({ mm, ss, state }: { mm: string; ss: string; state: string }) {
  const color = state === "normal" ? "#475569" : state === "attention" ? "#b45309" : "#dc2626";
  const bg = state === "attention" ? "#fef3c7" : state === "urgent" ? "#fee2e2" : "#f1f5f9";
  return <div style={{ display: "flex", alignItems: "center", gap: 6, background: bg, padding: "6px 12px", borderRadius: 10, color, fontWeight: 700, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>⏱️ {mm}:{ss}</div>;
}

function SkillChip({ skill }: { skill: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, padding: "3px 10px", borderRadius: 8, background: "#eef2ff", color: "#4338ca", fontWeight: 600 }}>{SKILL_ICON[skill]} {SKILL_LABEL[skill]}</span>;
}

function AdaptiveBadge() {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#0891b2", fontWeight: 600 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0891b2" }} /> Adaptive Challenge</span>;
}

/** Keeps the assessment tappable (navigation, finish) even if a single item fails to render. */
class QuestionBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* item render error is non-fatal */ }
  render() {
    if (this.state.failed) {
      return (
        <section className="panel" style={{ padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 36 }}>😕</div>
          <p style={{ margin: "8px 0 4px", fontWeight: 700 }}>This question didn&rsquo;t load properly.</p>
          <p className="subtle" style={{ margin: "0 0 12px", fontSize: 13 }}>Use the navigator or Next to move on — your progress is saved.</p>
          <button className="button secondary" onClick={() => this.setState({ failed: false })}>Try again</button>
        </section>
      );
    }
    return this.props.children;
  }
}

function NavGrid({ paper, answered, flags, idx, onGo }: { paper: ExposedItem[]; answered: Record<string, boolean>; flags: string[]; idx: number; onGo: (i: number) => void }) {
  return (
    <div style={{ background: "white", borderBottom: "1px solid #e8ebf2", padding: "12px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 8 }}>
        {paper.map((item, i) => {
          const isAnswered = answered[item.id] !== undefined;
          const flagged = flags.includes(item.id);
          const isCurrent = i === idx;
          let bg = isCurrent ? "#6840d6" : isAnswered ? "#10b981" : "white";
          let color = isCurrent || isAnswered ? "white" : "#475569";
          if (item.type === "speaking") { bg = isCurrent ? "#6840d6" : "#a855f7"; color = "white"; }
          if (flagged && !isAnswered) { bg = "#fbbf24"; color = "white"; }
          return (
            <button key={item.id} onClick={() => onGo(i)} title={`Q${i + 1} ${item.type === "speaking" ? "Speaking" : SKILL_LABEL[item.skill]}`} style={{ width: 34, height: 34, borderRadius: 8, border: isCurrent ? "2px solid #6840d6" : (isAnswered ? "2px solid #10b981" : "2px solid #d1d5db"), background: bg, color, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {i + 1}
            </button>
          );
        })}
      </div>
      <div style={{ maxWidth: 860, margin: "8px auto 0", display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11.5, opacity: .75 }}>
        <span><span style={{ color: "#10b981", fontWeight: 700 }}>■</span> Answered</span>
        <span><span style={{ color: "#fbbf24", fontWeight: 700 }}>■</span> Flagged</span>
        <span><span style={{ color: "#a855f7", fontWeight: 700 }}>■</span> Speaking</span>
        <span><span style={{ color: "#6840d6", fontWeight: 700 }}>■</span> Current</span>
      </div>
    </div>
  );
}

function SpeakingInterface({ item, onDone }: { item: ExposedItem; onDone: (t: string) => void }) {
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [sent, setSent] = useState(false);
  const ref = useRef<{ stop: () => void } | null>(null);

  function start() {
    if (typeof window === "undefined") return;
    const Ctor = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!Ctor) { setTranscript((t) => t || "I'll type my answer instead."); return; }
    const rec = new Ctor();
    rec.lang = RECOGNITION_LANG; rec.continuous = false; rec.interimResults = false;
    rec.onresult = (e: any) => { const t = Array.from(e.results ?? []).map((r: any) => r[0]?.transcript ?? "").join(" ").trim(); if (t) setTranscript(t); };
    rec.onerror = () => setTranscript((c) => c || "I'll type my answer.");
    rec.onend = () => setRecording(false);
    ref.current = rec; setRecording(true); rec.start();
  }
  function stop() { ref.current?.stop(); setRecording(false); }
  return (
    <div>
      <h2 style={{ fontSize: 20, margin: "0 0 16px", fontWeight: 700 }}>🗣️ {item.prompt}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <button onClick={recording ? stop : start} style={{ width: 60, height: 60, borderRadius: "50%", border: recording ? "3px solid #dc2626" : "1px solid #dfe3ec", background: recording ? "#fee2e2" : "#f0ebff", cursor: "pointer", fontSize: 24 }} aria-label="Record response">🎙️</button>
        <div><div style={{ fontWeight: 700 }}>{recording ? "Listening…" : "Click to record"}</div><div className="subtle" style={{ fontSize: 12.5 }}>Or type your response below.</div></div>
      </div>
      <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={4} placeholder="Your spoken response will appear here, or type it…" style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #dfe3ec", fontSize: 15, lineHeight: 1.6 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button onClick={() => { onDone(transcript); setSent(true); }} disabled={sent || !transcript.trim()} className="button" style={{ fontSize: 14 }}>{sent ? "✓ Submitted" : "Submit speaking response"}</button>
      </div>
    </div>
  );
}

/* ── Report view ── */
function ReportView({ report }: { report: Report }) {
  const router = useRouter();
  const skills = ["grammar", "vocabulary", "reading", "listening", "speaking"];
  const lvIdx = LEVELS.indexOf(report.level);

  useEffect(() => {
    track("levelquest_completed_viewed", { level: report.level });
  }, [report.level]);

  return (
    <main style={{ minHeight: "100vh", background: "#f7f8fb", padding: "32px 16px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40 }}>🏆</div>
          <p className="eyebrow" style={{ margin: 6 }}>ENGLISH WIZARD · LEVELQUEST</p>
          <h1 style={{ fontSize: 26, margin: "4px 0" }}>Your Placement Report</h1>
          <p className="subtle">Adaptive English Placement Assessment · Variant {report.variant}</p>
        </div>

        <div className="panel" style={{ padding: 28, textAlign: "center", background: "linear-gradient(135deg, #0f1535, #2a1a4a)", color: "white", borderRadius: 18 }}>
          <div style={{ fontSize: 12.5, opacity: .7, textTransform: "uppercase", letterSpacing: ".12em" }}>Your English Level</div>
          <div style={{ fontSize: 80, fontWeight: 900, margin: "8px 0" }}>{report.level}</div>
          <div style={{ fontSize: 18, marginBottom: 6 }}>{report.confidence} Confidence</div>
          <p className="subtle" style={{ color: "#cbd5e1", maxWidth: 480, margin: "0 auto", fontSize: 13 }}>Adaptive estimate boundary {report.estimate} · {report.answeredCount} responses analyzed</p>
        </div>

        <div className="panel" style={{ padding: 24, marginTop: 18 }}>
          <h3 style={{ margin: "0 0 16px" }}>Your journey</h3>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
            {LEVELS.map((lv, i) => {
              const reached = i <= lvIdx; const isCurrent = i === lvIdx;
              return (
                <div key={lv} style={{ display: "flex", flex: 1, alignItems: "center", flexDirection: "column", minWidth: 80, position: "relative" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: reached ? `${LEVEL_COLOR[lv]}22` : "#f1f5f9", border: `3px solid ${reached ? LEVEL_COLOR[lv] : "#e2e8f0"}`, color: reached ? LEVEL_COLOR[lv] : "#94a3b8", fontWeight: 800, fontSize: 11 }}>
                    {lv}
                  </div>
                  {isCurrent && <span style={{ position: "absolute", top: -22, fontSize: 10, whiteSpace: "nowrap", color: "white", background: LEVEL_COLOR[lv], padding: "2px 7px", borderRadius: 6, fontWeight: 700 }}>YOU ARE HERE</span>}
                  {i < LEVELS.length - 1 && <div style={{ position: "absolute", top: 21, left: "50%", width: "100%", height: 3, background: i < lvIdx ? LEVEL_COLOR[lv] : "#e2e8f0", zIndex: -1 }} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel" style={{ padding: 24, marginTop: 18 }}>
          <h3 style={{ margin: "0 0 18px" }}>Your English profile</h3>
          <div style={{ display: "grid", gap: 12 }}>
            {skills.map((skill) => {
              const lv = report.skillProfile[skill];
              const score = report.skillScores[skill];
              const attempted = report.skillAnswered ? (report.skillAnswered[skill] ?? 0) > 0 : (score ?? 0) > 0;
              // Speaking is reported honestly as submitted work, not a fabricated score.
              if (skill === "speaking") {
                return (
                  <div key={skill} style={{ display: "grid", gridTemplateColumns: "120px 42px 1fr 56px", gap: 12, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{SKILL_ICON[skill]} {SKILL_LABEL[skill]}</span>
                    <strong style={{ textAlign: "center", color: "#a855f7", fontSize: 13 }}>{report.speakingSubmitted ? "Submitted" : "—"}</strong>
                    <div className="subtle" style={{ fontSize: 12 }}>Recorded &amp; typed responses — reviewed in guided conversation.</div>
                    <span style={{ fontSize: 12.5, opacity: .7, textAlign: "right" }}>{report.speakingSubmitted ? `${report.speakingResponses ?? 0} resp.` : "n/a"}</span>
                  </div>
                );
              }
              if (!attempted) {
                return (
                  <div key={skill} style={{ display: "grid", gridTemplateColumns: "120px 42px 1fr 56px", gap: 12, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{SKILL_ICON[skill]} {SKILL_LABEL[skill]}</span>
                    <strong style={{ textAlign: "center", color: "#94a3b8", fontSize: 13 }}>—</strong>
                    <div className="subtle" style={{ fontSize: 12 }}>Not attempted in this sitting.</div>
                    <span style={{ fontSize: 12.5, opacity: .7, textAlign: "right" }}>n/a</span>
                  </div>
                );
              }
              return (
                <div key={skill} style={{ display: "grid", gridTemplateColumns: "120px 42px 1fr 56px", gap: 12, alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{SKILL_ICON[skill]} {SKILL_LABEL[skill]}</span>
                  <strong style={{ textAlign: "center", color: LEVEL_COLOR[lv], fontSize: 14 }}>{lv}</strong>
                  <div style={{ height: 12, background: "#eef1f6", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                    <div style={{ width: `${score}%`, height: "100%", background: `linear-gradient(90deg, ${LEVEL_COLOR[lv]}, ${LEVEL_COLOR[lv]}88)`, borderRadius: 6, transition: "width .8s" }} />
                  </div>
                  <span style={{ fontSize: 12.5, opacity: .7, textAlign: "right" }}>{score}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
          <div className="panel" style={{ padding: 22, borderLeft: "4px solid #10b981" }}>
            <h3 style={{ margin: "0 0 10px" }}>🌟 Your strengths</h3>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>{report.strengths.map((s) => <li key={s}>{SKILL_LABEL[s]} — strong performance</li>)}</ul>
          </div>
          <div className="panel" style={{ padding: 22, borderLeft: "4px solid #fb923c" }}>
            <h3 style={{ margin: "0 0 10px" }}>🎯 Focus areas</h3>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>{report.focusAreas.map((s) => <li key={s}>{SKILL_LABEL[s]} — worth developing</li>)}</ul>
          </div>
        </div>

        <div className="panel" style={{ padding: 24, marginTop: 18, background: "linear-gradient(135deg,#f6f2ff,#f0f4ff)" }}>
          <h3 style={{ margin: "0 0 12px" }}>🧭 Recommended starting point</h3>
          <p style={{ margin: "0 0 12px", lineHeight: 1.7 }}>Your English Wizard journey begins at <strong>{report.level}</strong>. Your path is personalized to reinforce focus areas while building on your strengths.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => router.push("/learning-path")} className="button">Continue to English Wizard →</button>
          <a href="/api/levelquest/report" className="button secondary">⬇️ Download official PDF report</a>
          <button onClick={() => router.push("/plan")} className="button secondary">🗂️ My plan</button>
          <button onClick={() => window.print()} className="button secondary">🖨️ Print</button>
          </div>
        </div>
      </div>
    </main>
  );
}

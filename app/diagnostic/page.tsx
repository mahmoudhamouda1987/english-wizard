"use client";

import { ThemeToggle } from "@/app/components/theme-toggle";
import Link from "next/link";
import { Component, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { speakText, stopSpeaking, RECOGNITION_LANG } from "@/src/domain/tts";
import { track } from "@/app/lib/track";

/* ── types ── */
type ExposedItem = { id: string; cefr: string; difficulty: number; skill: string; subskill: string; type: "mcq" | "listening" | "speaking"; prompt: string; options: string[]; estimatedTime: number; audioText?: string };
type SpeakingEval = { submitted: boolean; words: number; sentences: number; lexicalDiversity: number | null; connectives: number; band: string | null; note: string };
type Report = {
  level: string; confidence: string; boundary?: string | null; estimate: number; standardError?: number;
  skillProfile: Record<string, string>; skillScores: Record<string, number>; skillLowEvidence?: string[];
  skillAnswered?: Record<string, number>; skillsAttempted?: string[];
  strengths: string[]; focusAreas: string[]; variant: number; variantTheme?: string;
  answeredCount: number; presentedCount?: number;
  speakingSubmitted?: boolean; speakingResponses?: number; speakingBand?: string | null;
  speakingFeedback?: Record<string, SpeakingEval>;
  studentName?: string | null; studentId?: string | null; assessmentId?: string; assessmentDate?: string;
};
type Progress = { presented: number; target: number; objectiveAnswered: number; speakingAnswered: number; readyToFinalize: boolean; readyReason?: string | null };

const LEVELS = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_COLOR: Record<string, string> = { "Pre-A1": "#94a3b8", A1: "#38bdf8", A2: "#34d399", B1: "#fbbf24", B2: "#fb923c", C1: "#f87171", C2: "#a855f7" };
const SKILL_ICON: Record<string, string> = { grammar: "🔤", vocabulary: "📚", reading: "📖", listening: "🎧", speaking: "🗣️" };
const SKILL_LABEL: Record<string, string> = { grammar: "Grammar", vocabulary: "Vocabulary", reading: "Reading", listening: "Listening", speaking: "Speaking" };
const TOTAL_SECONDS = 30 * 60;

/* Minimal structural types for the Web Speech API (not in all TS lib targets) */
type SpeechRecognitionAlternativeLike = { transcript?: string };
type SpeechRecognitionResultLike = ArrayLike<SpeechRecognitionAlternativeLike>;
type SpeechRecognitionEventLike = { results?: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

/* Deterministic per-item option ordering (security/collusion).
   Module-scope so it never captures stale component state; the variant must
   be passed explicitly by the caller. */
function orderOptions(paper: ExposedItem[], variant: number): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const item of paper) {
    if (item.type === "mcq" && item.options.length) {
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

export default function LevelCheckPage() {
  const [paper, setPaper] = useState<ExposedItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [variant, setVariant] = useState(0);
  const [variantTheme, setVariantTheme] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [idx, setIdx] = useState(0);
  const [options, setOptions] = useState<Record<string, string[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answeredCorrect, setAnsweredCorrect] = useState<Record<string, boolean>>({});
  const [flags, setFlags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [showNav, setShowNav] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [processing, setProcessing] = useState(false);
  const [started, setStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [estimate, setEstimate] = useState<number | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/levelquest", { cache: "no-store" });
        const p = await r.json();
        if (!r.ok) {
          setError(p.error ?? "Unable to load LevelCheck.");
          setLoading(false);
          return;
        }
        setPaper(p.paper ?? []);
        setSessionId(p.sessionId);
        setVariant(typeof p.variant === "number" ? p.variant : 0);
        setVariantTheme(p.variantTheme ?? null);
        setAnsweredCorrect(p.answered ?? {});
        setFlags(p.flags ?? []);
        setProgress(p.progress ?? null);
        if (typeof p.estimate === "number") setEstimate(p.estimate);
        if (typeof p.remainingSeconds === "number") setSecondsLeft(Math.max(0, p.remainingSeconds));
        // Resume: place the learner on their first unanswered question.
        const firstUnanswered = (p.paper ?? []).findIndex((it: ExposedItem) => p.answered?.[it.id] === undefined);
        setIdx(firstUnanswered >= 0 ? firstUnanswered : Math.max(0, (p.paper ?? []).length - 1));
        setOptions(orderOptions(p.paper ?? [], typeof p.variant === "number" ? p.variant : 0));
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load LevelCheck.");
        setLoading(false);
      }
    })();
  }, []);

  const currentItem = paper[idx];

  /** Append an adaptively-selected item to the presented sequence (dedup-safe). */
  function appendItem(item: ExposedItem | null) {
    if (!item) return;
    setPaper((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;
      setOptions((o) => ({ ...o, ...orderOptions([item], variant) }));
      return [...prev, item];
    });
  }

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
      if (typeof p.estimate === "number") setEstimate(p.estimate);
      if (p.progress) setProgress(p.progress);
      appendItem(p.appended ?? null);
      track("levelquest_question_answered", { itemId });
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
    track("question_flagged", { itemId: currentItem.id, flagged: next.includes(currentItem.id) });
    try { await fetch("/api/levelquest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, flag: next }) }); } catch { /* non-fatal */ }
  }

  /** Move within the sequence; asking the server for more when past the end. */
  async function goTo(nextIdx: number) {
    if (nextIdx < 0) return;
    if (nextIdx < paper.length) {
      if (currentItem && answeredCorrect[currentItem.id] === undefined && nextIdx > idx) track("question_skipped", { itemId: currentItem.id });
      setIdx(nextIdx);
      return;
    }
    if (nextIdx === paper.length && sessionId && progress && !progress.readyToFinalize) {
      // Skipped ahead past the last presented item — request the next one.
      try {
        const r = await fetch("/api/levelquest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, more: true }) });
        const p = await r.json();
        if (r.ok && p.appended) { appendItem(p.appended); if (p.progress) setProgress(p.progress); }
        if (currentItem && answeredCorrect[currentItem.id] === undefined) track("question_skipped", { itemId: currentItem.id });
      } catch { /* stay put on failure */ }
      setIdx(Math.min(nextIdx, paper.length - 1 + 1) > paper.length - 1 ? paper.length - 1 : nextIdx);
      return;
    }
    if (nextIdx <= paper.length - 1) setIdx(nextIdx);
    if (currentItem && answeredCorrect[currentItem.id] === undefined && nextIdx > idx) track("question_skipped", { itemId: currentItem.id });
    setIdx(Math.min(nextIdx, paper.length - 1));
  }

  const finalize = useCallback(async function finalize() {
    if (!sessionId || finished.current) return;
    finished.current = true;
    setProcessing(true);
    const startedAt = Date.now();
    stopSpeaking();
    try {
      const r = await fetch("/api/levelquest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, finalize: true }),
      });
      const text = await r.text();
      const p = text ? JSON.parse(text) : {};
      if (!r.ok) throw new Error(p.error ?? "Unable to finalize.");
      // Assessment Processing transition (Part 1) — polished, never a dead wait.
      const elapsed = Date.now() - startedAt;
      if (elapsed < 1600) await new Promise((res) => setTimeout(res, 1600 - elapsed));
      track("assessment_completed", { level: p.result?.level });
      setReport(p.result);
      setProcessing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to finalize.");
      finished.current = false;
      setProcessing(false);
    }
  }, [sessionId]);

  /* Timer */
  useEffect(() => {
    if (!sessionId || !started || report || processing) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); void finalize(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [sessionId, started, report, processing, finalize]);

  /* Assessment abandonment signal (Part 34): leaving mid-assessment, best-effort. */
  useEffect(() => {
    if (!sessionId || !started) return;
    const onLeave = () => { if (!finished.current) track("assessment_abandoned", { answered: Object.keys(answers).length }); };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, [sessionId, started, report, answers]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const timerState = secondsLeft > 600 ? "normal" : secondsLeft > 300 ? "attention" : "urgent";

  if (report) return <ReportView report={report} />;
  if (processing) return <ProcessingView />;
  if (loading) return <Centered><Spinner text="Preparing LevelCheck…" /></Centered>;

  /* Auth gate when no session exists */
  if (paper.length === 0 && !started) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(160deg, #0f1535, #2a1a4a)", color: "white", textAlign: "center" }}>
      <div style={{ maxWidth: 640 }}>
        <LevelCheckMark />
        <p className="eyebrow" style={{ color: "var(--info)", marginTop: 14 }}>Adaptive English Placement Assessment</p>
        <h1 style={{ fontSize: 34, margin: "12px 0", letterSpacing: ".06em" }}>LEVELCHECK</h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, opacity: .88, maxWidth: 560, margin: "0 auto 26px" }}>
          LevelCheck adapts to you. As your answers demonstrate stronger English ability, the challenge increases.
          If questions become too difficult, the assessment adjusts to accurately identify your current level.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, maxWidth: 560, margin: "0 auto 28px" }}>
          {[
            { icon: "⏱️", label: "30-minute timer" },
            { icon: "🎚️", label: "Adaptive difficulty" },
            { icon: "🎧", label: "Listening" },
            { icon: "🗣️", label: "Speaking" },
            { icon: "❓", label: "Multiple choice" },
            { icon: "📄", label: "Personalised report" },
          ].map((m) => <div key={m.label} style={{ padding: "14px 10px", borderRadius: 12, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" }}><div style={{ fontSize: 24 }}>{m.icon}</div><div style={{ fontSize: 12.5, marginTop: 6, opacity: .85 }}>{m.label}</div></div>)}
        </div>
        {error && <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>}
        {error && <a className="button" href={`/auth?next=/diagnostic`}>Sign in to continue →</a>}
      </div>
    </main>
  );

  /* Start screen */
  if (!started && paper.length > 0) return (
    <Centered>
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
        <LevelCheckMark />
        <p className="eyebrow" style={{ color: "var(--accent-primary)", margin: "16px 0 6px", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 800, fontSize: 12.5 }}>Adaptive English Placement Assessment</p>
        <h1 style={{ fontSize: "clamp(30px,5vw,40px)", margin: "0 0 6px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: ".05em" }}>LEVELCHECK</h1>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--text-secondary)", maxWidth: 560, margin: "6px auto 20px" }}>
          You&rsquo;ll have <strong style={{ color: "var(--text-primary)" }}>30 minutes</strong>. Questions adapt to your demonstrated ability —
          you can navigate back and forward, flag questions, and change answers before finishing.
          {variantTheme ? <> This sitting&rsquo;s edition: <strong style={{ color: "var(--accent-primary)" }}>{variantTheme}</strong>.</> : ""}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 10, maxWidth: 560, margin: "0 auto 16px" }}>
          {[
            { icon: "⏱️", t: "30:00 maximum" },
            { icon: "🎚️", t: "Adaptive challenge" },
            { icon: "🎧", t: "Listening tasks" },
            { icon: "🗣️", t: "Speaking tasks" },
            { icon: "❓", t: "Multiple choice" },
            { icon: "📄", t: "Downloadable report" },
          ].map((c) => (
            <div key={c.t} style={{ padding: "13px 10px", borderRadius: 12, background: "#f4f0ff", border: "1px solid var(--border-default)", color: "var(--accent-text)" }}>
              <div style={{ fontSize: 21 }}>{c.icon}</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>{c.t}</div>
            </div>
          ))}
        </div>
        <p className="subtle" style={{ fontSize: 12.5, marginBottom: 20 }}>Estimated completion: ~25 minutes &middot; your progress is saved automatically</p>
        <button onClick={() => { setStarted(true); track("levelcheck_started"); }} className="button" style={{ padding: "16px 44px", fontSize: 16, background: "linear-gradient(135deg,#6840d6,#8b5cf6)", boxShadow: "0 10px 26px rgba(104,64,214,.35)", letterSpacing: ".03em" }}>Start LevelCheck →</button>
      </div>
    </Centered>
  );

  /* Assessment view */
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-muted)" }}>
      <header className="journey-header">
        <div className="journey-header-inner" style={{ maxWidth: 880 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <strong style={{ fontSize: 15 }}>English Wizard</strong>
            <span className="pill">LEVELCHECK</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {progress && <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 600 }}>{progress.objectiveAnswered + progress.speakingAnswered} / ~{progress.target} answered</span>}
            <TimerDisplay mm={mm} ss={ss} state={timerState} />
            <button onClick={() => setShowNav((s) => !s)} className="button secondary" style={{ padding: "7px 12px", fontSize: 13 }} aria-expanded={showNav}>{showNav ? "Hide navigator" : "Navigator"}</button>
            <ThemeToggle />
            <Link href="/" className="button secondary" style={{ padding: "7px 12px", fontSize: 13 }}>Exit</Link>
          </span>
        </div>
      </header>

      {showNav && <NavGrid paper={paper} answered={answeredCorrect} flags={flags} idx={idx} onGo={(i) => void goTo(i)} />}

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 24px", width: "100%", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, opacity: .6, fontWeight: 600 }}>Question {idx + 1}</span>
          {currentItem && <SkillChip skill={currentItem.skill} />}
          <AdaptiveBadge estimate={estimate} />
          {flags.includes(currentItem?.id ?? "") && <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "#fbbf2422", color: "var(--warning)", fontWeight: 700 }}>⚑ Flagged</span>}
        </div>

        {error && (
          <div role="alert" style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 10, background: "#fee2e2", color: "var(--danger)", fontSize: 13.5, border: "1px solid #fecaca" }}>
            <strong>Something went wrong:</strong> {error}
            <button onClick={() => setError(null)} style={{ marginLeft: 10, background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", textDecoration: "underline", fontSize: 12.5 }}>Dismiss</button>
          </div>
        )}

        {currentItem && (
          <QuestionBoundary key={currentItem.id}>
          <section className="panel" style={{ padding: 28, animation: "cardIn .25s ease" }}>
            {currentItem.type === "listening" && <ListeningPlayer item={currentItem} />}
            {currentItem.type === "speaking" && <SpeakingInterface item={currentItem} onDone={(t) => chooseOption(currentItem, t)} />}
            {currentItem.type !== "speaking" && (
              <>
                <h2 style={{ fontSize: 20, margin: "0 0 18px", lineHeight: 1.4, fontWeight: 700 }}>{currentItem.prompt}</h2>
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
            {answeredCorrect[currentItem.id] !== undefined && <p className="subtle" style={{ marginTop: 14, fontSize: 12.5 }}>✓ Answer saved — you can change it anytime; your level estimate recalculates automatically.</p>}
            {currentItem.type === "speaking" && <p className="subtle" style={{ marginTop: 10, fontSize: 12 }}>Recording is optional — typing your response also works.</p>}
          </section>
          </QuestionBoundary>
        )}

        {progress?.readyToFinalize && idx >= paper.length - 1 && (
          <div role="status" style={{ marginTop: 16, padding: "14px 18px", borderRadius: 12, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontSize: 13.5 }}>
            ✓ {progress.readyReason ?? "Sufficient evidence gathered"} You can finish now — or keep going to strengthen your result.
          </div>
        )}
      </div>

      <footer style={{ background: "white", borderTop: "1px solid #e8ebf2", padding: "12px 24px", position: "sticky", bottom: 0, marginTop: "auto" }}>
        <div className="lq-footer" style={{ maxWidth: 880, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <button onClick={toggleFlag} className="button secondary" style={{ fontSize: 13 }}>{flags.includes(currentItem?.id ?? "") ? "✓ Flagged" : "⚑ Flag for review"}</button>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => void goTo(idx - 1)} disabled={idx === 0} className="button secondary">← Previous</button>
            <button onClick={() => void goTo(idx + 1)} disabled={idx >= paper.length - 1 && progress?.readyToFinalize} className="button secondary">Next →</button>
            <button onClick={() => void finalize()} className="button" style={{ background: progress?.readyToFinalize ? "#10b981" : undefined }}>Finish &amp; Get Report ✓</button>
          </div>
        </div>
      </footer>
      <style>{`@keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@media (max-width:640px){.lq-footer{padding-bottom:46px}}`}</style>
    </main>
  );
}

/* ── Brand mark ── */
function LevelCheckMark() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#6840d6,#8b5cf6)", boxShadow: "0 12px 30px rgba(104,64,214,.35)", fontSize: 34 }} aria-hidden="true">🧙</div>
  );
}

/* ── Premium listening player (Part 12) ── */
function ListeningPlayer({ item }: { item: ExposedItem }) {
  const [playing, setPlaying] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [loading, setLoading] = useState(false);
  const [replays, setReplays] = useState(0);
  const [audioFailed, setAudioFailed] = useState(false);
  const [volume, setVolume] = useState(1);

  function play() {
    if (playing) { stopSpeaking(); setPlaying(false); return; }
    const text = item.audioText ?? item.prompt;
    if (!text) return;
    setLoading(true);
    setProgressPct(0);
    track("listening_started", { itemId: item.id });
    window.speechSynthesis.cancel();
    speakText(text, {
      lang: "en-GB",
      rate: 0.85,
      volume,
      onBoundary: (charIndex: number) => {
        setLoading(false);
        setPlaying(true);
        setProgressPct(Math.min(98, Math.round((charIndex / Math.max(1, text.length)) * 100)));
      },
      onEnd: () => {
        setPlaying(false);
        setLoading(false);
        setProgressPct(100);
        setReplays((r) => r + 1);
        track("listening_completed", { itemId: item.id });
      },
      onError: () => {
        // Audio failed (Part 35): offer a readable fallback instead of a dead control.
        setPlaying(false);
        setLoading(false);
        setAudioFailed(true);
      },
    });
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: "linear-gradient(135deg,#f4f0ff,#eef2ff)", border: "1px solid var(--border-default)", flexWrap: "wrap" }}>
        <button onClick={play} disabled={loading} style={{ width: 52, height: 52, borderRadius: "50%", border: 0, background: loading ? "#c3c9d6" : "#6840d6", color: "white", fontSize: 19, cursor: "pointer", flexShrink: 0 }} aria-label={playing ? "Pause audio" : "Play audio"} aria-busy={loading}>
          {loading ? "…" : playing ? "❚❚" : "▶"}
        </button>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <strong style={{ fontSize: 14 }}>🎧 Listening</strong>
            <span style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>Replays: {replays}/3</span>
          </div>
          <div style={{ height: 8, background: "#e2dcf5", borderRadius: 4, overflow: "hidden" }} role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Audio progress">
            <div style={{ width: `${progressPct}%`, height: "100%", background: "linear-gradient(90deg,#6840d6,#8b5cf6)", borderRadius: 4, transition: "width .3s linear" }} />
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
          🔊
          <input type="range" min={0.2} max={1} step={0.1} value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Volume" style={{ width: 72, accentColor: "#6840d6" }} />
        </label>
      </div>
      <div className="subtle" style={{ fontSize: 12.5, marginTop: 8 }}>Listen to the audio, then choose the best answer. You can replay it up to three times.</div>
      {audioFailed && (
        <div role="status" style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "var(--warning-soft)", border: "1px solid var(--warning-border)", color: "var(--warning)", fontSize: 13 }}>
          ⚠️ Audio isn&rsquo;t available on this device. Read the text below instead — this won&rsquo;t affect your result.
          <div style={{ marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 8, border: "1px solid var(--warning-border)", fontSize: 14, lineHeight: 1.6 }}>{item.audioText ?? item.prompt}</div>
        </div>
      )}
    </div>
  );
}

/* ── Speaking interface (Part 8) ── */
function SpeakingInterface({ item, onDone }: { item: ExposedItem; onDone: (t: string) => void }) {
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [sent, setSent] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const ref = useRef<{ stop: () => void } | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (recording) {
      tick.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } else if (tick.current) {
      clearInterval(tick.current);
      tick.current = null;
    }
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [recording]);

  function start() {
    if (typeof window === "undefined") return;
    const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) { setMicDenied(true); return; }
    const rec = new Ctor();
    rec.lang = RECOGNITION_LANG; rec.continuous = false; rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEventLike) => { const t = Array.from(e.results ?? []).map((r: SpeechRecognitionResultLike) => r[0]?.transcript ?? "").join(" ").trim(); if (t) setTranscript(t); };
    rec.onerror = (err: { error?: string }) => {
      setRecording(false);
      if (err?.error === "not-allowed" || err?.error === "service-not-allowed") setMicDenied(true);
      else setMicDenied((d) => d || !transcript);
    };
    rec.onend = () => setRecording(false);
    ref.current = rec; setRecording(true); setRecordSeconds(0);
    track("speaking_started", { itemId: item.id });
    try { rec.start(); } catch { setMicDenied(true); setRecording(false); }
  }
  function stop() { ref.current?.stop(); setRecording(false); track("speaking_completed", { itemId: item.id }); }

  return (
    <div>
      <h2 style={{ fontSize: 20, margin: "0 0 16px", lineHeight: 1.45, fontWeight: 700 }}>🗣️ {item.prompt}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={recording ? stop : start} style={{ width: 64, height: 64, borderRadius: "50%", border: recording ? "3px solid #dc2626" : "1px solid #dfe3ec", background: recording ? "#fee2e2" : "#f0ebff", cursor: "pointer", fontSize: 24, animation: recording ? "pulse 1.2s infinite" : "none" }} aria-label={recording ? "Stop recording" : "Start recording"} aria-pressed={recording}>🎙️</button>
        <div>
          <div style={{ fontWeight: 700 }}>{recording ? `Listening… ${recordSeconds}s` : recordSeconds > 0 ? `Recorded ${recordSeconds}s — speak again to re-record` : "Click to record"}</div>
          <div className="subtle" style={{ fontSize: 12.5 }}>Or type your response below.</div>
        </div>
      </div>
      {micDenied && (
        <div role="status" style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "var(--warning-soft)", border: "1px solid var(--warning-border)", color: "var(--warning)", fontSize: 13 }}>
          🎙️ Microphone isn&rsquo;t available. That&rsquo;s fine — <strong>type your spoken answer below</strong> instead; it carries the same weight in your assessment.
        </div>
      )}
      <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={4} placeholder="Your spoken response will appear here, or type it…" aria-label="Your spoken response" style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #dfe3ec", fontSize: 15, lineHeight: 1.6 }} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button onClick={() => { onDone(transcript); setSent(true); }} disabled={sent || !transcript.trim()} className="button" style={{ fontSize: 14 }}>{sent ? "✓ Submitted" : "Submit speaking response"}</button>
      </div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}`}</style>
    </div>
  );
}

/* ── Centered / Spinner / Timer / chips / boundary / navigator ── */
function Centered({ children }: { children: React.ReactNode }) {
  return <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>{children}</main>;
}

function Spinner({ text }: { text: string }) {
  return <div style={{ textAlign: "center" }}><div style={{ fontSize: 56, animation: "pulse 1.2s infinite" }}>🧙</div><p style={{ marginTop: 12, opacity: .7 }}>{text}</p><style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style></div>;
}

function TimerDisplay({ mm, ss, state }: { mm: string; ss: string; state: string }) {
  const color = state === "normal" ? "#475569" : state === "attention" ? "#b45309" : "#dc2626";
  const bg = state === "attention" ? "#fef3c7" : state === "urgent" ? "#fee2e2" : "#f1f5f9";
  return <div aria-live="off" style={{ display: "flex", alignItems: "center", gap: 6, background: bg, padding: "6px 12px", borderRadius: 10, color, fontWeight: 700, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>⏱️ {mm}:{ss}</div>;
}

function SkillChip({ skill }: { skill: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, padding: "3px 10px", borderRadius: 8, background: "#eef2ff", color: "var(--accent-text)", fontWeight: 600 }}>{SKILL_ICON[skill]} {SKILL_LABEL[skill]}</span>;
}

/**
 * Adaptive Challenge indicator (Part 11): a subtle 5-dot meter driven by the
 * session's live difficulty — never exposes the internal CEFR estimate itself.
 */
function AdaptiveBadge({ estimate }: { estimate: number | null }) {
  const dots = estimate === null ? 2 : Math.max(1, Math.min(5, Math.round((estimate / 6) * 4) + 1));
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--info)", fontWeight: 600 }} title="The challenge adapts to your demonstrated ability">
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0891b2" }} /> Adaptive Challenge
      <span aria-hidden="true" style={{ display: "inline-flex", gap: 2 }}>
        {[1, 2, 3, 4, 5].map((d) => <span key={d} style={{ width: 5, height: 5, borderRadius: "50%", background: d <= dots ? "#0891b2" : "#cbd5e1", transition: "background .4s" }} />)}
      </span>
    </span>
  );
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
    <div style={{ background: "white", borderBottom: "1px solid var(--border-subtle)", padding: "12px 24px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 148, overflowY: "auto" }}>
        {paper.map((item, i) => {
          const isAnswered = answered[item.id] !== undefined;
          const flagged = flags.includes(item.id);
          const isCurrent = i === idx;
          let bg = isCurrent ? "#6840d6" : isAnswered ? "#10b981" : "white";
          let color = isCurrent || isAnswered ? "white" : "#475569";
          if (item.type === "speaking") { bg = isCurrent ? "#6840d6" : "#a855f7"; color = "white"; }
          if (flagged && !isAnswered) { bg = "#fbbf24"; color = "white"; }
          return (
            <button key={item.id} onClick={() => onGo(i)} aria-label={`Question ${i + 1}: ${item.type === "speaking" ? "Speaking" : SKILL_LABEL[item.skill]}${isAnswered ? ", answered" : ", unanswered"}${flagged ? ", flagged" : ""}`} aria-current={isCurrent ? "step" : undefined} title={`Q${i + 1} ${item.type === "speaking" ? "Speaking" : SKILL_LABEL[item.skill]}`} style={{ width: 34, height: 34, borderRadius: 8, border: isCurrent ? "2px solid #6840d6" : (isAnswered ? "2px solid #10b981" : "2px solid #d1d5db"), background: bg, color, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {item.type === "listening" && !isAnswered ? "🎧" : i + 1}
            </button>
          );
        })}
      </div>
      <div style={{ maxWidth: 880, margin: "8px auto 0", display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11.5, opacity: .75 }}>
        <span><span style={{ color: "var(--success)", fontWeight: 700 }}>■</span> Answered</span>
        <span><span style={{ color: "var(--warning)", fontWeight: 700 }}>■</span> Flagged</span>
        <span><span style={{ color: "var(--accent-secondary)", fontWeight: 700 }}>■</span> Speaking</span>
        <span><span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>■</span> Current</span>
      </div>
    </div>
  );
}

/* ── Assessment Processing transition (Part 1) ── */
function ProcessingView() {
  const STAGES = ["Analysing your responses…", "Locating your ability boundary…", "Composing your personalised report…"];
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const a = setInterval(() => setStage((s) => Math.min(STAGES.length - 1, s + 1)), 620);
    return () => clearInterval(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #0f1535, #2a1a4a)", color: "white", textAlign: "center", padding: 24 }}>
      <div>
        <div style={{ fontSize: 56, marginBottom: 18, animation: "wizardFloat 2.2s ease-in-out infinite" }}>🧙</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: ".04em" }}>LEVELCHECK</h1>
        <p style={{ opacity: .85, marginTop: 10, fontSize: 15, minHeight: 24, transition: "opacity .3s" }}>{STAGES[stage]}</p>
        <div style={{ width: 240, height: 6, background: "rgba(255,255,255,.15)", borderRadius: 3, margin: "18px auto 0", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((stage + 1) / STAGES.length) * 100}%`, background: "linear-gradient(90deg,#6840d6,#8b5cf6)", borderRadius: 3, transition: "width .5s ease" }} />
        </div>
        <style>{`@keyframes wizardFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
      </div>
    </main>
  );
}

/* ── Report view (Parts 14-17) ── */
function ReportView({ report }: { report: Report }) {
  const router = useRouter();
  const skills = ["grammar", "vocabulary", "reading", "listening", "speaking"];
  const lvIdx = LEVELS.indexOf(report.level);
  const [journeyStep, setJourneyStep] = useState(0);
  const [barWidth, setBarWidth] = useState<Record<string, number>>({});

  useEffect(() => {
    track("levelquest_completed_viewed", { level: report.level, boundary: report.boundary ?? null });
    // Level journey animates from Pre-A1 toward the discovered level (Part 29).
    let s = 0;
    const t = setInterval(() => {
      s += 1;
      setJourneyStep(s);
      if (s >= lvIdx + 1) clearInterval(t);
    }, 260);
    // Skill visualization draws progressively (Part 29).
    const b = setTimeout(() => {
      const widths: Record<string, number> = {};
      for (const skill of skills) widths[skill] = report.skillScores[skill] ?? 0;
      setBarWidth(widths);
    }, 400);
    return () => { clearInterval(t); clearTimeout(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.level]);

  const dateLabel = report.assessmentDate
    ? new Date(report.assessmentDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-muted)", padding: "32px 16px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p className="eyebrow" style={{ margin: 6 }}>ENGLISH WIZARD · LEVELCHECK</p>
          <h1 style={{ fontSize: 26, margin: "4px 0" }}>Your Placement Report</h1>
          <p className="subtle">Adaptive English Placement Assessment · Version {report.variant} of 15{report.variantTheme ? ` · ${report.variantTheme}` : ""}</p>
          {/* Student identity block (Part 16) */}
          <div style={{ display: "flex", justifyContent: "center", gap: 22, flexWrap: "wrap", marginTop: 12, fontSize: 13 }}>
            <span><strong>{report.studentName ?? "Candidate"}</strong><span className="subtle" style={{ display: "block", fontSize: 11 }}>Student name</span></span>
            <span><strong style={{ fontVariantNumeric: "tabular-nums" }}>{report.studentId ?? "—"}</strong><span className="subtle" style={{ display: "block", fontSize: 11 }}>Student ID</span></span>
            <span><strong>{dateLabel}</strong><span className="subtle" style={{ display: "block", fontSize: 11 }}>Assessment date</span></span>
            {report.assessmentId && <span><strong style={{ fontSize: 12, fontFamily: "monospace" }}>{report.assessmentId.slice(0, 8).toUpperCase()}</strong><span className="subtle" style={{ display: "block", fontSize: 11 }}>Assessment ID</span></span>}
          </div>
        </div>

        {report.answeredCount === 0 ? (
          /* Part 26: a level with zero responses is never shown — evidence, not invention. */
          <div className="panel" style={{ padding: 28, textAlign: "center", borderRadius: 18, border: "1px solid var(--warning-border, var(--border-default))" }}>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: ".12em" }}>Assessment incomplete</div>
            <div style={{ fontSize: 34, fontWeight: 900, margin: "10px 0" }}>No placement result</div>
            <p className="subtle" style={{ maxWidth: 520, margin: "0 auto 18px", fontSize: 14 }}>
              This sitting closed before any answers were recorded, so there is no evidence to place you with.
              Your profile and history are untouched — retake the assessment when you are ready.
            </p>
            <Link className="button" href="/diagnostic" style={{ textDecoration: "none" }}>Retake assessment</Link>
          </div>
        ) : (
        <div className="panel" style={{ padding: 28, textAlign: "center", background: "linear-gradient(135deg, #0f1535, #2a1a4a)", color: "white", borderRadius: 18 }}>
          <div style={{ fontSize: 12.5, opacity: .7, textTransform: "uppercase", letterSpacing: ".12em" }}>Your English Level</div>
          <div style={{ fontSize: 80, fontWeight: 900, margin: "8px 0", lineHeight: 1 }}>{report.level}</div>
          <div style={{ fontSize: 18, marginBottom: 6 }}>{report.confidence} Confidence</div>
          {report.boundary && (
            <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 999, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.25)", fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>{report.boundary}</div>
          )}
          <p className="subtle" style={{ color: "var(--text-disabled)", maxWidth: 520, margin: "0 auto", fontSize: 13 }}>
            Adaptive estimate {report.estimate} · {report.answeredCount} responses analysed{report.speakingSubmitted ? ` · speaking: indicative ${report.speakingBand ?? "—"}` : ""}
          </p>
        </div>
        )}

        <div className="panel" style={{ padding: "30px 24px 24px", marginTop: 18 }}>
          <h3 style={{ margin: "0 0 20px" }}>Your journey</h3>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 4, paddingTop: 8 }}>
            {LEVELS.map((lv, i) => {
              const reached = i <= journeyStep - 1; const isCurrent = i === lvIdx && journeyStep > lvIdx;
              return (
                <div key={lv} style={{ display: "flex", flex: 1, alignItems: "center", flexDirection: "column", minWidth: 80, position: "relative" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: reached ? `${LEVEL_COLOR[lv]}22` : "#f1f5f9", border: `3px solid ${reached ? LEVEL_COLOR[lv] : "#e2e8f0"}`, color: reached ? LEVEL_COLOR[lv] : "#94a3b8", fontWeight: 800, fontSize: 11, transition: "all .35s ease", transform: isCurrent ? "scale(1.12)" : "scale(1)" }}>
                    {lv}
                  </div>
                  {isCurrent && <span style={{ position: "absolute", top: -22, fontSize: 10, whiteSpace: "nowrap", color: "white", background: LEVEL_COLOR[lv], padding: "2px 7px", borderRadius: 6, fontWeight: 700 }}>YOU ARE HERE</span>}
                  {i < LEVELS.length - 1 && <div style={{ position: "absolute", top: 21, left: "50%", width: "100%", height: 3, background: i < journeyStep - 1 ? LEVEL_COLOR[lv] : "#e2e8f0", zIndex: -1, transition: "background .4s" }} />}
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
              const lowEvidence = report.skillLowEvidence?.includes(skill);
              if (skill === "speaking") {
                const fb = report.speakingFeedback ? Object.values(report.speakingFeedback).find((e) => e.submitted) : null;
                return (
                  <div key={skill} style={{ display: "grid", gridTemplateColumns: "120px 42px 1fr 56px", gap: 12, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{SKILL_ICON[skill]} {SKILL_LABEL[skill]}</span>
                    <strong style={{ textAlign: "center", color: "var(--accent-secondary)", fontSize: 13 }}>{report.speakingSubmitted ? (report.speakingBand ?? "Submitted") : "—"}</strong>
                    <div className="subtle" style={{ fontSize: 12 }}>{fb ? fb.note : "Recorded & typed responses — reviewed in guided conversation."}</div>
                    <span style={{ fontSize: 12.5, opacity: .7, textAlign: "right" }}>{report.speakingSubmitted ? `${report.speakingResponses ?? 0} resp.` : "n/a"}</span>
                  </div>
                );
              }
              if (!attempted) {
                return (
                  <div key={skill} style={{ display: "grid", gridTemplateColumns: "120px 42px 1fr 56px", gap: 12, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{SKILL_ICON[skill]} {SKILL_LABEL[skill]}</span>
                    <strong style={{ textAlign: "center", color: "var(--text-disabled)", fontSize: 13 }}>—</strong>
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
                    <div style={{ width: `${barWidth[skill] ?? 0}%`, height: "100%", background: `linear-gradient(90deg, ${LEVEL_COLOR[lv]}, ${LEVEL_COLOR[lv]}88)`, borderRadius: 6, transition: "width .9s cubic-bezier(.22,1,.36,1)" }} />
                  </div>
                  <span style={{ fontSize: 12.5, opacity: .7, textAlign: "right" }}>{lowEvidence ? `${score}%*` : `${score}%`}</span>
                </div>
              );
            })}
          </div>
          {report.skillLowEvidence && report.skillLowEvidence.length > 0 && (
            <p className="subtle" style={{ fontSize: 11.5, margin: "12px 0 0" }}>* Based on limited questions in this sitting — the band may firm up as you practise.</p>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18, marginTop: 18 }}>
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
          <h3 style={{ margin: "0 0 8px" }}>🧭 Recommended starting point</h3>
          <p style={{ margin: "0 0 6px", lineHeight: 1.7 }}>Your English Wizard journey begins at <strong>{report.level}</strong>{report.speakingBand ? <> with speaking developing at <strong>{report.speakingBand}</strong></> : ""}. Your path is personalised to reinforce focus areas while building on your strengths.</p>
          <p style={{ margin: "0 0 14px", color: "var(--accent-primary)", fontWeight: 600, fontSize: 14.5 }}>Your level has been discovered. Now let&rsquo;s build your path.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => router.push("/dashboard")} className="button" style={{ padding: "14px 28px", fontSize: 15 }}>Continue to English Wizard →</button>
            <a href="/report" target="_blank" rel="noopener noreferrer" className="button secondary">📄 View My Report</a>
            <a href="/api/levelquest/report" className="button secondary">⬇️ Download Report (PDF)</a>
            <button onClick={() => window.print()} className="button secondary">🖨️ Print</button>
          </div>
        </div>
      </div>
    </main>
  );
}

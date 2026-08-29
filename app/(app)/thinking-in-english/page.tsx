"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CEFRLevel } from "@/src/domain/curriculum";
import { speakText, RECOGNITION_LANG } from "@/src/domain/tts";
import { PageHeader } from "@/app/components/page-header";
import { Celebration } from "@/app/components/celebration";

type PromptResponse = { thinkingInEnglish?: { level: CEFRLevel; stage: string; prompt: string; target: string }; adaptation?: { rationale: string; nextPrompt: string }; error?: string; upgrade?: unknown };

const levels: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

const STAGES = [
  { key: "label", label: "Label", icon: "🏷️", blurb: "Name what you see" },
  { key: "describe", label: "Describe", icon: "🖼️", blurb: "Paint the picture" },
  { key: "retell", label: "Retell", icon: "🔁", blurb: "Replay it in your words" },
  { key: "reason", label: "Reason", icon: "🧩", blurb: "Explain the why" },
  { key: "argue", label: "Argue", icon: "⚖️", blurb: "Take a side" },
  { key: "synthesise", label: "Synthesise", icon: "🧠", blurb: "Blend ideas into one thought" },
];

function stageIndex(stage: string): number {
  const i = STAGES.findIndex((s) => stage.toLowerCase().includes(s.key));
  return i >= 0 ? i : 0;
}

interface SpeechRecognitionLike {
  stop?: () => void;
  onend: (() => void) | null;
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  start: () => void;
}

export default function ThinkingInEnglishPage() {
  const router = useRouter();
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<PromptResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [thinkLeft, setThinkLeft] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  async function loadPrompt(nextLevel = level) {
    setBusy(true); setResult(null); setAnswer(""); setSaved(false); setThinkLeft(null);
    try {
      const response = await fetch("/api/teacher-help", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ level: nextLevel, skill: "speaking", askedForHelp: false }),
      });
      const payload = (await response.json()) as PromptResponse;
      setResult(response.ok ? payload : { error: payload.error ?? "Unable to load the prompt." });
      if (payload.upgrade) router.push("/pricing");
    } catch {
      setResult({ error: "Unable to load the prompt." });
    } finally { setBusy(false); }
  }

  useEffect(() => {
    const alive = { current: true };
    void Promise.resolve().then(async () => {
      let next: CEFRLevel | null = null;
      try {
        const savedLevel = localStorage.getItem("ew-think-level") as CEFRLevel | null;
        if (savedLevel && levels.includes(savedLevel)) next = savedLevel;
      } catch { /* private mode */ }
      if (!alive.current) return;
      if (next) setLevel(next);
      await loadPrompt(next ?? "A1");
    });
    return () => { alive.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startThinkTimer() {
    setThinkLeft(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setThinkLeft((v) => {
        if (v === null) return null;
        if (v <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  function dictate() {
    const ctor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!ctor) return;
    const recognition = new ctor();
    recognitionRef.current = recognition;
    recognition.lang = RECOGNITION_LANG;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const text = Array.from(event.results ?? []).map((item) => item[0]?.transcript ?? "").join(" ").trim();
      if (text) setAnswer((current) => (current ? `${current} ${text}` : text));
    };
    recognition.start();
    setListening(true);
    const originalOnEnd = () => setListening(false);
    recognition.onend = originalOnEnd;
  }

  const currentStageKey = result?.thinkingInEnglish?.stage ?? "label";
  const activeIdx = useMemo(() => stageIndex(currentStageKey), [currentStageKey]);
  const doneKey = `ew-think-done-${level}`;
  const [doneStages, setDoneStages] = useState<string[]>([]);
  useEffect(() => {
    let next: string[] = [];
    try { next = JSON.parse(localStorage.getItem(doneKey) ?? "[]") as string[]; } catch { next = []; }
    const id = window.setTimeout(() => setDoneStages(next), 0);
    return () => window.clearTimeout(id);
  }, [doneKey]);

  const words = answer.trim().split(/\s+/).filter(Boolean).length;

  async function submitReflection() {
    if (!result?.thinkingInEnglish || !answer.trim()) return;
    setBusy(true); setSaved(false);
    try {
      const response = await fetch("/api/evidence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionType: "QUICK_QUEST", missionId: "thinking-in-english",
          objectiveId: `thinking-in-english:${result.thinkingInEnglish.stage}`,
          capabilityIds: [`thinking-in-english:${result.thinkingInEnglish.target}`],
          modality: "WRITING", outcome: "PARTIAL", score: Math.min(90, words * 4), confidence: 0.6,
          level, context: "FAMILIAR", errorTags: [],
        }),
      });
      if (!response.ok) throw new Error("evidence-save-failed");
      setSaved(true);
      const nextDone = [...new Set([...doneStages, STAGES[activeIdx].key])];
      setDoneStages(nextDone);
      try { localStorage.setItem(doneKey, JSON.stringify(nextDone)); } catch { /* ignore */ }
      setResult((c) => c ? { ...c, adaptation: { rationale: "Recorded as real thinking evidence — no invented score.", nextPrompt: "Same idea, new context: retell it as if telling a friend yesterday's story." } } : c);
    } catch {
      setResult((c) => c ? { ...c, error: "Your answer could not be saved. Please retry." } : c);
    } finally { setBusy(false); }
  }

  const stageMeta = STAGES[activeIdx];

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Skip the translation step"
        title="Thinking in English"
        purpose="Climb the six-step mind ladder — from naming things to blending complex ideas, entirely in English."
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        {levels.map((x) => (
          <button key={x} className={x === level ? "button" : "button secondary"} onClick={() => { setLevel(x); try { localStorage.setItem("ew-think-level", x); } catch {} void loadPrompt(x); }}>{x}</button>
        ))}
      </div>

      <section aria-label="Mind ladder" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, marginBottom: 18 }}>
        {STAGES.map((s, i) => {
          const cls = i === activeIdx ? "mind-stage active" : doneStages.includes(s.key) ? "mind-stage done" : "mind-stage";
          return (
            <div key={s.key} className={`panel ${cls}`} style={{ margin: 0, padding: "12px 14px", minWidth: 128, textAlign: "center", borderRadius: 16 }}>
              <div style={{ fontSize: 24 }} aria-hidden="true">{s.icon}</div>
              <strong style={{ display: "block", fontSize: 14 }}>{s.label}</strong>
              <small className="subtle" style={{ fontSize: 11 }}>{i < activeIdx ? "✓ passed" : i === activeIdx ? "you are here" : s.blurb}</small>
            </div>
          );
        })}
      </section>

      {result?.error && <section className="panel"><strong>{result.error}</strong></section>}

      {busy && <div className="state-card">Preparing today&rsquo;s thinking challenge…</div>}

      {result?.thinkingInEnglish && (
        <>
          <section className="panel" style={{ padding: 26, background: "linear-gradient(135deg,#f6f2ff,#ffffff)", border: "1px solid #e4d9fb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 40 }} aria-hidden="true">{stageMeta.icon}</span>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>Step {activeIdx + 1} of 6 · {stageMeta.label}</p>
                <h2 style={{ margin: "4px 0 0", fontSize: 22, lineHeight: 1.45 }}>{result.thinkingInEnglish.prompt}</h2>
              </div>
            </div>
            <p style={{ marginTop: 12 }}><span className="streak-pill">Target: {result.thinkingInEnglish.target}</span></p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
              <button className="button secondary" onClick={() => speakText(result.thinkingInEnglish!.prompt, { lang: "en-GB", rate: 0.95 })}>🔊 Hear the prompt</button>
              {thinkLeft === null && <button className="button secondary" onClick={startThinkTimer}>🧠 30-second think timer</button>}
              <button className="button secondary" disabled={busy} onClick={() => void loadPrompt()}>🔄 New prompt</button>
            </div>
          </section>

          {thinkLeft !== null && thinkLeft > 0 && (
            <section className="panel" style={{ marginTop: 16, padding: 22, textAlign: "center" }}>
              <div className="think-ring" style={{ ["--pct" as string]: `${Math.round(((30 - thinkLeft) / 30) * 100)}%` }}>
                <span>{thinkLeft}s</span>
              </div>
              <p className="subtle" style={{ marginTop: 10 }}>Look away from words. Picture the answer in your head — English first.</p>
            </section>
          )}

          <section className="panel" style={{ marginTop: 16, padding: 22 }}>
            <label style={{ display: "grid", gap: 8 }}>
              <span><strong>Your English thoughts</strong> · {words} words {words >= 25 ? "🔥" : ""}</span>
              <textarea rows={7} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write or dictate your answer directly in English — no translating first." />
            </label>
            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              {!listening ? (
                <button className="button secondary" onClick={dictate}>🎙️ Dictate instead</button>
              ) : (
                <button className="button" style={{ background: "#ef4444" }} onClick={() => { if (recognitionRef.current?.stop) recognitionRef.current.stop(); setListening(false); }}>⏹ Stop mic</button>
              )}
              <button className="button" disabled={!answer.trim() || busy} onClick={() => void submitReflection()}>{busy ? "Saving…" : "Submit reflection →"}</button>
            </div>
            {listening && <p className="subtle" style={{ marginTop: 8 }}>Listening in British English…</p>}
            {saved && (
              <>
                <Celebration trigger={`saved-${words}`} />
                <div className="result-box" style={{ marginTop: 14 }}><strong>🧠 Banked.</strong> That thought is now permanent learning evidence — stage {stageMeta.label} cleared for {level}!</div>
              </>
            )}
            {result.adaptation && (
              <div className="result-box" style={{ marginTop: 14 }}>
                <strong>Next step:</strong> {result.adaptation.nextPrompt}
                <p className="subtle" style={{ margin: "6px 0 0" }}>{result.adaptation.rationale}</p>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

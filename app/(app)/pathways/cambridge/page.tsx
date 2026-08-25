"use client";

import { useCallback, useEffect, useState } from "react";
import { speakText, speechFriendly } from "@/src/domain/tts";
import { ExamTimer, clearExamTimer } from "@/app/components/exam-timer";

const QUALIFICATIONS = [
  { id: "A2_KEY", name: "A2 Key", cefr: "A2" },
  { id: "B1_PRELIMINARY", name: "B1 Preliminary", cefr: "B1" },
  { id: "B2_FIRST", name: "B2 First", cefr: "B2" },
  { id: "C1_ADVANCED", name: "C1 Advanced", cefr: "C1" },
  { id: "C2_PROFICIENCY", name: "C2 Proficiency", cefr: "C2" },
] as const;

const KINDS = [
  { id: "readiness-assessment", label: "Exam readiness check", icon: "🧪" },
  { id: "vocabulary-benchmark", label: "Vocabulary benchmark", icon: "📝" },
  { id: "grammar-benchmark", label: "Grammar & Use-of-English", icon: "🔧" },
  { id: "reading-benchmark", label: "Reading benchmark", icon: "📖" },
  { id: "listening-benchmark", label: "Listening benchmark", icon: "🎧" },
  { id: "writing-task", label: "Writing task", icon: "✍️" },
  { id: "speaking-card", label: "Speaking card", icon: "🗣️" },
] as const;

type BankItem = { id: string; kind: string; prompt: string; options?: string[]; answer: string; explain: string };
type Assessment = { qualification: { id: string; name: string; cefr: string; passNote: string }; kind: string; title: string; minutes: number; objectiveItems: BankItem[]; writingPrompt?: string; writingSample?: string; speakingCard?: string[]; script?: string };

export default function CambridgePage() {
  const [qualId, setQualId] = useState<string | null>(null);
  const [kind, setKind] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writingText, setWritingText] = useState("");
  const [result, setResult] = useState<{ percent: number; scaleEstimate: number; readiness: { verdict: string; advice: string }; feedback: string[]; disclaimer: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (qualId && kind) {
      setLoading(true);
      fetch(`/api/exams/cambridge?qualification=${qualId}&kind=${kind}`)
        .then(async (r) => { const data = await r.json(); setAssessment(data.assessment); setLoading(false); })
        .catch(() => { setError("Failed to load assessment."); setLoading(false); });
    }
  }, [qualId, kind]);

  async function submit() {
    if (!qualId || !kind) return;
    setLoading(true);
    try {
      const r = await fetch("/api/exams/cambridge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qualification: qualId, kind, answers, writingText }) });
      const data = await r.json();
      setResult(data);
    } catch { setError("Submission failed."); }
    setLoading(false);
  }

  const reset = () => { setAssessment(null); setResult(null); setAnswers({}); setWritingText(""); setKind(null); };

  if (!qualId) return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">Start Cambridge Preparation</p>
      <h1>Choose your Cambridge exam</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 24 }}>
        {QUALIFICATIONS.map((q) => <button key={q.id} onClick={() => setQualId(q.id)} className="button secondary" style={{ padding: 20, textAlign: "left" }}><strong>{q.name}</strong><br /><span className="subtle">Level: {q.cefr}</span></button>)}
      </div>
    </main>
  );

  if (!kind) return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">Cambridge preparation</p>
      <h1>{QUALIFICATIONS.find((q) => q.id === qualId)?.name}</h1>
      <p className="subtle">Choose where to begin — the readiness assessment is the recommended start.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 18 }}>
        {KINDS.map((k) => <button key={k.id} onClick={() => setKind(k.id)} className="button secondary" style={{ padding: 16, textAlign: "left" }}>{k.icon} {k.label}</button>)}
      </div>
      <button className="button secondary" style={{ marginTop: 18 }} onClick={() => setQualId(null)}>← Back</button>
    </main>
  );

  if (result) return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">Cambridge results</p>
      <h1>{result.readiness.verdict}</h1>
      <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
        <div className="panel" style={{ padding: 20 }}><p style={{ margin: 0 }}>Internal scale estimate: <strong>{result.scaleEstimate}</strong></p><p className="subtle">Score: {result.percent}%</p></div>
        <div className="panel" style={{ padding: 20 }}><h3 style={{ margin: "0 0 8px" }}>Advice</h3><p style={{ margin: 0 }}>{result.readiness.advice}</p></div>
        {result.feedback.length > 0 && <div className="panel" style={{ padding: 20 }}><h3 style={{ margin: "0 0 8px" }}>Incorrect answers</h3><ul style={{ margin: 0, paddingLeft: 20 }}>{result.feedback.slice(0, 8).map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
        <p className="subtle" style={{ fontSize: 12 }}>{result.disclaimer}</p>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="button" onClick={reset}>Try another assessment</button>
        <button className="button secondary" onClick={() => { reset(); setQualId(null); }}>← Back to qualifications</button>
      </div>
    </main>
  );

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div><p className="eyebrow">Cambridge</p><h1 style={{ margin: 0 }}>{assessment?.title ?? "Loading…"}</h1></div>
        {assessment && <ExamTimer durationMinutes={assessment.minutes} attemptKey={`cambridge-${qualId}-${kind}`} onTimeUp={() => void submit()} />}
      </div>
      {assessment && <>
        {assessment.script && <details style={{ marginBottom: 16 }}><summary style={{ cursor: "pointer", fontWeight: 700 }}>Listening script</summary><pre style={{ whiteSpace: "pre-wrap", fontSize: 13.5, marginTop: 8 }}>{assessment.script}</pre></details>}
        {assessment.writingPrompt && <div className="panel" style={{ padding: 20, marginBottom: 16 }}><h3 style={{ margin: "0 0 8px" }}>Writing task</h3><p style={{ margin: "0 0 8px" }}>{assessment.writingPrompt}</p><textarea value={writingText} onChange={(e) => setWritingText(e.target.value)} rows={10} placeholder="Write here…" style={{ width: "100%", fontSize: 14, lineHeight: 1.6 }} /><p className="subtle">Words: {writingText.trim().split(/\s+/).filter(Boolean).length}</p></div>}
        {assessment.speakingCard && <div className="panel" style={{ padding: 20, marginBottom: 16 }}><h3 style={{ margin: "0 0 8px" }}>Speaking prompt</h3><ul style={{ paddingLeft: 20 }}>{assessment.speakingCard.map((p, i) => <li key={i}>{p}</li>)}</ul><button className="button secondary" onClick={() => speakText(speechFriendly(assessment.speakingCard?.[0] ?? ""), { lang: "en-GB", gender: "female" })}>Listen to prompt</button></div>}
        {assessment.objectiveItems.length > 0 && <div className="panel" style={{ padding: 20, marginBottom: 16 }}><div style={{ display: "grid", gap: 14 }}>{assessment.objectiveItems.map((item) => <div key={item.id}><p style={{ margin: "0 0 6px", fontWeight: 600 }}>{item.prompt}</p>
          {item.kind === "mcq" && item.options && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{item.options.map((opt) => <button key={opt} onClick={() => setAnswers((a) => ({ ...a, [item.id]: opt }))} className={`button secondary${answers[item.id] === opt ? " selected" : ""}`} style={{ padding: "8px 14px" }}>{opt}</button>)}</div>}
          {item.kind === "gap" && <input value={answers[item.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [item.id]: e.target.value }))} placeholder="Type your answer…" style={{ padding: "8px 12px" }} />}
        </div>)}</div></div>}
      </>}
      {error && <p role="alert" style={{ color: "#a53b3b" }}>{error}</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button className="button" onClick={() => void submit()} disabled={loading}>{loading ? "Submitting…" : "Submit"}</button>
        <button className="button secondary" onClick={reset}>← Back</button>
      </div>
    </main>
  );
}

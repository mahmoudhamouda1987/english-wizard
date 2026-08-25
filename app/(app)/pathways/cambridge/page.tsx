"use client";

import { useEffect, useState } from "react";
import { speakText, speechFriendly } from "@/src/domain/tts";
import { ExamTimer, clearExamTimer } from "@/app/components/exam-timer";

const QUALIFICATIONS = [
  { id: "A2_KEY", name: "A2 Key", cefr: "A2", color: "#34d399", icon: "🟢", desc: "Elementary level — basic everyday English." },
  { id: "B1_PRELIMINARY", name: "B1 Preliminary", cefr: "B1", color: "#fbbf24", icon: "🟡", desc: "Intermediate — work, study and travel contexts." },
  { id: "B2_FIRST", name: "B2 First", cefr: "B2", color: "#fb923c", icon: "🟠", desc: "Upper-intermediate — confident, effective communication." },
  { id: "C1_ADVANCED", name: "C1 Advanced", cefr: "C1", color: "#f87171", icon: "🔴", desc: "Advanced — complex, demanding professional situations." },
  { id: "C2_PROFICIENCY", name: "C2 Proficiency", cefr: "C2", color: "#a855f7", icon: "🟣", desc: "Mastery — near-native fluency and precision." },
] as const;

const KINDS = [
  { id: "readiness-assessment", label: "Exam readiness check", icon: "🧪", desc: "Full diagnostic across all skills." },
  { id: "vocabulary-benchmark", label: "Vocabulary benchmark", icon: "📝", desc: "Test your word knowledge at this level." },
  { id: "grammar-benchmark", label: "Grammar & Use of English", icon: "🔧", desc: "Sentence structure and accuracy." },
  { id: "reading-benchmark", label: "Reading benchmark", icon: "📖", desc: "Comprehension and inference skills." },
  { id: "listening-benchmark", label: "Listening benchmark", icon: "🎧", desc: "Audio understanding and note-taking." },
  { id: "writing-task", label: "Writing task", icon: "✍️", desc: "Structured writing with timed conditions." },
  { id: "speaking-card", label: "Speaking card", icon: "🗣️", desc: "Part 2 long turn with cue card." },
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
      setError("");
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
  const qual = QUALIFICATIONS.find((q) => q.id === qualId);

  if (!qualId) return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span style={{ fontSize: 48 }}>🎓</span>
        <p className="eyebrow" style={{ marginTop: 8 }}>Cambridge Preparation</p>
        <h1 style={{ fontSize: 28, margin: "8px 0" }}>Choose your Cambridge exam</h1>
        <p className="subtle" style={{ maxWidth: 500, margin: "0 auto" }}>Five qualifications from A2 to C2. Each builds real exam skills with practice assessments, benchmarks, and timed tasks.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {QUALIFICATIONS.map((q) => (
          <button key={q.id} onClick={() => setQualId(q.id)} className="button secondary" style={{ padding: 0, textAlign: "left", borderRadius: 14, overflow: "hidden", border: `2px solid ${q.color}22` }}>
            <div style={{ background: `linear-gradient(135deg, ${q.color}22, ${q.color}08)`, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{q.icon}</span>
                <div>
                  <strong style={{ fontSize: 17 }}>{q.name}</strong>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>Level: {q.cefr}</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, opacity: 0.85 }}>{q.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </main>
  );

  if (!kind) return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <span style={{ fontSize: 40 }}>{qual?.icon}</span>
        <p className="eyebrow" style={{ marginTop: 6 }}>Cambridge preparation</p>
        <h1 style={{ fontSize: 26, margin: "6px 0" }}>{qual?.name}</h1>
        <p className="subtle" style={{ maxWidth: 480, margin: "0 auto" }}>Choose where to begin — the readiness assessment is the recommended starting point.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {KINDS.map((k, i) => (
          <button key={k.id} onClick={() => setKind(k.id)} className="button secondary" style={{ padding: 0, textAlign: "left", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 18px" }}>
              <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{k.icon}</span>
              <div>
                <strong style={{ fontSize: 14.5 }}>{k.label}</strong>
                <p style={{ margin: "3px 0 0", fontSize: 12.5, opacity: 0.7, lineHeight: 1.4 }}>{k.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button className="button secondary" style={{ marginTop: 20 }} onClick={() => setQualId(null)}>← Back to qualifications</button>
    </main>
  );

  if (result) return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 48 }}>{qual?.icon}</span>
        <p className="eyebrow" style={{ marginTop: 6 }}>Cambridge results</p>
        <h1 style={{ fontSize: 26, margin: "6px 0" }}>{result.readiness.verdict}</h1>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <div className="panel" style={{ padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: 42, fontWeight: 700, color: qual?.color }}>{result.scaleEstimate}</div>
          <p className="subtle" style={{ margin: "4px 0 0" }}>Internal scale estimate · Score: {result.percent}%</p>
        </div>
        <div className="panel" style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 8px" }}>📋 Advice</h3>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{result.readiness.advice}</p>
        </div>
        {result.feedback.length > 0 && (
          <div className="panel" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 8px" }}>❌ Incorrect answers</h3>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>{result.feedback.slice(0, 8).map((f, i) => <li key={i}>{f}</li>)}</ul>
          </div>
        )}
        <p className="subtle" style={{ fontSize: 12, textAlign: "center" }}>{result.disclaimer}</p>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center" }}>
        <button className="button" onClick={reset}>Try another assessment</button>
        <button className="button secondary" onClick={() => { reset(); setQualId(null); }}>← All qualifications</button>
      </div>
    </main>
  );

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <p className="eyebrow">{qual?.icon} Cambridge · {qual?.name}</p>
          <h1 style={{ margin: 0, fontSize: 24 }}>{assessment?.title ?? "Loading…"}</h1>
        </div>
        {assessment && <ExamTimer durationMinutes={assessment.minutes} attemptKey={`cambridge-${qualId}-${kind}`} onTimeUp={() => void submit()} />}
      </div>
      {assessment && <>
        {assessment.script && <details style={{ marginBottom: 16 }}><summary style={{ cursor: "pointer", fontWeight: 700, padding: "8px 0" }}>🎧 Listening script</summary><pre style={{ whiteSpace: "pre-wrap", fontSize: 13.5, marginTop: 8, lineHeight: 1.65 }}>{assessment.script}</pre></details>}
        {assessment.writingPrompt && (
          <div className="panel" style={{ padding: 22, marginBottom: 16, borderLeft: "4px solid #fb923c" }}>
            <h3 style={{ margin: "0 0 10px" }}>✍️ Writing task</h3>
            <p style={{ margin: "0 0 12px", lineHeight: 1.6 }}>{assessment.writingPrompt}</p>
            <textarea value={writingText} onChange={(e) => setWritingText(e.target.value)} rows={10} placeholder="Write your response here…" style={{ width: "100%", fontSize: 14, lineHeight: 1.6, borderRadius: 8, border: "1px solid #d0daf0", padding: 12 }} />
            <p className="subtle" style={{ margin: "6px 0 0", fontSize: 12 }}>Words: {writingText.trim().split(/\s+/).filter(Boolean).length}</p>
          </div>
        )}
        {assessment.speakingCard && (
          <div className="panel" style={{ padding: 22, marginBottom: 16, borderLeft: "4px solid #a855f7" }}>
            <h3 style={{ margin: "0 0 10px" }}>🗣️ Speaking prompt</h3>
            <ul style={{ paddingLeft: 20, lineHeight: 1.7, margin: "0 0 14px" }}>{assessment.speakingCard.map((p, i) => <li key={i}>{p}</li>)}</ul>
            <button className="button secondary" onClick={() => speakText(speechFriendly(assessment.speakingCard?.[0] ?? ""), { lang: "en-GB", gender: "female" })}>🔊 Listen to prompt</button>
          </div>
        )}
        {assessment.objectiveItems.length > 0 && (
          <div className="panel" style={{ padding: 22, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 14px" }}>📝 Questions ({assessment.objectiveItems.length})</h3>
            <div style={{ display: "grid", gap: 16 }}>
              {assessment.objectiveItems.map((item, idx) => (
                <div key={item.id} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: "0 0 8px", fontWeight: 600, fontSize: 14.5 }}>{idx + 1}. {item.prompt}</p>
                  {item.kind === "mcq" && item.options && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{item.options.map((opt) => <button key={opt} onClick={() => setAnswers((a) => ({ ...a, [item.id]: opt }))} className={`button secondary${answers[item.id] === opt ? " selected" : ""}`} style={{ padding: "8px 16px", fontSize: 13.5 }}>{opt}</button>)}</div>}
                  {item.kind === "gap" && <input value={answers[item.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [item.id]: e.target.value }))} placeholder="Type your answer…" style={{ padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1px solid #d0daf0", width: "100%" }} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </>}
      {error && <p role="alert" style={{ color: "#a53b3b", padding: "10px 16px", background: "#fef2f2", borderRadius: 8 }}>{error}</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="button" onClick={() => void submit()} disabled={loading}>{loading ? "Submitting…" : "Submit answers"}</button>
        <button className="button secondary" onClick={reset}>← Back</button>
      </div>
    </main>
  );
}

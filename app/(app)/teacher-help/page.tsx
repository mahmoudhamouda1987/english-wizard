"use client";

import { useEffect, useState } from "react";
import type { CEFRLevel, Skill } from "@/src/domain/learner";

const levels: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
const skills: Skill[] = ["reading", "listening", "writing", "speaking", "grammar", "vocabulary", "pronunciation", "mediation"];
const modes = [
  ["simpler_words", "Simpler words"],
  ["different_example", "Different example"],
  ["step_by_step", "Step by step"],
  ["visual", "Visual idea"],
  ["arabic_support", "Arabic support"],
  ["real_life_example", "Real-life example"],
  ["compare_forms", "Compare forms"],
] as const;

type Response = { adaptation?: { move: string; rationale: string; nextPrompt: string }; help?: string; thinkingInEnglish?: { stage: string; prompt: string; target: string }; error?: string };
type Memory = { summaryLines: string[]; memory: { level: string | null; journeyDays: number; completedLessons: number; recurringErrors: Array<{ skill: string; occurrences: number; severity: string; status: string }>; focusSkill: { skill: string; score: number } | null; strongSkill: { skill: string; score: number } | null } };

export default function TeacherHelpPage() {
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const [skill, setSkill] = useState<Skill>("grammar");
  const [mode, setMode] = useState<(typeof modes)[number][0]>("different_example");
  const [target, setTarget] = useState("I don't understand this grammar rule.");
  const [response, setResponse] = useState<Response | null>(null);
  const [busy, setBusy] = useState(false);
  const [memory, setMemory] = useState<Memory | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => data.profile?.targetLevel && setLevel(data.profile.targetLevel))
      .catch(() => undefined);
    fetch("/api/teacher-help/memory", { cache: "no-store" })
      .then(async (r) => { const p = await r.json(); if (r.ok) setMemory(p); })
      .catch(() => undefined);
  }, []);

  async function askForHelp() {
    setBusy(true);
    setResponse(null);
    try {
      const result = await fetch("/api/teacher-help", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ level, skill, mode, target, askedForHelp: true }),
      });
      const payload = (await result.json()) as Response;
      setResponse(result.ok ? payload : { error: payload.error ?? "Unable to get help." });
    } catch {
      setResponse({ error: "Unable to reach the teacher right now." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="conversation-shell">
      <header className="conversation-header">
        <div>
          <p className="eyebrow">The Wizard helps differently</p>
          <h1>I Don&rsquo;t Understand</h1>
          <p className="subtle">Tell the Wizard what confused you. It chooses a support move and a new explanation mode instead of simply repeating the same lesson.</p>
        </div>
      </header>

      {memory && (
        <section className="panel" style={{ marginTop: 16, borderLeft: "4px solid #a855f7" }}>
          <p className="eyebrow">🧠 What your tutor remembers about you</p>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.9 }}>
            {memory.summaryLines.map((line) => <li key={line}>{line}</li>)}
            {memory.memory.completedLessons > 0 && <li>{memory.memory.completedLessons} lesson{memory.memory.completedLessons === 1 ? "" : "s"} completed — I build on exactly what you have already proven.</li>}
          </ul>
          {memory.memory.recurringErrors.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {memory.memory.recurringErrors.map((e) => (
                <span key={e.skill + e.occurrences} className="streak-pill" title={`Severity ${e.severity} · status ${e.status}`}>{e.skill} ×{e.occurrences}</span>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="panel" style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>Level<select value={level} onChange={(e) => setLevel(e.target.value as CEFRLevel)}>{levels.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Skill<select value={skill} onChange={(e) => setSkill(e.target.value as Skill)}>{skills.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <label>What do you need help with?<textarea rows={5} value={target} onChange={(e) => setTarget(e.target.value)} /></label>
        <div>
          <p className="eyebrow">Explain it differently</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{modes.map(([value, label]) => <button key={value} type="button" className={mode === value ? "button" : "button secondary"} onClick={() => setMode(value)}>{label}</button>)}</div>
        </div>
        <button type="button" className="button" onClick={askForHelp} disabled={busy || target.trim().length < 3}>{busy ? "The Wizard is thinking…" : "Help me understand"}</button>
      </section>

      {response?.error && <section className="panel"><strong>{response.error}</strong></section>}
      {response?.adaptation && (
        <section className="panel" style={{ marginTop: 16 }}>
          <p className="eyebrow">Teacher decision</p>
          <h2>{response.adaptation.move.replaceAll("_", " ")}</h2>
          <p><strong>Why:</strong> {response.adaptation.rationale}</p>
          {response.help && <p><strong>New explanation:</strong> {response.help}</p>}
          <p><strong>Next prompt:</strong> {response.adaptation.nextPrompt}</p>
        </section>
      )}
    </main>
  );
}

"use client";

import { useState } from "react";

type WritingFeedback = {
  score?: number;
  correctedAnswer?: string;
  strengths?: string;
  errors?: Array<{ text: string; explanation: string }>;
  error?: string;
};

export default function PracticePage() {
  const [message, setMessage] = useState("");
  const [writing, setWriting] = useState("");
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(correct: boolean) {
    setBusy(true);
    const r = await fetch("/api/practice/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ skill: "grammar", objectiveId: "a1-present-simple-routines", correct }),
    });
    const p = await r.json();
    setMessage(p.feedback ?? p.error ?? "Saved");
    setBusy(false);
  }

  async function reviewWriting() {
    setBusy(true);
    setFeedback(null);
    try {
      const r = await fetch("/api/ai/writing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          level: "B1",
          prompt: "Write a short message to a colleague explaining your plan for tomorrow.",
          answer: writing,
        }),
      });
      const p = await r.json();
      setFeedback(p.feedback ?? { error: p.error });
    } catch {
      setFeedback({ error: "Unable to reach the writing coach." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">Practice</p>
      <h1>Practice → evidence → feedback</h1>

      <section className="panel">
        <p style={{ fontSize: 22 }}>Choose the correct sentence:</p>
        <div style={{ display: "grid", gap: 10 }}>
          <button onClick={() => submit(true)}>I work in an office.</button>
          <button onClick={() => submit(false)}>I works in an office.</button>
        </div>
        {message && <p style={{ marginTop: 18, fontWeight: 700 }}>{busy ? "Saving evidence…" : message}</p>}
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <p className="eyebrow">Writing Coach</p>
        <h2>Write a short workplace message</h2>
        <p className="subtle">Explain your plan for tomorrow in 3–5 sentences.</p>
        <textarea value={writing} onChange={(e) => setWriting(e.target.value)} rows={7} style={{ width: "100%", padding: 14 }} placeholder="Tomorrow I plan to…" />
        <button className="button" disabled={busy || writing.trim().length < 10} onClick={reviewWriting} style={{ marginTop: 12 }}>Get AI feedback</button>
        {feedback && (
          <div className="state-card" style={{ marginTop: 16 }}>
            <strong>Score: {feedback.score ?? "—"}</strong>
            {feedback.correctedAnswer && <p><strong>Better version:</strong> {feedback.correctedAnswer}</p>}
            {feedback.strengths && <p><strong>Strengths:</strong> {feedback.strengths}</p>}
            {Array.isArray(feedback.errors) && feedback.errors.map((e, i) => <p key={i}><strong>{e.text}:</strong> {e.explanation}</p>)}
          </div>
        )}
      </section>
    </main>
  );
}

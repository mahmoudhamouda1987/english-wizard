"use client";

import { useEffect, useState } from "react";
import type { CEFRLevel } from "@/src/domain/learner";

type Activity = {
  id: string; level: CEFRLevel; mode: string; sourceType: string; sourceText: string;
  learnerRole: string; targetAudience: string; goal: string; constraints: string[];
  successCriteria: string[]; transferPrompt: string;
};
type Result = { assessment?: { score: number; nextStep: string; evidenceNotes: string[] }; error?: string };

const levels: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

export default function MediationPage() {
  const [level, setLevel] = useState<CEFRLevel>("A2");
  const [activity, setActivity] = useState<Activity | null>(null);
  const [response, setResponse] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  async function load(nextLevel = level) {
    setBusy(true); setResult(null); setResponse("");
    try {
      const res = await fetch(`/api/mediation?level=${encodeURIComponent(nextLevel)}`);
      const body = await res.json() as { activities?: Activity[]; error?: string };
      setActivity(body.activities?.[body.activities.length ? Math.floor(Math.random() * body.activities.length) : 0] ?? null);
      if (body.error) setResult({ error: body.error });
    } catch { setResult({ error: "Unable to load mediation activity." }); }
    finally { setBusy(false); }
  }

  async function submit() {
    if (!activity || !response.trim()) return;
    setBusy(true); setResult(null);
    try {
      const res = await fetch("/api/mediation", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ activityId: activity.id, response }) });
      setResult(await res.json() as Result);
    } catch { setResult({ error: "Unable to assess mediation attempt." }); }
    finally { setBusy(false); }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBusy(true); setResult(null); setResponse("");
      try {
        const res = await fetch(`/api/mediation?level=A2`);
        const body = await res.json() as { activities?: Activity[]; error?: string };
        if (cancelled) return;
        setActivity(body.activities?.[body.activities.length ? Math.floor(Math.random() * body.activities.length) : 0] ?? null);
        if (body.error) setResult({ error: body.error });
      } catch { if (!cancelled) setResult({ error: "Unable to load mediation activity." }); }
      finally { if (!cancelled) setBusy(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="conversation-shell">
      <header className="conversation-header">
        <div><p className="eyebrow">Mediation Lab</p><h1>Carry meaning from one person, text or situation to another</h1><p className="subtle">Summarise, explain, relay and facilitate without simply copying the source.</p></div>
        <label className="level-picker">Level<select value={level} onChange={(e) => { const value = e.target.value as CEFRLevel; setLevel(value); void load(value); }}>{levels.map((item) => <option key={item}>{item}</option>)}</select></label>
      </header>
      {activity && <>
        <section className="panel"><p className="eyebrow">{activity.level} · {activity.mode}</p><h2>Source</h2><p>{activity.sourceText}</p><p><strong>Your role:</strong> {activity.learnerRole}</p><p><strong>Audience:</strong> {activity.targetAudience}</p><p><strong>Goal:</strong> {activity.goal}</p><ul>{activity.constraints.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="panel" style={{ marginTop: 16 }}><label>Your mediation response<textarea rows={9} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Explain, relay or synthesise the information for the target audience…" /></label><div style={{ display: "flex", gap: 10, marginTop: 12 }}><button className="button" disabled={!response.trim() || busy} onClick={() => void submit()}>{busy ? "Assessing…" : "Submit mediation"}</button><button className="button secondary" disabled={busy} onClick={() => void load()}>{busy ? "Loading…" : "New activity"}</button></div></section>
      </>}
      {result?.assessment && <section className="panel" style={{ marginTop: 16 }}><p className="eyebrow">Evidence-backed result</p><h2>{result.assessment.score}/100 · {result.assessment.nextStep}</h2><ul>{result.assessment.evidenceNotes.map((note) => <li key={note}>{note}</li>)}</ul><p><strong>Transfer:</strong> {activity?.transferPrompt}</p></section>}
      {result?.error && <section className="panel" style={{ marginTop: 16 }}><strong>{result.error}</strong></section>}
    </main>
  );
}

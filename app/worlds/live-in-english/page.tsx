"use client";

import { useEffect, useState } from "react";
import { C2_ENDGAME_STAGES, type C2EndgameState } from "@/src/domain/c2-endgame";
import type { EvidenceModality } from "@/src/domain/learning-evidence";

const MODALITIES: EvidenceModality[] = ["READING", "LISTENING", "SPEAKING", "WRITING", "MEDIATION"];

export default function LiveInEnglishPage() {
  const [state, setState] = useState<C2EndgameState | null>(null);
  const [response, setResponse] = useState("");
  const [modality, setModality] = useState<EvidenceModality>("WRITING");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetch("/api/c2-endgame", { cache: "no-store" });
        const payload = await result.json();
        if (!result.ok) throw new Error(payload.error ?? "Unable to load the C2 endgame.");
        if (!cancelled) setState(payload.state);
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Unable to load the C2 endgame.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submitStage() {
    if (!state) return;
    setSaving(true);
    setError("");
    try {
      const result = await fetch("/api/c2-endgame", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ response, modality }),
      });
      const payload = await result.json();
      if (!result.ok) throw new Error(payload.error ?? "Unable to submit the stage.");
      setState(payload.state);
      setResponse("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit the stage.");
    } finally {
      setSaving(false);
    }
  }

  const stage = state ? C2_ENDGAME_STAGES[state.stageIndex] : null;
  const complete = !!state && state.stageIndex >= C2_ENDGAME_STAGES.length;

  return (
    <main className="conversation-shell">
      <header className="conversation-header">
        <p className="eyebrow">C2 · Boss Mission</p>
        <h1>Live in English</h1>
        <p className="subtle">A simulated day in English. Your responses are persisted so the endgame survives refreshes and sessions.</p>
      </header>

      <section className="panel">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 20 }}>
          {C2_ENDGAME_STAGES.map((item, index) => (
            <div key={item.id} style={{ height: 6, borderRadius: 99, background: state && index < state.stageIndex ? "var(--text)" : "var(--border)" }} aria-label={`${item.title}: ${state && index < state.stageIndex ? "complete" : "upcoming"}`} />
          ))}
        </div>

        {!state ? <p>Loading your endgame...</p> : complete ? (
          <>
            <p className="eyebrow">Endgame complete</p>
            <h2>You completed the six-stage day.</h2>
            <p>Your stage responses are stored as endgame evidence. Completion here does not by itself certify C2 mastery.</p>
          </>
        ) : stage ? (
          <>
            <p className="eyebrow">Stage {state.stageIndex + 1} of {C2_ENDGAME_STAGES.length}</p>
            <h2>{stage.title}</h2>
            <p>{stage.scenario}</p>
            <p><strong>Skills:</strong> {stage.requiredSkills.join(" · ")}</p>
            <div style={{ display: "grid", gap: 8, margin: "18px 0" }}>
              {stage.successCriteria.map((criterion) => <div key={criterion} style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 10 }}>{criterion.replaceAll("-", " ")}</div>)}
            </div>
            <label htmlFor="c2-response"><strong>Your response</strong></label>
            <textarea id="c2-response" value={response} onChange={(event) => setResponse(event.target.value)} minLength={20} rows={8} placeholder="Respond as you would in the situation. Aim for precise, natural C2 English." style={{ width: "100%", marginTop: 8, padding: 12, borderRadius: 10, border: "1px solid var(--border)" }} />
            <label htmlFor="c2-modality" style={{ display: "block", marginTop: 12 }}><strong>Primary modality</strong></label>
            <select id="c2-modality" value={modality} onChange={(event) => setModality(event.target.value as EvidenceModality)} style={{ marginTop: 8, padding: 10, borderRadius: 10 }}>
              {MODALITIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <div style={{ marginTop: 16 }}>
              <button className="button" type="button" onClick={submitStage} disabled={saving || response.trim().length < 20}>{saving ? "Saving..." : "Submit stage response"}</button>
            </div>
          </>
        ) : null}
      </section>

      {error && <section className="panel" style={{ marginTop: 16 }} role="alert"><p>{error}</p></section>}
      {state && !complete && <section className="panel" style={{ marginTop: 16 }}><p className="eyebrow">Persisted progress</p><p>{state.completedStageIds.length} of {C2_ENDGAME_STAGES.length} stages submitted.</p></section>}
    </main>
  );
}

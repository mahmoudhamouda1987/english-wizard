"use client";

import { useEffect, useState } from "react";
import type { CEFRLevel } from "@/src/domain/curriculum";

type PromptResponse = { thinkingInEnglish?: { level: CEFRLevel; stage: string; prompt: string; target: string }; adaptation?: { rationale: string; nextPrompt: string }; error?: string };

const levels: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
const learningLevels: Record<CEFRLevel, string> = { "Pre-A1": "PRE_A1", A1: "A1", A2: "A2", B1: "B1", B2: "B2", C1: "C1", C2: "C2" };

export default function ThinkingInEnglishPage() {
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<PromptResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function loadPrompt(nextLevel = level) {
    setBusy(true);
    setResult(null);
    setAnswer("");
    setSaved(false);
    try {
      const response = await fetch("/api/teacher-help", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ level: nextLevel, skill: "speaking", askedForHelp: false }),
      });
      const payload = (await response.json()) as PromptResponse;
      setResult(response.ok ? payload : { error: payload.error ?? "Unable to load the prompt." });
    } catch {
      setResult({ error: "Unable to load the prompt." });
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBusy(true);
      setResult(null);
      setAnswer("");
      setSaved(false);
      try {
        const response = await fetch("/api/teacher-help", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ level: "A1", skill: "speaking", askedForHelp: false }),
        });
        const payload = (await response.json()) as PromptResponse;
        if (!cancelled) setResult(response.ok ? payload : { error: payload.error ?? "Unable to load the prompt." });
      } catch {
        if (!cancelled) setResult({ error: "Unable to load the prompt." });
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submitReflection() {
    if (!result?.thinkingInEnglish || !answer.trim()) return;
    setBusy(true);
    setSaved(false);
    try {
      const response = await fetch("/api/evidence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionType: "QUICK_QUEST",
          missionId: "thinking-in-english",
          objectiveId: `thinking-in-english:${result.thinkingInEnglish.stage}`,
          capabilityIds: [`thinking-in-english:${result.thinkingInEnglish.target}`],
          modality: "WRITING",
          outcome: "PARTIAL",
          score: 0,
          confidence: 0,
          level: learningLevels[level],
          context: "FAMILIAR",
          errorTags: [],
        }),
      });
      if (!response.ok) throw new Error("evidence-save-failed");
      setSaved(true);
      setResult((current) => current ? { ...current, adaptation: { rationale: "Your response has been recorded as learning evidence without inventing an accuracy score.", nextPrompt: "Keep the same idea, but express it in a slightly less predictable context." } } : current);
    } catch {
      setResult((current) => current ? { ...current, error: "Your answer could not be saved. Please retry." } : current);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="conversation-shell">
      <header className="conversation-header">
        <div>
          <p className="eyebrow">Think in English</p>
          <h1>Build direct English thought, step by step</h1>
          <p className="subtle">The prompt changes with your CEFR level: label → describe → retell → reason → argue → synthesise.</p>
        </div>
        <label className="level-picker">Level<select value={level} onChange={(e) => { const value = e.target.value as CEFRLevel; setLevel(value); void loadPrompt(value); }}>{levels.map((item) => <option key={item}>{item}</option>)}</select></label>
      </header>

      {result?.error && <section className="panel"><strong>{result.error}</strong></section>}
      {result?.thinkingInEnglish && (
        <>
          <section className="panel">
            <p className="eyebrow">Stage · {result.thinkingInEnglish.stage}</p>
            <h2>{result.thinkingInEnglish.prompt}</h2>
            <p><strong>Target:</strong> {result.thinkingInEnglish.target}</p>
          </section>
          <section className="panel" style={{ marginTop: 16 }}>
            <label>Your English answer<textarea rows={7} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write or say your answer in English without translating first…" /></label>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button className="button" disabled={!answer.trim() || busy} onClick={() => void submitReflection()}>{busy ? "Saving…" : "Submit reflection"}</button>
              <button className="button secondary" disabled={busy} onClick={() => void loadPrompt()}>{busy ? "Loading…" : "New prompt"}</button>
            </div>
            {saved && <div className="result-box" style={{ marginTop: 16 }}><strong>Saved.</strong> Your response is now part of your learning evidence.</div>}
            {result.adaptation && <div className="result-box" style={{ marginTop: 16 }}><strong>Next step:</strong> {result.adaptation.nextPrompt}<p>{result.adaptation.rationale}</p></div>}
          </section>
        </>
      )}
    </main>
  );
}

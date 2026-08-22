"use client";

import { useEffect, useMemo, useState } from "react";
import type { CEFRLevel } from "@/src/domain/learner";
import { levelContent } from "@/src/domain/content-library";
import { WordExplainer } from "@/app/components/WordPopover";

interface GrammarItem { patternType: string; spokenForm: string; writtenForm: string; explanation: string }

export default function GrammarPage() {
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const item = useMemo(() => levelContent(level).ear as unknown as GrammarItem, [level]);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((p) => { if (p.profile?.targetLevel) setLevel(p.profile.targetLevel); }).catch(() => undefined);
  }, []);

  async function check() {
    setChecked(true);
    if (answer.trim().toLowerCase() !== item.writtenForm.trim().toLowerCase()) return;
    try {
      await fetch("/api/evidence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionType: "QUICK_QUEST", missionId: `grammar:${level.toLowerCase()}`, objectiveId: `grammar:${item.patternType.toLowerCase()}`, capabilityIds: ["grammar:patterns"], modality: "WRITING", outcome: "CORRECT", score: 90, confidence: 0.8, level, context: "FAMILIAR", errorTags: [] }),
      });
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  return (
    <main id="main-content" style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">Grammar</p>
      <h1>Patterns in real language</h1>
      <p style={{ marginTop: 8, opacity: .75 }}>Notice a real pattern, understand it, then produce it yourself.</p>
      <select value={level} aria-label="CEFR level" onChange={(e) => { setLevel(e.target.value as CEFRLevel); setAnswer(""); setChecked(false); setSaved(false); }}>
        {["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].map((x) => <option key={x}>{x}</option>)}
      </select>
      <section className="panel" style={{ marginTop: 18 }}>
        <div className="eyebrow">{item.patternType}</div>
        <h2><WordExplainer text={item.writtenForm} /></h2>
        <p><strong>Pattern:</strong> <WordExplainer text={item.explanation} /></p>
        <p className="subtle">Natural form: <WordExplainer text={item.spokenForm} /></p>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Your turn</h2>
        <p>Type the full correct form:</p>
        <input value={answer} onChange={(e) => { setAnswer(e.target.value); setChecked(false); }} placeholder="Type the pattern…" />
        <button className="button" style={{ marginTop: 10 }} disabled={!answer.trim()} onClick={() => void check()}>Check</button>
        {checked && (
          <p style={{ marginTop: 10 }}>
            {answer.trim().toLowerCase() === item.writtenForm.trim().toLowerCase() ? "✓ Correct." : <>Not quite — the full form is <strong>{item.writtenForm}</strong>. Notice the difference and retry.</>}
          </p>
        )}
        {saved && <p className="subtle" style={{ marginTop: 8 }}>Grammar evidence saved to your learner model.</p>}
      </section>
    </main>
  );
}

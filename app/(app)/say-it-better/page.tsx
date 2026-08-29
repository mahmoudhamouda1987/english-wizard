"use client";
import { Celebration } from "@/app/components/celebration";
import { IconCheck } from "@/app/components/nav-icons";
import { PageHeader } from "@/app/components/page-header";
import { WordExplainer } from "@/app/components/WordPopover";
import { useEffect, useMemo, useState } from "react";
import { levelContent } from "@/src/domain/content-library";
import type { CEFRLevel } from "@/src/domain/learner";

type Step = "identify" | "correct" | "retry" | "transfer";

const LEVELS: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

const LADDER = [
  { key: "learner", label: "What you said", register: "your first attempt, unedited", field: "learnerVersion" as const, tone: "learner" },
  { key: "corrected", label: "Corrected", register: "accurate everyday English", field: "correctedVersion" as const, tone: "corrected" },
  { key: "natural", label: "A more natural alternative", register: "how confident speakers actually say it", field: "naturalVersion" as const, tone: "natural" },
  { key: "advanced", label: "Expressive upgrade", register: "polished, precise, personal", field: "advancedVersion" as const, tone: "advanced" },
  { key: "professional", label: "Professional register", register: "meetings, emails and formal moments", field: "professionalVersion" as const, tone: "professional" },
];

const STEP_LABEL: Record<Step, string> = {
  identify: "Compare with the corrected version",
  correct: "Start the retry",
  retry: "Move to transfer",
  transfer: "Save transfer",
};

export default function SayItBetterPage() {
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const [step, setStep] = useState<Step>("identify");
  const item = useMemo(() => levelContent(level).sayItBetter, [level]);
  const [retry, setRetry] = useState("");
  const [transfer, setTransfer] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(p => { if (p.profile?.targetLevel) setLevel(p.profile.targetLevel); }).catch(() => undefined);
  }, []);

  async function saveAttempt(context: "FAMILIAR" | "TRANSFER") {
    setBusy(true); setSaved(false);
    try {
      const response = await fetch("/api/evidence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionType: "STANDARD_JOURNEY", missionId: `say-it-better:${level.toLowerCase()}`, objectiveId: `say-it-better:${context.toLowerCase()}`, capabilityIds: [`revision:${level.toLowerCase()}`], modality: "WRITING", outcome: "PARTIAL", score: 0, confidence: 0, level, context, errorTags: ["awaiting-assessment"] }),
      });
      if (!response.ok) throw new Error("save-failed");
      setSaved(true);
    } catch { setSaved(false); }
    finally { setBusy(false); }
  }

  function advance() {
    if (step === "identify") setStep("correct");
    else if (step === "correct") { setStep("retry"); void saveAttempt("FAMILIAR"); }
    else if (step === "retry") { if (!retry.trim()) return; setStep("transfer"); void saveAttempt("FAMILIAR"); }
    else { if (!transfer.trim()) return; void saveAttempt("TRANSFER"); }
  }

  function switchLevel(next: CEFRLevel) {
    setLevel(next);
    setStep("identify");
    setRetry("");
    setTransfer("");
    setSaved(false);
  }

  const revealCount = step === "identify" ? 1 : step === "correct" ? 3 : step === "retry" ? 4 : 5;

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Practise — expression"
        title="Say It Better"
        purpose={`Upgrade your expression at ${level}: one sentence, five registers — from a first attempt to the boardroom.`}
      />

      <div className="filters" role="group" aria-label="Choose your CEFR level">
        <span className="f-label">Level</span>
        {LEVELS.map(x => (
          <button key={x} type="button" className="f-chip" data-active={x === level} onClick={() => switchLevel(x)}>{x}</button>
        ))}
      </div>

      <section aria-label="The upgrade ladder" className="sib-ladder">
        {LADDER.map((rung, i) => {
          const revealed = i < revealCount;
          return (
            <div
              key={rung.key}
              className="sib-rung"
              data-tone={rung.tone}
              data-locked={!revealed}
              style={revealed ? { transform: `translateX(${Math.min(i * 10, 40)}px)` } : undefined}
            >
              <span className="sib-label" data-tone={rung.tone}>
                {rung.label}
              </span>
              <span className="sib-register">{rung.register}</span>
              {revealed ? (
                <p><WordExplainer text={item[rung.field]} /></p>
              ) : (
                <p className="empty" style={{ fontStyle: "italic" }}>Revealed at the next stage — work through the ladder one step at a time.</p>
              )}
            </div>
          );
        })}
      </section>

      <section className="panel" aria-label="Why the upgrade works">
        <div className="panel-title">
          <h3>Why it works</h3>
          <span>{item.changeNotes.length} points of change</span>
        </div>
        <ul className="insight-list">
          {item.changeNotes.map((note) => (
            <li key={note}><IconCheck size={14} /> {note}</li>
          ))}
        </ul>
        <p className="empty" style={{ marginTop: 12, marginBottom: 0 }}>
          Register note: the same idea travels from personal to professional. Choose the rung that matches the room you are in —
          natural for conversation, professional for workplace writing.
        </p>
      </section>

      {step !== "identify" && (
        <section className="panel" aria-label="Retry practice">
          <div className="panel-title">
            <h3>Practice — retry</h3>
            <span>Your turn</span>
          </div>
          <p style={{ marginTop: 0 }}><WordExplainer text={item.retryPrompt} /></p>
          <label className="f-label" htmlFor="sib-retry">Your new version</label>
          <textarea id="sib-retry" rows={4} value={retry} onChange={e => setRetry(e.target.value)} placeholder="Write your new version here." style={{ width: "100%", marginTop: 6 }} />
        </section>
      )}

      {step === "transfer" && (
        <section className="panel" aria-label="Transfer practice">
          <div className="panel-title">
            <h3>Practice — transfer</h3>
            <span>A new context, the same skill</span>
          </div>
          <p style={{ marginTop: 0 }}><WordExplainer text={item.transferPrompt} /></p>
          <label className="f-label" htmlFor="sib-transfer">Your transferred version</label>
          <textarea id="sib-transfer" rows={4} value={transfer} onChange={e => setTransfer(e.target.value)} placeholder="Use the same skill in a new context." style={{ width: "100%", marginTop: 6 }} />
        </section>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          className="button"
          disabled={busy || (step === "retry" && !retry.trim()) || (step === "transfer" && !transfer.trim())}
          onClick={advance}
        >
          {busy ? "Saving…" : STEP_LABEL[step]}
        </button>
        {saved && (
          <span className="result-box" style={{ marginTop: 0, display: "inline-flex", alignItems: "center", gap: 6 }} role="status">
            <IconCheck size={14} /> Saved to your learner evidence
          </span>
        )}
      </div>

      <p className="empty">Revision attempts are stored as evidence without inventing an accuracy score — your writing is assessed later, against real criteria.</p>

      <Celebration trigger={saved ? "yes" : ""} />
    </main>
  );
}

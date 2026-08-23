"use client";
import { Celebration } from "@/app/components/celebration";
import { useEffect, useMemo, useState } from "react";
import { levelContent } from "@/src/domain/content-library";
import type { CEFRLevel } from "@/src/domain/learner";
import { WordExplainer } from "@/app/components/WordPopover";
import { PageHero } from "@/app/components/page-hero";

type Step = "identify" | "correct" | "retry" | "transfer";

const LEVELS: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

const LADDER = [
  { key: "learner", icon: "🧍", label: "Your version", color: "#94a3b8", field: "learnerVersion" as const },
  { key: "corrected", icon: "✅", label: "Corrected", color: "#38bdf8", field: "correctedVersion" as const },
  { key: "natural", icon: "💬", label: "Natural", color: "#10b981", field: "naturalVersion" as const },
  { key: "advanced", icon: "🎓", label: "Advanced", color: "#f59e0b", field: "advancedVersion" as const },
  { key: "professional", icon: "👔", label: "Professional", color: "#a855f7", field: "professionalVersion" as const },
];

export default function SayItBetterPage() {
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const [step, setStep] = useState<Step>("identify");
  const item = useMemo(() => levelContent(level).sayItBetter, [level]);
  const [retry, setRetry] = useState("");
  const [transfer, setTransfer] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(p => { if (p.profile?.targetLevel) setLevel(p.profile.targetLevel); }).catch(() => {});
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

  const revealCount = step === "identify" ? 1 : step === "correct" ? 3 : step === "retry" ? 4 : 5;

  return (
    <main id="main-content" className="dash-main">
      <PageHero icon="🪜" title="Say It Better" sub={`Climb the upgrade ladder at ${level}: the same idea, five levels of polish — from learner English to boardroom.`} />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {LEVELS.map(x => (
          <button key={x} className={x === level ? "button" : "button secondary"} onClick={() => { setLevel(x); setStep("identify"); setRetry(""); setTransfer(""); setSaved(false); }}>{x}</button>
        ))}
      </div>

      <section aria-label="Upgrade ladder" style={{ display: "grid", gap: 10 }}>
        {LADDER.map((rung, i) => {
          const revealed = i < revealCount;
          return (
            <div key={rung.key} className="panel" style={{
              margin: 0, padding: "14px 18px",
              borderLeft: `4px solid ${rung.color}`,
              opacity: revealed ? 1 : 0.45,
              transform: `translateX(${Math.min(i * 12, 48)}px)`,
              transition: "all .35s ease",
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <span style={{ fontSize: 22 }} aria-hidden="true">{revealed ? rung.icon : "🔒"}</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", color: rung.color }}>{rung.label}</strong>
                  <p style={{ margin: "4px 0 0", fontSize: i >= 3 ? 19 : 17, lineHeight: 1.6 }}>
                    {revealed ? <WordExplainer text={item[rung.field]} /> : <em className="subtle">Climb to unlock…</em>}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="panel" style={{ marginTop: 16, padding: 20 }}>
        <p><strong>Why it changed:</strong> <WordExplainer text={item.changeNotes.join(" · ")}/></p>
      </section>

      {step !== "identify" && (
        <section className="panel" style={{ marginTop: 16, padding: 20 }}>
          <h3>🔁 Retry</h3>
          <p className="subtle"><WordExplainer text={item.retryPrompt}/></p>
          <textarea rows={4} value={retry} onChange={e => setRetry(e.target.value)} placeholder="Write your new version." />
        </section>
      )}
      {step === "transfer" && (
        <section className="panel" style={{ marginTop: 16, padding: 20 }}>
          <h3>🎯 Transfer</h3>
          <p className="subtle"><WordExplainer text={item.transferPrompt}/></p>
          <textarea rows={4} value={transfer} onChange={e => setTransfer(e.target.value)} placeholder="Use the same skill in a new context." />
        </section>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button className="button" disabled={busy || (step === "retry" && !retry.trim()) || (step === "transfer" && !transfer.trim())} onClick={advance}>
          {busy ? "Saving…" : step === "identify" ? "Reveal the ladder 🪜" : step === "correct" ? "Start retry" : step === "retry" ? "Move to transfer" : "Save transfer"}
        </button>
      </div>

      <Celebration trigger={saved ? "yes" : ""} />
      {saved && <div className="result-box" style={{ marginTop: 12 }}>Saved to your learner evidence ✓</div>}
      <p className="subtle" style={{ marginTop: 10 }}>Revision attempts are stored as evidence without inventing an AI accuracy score.</p>
    </main>
  );
}

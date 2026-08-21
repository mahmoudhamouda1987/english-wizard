"use client";

import { useEffect, useState } from "react";

const stages = ["ORIENT", "TEACH", "PRACTICE", "PRODUCE", "RETRIEVE", "TRANSFER", "ASSESS", "COMPLETE"];

type Runtime = {
  stage: string;
  completedStages: string[];
  missingEvidence: string[];
  transferComplete: boolean;
  assessmentScore?: number;
};

export default function MissionRunnerPage() {
  const [missionId, setMissionId] = useState("mission-a1-meet");
  const [runtime, setRuntime] = useState<Runtime | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch(`/api/mission?missionId=${encodeURIComponent(missionId)}`);
      if (!response.ok || cancelled) return;
      const data = await response.json();
      if (!cancelled) setRuntime(data.runtime);
    })();
    return () => {
      cancelled = true;
    };
  }, [missionId]);

  async function advance() {
    const response = await fetch("/api/mission", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ missionId }),
    });
    const data = await response.json();
    if (response.ok) {
      setRuntime(data.runtime);
      setMessage(data.complete ? "Mission completed with verified evidence." : `Advanced to ${data.runtime.stage}.`);
    } else {
      setMessage(data.error ?? "Unable to advance mission.");
    }
  }

  return (
    <main id="main-content" style={{ maxWidth: 900, margin: "0 auto", padding: 48 }}>
      <p className="eyebrow">Mission Runner</p>
      <h1>Complete a mission, not a checklist.</h1>
      <p className="muted">
        A mission only completes when the system has real evidence and an assessment. This runner never invents either one.
      </p>

      <select value={missionId} onChange={(event) => setMissionId(event.target.value)} style={{ padding: 10, marginTop: 18 }}>
        <option value="mission-a1-meet">Meet Someone New</option>
        <option value="mission-b2-professional">Lead a Professional Meeting</option>
        <option value="boss-c2-live-in-english">Live in English</option>
      </select>

      <section className="panel" style={{ marginTop: 20 }}>
        {runtime && (
          <>
            <h2>{runtime.stage.replace("_", " ")}</h2>
            <div style={{ display: "grid", gap: 8, margin: "18px 0" }}>
              {stages.map((stage) => (
                <div
                  key={stage}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    opacity: runtime.completedStages.includes(stage) ? 0.55 : 1,
                  }}
                >
                  <strong>{stage}</strong>
                  {runtime.stage === stage ? <span> · current</span> : null}
                </div>
              ))}
            </div>

            <p>Missing evidence: {runtime.missingEvidence.length}</p>
            <p>Transfer: {runtime.transferComplete ? "complete" : "required"}</p>
            {runtime.assessmentScore !== undefined ? <p>Assessment: {runtime.assessmentScore}%</p> : <p>Assessment: not yet recorded</p>}
            <button className="button" onClick={advance}>Advance stage</button>
          </>
        )}
      </section>

      {message ? <p role="status" style={{ marginTop: 18 }}>{message}</p> : null}
    </main>
  );
}

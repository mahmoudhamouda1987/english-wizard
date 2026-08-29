"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/app/components/page-header";
import { Celebration } from "@/app/components/celebration";
import { IconCheck, IconGlobe, IconRoute, IconShield, IconTarget } from "@/app/components/nav-icons";

interface Checkpoint { id: string; level: string; title: string; situation: string; task: string; skill: string; rubric: Array<{ id: string; label: string; hint: string }> }
interface HistoryItem { id: string; checkpointId: string | null; response: string | null; selfCheck: string[]; occurredAt: string }
interface Data { level: string; completedCount: number; checkpoint: Checkpoint | null; history: HistoryItem[] }

function checkpointSkillLabel(skill: string): string {
  return `Life task · ${skill}`;
}

export default function CheckpointsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function load() {
    setLoadError(false);
    try {
      const r = await fetch("/api/checkpoints", { cache: "no-store" });
      if (!r.ok) throw new Error("load-failed");
      setData((await r.json()) as Data);
    } catch {
      setLoadError(true);
    }
  }

  useEffect(() => {
    let alive = true;
    fetch("/api/checkpoints", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("load-failed");
        return (await r.json()) as Data;
      })
      .then((d) => { if (alive) setData(d); })
      .catch(() => { if (alive) setLoadError(true); });
    return () => { alive = false; };
  }, []);

  function toggleRubric(id: string) {
    setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  async function submit() {
    if (!data?.checkpoint) return;
    setSaving(true);
    setSubmitError(null);
    try {
      const r = await fetch("/api/checkpoints", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ checkpointId: data.checkpoint.id, response: responseText, selfCheck: checked }),
      });
      if (!r.ok) throw new Error("submit-failed");
      setDone(true);
      setResponseText("");
      setChecked([]);
      await load();
    } catch {
      setSubmitError("The checkpoint could not be saved. Your response is still in the box — press submit again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  const rubricTicked = data?.checkpoint ? checked.filter((id) => data.checkpoint?.rubric.some((c) => c.id === id)).length : 0;

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Practise — checkpoints"
        title="Reality Checkpoints"
        purpose={`Real-world English challenges at ${data?.level ?? "your"} level. Complete one, check yourself against an authentic rubric, and keep it as proof — no game points, just evidence.`}
      />

      {loadError && (
        <div className="state-card error" role="alert">
          <strong>Your checkpoint could not be loaded.</strong> Check your connection and try again.
          <div style={{ marginTop: 10 }}>
            <button className="button secondary" onClick={() => void load()}>Try again</button>
          </div>
        </div>
      )}

      {!data && !loadError && (
        <section className="panel" aria-hidden="true">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" style={{ width: "80%" }} />
          <div className="skeleton skeleton-text" style={{ width: "65%" }} />
          <div className="skeleton" style={{ height: 96, marginTop: 14 }} />
          <span className="sr-only">Loading your checkpoint…</span>
        </section>
      )}

      {data?.checkpoint && !done && (
        <section className="panel" aria-label={`Checkpoint: ${data.checkpoint.title}`}>
          <div className="panel-title">
            <span className="lc-badges" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="lc-badge level">{data.checkpoint.level}</span>
              <span className="lc-badge skill">{checkpointSkillLabel(data.checkpoint.skill)}</span>
            </span>
            <span>One checkpoint, every few days</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px, 2.2vw, 26px)", margin: "0 0 14px", fontWeight: 600 }}>{data.checkpoint.title}</h2>

          <div className="ck-stage">
            <div>
              <p className="ck-stage-label">Setup</p>
              <p style={{ margin: "8px 0 0", lineHeight: 1.6, display: "flex", gap: 8, alignItems: "flex-start" }}><span style={{ flex: "none", marginTop: 3, color: "var(--accent-text)" }}><IconGlobe size={14} /></span><span>{data.checkpoint.situation}</span></p>
            </div>
            <div>
              <p className="ck-stage-label">Objective</p>
              <div className="conv-next" style={{ marginTop: 8 }}>
                <IconTarget size={16} />
                <span>{data.checkpoint.task}</span>
              </div>
            </div>
            <div>
              <p className="ck-stage-label">The exchange — your side of the conversation</p>
              <label className="f-label" htmlFor="ck-response" style={{ display: "block", marginTop: 8 }}>Write exactly what you would say or send</label>
              <textarea
                id="ck-response"
                aria-label="Your real-world response"
                rows={6}
                placeholder="Write the words you would actually use — as if the person were in front of you…"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                style={{ width: "100%", marginTop: 6 }}
              />
            </div>
            <div>
              <p className="ck-stage-label">Reflection — check yourself ({rubricTicked}/{data.checkpoint.rubric.length})</p>
              <ul className="ck-rubric" style={{ marginTop: 8 }}>
                {data.checkpoint.rubric.map((criterion) => (
                  <li key={criterion.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={checked.includes(criterion.id)}
                        onChange={() => toggleRubric(criterion.id)}
                        aria-label={`${criterion.label}: ${criterion.hint}`}
                      />
                      <span>
                        <strong>{criterion.label}</strong>
                        <br />
                        <small>{criterion.hint}</small>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className="empty" style={{ marginTop: 8, marginBottom: 0, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ flex: "none", marginTop: 3, color: "var(--accent-text)" }}><IconShield size={13} /></span>
                <span>Tick each criterion your response truly meets — honest self-assessment is itself the skill being practised.</span>
              </p>
            </div>
          </div>

          {submitError && <div className="state-card error" style={{ marginTop: 14 }} role="alert">{submitError}</div>}

          <div style={{ marginTop: 16 }}>
            <button className="button" disabled={saving || responseText.trim().length < 10} onClick={() => void submit()}>
              {saving ? "Saving…" : "Submit & store as evidence"}
            </button>
            {responseText.trim().length < 10 && (
              <span className="empty" style={{ marginLeft: 10 }}>Write at least a sentence or two before submitting.</span>
            )}
          </div>
        </section>
      )}

      {done && (
        <section className="result-box" role="status" aria-label="Checkpoint complete">
          <p style={{ margin: 0, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ flex: "none", marginTop: 2, color: "var(--success)" }}><IconCheck size={16} /></span>
            <span>
              <strong>Checkpoint complete and saved to your portfolio.</strong> The next one unlocks in a few days — spacing is what makes it stick. Until then, keep the skill warm in Role-play or Speaking Coach.
            </span>
          </p>
        </section>
      )}

      {data && !data.checkpoint && !done && (
        <div className="state-card info">
          <strong>What this area is:</strong> occasional real-world challenges — a complaint to reception, a polite follow-up email, a difficult conversation — completed in writing and kept as proof of what you can do.
          <p className="empty" style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ flex: "none", marginTop: 3, color: "var(--accent-text)" }}><IconRoute size={14} /></span>
            <span>
            {data.completedCount > 0
              ? "You are between checkpoints — they arrive spaced a few days apart so each one genuinely sticks. What to do now: re-read your past responses below, or keep practising in Role-play until the next one unlocks."
              : "No checkpoint is scheduled at this exact moment. What to do now: come back tomorrow — your first one will be waiting."}
            </span>
          </p>
        </div>
      )}

      {data && data.completedCount > 0 && (
        <section className="stat-strip" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }} aria-label="Checkpoint record">
          <div className="stat-tile"><strong>{data.completedCount}</strong><span>Reality checkpoints completed</span></div>
          <a className="stat-tile" href="/portfolio"><strong>View</strong><span>In your portfolio</span></a>
        </section>
      )}

      {data && data.history.length > 0 && (
        <section className="panel" aria-label="Past checkpoints">
          <div className="panel-title">
            <h3>Past checkpoints</h3>
            <span>Your record, kept forever</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {data.history.map((item) => (
              <article key={item.id} className="mission-row">
                <span className="mi-num" aria-hidden="true"><IconCheck size={14} /></span>
                <span className="mi-body">
                  <strong>{item.response?.slice(0, 90) ?? "Completed checkpoint"}</strong>
                  <small>
                    {new Date(item.occurredAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    {` · self-checked ${item.selfCheck.length} ${item.selfCheck.length === 1 ? "criterion" : "criteria"}`}
                  </small>
                </span>
              </article>
            ))}
          </div>
        </section>
      )}

      <Celebration trigger={done ? `d${data?.completedCount ?? 0}` : ""} />
    </main>
  );
}

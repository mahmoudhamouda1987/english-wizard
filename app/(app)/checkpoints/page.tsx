"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/app/components/page-hero";
import { Celebration } from "@/app/components/celebration";

interface Checkpoint { id: string; level: string; title: string; situation: string; task: string; skill: string; rubric: Array<{ id: string; label: string; hint: string }> }
interface HistoryItem { id: string; checkpointId: string | null; response: string | null; selfCheck: string[]; occurredAt: string }
interface Data { level: string; completedCount: number; checkpoint: Checkpoint | null; history: HistoryItem[] }

export default function CheckpointsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [responseText, setResponseText] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function load() {
    const r = await fetch("/api/checkpoints", { cache: "no-store" });
    if (r.ok) setData(await r.json());
  }
  useEffect(() => {
    let alive = true;
    fetch("/api/checkpoints", { cache: "no-store" })
      .then(async (r) => { if (alive && r.ok) setData((await r.json()) as Data); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  function toggleRubric(id: string) {
    setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  async function submit() {
    if (!data?.checkpoint) return;
    setSaving(true);
    try {
      const r = await fetch("/api/checkpoints", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ checkpointId: data.checkpoint.id, response: responseText, selfCheck: checked }),
      });
      if (r.ok) { setDone(true); setResponseText(""); setChecked([]); await load(); }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main id="main-content" className="dash-main">
      <PageHero icon="🌍" title="Reality checkpoints" sub={`Real-life English tasks at ${data?.level ?? "your"} level — scored against an authentic checklist you apply yourself, then kept forever as proof. No game points.`} />
      <Celebration trigger={done ? `d${data?.completedCount ?? 0}` : ""} />

      {!data && <div className="state-card">Loading your mission…</div>}

      {data?.checkpoint && !done && (
        <section className="panel" style={{ padding: 26 }}>
          <p className="eyebrow">{checkpointSkillLabel(data.checkpoint.skill)} · every-3-days challenge</p>
          <h2 style={{ fontSize: 24, margin: "6px 0 4px" }}>{data.checkpoint.title}</h2>
          <p className="subtle">Situation: {data.checkpoint.situation}</p>
          <div className="result-box" style={{ marginTop: 14 }}>
            <strong>Your task:</strong> {data.checkpoint.task}
          </div>
          <details style={{ marginTop: 14 }}>
            <summary className="link-button" style={{ cursor: "pointer" }}>Show the authentic rubric ({data.checkpoint.rubric.length} criteria)</summary>
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8, marginTop: 10 }}>
              {data.checkpoint.rubric.map((criterion) => (
                <li key={criterion.id}>
                  <label style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer" }}>
                    <input type="checkbox" checked={checked.includes(criterion.id)} onChange={() => toggleRubric(criterion.id)} style={{ marginTop: 4 }} />
                    <span><strong>{criterion.label}</strong><br /><small className="subtle">{criterion.hint}</small></span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="subtle" style={{ marginTop: 8 }}>Tick each criterion your response truly meets — honest self-assessment is itself the skill.</p>
          </details>
          <textarea aria-label="Your real-world response" rows={6} placeholder="Write exactly what you would say or send…" value={responseText} onChange={(e) => setResponseText(e.target.value)} style={{ marginTop: 16 }} />
          <div style={{ marginTop: 12 }}>
            <button className="button" disabled={saving || responseText.trim().length < 10} onClick={() => void submit()}>{saving ? "Saving…" : "Submit & store as evidence →"}</button>
          </div>
        </section>
      )}

      {done && (
        <section className="result-box" style={{ marginTop: 18 }}>
          ✓ Checkpoint complete and saved to your portfolio. {data?.checkpoint ? "" : ""}The next one unlocks in a few days — spacing makes it stick.
        </section>
      )}

      {data && data.completedCount > 0 && (
        <section className="stat-strip">
          <div className="stat-tile"><strong>{data.completedCount}</strong><span>Reality checkpoints completed</span></div>
          <a className="stat-tile" href="/portfolio"><strong>View →</strong><span>In your portfolio</span></a>
        </section>
      )}

      {data && data.history.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <p className="eyebrow">Past checkpoints</p>
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            {data.history.map((item) => (
              <article key={item.id} className="panel" style={{ margin: 0, padding: 16 }}>
                <small className="subtle">{new Date(item.occurredAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })} · self-checked {item.selfCheck.length}</small>
                <p style={{ marginTop: 6, lineHeight: 1.6 }}>{item.response}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function checkpointSkillLabel(skill: string): string {
  return `Life task · ${skill}`;
}

"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/app/components/page-header";
import { Celebration } from "@/app/components/celebration";

interface QueueItem { id: string; learnerFirstName: string; level: string; taskTitle: string; responseText: string; selfCheckCount: number }
interface Data { queue: QueueItem[]; given: number; received: number; feedbackReceived: Array<{ comment: string; createdAt: string }> }

export default function CommunityPage() {
  const [data, setData] = useState<Data | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/community/corrections", { cache: "no-store" })
      .then(async (r) => { if (alive && r.ok) setData((await r.json()) as Data); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  async function submit(item: QueueItem) {
    setError(null);
    const comment = (comments[item.id] ?? "").trim();
    if (comment.length < 15) { setError("Write at least a sentence — vague feedback doesn't help."); return; }
    const r = await fetch("/api/community/corrections", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ submissionId: item.id, comment }),
    });
    if (r.ok) {
      setSentTo((s) => [...s, item.id]);
      await load();
    } else {
      const p = await r.json().catch(() => ({}));
      setError(p.error ?? "Unable to send feedback.");
    }
  }

  async function load() {
    const r = await fetch("/api/community/corrections", { cache: "no-store" });
    if (r.ok) setData(await r.json());
  }

  return (
    <main id="main-content" className="dash-main">
      <PageHeader eyebrow="Learn together" title="Community" purpose="Real people correcting real work is the one thing AI cannot fake. Review a peer's reality-checkpoint response — and collect feedback on your own." />
      <Celebration trigger={sentTo.length ? `sent${sentTo.length}` : ""} />

      {!data && !error && <div className="state-card">Loading the community…</div>}

      {data && (
        <>
          <section className="stat-strip">
            <div className="stat-tile"><strong>{data.given}</strong><span>Feedback you&rsquo;ve given</span></div>
            <div className="stat-tile"><strong>{data.received}</strong><span>Feedback on your work</span></div>
            <div className="stat-tile"><strong>{data.queue.length}</strong><span>Waiting for review</span></div>
          </section>

          {data.feedbackReceived.length > 0 && (
            <section className="panel" style={{ padding: 20 }}>
              <div className="panel-title"><h3>📬 Feedback on your checkpoints</h3></div>
              <div style={{ display: "grid", gap: 8 }}>
                {data.feedbackReceived.map((f, i) => (
                  <p key={i} style={{ margin: 0, lineHeight: 1.6 }}>“{f.comment}”</p>
                ))}
              </div>
            </section>
          )}

          {error && <div role="alert" className="state-card error">{error}</div>}

          <section style={{ display: "grid", gap: 12, marginTop: 8 }}>
            {data.queue.length === 0 && (
              <div className="state-card">No submissions waiting right now — complete a Reality Checkpoint yourself and it appears here for peers.</div>
            )}
            {data.queue.map((item) => (
              <article key={item.id} className="panel" style={{ margin: 0, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <strong>{item.learnerFirstName} · level {item.level}</strong>
                  <small className="subtle">{item.taskTitle} · self-checked {item.selfCheckCount}</small>
                </div>
                <p style={{ marginTop: 10, lineHeight: 1.7 }}>“{item.responseText}{item.responseText.length >= 400 ? "…" : ""}”</p>
                {sentTo.includes(item.id) ? (
                  <div className="result-box">✓ Feedback sent. Thank you!</div>
                ) : (
                  <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                    <textarea
                      aria-label={`Your feedback for ${item.learnerFirstName}`}
                      rows={3}
                      placeholder={"What worked? What would a native speaker say differently? Be kind and specific…"}
                      value={comments[item.id] ?? ""}
                      onChange={(e) => setComments((c) => ({ ...c, [item.id]: e.target.value }))}
                    />
                    <button className="button secondary" onClick={() => void submit(item)}>Send feedback →</button>
                  </div>
                )}
              </article>
            ))}
          </section>

          <section className="panel" style={{ marginTop: 16, padding: 18 }}>
            <p className="subtle" style={{ margin: 0, fontSize: 13 }}>
              Privacy-first: submissions are anonymised to first name + level, reviewers never see emails,
              and you can never review your own work.
            </p>
          </section>
        </>
      )}
    </main>
  );
}

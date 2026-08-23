"use client";

import { useEffect, useState } from "react";

type MasteryRecord = { skill: string; score: number; level: string };
type ProgressState = { completedLessonIds: string[]; mastery: MasteryRecord[]; errors: unknown[]; version: number };

export default function ProgressPage() {
  const [state, setState] = useState<ProgressState | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/learner-state", { cache: "no-store" })
      .then((r) => r.json())
      .then((p) => {
        if (!cancelled) setState(p.state);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!state)
    return (
      <main id="main-content" style={{ maxWidth: 900, margin: "0 auto", padding: 48 }}>
        <h1>Progress</h1>
        <p>Loading saved progress…</p>
      </main>
    );

  return (
    <main id="main-content" style={{ maxWidth: 900, margin: "0 auto", padding: 48 }}>
      <p className="eyebrow">Evidence dashboard</p>
      <h1>Your progress</h1>
      <div className="stats-grid">
        <article><span>Lessons</span><strong>{state.completedLessonIds.length}</strong></article>
        <article><span>Skills observed</span><strong>{state.mastery.length}</strong></article>
        <article><span>Errors</span><strong>{state.errors.length}</strong></article>
        <article><span>State version</span><strong>{state.version}</strong></article>
      </div>
      <section className="panel">
        <h2>Mastery</h2>
        {state.mastery.map((m) => <p key={m.skill}><strong>{m.skill}</strong> — {m.score}% · {m.level}</p>)}
      </section>
    </main>
  );
}

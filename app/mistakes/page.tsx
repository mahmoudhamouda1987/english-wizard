"use client";

import { useEffect, useState } from "react";

type ErrorRecord = { id: string; description: string; severity: string; skill: string; occurrences: number };

export default function MistakesPage() {
  const [errors, setErrors] = useState<ErrorRecord[]>([]);

  useEffect(() => {
    const id = localStorage.getItem("english-wizard-learner-id");
    if (!id) return;
    let cancelled = false;
    fetch(`/api/learner-state?learnerId=${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((p) => {
        if (!cancelled) setErrors(p.state?.errors ?? []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 48 }}>
      <p className="eyebrow">Error memory</p>
      <h1>Mistakes to review</h1>
      <p className="subtle">Repeated errors stay visible so future practice can target them.</p>
      {errors.length === 0 ? (
        <section className="panel"><p>No recurring mistakes recorded yet.</p></section>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 22 }}>
          {errors.map((e) => (
            <section className="panel" key={e.id}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>{e.description}</h2>
                <b>{e.severity}</b>
              </div>
              <p>{e.skill} · {e.occurrences} occurrence(s)</p>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

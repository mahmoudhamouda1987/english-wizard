"use client";

import { useCallback, useEffect, useState } from "react";
import { AUDIT_LEVELS, AUDIT_PERSONA_PASSWORD } from "@/src/infrastructure/audit-mode";

interface PersonaRow { email: string; level: string; note: string }

type Feedback = { tone: "ok" | "err"; text: string } | null;

/** Developer-only audit controls (Parts 94–99). Reachable only when the
 * deployment enables audit mode; every action is re-gated server-side. */
export function AuditPanel() {
  const [level, setLevel] = useState<string>("B1");
  const [day, setDay] = useState<number>(1);
  const [variant, setVariant] = useState<number>(1);
  const [personas, setPersonas] = useState<PersonaRow[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);

  const act = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ tone: "err", text: data.error ?? `Action failed (${res.status}).` });
        return data;
      }
      return data;
    } catch {
      setFeedback({ tone: "err", text: "Network error while calling the audit API." });
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!d) setFeedback({ tone: "err", text: "Audit API unavailable." }); })
      .catch(() => setFeedback({ tone: "err", text: "Audit API unavailable." }));
  }, []);

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "40px 20px 80px" }}>
      <p className="eyebrow">Developer only · never available in production</p>
      <h1 style={{ fontSize: 32, letterSpacing: "-.02em", margin: "6px 0 8px" }}>Audit control panel</h1>
      <p className="subtle" style={{ maxWidth: 640, margin: "0 0 28px" }}>
        One codebase, one audit environment. These controls act on the signed-in test learner:
        set any CEFR level, simulate the trial week, reset LevelCheck without changing email,
        force a variant, or seed the standard test personas.
      </p>

      {feedback && (
        <p role="status" style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 20, fontWeight: 600, fontSize: 14,
          background: feedback.tone === "ok" ? "var(--success-soft, var(--surface-card))" : "var(--danger-soft, var(--surface-card))",
          color: feedback.tone === "ok" ? "var(--success)" : "var(--danger)" }}>
          {feedback.text}
        </p>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {/* ── Learner level ── */}
        <section className="panel" style={{ padding: 20, display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 17 }}>Learner level</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="CEFR level"
              style={{ padding: "9px 12px", borderRadius: 10, background: "var(--surface-card)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}>
              {AUDIT_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <button type="button" className="button" disabled={busy}
              onClick={async () => { const d = await act("set-level", { level }); if (d?.ok) setFeedback({ tone: "ok", text: `Level set to ${d.level}.` }); }}>
              Apply level
            </button>
          </div>
        </section>

        {/* ── Trial simulation ── */}
        <section className="panel" style={{ padding: 20, display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 17 }}>Trial simulation</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <label style={{ fontSize: 13.5, fontWeight: 600 }}>
              Day
              <input type="number" min={1} max={7} value={day} onChange={(e) => setDay(Number(e.target.value))}
                style={{ width: 70, marginLeft: 8, padding: "9px 12px", borderRadius: 10, background: "var(--surface-card)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }} />
              of 7
            </label>
            <button type="button" className="button" disabled={busy}
              onClick={async () => { const d = await act("simulate-trial-day", { day }); if (d?.ok) setFeedback({ tone: "ok", text: `Trial now reads Day ${d.day} of 7 (ends ${new Date(d.endsAt).toLocaleDateString("en-GB")}).` }); }}>
              Simulate trial day
            </button>
            <button type="button" className="button secondary" disabled={busy}
              onClick={async () => { const d = await act("expire-trial"); if (d?.ok) setFeedback({ tone: "ok", text: "Trial expired — locked-state audit ready." }); }}>
              Expire trial
            </button>
          </div>
        </section>

        {/* ── Assessment reset / variant ── */}
        <section className="panel" style={{ padding: 20, display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 17 }}>LevelCheck</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <button type="button" className="button secondary" disabled={busy}
              onClick={async () => { const d = await act("reset-assessment"); if (d?.ok) setFeedback({ tone: "ok", text: "Assessment reset — you can repeat LevelCheck with the same account." }); }}>
              Reset assessment
            </button>
            <label style={{ fontSize: 13.5, fontWeight: 600 }}>
              Variant
              <input type="number" min={1} max={15} value={variant} onChange={(e) => setVariant(Number(e.target.value))}
                style={{ width: 70, marginLeft: 8, padding: "9px 12px", borderRadius: 10, background: "var(--surface-card)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }} />
            </label>
            <button type="button" className="button secondary" disabled={busy}
              onClick={async () => { const d = await act("set-variant", { variant }); if (d?.ok) setFeedback({ tone: "ok", text: `Next sitting will use variant ${d.variant}.` }); }}>
              Force variant
            </button>
          </div>
        </section>

        {/* ── Test personas ── */}
        <section className="panel" style={{ padding: 20, display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 17 }}>Test personas</h2>
          <p className="subtle" style={{ margin: 0, fontSize: 13.5 }}>
            Fourteen personas across every band and product goal. Password: <code style={{ fontWeight: 700 }}>{AUDIT_PERSONA_PASSWORD}</code>
          </p>
          <button type="button" className="button" style={{ justifySelf: "start" }} disabled={busy}
            onClick={async () => {
              const d = await act("seed-personas");
              if (d?.ok) {
                setPersonas(d.personas);
                setFeedback({ tone: "ok", text: `Personas ready — ${d.created} created, ${d.existing} already present.` });
              }
            }}>
            Seed test users
          </button>
          {personas.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 520 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-default)" }}>
                    <th style={{ padding: 8 }}>Email</th><th style={{ padding: 8 }}>Level</th><th style={{ padding: 8 }}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {personas.map((p) => (
                    <tr key={p.email} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: 8, fontFamily: "monospace", fontSize: 12 }}>{p.email}</td>
                      <td style={{ padding: 8, fontWeight: 700 }}>{p.level}</td>
                      <td style={{ padding: 8 }}>{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

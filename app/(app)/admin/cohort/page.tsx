"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/app/components/page-header";

/**
 * Organisation cohort dashboard (2.0 Part 96) — admin-governed view of B2B
 * assessment activity. Aggregate statistics only: no individual private data.
 */

type CohortRow = { organisation: string; label: string; system: string; status: string; created_at: string };

export default function AdminCohortPage() {
  const [rows, setRows] = useState<CohortRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/b2b-cohort", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error ?? "Unavailable");
        return r.json();
      })
      .then((d) => setRows(d.assessments ?? []))
      .catch((e) => setError(String(e.message ?? "Unable to load the cohort view.")));
  }, []);

  const total = rows?.length ?? 0;
  const completed = (rows ?? []).filter((r) => r.status === "COMPLETED").length;
  const open = (rows ?? []).filter((r) => r.status === "OPEN").length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Governance · B2B"
        title="Cohort Dashboard"
        purpose="Organisation assessment activity in aggregate — candidates stay private; patterns do not."
      />
      {error && <p role="alert" className="state-card">{error}</p>}
      {!rows && !error && <p className="subtle">Loading cohort data…</p>}
      {rows && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 18 }}>
            <div className="panel" style={{ padding: 20 }}><p className="eyebrow">Assessments</p><p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{total}</p></div>
            <div className="panel" style={{ padding: 20 }}><p className="eyebrow">Completed</p><p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{completed}</p></div>
            <div className="panel" style={{ padding: 20 }}><p className="eyebrow">In progress</p><p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{open}</p></div>
            <div className="panel" style={{ padding: 20 }}><p className="eyebrow">Completion</p><p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{completionRate}%</p></div>
          </div>
          <section className="panel" style={{ padding: 22 }}>
            <div className="panel-title"><h2>Assessments</h2><span>{total} total</span></div>
            {rows.length === 0 ? (
              <p className="subtle">No organisation assessments yet. The B2B API is live at /api/b2b/assessments — registrations appear here as they arrive.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead><tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-default)" }}>
                  <th style={{ padding: "8px 10px" }}>Organisation</th><th style={{ padding: "8px 10px" }}>Label</th><th style={{ padding: "8px 10px" }}>System</th><th style={{ padding: "8px 10px" }}>Status</th><th style={{ padding: "8px 10px" }}>Created</th>
                </tr></thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "8px 10px" }}>{r.organisation}</td>
                      <td style={{ padding: "8px 10px" }}>{r.label}</td>
                      <td style={{ padding: "8px 10px" }}>{r.system}</td>
                      <td style={{ padding: "8px 10px" }}><span className="pill">{r.status}</span></td>
                      <td style={{ padding: "8px 10px" }}>{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}

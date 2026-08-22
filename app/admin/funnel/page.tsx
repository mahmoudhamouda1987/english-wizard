"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/app/components/page-hero";

interface FunnelData {
  funnel: Array<{ stage: string; count: number }>;
  conversion: { signupToDiagnostic: number | null; diagnosticToFirstLesson: number | null; signupToPaid: number | null };
  daily: Array<{ day: string; signups: number; actives: number }>;
  peakActive: number;
}

export default function FunnelPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/funnel", { cache: "no-store" })
      .then(async (r) => { if (!r.ok) throw new Error((await r.json()).error ?? "Unable to load funnel."); setData(await r.json()); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load funnel."));
  }, []);

  return (
    <main id="main-content" style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <PageHero icon="📊" title="Acquisition funnel" sub="Where learners flow — and where they leak. Percentages are honest counts against total signups." />

      {error && <div role="alert" className="state-card error">{error}</div>}
      {!data && !error && <div className="state-card">Crunching numbers…</div>}

      {data && (
        <>
          <section style={{ display: "grid", gap: 10, marginTop: 8 }}>
            {data.funnel.map((stage, i) => {
              const base = data.funnel[0].count || 1;
              const width = Math.max(3, Math.round((stage.count / base) * 100));
              const dropFromPrev = i > 0 && data.funnel[i - 1].count > 0 ? Math.round(((data.funnel[i - 1].count - stage.count) / data.funnel[i - 1].count) * 100) : 0;
              return (
                <div key={stage.stage} className="panel" style={{ margin: 0, padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                    <strong>{stage.stage}</strong>
                    <span>
                      <strong>{stage.count.toLocaleString()}</strong>
                      <small className="subtle"> · {Math.round((stage.count / base) * 1000) / 10}% of signups{i > 0 && dropFromPrev > 0 ? ` · −${dropFromPrev}% from previous` : ""}</small>
                    </span>
                  </div>
                  <div className="track"><span style={{ width: `${width}%` }} /></div>
                </div>
              );
            })}
          </section>

          <section className="stat-strip">
            <div className="stat-tile"><strong>{data.conversion.signupToDiagnostic ?? "—"}%</strong><span>Signup → diagnostic</span></div>
            <div className="stat-tile"><strong>{data.conversion.diagnosticToFirstLesson ?? "—"}%</strong><span>Diagnostic → first lesson</span></div>
            <div className="stat-tile"><strong>{data.conversion.signupToPaid ?? "—"}%</strong><span>Signup → paid</span></div>
          </section>

          <section className="panel" style={{ padding: 22 }}>
            <div className="panel-title"><h3>Last 30 days — signups vs active learners</h3></div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120 }} aria-hidden="true">
              {data.daily.map((d) => (
                <div key={d.day} title={`${d.day}: ${d.signups} signups · ${d.actives} active`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", position: "relative" }}>
                  <div style={{ background: "#6840d6", height: `${(d.actives / data.peakActive) * 100}%`, borderRadius: 2 }} />
                  <div style={{ background: "#c9b8f7", height: `${(d.signups / data.peakActive) * 100}%`, borderRadius: 2, marginTop: 2 }} />
                </div>
              ))}
            </div>
            <p className="subtle" style={{ marginTop: 10, fontSize: 13 }}>
              <span aria-hidden="true">🟪</span> active learners that day · <span aria-hidden="true">⬜</span> new signups. Peak {data.peakActive} active.
            </p>
          </section>
        </>
      )}
    </main>
  );
}

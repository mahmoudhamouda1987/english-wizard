"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHero } from "@/app/components/page-hero";

interface Artifact { id: string; kind: string; skill: string; objective: string | null; prompt: string | null; excerpt: string | null; score: number | null; transfer: boolean; occurredAt: string }
interface PortfolioData { displayName: string; totals: { artifacts: number; transfers: number; scored: number; certificates: number }; artifacts: Artifact[]; certificates: Array<{ id: string; level: string; overallPercent: number; issuedAt: string }> }

const SKILL_ICONS: Record<string, string> = { writing: "✍️", speaking: "🎙️", reading: "📖", listening: "👂", vocabulary: "🔤", grammar: "🧩", pronunciation: "🗣️" };

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/portfolio", { cache: "no-store" }).then(async (r) => { const p = await r.json(); if (r.ok) setData(p); }).catch(() => undefined);
  }, []);

  const grouped = useMemo(() => {
    if (!data) return [] as Array<{ month: string; items: Artifact[] }>;
    const visible = data.artifacts.filter((a) => filter === "all" || a.skill === filter);
    const byMonth = new Map<string, Artifact[]>();
    for (const item of visible) {
      const d = new Date(item.occurredAt);
      const key = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      const list = byMonth.get(key) ?? [];
      list.push(item);
      byMonth.set(key, list);
    }
    return [...byMonth.entries()].map(([month, items]) => ({ month, items }));
  }, [data, filter]);

  const skills = useMemo(() => (data ? ["all", ...new Set(data.artifacts.map((a) => a.skill))] : ["all"]), [data]);

  return (
    <main id="main-content" className="dash-main">
      <PageHero icon="🗂️" title="My portfolio" sub={data ? `${data.displayName}, this is the English you have actually produced — every piece is real evidence, not a score in a game.` : "Your produced work, collected as proof of progress."} />

      {!data && <div className="state-card">Collecting your work…</div>}

      {data && (
        <>
          <section className="stat-strip">
            <div className="stat-tile"><strong>{data.totals.artifacts}</strong><span>Pieces of work</span></div>
            <div className="stat-tile"><strong>{data.totals.scored}</strong><span>Scored productions</span></div>
            <div className="stat-tile"><strong>{data.totals.transfers}</strong><span>Transfer challenges</span></div>
            <div className="stat-tile"><strong>{data.totals.certificates}</strong><span>Certificates</span></div>
          </section>

          {data.certificates.length > 0 && (
            <section className="panel" style={{ padding: 22 }}>
              <div className="panel-title"><h3>Certificates you can share</h3></div>
              <div style={{ display: "grid", gap: 10 }}>
                {data.certificates.map((c) => (
                  <a key={c.id} href={`/certificate/${c.id}`} className="button secondary" style={{ textAlign: "left", display: "flex", justifyContent: "space-between" }}>
                    <span>🎖️ CEFR {c.level}</span>
                    <span>{c.overallPercent}% mastery · verify link →</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {skills.map((s) => (
              <button key={s} className={s === filter ? "button" : "button secondary"} onClick={() => setFilter(s)}>{s === "all" ? "Everything" : s}</button>
            ))}
          </div>

          {grouped.length === 0 && <div className="state-card">Nothing here yet — complete a writing task or reading transfer and it appears here as your first artifact.</div>}

          {grouped.map((group) => (
            <section key={group.month}>
              <p className="eyebrow" style={{ margin: "26px 4px 10px" }}>{group.month}</p>
              <div style={{ display: "grid", gap: 12 }}>
                {group.items.map((item) => (
                  <article key={item.id} className="panel" style={{ margin: 0, padding: 18, borderLeft: `4px solid ${item.transfer ? "#10b981" : "#6840d6"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                      <strong>{SKILL_ICONS[item.skill] ?? "🗂️"} {item.kind.replace(/_/g, " ")}{item.transfer ? " · transfer ✓" : ""}</strong>
                      <small className="subtle">{new Date(item.occurredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}{item.score !== null ? ` · ${item.score}%` : ""}</small>
                    </div>
                    {item.prompt && <p className="subtle" style={{ marginTop: 6 }}>Task: {item.prompt}</p>}
                    {item.excerpt && <p style={{ marginTop: 8, lineHeight: 1.6 }}>“{item.excerpt}{(item.excerpt.length ?? 0) >= 280 ? "…" : ""}”</p>}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </main>
  );
}

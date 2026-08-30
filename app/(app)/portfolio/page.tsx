"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { IconCertificate, IconCheck } from "@/app/components/nav-icons";
import { track } from "@/app/lib/track";

interface Artifact { id: string; kind: string; skill: string; objective: string | null; prompt: string | null; excerpt: string | null; score: number | null; transfer: boolean; occurredAt: string }
interface PortfolioData {
  displayName: string;
  totals: { artifacts: number; transfers: number; scored: number; certificates: number };
  artifacts: Artifact[];
  certificates: Array<{ id: string; level: string; overallPercent: number; issuedAt: string }>;
}

/** Portfolio & Evidence — the learner's professional record (Part 28). */
export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track("portfolio_entered");
    let cancelled = false;
    fetch("/api/portfolio", { cache: "no-store" })
      .then(async (r) => {
        const p = await r.json();
        if (!r.ok) throw new Error(p.error ?? "Unable to load your portfolio.");
        if (!cancelled) setData(p as PortfolioData);
      })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load your portfolio."); });
    return () => { cancelled = true; };
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

  /** Milestones derived from real records only (Part 62) — never inflated. */
  const milestones = useMemo(() => {
    if (!data) return [] as Array<{ label: string; detail: string }>;
    const list: Array<{ label: string; detail: string }> = [];
    if (data.totals.scored > 0) list.push({ label: "First scored production", detail: "Your first piece of assessed English is in this portfolio." });
    if (data.totals.transfers > 0) list.push({ label: "First transfer challenge", detail: "You used a skill in an unfamiliar context — the truest test of learning." });
    if (data.totals.certificates > 0) list.push({ label: `CEFR certificate earned`, detail: "A verifiable record of your assessed level." });
    if (data.artifacts.length >= 10) list.push({ label: "Ten pieces of evidence", detail: "A growing professional record of your English." });
    return list;
  }, [data]);

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Your professional record"
        title="Portfolio & Evidence"
        purpose="The English you have actually produced — reports, certificates and real work, not a score in a game."
        action="Placement report"
        actionHref="/report"
      />

      {error ? (
        <div className="state-card error" role="alert">
          <strong>Your portfolio could not be loaded.</strong>
          <p style={{ margin: "6px 0 12px" }}>{error}</p>
          <button type="button" className="button" onClick={() => window.location.reload()}>Try again</button>
        </div>
      ) : !data ? (
        <div aria-busy="true" aria-label="Loading your portfolio">
          <div className="skeleton skeleton-title" />
          <div className="skeleton" style={{ height: 90, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 180, borderRadius: 18 }} />
        </div>
      ) : (
        <>
          <section className="stat-strip" aria-label="Portfolio totals">
            <div className="stat-tile"><strong>{data.totals.artifacts}</strong><span>Pieces of work</span></div>
            <div className="stat-tile"><strong>{data.totals.scored}</strong><span>Scored productions</span></div>
            <div className="stat-tile"><strong>{data.totals.transfers}</strong><span>Transfer challenges</span></div>
            <div className="stat-tile"><strong>{data.totals.certificates}</strong><span>Certificates</span></div>
          </section>

          {milestones.length > 0 ? (
            <section className="panel" aria-label="Milestones">
              <div className="panel-title"><h3>Milestones</h3><span>Every one is backed by a real record below</span></div>
              <ul className="insight-list">
                {milestones.map((m) => <li key={m.label}><IconCheck size={14} /> <span><strong>{m.label}</strong> — {m.detail}</span></li>)}
              </ul>
            </section>
          ) : null}

          {data.certificates.length > 0 ? (
            <section className="panel" aria-label="Verifiable certificates">
              <div className="panel-title"><h3>Certificates you can share</h3><span>Each carries a QR verification link</span></div>
              <div style={{ display: "grid", gap: 10 }}>
                {data.certificates.map((c) => (
                  <Link key={c.id} href={`/certificate/${c.id}`} className="review-item" style={{ textDecoration: "none" }}>
                    <span className="ach-icon" aria-hidden="true"><IconCertificate size={17} /></span>
                    <span className="mi-body">
                      <strong>CEFR {c.level}</strong>
                      <small>Issued {new Date(c.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</small>                    </span>
                    <span className="mi-meta">{c.overallPercent}% mastery · open →</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="panel" aria-label="Fluency Passport">
            <div className="panel-title"><h3>Fluency Passport</h3><span>Spoken-fluency evidence</span></div>
            <p className="subtle" style={{ margin: "0 0 12px", lineHeight: 1.6 }}>
              Fluency Track checkpoints build toward your shareable passport — verified level, skills and a checkable
              report reference in one credential.
            </p>
            <Link className="button secondary" href="/fluency-passport">Open your Fluency Passport</Link>
          </section>

          <div className="filters" role="group" aria-label="Filter your evidence by skill">
            <span className="f-label">Skill</span>
            {skills.map((s) => (
              <button key={s} type="button" className="f-chip" data-active={s === filter} onClick={() => setFilter(s)}>
                {s === "all" ? "Everything" : s}
              </button>
            ))}
          </div>

          {grouped.length === 0 ? (
            <section className="panel">
              <p className="empty" style={{ margin: 0 }}>
                This view is empty because no evidence matches the filter yet. Complete a writing task, a speaking session or a reading transfer — everything you produce is collected here automatically as proof of your progress.
              </p>
            </section>
          ) : (
            grouped.map((group) => (
              <section key={group.month} aria-label={group.month}>
                <p className="review-section-title">{group.month}</p>
                <div style={{ display: "grid", gap: 12 }}>
                  {group.items.map((item) => (
                    <article key={item.id} className="panel" style={{ margin: 0, padding: 18, borderLeft: `4px solid ${item.transfer ? "var(--success)" : "var(--accent-primary)"}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                        <strong style={{ textTransform: "capitalize" }}>{item.kind.replace(/_/g, " ")}{item.transfer ? " · transfer" : ""}</strong>
                        <small className="subtle">
                          {new Date(item.occurredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          {item.score !== null ? ` · ${item.score}%` : ""}
                        </small>
                      </div>
                      {item.prompt ? <p className="subtle" style={{ marginTop: 6 }}>Task: {item.prompt}</p> : null}
                      {item.excerpt ? <p style={{ marginTop: 8, lineHeight: 1.6 }}>“{item.excerpt}{(item.excerpt.length ?? 0) >= 280 ? "…" : ""}”</p> : null}
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </>
      )}
    </main>
  );
}

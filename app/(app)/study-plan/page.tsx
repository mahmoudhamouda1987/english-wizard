"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { productMeta } from "@/src/domain/product-catalogue";
import { PRODUCT_ICON_COMPONENTS } from "@/app/components/nav-config";
import type { CatalogueProduct } from "@/src/domain/entitlements";

interface DashLite {
  level: string; nextLevel: string; overallPercent: number;
  skills: Array<{ label: string; value: number }>;
  reviewDue: number; dailyMinutes: number; completedLessons: number;
}

/**
 * STUDY PLAN & READINESS (spec §26) — one central planning page that adapts
 * to the current path: a weekly plan, the priorities that matter for this
 * product, the next milestone, and an honest readiness statement.
 */
export default function StudyPlanPage() {
  const [activeProduct, setActiveProduct] = useState<CatalogueProduct | null>(null);
  const [data, setData] = useState<DashLite | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => { if (!cancelled && p?.profile?.activeProduct) setActiveProduct(p.profile.activeProduct as CatalogueProduct); })
      .catch(() => { /* default */ });
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && d?.level) setData(d as DashLite); })
      .catch(() => { /* skeletons stay */ });
    function onPathChanged(e: Event) {
      const detail = (e as CustomEvent<{ productId?: string }>).detail;
      if (detail?.productId) setActiveProduct(detail.productId as CatalogueProduct);
    }
    window.addEventListener("ew-path-changed", onPathChanged);
    return () => { cancelled = true; window.removeEventListener("ew-path-changed", onPathChanged); };
  }, []);

  const meta = productMeta(activeProduct ?? "general-english");
  const Icon = PRODUCT_ICON_COMPONENTS[meta?.icon ?? "globe"];

  const priorities = useMemo(() => {
    if (!data) return [] as Array<{ label: string; why: string; href: string }>;
    const weakest = [...(data.skills ?? [])].sort((a, b) => a.value - b.value).slice(0, 2);
    const base = weakest.map((s) => ({
      label: `${s.label} — lift to the next band`,
      why: `${s.value}% mastery makes it the current constraint on your ${data.nextLevel || "next level"} readiness.`,
      href: s.label.toLowerCase() === "reading" ? "/reading" : s.label.toLowerCase() === "listening" ? "/english-ear" : s.label.toLowerCase() === "writing" ? "/writing" : s.label.toLowerCase() === "speaking" ? "/pronunciation" : "/vocabulary",
    }));
    if (data.reviewDue > 0) base.push({ label: `Clear ${data.reviewDue} review item${data.reviewDue === 1 ? "" : "s"}`, why: "Spaced review keeps everything you have already earned.", href: "/review" });
    return base;
  }, [data]);

  const week = useMemo(() => {
    const minutes = data?.dailyMinutes ?? 20;
    return [
      { day: "Mon", focus: "Guided lesson", minutes },
      { day: "Tue", focus: "Skill studio", minutes: Math.round(minutes * 0.8) },
      { day: "Wed", focus: "Conversation practice", minutes: Math.round(minutes * 1.2) },
      { day: "Thu", focus: "Guided lesson", minutes },
      { day: "Fri", focus: "Checkpoint or mock", minutes: Math.round(minutes * 1.4) },
      { day: "Sat", focus: "Review & reading", minutes: Math.round(minutes * 0.8) },
      { day: "Sun", focus: "Rest or light review", minutes: Math.round(minutes * 0.5) },
    ];
  }, [data]);

  const readiness = data ? Math.min(99, Math.max(5, data.overallPercent)) : null;

  return (
    <main id="main-content" className="dash-main page-stack">
      <header className="lp-head">
        <span className="lp-eyebrow">Track</span>
        <h1>Study Plan &amp; Readiness</h1>
        <p className="subtle">One plan, shaped by your current path and your real mastery data.</p>
      </header>

      <section className="current-path-banner" aria-label="Current path context">
        <span className="lp-icon" style={{ background: meta?.gradient }} aria-hidden="true"><Icon size={20} /></span>
        <div>
          <div className="cpb-label">Current path</div>
          <div className="cpb-name">{meta?.name}</div>
          <div className="cpb-meta">{data ? `${data.level}${data.nextLevel ? ` · working towards ${data.nextLevel}` : ""}` : "Your plan follows your level"}</div>
        </div>
        <Link className="lp-cta primary" href={meta?.href ?? "/general-english"}>Path home</Link>
      </section>

      {!data ? (
        <div className="skeleton" style={{ height: 190, borderRadius: 18 }} />
      ) : (
        <>
          <div className="grid-two-wide">
            <section className="panel" aria-label="This week's plan">
              <div className="panel-title"><h3>This week · {week.reduce((s, d) => s + d.minutes, 0)} minutes</h3></div>
              <ol className="plan-timeline" style={{ listStyle: "none" }}>
                {week.map((d, i) => (
                  <li className="plan-step" key={d.day}>
                    <span className="ps-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <span className="ps-label">{d.day} — {d.focus}<small>Steady, realistic, cumulative.</small></span>
                    <span className="ps-time">{d.minutes} min</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="panel" aria-label="Priorities">
              <div className="panel-title"><h3>Your priorities right now</h3><Link href="/progress">Why these? </Link></div>
              {priorities.length === 0 ? (
                <p className="empty">Complete LevelCheck and your first lessons — priorities appear once there is mastery data to read.</p>
              ) : (
                <ul className="insight-list" style={{ display: "grid", gap: 10 }}>
                  {priorities.map((p) => (
                    <li key={p.label} style={{ display: "grid", gap: 3 }}>
                      <Link href={p.href} style={{ fontWeight: 800, fontSize: 14, textDecoration: "none" }}>{p.label} →</Link>
                      <span className="subtle" style={{ fontSize: 12.5 }}>{p.why}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="subtle" style={{ fontSize: 13, marginTop: 12 }}>
                Next milestone: <strong>{data.nextLevel || "your next checkpoint"}</strong> — currently {data.overallPercent}% of the way there.
              </p>
            </section>
          </div>

          <section className="panel" aria-label="Readiness">
            <div className="panel-title"><h3>Readiness on this path</h3></div>
            <div className="lp-progress" style={{ maxWidth: 460 }}>
              <div className="track" role="img" aria-label={`Readiness ${readiness}%`}><span style={{ width: `${readiness}%` }} /></div>
              <small style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>
                {readiness !== null && readiness < 40
                  ? "Building foundations — stay with the guided lessons before testing yourself."
                  : readiness !== null && readiness < 75
                    ? "On track — keep the weekly rhythm and take a checkpoint when it feels calm."
                    : "Strong — you are ready to test this level with a checkpoint or a mock."}
              </small>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <Link className="button secondary" href="/checkpoints">Take a checkpoint</Link>
              <Link className="button secondary" href="/pathways">Open Mock Exams</Link>
              <Link className="button secondary" href="/portfolio">View my evidence</Link>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

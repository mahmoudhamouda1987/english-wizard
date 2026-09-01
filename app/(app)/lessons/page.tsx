"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ALL_LESSONS } from "@/src/domain/all-lessons";
import { productMeta } from "@/src/domain/product-catalogue";
import { PRODUCT_ICON_COMPONENTS } from "@/app/components/nav-config";
import type { CatalogueProduct } from "@/src/domain/entitlements";
import type { CEFRLevel } from "@/src/domain/learner";

const LEVEL_ORDER: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

/**
 * LESSONS (spec §18) — lessons from the CURRENT PATH, never a mixed feed.
 * The corpus is CEFR-keyed, so the path shapes the framing and the range:
 * General English spans the whole ladder; the specialist paths focus on
 * their own level range around the learner's current level.
 */
const PRODUCT_RANGE: Record<CatalogueProduct, { min: number; max: number }> = {
  "general-english": { min: 0, max: 6 },
  "business-english": { min: 2, max: 5 },
  "fluency-track": { min: 3, max: 6 },
  "ielts": { min: 3, max: 6 },
  "cambridge": { min: 1, max: 6 },
};

export default function LessonsPage() {
  const [activeProduct, setActiveProduct] = useState<CatalogueProduct | null>(null);
  const [level, setLevel] = useState<string>("B1");
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (cancelled || !p?.profile) return;
        if (p.profile.activeProduct) setActiveProduct(p.profile.activeProduct as CatalogueProduct);
        if (p.profile.englishDna?.overallLevel && p.profile.englishDna.overallLevel !== "Not assessed") {
          setLevel(String(p.profile.englishDna.overallLevel));
        } else if (p.profile.targetLevel) {
          setLevel(String(p.profile.targetLevel));
        }
      })
      .catch(() => { /* default framing */ });
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        if (d.level) setLevel(String(d.level));
        if (d.currentLessonId) setCurrentLessonId(String(d.currentLessonId));
      })
      .catch(() => { /* defaults hold */ });
    function onPathChanged(e: Event) {
      const detail = (e as CustomEvent<{ productId?: string }>).detail;
      if (detail?.productId) setActiveProduct(detail.productId as CatalogueProduct);
    }
    window.addEventListener("ew-path-changed", onPathChanged);
    return () => { cancelled = true; window.removeEventListener("ew-path-changed", onPathChanged); };
  }, []);

  const meta = productMeta(activeProduct ?? "general-english");
  const range = PRODUCT_RANGE[activeProduct ?? "general-english"];
  const rawIdx = LEVEL_ORDER.indexOf(level as CEFRLevel);
  const levelIdx = rawIdx >= 0 ? rawIdx : 3;

  const lessons = useMemo(() => {
    return ALL_LESSONS.filter((l) => {
      const idx = LEVEL_ORDER.indexOf(l.level);
      if (idx < 0) return false;
      // Always include the learner's own level and the one below; cap by product range.
      return idx >= Math.max(range.min, levelIdx - 1) && idx <= Math.min(range.max, levelIdx + 1);
    }).sort((a, b) => a.sequence - b.sequence);
  }, [range, levelIdx]);

  const byLevel = useMemo(() => {
    const map = new Map<string, typeof lessons>();
    for (const l of lessons) {
      const list = map.get(l.level) ?? [];
      list.push(l);
      map.set(l.level, list);
    }
    return [...map.entries()];
  }, [lessons]);

  const current = currentLessonId ? ALL_LESSONS.find((l) => l.id === currentLessonId) ?? null : null;
  const Icon = PRODUCT_ICON_COMPONENTS[meta?.icon ?? "globe"];

  return (
    <main id="main-content" className="dash-main page-stack">
      <header className="lp-head">
        <span className="lp-eyebrow">Learn</span>
        <h1>Lessons</h1>
        <p className="subtle">Your lessons follow your current path — switch paths any time from the header.</p>
      </header>

      <section className="current-path-banner" aria-label="Current path context">
        <span className="lp-icon" style={{ background: meta?.gradient }} aria-hidden="true"><Icon size={20} /></span>
        <div>
          <div className="cpb-label">Current path</div>
          <div className="cpb-name">{meta?.name}</div>
          <div className="cpb-meta">{level} · lessons focused on your level and the step either side</div>
        </div>
        <Link className="lp-cta primary" href={meta?.href ?? "/general-english"}>Path home</Link>
      </section>

      {current && (
        <section className="nba-card" aria-label="Continue your lesson">
          <span className="nba-eyebrow">Pick up where you stopped</span>
          <h2>{current.title}</h2>
          <p>{current.mission}</p>
          <div className="nba-meta"><span>{current.level} · {current.skill}</span></div>
          <div className="nba-actions">
            <Link className="nba-btn" href={`/learn?lesson=${encodeURIComponent(current.id)}`}>Continue lesson</Link>
          </div>
        </section>
      )}

      {byLevel.length === 0 ? (
        <section className="locked-panel" aria-label="No lessons yet">
          <h2>Your lessons are being tailored</h2>
          <p>Complete LevelCheck so the right lessons for your level can line up here — it takes a few minutes and shapes everything else.</p>
          <Link className="lp-cta primary" href="/diagnostic">Open LevelCheck</Link>
        </section>
      ) : (
        byLevel.map(([lv, list]) => (
          <section key={lv} className="explore-section" aria-label={`${lv} lessons`}>
            <h2>{lv} <span className="subtle" style={{ fontSize: 13, fontWeight: 600 }}>· {list.length} lesson{list.length === 1 ? "" : "s"}</span></h2>
            <div style={{ display: "grid", gap: 8 }}>
              {list.map((l) => (
                <Link key={l.id} href={`/learn?lesson=${encodeURIComponent(l.id)}`} className="mission-row" style={{ textDecoration: "none" }}>
                  <span className="mi-num" aria-hidden="true">▶</span>
                  <span className="mi-body">
                    <strong>{l.title}</strong>
                    <small>{l.mission}</small>
                  </span>
                  <span className="mi-meta">{l.skill}</span>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}

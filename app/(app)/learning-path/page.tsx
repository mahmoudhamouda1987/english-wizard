"use client";
import { useEffect, useMemo, useState } from "react";
import { ALL_LESSONS } from "@/src/domain/all-lessons";
import { PageHero } from "@/app/components/page-hero";

const LEVEL_COLORS: Record<string, string> = { "Pre-A1": "#94a3b8", A1: "#38bdf8", A2: "#34d399", B1: "#fbbf24", B2: "#fb923c", C1: "#f87171", C2: "#a855f7" };
const LEVEL_RANK: Record<string, number> = { "Pre-A1": 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

export default function LearningPathPage() {
  const [done, setDone] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const ordered = useMemo(() => [...ALL_LESSONS].sort((a, b) => (LEVEL_RANK[a.level] ?? 9) - (LEVEL_RANK[b.level] ?? 9)), []);

  useEffect(() => {
    fetch("/api/learner-state", { cache: "no-store" }).then(async r => {
      const p = await r.json();
      if (!r.ok) throw new Error(p.error);
      setDone(p.state?.completedLessonIds ?? []);
      const rawCurrent = p.state?.currentLessonId ?? null;
      setCurrent(rawCurrent && ordered.some(l => l.id === rawCurrent) ? rawCurrent : null);
    }).catch(() => setError("Sign in and complete onboarding to see your path."));
    fetch("/api/admin/overview").then((r) => { if (r.ok) setIsAdmin(true); }).catch(() => {});
  }, []);

  const stats = useMemo(() => ({
    completed: ordered.filter(l => done.includes(l.id)).length,
    total: ordered.length,
    percent: Math.round((ordered.filter(l => done.includes(l.id)).length / Math.max(1, ordered.length)) * 100),
  }), [done]);

  return (
    <main id="main-content" style={{ maxWidth: 980, margin: "0 auto", padding: "48px 24px" }}>
      <PageHero icon="🧭" title="My journey" sub={isAdmin ? "Admin review mode active — all lessons unlocked for content inspection." : "Every lesson unlocks the next. Evidence, mastery and spaced review decide what comes after — never a fixed checklist."} />

      <section className="panel" style={{ padding: 22, marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <strong>{stats.completed} of {stats.total} lessons cleared</strong>
          <span className="streak-pill">{stats.percent}%</span>
        </div>
        <div className="track"><span style={{ width: `${stats.percent}%`, transition: "width .6s ease" }} /></div>
      </section>

      {error && <p role="alert">{error}</p>}

      <div className="journey">
        {ordered.map((l, i) => {
          const completed = done.includes(l.id);
          const isCurrent = l.id === current;
          const unlocked = isAdmin || isCurrent || completed || (!current && i === 0);
          const color = LEVEL_COLORS[l.level] ?? "#6840d6";
          return (
            <section key={l.id} className="panel" style={{ position: "relative", margin: "0 0 16px", padding: "18px 20px", opacity: unlocked ? 1 : 0.62, borderLeft: `4px solid ${color}` }}>
              <span aria-hidden="true" className={`j-node ${completed ? "done" : isCurrent ? "current" : ""}`}>
                {completed ? "✓" : isCurrent ? "▶" : i + 1}
              </span>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <span className="eyebrow">{i + 1} · <span style={{ color }}>{l.level}</span> · {l.skill}</span>
                  <h2 style={{ fontSize: 19, margin: "4px 0" }}>{unlocked ? l.title : "🔒 Locked lesson"}</h2>
                  <p className="subtle" style={{ margin: 0 }}>{unlocked ? l.mission : "Clear earlier lessons to reveal this mission."}</p>
                </div>
                <span className={isCurrent ? "button" : completed ? "streak-pill" : "streak-pill"} style={{ alignSelf: "center" }}>
                  {completed ? "✓ Cleared" : isCurrent ? "▶ Continue now" : unlocked ? "Available" : "Locked"}
                </span>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

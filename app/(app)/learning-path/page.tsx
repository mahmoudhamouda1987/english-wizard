"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ALL_LESSONS } from "@/src/domain/all-lessons";
import { PROFESSIONAL_CURRICULUM } from "@/src/domain/professional-curriculum";
import { PageHeader } from "@/app/components/page-header";
import { CurrentPathBanner } from "@/app/components/current-path-banner";
import { track } from "@/app/lib/track";

const LEVEL_RANK: Record<string, number> = { "Pre-A1": 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

/** Level purpose blocks (Part 29 / Part 86 — every level explains why it exists). */
const LEVEL_PURPOSE: Record<string, { goal: string; topics: string; skills: string }> = {
  "Pre-A1": {
    goal: "Survival foundations — take the first steps with the alphabet, numbers and the words that make a first day work.",
    topics: "Identity, family, objects, numbers, food, home, routine, basic needs",
    skills: "Reading · Writing · Listening",
  },
  A1: {
    goal: "Survival communication — introduce yourself, manage simple exchanges and handle first real situations.",
    topics: "Introductions, daily life, shopping, food, directions, travel basics, work and study basics",
    skills: "Reading · Writing · Listening",
  },
  A2: {
    goal: "Independent everyday communication — manage daily life, travel, problems and plans on your own.",
    topics: "Experiences, plans, problems, services, health, travel, social life",
    skills: "Reading · Writing · Listening",
  },
  B1: {
    goal: "Independent communication — hold your own in discussion, work and stories across all four skills.",
    topics: "Discussion, opinions, work, stories, problem solving, social communication",
    skills: "Reading · Writing · Listening · Speaking",
  },
  B2: {
    goal: "Confident complex communication — argue, persuade and operate professionally with precision.",
    topics: "Argument, professional English, media, society, academic communication, persuasion",
    skills: "Reading · Writing · Listening · Speaking",
  },
  C1: {
    goal: "Advanced precision and fluency — handle abstract issues, leadership and complex discourse with nuance.",
    topics: "Abstract issues, professional leadership, academic discourse, rhetoric, complex argument",
    skills: "Reading · Writing · Listening · Speaking",
  },
  C2: {
    goal: "Near-complete flexibility — command subtle meaning, register and rhetoric in any professional or academic setting.",
    topics: "Subtle meaning, register, synthesis, rhetoric, complex discourse",
    skills: "Reading · Writing · Listening · Speaking",
  },
};

type Tab = "general" | "professional";

export default function LearningPathPage() {
  const [done, setDone] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("general");
  const [loaded, setLoaded] = useState(false);

  const generalOrdered = useMemo(() => [...ALL_LESSONS].sort((a, b) => (LEVEL_RANK[a.level] ?? 9) - (LEVEL_RANK[b.level] ?? 9)), []);
  const professionalOrdered = useMemo(() => [...PROFESSIONAL_CURRICULUM].sort((a, b) => a.sequence - b.sequence), []);
  const ordered = tab === "general" ? generalOrdered : professionalOrdered;

  useEffect(() => {
    track("journey_entered");
    let cancelled = false;
    fetch("/api/learner-state", { cache: "no-store" })
      .then(async (r) => {
        const p = await r.json();
        if (!r.ok) throw new Error(p.error);
        if (cancelled) return;
        setDone(p.state?.completedLessonIds ?? []);
        const rawCurrent = p.state?.currentLessonId ?? null;
        setCurrent(rawCurrent && generalOrdered.some((l) => l.id === rawCurrent) ? rawCurrent : null);
        setLoaded(true);
      })
      .catch(() => { if (!cancelled) { setError("Sign in to see your personal journey."); setLoaded(true); } });
    fetch("/api/admin/overview").then((r) => { if (r.ok && !cancelled) setIsAdmin(true); }).catch(() => {});
    // Current-path adaptation: a learner on Business English lands on their
    // own curriculum tab; everyone else starts on the general ladder.
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => { if (!cancelled && p?.profile?.activeProduct === "business-english") setTab("professional"); })
      .catch(() => { /* general tab stays */ });
    return () => { cancelled = true; };
  }, [generalOrdered]);

  const grouped = useMemo(() => {
    const groups: Array<{ level: string; lessons: typeof ordered }> = [];
    for (const lesson of ordered) {
      const level = lesson.level;
      const existing = groups.find((g) => g.level === level);
      if (existing) existing.lessons.push(lesson);
      else groups.push({ level, lessons: [lesson] });
    }
    return groups;
  }, [ordered]);

  const stats = useMemo(() => ({
    completed: ordered.filter((l) => done.includes(l.id)).length,
    total: ordered.length,
    percent: Math.round((ordered.filter((l) => done.includes(l.id)).length / Math.max(1, ordered.length)) * 100),
  }), [done, ordered]);

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Your learning path"
        title="My Journey"
        purpose={isAdmin
          ? "Admin review mode — all lessons unlocked for content inspection."
          : "Every lesson unlocks the next. Evidence, mastery and spaced review decide what comes after — never a fixed checklist."}
        action="Worlds & missions"
        actionHref="/worlds"
      />

      <CurrentPathBanner />

      <div className="filters" role="group" aria-label="Choose programme">
        <button type="button" className="f-chip" data-active={tab === "general"} onClick={() => setTab("general")}>
          General English ({generalOrdered.length})
        </button>
        <button type="button" className="f-chip" data-active={tab === "professional"} onClick={() => setTab("professional")}>
          Business English ({professionalOrdered.length})
        </button>
      </div>

      <section className="panel" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, gap: 12, flexWrap: "wrap" }}>
          <strong>{stats.completed} of {stats.total} lessons completed</strong>
          <span className="streak-pill">{stats.percent}% of this programme</span>
        </div>
        <div className="track" aria-label={`Programme progress ${stats.percent}%`}><span style={{ width: `${stats.percent}%` }} /></div>
      </section>

      {error && <p className="state-card info" role="alert" style={{ marginBottom: 18 }}>{error}</p>}
      {!loaded && !error && (
        <div aria-busy="true" aria-label="Loading your journey">
          <div className="skeleton skeleton-title" />
          {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 14, marginBottom: 10 }} />)}
        </div>
      )}

      <div style={{ display: "grid", gap: 26 }}>
        {grouped.map((group) => {
          const purpose = LEVEL_PURPOSE[group.level];
          const levelDone = group.lessons.filter((l) => done.includes(l.id)).length;
          return (
            <section key={group.level} aria-label={`Level ${group.level}`}>
              <div className="panel" style={{ padding: "20px 22px", marginBottom: 12, background: "linear-gradient(135deg, var(--surface-card), var(--accent-softer))" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontFamily: "var(--font-display)" }}>{group.level}</h2>
                  <span className="pill">{levelDone}/{group.lessons.length} complete</span>
                </div>
                {purpose ? (
                  <>
                    <p style={{ margin: "8px 0 10px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{purpose.goal}</p>
                    <div style={{ display: "grid", gap: 4, fontSize: 13, color: "var(--text-tertiary)" }}>
                      <span><strong style={{ color: "var(--text-secondary)" }}>Topics:</strong> {purpose.topics}</span>
                      <span><strong style={{ color: "var(--text-secondary)" }}>Skills:</strong> {purpose.skills}</span>
                    </div>
                  </>
                ) : null}
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {group.lessons.map((l) => {
                  const completed = done.includes(l.id);
                  const isCurrent = tab === "general" && l.id === current;
                  const unlocked = isAdmin || isCurrent || completed || (tab === "general" && !current && ordered.indexOf(l) === 0);
                  const category = "category" in l ? (l as { category: string }).category : l.skill;
                  const body = (
                    <section
                      className="mission-row"
                      style={{ opacity: unlocked ? 1 : 0.6, cursor: unlocked ? "pointer" : "default", padding: "16px 18px" }}
                    >
                      <span className={`mi-num ${completed ? "done" : ""}`} aria-hidden="true">{completed ? "✓" : isCurrent ? "▶" : ""}</span>
                      <span className="mi-body">
                        <strong>{l.title}</strong>
                        <small>{unlocked ? l.mission : "Complete earlier lessons to unlock this mission."}</small>
                      </span>
                      <span className="mi-meta">
                        {l.level} · {category}
                        {isCurrent ? <span className="button" style={{ display: "inline-flex", marginLeft: 10, fontSize: 12.5, padding: "7px 12px" }}>Continue</span> : null}
                      </span>
                    </section>
                  );
                  return unlocked ? (
                    <Link key={l.id} href={`/learn/${l.id}`} aria-label={`Open lesson: ${l.title}`}>{body}</Link>
                  ) : (
                    <div key={l.id}>{body}</div>
                  );
                })}
              </div>

              <p className="empty" style={{ margin: "10px 4px 0", fontSize: 12.5 }}>
                Checkpoint: complete the {group.level} units to unlock the {group.level} checkpoint and the next level.
              </p>
            </section>
          );
        })}
      </div>
    </main>
  );
}
